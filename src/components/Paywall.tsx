'use client'

import React, { useState } from 'react'
import { usePaywall, CONFIG } from '@/lib/paywall-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { motion, AnimatePresence } from 'framer-motion'
import { Crown, Clock, KeyRound, CreditCard, X, Shield, Sparkles, Check, Gift, Loader2 } from 'lucide-react'

// ═══════════════════════════════════════════════════════════
// Trial Banner — shows countdown at the top during trial
// ═══════════════════════════════════════════════════════════
function TrialBanner() {
  const { trialRemainingFormatted, isPaid, status } = usePaywall()

  if (isPaid || status !== 'trial') return null

  return (
    <motion.div
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed top-0 left-0 right-0 z-[9998] flex items-center justify-between px-4 py-2.5 text-white sm:px-6"
      style={{ background: 'linear-gradient(135deg, #1a237e 0%, #283593 100%)' }}
    >
      <div className="flex items-center gap-2 text-sm">
        <Gift className="h-4 w-4 shrink-0 text-amber-300" />
        <span>تجربة مجانية:</span>
        <Badge className="border-0 bg-amber-500/20 px-2 py-0 font-bold text-amber-300 hover:bg-amber-500/20">
          <Clock className="ml-1 h-3 w-3" />
          {trialRemainingFormatted}
        </Badge>
      </div>

      <Button
        size="sm"
        onClick={() => window.open(CONFIG.GUMROAD_URL, '_blank')}
        className="h-8 gap-1.5 rounded-lg border-0 bg-emerald-500 px-4 text-xs font-bold text-white hover:bg-emerald-600"
      >
        <Crown className="h-3.5 w-3.5" />
        اشترك الآن {CONFIG.PRICE}
      </Button>
    </motion.div>
  )
}

// ═══════════════════════════════════════════════════════════
// Paywall Overlay — blocks the page after trial expires
// ═══════════════════════════════════════════════════════════
function PaywallOverlay() {
  const { status, isPaid, activateLicense } = usePaywall()
  const [licenseKey, setLicenseKey] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  if (isPaid || status !== 'expired') return null

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

  return (
    <>
      {/* Blur overlay on body content */}
      <div className="pw-blur pointer-events-none fixed inset-0 z-[9996]" />

      {/* Full overlay */}
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/85 p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 30 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white text-center shadow-2xl"
            dir="rtl"
          >
            {/* Success State */}
            {success ? (
              <div className="flex flex-col items-center gap-4 p-10">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: 'spring' }}
                  className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100"
                >
                  <Check className="h-10 w-10 text-emerald-600" />
                </motion.div>
                <h3 className="text-xl font-bold text-gray-900">تم التفعيل بنجاح! 🎉</h3>
                <p className="text-sm text-gray-500">مرحباً بك في مُضَّن الكامل</p>
                <p className="text-xs text-gray-400">سيتم تحديث الصفحة تلقائياً...</p>
              </div>
            ) : (
              <>
                {/* Header decoration */}
                <div className="relative bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800 px-8 pb-8 pt-10">
                  <div className="absolute -top-2 -left-2 h-16 w-16 rounded-full bg-amber-400/20" />
                  <div className="absolute -bottom-4 -right-4 h-24 w-24 rounded-full bg-white/5" />
                  <div className="relative">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-sm">
                      <Crown className="h-8 w-8 text-amber-300" />
                    </div>
                    <h3 className="mb-1 text-2xl font-bold text-white">انتهت فترة التجربة</h3>
                    <p className="text-sm text-blue-200">
                      احصل على وصول كامل لـ <strong className="text-amber-300">410 كلمة</strong> و <strong className="text-amber-300">دروس تفاعلية</strong>
                    </p>
                  </div>
                </div>

                {/* Features list */}
                <div className="border-b border-gray-100 px-8 py-5">
                  <div className="mb-3 flex flex-wrap justify-center gap-2">
                    {['بطاقات ذكية SRS', '5 طرق دراسة', 'محاكي امتحان', 'دروس تفاعلية', 'متعقب تقدم'].map((f) => (
                      <Badge key={f} variant="secondary" className="gap-1 text-xs">
                        <Sparkles className="h-3 w-3 text-amber-500" />
                        {f}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Action buttons */}
                <div className="space-y-3 p-6">
                  {/* Gumroad purchase button */}
                  <Button
                    size="lg"
                    onClick={() => window.open(CONFIG.GUMROAD_URL, '_blank')}
                    className="w-full gap-2 rounded-xl border-0 bg-gradient-to-l from-blue-600 to-indigo-700 py-6 text-base font-bold text-white shadow-lg shadow-blue-500/25 hover:from-blue-700 hover:to-indigo-800"
                  >
                    <CreditCard className="h-5 w-5" />
                    احصل على الوصول الكامل — {CONFIG.PRICE}
                  </Button>

                  {/* Divider */}
                  <div className="flex items-center gap-3">
                    <div className="h-px flex-1 bg-gray-200" />
                    <span className="text-xs text-gray-400">أو أدخل مفتاح الترخيص</span>
                    <div className="h-px flex-1 bg-gray-200" />
                  </div>

                  {/* License key input */}
                  <div className="flex gap-2">
                    <Input
                      value={licenseKey}
                      onChange={(e) => {
                        setLicenseKey(e.target.value)
                        setError('')
                      }}
                      placeholder="XXXX-XXXX-XXXX-XXXX"
                      className="h-11 flex-1 rounded-lg border-gray-200 bg-gray-50 text-center text-sm tracking-wider placeholder:text-gray-300"
                      dir="ltr"
                      maxLength={19}
                    />
                    <Button
                      variant="outline"
                      onClick={handleValidate}
                      disabled={loading || !licenseKey.trim()}
                      className="h-11 shrink-0 rounded-lg gap-1.5 border-gray-200 px-4"
                    >
                      {loading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <KeyRound className="h-4 w-4" />
                      )}
                      تفعيل
                    </Button>
                  </div>

                  {/* Error message */}
                  <AnimatePresence>
                    {error && (
                      <motion.p
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="flex items-center justify-center gap-1 text-xs text-red-500"
                      >
                        <X className="h-3 w-3" />
                        {error}
                      </motion.p>
                    )}
                  </AnimatePresence>

                  {/* Trust badges */}
                  <div className="flex items-center justify-center gap-3 pt-2">
                    <div className="flex items-center gap-1 text-[11px] text-gray-400">
                      <Shield className="h-3 w-3" />
                      دفع آمن
                    </div>
                    <div className="h-1 w-1 rounded-full bg-gray-300" />
                    <div className="text-[11px] text-gray-400">وصول مدى الحياة</div>
                    <div className="h-1 w-1 rounded-full bg-gray-300" />
                    <div className="text-[11px] text-gray-400">تحديثات مجانية</div>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        </motion.div>
      </AnimatePresence>
    </>
  )
}

// ═══════════════════════════════════════════════════════════
// Exported Paywall component
// ═══════════════════════════════════════════════════════════
export default function Paywall() {
  return (
    <>
      <TrialBanner />
      <PaywallOverlay />
    </>
  )
}
