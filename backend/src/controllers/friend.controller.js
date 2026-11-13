import User from "../models/user.model.js";
import FriendRequest from "../models/friendRequest.model.js";
import Friendship from "../models/friendship.model.js";
import { io } from "../lib/socket.js";

// Envoyer une demande d'ami
export const sendFriendRequest = async (req, res) => {
    try {
        const { receiverId } = req.body;
        const senderId = req.user._id;

        // Vérifier que l'utilisateur n'envoie pas de demande à lui-même
        if (senderId.toString() === receiverId) {
            return res.status(400).json({ message: "Cannot send friend request to yourself" });
        }

        // Vérifier si les utilisateurs existent
        const [sender, receiver] = await Promise.all([
            User.findById(senderId),
            User.findById(receiverId)
        ]);

        if (!sender || !receiver) {
            return res.status(404).json({ message: "User not found" });
        }

        // Vérifier s'ils sont déjà amis
        const existingFriendship = await Friendship.findOne({
            $or: [
                { user1: senderId, user2: receiverId },
                { user1: receiverId, user2: senderId }
            ]
        });

        if (existingFriendship) {
            return res.status(400).json({ message: "Users are already friends" });
        }

        // Vérifier s'il y a déjà une demande, dans n'importe quel sens
        const existingRequest = await FriendRequest.findOne({
            $or: [
                { senderId, receiverId },
                { senderId: receiverId, receiverId: senderId }
            ]
        });

        if (existingRequest && existingRequest.status === "pending") {
            return res.status(409).json({ message: "Friend request already exists" });
        }

        // Si une demande existe mais est déclinée/acceptée, la réinitialiser à pending
        let friendRequest;
        if (existingRequest) {
            friendRequest = await FriendRequest.findByIdAndUpdate(
                existingRequest._id,
                { status: "pending" },
                { new: true }
            );
        } else {
            // Créer une nouvelle demande d'ami
            try {
                friendRequest = new FriendRequest({
                    senderId,
                    receiverId
                });
                await friendRequest.save();
            } catch (saveError) {
                if (saveError?.code === 11000) {
                    return res.status(409).json({ message: "Friend request already exists" });
                }
                throw saveError;
            }
        }

        // Populate les détails du sender pour l'événement socket
        const populatedRequest = await FriendRequest.findById(friendRequest._id)
            .populate("senderId", "fullName email profilePicture");

        io.to(`user:${receiverId}`).emit("newFriendRequest", {
            _id: populatedRequest._id,
            senderId: populatedRequest.senderId,
            receiverId,
            status: "pending",
            createdAt: populatedRequest.createdAt
        });

        res.status(201).json({
            message: "Friend request sent successfully",
            friendRequest: populatedRequest
        });
    } catch (error) {
        console.error("Error sending friend request:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Accepter une demande d'ami
export const acceptFriendRequest = async (req, res) => {
    try {
        const { requestId } = req.params;
        const userId = req.user._id;

        const friendRequest = await FriendRequest.findById(requestId);

        if (!friendRequest) {
            return res.status(404).json({ message: "Friend request not found" });
        }

        if (friendRequest.receiverId.toString() !== userId.toString()) {
            return res.status(403).json({ message: "Not authorized to accept this request" });
        }

        if (friendRequest.status !== "pending") {
            return res.status(400).json({ message: "Request already processed" });
        }

        // Créer l'amitié
        const friendship = new Friendship({
            user1: friendRequest.senderId,
            user2: friendRequest.receiverId
        });

        await friendship.save();

        // Supprimer la demande d'ami de la base de données
        await FriendRequest.findByIdAndDelete(friendRequest._id);

        io.to(`user:${friendRequest.senderId}`).emit("friendRequestAccepted", {
            requestId: friendRequest._id,
            sender: friendRequest.senderId,
            receiver: friendRequest.receiverId
        });

        res.status(200).json({
            message: "Friend request accepted",
            friendship
        });
    } catch (error) {
        console.error("Error accepting friend request:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Refuser une demande d'ami
export const declineFriendRequest = async (req, res) => {
    try {
        const { requestId } = req.params;
        const userId = req.user._id;

        const friendRequest = await FriendRequest.findById(requestId);

        if (!friendRequest) {
            return res.status(404).json({ message: "Friend request not found" });
        }

        if (friendRequest.receiverId.toString() !== userId.toString()) {
            return res.status(403).json({ message: "Not authorized to decline this request" });
        }

        // Supprimer la demande d'ami de la base de données
        await FriendRequest.findByIdAndDelete(friendRequest._id);

        io.to(`user:${friendRequest.senderId}`).emit("friendRequestDeclined", {
            requestId: friendRequest._id,
            sender: friendRequest.senderId,
            receiver: friendRequest.receiverId
        });

        res.status(200).json({ message: "Friend request declined" });
    } catch (error) {
        console.error("Error declining friend request:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Obtenir les demandes d'amis reçues
export const getReceivedFriendRequests = async (req, res) => {
    try {
        const userId = req.user._id;

        const requests = await FriendRequest.find({
            receiverId: userId,
            status: "pending"
        })
        .populate("senderId", "fullName email profilePicture")
        .sort({ createdAt: -1 });

        res.status(200).json(requests);
    } catch (error) {
        console.error("Error fetching friend requests:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Obtenir les demandes d'amis envoyées
export const getSentFriendRequests = async (req, res) => {
    try {
        const userId = req.user._id;

        const requests = await FriendRequest.find({
            senderId: userId,
            status: "pending"
        })
        .populate("receiverId", "fullName email profilePicture")
        .sort({ createdAt: -1 });

        res.status(200).json(requests);
    } catch (error) {
        console.error("Error fetching sent friend requests:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Obtenir la liste des amis
export const getFriends = async (req, res) => {
    try {
        const userId = req.user._id;

        const friendships = await Friendship.find({
            $or: [
                { user1: userId },
                { user2: userId }
            ]
        })
        .populate("user1", "fullName email profilePicture lastSeen proverbePhrase")
        .populate("user2", "fullName email profilePicture lastSeen proverbePhrase");

        const friends = friendships.map(friendship => {
            const friend = friendship.user1._id.toString() === userId.toString()
                ? friendship.user2
                : friendship.user1;
            return friend;
        });

        res.status(200).json(friends);
    } catch (error) {
        console.error("Error fetching friends:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Supprimer un ami
export const removeFriend = async (req, res) => {
    try {
        const { friendId } = req.params;
        const userId = req.user._id;

        const friendship = await Friendship.findOneAndDelete({
            $or: [
                { user1: userId, user2: friendId },
                { user1: friendId, user2: userId }
            ]
        });

        if (!friendship) {
            return res.status(404).json({ message: "Friendship not found" });
        }

        res.status(200).json({ message: "Friend removed successfully" });
    } catch (error) {
        console.error("Error removing friend:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};