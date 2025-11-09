import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        email: {
            type: String,
            required: true,
            unique: true,
        },
        fullName: {
            type: String,
            required: true,
        },
        password: {
            type: String,
            required: true,
            minlength: 8,
        },
        profilePicture: {
            type: String,
            default: ""
        },
        proverbePhrase: {
            type: String,
            default: "Hi! I'm available on Talk's 💬"
        },
        lastSeen: {
            type: Date,
            default: Date.now
        },

        isVerified: { type: Boolean, default: false },

        // Champs temporaires pour la 2FA par email
        temp2FACode: String,
        temp2FAExpires: Date,

        // Champs pour mot de passe oublié
        resetPasswordToken: String,
        resetPasswordExpires: Date
    },
    { timestamps: true }
);

const User = mongoose.model("User", userSchema);

export default User;
