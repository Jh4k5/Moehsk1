'use client'
// ─── Activation codes ───────────────────────────────────────────────────────
//
// The platform's first revenue path, and the one that works today: no gateway
// accepts a Yemeni seller, and merchant review for the Egyptian account takes
// weeks. A code needs none of that — the owner sells one however they like and
// the buyer types it in.
//
// It is also the influencer arrangement, which is a different thing from a
// discounted sale: a batch is issued with a label, tracked, and revocable as a
// unit if the arrangement ends. No money moves through the platform at all.

import { useState } from 'react'
import { Copy, Loader2 } from 'lucide-react'
import type { RedemptionCodeUsageRow, RedemptionKind } from '@/lib/supabase/database.types'

const AR = new Intl.NumberFormat('ar-EG')

const STATE_LABEL: Record<RedemptionCodeUsageRow['state'], string> = {
  available: 'متاح',
  revoked: 'مُلغى',
  expired: 'منتهٍ',
  exhausted: 'مُستهلك',
}

const KIND_LABEL: Record<RedemptionKind, string> = {
  subscription: 'اشتراك بمدّة',
  lifetime: 'مدى الحياة',
  trial: 'تجربة',
}

export function CodesPanel({ initialRows }: { initialRows: RedemptionCodeUsageRow[] }) {
  const [rows, setRows] = useState(initialRows)
  const [minted, setMinted] = useState<string[]>([])
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [form, setForm] = useState({
    quantity: 10,
    kind: 'subscription' as RedemptionKind,
    days: 30,
    usesPerCode: 1,
    prefix: 'JISR',
    batchLabel: '',
    note: '',
  })

  const generate = async () => {
    setBusy(true)
    setError(null)
    setMinted([])
    try {
      const res = await fetch('/api/admin/codes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const body = (await res.json()) as { ok?: boolean; error?: string; codes?: { code: string }[] }
      if (!res.ok || !body.ok) throw new Error(body.error ?? 'تعذّر التوليد')
      const codes = (body.codes ?? []).map((c) => c.code)
      setMinted(codes)
      // Prepend rather than refetch: the new batch is what the owner is looking
      // at right now, and a round trip would scroll it away.
      setRows((prev) => [...((body.codes ?? []) as unknown as RedemptionCodeUsageRow[]), ...prev])
    } catch (e) {
      setError(e instanceof Error ? e.message : 'تعذّر التوليد')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="j-codes">
      <section className="j-admin-card">
        <h2>توليد دفعة</h2>
        <div className="j-codes-form">
          <label className="j-field">
            <span className="j-field-label">العدد</span>
            <input type="number" min={1} max={1000} dir="ltr" value={form.quantity}
              onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) })} />
          </label>
          <label className="j-field">
            <span className="j-field-label">النوع</span>
            <select value={form.kind} onChange={(e) => setForm({ ...form, kind: e.target.value as RedemptionKind })}>
              {(Object.keys(KIND_LABEL) as RedemptionKind[]).map((k) => (
                <option key={k} value={k}>{KIND_LABEL[k]}</option>
              ))}
            </select>
          </label>
          {form.kind !== 'lifetime' && (
            <label className="j-field">
              <span className="j-field-label">المدّة بالأيام</span>
              <input type="number" min={1} dir="ltr" value={form.days}
                onChange={(e) => setForm({ ...form, days: Number(e.target.value) })} />
            </label>
          )}
          <label className="j-field">
            <span className="j-field-label">استخدامات كل كود</span>
            <input type="number" min={1} dir="ltr" value={form.usesPerCode}
              onChange={(e) => setForm({ ...form, usesPerCode: Number(e.target.value) })} />
            <span className="j-field-hint">أكثر من واحد لكود عام يُنشر مرة واحدة.</span>
          </label>
          <label className="j-field">
            <span className="j-field-label">البادئة</span>
            <input type="text" dir="ltr" maxLength={8} value={form.prefix}
              onChange={(e) => setForm({ ...form, prefix: e.target.value.toUpperCase() })} />
          </label>
          <label className="j-field j-field-wide">
            <span className="j-field-label">اسم الدفعة</span>
            <input type="text" placeholder="مثلاً: قناة فلان — حملة رمضان" value={form.batchLabel}
              onChange={(e) => setForm({ ...form, batchLabel: e.target.value })} />
            <span className="j-field-hint">سجلّك أنت. يبقى ظاهراً بعد أشهر، وبه تُلغى الدفعة كاملةً إن انتهى الاتفاق.</span>
          </label>
        </div>
        <button type="button" className="j-admin-save" onClick={generate} disabled={busy}>
          {busy ? <Loader2 size={16} className="j-handoff-spin" /> : null}
          {busy ? 'يُولَّد…' : `ولّد ${AR.format(form.quantity)} كوداً`}
        </button>
        {error && <p className="j-settings-err">{error}</p>}
      </section>

      {minted.length > 0 && (
        <section className="j-admin-card j-codes-minted">
          <div className="j-codes-minted-head">
            <h2>{AR.format(minted.length)} كود جديد</h2>
            <button type="button" onClick={() => void navigator.clipboard?.writeText(minted.join('\n'))}>
              <Copy size={14} /> انسخ الكل
            </button>
          </div>
          {/* Shown once, in full. The database stores them for redemption, but
              this is the moment to copy them out — chasing them later is work. */}
          <textarea readOnly dir="ltr" rows={Math.min(12, minted.length + 1)} value={minted.join('\n')} />
        </section>
      )}

      <section className="j-admin-card">
        <h2>الأكواد ({AR.format(rows.length)})</h2>
        {rows.length === 0 ? (
          <p className="j-admin-empty">لا أكواد بعد. ولّد دفعة أعلاه.</p>
        ) : (
          <div className="j-table-wrap">
            <table className="j-table">
              <thead>
                <tr><th>الكود</th><th>النوع</th><th>الاستخدام</th><th>الدفعة</th><th>الحالة</th></tr>
              </thead>
              <tbody>
                {rows.slice(0, 100).map((row) => (
                  <tr key={row.id}>
                    <td dir="ltr" className="j-mono">{row.code}</td>
                    <td>{KIND_LABEL[row.kind as RedemptionKind] ?? row.kind}</td>
                    <td dir="ltr">{AR.format(row.used_count)}/{AR.format(row.max_uses)}</td>
                    <td>{row.batch_label ?? '—'}</td>
                    {/* `state` is computed by the view — revoked beats expired
                        beats exhausted — so the panel does not re-derive a rule
                        the database already owns and could disagree with. */}
                    <td className={'j-code-state is-' + row.state}>{STATE_LABEL[row.state]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}
