import User from "../models/user.model.js";
import Messages from "../models/message.model.js";
import Friendship from "../models/friendship.model.js";
import cloudinary from "../lib/cloudinary.js"
import { getReceiverSocketId, io } from "../lib/socket.js";

export const getUsersForSidebar = async (req, res) => {
    try {
        const loggerInUserId = req.user._id

        // Trouver tous les amis de l'utilisateur
        const friendships = await Friendship.find({
            $or: [
                { user1: loggerInUserId },
                { user2: loggerInUserId }
            ]
        })
        .populate("user1", "fullName email profilePicture lastSeen proverbePhrase")
        .populate("user2", "fullName email profilePicture lastSeen proverbePhrase");

        const friends = friendships.map(friendship => {
            const friend = friendship.user1._id.toString() === loggerInUserId.toString()
                ? friendship.user2
                : friendship.user1;
            return friend;
        });

        res.status(200).json(friends)
    } catch (error) {
        res.status(500).json({ message: "Error fetching users for sidebar", error: error.message })
    }
}

export const getMessages = async (req, res) => {
    try {
        const { id:userToChatId } = req.params;
        const senderId = req.user._id;

        // Vérifier que les utilisateurs sont amis avant d'autoriser l'accès aux messages
        const friendship = await Friendship.findOne({
            $or: [
                { user1: senderId, user2: userToChatId },
                { user1: userToChatId, user2: senderId }
            ]
        });

        if (!friendship) {
            return res.status(403).json({ message: "You can only chat with friends" });
        }

        const messages = await Messages.find({
            $or: [
                { senderId:senderId, receiverId:userToChatId },
                { senderId:userToChatId, receiverId:senderId }
            ]
        }).sort({ createdAt: 1 });

        res.status(200).json(messages);
    } catch (error) {
        res.status(500).json({ message: "Error fetching messages", error: error.message });
    }
}

export const sendMessage = async (req, res) => {
    try {
        const { text, image } = req.body;
        const { id } = req.params;
        const senderId = req.user._id;

        // Vérifier que les utilisateurs sont amis avant d'autoriser l'envoi de message
        const friendship = await Friendship.findOne({
            $or: [
                { user1: senderId, user2: id },
                { user1: id, user2: senderId }
            ]
        });

        if (!friendship) {
            return res.status(403).json({ message: "You can only send messages to friends" });
        }

        let imageUrl

        if (image) {
            try {
                console.log("Uploading image for message...")
                const uploadResponse = await cloudinary.uploader.upload(image)
                imageUrl = uploadResponse.secure_url
                console.log("Image uploaded successfully:", imageUrl)
            } catch (uploadError) {
                console.error("Image upload failed:", uploadError.message)
                return res.status(400).json({ message: "Image upload failed", error: uploadError.message })
            }
        }


        const newMessage = new Messages({
            senderId: senderId,
            receiverId: id,
            text,
            image: imageUrl,
            read: false
        });

        await newMessage.save();

        const receiverSocketId = getReceiverSocketId(id)

        if (receiverSocketId) {
            io.to(receiverSocketId).emit("newMessage", newMessage);
        }

        res.status(201).json(newMessage);
    } catch (error) {
        console.error("Error sending message:", error.message)
        res.status(500).json({ message: "Error sending message", error: error.message });
    }
}   


export const markMessagesAsRead = async (req, res) => {
    try {
        const { senderId } = req.params; 
        const receiverId = req.user._id;

        const result = await Messages.updateMany(
            {
                senderId: senderId,
                receiverId: receiverId,
                read: false
            },
            {
                $set: {
                    read: true,
                }
            }
        );

        const senderSocketId = getReceiverSocketId(senderId);
        if (senderSocketId) {
            io.to(senderSocketId).emit("messagesRead", {
                readerId: receiverId,
                messageCount: result.modifiedCount
            });
        }

        res.status(200).json({ 
            message: "Messages marqués comme lus", 
            modifiedCount: result.modifiedCount 
        });
    } catch (error) {
        res.status(500).json({ message: "Error marking messages as read", error: error.message });
    }
}