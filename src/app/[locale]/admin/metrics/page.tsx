import type { Metadata } from 'next'
import { createAdminClient } from '@/lib/supabase/admin'

// ─── The numbers ────────────────────────────────────────────────────────────
//
// Whatever `admin_metrics` computes, rendered. The arithmetic is in SQL so a
// report run by hand and this page cannot disagree — two definitions of
// "active subscriber" is how a business ends up arguing with its own dashboard.

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'الإحصاءات', robots: { index: false } }

const AR = new Intl.NumberFormat('ar-EG')

const LABEL: Record<string, string> = {
  usersTotal: 'مستخدم',
  usersNew: 'مستخدم جديد',
  subscribersActive: 'مشترك فعّال',
  subscribersLifetime: 'مدى الحياة',
  subscribersExpiring30d: 'ينتهي خلال ٣٠ يوماً',
  codesTotal: 'كود',
  codesAvailable: 'كود متاح',
  redemptionsTotal: 'تفعيل',
  redemptionsWindow: 'تفعيل في المدّة',
  activeLearnersWindow: 'متعلّم نشط',
  unitsCompletedWindow: 'وحدة أُنجزت',
}

export default async function AdminMetricsPage() {
  const admin = createAdminClient()
  const { data, error } = await admin.rpc('admin_metrics', { window_days: 30 })

  if (error) return <p className="j-admin-error">تعذّر تحميل الإحصاءات: {error.message}</p>

  const metrics = (data ?? {}) as Record<string, unknown>
  const cards = Object.entries(LABEL).filter(([key]) => typeof metrics[key] === 'number')

  return (
    <div className="j-metrics">
      <p className="j-settings-note">آخر ٣٠ يوماً.</p>
      {cards.length === 0 ? (
        <p className="j-admin-empty">لا بيانات بعد — لا مستخدمين ولا اشتراكات حتى الآن.</p>
      ) : (
        <div className="j-metric-grid">
          {cards.map(([key, label]) => (
            <div key={key} className="j-metric">
              <span className="j-metric-num">{AR.format(metrics[key] as number)}</span>
              <span className="j-metric-label">{label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
