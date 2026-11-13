import express from "express"
import dotenv from "dotenv"
import cookieParser from "cookie-parser"
import cors from "cors"
import path from "path"
import { fileURLToPath } from 'url'

import { connectDB } from "./lib/db.js"
import authRoutes from "./routes/auth.route.js"
import messageRoutes from "./routes/message.route.js"
import friendRoutes from "./routes/friend.route.js"
import { app, server } from "./lib/socket.js"

dotenv.config()

const PORT = process.env.PORT || 5001

// Correction pour __dirname en ES modules
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

app.use(express.json({ limit: '10mb' }))
app.use(cookieParser())
app.use(cors({
    origin: [
      process.env.CLIENT_URL,
    ].filter(Boolean),
    credentials: true
}))

// CORS headers for static uploads
app.use('/uploads', (req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Methods', 'GET, OPTIONS')
  res.header('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200)
  }
  next()
})

app.use('/uploads', express.static(path.join(__dirname, '../uploads')))

app.use("/api/auth", authRoutes)
app.use("/api/messages", messageRoutes)
app.use("/api/friends", friendRoutes)

// Supprimez la partie production static files pour Render
// car vous servez le frontend depuis Vercel

server.listen(PORT, () => {
  console.log("Server is running on port: " + PORT)
  connectDB()
})