import type { Metadata } from 'next'
import { createAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'المشتركون', robots: { index: false } }

const AR = new Intl.NumberFormat('ar-EG')

/** `active_until` is null for a lifetime grant — that is the schema's meaning
 *  of the field, not a missing value. */
function when(iso: string | null, lifetime: boolean): string {
  if (lifetime || !iso) return 'مدى الحياة'
  return new Date(iso).toLocaleDateString('ar-EG', { year: 'numeric', month: 'short', day: 'numeric' })
}

export default async function AdminSubscribersPage() {
  const admin = createAdminClient()
  const { data, error } = await admin.rpc('admin_list_users', {
    list_filter: 'subscribers',
    page_size: 100,
    page_offset: 0,
  })

  if (error) return <p className="j-admin-error">تعذّر تحميل المشتركين: {error.message}</p>

  const rows = data ?? []

  return (
    <div className="j-admin-card">
      <h2>المشتركون ({AR.format(rows.length)})</h2>
      {rows.length === 0 ? (
        <p className="j-admin-empty">
          لا مشتركين بعد. الأكواد تعمل من اليوم بلا بوابة دفع — ولّد دفعة من صفحة الأكواد.
        </p>
      ) : (
        <div className="j-table-wrap">
          <table className="j-table">
            <thead>
              <tr><th>البريد</th><th>الاسم</th><th>المصدر</th><th>الحالة</th><th>ينتهي</th><th>كلمات</th></tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id}>
                  <td dir="ltr" className="j-mono">{row.email ?? '—'}</td>
                  <td>{row.display_name ?? '—'}</td>
                  <td>{row.sub_source ?? '—'}</td>
                  <td>{row.sub_status ?? '—'}</td>
                  <td>{when(row.active_until, row.is_lifetime)}</td>
                  <td dir="ltr">{AR.format(row.words_learned)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
