import { create } from "zustand"
import axiosInstance from "@lib/axios"
import { toast } from "react-hot-toast"
import { io } from "socket.io-client"

// ============================================================
// URLs
// ============================================================
const BASE_URL = import.meta.env.MODE === "development"
    ? "http://localhost:5001"
    : import.meta.env.VITE_API_URL

// En production, on prend l'origine (scheme + host + port) sans le path
// pour éviter les erreurs si VITE_API_URL contient "/api" ou "/api/v1".
const SOCKET_URL = import.meta.env.MODE === "development"
    ? "http://localhost:5001"
    : (() => {
        try {
            return new URL(import.meta.env.VITE_API_URL).origin
        } catch {
            // Fallback si VITE_API_URL est malformé
            return import.meta.env.VITE_API_URL?.replace(/\/api.*$/, "") || ""
        }
    })()

export const useAuthStore = create((set, get) => ({
    // --------------------------------------------------------
    // State
    // --------------------------------------------------------
    authUser: null,
    isSignup: false,
    isLoggin: false,
    isUpdatingProfile: false,
    isCheckingAuth: true,
    onlineUsers: [],
    typingUsers: {},       // { [senderId]: boolean }
    socket: null,
    tempAuthData: null,    // Données temporaires 2FA
    _connectingSocket: false, // Verrou anti-race-condition

    // --------------------------------------------------------
    // checkAuth
    // --------------------------------------------------------
    checkAuth: async () => {
        try {
            const res = await axiosInstance.get("/auth/check")
            set({ authUser: res.data })
            get().connectSocket()
        } catch (error) {
            console.log("Error during checkAuth operation:", error)
            // Nettoyer un éventuel socket orphelin si l'utilisateur n'est plus authentifié
            get().disconnectSocket()
            set({ authUser: null })
        } finally {
            set({ isCheckingAuth: false })
        }
    },

    // --------------------------------------------------------
    // signup
    // --------------------------------------------------------
    signup: async (data) => {
        set({ isSignup: true })
        try {
            const res = await axiosInstance.post("/auth/signup", data)

            if (res.data.requires2FA) {
                return {
                    requires2FA: true,
                    tempUserId: res.data.tempUserId,
                    email: res.data.email,
                }
            }

            set({ authUser: res.data })
            toast.success("Account created successfully")
            get().connectSocket()
            return res.data
        } catch (error) {
            toast.error(error.response?.data?.message || "Signup failed")
            throw error
        } finally {
            set({ isSignup: false })
        }
    },

    // --------------------------------------------------------
    // login
    // --------------------------------------------------------
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

    // --------------------------------------------------------
    // verify2FA
    // --------------------------------------------------------
    verify2FA: async (verificationData) => {
        try {
            const { type, tempUserId, code } = verificationData

            let res
            if (type === "signup") {
                res = await axiosInstance.post("/auth/verify-signup-2fa", {
                    tempUserId,
                    code,
                })
            } else {
                res = await axiosInstance.post("/auth/verify-2fa", {
                    tempUserId,
                    code,
                })
            }

            set({
                authUser: res.data,
                tempAuthData: null,
            })

            const successMessage = type === "signup"
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

    // --------------------------------------------------------
    // resend2FACode
    // --------------------------------------------------------
    resend2FACode: async (data) => {
        try {
            const { type, tempUserId } = data

            let res
            if (type === "signup") {
                res = await axiosInstance.post("/auth/resend-signup-code", {
                    tempUserId,
                })
            } else {
                res = await axiosInstance.post("/auth/resend-2fa-code", {
                    tempUserId,
                })
            }

            toast.success("New verification code sent to your email")
            return res.data
        } catch (error) {
            toast.error(error.response?.data?.message || "Error sending code")
            throw error
        }
    },

    // --------------------------------------------------------
    // forgotPassword
    // --------------------------------------------------------
    forgotPassword: async (data) => {
        try {
            const res = await axiosInstance.post("/auth/forgot-password", data)
            return res.data
        } catch (error) {
            toast.error(error.response?.data?.message || "Error sending reset email")
            throw error
        }
    },

    // --------------------------------------------------------
    // resetPassword
    // --------------------------------------------------------
    resetPassword: async (data) => {
        try {
            const res = await axiosInstance.post("/auth/reset-password", data)
            return res.data
        } catch (error) {
            toast.error(error.response?.data?.message || "Error resetting password")
            throw error
        }
    },

    // --------------------------------------------------------
    // validateResetToken
    // --------------------------------------------------------
    validateResetToken: async (token) => {
        try {
            const res = await axiosInstance.get(`/auth/validate-reset-token/${token}`)
            return res.data
        } catch (error) {
            toast.error(error.response?.data?.message || "Invalid reset token")
            throw error
        }
    },

    // --------------------------------------------------------
    // logout
    // --------------------------------------------------------
    logout: async () => {
        try {
            const { socket, authUser } = get()

            // Émettre l'événement de déconnexion avant de fermer le socket
            if (socket && authUser) {
                socket.emit("user_logout")
                // Laisser le temps à l'événement de partir
                await new Promise((resolve) => setTimeout(resolve, 100))
                // Fermer proprement le socket pour éviter les sockets fantômes
                socket.disconnect()
            }

            // Appeler l'API logout
            await axiosInstance.post("/auth/logout")

            // Réinitialiser l'état
            set({
                authUser: null,
                onlineUsers: [],
                typingUsers: {},
                socket: null,
                tempAuthData: null,
            })

            toast.success("Logged out successfully")
        } catch (error) {
            console.error("Logout error:", error)
            toast.error(error.response?.data?.message || "Logout failed")
        }
    },

    // --------------------------------------------------------
    // updateProfile
    // --------------------------------------------------------
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

    // --------------------------------------------------------
    // connectSocket
    // --------------------------------------------------------
    connectSocket: () => {
        const { authUser, socket, _connectingSocket } = get()

        // Déjà connecté ?
        if (socket?.connected) {
            console.log("[WS] already connected, skipping")
            return
        }

        // Pas d'utilisateur authentifié → on ne tente rien, mais on log
        if (!authUser) {
            console.warn("[WS] connectSocket aborted: no authUser")
            return
        }

        // Verrou anti-race-condition (plusieurs appels en rafale)
        if (_connectingSocket) {
            console.log("[WS] connectSocket already in progress, skipping")
            return
        }

        // Fermer l'ancienne connexion si elle existe
        if (socket) {
            try {
                socket.disconnect()
            } catch (e) {
                console.warn("[WS] error while disconnecting previous socket:", e)
            }
        }

        set({ _connectingSocket: true })

        try {
            const newSocket = io(SOCKET_URL, {
                query: { userId: authUser._id },
                transports: ["websocket", "polling"],
                withCredentials: true,         // important si cookies httpOnly
                reconnection: true,
                reconnectionAttempts: Infinity, // ne jamais abandonner
                reconnectionDelay: 1000,
                reconnectionDelayMax: 5000,
                randomizationFactor: 0.5,
                timeout: 10000,
            })

            newSocket.on("connect", () => {
                console.log("[WS] connected:", newSocket.id)
                set({ _connectingSocket: false })
            })

            newSocket.on("connect_error", (error) => {
                console.error("[WS] connect_error:", error?.message || error)
                set({ _connectingSocket: false })
            })

            newSocket.on("disconnect", (reason) => {
                console.log("[WS] disconnect:", reason)
                // On ne réinitialise pas socket : la reconnexion auto le fera
            })

            newSocket.on("reconnect", (attempt) => {
                console.log("[WS] reconnected after", attempt, "attempts")
            })

            newSocket.on("reconnect_attempt", (attempt) => {
                console.log("[WS] reconnect attempt", attempt)
            })

            newSocket.on("reconnect_failed", () => {
                console.error("[WS] reconnection failed permanently")
                set({ _connectingSocket: false })
            })

            newSocket.on("getOnlineUsers", (userIds) => {
                console.log("[WS] online users received:", userIds)
                set({ onlineUsers: userIds })
            })

            newSocket.on("typing", (data) => {
                console.log("[WS] typing event:", data)
                const { senderId, isTyping } = data || {}
                if (!senderId) return
                set((state) => ({
                    typingUsers: {
                        ...state.typingUsers,
                        [senderId]: Boolean(isTyping),
                    },
                }))
            })

            set({ socket: newSocket })
        } catch (error) {
            console.error("[WS] Error creating socket:", error)
            set({ _connectingSocket: false })
        }
    },

    // --------------------------------------------------------
    // disconnectSocket
    // --------------------------------------------------------
    disconnectSocket: () => {
        const { socket } = get()
        if (socket) {
            try {
                socket.disconnect()
            } catch (e) {
                console.warn("[WS] error while disconnecting:", e)
            }
        }
        set({ socket: null, onlineUsers: [], typingUsers: {}, _connectingSocket: false })
    },
}))
