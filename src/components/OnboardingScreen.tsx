'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, ArrowRight, Sparkles, Target } from 'lucide-react'
import { useLearningStore, type UserProfile } from '@/lib/store'
import { useI18n } from '@/lib/i18n'

const AVATARS = ['🐼', '🐉', '🦊', '🐱', '🦁', '🐧', '🦉', '🐢', '🌸', '⭐', '🎋', '🏮']
const GOALS = [
  { value: 5, emoji: '🌱', label: '٥ كلمات', labelEn: '5 words', desc: 'خفيف — 10 دقائق يومياً', descEn: 'Light — 10 min/day' },
  { value: 10, emoji: '🌿', label: '١٠ كلمات', labelEn: '10 words', desc: 'متوازن — 20 دقيقة يومياً', descEn: 'Balanced — 20 min/day' },
  { value: 15, emoji: '🌳', label: '١٥ كلمة', labelEn: '15 words', desc: 'جاد — 30 دقيقة يومياً', descEn: 'Serious — 30 min/day' },
  { value: 20, emoji: '🔥', label: '٢٠ كلمة', labelEn: '20 words', desc: 'مكثف — 45 دقيقة يومياً', descEn: 'Intense — 45 min/day' },
]
const FLOATING_HANZI = [
  { ch: '桥', top: '8%', left: '6%', size: 90, delay: 0 },
  { ch: '学', top: '70%', left: '10%', size: 64, delay: 1.2 },
  { ch: '你', top: '15%', left: '82%', size: 70, delay: 0.6 },
  { ch: '好', top: '75%', left: '85%', size: 84, delay: 1.8 },
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
      className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      dir={dir}
      style={{ background: 'linear-gradient(150deg, #150d24 0%, #221238 35%, #3b1a63 70%, #6d28d9 130%)' }}
    >
      {/* خلفية حيّة: هالات متدرجة + حروف عائمة */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute -top-24 -right-24 w-[28rem] h-[28rem] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(167,139,250,0.28), transparent 65%)', filter: 'blur(10px)' }}
          animate={{ scale: [1, 1.15, 1], opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute -bottom-32 -left-24 w-[32rem] h-[32rem] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(232,121,249,0.22), transparent 65%)', filter: 'blur(12px)' }}
          animate={{ scale: [1.1, 1, 1.1], opacity: [0.8, 0.55, 0.8] }}
          transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[24rem] h-[24rem] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(251,146,60,0.10), transparent 60%)', filter: 'blur(14px)' }}
          animate={{ y: [0, -18, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
        />
        {FLOATING_HANZI.map((h) => (
          <motion.span
            key={h.ch}
            className="absolute select-none font-bold text-white"
            style={{ top: h.top, left: h.left, fontSize: h.size, opacity: 0.05 }}
            animate={{ y: [0, -14, 0], rotate: [0, 3, 0] }}
            transition={{ duration: 8, delay: h.delay, repeat: Infinity, ease: 'easeInOut' }}
          >
            {h.ch}
          </motion.span>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 28, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full max-w-md rounded-[1.75rem] p-8 border border-white/12"
        style={{ background: 'rgba(255,255,255,0.055)', backdropFilter: 'blur(24px)', boxShadow: '0 24px 80px -16px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.08)' }}
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
                  (lang === lg ? 'bg-gradient-to-r from-violet-500 to-fuchsia-600 text-white shadow-lg shadow-fuchsia-500/25' : 'text-white/50 hover:text-white')
                }
              >
                {lbl}
              </button>
            ))}
          </div>
        </div>

        {/* الشعار */}
        <div className="text-center mb-6">
          <motion.div
            className="mx-auto mb-3 w-[4.5rem] h-[4.5rem] rounded-2xl bg-gradient-to-br from-violet-500 via-fuchsia-500 to-orange-400 p-[2px] shadow-lg shadow-fuchsia-500/30"
            animate={{ boxShadow: ['0 8px 32px -6px rgba(217,70,239,0.35)', '0 8px 44px -4px rgba(167,139,250,0.55)', '0 8px 32px -6px rgba(217,70,239,0.35)'] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          >
            <div className="w-full h-full rounded-2xl bg-[#1c1130]/90 flex items-center justify-center">
              <span className="text-3xl font-bold text-white">桥</span>
            </div>
          </motion.div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">{t('جِسر', 'JISR')}</h1>
          <p className="text-sm text-white/50 mt-1">{t('جسرك إلى اللغة الصينية', 'Your bridge to Chinese')}</p>
        </div>

        {/* مؤشر الخطوات */}
        <div className="flex items-center justify-center gap-2 mb-6">
          {[0, 1].map((i) => (
            <motion.span
              key={i}
              className="h-1.5 rounded-full"
              animate={{ width: step === i ? 28 : 8, backgroundColor: step === i ? '#e879f9' : 'rgba(255,255,255,0.2)' }}
              transition={{ duration: 0.3 }}
            />
          ))}
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
                  className="w-full rounded-xl bg-white/10 border border-white/15 px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-fuchsia-400 focus:ring-2 focus:ring-fuchsia-400/30 transition-all"
                  autoFocus
                />
                {error && <p className="text-xs text-red-300 mt-2">{error}</p>}
              </div>

              <div>
                <label className="block text-sm font-bold text-white/80 mb-3">{t('اختر رفيق رحلتك:', 'Choose your journey buddy:')}</label>
                <div className="grid grid-cols-6 gap-2">
                  {AVATARS.map((a) => (
                    <motion.button
                      key={a}
                      onClick={() => setAvatar(a)}
                      whileHover={{ scale: 1.12 }}
                      whileTap={{ scale: 0.94 }}
                      className={
                        'aspect-square rounded-xl text-2xl flex items-center justify-center transition-colors ' +
                        (avatar === a
                          ? 'bg-gradient-to-br from-violet-500 to-fuchsia-600 ring-2 ring-fuchsia-300/60 shadow-lg shadow-fuchsia-500/40'
                          : 'bg-white/8 hover:bg-white/15')
                      }
                    >
                      {a}
                    </motion.button>
                  ))}
                </div>
              </div>

              <motion.button
                onClick={() => (name.trim() ? setStep(1) : setError(t('يرجى إدخال اسمك', 'Please enter your name')))}
                whileHover={{ scale: 1.015 }}
                whileTap={{ scale: 0.985 }}
                className="w-full rounded-xl bg-gradient-to-r from-violet-600 via-fuchsia-600 to-fuchsia-500 py-3.5 font-bold text-white shadow-lg shadow-fuchsia-500/30 hover:brightness-110 transition-all flex items-center justify-center gap-2"
              >
                {t('متابعة', 'Continue')}
                <Forward className="w-4 h-4" />
              </motion.button>
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
                <motion.div className="text-5xl mb-2" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 260, damping: 16 }}>
                  {avatar}
                </motion.div>
                <h2 className="text-lg font-bold text-white">{t('أهلاً', 'Hi')} {name.trim()}! 👋</h2>
                <p className="flex items-center justify-center gap-1.5 text-sm text-white/50 mt-1">
                  <Target className="w-4 h-4" />
                  {t('كم كلمة جديدة تريد أن تتعلم يومياً؟', 'How many new words per day?')}
                </p>
              </div>

              <div className="space-y-2.5">
                {GOALS.map((g, i) => (
                  <motion.button
                    key={g.value}
                    onClick={() => finish(g.value)}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.06 * i }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full rounded-xl bg-white/8 border border-white/10 px-4 py-3 hover:bg-gradient-to-r hover:from-violet-600/40 hover:to-fuchsia-600/40 hover:border-fuchsia-400/40 transition-colors group"
                    style={{ textAlign: dir === 'rtl' ? 'right' : 'left' }}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="flex items-center gap-2.5 font-bold text-white">
                        <span className="text-xl">{g.emoji}</span>
                        {t(g.label, g.labelEn)} {t('يومياً', '/ day')}
                      </span>
                      <span className="text-xs text-white/40 group-hover:text-white/70">{t(g.desc, g.descEn)}</span>
                    </div>
                  </motion.button>
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
