'use client'

import React, { useState } from 'react'
import { usePaywall, CONFIG } from '@/lib/paywall-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { motion } from 'framer-motion'
import {
  Crown, CreditCard, KeyRound, Shield, Sparkles, Check, Loader2,
  BookOpen, Brain, Gamepad2, Trophy, Target, Zap, Star, Gift,
  ChevronLeft, ArrowLeft, Lock, Globe, RefreshCw, Users
} from 'lucide-react'

// ═══════════════════════════════════════════════════════════
// Payment Page Component
// ═══════════════════════════════════════════════════════════
export default function PaymentPage() {
  const { isPaid, activateLicense, status, trialRemainingFormatted } = usePaywall()
  const [licenseKey, setLicenseKey] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [activeTab, setActiveTab] = useState<'buy' | 'activate'>('buy')

  const handleValidate = async () => {
    const key = licenseKey.trim()
    if (!key) return

    setLoading(true)
    setError('')
    const result = await activateLicense(key)
    setLoading(false)

    if (result.success) {
      setSuccess(true)
    } else {
      setError(result.error || 'مفتاح خاطئ')
    }
  }

  // If already paid, show success
  if (isPaid) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 p-6">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', damping: 15 }}
          className="flex h-24 w-24 items-center justify-center rounded-full bg-emerald-100"
        >
          <Check className="h-12 w-12 text-emerald-600" />
        </motion.div>
        <h2 className="text-2xl font-bold text-gray-900">أنت مشترك بالفعل! 🎉</h2>
        <p className="text-center text-gray-500">استمتع بالوصول الكامل لجميع ميزات مُضَّن</p>
      </div>
    )
  }

  const features = [
    { icon: BookOpen, title: '410 كلمة صينية', desc: 'جميع مفردات HSK 1 مع أمثلة ونطق', color: 'text-blue-500' },
    { icon: Brain, title: 'نظام SRS ذكي', desc: 'تكرار متباعد مع 5 طرق دراسة', color: 'text-purple-500' },
    { icon: Gamepad2, title: 'ألعاب تفاعلية', desc: 'لعبة الذاكرة ومطابقة واختبارات', color: 'text-pink-500' },
    { icon: Target, title: 'محاكي امتحان HSK', desc: 'اختبارات واقعية بثلاثة مستويات', color: 'text-orange-500' },
    { icon: Trophy, title: 'نظام إنجازات', desc: 'تتبع تقدمك وسلسلة تعلم يومية', color: 'text-amber-500' },
    { icon: Sparkles, title: 'تحديثات مستمرة', desc: 'محتوى جديد ودروس إضافية', color: 'text-emerald-500' },
  ]

  const pricingCards = [
    {
      name: 'تجربة مجانية',
      price: 'مجاني',
      duration: '24 ساعة',
      desc: 'جرّب المنصة كاملة لمدة يوم واحد',
      features: ['جميع الميزات', '410 كلمة', 'جميع الألعاب', 'محاكي الامتحان'],
      highlighted: false,
      action: status === 'trial' ? `المتبقي: ${trialRemainingFormatted}` : (status === 'expired' ? 'انتهت' : 'متاح'),
      disabled: status === 'expired',
      icon: Gift,
    },
    {
      name: 'الوصول الكامل',
      price: '$9',
      duration: 'مدى الحياة',
      desc: 'دفعة واحدة — وصول دائم لكل شيء',
      features: ['كل ميزات التجربة', 'وصول مدى الحياة', 'تحديثات مجانية', 'دعم فني', 'دروس جديدة قادمة'],
      highlighted: true,
      action: 'اشترك الآن',
      disabled: false,
      icon: Crown,
    },
  ]

  return (
    <div className="mx-auto max-w-4xl px-4 py-8" dir="rtl">
      {/* Success animation */}
      {success && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-8 rounded-xl border border-emerald-200 bg-emerald-50 p-6 text-center"
        >
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100">
            <Check className="h-7 w-7 text-emerald-600" />
          </div>
          <h3 className="text-lg font-bold text-emerald-800">تم التفعيل بنجاح! 🎉</h3>
          <p className="mt-1 text-sm text-emerald-600">مرحباً بك في مُضَّن الكامل — استمتع بالتعلم!</p>
        </motion.div>
      )}

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-10 text-center"
      >
        <Badge className="mb-4 gap-1 bg-blue-50 px-3 py-1 text-blue-600 hover:bg-blue-50">
          <Star className="h-3 w-3" />
          اشترك واحصل على وصول كامل
        </Badge>
        <h1 className="mb-3 text-3xl font-extrabold text-gray-900 sm:text-4xl">
          انطلق في رحلة تعلم الصينية
          <span className="mr-2 text-blue-600">.</span>
        </h1>
        <p className="mx-auto max-w-xl text-gray-500">
          منصة مُضَّن الشاملة تقدم لك كل ما تحتاجه لاجتياز HSK 1 — بطاقات ذكية، ألعاب، دروس، ومحاكي امتحان
        </p>
      </motion.div>

      {/* Features Grid */}
      <div className="mb-12 grid grid-cols-2 gap-3 sm:grid-cols-3 md:gap-4">
        {features.map((f, i) => (
          <motion.div
            key={f.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
          >
            <Card className="border-0 bg-gray-50/80 shadow-none transition-shadow hover:shadow-md">
              <CardContent className="flex flex-col items-center gap-2 p-4 text-center sm:p-5">
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-white ${f.color}`}>
                  <f.icon className="h-5 w-5" />
                </div>
                <h3 className="text-sm font-bold text-gray-900">{f.title}</h3>
                <p className="text-xs leading-relaxed text-gray-400">{f.desc}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Pricing Cards */}
      <div className="mb-12 grid gap-4 sm:grid-cols-2 sm:gap-6">
        {pricingCards.map((plan, i) => (
          <motion.div
            key={plan.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + i * 0.1 }}
          >
            <Card className={`relative overflow-hidden ${plan.highlighted ? 'border-blue-200 shadow-lg shadow-blue-500/10' : 'border-gray-100'}`}>
              {plan.highlighted && (
                <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-l from-blue-500 to-indigo-600" />
              )}
              <CardContent className="p-6">
                <div className="mb-4 flex items-center gap-3">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${plan.highlighted ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'}`}>
                    <plan.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">{plan.name}</h3>
                    <p className="text-xs text-gray-400">{plan.desc}</p>
                  </div>
                </div>

                <div className="mb-4">
                  <span className="text-3xl font-extrabold text-gray-900">{plan.price}</span>
                  {plan.duration !== 'مدى الحياة' && (
                    <span className="mr-1 text-sm text-gray-400">/ {plan.duration}</span>
                  )}
                  {plan.duration === 'مدى الحياة' && (
                    <Badge variant="secondary" className="mr-2 text-xs">مدى الحياة</Badge>
                  )}
                </div>

                <ul className="mb-6 space-y-2">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-gray-600">
                      <Check className={`h-4 w-4 ${plan.highlighted ? 'text-blue-500' : 'text-gray-300'}`} />
                      {f}
                    </li>
                  ))}
                </ul>

                {plan.highlighted ? (
                  <Button
                    size="lg"
                    onClick={() => window.open(CONFIG.GUMROAD_URL, '_blank')}
                    className="w-full gap-2 rounded-xl border-0 bg-gradient-to-l from-blue-600 to-indigo-700 text-white shadow-lg shadow-blue-500/20 hover:from-blue-700 hover:to-indigo-800"
                  >
                    <CreditCard className="h-4 w-4" />
                    {plan.action}
                  </Button>
                ) : (
                  <Button
                    size="lg"
                    variant="outline"
                    disabled={plan.disabled}
                    className="w-full rounded-xl border-gray-200"
                  >
                    {plan.action}
                  </Button>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* License Activation Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <Card className="border-gray-100">
          <CardContent className="p-6">
            <div className="mb-4 text-center">
              <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100">
                <KeyRound className="h-5 w-5 text-purple-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">لديك مفتاح ترخيص؟</h3>
              <p className="text-sm text-gray-400">أدخل مفتاح الترخيص الذي اشتريته من Gumroad</p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Input
                value={licenseKey}
                onChange={(e) => {
                  setLicenseKey(e.target.value)
                  setError('')
                }}
                placeholder="XXXX-XXXX-XXXX-XXXX"
                className="h-11 flex-1 rounded-lg border-gray-200 text-center tracking-wider placeholder:text-gray-300 sm:text-left"
                dir="ltr"
                maxLength={19}
              />
              <Button
                variant="outline"
                onClick={handleValidate}
                disabled={loading || !licenseKey.trim()}
                className="h-11 gap-2 rounded-lg border-gray-200 px-6"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Lock className="h-4 w-4" />
                )}
                تفعيل المفتاح
              </Button>
            </div>

            {error && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-3 text-center text-sm text-red-500"
              >
                {error}
              </motion.p>
            )}

            {/* Test keys info (remove in production) */}
            {process.env.NODE_ENV === 'development' && (
              <p className="mt-3 text-center text-[11px] text-gray-300" dir="ltr">
                Test keys: MUDANN-TEST-KEY-0001, MUDANN-BETA-LAUNCH
              </p>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Trust Section */}
      <div className="mt-10 flex flex-col items-center gap-4 text-center">
        <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-gray-400">
          <span className="flex items-center gap-1"><Shield className="h-3.5 w-3.5" /> دفع آمن عبر Gumroad</span>
          <span className="flex items-center gap-1"><Globe className="h-3.5 w-3.5" /> وصول فوري</span>
          <span className="flex items-center gap-1"><RefreshCw className="h-3.5 w-3.5" /> تحديثات مجانية مدى الحياة</span>
          <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" /> +1000 متعلم</span>
        </div>
        <p className="text-xs text-gray-300">
          لديك سؤال؟ تواصل معنا عبر البريد الإلكتروني
        </p>
      </div>
    </div>
  )
}
