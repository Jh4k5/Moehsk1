'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { ArrowLeft, ArrowRight, GraduationCap, LogIn, Sparkles, Target } from 'lucide-react'
import { useLearningStore, type UserProfile } from '@/lib/store'
import { useI18n } from '@/lib/i18n'
import { Logo } from '@/components/brand/Logo'

const AVATARS = ['🐼', '🐉', '🦊', '🐱', '🦁', '🐧', '🦉', '🐢', '🌸', '⭐', '🎋', '🏮']
const GOALS = [
  { value: 5, emoji: '🌱', label: '٥ كلمات', labelEn: '5 words', desc: 'خفيف — 10 دقائق يومياً', descEn: 'Light — 10 min/day' },
  { value: 10, emoji: '🌿', label: '١٠ كلمات', labelEn: '10 words', desc: 'متوازن — 20 دقيقة يومياً', descEn: 'Balanced — 20 min/day' },
  { value: 15, emoji: '🌳', label: '١٥ كلمة', labelEn: '15 words', desc: 'جاد — 30 دقيقة يومياً', descEn: 'Serious — 30 min/day' },
  { value: 20, emoji: '🔥', label: '٢٠ كلمة', labelEn: '20 words', desc: 'مكثف — 45 دقيقة يومياً', descEn: 'Intense — 45 min/day' },
]
// The owner's first requirement, and the one the platform shipped without:
// «يستطيع أي أحد أن يختار مستوى عندما يقوم بتسجيل الدخول ليبدأ به مباشرة».
// Onboarding used to be name → daily goal, and set `currentLevel: 1` for
// everyone. A learner already at HSK2 was marched back to «你好», and the two
// free lessons they were promised were lessons of a level they had finished.
//
// Level is now the FIRST question, because it decides which path they land on
// and which lessons open — everything after it is preference.
const LEVELS = [
  { value: 1 as const, zh: '一', label: 'HSK 1', ar: 'مبتدئ — أبدأ من الصفر', en: 'Beginner — starting from zero',
    hintAr: 'التحيات، التعارف، العائلة، الأرقام', hintEn: 'Greetings, introductions, family, numbers' },
  { value: 2 as const, zh: '二', label: 'HSK 2', ar: 'ابتدائي — أعرف الأساسيات', en: 'Elementary — I know the basics',
    hintAr: 'التسوق، المواصلات، الطعام، المواعيد', hintEn: 'Shopping, transport, food, appointments' },
  { value: 3 as const, zh: '三', label: 'HSK 3', ar: 'متوسط — أكوّن جملاً كاملة', en: 'Intermediate — I form full sentences',
    hintAr: 'الرأي والسبب والمقارنة، الدراسة والعمل', hintEn: 'Opinion, reason, comparison, study and work' },
]

const FLOATING_HANZI = [
  { ch: '桥', top: '8%', left: '6%', size: 90, delay: 0 },
  { ch: '学', top: '70%', left: '10%', size: 64, delay: 1.2 },
  { ch: '你', top: '15%', left: '82%', size: 70, delay: 0.6 },
  { ch: '好', top: '75%', left: '85%', size: 84, delay: 1.8 },
]

export default function OnboardingScreen() {
  const setProfile = useLearningStore((s) => s.setProfile)
  const setLevel = useLearningStore((s) => s.setLevel)
  const { t, dir, lang, setLang } = useI18n()
  const [step, setStep] = useState(0)
  const [level, setChosenLevel] = useState<1 | 2 | 3 | null>(null)
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
    // The level goes in before the profile: `HomeSection` reads it on its very
    // first render, and writing it second showed HSK1 for one frame to someone
    // who had just chosen HSK3.
    if (level) setLevel(level)
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
      style={{ background: 'linear-gradient(150deg, #08101C 0%, #0C1626 40%, #16294A 75%, #1B3A6B 120%)' }}
    >
      {/* خلفية حيّة: هالات متدرجة + حروف عائمة */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute -top-24 -right-24 w-[28rem] h-[28rem] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(212,175,55,0.22), transparent 65%)', filter: 'blur(10px)' }}
          animate={{ scale: [1, 1.15, 1], opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute -bottom-32 -left-24 w-[32rem] h-[32rem] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(200,16,46,0.20), transparent 65%)', filter: 'blur(12px)' }}
          animate={{ scale: [1.1, 1, 1.1], opacity: [0.8, 0.55, 0.8] }}
          transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[24rem] h-[24rem] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(62,109,181,0.16), transparent 60%)', filter: 'blur(14px)' }}
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
                  (lang === lg ? 'bg-gradient-to-r from-[var(--navy-600)] to-[var(--navy-500)] text-white shadow-lg shadow-[var(--navy-600)]/30' : 'text-white/50 hover:text-white')
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
            className="mx-auto mb-3 w-[4.5rem] h-[4.5rem] rounded-2xl bg-gradient-to-br from-[var(--gold-500)] via-[var(--red-500)] to-[var(--navy-500)] p-[2px] shadow-lg shadow-[var(--red-500)]/30"
            animate={{ boxShadow: ['0 8px 32px -6px rgba(200,16,46,0.30)', '0 8px 44px -4px rgba(212,175,55,0.45)', '0 8px 32px -6px rgba(200,16,46,0.30)'] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          >
            <div className="w-full h-full rounded-2xl bg-[#1c1130]/90 flex items-center justify-center">
              <Logo variant="icon-white" size={44} />
            </div>
          </motion.div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">{t('جسر إلى الصين', 'Bridge to China')}</h1>
          <p className="text-sm text-white/50 mt-1">{t('جسرك إلى اللغة الصينية', 'Your bridge to Chinese')}</p>
        </div>

        {/* مؤشر الخطوات */}
        <div className="flex items-center justify-center gap-2 mb-6">
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              className="h-1.5 rounded-full"
              animate={{ width: step === i ? 28 : 8, backgroundColor: step === i ? 'var(--brand-gold)' : 'rgba(247,244,239,0.22)' }}
              transition={{ duration: 0.3 }}
            />
          ))}
        </div>

        <AnimatePresence mode="wait">
          {step === 0 ? (
            <motion.div
              key="step-level"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-4"
            >
              <div>
                <label className="flex items-center gap-1.5 text-sm font-bold text-white/80 mb-1">
                  <GraduationCap className="w-4 h-4 text-[var(--brand-gold)]" />
                  {t('ما مستواك في الصينية؟', 'What is your level in Chinese?')}
                </label>
                <p className="text-xs text-white/45 leading-relaxed">
                  {t(
                    'ستبدأ من هذا المستوى مباشرةً، وأول درسين فيه مفتوحان لك مجاناً. تستطيع تغييره متى شئت.',
                    'You will start at this level directly, and its first two lessons are free. You can change it any time.',
                  )}
                </p>
              </div>

              <div className="space-y-2.5">
                {LEVELS.map((lv) => {
                  const active = level === lv.value
                  return (
                    <button
                      key={lv.value}
                      type="button"
                      onClick={() => { setChosenLevel(lv.value); setError(''); setStep(1) }}
                      className={
                        'w-full flex items-center gap-3 rounded-2xl border p-3.5 text-start transition-all ' +
                        (active
                          ? 'border-[var(--brand-gold)] bg-[var(--brand-gold)]/10'
                          : 'border-white/12 bg-white/[0.04] hover:border-white/25 hover:bg-white/[0.07]')
                      }
                    >
                      <span
                        className="grid h-11 w-11 flex-none place-items-center rounded-xl text-xl font-bold text-[var(--brand-gold)]"
                        style={{ background: 'rgba(212,175,55,0.12)' }}
                        aria-hidden
                      >
                        {lv.zh}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-extrabold text-white">{lv.label}</span>
                        <span className="block text-xs text-white/70">{t(lv.ar, lv.en)}</span>
                        <span className="mt-0.5 block truncate text-[11px] text-white/40">{t(lv.hintAr, lv.hintEn)}</span>
                      </span>
                      <Forward className="w-4 h-4 flex-none text-white/30" />
                    </button>
                  )
                })}
              </div>

              {/* Sign-in was fully built and linked from nowhere a learner
                  would look. Offering it HERE, at the moment someone is
                  deciding to begin, is the difference between a browser that
                  forgets them and an account that carries their progress. */}
              <Link
                href={`/${lang === 'en' ? 'en' : 'ar'}/sign-in`}
                className="mt-1 flex items-center justify-center gap-1.5 rounded-xl border border-white/10 py-2.5 text-xs text-white/55 transition-colors hover:border-white/25 hover:text-white/80"
              >
                <LogIn className="w-3.5 h-3.5" />
                {t('لديّ حساب بالفعل — تسجيل الدخول', 'I already have an account — sign in')}
              </Link>
            </motion.div>
          ) : step === 1 ? (
            <motion.div
              key="step-name"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-6"
            >
              <div>
                <label className="flex items-center gap-1.5 text-sm font-bold text-white/80 mb-2">
                  <Sparkles className="w-4 h-4 text-[var(--red-300)]" />
                  {t('ما اسمك؟', 'What is your name?')}
                </label>
                <input
                  value={name}
                  onChange={(e) => { setName(e.target.value); setError('') }}
                  onKeyDown={(e) => e.key === 'Enter' && (name.trim() ? setStep(2) : setError(t('يرجى إدخال اسمك', 'Please enter your name')))}
                  placeholder={t('اكتب اسمك هنا...', 'Type your name here...')}
                  className="w-full rounded-xl bg-white/10 border border-white/15 px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-[var(--gold-500)] focus:ring-2 focus:ring-[var(--gold-500)]/35 transition-all"
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
                          ? 'bg-gradient-to-br from-[var(--navy-500)] to-[var(--navy-700)] ring-2 ring-[var(--gold-500)]/70 shadow-lg shadow-[var(--navy-900)]/50'
                          : 'bg-white/8 hover:bg-white/15')
                      }
                    >
                      {a}
                    </motion.button>
                  ))}
                </div>
              </div>

              <motion.button
                onClick={() => (name.trim() ? setStep(2) : setError(t('يرجى إدخال اسمك', 'Please enter your name')))}
                whileHover={{ scale: 1.015 }}
                whileTap={{ scale: 0.985 }}
                className="w-full rounded-xl bg-gradient-to-r from-[var(--navy-600)] to-[var(--navy-500)] py-3.5 font-bold text-white shadow-lg shadow-[var(--navy-900)]/45 hover:brightness-110 transition-all flex items-center justify-center gap-2"
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
                    className="w-full rounded-xl bg-white/8 border border-white/10 px-4 py-3 hover:bg-gradient-to-r hover:from-[var(--navy-600)]/50 hover:to-[var(--navy-500)]/40 hover:border-[var(--gold-500)]/45 transition-colors group"
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

              <button onClick={() => setStep(1)} className="w-full text-center text-xs text-white/40 hover:text-white/70 transition-colors">
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
