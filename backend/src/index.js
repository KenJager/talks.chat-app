import express from "express"
import dotenv from "dotenv"
import cookieParser from "cookie-parser"
import cors from "cors"
import path from "path"
import { fileURLToPath } from 'url'

import { connectDB } from "./lib/db.js"
import authRoutes from "./routes/auth.route.js"
import messageRoutes from "./routes/message.route.js"
import { app, server } from "./lib/socket.js"

dotenv.config()

const PORT = process.env.PORT || 5001

// Correction pour __dirname en ES modules
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

app.use(express.json())
app.use(cookieParser())
app.use(cors({
    origin: [
      process.env.CLIENT_URL,
      'http://localhost:5173',
    ].filter(Boolean),
    credentials: true
}))

app.use("/api/auth", authRoutes)
app.use("/api/messages", messageRoutes)

// Supprimez la partie production static files pour Render
// car vous servez le frontend depuis Vercel

server.listen(PORT, () => {
  console.log("Server is running on port: " + PORT)
  connectDB()
})