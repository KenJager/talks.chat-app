import React, { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { MessageSquare } from 'lucide-react'
import { useAuthStore } from '@stores/useAuthStore'
import NavBar from '@components/NavBar'
import HomePage from '@pages/HomePage'
import SignUpPage from '@pages/SignUpPage'
import LoginPage from '@pages/LoginPage'
import Verify2FAPage from '@pages/Verify2FAPage'
import ForgotPasswordPage from '@pages/ForgotPasswordPage'
import ResetPasswordPage from '@pages/ResetPasswordPage'
import SettingsPage from '@pages/SettingsPage'
import ProfilePage from '@pages/ProfilePage'
import { useThemeStore } from '@stores/useThemeStore'
import { useSocketCleanup } from '@hooks/useSocketCleanup'


function App() {
  const { authUser, checkAuth, isCheckingAuth } = useAuthStore()
  const { theme } = useThemeStore()
  useSocketCleanup()
  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  if (isCheckingAuth && !authUser) {
    return <div className="flex flex-col justify-center items-center h-screen">
      <div className='w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center'>
        <MessageSquare className='w-7 h-7 text-primary' />
      </div>
      <h1>Welcome to Talk's</h1>
      <span className="loading loading-spinner"></span>
    </div>
  }
  return (
    <div className='overflow-y-scroll' data-theme={theme}>
      <NavBar />
      <Routes>
        <Route path="/" element={authUser ? <HomePage /> : <Navigate to="/login" />} />
        <Route path="/login" element={!authUser ? <LoginPage /> : <Navigate to="/" />} />
        <Route path="/signup" element={!authUser ? <SignUpPage /> : <Navigate to="/" />} />
        <Route path="/verify-2fa" element={<Verify2FAPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/profile" element={authUser ? <ProfilePage /> : <Navigate to="/login" />} />
      </Routes>

      <Toaster />
    </div>
  )
}

export default App
