import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuthStore } from '@stores/useAuthStore'
import AuthImagePattern from "@components/AuthImagePattern"
import { MessageSquare, Mail, Lock, Eye, EyeOff } from 'lucide-react'

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })

  const { login, isLoggin } = useAuthStore()
  const navigate = useNavigate()

  const validateForm = () => {
    if (!/\S+@\S+\.\S+/.test(formData.email)) return toast.error("Invalid email format")
    if (formData.password.length < 6) return toast.error("password must be at least 6 characters")

    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const success = validateForm()
    if (success === true) {
      try {
        const result = await login(formData)
        console.log(result.tempUserId)

        // Si la 2FA est requise, rediriger vers la page de vérification
        if (result?.requires2FA) {
          navigate('/verify-2fa', {
            state: {
              type: "login",
              tempUserId: result.tempUserId,
              email: formData.email
            }
          })
        }
      } catch (error) {
        console.error("Error during login : ",error)
      }
    }
  }
  return (
    <div className='min-h-screen grid lg:grid-cols-2 pt-14'>
      {/* left side */}
      <div className='flex flex-col justify-center items-center p-6 sm:p-12'>
        <div className='w-full max-w-md space-y-5'>
          {/* LOGO */}
          <div className='text-center md-8'>
            <div className='flex flex-col items-center gap-2 group'>
              <div
                className='size-12 rounded bg-primary/10 flex items-center justify-center
                group-hover:bg-primary/20 transition-colors animate-bounce'
              >
                <MessageSquare className='size-6 text-primary' />
              </div>
              <h1 className='text-2xl font-bold mt-2'>Login</h1>
              <p className='text-base-content/60'>Connect to your account</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className='space-y-6'>
            <div className='form-control'>
              <label className='label'>
                <span className='label-text font-medium'>Email</span>
              </label>
              <div className='relative'>
                <div className='absolute z-100 inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                  <Mail className='size-5 text-base-content/50' />
                </div>
                <input
                  type='email'
                  className='input input-bordered w-full pl-10 text-gray-400'
                  placeholder='Enter your email'
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className='form-control'>
              <label className='label'>
                <span className='label-text font-medium'>Password</span>
              </label>
              <div className='relative mb-2'>
                <div className='absolute z-100 inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                  <Lock className='size-5 text-base-content/50' />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  className='input input-bordered w-full pl-10 text-gray-400'
                  placeholder='Enter your password'
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                />
                <div
                  className='absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer z-10'
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className='size-5 text-base-content/50' />
                  ) : (
                    <Eye className='size-5 text-base-content/50' />
                  )}
                </div>
              </div>
              <Link to={'/forgot-password'} className='text-primary text-sm'>forget password ?</Link>
            </div>

            <div>
              <div className='flex items-center justify-center'>
                <div className='w-full'>
                  <button
                    type='submit'
                    className='btn btn-primary w-full'
                    disabled={isLoggin}
                  >
                    {isLoggin ? <span className="loading loading-spinner"></span> : 'Sign In'}
                  </button>
                </div>
              </div>
            </div>
          </form>

          <div className='text-center'>
            <p className='text-base-content/60'>
              Don&apos;t have an account?{" "}
              <Link to="/signup" className='link link-primary'>
                create account
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* right side */}

      <AuthImagePattern
        title="join our community"
        subtitle="connect with friend, share moments and stay in touch with you"
      />
    </div>
  )
}

export default LoginPage
