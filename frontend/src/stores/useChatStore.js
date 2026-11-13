import { create } from "zustand"
import toast from "react-hot-toast"
import { axiosInstance } from "@lib/axios"
import { useAuthStore } from "./useAuthStore"


export const useChatStore = create((set, get) => ({
    users: [],
    tempMessagesByUser: {},
    messagesByUser: {},
    selectedUser: null,
    isUsersLoading: false,
    isMessagesLoading: false,
    isOpen: false,

    setIsOpen: (value) => {
        set({ isOpen: !value })
    },
    
    getUsers: async () => {
        set({ isUsersLoading: true })
        try {
            const res = await axiosInstance.get("/friends")
            set({ users: res.data })
        } catch (error) {
            toast.error(error.response.data.message)
        } finally {
            set({ isUsersLoading: false })
        }
    },

    getMessages: async (userId) => {
        set({ isMessagesLoading: true })
        try {
            const res = await axiosInstance.get(`/messages/${userId}`)
            set(state => ({
                messagesByUser: {
                    ...state.messagesByUser,
                    [userId]: res.data // Stocke les messages par userId
                }
            }))
        } catch (error) {
            toast.error(error.response.data.message)
        } finally {
            set({ isMessagesLoading: false })
        }
    },

    addTempMessage: (userId, message) => {
        const tempId = `temp-${Date.now()}-${Math.random()}-${userId}`; // Inclure userId pour plus d'unicité
        const tempMessage = {
            ...message,
            _id: tempId,
            createdAt: new Date().toISOString(),
            isTemp: true,
            isOptimistic: true, // Marqueur explicite
        };

        set((state) => {
            const currentMessages = state.messagesByUser[userId] || [];

            return {
                messagesByUser: {
                    ...state.messagesByUser,
                    [userId]: [...currentMessages, tempMessage],
                },
                // Ne PAS stocker dans tempMessagesByUser séparément
            };
        });

        return tempId;
    },

    // Remplacer un message temporaire par le vrai message
    replaceTempMessage: (userId, tempId, realMessage) => {
        set((state) => {
            const userMessages = [...(state.messagesByUser[userId] || [])];
            const tempIndex = userMessages.findIndex(m => m._id === tempId);

            if (tempIndex !== -1) {
                // Remplacer le message temporaire par le vrai
                userMessages[tempIndex] = {
                    ...realMessage,
                    isTemp: false,
                    isOptimistic: false
                };
            }

            return {
                messagesByUser: {
                    ...state.messagesByUser,
                    [userId]: userMessages,
                },
            };
        });
    },

    // En cas d'erreur, supprimer le message temporaire
    removeTempMessage: (userId, tempId) => {
        set((state) => ({
            messagesByUser: {
                ...state.messagesByUser,
                [userId]: (state.messagesByUser[userId] || [])
                    .filter(m => m._id !== tempId),
            },
        }));
    },

    // Modifiez votre méthode sendMessage existante
    sendMessage: async (messageData) => {
        const { selectedUser, addTempMessage, replaceTempMessage, removeTempMessage, getMessages } = get();

        if (!selectedUser) return null;

        // Créer un message temporaire UNIQUEMENT pour l'expéditeur
        const tempId = addTempMessage(selectedUser._id, {
            text: messageData.text,
            image: messageData.image,
            senderId: useAuthStore.getState().authUser?._id,
            receiverId: selectedUser._id,
            read: false,
        });

        try {
            // Appel API réel
            const response = await axiosInstance.post(`/messages/send/${selectedUser._id}`, messageData);
            const realMessage = response.data;

            // Remplacer le message temporaire par le vrai
            replaceTempMessage(selectedUser._id, tempId, realMessage);

            // Optionnel : re-fetch les messages pour être sûr d'avoir le dernier état
            await getMessages(selectedUser._id);

            return realMessage;
        } catch (error) {
            // En cas d'erreur, supprimer le message temporaire
            removeTempMessage(selectedUser._id, tempId);
            console.error("Failed to send message:", error);
            throw error;
        }
    },

    markMessagesAsRead: async (senderId) => {
        try {
            const res = await axiosInstance.patch(`/messages/read/${senderId}`);
            return res.data;
        } catch (error) {
            toast.error(error.response?.data?.message || "Erreur lors de la confirmation de lecture");
        }
    },

    subscribeToChatEvents: () => {
        const socket = useAuthStore.getState().socket;
        if (!socket) {
            console.warn("Socket non disponible");
            return;
        }

        // Nettoyer les écouteurs existants pour éviter les doublons
        socket.off("newMessage");
        socket.off("messagesRead");

        // Écouter les nouveaux messages
        socket.on("newMessage", (newMessage) => {
            const { selectedUser } = get()

            // Ajouter le message à la conversation correspondante
            set(state => {
                const userId = newMessage.senderId === useAuthStore.getState().authUser._id
                    ? newMessage.receiverId
                    : newMessage.senderId;

                return {
                    messagesByUser: {
                        ...state.messagesByUser,
                        [userId]: [
                            ...(state.messagesByUser[userId] || []),
                            newMessage
                        ]
                    }
                };
            });

            // Marquer les messages comme lus si on est dans la conversation ET que c'est un message reçu
            if (selectedUser && newMessage.receiverId === useAuthStore.getState().authUser._id && newMessage.senderId === selectedUser._id) {
                get().markMessagesAsRead(newMessage.senderId)
            }
        });

        // Écouter les confirmations de lecture
        socket.on("messagesRead", (data) => {
            set(state => {
                const updatedMessagesByUser = { ...state.messagesByUser };
                const userMessages = updatedMessagesByUser[data.readerId] || [];

                const updatedMessages = userMessages.map(msg => ({
                    ...msg,
                    read: true,
                    readAt: new Date()
                }));

                updatedMessagesByUser[data.readerId] = updatedMessages;

                return { messagesByUser: updatedMessagesByUser };
            });
        });

        // Retourner une fonction de nettoyage (optionnel)
        return () => {
            socket.off("newMessage");
            socket.off("messagesRead");
        };
    },

    setSelectedUser: (selectedUser) => set({ selectedUser }),
}))