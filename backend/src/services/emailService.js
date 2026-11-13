import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE, // ou votre service d'email
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
})

// const transporter = nodemailer.createTransport({
//   host: process.env.EMAIL_SERVICE,
//   port: process.env.EMAIL_PORT,
//   secure: false, // Use TLS
//   auth: {
//     user: process.env.EMAIL_USER,
//     pass: process.env.EMAIL_PASS
//   }
// })

export const send2FACode = async (email, code) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Votre code de vérification - Talk\'s',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #3B82F6;">Vérification de sécurité</h2>
        <p>Bonjour,</p>
        <p>Utilisez le code suivant pour compléter votre connexion :</p>
        <div style="background: #f8fafc; padding: 20px; text-align: center; margin: 20px 0;">
          <h1 style="color: #1E40AF; font-size: 32px; letter-spacing: 8px; margin: 0;">
            ${code}
          </h1>
        </div>
        <p>Ce code expirera dans 10 minutes.</p>
        <p><strong>Ne partagez jamais ce code avec personne.</strong></p>
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
        <p style="color: #6B7280; font-size: 12px;">
          Si vous n'avez pas tenté de vous connecter, ignorez cet email.
        </p>
      </div>
    `
  }

  await transporter.sendMail(mailOptions)
}

export const sendPasswordResetEmail = async (email, resetToken) => {
  const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`
  
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Réinitialisation de votre mot de passe - Talk\'s',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #3B82F6;">Réinitialisation de mot de passe</h2>
        <p>Bonjour,</p>
        <p>Vous avez demandé la réinitialisation de votre mot de passe. Cliquez sur le bouton ci-dessous pour créer un nouveau mot de passe :</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" 
             style="background: #3B82F6; color: white; padding: 12px 24px; 
                    text-decoration: none; border-radius: 6px; font-weight: bold;
                    display: inline-block;">
            Réinitialiser mon mot de passe
          </a>
        </div>

        <p style="color: #6B7280; font-size: 14px;">
          <strong>Le lien expirera dans 1 heure.</strong>
        </p>

        <p style="color: #6B7280; font-size: 12px;">
          Si vous n'avez pas demandé cette réinitialisation, ignorez simplement cet email.
        </p>

        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
        
        <p style="color: #9CA3AF; font-size: 12px;">
          Ou copiez-collez ce lien dans votre navigateur :<br>
          <span style="word-break: break-all;">${resetUrl}</span>
        </p>
      </div>
    `
  }

  await transporter.sendMail(mailOptions)
}

export const sendPasswordChangedConfirmation = async (email) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Mot de passe modifié - Talk\'s',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #10B981;">Mot de passe modifié avec succès</h2>
        <p>Bonjour,</p>
        <p>Votre mot de passe a été modifié avec succès.</p>
        
        <div style="background: #ECFDF5; padding: 16px; border-radius: 8px; margin: 20px 0;">
          <p style="color: #065F46; margin: 0;">
            ✅ Si vous êtes à l'origine de cette modification, vous pouvez ignorer cet email.
          </p>
        </div>

        <p style="color: #6B7280; font-size: 12px;">
          Si vous n'avez pas modifié votre mot de passe, veuillez 
          <a href="mailto:support@talks.com" style="color: #3B82F6;">contacter notre support</a> immédiatement.
        </p>
      </div>
    `
  }

  await transporter.sendMail(mailOptions)
}