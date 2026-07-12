'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, ArrowRight, Sparkles, Target } from 'lucide-react'
import { useLearningStore, type UserProfile } from '@/lib/store'
import { useI18n } from '@/lib/i18n'

const AVATARS = ['🐼', '🐉', '🦊', '🐱', '🦁', '🐧', '🦉', '🐢', '🌸', '⭐', '🎋', '🏮']
const GOALS = [
  { value: 5, label: '٥ كلمات', labelEn: '5 words', desc: 'خفيف — 10 دقائق يومياً', descEn: 'Light — 10 min/day' },
  { value: 10, label: '١٠ كلمات', labelEn: '10 words', desc: 'متوازن — 20 دقيقة يومياً', descEn: 'Balanced — 20 min/day' },
  { value: 15, label: '١٥ كلمة', labelEn: '15 words', desc: 'جاد — 30 دقيقة يومياً', descEn: 'Serious — 30 min/day' },
  { value: 20, label: '٢٠ كلمة', labelEn: '20 words', desc: 'مكثف — 45 دقيقة يومياً', descEn: 'Intense — 45 min/day' },
]

export default function OnboardingScreen() {
  const setProfile = useLearningStore((s) => s.setProfile)
  const { t, dir, lang, setLang } = useI18n()
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
    try {
      localStorage.removeItem('jisr_currentUser')
      localStorage.removeItem('mudann_currentUser')
      localStorage.removeItem('mudann_users')
    } catch {}
  }

  const Forward = dir === 'rtl' ? ArrowLeft : ArrowRight

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      dir={dir}
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
        {/* مبدّل اللغة */}
        <div className="flex justify-center mb-5">
          <div className="flex items-center rounded-full bg-white/10 border border-white/15 p-0.5">
            {([['ar', 'العربية'], ['en', 'English']] as const).map(([lg, lbl]) => (
              <button
                key={lg}
                onClick={() => setLang(lg)}
                className={
                  'px-4 py-1.5 rounded-full text-xs font-bold transition-all ' +
                  (lang === lg ? 'bg-gradient-to-r from-violet-500 to-fuchsia-600 text-white shadow' : 'text-white/50 hover:text-white')
                }
              >
                {lbl}
              </button>
            ))}
          </div>
        </div>

        {/* الشعار */}
        <div className="text-center mb-8">
          <div className="mx-auto mb-3 w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-600 flex items-center justify-center shadow-lg shadow-violet-500/30">
            <span className="text-3xl font-bold text-white">桥</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white">{t('جِسر', 'JISR')}</h1>
          <p className="text-sm text-white/50 mt-1">{t('جسرك إلى اللغة الصينية — HSK 1', 'Your bridge to Chinese — HSK 1')}</p>
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
                <label className="flex items-center gap-1.5 text-sm font-bold text-white/80 mb-2">
                  <Sparkles className="w-4 h-4 text-fuchsia-300" />
                  {t('ما اسمك؟', 'What is your name?')}
                </label>
                <input
                  value={name}
                  onChange={(e) => { setName(e.target.value); setError('') }}
                  onKeyDown={(e) => e.key === 'Enter' && (name.trim() ? setStep(1) : setError(t('يرجى إدخال اسمك', 'Please enter your name')))}
                  placeholder={t('اكتب اسمك هنا...', 'Type your name here...')}
                  className="w-full rounded-xl bg-white/10 border border-white/15 px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-400/30 transition-all"
                  autoFocus
                />
                {error && <p className="text-xs text-red-300 mt-2">{error}</p>}
              </div>

              <div>
                <label className="block text-sm font-bold text-white/80 mb-3">{t('اختر رفيق رحلتك:', 'Choose your journey buddy:')}</label>
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
                onClick={() => (name.trim() ? setStep(1) : setError(t('يرجى إدخال اسمك', 'Please enter your name')))}
                className="w-full rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 py-3.5 font-bold text-white shadow-lg shadow-violet-500/25 hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              >
                {t('متابعة', 'Continue')}
                <Forward className="w-4 h-4" />
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
                <h2 className="text-lg font-bold text-white">{t('أهلاً', 'Hi')} {name.trim()}! 👋</h2>
                <p className="flex items-center justify-center gap-1.5 text-sm text-white/50 mt-1">
                  <Target className="w-4 h-4" />
                  {t('كم كلمة جديدة تريد أن تتعلم يومياً؟', 'How many new words per day?')}
                </p>
              </div>

              <div className="space-y-2.5">
                {GOALS.map((g) => (
                  <button
                    key={g.value}
                    onClick={() => finish(g.value)}
                    className="w-full rounded-xl bg-white/8 border border-white/10 px-4 py-3 hover:bg-gradient-to-r hover:from-violet-600/40 hover:to-fuchsia-600/40 hover:border-violet-400/40 active:scale-[0.98] transition-all group"
                    style={{ textAlign: dir === 'rtl' ? 'right' : 'left' }}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white">{t(g.label, g.labelEn)} {t('يومياً', '/ day')}</span>
                      <span className="text-xs text-white/40 group-hover:text-white/70">{t(g.desc, g.descEn)}</span>
                    </div>
                  </button>
                ))}
              </div>

              <button onClick={() => setStep(0)} className="w-full text-center text-xs text-white/40 hover:text-white/70 transition-colors">
                {dir === 'rtl' ? '→ ' : '← '}{t('رجوع', 'Back')}
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <p className="text-center text-[10px] text-white/25 mt-6">
          {t('تقدمك يُحفظ على هذا الجهاز — يمكنك تصديره من الإعدادات في أي وقت', 'Your progress is saved on this device — you can export it from Settings anytime')}
        </p>
      </motion.div>
    </div>
  )
}
