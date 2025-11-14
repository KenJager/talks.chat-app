// socket.js
import { Server } from 'socket.io'
import http from 'http'
import express from 'express'
import User from "../models/user.model.js"

const app = express()
const server = http.createServer(app)
const io = new Server(server, {
    cors: {
        origin: [
            process.env.CLIENT_URL,  // URL de production
            "http://localhost:5173", // Développement
        ],
        // credentials: true,
        // methods: ["GET", "POST"]
    },
    // transports: ['websocket', 'polling']
})

export function getReceiverSocketId(userId) {
    return userSocketMap[userId]
}

// used to store online users
const userSocketMap = {} // {userId: socketId}

io.on("connection", (socket) => {
    const userId = socket.handshake.query.userId
    console.log("A user connected", socket.id, "User ID:", userId)

    if (userId) {
        userSocketMap[userId] = socket.id
    }

    // io.emit() is used to send events to all the connected clients
    io.emit("getOnlineUsers", Object.keys(userSocketMap))

    // Écouter les déconnexions volontaires
    socket.on("user_logout", async () => {
        console.log("User manually logging out:", userId)
        await updateLastSeenAndCleanup(userId, socket.id)
    })

    socket.on("disconnect", async (reason) => {
        console.log("A user disconnected", socket.id, "Reason:", reason)
        await updateLastSeenAndCleanup(userId, socket.id)
    })
})

async function updateLastSeenAndCleanup(userId, socketId) {
    try {
        if (userId) {
            const user = await User.findById(userId)
            if (user) {
                user.lastSeen = new Date()
                await user.save()
                console.log('LastSeen updated for user:', userId)
            }

            if (userSocketMap[userId] === socketId) {
                delete userSocketMap[userId]
            }
        }
    } catch (error) {
        console.error('Error updating lastSeen on disconnect:', error)
    }

    io.emit("getOnlineUsers", Object.keys(userSocketMap))
}

export { io, app, server }