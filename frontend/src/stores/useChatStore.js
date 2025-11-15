import { create } from "zustand"
import toast from "react-hot-toast"
import { axiosInstance } from "@lib/axios"
import { useAuthStore } from "./useAuthStore"


export const useChatStore = create((set, get) => ({
    users: [],
    messagesByUser: {},
    selectedUser: null,
    isUsersLoading: false,
    isMessagesLoading: false,
    isOpen: false,

    setIsOpen: (value) => {
        set({ isOpen: !value})
    },

    getUsers: async () => {
        set({ isUsersLoading: true })
        try {
            const res = await axiosInstance.get("/messages/users")
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

    sendMessage: async (messageData) => {
        const { selectedUser } = get()
        try {
            const res = await axiosInstance.post(`/messages/send/${selectedUser._id}`, messageData)
            
            // Optimisation : mise à jour immédiate pour une meilleure UX
            set(state => {
                const currentMessages = state.messagesByUser[selectedUser._id] || []
                return {
                    messagesByUser: {
                        ...state.messagesByUser,
                        [selectedUser._id]: [...currentMessages, res.data]
                    }
                }
            })
        } catch (error) {
            toast.error(error.response.data.message)
        }
    },

    markMessagesAsRead: async (senderId) => {
        try {
            const res = await axiosInstance.patch(`/messages/read/${senderId}`);
            
            // set(state => {
            //     const updatedMessagesByUser = { ...state.messagesByUser };
            //     const userMessages = updatedMessagesByUser[senderId] || [];
                
            //     const updatedMessages = userMessages.map(msg => ({
            //         ...msg,
            //         read: true,
            //         readAt: new Date()
            //     }));
                
            //     updatedMessagesByUser[senderId] = updatedMessages;
                
            //     return { messagesByUser: updatedMessagesByUser };
            // });
            
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
            if(newMessage.senderId !== selectedUser._id) return
            if (!selectedUser || selectedUser._id === newMessage.senderId) {
                get().markMessagesAsRead(selectedUser._id)
            }  
            set(state => ({
                messagesByUser: {
                    ...state.messagesByUser,
                    [newMessage.senderId]: [
                        ...(state.messagesByUser[newMessage.senderId] || []),
                        newMessage
                    ]
                }
            }));
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