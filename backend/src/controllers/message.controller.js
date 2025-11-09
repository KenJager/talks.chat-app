import User from "../models/user.model.js";
import Messages from "../models/message.model.js";
import cloudinary from "../lib/cloudinary.js"
import { getReceiverSocketId, io } from "../lib/socket.js";

export const getUsersForSidebar = async (req, res) => {
    try {
        const loggerInUserId = req.user._id
        const filteredUsers = await User.find({ _id: { $ne: loggerInUserId } })
            .select("-password")

        res.status(200).json(filteredUsers)
    } catch (error) {
        res.status(500).json({ message: "Error fetching users for sidebar", error: error.message })
    }
}

export const getMessages = async (req, res) => {
    try {
        const { id:userToChatId } = req.params;
        const senderId = req.user._id;

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

        let imageUrl

        if (image) {
            const uploadResponse = await cloudinary.uploader.upload(image)
            imageUrl = uploadResponse.secure_url
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