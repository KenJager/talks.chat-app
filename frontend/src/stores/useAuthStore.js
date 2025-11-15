import { create } from "zustand"
import axiosInstance from "@lib/axios"
import { toast } from "react-hot-toast"
import { io } from "socket.io-client"

const BASE_URL = import.meta.env.MODE === "development"
    ? "http://localhost:5001"
    : import.meta.env.VITE_API_URL

export const useAuthStore = create((set, get) => ({
    authUser: null,
    isSignup: false,
    isLoggin: false,
    isUpdatingProfile: false,
    isCheckingAuth: true,
    onlineUsers: [],
    socket: null,
    tempAuthData: null, // Pour stocker les données temporaires de 2FA

    checkAuth: async () => {
        try {
            const res = await axiosInstance.get("/auth/check")
            set({ authUser: res.data })
            get().connectSocket()
        } catch (error) {
            console.log("Error during checkAuth operation:", error)
            set({ authUser: null })
        } finally {
            set({ isCheckingAuth: false })
        }
    },

    signup: async (data) => {
        set({ isSignup: true })
        try {
            const res = await axiosInstance.post("/auth/signup", data)

            if (res.data.requires2FA) {
                // Retourner les données pour la redirection
                return {
                    requires2FA: true,
                    tempUserId: res.data.tempUserId,
                    email: res.data.email
                }
            } else {
                set({ authUser: res.data })
                toast.success("Account created successfully")
                get().connectSocket()
                return res.data
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Signup failed")
            throw error
        } finally {
            set({ isSignup: false })
        }
    },

    login: async (data) => {
        set({ isLoggin: true })
        try {
            const res = await axiosInstance.post("/auth/login", data)
            set({ authUser: res.data })
            toast.success("Login successful")
            get().connectSocket()
            return res.data
        } catch (error) {
            toast.error(error.response?.data?.message || "Login failed")
            throw error
        } finally {
            set({ isLoggin: false })
        }
    },

    verify2FA: async (verificationData) => {
        try {
            const { type, tempUserId, code } = verificationData

            let res
            if (type === 'signup') {
                res = await axiosInstance.post('/auth/verify-signup-2fa', {
                    tempUserId,
                    code
                })
            } else {
                res = await axiosInstance.post('/auth/verify-2fa', {
                    tempUserId,
                    code
                })
            }

            set({
                authUser: res.data,
                tempAuthData: null
            })

            const successMessage = type === 'signup'
                ? "Account created successfully!"
                : "Login successful!"

            toast.success(successMessage)
            get().connectSocket()

            return res.data

        } catch (error) {
            toast.error(error.response?.data?.message || "Verification failed")
            throw error
        }
    },

    resend2FACode: async (data) => {
        try {
            const { type, tempUserId } = data

            let res
            if (type === 'signup') {
                res = await axiosInstance.post('/auth/resend-signup-code', {
                    tempUserId
                })
            } else {
                res = await axiosInstance.post('/auth/resend-2fa-code', {
                    tempUserId
                })
            }

            toast.success("New verification code sent to your email")
            return res.data

        } catch (error) {
            toast.error(error.response?.data?.message || "Error sending code")
            throw error
        }
    },

    forgotPassword: async (data) => {
        try {
            const res = await axiosInstance.post('/auth/forgot-password', data)
            return res.data
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error sending reset email')
            throw error
        }
    },

    resetPassword: async (data) => {
        try {
            const res = await axiosInstance.post('/auth/reset-password', data)
            return res.data
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error resetting password')
            throw error
        }
    },

    validateResetToken: async (token) => {
        try {
            const res = await axiosInstance.get(`/auth/validate-reset-token/${token}`)
            return res.data
        } catch (error) {
            toast.error(error.response?.data?.message || 'Invalid reset token')
            throw error
        }
    },

    logout: async () => {
        try {
            const { socket, authUser } = get()

            // Émettre l'événement de déconnexion avant de fermer le socket
            if (socket && authUser) {
                socket.emit("user_logout")
                // Attendre un peu pour que l'événement soit envoyé
                await new Promise(resolve => setTimeout(resolve, 100))
            }

            // Appeler l'API logout
            await axiosInstance.post("/auth/logout")

            // Mettre à jour l'état local
            set({
                authUser: null,
                onlineUsers: [],
                socket: null
            })

            toast.success("Logged out successfully")

        } catch (error) {
            console.error("Logout error:", error)
            toast.error(error.response?.data?.message || "Logout failed")
        }
    },

    updateProfile: async (data) => {
        set({ isUpdatingProfile: true })
        try {
            const res = await axiosInstance.put("/auth/update-profile", data)
            set({ authUser: res.data })
            toast.success("Profile updated successfully")
        } catch (error) {
            toast.error(error.response?.data?.message || "Update failed")
            console.log("Error while updating profile", error)
        } finally {
            set({ isUpdatingProfile: false })
        }
    },

    connectSocket: () => {
        const { authUser, socket } = get()
        if (!authUser || socket?.connected) return

        try {
            const newSocket = io(BASE_URL, {
                query: {
                    userId: authUser._id,
                },
            })

            newSocket.on("connect", () => {
                console.log("Socket connected successfully")
            })

            newSocket.on("getOnlineUsers", (userIds) => {
                set({ onlineUsers: userIds })
            })

            newSocket.on("disconnect", (reason) => {
                console.log("Socket disconnected:", reason)
            })

            newSocket.on("connect_error", (error) => {
                console.error("Socket connection error:", error)
            })

            set({ socket: newSocket })

        } catch (error) {
            console.error("Error connecting socket:", error)
        }
    },

    disconnectSocket: () => {
        const { socket } = get()
        if (socket) {
            socket.disconnect()
            set({ socket: null, onlineUsers: [] })
        }
    },
}))
