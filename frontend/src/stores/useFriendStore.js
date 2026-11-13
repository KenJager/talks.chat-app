import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";

export const useFriendStore = create((set, get) => ({
    friends: [],
    friendRequests: [],
    sentRequests: [],
    isLoading: false,

    // Obtenir la liste des amis
    getFriends: async () => {
        try {
            set({ isLoading: true });
            const res = await axiosInstance.get("/friends");
            set({ friends: res.data });
        } catch (error) {
            toast.error(error.response?.data?.message || "Error fetching friends");
        } finally {
            set({ isLoading: false });
        }
    },

    // Obtenir les demandes d'amis reçues
    getReceivedRequests: async () => {
        try {
            const res = await axiosInstance.get("/friends/requests/received");
            set({ friendRequests: res.data });
        } catch (error) {
            toast.error(error.response?.data?.message || "Error fetching friend requests");
        }
    },

    // Obtenir les demandes d'amis envoyées
    getSentRequests: async () => {
        try {
            const res = await axiosInstance.get("/friends/requests/sent");
            set({ sentRequests: res.data });
        } catch (error) {
            toast.error(error.response?.data?.message || "Error fetching sent requests");
        }
    },

    // Envoyer une demande d'ami
    sendFriendRequest: async (receiverId) => {
        try {
            const res = await axiosInstance.post("/friends/request", { receiverId });
            toast.success("Friend request sent!");
            // Ajouter à la liste des demandes envoyées
            const sentRequests = get().sentRequests;
            set({ sentRequests: [...sentRequests, res.data.friendRequest] });
        } catch (error) {
            toast.error(error.response?.data?.message || "Error sending friend request");
        }
    },

    // Accepter une demande d'ami
    acceptFriendRequest: async (requestId) => {
        try {
            await axiosInstance.post(`/friends/request/${requestId}/accept`);
            toast.success("Friend request accepted!");

            // Mettre à jour les listes
            const friendRequests = get().friendRequests.filter(req => req._id !== requestId);
            set({ friendRequests });

            // Recharger la liste des amis
            get().getFriends();

            // Recharger la liste des utilisateurs dans le chat (pour mettre à jour UsersContainer)
            const { useChatStore } = await import("./useChatStore");
            useChatStore.getState().getUsers();
        } catch (error) {
            toast.error(error.response?.data?.message || "Error accepting friend request");
        }
    },

    // Refuser une demande d'ami
    declineFriendRequest: async (requestId) => {
        try {
            await axiosInstance.post(`/friends/request/${requestId}/decline`);
            toast.success("Friend request declined!");

            // Retirer de la liste des demandes
            const friendRequests = get().friendRequests.filter(req => req._id !== requestId);
            set({ friendRequests });
        } catch (error) {
            toast.error(error.response?.data?.message || "Error declining friend request");
        }
    },

    // Supprimer un ami
    removeFriend: async (friendId) => {
        try {
            await axiosInstance.delete(`/friends/${friendId}`);
            toast.success("Friend removed!");

            // Retirer de la liste des amis
            const friends = get().friends.filter(friend => friend._id !== friendId);
            set({ friends });
        } catch (error) {
            toast.error(error.response?.data?.message || "Error removing friend");
        }
    },

    // Vérifier si un utilisateur est ami
    isFriend: (userId) => {
        return get().friends.some(friend => friend._id === userId);
    },

    // Vérifier si une demande a été envoyée
    hasSentRequest: (userId) => {
        return get().sentRequests.some(request => request.receiverId._id === userId);
    },

    // Vérifier si une demande a été reçue
    hasReceivedRequest: (userId) => {
        return get().friendRequests.some(request => request.senderId._id === userId);
    },

    // S'abonner aux événements de demandes d'amis en temps réel
    subscribeFriendRequestEvents: () => {
        const socket = useAuthStore.getState().socket;
        
        if (!socket) {
            console.warn("Socket not available for friend request events");
            return () => {};
        }

        // Nettoyer les écouteurs existants pour éviter les doublons
        socket.off("newFriendRequest");
        socket.off("friendRequestAccepted");
        socket.off("friendRequestDeclined");

        // Écouter les nouvelles demandes d'amis reçues
        socket.on("newFriendRequest", (newRequest) => {
            console.log("Received new friend request:", newRequest);
            set(state => ({
                friendRequests: [newRequest, ...state.friendRequests]
            }));
            toast.success(`${newRequest.senderId.fullName} sent you a friend request!`);
        });

        // Écouter l'acceptation d'une demande d'ami envoyée
        socket.on("friendRequestAccepted", (data) => {
            console.log("Friend request accepted:", data);
            // Retirer de la liste des demandes envoyées
            set(state => ({
                sentRequests: state.sentRequests.filter(req => req._id !== data.requestId)
            }));
            toast.success("Your friend request was accepted!");
            // Recharger la liste des amis
            get().getFriends();
        });

        // Écouter le refus d'une demande d'ami envoyée
        socket.on("friendRequestDeclined", (data) => {
            console.log("Friend request declined:", data);
            // Retirer de la liste des demandes envoyées
            set(state => ({
                sentRequests: state.sentRequests.filter(req => req._id !== data.requestId)
            }));
            toast.error("Your friend request was declined");
        });

        // Retourner une fonction de nettoyage
        return () => {
            socket.off("newFriendRequest");
            socket.off("friendRequestAccepted");
            socket.off("friendRequestDeclined");
        };
    }
}));