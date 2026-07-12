'use client'

import React, { useEffect, useRef, useState } from 'react'
import { useTheme } from 'next-themes'
import { useLearningStore } from '@/lib/store'
import { useI18n } from '@/lib/i18n'
import { usePaywall, CONFIG } from '@/lib/paywall-context'
import { speak, getChineseVoices } from '@/lib/tts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Slider } from '@/components/ui/slider'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import {
  Settings as SettingsIcon, Sun, Moon, Monitor, Type, Volume2, Target,
  Download, Upload, Trash2, KeyRound, Crown, Check, Loader2, User,
} from 'lucide-react'

const STORAGE_KEY = 'hsk-learning-storage'

export default function SettingsSection() {
  const store = useLearningStore()
  const { t, lang, setLang } = useI18n()
  const { theme, setTheme } = useTheme()
  const { status, isPaid, activateLicense, trialRemainingFormatted } = usePaywall()

  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([])
  const [licenseKey, setLicenseKey] = useState('')
  const [licenseLoading, setLicenseLoading] = useState(false)
  const [licenseMsg, setLicenseMsg] = useState<{ ok: boolean; text: string } | null>(null)
  const importInputRef = useRef<HTMLInputElement>(null)
  const [importMsg, setImportMsg] = useState('')

  // الأصوات الصينية تُحمّل بشكل غير متزامن في بعض المتصفحات
  useEffect(() => {
    const load = () => setVoices(getChineseVoices())
    load()
    window.speechSynthesis?.addEventListener('voiceschanged', load)
    return () => window.speechSynthesis?.removeEventListener('voiceschanged', load)
  }, [])

  const handleExport = () => {
    const data = localStorage.getItem(STORAGE_KEY) || '{}'
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `jisr-progress-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleImport = (file: File) => {
    setImportMsg('')
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result))
        const state = parsed?.state
        if (!state || !Array.isArray(state.learnedWords)) {
          setImportMsg('❌ الملف غير صالح — تأكد أنه ملف تقدم مُصدَّر من جِسر')
          return
        }
        localStorage.setItem(STORAGE_KEY, String(reader.result))
        setImportMsg('✅ تم الاستيراد! جارٍ إعادة التحميل...')
        setTimeout(() => location.reload(), 800)
      } catch {
        setImportMsg('❌ تعذر قراءة الملف — ليس ملف JSON صالحاً')
      }
    }
    reader.readAsText(file)
  }

  const handleReset = () => {
    localStorage.removeItem(STORAGE_KEY)
    location.reload()
  }

  const handleActivate = async () => {
    const key = licenseKey.trim()
    if (!key) return
    setLicenseLoading(true)
    setLicenseMsg(null)
    const result = await activateLicense(key)
    setLicenseLoading(false)
    setLicenseMsg(result.success
      ? { ok: true, text: 'تم التفعيل بنجاح! 🎉' }
      : { ok: false, text: result.error || 'مفتاح غير صالح' })
  }

  const themeOptions = [
    { value: 'light', label: 'فاتح', icon: Sun },
    { value: 'dark', label: 'داكن', icon: Moon },
    { value: 'system', label: 'تلقائي', icon: Monitor },
  ]

  return (
    <div className="space-y-5 max-w-3xl">
      <h2 className="text-2xl font-bold text-[var(--text-primary)] flex items-center gap-2">
        <SettingsIcon className="w-6 h-6 text-primary" />
        الإعدادات
      </h2>

      {/* ── الملف الشخصي ── */}
      <Card className="j-card border-0 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <User className="w-4 h-4 text-primary" /> الملف الشخصي
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-600 flex items-center justify-center text-2xl">
              {store.profile?.avatarEmoji || '🐼'}
            </div>
            <div className="flex-1">
              <div className="font-bold text-[var(--text-primary)]">{store.profile?.name || '—'}</div>
              <div className="text-xs text-[var(--text-muted)]">
                عضو منذ {store.profile?.createdAt ? new Date(store.profile.createdAt).toLocaleDateString('ar') : '—'}
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={() => store.clearProfile()}>
              تبديل الملف الشخصي
            </Button>
          </div>

          <div>
            <label className="text-sm font-medium text-[var(--text-primary)] flex items-center gap-1.5 mb-2">
              <Target className="w-4 h-4 text-primary" /> الهدف اليومي: {store.profile?.dailyGoal || 10} كلمات
            </label>
            <div className="flex gap-2">
              {[5, 10, 15, 20].map((g) => (
                <Button
                  key={g}
                  variant={store.profile?.dailyGoal === g ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => store.profile && store.setProfile({ ...store.profile, dailyGoal: g })}
                >
                  {g}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── المظهر ── */}
      <Card className="j-card border-0 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Sun className="w-4 h-4 text-primary" /> {t('المظهر', 'Appearance')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* اللغة / Language */}
          <div>
            <label className="text-sm font-medium text-[var(--text-primary)] flex items-center gap-1.5 mb-3">
              🌐 {t('اللغة', 'Language')}
            </label>
            <div className="grid grid-cols-2 gap-2">
              {([['ar', 'العربية'], ['en', 'English']] as const).map(([lg, lbl]) => (
                <button
                  key={lg}
                  onClick={() => setLang(lg)}
                  className={
                    'rounded-xl border p-3 text-sm font-bold transition-all ' +
                    (lang === lg
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-[var(--line-default)] text-[var(--text-muted)] hover:border-primary/40')
                  }
                >
                  {lbl}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {themeOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setTheme(opt.value)}
                className={
                  'rounded-xl border p-3 flex flex-col items-center gap-1.5 transition-all ' +
                  (theme === opt.value
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-[var(--line-default)] text-[var(--text-muted)] hover:border-primary/40')
                }
              >
                <opt.icon className="w-5 h-5" />
                <span className="text-xs font-medium">{opt.label}</span>
              </button>
            ))}
          </div>

          <div>
            <label className="text-sm font-medium text-[var(--text-primary)] flex items-center gap-1.5 mb-3">
              <Type className="w-4 h-4 text-primary" />
              حجم الحروف الصينية: {Math.round(store.settings.hanziFontScale * 100)}%
            </label>
            <Slider
              value={[store.settings.hanziFontScale * 100]}
              min={100}
              max={160}
              step={10}
              onValueChange={([v]) => store.updateSettings({ hanziFontScale: v / 100 })}
              dir="ltr"
            />
            <div className="mt-3 text-center font-chinese text-[var(--text-primary)]" style={{ fontSize: `${1.8 * store.settings.hanziFontScale}rem` }}>
              你好世界
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── الصوت والنطق ── */}
      <Card className="j-card border-0 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Volume2 className="w-4 h-4 text-primary" /> الصوت والنطق
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div>
            <label className="text-sm font-medium text-[var(--text-primary)] mb-2 block">الصوت الصيني</label>
            {voices.length ? (
              <Select
                value={store.settings.ttsVoiceURI || 'auto'}
                onValueChange={(v) => store.updateSettings({ ttsVoiceURI: v === 'auto' ? null : v })}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="تلقائي" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="auto">تلقائي (صوت النظام)</SelectItem>
                  {voices.map((v) => (
                    <SelectItem key={v.voiceURI} value={v.voiceURI}>
                      {v.name} ({v.lang})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <p className="text-xs text-[var(--text-muted)]">
                لا توجد أصوات صينية مثبتة في متصفحك — سيُستخدم الصوت الافتراضي. يمكنك تثبيت صوت صيني من إعدادات نظامك.
              </p>
            )}
          </div>

          <div>
            <label className="text-sm font-medium text-[var(--text-primary)] mb-3 block">
              سرعة النطق: {store.settings.ttsRate.toFixed(1)}×
            </label>
            <Slider
              value={[store.settings.ttsRate * 10]}
              min={5}
              max={12}
              step={1}
              onValueChange={([v]) => store.updateSettings({ ttsRate: v / 10 })}
              dir="ltr"
            />
          </div>

          <Button variant="outline" size="sm" onClick={() => speak('你好！我是你的中文老师。')}>
            <Volume2 className="w-4 h-4 ml-1.5" /> جرّب الصوت
          </Button>
        </CardContent>
      </Card>

      {/* ── الترخيص ── */}
      <Card className="j-card border-0 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Crown className="w-4 h-4 text-amber-500" /> الترخيص
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {isPaid ? (
            <div className="flex items-center gap-2 text-emerald-500">
              <Check className="w-5 h-5" />
              <span className="font-bold">النسخة الكاملة مفعّلة — وصول مدى الحياة</span>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="gap-1">
                  {status === 'trial' ? `تجربة مجانية — متبقي ${trialRemainingFormatted}` : 'انتهت التجربة'}
                </Badge>
                <a
                  href={CONFIG.GUMROAD_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-primary hover:underline"
                >
                  شراء النسخة الكاملة — {CONFIG.PRICE}
                </a>
              </div>
              <div className="flex gap-2">
                <Input
                  value={licenseKey}
                  onChange={(e) => { setLicenseKey(e.target.value); setLicenseMsg(null) }}
                  placeholder="أدخل مفتاح الترخيص"
                  dir="ltr"
                  className="flex-1 text-center tracking-wider"
                />
                <Button onClick={handleActivate} disabled={licenseLoading || !licenseKey.trim()}>
                  {licenseLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <KeyRound className="w-4 h-4" />}
                  <span className="mr-1">تفعيل</span>
                </Button>
              </div>
              {licenseMsg && (
                <p className={'text-xs ' + (licenseMsg.ok ? 'text-emerald-500' : 'text-red-500')}>{licenseMsg.text}</p>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* ── البيانات ── */}
      <Card className="j-card border-0 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Download className="w-4 h-4 text-primary" /> بياناتك
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-xs text-[var(--text-muted)]">
            تقدمك محفوظ على هذا الجهاز فقط. صدّر نسخة احتياطية بانتظام، ويمكنك استيرادها على أي جهاز آخر.
          </p>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="w-4 h-4 ml-1.5" /> تصدير التقدم
            </Button>
            <Button variant="outline" size="sm" onClick={() => importInputRef.current?.click()}>
              <Upload className="w-4 h-4 ml-1.5" /> استيراد التقدم
            </Button>
            <input
              ref={importInputRef}
              type="file"
              accept="application/json"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleImport(e.target.files[0])}
            />
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm" className="text-red-500 border-red-500/30 hover:bg-red-500/10">
                  <Trash2 className="w-4 h-4 ml-1.5" /> تصفير كل التقدم
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent dir="rtl">
                <AlertDialogHeader>
                  <AlertDialogTitle>هل أنت متأكد؟</AlertDialogTitle>
                  <AlertDialogDescription>
                    سيُحذف كل تقدمك نهائياً: الكلمات المتعلمة، المراجعات، الإنجازات، والسلسلة اليومية. لا يمكن التراجع — صدّر نسخة احتياطية أولاً إن أردت.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>إلغاء</AlertDialogCancel>
                  <AlertDialogAction onClick={handleReset} className="bg-red-600 hover:bg-red-700">
                    نعم، احذف كل شيء
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
          {importMsg && <p className="text-xs text-[var(--text-muted)]">{importMsg}</p>}
        </CardContent>
      </Card>
    </div>
  )
}
