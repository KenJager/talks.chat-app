export const generate2FACode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export const verify2FACode = (user, code) => {
  if (!user.temp2FACode || !user.temp2FAExpires) {
    return false
  }

  const now = new Date()
  if (now > user.temp2FAExpires) {
    return false // Code expiré
  }

  return user.temp2FACode === code
}