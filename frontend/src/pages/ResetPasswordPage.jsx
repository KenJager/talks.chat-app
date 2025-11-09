import React, { useState, useEffect } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { useAuthStore } from '@stores/useAuthStore'
import AuthImagePattern from "@components/AuthImagePattern"
import { MessageSquare, Lock, Eye, EyeOff, CheckCircle, XCircle } from 'lucide-react'
import { toast } from 'react-hot-toast'

const ResetPasswordPage = () => {
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isValidating, setIsValidating] = useState(true)
  const [isTokenValid, setIsTokenValid] = useState(false)
  
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  
  const { resetPassword, validateResetToken } = useAuthStore()
  const navigate = useNavigate()

  useEffect(() => {
    const validateToken = async () => {
      if (!token) {
        setIsValidating(false)
        setIsTokenValid(false)
        toast.error("No reset token provided")
        return
      }

      try {
        const response = await validateResetToken(token)
        setIsTokenValid(response.valid)
        if (!response.valid) {
          toast.error("Invalid or expired reset link")
        }
      } catch (error) {
        setIsTokenValid(false)
        toast.error("Invalid or expired reset link")
      } finally {
        setIsValidating(false)
      }
    }

    validateToken()
  }, [token, validateResetToken])

  const validatePassword = (password) => {
    const requirements = {
      length: password.length >= 6,
      hasUppercase: /[A-Z]/.test(password),
      hasLowercase: /[a-z]/.test(password),
      hasNumber: /[0-9]/.test(password),
    }
    return requirements
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (formData.password !== formData.confirmPassword) {
      return toast.error("Passwords do not match")
    }

    const requirements = validatePassword(formData.password)
    if (!requirements.length) {
      return toast.error("Password must be at least 6 characters")
    }

    setIsLoading(true)
    try {
      await resetPassword({
        token: token,
        newPassword: formData.password
      })
      
      toast.success("Password reset successfully!")
      navigate('/login')
    } catch (error) {
      toast.error(error.response?.data?.message || "Error resetting password")
    } finally {
      setIsLoading(false)
    }
  }

  const passwordRequirements = validatePassword(formData.password)
  const passwordsMatch = formData.password === formData.confirmPassword
  const isFormValid = passwordsMatch && 
                     passwordRequirements.length && 
                     passwordRequirements.hasUppercase && 
                     passwordRequirements.hasLowercase && 
                     passwordRequirements.hasNumber

  if (isValidating) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="loading loading-spinner loading-lg text-primary"></div>
          <p className="mt-4 text-gray-600">Validating reset link...</p>
        </div>
      </div>
    )
  }

  if (!isTokenValid) {
    return (
      <div className='min-h-screen grid lg:grid-cols-2 pt-14'>
        <div className='flex flex-col justify-center items-center p-6 sm:p-12'>
          <div className='w-full max-w-md space-y-8 text-center'>
            <div className="mx-auto size-16 bg-red-100 rounded-full flex items-center justify-center">
              <XCircle className="size-8 text-red-600" />
            </div>
            
            <h1 className='text-2xl font-bold text-gray-900'>Invalid Reset Link</h1>
            
            <p className='text-gray-600'>
              This password reset link is invalid or has expired.
            </p>

            <div className="space-y-3">
              <button
                onClick={() => navigate('/forgot-password')}
                className="btn btn-primary w-full"
              >
                Get New Reset Link
              </button>
              
              <Link to="/login" className="btn btn-ghost w-full">
                Back to Login
              </Link>
            </div>
          </div>
        </div>
        
        <AuthImagePattern
          title="Link Expired"
          subtitle="Security is our priority - reset links expire after 1 hour"
        />
      </div>
    )
  }

  return (
    <div className='min-h-screen grid lg:grid-cols-2 pt-14'>
      {/* Left side */}
      <div className='flex flex-col justify-center items-center p-6 sm:p-12'>
        <div className='w-full max-w-md space-y-6'>
          {/* Header */}
          <div className='text-center'>
            <div className='flex flex-col items-center gap-2'>
              <div className='size-12 rounded bg-primary/10 flex items-center justify-center'>
                <MessageSquare className='size-6 text-primary' />
              </div>
              <h1 className='text-2xl font-bold mt-2'>New Password</h1>
              <p className='text-base-content/60'>Create your new password</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className='space-y-6'>
            {/* New Password */}
            <div className='form-control'>
              <label className='label'>
                <span className='label-text font-medium'>New Password</span>
              </label>
              <div className='relative'>
                <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                  <Lock className='size-5 text-gray-400' />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  className='input input-bordered w-full pl-10 focus:border-primary focus:ring-2 focus:ring-primary/20'
                  placeholder='Enter new password'
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  autoComplete='new-password'
                />
                <div
                  className='absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer hover:text-gray-700 z-10'
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className='size-5 text-gray-400' />
                  ) : (
                    <Eye className='size-5 text-gray-400' />
                  )}
                </div>
              </div>
              
              {/* Password Requirements */}
              {formData.password && (
                <div className="mt-3 space-y-2 text-sm">
                  <div className={`flex items-center gap-2 ${passwordRequirements.length ? 'text-green-600' : 'text-red-600'}`}>
                    {passwordRequirements.length ? <CheckCircle className="size-4" /> : <XCircle className="size-4" />}
                    At least 6 characters
                  </div>
                  <div className={`flex items-center gap-2 ${passwordRequirements.hasUppercase ? 'text-green-600' : 'text-red-600'}`}>
                    {passwordRequirements.hasUppercase ? <CheckCircle className="size-4" /> : <XCircle className="size-4" />}
                    At least one uppercase letter
                  </div>
                  <div className={`flex items-center gap-2 ${passwordRequirements.hasLowercase ? 'text-green-600' : 'text-red-600'}`}>
                    {passwordRequirements.hasLowercase ? <CheckCircle className="size-4" /> : <XCircle className="size-4" />}
                    At least one lowercase letter
                  </div>
                  <div className={`flex items-center gap-2 ${passwordRequirements.hasNumber ? 'text-green-600' : 'text-red-600'}`}>
                    {passwordRequirements.hasNumber ? <CheckCircle className="size-4" /> : <XCircle className="size-4" />}
                    At least one number
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div className='form-control'>
              <label className='label'>
                <span className='label-text font-medium'>Confirm Password</span>
              </label>
              <div className='relative'>
                <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                  <Lock className='size-5 text-gray-400' />
                </div>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  className={`input input-bordered w-full pl-10 focus:border-primary focus:ring-2 focus:ring-primary/20 ${
                    formData.confirmPassword && !passwordsMatch ? 'input-error border-red-500' : ''
                  }`}
                  placeholder='Confirm new password'
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  required
                  autoComplete='new-password'
                />
                <div
                  className='absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer hover:text-gray-700 z-10'
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className='size-5 text-gray-400' />
                  ) : (
                    <Eye className='size-5 text-gray-400' />
                  )}
                </div>
              </div>
              
              {/* Password Match Indicator */}
              {formData.confirmPassword && (
                <div className={`mt-2 text-sm flex items-center gap-2 ${
                  passwordsMatch ? 'text-green-600' : 'text-red-600'
                }`}>
                  {passwordsMatch ? <CheckCircle className="size-4" /> : <XCircle className="size-4" />}
                  {passwordsMatch ? 'Passwords match' : 'Passwords do not match'}
                </div>
              )}
            </div>

            <div>
              <button
                type='submit'
                className='btn btn-primary w-full disabled:cursor-not-allowed'
                disabled={isLoading || !isFormValid}
              >
                {isLoading ? (
                  <>
                    <span className="loading loading-spinner loading-sm"></span>
                    Resetting Password...
                  </>
                ) : (
                  'Reset Password'
                )}
              </button>
            </div>
          </form>

          <div className='text-center pt-4'>
            <p className='text-gray-600'>
              Remember your password?{" "}
              <Link to="/login" className='link link-primary font-medium'>
                Back to Login
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Right side */}
      <div className="hidden lg:block">
        <AuthImagePattern
          title="Secure Password Reset"
          subtitle="Choose a strong password to keep your account secure"
        />
      </div>
    </div>
  )
}

export default ResetPasswordPage