import bcrypt from "bcryptjs"
import User from "../models/user.model.js"
import { generateToken } from "../lib/utils.js";
import cloudinary from "../lib/cloudinary.js"
import { generate2FACode, verify2FACode } from '../services/twoFactorService.js'
import { 
    send2FACode, 
    sendPasswordResetEmail, 
    sendPasswordChangedConfirmation 
} from '../services/emailService.js'

export const signup = async (req, res) => {
    const { email, fullName, password } = req.body;
    try {
        if (!fullName || !email || !password) {
            return res.status(400).json({ message: "Please fill all fields" })
        }
        if (password.length < 6) {
            return res.status(400).json({ message: "Password must be at least 6 characters" })
        }

        const existingUser = await User.findOne({ email })
        if (existingUser) return res.status(400).json({ message: "Email already exists" })

        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)

        const newUser = new User({
            fullName,
            email,
            password: hashedPassword,
            lastSeen: new Date()
        })

        // Générer et envoyer le code 2FA
        const code = generate2FACode()
        newUser.temp2FACode = code
        newUser.temp2FAExpires = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

        await newUser.save()

        await send2FACode(email, code)

        res.status(201).json({
            message: "Verification code sent to your email",
            requires2FA: true,
            tempUserId: newUser._id,
            email: newUser.email
        })

    } catch (error) {
        console.error("Error during signup:", error);
        res.status(500).json({ message: "Internal server error" })
    }
}

export const login = async (req, res) => {
    const { email, password } = req.body
    try {
        const user = await User.findOne({ email })
        if (user) {
            const isPasswordValid = await bcrypt.compare(password, user.password)
            if (!isPasswordValid) return res.status(400).json({ message: "Invalid email or password" })
        } else { return res.status(400).json({ message: "Invalid credentials" }) }

        // Générer et envoyer le code 2FA
        const code = generate2FACode()
        user.temp2FACode = code
        user.temp2FAExpires = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
        
        await user.save()
        await send2FACode(email, code)
        console.log("code  :", code)

        res.status(200).json({
            message: "2FA code sent to your email",
            requires2FA: true,
            tempUserId: user._id // ID temporaire pour la vérification
        })

    } catch (error) {
        console.error("Error during login:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

export const logout = async (req, res) => {
    try {
        const user = await User.findById(req.user._id)

        if (user) {
            user.lastSeen = new Date()
            await user.save()
            console.log('LastSeen updated on logout for user:', user._id)
        }

        // Vider le cookie JWT
        res.cookie("jwt", "", {
            maxAge: 0,
            httpOnly: true,
            sameSite: 'strict',
            secure: process.env.NODE_ENV !== 'development'
        })

        res.status(200).json({
            message: "Logged out successfully",
            lastSeen: user?.lastSeen
        })

    } catch (error) {
        console.error("Error during logout:", error)
        res.status(500).json({ message: "Internal server error" })
    }
}

export const updateProfile = async (req, res) => {
    try {
        const userId = req.user._id;
        const { fullName, profilePicture } = req.body;

        if (!profilePicture) {
            return res.status(400).json({ message: "Profilfe pic is required" });
        }

        const uploadResponse = await cloudinary.uploader.upload(profilePicture)
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { profilePicture: uploadResponse.secure_url },
            { new: true }
        )

        res.status(200).json(updatedUser);
    } catch (error) {
        console.error("Error updating profile:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

export const checkAuth = async (req, res) => {
    try {
        // req.user est déjà défini par le middleware protectRoute
        const user = req.user

        res.status(200).json({
            _id: user._id,
            fullName: user.fullName,
            email: user.email,
            profilePicture: user.profilePicture,
            lastSeen: user.lastSeen
        })
    } catch (error) {
        console.error("Error during auth check:", error)
        res.status(500).json({ message: "Internal server error" })
    }
}

export const verify2FA = async (req, res) => {
    const { tempUserId, code } = req.body

    try {
        const user = await User.findById(tempUserId)
        if (!user) {
            return res.status(400).json({ message: "Invalid verification session" })
        }

        if (!verify2FACode(user, code)) {
            return res.status(400).json({ message: "Invalid or expired code" })
        }

        // Code valide - connexion réussie
        user.temp2FACode = undefined
        user.temp2FAExpires = undefined
        await user.save()

        // generate jwt token here
        generateToken(user._id, res)
        user.lastSeen = new Date();
        await user.save();

        res.status(200).json({
            _id: user._id,
            fullName: user.fullName,
            email: user.email,
            profilePicture: user.profilePicture,
            lastSeen: user.lastSeen
        })

    } catch (error) {
        console.error("Error during 2FA verification:", error)
        res.status(500).json({ message: "Internal server error" })
    }
}

export const resend2FACode = async (req, res) => {
    const { tempUserId } = req.body

    try {
        const user = await User.findById(tempUserId)
        if (!user) {
            return res.status(400).json({ message: "Invalid session" })
        }

        const code = generate2FACode()
        user.temp2FACode = code
        user.temp2FAExpires = new Date(Date.now() + 10 * 60 * 1000)

        await user.save()
        await send2FACode(user.email, code)

        res.status(200).json({ message: "New code sent to your email" })

    } catch (error) {
        console.error("Error resending 2FA code:", error)
        res.status(500).json({ message: "Internal server error" })
    }
}

export const forgotPassword = async (req, res) => {
    const { email } = req.body

    try {
        const user = await User.findOne({ email })

        // Pour des raisons de sécurité, on ne révèle pas si l'email existe
        if (!user) {
            return res.status(200).json({
                message: "If an account with that email exists, a password reset link has been sent"
            })
        }

        // Générer un token simple (moins sécurisé mais fonctionnel)
        const resetToken = Math.random().toString(36).substring(2, 15) +
            Math.random().toString(36).substring(2, 15)

        // Stocker le token directement (pas de hash pour simplifier)
        user.resetPasswordToken = resetToken
        user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000) // 1 heure

        await user.save()

        // Envoyer l'email avec le token
        await sendPasswordResetEmail(email, resetToken)

        res.status(200).json({
            message: "If an account with that email exists, a password reset link has been sent"
        })

    } catch (error) {
        console.error("Error in forgot password:", error)
        res.status(500).json({ message: "Internal server error" })
    }
}

export const resetPassword = async (req, res) => {
    const { token, newPassword } = req.body

    try {
        if (!token || !newPassword) {
            return res.status(400).json({ message: "Token and new password are required" })
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ message: "Password must be at least 6 characters" })
        }

        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: new Date() }
        })

        if (!user) {
            return res.status(400).json({
                message: "Invalid or expired reset token"
            })
        }

        // Hasher le nouveau mot de passe
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(newPassword, salt)

        // Mettre à jour le mot de passe et nettoyer les champs de reset
        user.password = hashedPassword
        user.resetPasswordToken = undefined
        user.resetPasswordExpires = undefined

        await user.save()

        // Envoyer un email de confirmation
        await sendPasswordChangedConfirmation(user.email)

        res.status(200).json({
            message: "Password reset successfully"
        })

    } catch (error) {
        console.error("Error in reset password:", error)
        res.status(500).json({ message: "Internal server error" })
    }
}

export const validateResetToken = async (req, res) => {
    const { token } = req.params

    try {
        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: new Date() }
        })

        if (!user) {
            return res.status(400).json({
                valid: false,
                message: "Invalid or expired reset token"
            })
        }

        res.status(200).json({
            valid: true,
            message: "Token is valid"
        })

    } catch (error) {
        console.error("Error validating reset token:", error)
        res.status(500).json({
            valid: false,
            message: "Error validating token"
        })
    }
}

export const verifySignup2FA = async (req, res) => {
    const { tempUserId, code } = req.body

    try {
        const user = await User.findById(tempUserId)
        if (!user) {
            return res.status(400).json({ message: "Invalid verification session" })
        }

        if (!user.temp2FACode || !user.temp2FAExpires) {
            return res.status(400).json({ message: "Verification session expired" })
        }

        const now = new Date()
        if (now > user.temp2FAExpires) {
            // Supprimer l'utilisateur si le code a expiré
            await User.findByIdAndDelete(tempUserId)
            return res.status(400).json({ message: "Verification code expired. Please sign up again." })
        }

        if (user.temp2FACode !== code) {
            return res.status(400).json({ message: "Invalid verification code" })
        }

        // Code valide - finaliser l'inscription
        user.temp2FACode = undefined
        user.temp2FAExpires = undefined
        user.isVerified = true // Marquer l'email comme vérifié
        await user.save()

        // Générer le token JWT
        generateToken(user._id, res)

        res.status(201).json({
            _id: user._id,
            fullName: user.fullName,
            email: user.email,
            profilePicture: user.profilePicture,
            lastSeen: user.lastSeen,
            isVerified: user.isVerified
        })

    } catch (error) {
        console.error("Error during signup verification:", error)
        res.status(500).json({ message: "Internal server error" })
    }
}

export const resendSignupCode = async (req, res) => {
    const { tempUserId } = req.body

    try {
        const user = await User.findById(tempUserId)
        if (!user) {
            return res.status(400).json({ message: "Invalid session" })
        }

        // Vérifier si l'utilisateur n'est pas déjà vérifié
        if (user.isVerified) {
            return res.status(400).json({ message: "Account already verified" })
        }

        // Générer un nouveau code
        const code = generate2FACode()
        user.temp2FACode = code
        user.temp2FAExpires = new Date(Date.now() + 10 * 60 * 1000)

        await user.save()
        await send2FACode(user.email, code)

        res.status(200).json({
            message: "New verification code sent to your email",
            tempUserId: user._id
        })

    } catch (error) {
        console.error("Error resending signup code:", error)
        res.status(500).json({ message: "Internal server error" })
    }
}