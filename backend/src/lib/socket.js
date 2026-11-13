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
            process.env.CLIENT_URL,
        ],
        credentials: true,
        methods: ["GET", "POST"]
    },
})

export function getReceiverSocketId(userId) {
    return userSocketMap[userId]
}

const userSocketMap = {}

io.on("connection", (socket) => {
    const userId = socket.handshake.query.userId
    console.log("A user connected", socket.id, "User ID:", userId)

    if (userId) {
        userSocketMap[userId] = socket.id
        // Joindre l'utilisateur à sa room personnelle
        socket.join(`user:${userId}`)
        console.log(`User ${userId} joined room user:${userId}`)
    }

    io.emit("getOnlineUsers", Object.keys(userSocketMap))

    socket.on("user_logout", async () => {
        console.log("User manually logging out:", userId)
        await updateLastSeenAndCleanup(userId, socket.id)
    })

    socket.on('typing', ({ senderId, receiverId, isTyping }) => {
        console.log(`Typing event: ${senderId} is ${isTyping ? 'typing' : 'stopped typing'} to ${receiverId}`)
        
        // Envoyer l'événement uniquement au receiver via sa room
        io.to(`user:${receiverId}`).emit('typing', {
            senderId,
            receiverId,
            isTyping,
        })
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