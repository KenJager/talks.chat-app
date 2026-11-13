import jwt from "jsonwebtoken"

export const generateToken = (userId, res) => {
    const token = jwt.sign({userId}, process.env.JWT_SECRET, {
        expiresIn: "1000d"
    })

    const isHttps = process.env.CLIENT_URL?.startsWith('https://') || process.env.NODE_ENV === 'development'

    res.cookie("jwt",token, {
        maxAge: 1000*24*60*60*1000,
        httpOnly: true,
        sameSite: isHttps ? 'none' : 'lax',
        secure: isHttps
    })

    return token
}
