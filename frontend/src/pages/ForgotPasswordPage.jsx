import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@stores/useAuthStore'
import AuthImagePattern from "@components/AuthImagePattern"
import { MessageSquare, Mail, ArrowLeft, CheckCircle } from 'lucide-react'
import { toast } from 'react-hot-toast'

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  
  const { forgotPassword } = useAuthStore()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!/\S+@\S+\.\S+/.test(email)) {
      return toast.error("Please enter a valid email address")
    }

    setIsLoading(true)
    try {
      await forgotPassword({ email })
      setEmailSent(true)
      toast.success("If an account exists, a reset link has been sent to your email")
    } catch (error) {
      toast.error(error.response?.data?.message || "Error sending reset email")
    } finally {
      setIsLoading(false)
    }
  }

  if (emailSent) {
    return (
      <div className='min-h-screen grid lg:grid-cols-2 pt-14'>
        <div className='flex flex-col justify-center items-center p-6 sm:p-12'>
          <div className='w-full max-w-md space-y-8 text-center'>
            <div className="mx-auto size-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="size-8 text-green-600" />
            </div>
            
            <h1 className='text-2xl font-bold'>Check Your Email</h1>
            
            <p className='text-base-content/60'>
              We've sent a password reset link to<br />
              <strong className="text-primary">{email}</strong>
            </p>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
              <p>💡 <strong>Didn't receive the email?</strong></p>
              <p className="mt-1">Check your spam folder or try again in a few minutes.</p>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => setEmailSent(false)}
                className="btn btn-ghost w-full"
              >
                Try another email
              </button>
              
              <Link to="/login" className="btn btn-primary w-full">
                Back to Login
              </Link>
            </div>
          </div>
        </div>
        
        <AuthImagePattern
          title="Security First"
          subtitle="We take your account security seriously"
        />
      </div>
    )
  }

  return (
    <div className='min-h-screen grid lg:grid-cols-2 pt-14'>
      {/* Left side */}
      <div className='flex flex-col justify-center items-center p-6 sm:p-12'>
        <div className='w-full max-w-md space-y-5'>
          {/* Header */}
          <div className='text-center'>
            <button
              onClick={() => navigate('/login')}
              className="btn btn-ghost btn-circle absolute top-4 left-4"
            >
              <ArrowLeft className="size-5" />
            </button>

            <div className='flex flex-col items-center gap-2 group'>
              <div
                className='size-12 rounded bg-primary/10 flex items-center justify-center
                group-hover:bg-primary/20 transition-colors'
              >
                <MessageSquare className='size-6 text-primary' />
              </div>
              <h1 className='text-2xl font-bold mt-2'>Reset Password</h1>
              <p className='text-base-content/60'>Enter your email to reset your password</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className='space-y-6'>
            <div className='form-control'>
              <label className='label'>
                <span className='label-text font-medium'>Email Address</span>
              </label>
              <div className='relative'>
                <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                  <Mail className='size-5 text-base-content/50' />
                </div>
                <input
                  type='email'
                  className='input input-bordered w-full pl-10'
                  placeholder='Enter your email address'
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div>
              <button
                type='submit'
                className='btn btn-primary w-full'
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="loading loading-spinner"></span>
                ) : (
                  'Send Reset Link'
                )}
              </button>
            </div>
          </form>

          <div className='text-center'>
            <p className='text-base-content/60'>
              Remember your password?{" "}
              <Link to="/login" className='link link-primary'>
                Back to Login
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Right side */}
      <AuthImagePattern
        title="Secure Account Recovery"
        subtitle="We'll help you get back into your account safely"
      />
    </div>
  )
}

export default ForgotPasswordPage