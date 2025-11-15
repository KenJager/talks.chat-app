import express from "express"
import {
    login,
    signup,
    updateProfile,
    checkAuth,
    logout,
    forgotPassword,
    resetPassword,
    validateResetToken,
    verifySignup2FA,
    resendSignupCode
} from "../controllers/auth.controller.js"
import { protectRoute } from "../middlewares/auth.middleware.js"

const router = express.Router()

router.post("/signup", signup)
router.post('/verify-signup-2fa', verifySignup2FA)
router.post('/resend-signup-code', resendSignupCode)

router.post("/login", login)

router.post('/forgot-password', forgotPassword)
router.get('/validate-reset-token/:token', validateResetToken)
router.post('/reset-password', resetPassword)

router.post("/logout", protectRoute, logout)
router.put("/update-profile", protectRoute, updateProfile)
router.get("/check", protectRoute, checkAuth)

export default router