'use client'
// ─── First-admin activation ─────────────────────────────────────────────────
//
// `POST /api/admin/bootstrap` existed before this screen did, and the only way
// to reach it was to open devtools and paste a `fetch` — which is not a thing
// to ask of the person who owns the platform. This is that request, as a
// button.
//
// It renders only for a signed-in user whose VERIFIED email is already in
// `ADMIN_BOOTSTRAP_EMAILS`; the layout 404s everyone else before this file is
// ever sent. So the button is not the authorisation — the server-side list is,
// exactly as it was — and pressing it grants nothing the route would not have
// granted to the same session anyway.

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { KeyRound, Loader2 } from 'lucide-react'

export function BootstrapPanel({ email }: { email: string }) {
  const router = useRouter()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function activate() {
    setBusy(true)
    setError(null)
    try {
      const res = await fetch('/api/admin/bootstrap', { method: 'POST' })
      const body = await res.json().catch(() => ({}))
      if (!res.ok || !body?.ok) {
        setError(body?.error ?? 'تعذّرت الترقية. حاول مرة أخرى.')
        setBusy(false)
        return
      }
      // The layout re-reads `profiles.role` on the server; refreshing is what
      // turns this screen into the panel itself.
      router.refresh()
    } catch {
      setError('تعذّر الاتصال بالخادم.')
      setBusy(false)
    }
  }

  return (
    <main className="j-admin j-admin-bootstrap">
      <h1>تفعيل لوحة التحكم</h1>
      <p>
        هذا الحساب (<code>{email}</code>) مُدرَج في قائمة التهيئة الأولى، ولم تُفعَّل
        صلاحية المدير له بعد. اضغط الزر مرة واحدة لتفعيلها.
      </p>
      <button type="button" className="j-admin-activate" onClick={activate} disabled={busy}>
        {busy ? <Loader2 size={16} className="j-spin" aria-hidden /> : <KeyRound size={16} aria-hidden />}
        <span>{busy ? 'جارٍ التفعيل…' : 'فعّل صلاحية المدير'}</span>
      </button>
      {error && <p className="j-admin-error">{error}</p>}
      <p className="j-admin-hint">
        بعد نجاح التفعيل، احذف المتغيّر <code>ADMIN_BOOTSTRAP_EMAILS</code> من إعدادات
        الاستضافة — الصلاحية صارت محفوظة في قاعدة البيانات، وبقاء القائمة يترك الباب
        مفتوحاً لأي بريد يُضاف إليها لاحقاً.
      </p>
    </main>
  )
}
