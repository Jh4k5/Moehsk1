'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Sparkles, Target } from 'lucide-react'
import { useLearningStore, type UserProfile } from '@/lib/store'

const AVATARS = ['🐼', '🐉', '🦊', '🐱', '🦁', '🐧', '🦉', '🐢', '🌸', '⭐', '🎋', '🏮']
const GOALS = [
  { value: 5, label: '٥ كلمات', desc: 'خفيف — 10 دقائق يومياً' },
  { value: 10, label: '١٠ كلمات', desc: 'متوازن — 20 دقيقة يومياً' },
  { value: 15, label: '١٥ كلمة', desc: 'جاد — 30 دقيقة يومياً' },
  { value: 20, label: '٢٠ كلمة', desc: 'مكثف — 45 دقيقة يومياً' },
]

export default function OnboardingScreen() {
  const setProfile = useLearningStore((s) => s.setProfile)
  const [step, setStep] = useState(0)
  const [name, setName] = useState('')
  const [avatar, setAvatar] = useState('🐼')
  const [error, setError] = useState('')

  const finish = (dailyGoal: number) => {
    const profile: UserProfile = {
      name: name.trim(),
      avatarEmoji: avatar,
      dailyGoal,
      createdAt: new Date().toISOString(),
    }
    setProfile(profile)
    // تنظيف مفاتيح النظام القديم
    try {
      localStorage.removeItem('jisr_currentUser')
      localStorage.removeItem('mudann_currentUser')
      localStorage.removeItem('mudann_users')
    } catch {}
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      dir="rtl"
      style={{ background: 'linear-gradient(135deg, #17111f 0%, #1e1430 40%, #2a1a4a 75%, #7c3aed 160%)' }}
    >
      {/* عناصر زخرفية */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-16 right-16 w-72 h-72 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #a78bfa, transparent)' }} />
        <div className="absolute bottom-16 left-16 w-96 h-96 rounded-full opacity-[0.06]"
          style={{ background: 'radial-gradient(circle, #e879f9, transparent)' }} />
        <div className="absolute top-1/3 left-1/4 text-[180px] opacity-[0.04] font-bold select-none">桥</div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full max-w-md rounded-3xl p-8 shadow-2xl border border-white/10"
        style={{ background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(20px)' }}
      >
        {/* الشعار */}
        <div className="text-center mb-8">
          <div className="mx-auto mb-3 w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-600 flex items-center justify-center shadow-lg shadow-violet-500/30">
            <span className="text-3xl font-bold text-white">桥</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white">جِسر</h1>
          <p className="text-sm text-white/50 mt-1">جسرك إلى اللغة الصينية — HSK 1</p>
        </div>

        <AnimatePresence mode="wait">
          {step === 0 ? (
            <motion.div
              key="step-name"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-6"
            >
              <div>
                <label className="block text-sm font-bold text-white/80 mb-2">
                  <Sparkles className="inline w-4 h-4 ml-1 text-fuchsia-300" />
                  ما اسمك؟
                </label>
                <input
                  value={name}
                  onChange={(e) => { setName(e.target.value); setError('') }}
                  onKeyDown={(e) => e.key === 'Enter' && (name.trim() ? setStep(1) : setError('يرجى إدخال اسمك'))}
                  placeholder="اكتب اسمك هنا..."
                  className="w-full rounded-xl bg-white/10 border border-white/15 px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-400/30 transition-all"
                  autoFocus
                />
                {error && <p className="text-xs text-red-300 mt-2">{error}</p>}
              </div>

              <div>
                <label className="block text-sm font-bold text-white/80 mb-3">اختر رفيق رحلتك:</label>
                <div className="grid grid-cols-6 gap-2">
                  {AVATARS.map((a) => (
                    <button
                      key={a}
                      onClick={() => setAvatar(a)}
                      className={
                        'aspect-square rounded-xl text-2xl flex items-center justify-center transition-all ' +
                        (avatar === a
                          ? 'bg-gradient-to-br from-violet-500 to-fuchsia-600 scale-110 shadow-lg shadow-violet-500/40'
                          : 'bg-white/8 hover:bg-white/15 hover:scale-105')
                      }
                    >
                      {a}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={() => (name.trim() ? setStep(1) : setError('يرجى إدخال اسمك'))}
                className="w-full rounded-xl bg-gradient-to-l from-violet-600 to-fuchsia-600 py-3.5 font-bold text-white shadow-lg shadow-violet-500/25 hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              >
                متابعة
                <ArrowLeft className="w-4 h-4" />
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="step-goal"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-5"
            >
              <div className="text-center">
                <div className="text-4xl mb-2">{avatar}</div>
                <h2 className="text-lg font-bold text-white">أهلاً {name.trim()}! 👋</h2>
                <p className="text-sm text-white/50 mt-1">
                  <Target className="inline w-4 h-4 ml-1" />
                  كم كلمة جديدة تريد أن تتعلم يومياً؟
                </p>
              </div>

              <div className="space-y-2.5">
                {GOALS.map((g) => (
                  <button
                    key={g.value}
                    onClick={() => finish(g.value)}
                    className="w-full rounded-xl bg-white/8 border border-white/10 px-4 py-3 text-right hover:bg-gradient-to-l hover:from-violet-600/40 hover:to-fuchsia-600/40 hover:border-violet-400/40 active:scale-[0.98] transition-all group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white">{g.label} يومياً</span>
                      <span className="text-xs text-white/40 group-hover:text-white/70">{g.desc}</span>
                    </div>
                  </button>
                ))}
              </div>

              <button onClick={() => setStep(0)} className="w-full text-center text-xs text-white/40 hover:text-white/70 transition-colors">
                → رجوع
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <p className="text-center text-[10px] text-white/25 mt-6">
          تقدمك يُحفظ على هذا الجهاز — يمكنك تصديره من الإعدادات في أي وقت
        </p>
      </motion.div>
    </div>
  )
}
