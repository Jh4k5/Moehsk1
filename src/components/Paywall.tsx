'use client'

import React, { useState } from 'react'
import { usePaywall } from '@/lib/paywall-context'
import { usePricing } from '@/lib/config/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { motion, AnimatePresence } from 'framer-motion'
import { Crown, Clock, KeyRound, CreditCard, X, Shield, Sparkles, Check, Gift, Loader2 } from 'lucide-react'
import { ts } from '@/lib/i18n'

// ═══════════════════════════════════════════════════════════
// Trial Banner — shows countdown at the top during trial
// ═══════════════════════════════════════════════════════════
function TrialBanner() {
  const { trialRemainingFormatted, isPaid, status } = usePaywall()
  const { lifetime, checkoutHref } = usePricing()

  if (isPaid || status !== 'trial') return null

  return (
    <motion.div
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed top-0 left-0 right-0 z-[9998] flex items-center justify-between px-4 py-2.5 text-white sm:px-6"
      style={{ background: 'linear-gradient(135deg, #1a237e 0%, #283593 100%)' }}
    >
      <div className="flex items-center gap-2 text-sm">
        <Gift className="h-4 w-4 shrink-0 text-[var(--gold-300)]" />
        <span>{ts('تجربة مجانية:','Free trial:')}</span>
        <Badge className="border-0 bg-[var(--gold-500)]/20 px-2 py-0 font-bold text-[var(--gold-300)] hover:bg-[var(--gold-500)]/20">
          <Clock className="ml-1 h-3 w-3" />
          {trialRemainingFormatted}
        </Badge>
      </div>

      <Button
        size="sm"
        onClick={() => { if (checkoutHref) window.location.assign(checkoutHref) }}
        disabled={!checkoutHref}
        className="h-8 gap-1.5 rounded-lg border-0 bg-[var(--green-500)] px-4 text-xs font-bold text-white hover:bg-[var(--green-600)] disabled:opacity-60"
      >
        <Crown className="h-3.5 w-3.5" />
        {/* The amount appears only when the owner has set one in the admin
            panel. No price in the code means no stale price on the screen. */}
        {ts('اشترك الآن', 'Subscribe')}{lifetime ? ` — ${lifetime}` : ''}
      </Button>
    </motion.div>
  )
}

// ═══════════════════════════════════════════════════════════
// Paywall Overlay — blocks the page after trial expires
// ═══════════════════════════════════════════════════════════
function PaywallOverlay() {
  const { status, isPaid, activateLicense } = usePaywall()
  const { lifetime, checkoutHref } = usePricing()
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
      setTimeout(() => window.location.reload(), 1800)
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
          >
            {/* Success State */}
            {success ? (
              <div className="flex flex-col items-center gap-4 p-10">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: 'spring' }}
                  className="flex h-20 w-20 items-center justify-center rounded-full bg-[var(--green-300)]"
                >
                  <Check className="h-10 w-10 text-[var(--green-600)]" />
                </motion.div>
                <h3 className="text-xl font-bold text-gray-900">{ts('تم التفعيل بنجاح! 🎉','Activated successfully! 🎉')}</h3>
                <p className="text-sm text-gray-500">{ts('مرحباً بك في جِسر — النسخة الكاملة','Welcome to JISR — Full Version')}</p>
                <p className="text-xs text-gray-400">{ts('سيتم تحديث الصفحة تلقائياً...','The page will refresh automatically...')}</p>
              </div>
            ) : (
              <>
                {/* Header decoration */}
                <div className="relative bg-gradient-to-br from-[var(--navy-600)] via-[var(--navy-700)] to-[var(--navy-800)] px-8 pb-8 pt-10">
                  <div className="absolute -top-2 -left-2 h-16 w-16 rounded-full bg-[var(--gold-400)]/20" />
                  <div className="absolute -bottom-4 -right-4 h-24 w-24 rounded-full bg-white/5" />
                  <div className="relative">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-sm">
                      <Crown className="h-8 w-8 text-[var(--gold-300)]" />
                    </div>
                    <h3 className="mb-1 text-2xl font-bold text-white">{ts('انتهت فترة التجربة','Your free trial has ended')}</h3>
                    <p className="text-sm text-[var(--navy-200)]">
                      احصل على وصول كامل لـ <strong className="text-[var(--gold-300)]">{ts('600+ كلمة','600+ words')}</strong> و <strong className="text-[var(--gold-300)]">{ts('دروس تفاعلية','Interactive lessons')}</strong>
                    </p>
                  </div>
                </div>

                {/* Features list */}
                <div className="border-b border-gray-100 px-8 py-5">
                  <div className="mb-3 flex flex-wrap justify-center gap-2">
                    {['بطاقات ذكية SRS', '5 طرق دراسة', 'محاكي امتحان', 'دروس تفاعلية', 'متعقب تقدم'].map((f) => (
                      <Badge key={f} variant="secondary" className="gap-1 text-xs">
                        <Sparkles className="h-3 w-3 text-[var(--gold-500)]" />
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
                    onClick={() => { if (checkoutHref) window.location.assign(checkoutHref) }}
                    disabled={!checkoutHref}
                    className="w-full gap-2 rounded-xl border-0 bg-gradient-to-l from-[var(--navy-600)] to-[var(--navy-700)] py-6 text-base font-bold text-white shadow-lg shadow-[var(--navy-500)]/25 hover:from-[var(--navy-700)] hover:to-[var(--navy-800)] disabled:opacity-60"
                  >
                    <CreditCard className="h-5 w-5" />
                    {ts('احصل على الوصول الكامل', 'Get full access')}{lifetime ? ` — ${lifetime}` : ''}
                  </Button>

                  {/* Divider */}
                  <div className="flex items-center gap-3">
                    <div className="h-px flex-1 bg-gray-200" />
                    <span className="text-xs text-gray-400">{ts('أو أدخل مفتاح الترخيص','Or enter your license key')}</span>
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
                    <div className="text-[11px] text-gray-400">{ts('وصول مدى الحياة','Lifetime access')}</div>
                    <div className="h-1 w-1 rounded-full bg-gray-300" />
                    <div className="text-[11px] text-gray-400">{ts('تحديثات مجانية','Free updates')}</div>
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
  // شريط الاشتراك العلوي (TrialBanner) مُزال حالياً بناءً على طلب المستخدم —
  // كان غير متوازن ويغطّي الأقسام. تبقى نافذة انتهاء التجربة فقط.
  return (
    <>
      <PaywallOverlay />
    </>
  )
}
