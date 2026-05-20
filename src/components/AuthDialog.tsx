'use client'

import React, { useState } from 'react'
import { signIn } from 'next-auth/react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { LogIn, UserPlus, Loader2, Eye, EyeOff, Mail, Lock, User } from 'lucide-react'

interface AuthDialogProps {
  open: boolean
  onOpenChange: (v: boolean) => void
  onLoginSuccess?: () => void
}

export default function AuthDialog({ open, onOpenChange, onLoginSuccess }: AuthDialogProps) {
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [registerName, setRegisterName] = useState('')
  const [registerEmail, setRegisterEmail] = useState('')
  const [registerPassword, setRegisterPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Clear error when switching tabs
  const handleTabChange = (value: string) => {
    setError('')
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!loginEmail.trim() || !loginPassword.trim()) {
      setError('يرجى إدخال البريد الإلكتروني وكلمة المرور')
      return
    }

    setLoading(true)
    try {
      const result = await signIn('credentials', {
        email: loginEmail.trim().toLowerCase(),
        password: loginPassword,
        redirect: false,
      })

      if (result?.error) {
        setError('البريد الإلكتروني أو كلمة المرور غير صحيحة')
      } else {
        onOpenChange(false)
        onLoginSuccess?.()
      }
    } catch {
      setError('حدث خطأ في الاتصال، حاول مرة أخرى')
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!registerName.trim()) {
      setError('يرجى إدخال الاسم')
      return
    }

    if (!registerEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(registerEmail)) {
      setError('يرجى إدخال بريد إلكتروني صحيح')
      return
    }

    if (registerPassword.length < 6) {
      setError('كلمة المرور يجب أن تكون 6 أحرف على الأقل')
      return
    }

    setLoading(true)
    try {
      // Step 1: Register
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: registerEmail.trim().toLowerCase(),
          name: registerName.trim(),
          password: registerPassword,
        }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        if (res.status === 409) {
          setError('يوجد حساب بالفعل بهذا البريد الإلكتروني')
        } else {
          setError((data as { error?: string }).error || 'فشل في إنشاء الحساب')
        }
        return
      }

      // Step 2: Auto-login
      const result = await signIn('credentials', {
        email: registerEmail.trim().toLowerCase(),
        password: registerPassword,
        redirect: false,
      })

      if (result?.error) {
        // Registration succeeded but login failed
        setError('تم إنشاء الحساب بنجاح! يرجى تسجيل الدخول.')
      } else {
        onOpenChange(false)
        onLoginSuccess?.()
      }
    } catch {
      setError('حدث خطأ في الاتصال، حاول مرة أخرى')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!loading) onOpenChange(v) }}>
      <DialogContent className="sm:max-w-md" dir="rtl">
        <DialogHeader className="text-center">
          <DialogTitle className="text-2xl font-bold flex items-center justify-center gap-2">
            <span className="font-chinese-serif text-3xl text-red-600">汉</span>
            مُضَّن
          </DialogTitle>
          <p className="text-gray-500 text-sm">تعلّم الصينية بذكاء</p>
        </DialogHeader>

        {error && (
          <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg text-center">
            {error}
          </div>
        )}

        <Tabs defaultValue="login" dir="rtl" onValueChange={handleTabChange}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login" className="gap-1">
              <LogIn className="w-4 h-4" />
              تسجيل الدخول
            </TabsTrigger>
            <TabsTrigger value="register" className="gap-1">
              <UserPlus className="w-4 h-4" />
              حساب جديد
            </TabsTrigger>
          </TabsList>

          <TabsContent value="login">
            <form onSubmit={handleLogin} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="login-email" className="text-sm">البريد الإلكتروني</Label>
                <div className="relative">
                  <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="example@email.com"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className="pr-10"
                    required
                    dir="ltr"
                    autoComplete="email"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="login-password" className="text-sm">كلمة المرور</Label>
                <div className="relative">
                  <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="pr-10 pl-10"
                    required
                    dir="ltr"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <Button type="submit" className="w-full bg-red-600 hover:bg-red-700" disabled={loading}>
                {loading ? <Loader2 className="w-4 h-4 animate-spin ml-2" /> : <LogIn className="w-4 h-4 ml-2" />}
                تسجيل الدخول
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="register">
            <form onSubmit={handleRegister} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="reg-name" className="text-sm">الاسم</Label>
                <div className="relative">
                  <User className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="reg-name"
                    placeholder="اسمك"
                    value={registerName}
                    onChange={(e) => setRegisterName(e.target.value)}
                    className="pr-10"
                    required
                    autoComplete="name"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="reg-email" className="text-sm">البريد الإلكتروني</Label>
                <div className="relative">
                  <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="reg-email"
                    type="email"
                    placeholder="example@email.com"
                    value={registerEmail}
                    onChange={(e) => setRegisterEmail(e.target.value)}
                    className="pr-10"
                    required
                    dir="ltr"
                    autoComplete="email"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="reg-password" className="text-sm">كلمة المرور (6 أحرف على الأقل)</Label>
                <div className="relative">
                  <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="reg-password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••"
                    value={registerPassword}
                    onChange={(e) => setRegisterPassword(e.target.value)}
                    className="pr-10 pl-10"
                    required
                    minLength={6}
                    dir="ltr"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <Button type="submit" className="w-full bg-red-600 hover:bg-red-700" disabled={loading}>
                {loading ? <Loader2 className="w-4 h-4 animate-spin ml-2" /> : <UserPlus className="w-4 h-4 ml-2" />}
                إنشاء حساب
              </Button>
            </form>
          </TabsContent>
        </Tabs>

        <p className="text-xs text-gray-400 text-center mt-2">
          بإنشاء حساب، يتم حفظ تقدمك تلقائياً ومزامنته عبر الأجهزة
        </p>
      </DialogContent>
    </Dialog>
  )
}
