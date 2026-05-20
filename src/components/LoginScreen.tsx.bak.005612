'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { User, Lock, Eye, EyeOff, LogIn, UserPlus, ArrowLeft } from 'lucide-react'

interface LoginScreenProps {
  onLogin: (user: { name: string; isGuest: boolean }) => void
}

type AuthView = 'main' | 'login' | 'register'

export default function LoginScreen({ onLogin }: LoginScreenProps) {
  const [view, setView] = useState<AuthView>('main')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleLogin = () => {
    setError('')
    if (!name.trim()) { setError('يرجى إدخال الاسم'); return }
    if (!password.trim()) { setError('يرجى إدخال كلمة المرور'); return }

    setIsLoading(true)
    // Check localStorage for saved user
    const savedUsers = JSON.parse(localStorage.getItem('mudann_users') || '[]')
    const found = savedUsers.find((u: { name: string; password: string }) => u.name === name.trim() && u.password === password)

    setTimeout(() => {
      if (found) {
        localStorage.setItem('mudann_currentUser', JSON.stringify({ name: found.name, isGuest: false }))
        onLogin({ name: found.name, isGuest: false })
      } else {
        setError('الاسم أو كلمة المرور غير صحيحة')
      }
      setIsLoading(false)
    }, 600)
  }

  const handleRegister = () => {
    setError('')
    if (!name.trim()) { setError('يرجى إدخال الاسم'); return }
    if (!password.trim() || password.length < 3) { setError('كلمة المرور يجب أن تكون 3 أحرف على الأقل'); return }

    setIsLoading(true)
    const savedUsers = JSON.parse(localStorage.getItem('mudann_users') || '[]')
    const exists = savedUsers.find((u: { name: string }) => u.name === name.trim())

    setTimeout(() => {
      if (exists) {
        setError('هذا الاسم مسجل مسبقاً')
        setIsLoading(false)
        return
      }
      savedUsers.push({ name: name.trim(), email: email.trim(), password })
      localStorage.setItem('mudann_users', JSON.stringify(savedUsers))
      localStorage.setItem('mudann_currentUser', JSON.stringify({ name: name.trim(), isGuest: false }))
      onLogin({ name: name.trim(), isGuest: false })
      setIsLoading(false)
    }, 600)
  }

  const handleGuest = () => {
    localStorage.setItem('mudann_currentUser', JSON.stringify({ name: 'زائر', isGuest: true }))
    onLogin({ name: 'زائر', isGuest: true })
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" dir="rtl"
      style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 30%, #0f3460 60%, #1CB0F6 100%)' }}>

      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-20 w-64 h-64 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #1CB0F6, transparent)' }} />
        <div className="absolute bottom-20 left-20 w-80 h-80 rounded-full opacity-5"
          style={{ background: 'radial-gradient(circle, #ffffff, transparent)' }} />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full opacity-5"
          style={{ background: 'radial-gradient(circle, #58CC02, transparent)' }} />
      </div>

      <AnimatePresence mode="wait">
        {view === 'main' && (
          <motion.div
            key="main"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.4 }}
            className="relative z-10 w-full max-w-sm"
          >
            <div className="rounded-2xl p-8 shadow-2xl"
              style={{ background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.12)' }}>

              {/* Logo */}
              <div className="text-center mb-8">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2, type: 'spring' }}
                  className="w-20 h-20 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg"
                  style={{ background: 'linear-gradient(135deg, #1CB0F6, #0A90D4)' }}>
                  <span className="font-chinese-serif text-white text-3xl font-bold">汉</span>
                </motion.div>
                <h1 className="text-2xl font-bold text-white mb-1">穆安 — مُضَّن</h1>
                <p className="text-sm text-blue-200">منصة تعلم اللغة الصينية HSK 1</p>
              </div>

              {/* Buttons */}
              <div className="space-y-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => { setView('login'); setError('') }}
                  className="w-full py-3 rounded-xl font-bold text-white flex items-center justify-center gap-3 text-sm transition-all shadow-lg"
                  style={{ background: 'linear-gradient(135deg, #1CB0F6, #0A90D4)' }}>
                  <LogIn className="w-5 h-5" />
                  سجّل الدخول
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => { setView('register'); setError('') }}
                  className="w-full py-3 rounded-xl font-bold text-white flex items-center justify-center gap-3 text-sm transition-all shadow-lg"
                  style={{ background: 'linear-gradient(135deg, #58CC02, #46a302)' }}>
                  <UserPlus className="w-5 h-5" />
                  أنشئ حساباً جديداً
                </motion.button>

                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-white/20" />
                  </div>
                  <div className="relative flex justify-center">
                    <span className="px-3 text-xs text-blue-200 bg-transparent">أو</span>
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02, backgroundColor: 'rgba(255,255,255,0.15)' }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleGuest}
                  className="w-full py-3 rounded-xl font-medium text-white flex items-center justify-center gap-3 text-sm transition-all"
                  style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.2)' }}>
                  <span className="text-lg">👋</span>
                  ادخل كزائر
                </motion.button>
              </div>

              <p className="text-center text-xs text-blue-300/60 mt-6">
                410 كلمة • 26 قاعدة • 15 درس • 7 قصص
              </p>
            </div>
          </motion.div>
        )}

        {(view === 'login' || view === 'register') && (
          <motion.div
            key={view}
            initial={{ opacity: 0, x: view === 'login' ? -30 : 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: view === 'login' ? 30 : -30 }}
            transition={{ duration: 0.3 }}
            className="relative z-10 w-full max-w-sm"
          >
            <div className="rounded-2xl p-8 shadow-2xl"
              style={{ background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.12)' }}>

              {/* Back button */}
              <button
                onClick={() => { setView('main'); setError('') }}
                className="flex items-center gap-1 text-blue-200 text-sm mb-6 hover:text-white transition-colors">
                <ArrowLeft className="w-4 h-4" />
                رجوع
              </button>

              {/* Title */}
              <div className="text-center mb-6">
                <div className="w-14 h-14 rounded-xl mx-auto mb-3 flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg, #1CB0F6, #0A90D4)' }}>
                  {view === 'login' ? <LogIn className="w-6 h-6 text-white" /> : <UserPlus className="w-6 h-6 text-white" />}
                </div>
                <h2 className="text-xl font-bold text-white">
                  {view === 'login' ? 'تسجيل الدخول' : 'إنشاء حساب جديد'}
                </h2>
                <p className="text-xs text-blue-200 mt-1">
                  {view === 'login' ? 'أدخل بياناتك للمتابعة' : 'أنشئ حسابك وابدأ التعلم'}
                </p>
              </div>

              {/* Form */}
              <div className="space-y-4">
                {/* Name */}
                <div>
                  <label className="block text-sm text-blue-200 mb-1.5">الاسم</label>
                  <div className="relative">
                    <User className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-300/50" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="أدخل اسمك..."
                      className="w-full pr-10 pl-4 py-2.5 rounded-xl text-sm text-white placeholder-blue-300/40 outline-none transition-all focus:ring-2 focus:ring-blue-400/50"
                      style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)' }}
                      onKeyDown={(e) => e.key === 'Enter' && (view === 'login' ? handleLogin() : handleRegister())}
                    />
                  </div>
                </div>

                {/* Email (register only) */}
                {view === 'register' && (
                  <div>
                    <label className="block text-sm text-blue-200 mb-1.5">البريد الإلكتروني (اختياري)</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="example@mail.com"
                      className="w-full px-4 py-2.5 rounded-xl text-sm text-white placeholder-blue-300/40 outline-none transition-all focus:ring-2 focus:ring-blue-400/50"
                      style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)' }}
                      dir="ltr"
                    />
                  </div>
                )}

                {/* Password */}
                <div>
                  <label className="block text-sm text-blue-200 mb-1.5">كلمة المرور</label>
                  <div className="relative">
                    <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-300/50" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••"
                      className="w-full pr-10 pl-10 py-2.5 rounded-xl text-sm text-white placeholder-blue-300/40 outline-none transition-all focus:ring-2 focus:ring-blue-400/50"
                      style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)' }}
                      dir="ltr"
                      onKeyDown={(e) => e.key === 'Enter' && (view === 'login' ? handleLogin() : handleRegister())}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-300/50 hover:text-blue-200 transition-colors">
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Error */}
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 rounded-xl text-sm text-red-300 text-center"
                    style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)' }}>
                    {error}
                  </motion.div>
                )}

                {/* Submit */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={view === 'login' ? handleLogin : handleRegister}
                  disabled={isLoading}
                  className="w-full py-3 rounded-xl font-bold text-white flex items-center justify-center gap-2 text-sm transition-all shadow-lg disabled:opacity-60"
                  style={{ background: view === 'login' ? 'linear-gradient(135deg, #1CB0F6, #0A90D4)' : 'linear-gradient(135deg, #58CC02, #46a302)' }}>
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      {view === 'login' ? <LogIn className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
                      {view === 'login' ? 'دخول' : 'إنشاء الحساب'}
                    </>
                  )}
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
