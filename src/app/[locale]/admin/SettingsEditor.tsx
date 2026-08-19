'use client'
// ─── The settings form ──────────────────────────────────────────────────────
//
// Generated from the `app_config` rows, which carry their own Arabic label,
// hint and type. A new setting is added by a migration and appears here on its
// own; nothing has to be written twice, so the form and the table cannot
// disagree about what exists.
//
// Only CHANGED keys are sent. Posting the whole form would rewrite every row's
// `updated_by` and `updated_at` on any save, and `app_config_history` would
// fill with edits nobody made — which is exactly what makes an audit trail
// worthless.

import { useMemo, useState } from 'react'
import { Check, Loader2 } from 'lucide-react'
import type { AppConfigRow, Json } from '@/lib/supabase/database.types'
import type { ProviderId } from '@/lib/payments/types'

const GROUP_LABEL: Record<string, string> = {
  pricing: 'السعر والعملة',
  access: 'ما هو مجاني',
  trial: 'التجربة',
  features: 'مفاتيح الميزات',
  announcement: 'شريط الإعلان',
  gateway: 'بوابة الدفع',
}

type Draft = Record<string, Json>

export function SettingsEditor({
  rows,
  providers,
}: {
  rows: AppConfigRow[]
  providers: { id: ProviderId; label: string; configured: boolean }[]
}) {
  const [draft, setDraft] = useState<Draft>({})
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const groups = useMemo(() => {
    const map = new Map<string, AppConfigRow[]>()
    for (const row of rows) {
      const list = map.get(row.group_key)
      if (list) list.push(row)
      else map.set(row.group_key, [row])
    }
    return [...map.entries()]
  }, [rows])

  const dirty = Object.keys(draft).length > 0

  const valueOf = (row: AppConfigRow): Json => (row.key in draft ? draft[row.key] : row.value)

  const set = (key: string, value: Json) => {
    setSaved(false)
    setError(null)
    setDraft((d) => ({ ...d, [key]: value }))
  }

  const save = async () => {
    setSaving(true)
    setError(null)
    try {
      const res = await fetch('/api/admin/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entries: draft }),
      })
      const body = (await res.json()) as { ok?: boolean; error?: string }
      if (!res.ok || !body.ok) throw new Error(body.error ?? 'تعذّر الحفظ')
      setDraft({})
      setSaved(true)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'تعذّر الحفظ')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="j-settings">
      {groups.map(([group, groupRows]) => (
        <section key={group} className="j-settings-group">
          <h2>{GROUP_LABEL[group] ?? group}</h2>

          {group === 'pricing' && (
            <p className="j-settings-note">
              اترك المبلغ فارغاً ولن يظهر أي رقم في المنصة — لا صفر ولا سعر قديم. لا يوجد
              سعر مكتوب في الكود إطلاقاً، وهذه الصفحة مصدره الوحيد.
            </p>
          )}

          <div className="j-settings-rows">
            {groupRows.map((row) => (
              <Field
                key={row.key}
                row={row}
                value={valueOf(row)}
                providers={providers}
                onChange={(v) => set(row.key, v)}
              />
            ))}
          </div>
        </section>
      ))}

      <div className="j-settings-bar">
        <button type="button" className="j-admin-save" onClick={save} disabled={!dirty || saving}>
          {saving ? <Loader2 size={16} className="j-handoff-spin" /> : null}
          {saving ? 'يُحفظ…' : dirty ? `احفظ ${Object.keys(draft).length} تغييراً` : 'لا تغييرات'}
        </button>
        {saved && <span className="j-settings-ok"><Check size={15} /> حُفظ</span>}
        {error && <span className="j-settings-err">{error}</span>}
      </div>
    </div>
  )
}

function Field({
  row,
  value,
  providers,
  onChange,
}: {
  row: AppConfigRow
  value: Json
  providers: { id: ProviderId; label: string; configured: boolean }[]
  onChange: (value: Json) => void
}) {
  const id = `cfg-${row.key}`

  // The gateway picker is the one field the table cannot describe on its own:
  // its options depend on which providers have their keys in the environment,
  // which is a fact about the deployment, not about the row.
  if (row.key === 'gateway.provider') {
    return (
      <label className="j-field" htmlFor={id}>
        <span className="j-field-label">{row.label_ar}</span>
        <select id={id} value={String(value ?? 'none')} onChange={(e) => onChange(e.target.value)}>
          {providers.map((p) => (
            <option key={p.id} value={p.id} disabled={!p.configured && p.id !== 'none'}>
              {p.label}
              {!p.configured && p.id !== 'none' ? ' — مفاتيحه غير مضبوطة' : ''}
            </option>
          ))}
        </select>
        <span className="j-field-hint">
          {row.hint_ar ?? ''} اختيار بوابة بلا مفاتيح يُبقي الدفع مغلقاً — لا ينفتح نصفه.
        </span>
      </label>
    )
  }

  if (row.value_type === 'boolean') {
    return (
      <label className="j-field j-field-toggle" htmlFor={id}>
        <input id={id} type="checkbox" checked={value === true} onChange={(e) => onChange(e.target.checked)} />
        <span className="j-field-label">{row.label_ar}</span>
        {row.hint_ar && <span className="j-field-hint">{row.hint_ar}</span>}
      </label>
    )
  }

  if (row.value_type === 'number') {
    return (
      <label className="j-field" htmlFor={id}>
        <span className="j-field-label">{row.label_ar}</span>
        <input
          id={id}
          type="number"
          inputMode="decimal"
          dir="ltr"
          min={0}
          step="any"
          value={value === null || value === undefined ? '' : String(value)}
          placeholder="غير مضبوط"
          onChange={(e) => onChange(e.target.value === '' ? null : Number(e.target.value))}
        />
        {row.hint_ar && <span className="j-field-hint">{row.hint_ar}</span>}
      </label>
    )
  }

  if (row.value_type === 'json') {
    return (
      <label className="j-field" htmlFor={id}>
        <span className="j-field-label">{row.label_ar}</span>
        <input
          id={id}
          type="text"
          dir="ltr"
          value={JSON.stringify(value ?? null)}
          onChange={(e) => {
            try { onChange(JSON.parse(e.target.value) as Json) } catch { /* keep the last valid value */ }
          }}
        />
        {row.hint_ar && <span className="j-field-hint">{row.hint_ar}</span>}
      </label>
    )
  }

  return (
    <label className="j-field" htmlFor={id}>
      <span className="j-field-label">{row.label_ar}</span>
      <input
        id={id}
        type="text"
        value={value === null || value === undefined ? '' : String(value)}
        placeholder="غير مضبوط"
        onChange={(e) => onChange(e.target.value === '' ? null : e.target.value)}
      />
      {row.hint_ar && <span className="j-field-hint">{row.hint_ar}</span>}
    </label>
  )
}
