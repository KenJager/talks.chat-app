import React, { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '@stores/useAuthStore'
import { Mail, RotateCcw, ArrowLeft } from 'lucide-react'
import { toast } from 'react-hot-toast'

const Verify2FAPage = () => {
  const [code, setCode] = useState(['', '', '', '', '', ''])
  const [isLoading, setIsLoading] = useState(false)
  const [countdown, setCountdown] = useState(60)
  
  const inputRefs = useRef([])
  const navigate = useNavigate()
  const location = useLocation()
  
  const { verify2FA, resend2FACode } = useAuthStore()
  
  const { type, tempUserId, email, fullName } = location.state || {}

  useEffect(() => {
    if (!tempUserId || !email) {
      console.error('Missing verification data')
      navigate(type === 'signup' ? '/signup' : '/login')
    }
  }, [tempUserId, email, type, navigate])

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [countdown])

  const handleChange = (index, value) => {
    if (!/^\d?$/.test(value)) return

    const newCode = [...code]
    newCode[index] = value
    setCode(newCode)

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }

    if (newCode.every(digit => digit !== '') && index === 5) {
      handleSubmit(newCode.join(''))
    }
  }

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      // Si Backspace est pressé et le champ actuel est vide, aller au champ précédent
      inputRefs.current[index - 1]?.focus()
    } else if (e.key === 'ArrowLeft' && index > 0) {
      // Flèche gauche - aller au champ précédent
      inputRefs.current[index - 1]?.focus()
    } else if (e.key === 'ArrowRight' && index < 5) {
      // Flèche droite - aller au champ suivant
      inputRefs.current[index + 1]?.focus()
    } else if (e.key === 'Enter' && code.every(digit => digit !== '')) {
      // Enter - soumettre le formulaire si tous les champs sont remplis
      handleSubmit()
    }
  }

  const handlePaste = (e) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text')
    const digits = pastedData.replace(/\D/g, '').split('').slice(0, 6)
    
    if (digits.length === 6) {
      const newCode = [...code]
      digits.forEach((digit, index) => {
        newCode[index] = digit
      })
      setCode(newCode)
      inputRefs.current[5]?.focus()
      handleSubmit(newCode.join(''))
    }
  }

  const handleSubmit = async (fullCode = code.join('')) => {
    if (fullCode.length !== 6) {
      toast.error('Please enter the 6-digit code')
      return
    }

    setIsLoading(true)
    try {
      await verify2FA({
        type,
        tempUserId,
        code: fullCode
      })
      
      // Rediriger après vérification réussie
      navigate('/')
    } catch (error) {
      setCode(['', '', '', '', '', ''])
      inputRefs.current[0]?.focus()
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendCode = async () => {
    if (countdown > 0) return

    try {
      await resend2FACode({
        type,
        tempUserId
      })
      toast.success('New verification code sent to your email')
      setCountdown(60)
    } catch (error) {
      // Error handled in store
    }
  }

  const getTitle = () => {
    return type === 'signup' ? 'Verify Your Email' : 'Two-Factor Authentication'
  }

  const getSubtitle = () => {
    return type === 'signup' 
      ? 'Enter the 6-digit code to complete your registration'
      : 'Enter the 6-digit code from your email'
  }

  if (!tempUserId || !email) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="loading loading-spinner loading-lg"></div>
          <p className="mt-4">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <button
            onClick={() => navigate(type === 'signup' ? '/signup' : '/login')}
            className="btn btn-ghost btn-circle absolute top-4 left-4"
          >
            <ArrowLeft className="size-5" />
          </button>

          <div className="mx-auto size-12 bg-blue-100 rounded-full flex items-center justify-center">
            <Mail className="size-6 text-blue-600" />
          </div>
          
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            {getTitle()}
          </h2>
          
          {type === 'signup' && fullName && (
            <p className="mt-2 text-sm text-gray-600">
              Welcome, <span className="font-medium">{fullName}</span>!
            </p>
          )}
          
          <p className="mt-2 text-sm text-gray-600">
            We sent a verification code to{' '}
            <span className="font-medium text-blue-600">{email}</span>
          </p>
          
          <p className="mt-1 text-sm text-gray-500">
            {getSubtitle()}
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={(e) => e.preventDefault()}>
          <div className="flex justify-center space-x-2">
            {code.map((digit, index) => (
              <input
                key={index}
                ref={(el) => (inputRefs.current[index] = el)}
                type="text"
                inputMode="numeric"
                maxLength="1"
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={index === 0 ? handlePaste : undefined}
                className="w-12 h-12 text-center text-xl text-black font-semibold border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-colors"
                disabled={isLoading}
              />
            ))}
          </div>

          <div className="text-center">
            <button
              type="button"
              onClick={() => handleSubmit()}
              disabled={isLoading || code.some(digit => digit === '')}
              className="btn bg-base-300 text-primary w-full max-w-xs"
            >
              {isLoading ? (
                <span className="loading loading-spinner"></span>
              ) : (
                type === 'signup' ? 'Verify & Create Account' : 'Verify & Login'
              )}
            </button>
          </div>

          <div className="text-center">
            <button
              type="button"
              onClick={handleResendCode}
              disabled={countdown > 0}
              className="btn bg-base-300 gap-2"
            >
              <RotateCcw className="size-4" />
              {countdown > 0 ? `Resend in ${countdown}s` : 'Resend Code'}
            </button>
          </div>

          <div className="text-center text-sm text-gray-500">
            <p>Can't find the code? Check your spam folder.</p>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Verify2FAPage