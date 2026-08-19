import type { Metadata } from 'next'
import { CodesPanel } from './CodesPanel'
import { createAdminClient } from '@/lib/supabase/admin'
import type { RedemptionCodeUsageRow } from '@/lib/supabase/database.types'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'أكواد التفعيل', robots: { index: false } }

export default async function AdminCodesPage() {
  const admin = createAdminClient()
  const { data, error } = await admin
    .from('redemption_code_usage')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(200)

  if (error) return <p className="j-admin-error">تعذّر تحميل الأكواد: {error.message}</p>
  return <CodesPanel initialRows={(data ?? []) as RedemptionCodeUsageRow[]} />
}
