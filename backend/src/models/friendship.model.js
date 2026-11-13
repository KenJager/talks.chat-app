import mongoose from "mongoose";

const friendshipSchema = new mongoose.Schema(
    {
        user1: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        user2: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        createdAt: {
            type: Date,
            default: Date.now
        }
    },
    { timestamps: true }
);

// Index composé pour éviter les doublons d'amitiés
friendshipSchema.index({ user1: 1, user2: 1 }, { unique: true });

const Friendship = mongoose.model("Friendship", friendshipSchema);

export default Friendship;