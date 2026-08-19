import type { Metadata } from 'next'
import { SettingsEditor } from './SettingsEditor'
import { createAdminClient } from '@/lib/supabase/admin'
import { availableProviders } from '@/lib/payments'
import type { AppConfigRow } from '@/lib/supabase/database.types'

// ─── Settings, and the price ────────────────────────────────────────────────
//
// This screen is the reason `app_config` exists. The owner's instruction was
// that the price be editable from here and never written in the code — so there
// is no amount anywhere in `src/`, and until it is set on this page the
// platform renders a subscribe button with no number on it.
//
// The rows carry their own Arabic labels and hints, so the form is generated
// from the table rather than hand-written. Adding a setting is a migration, not
// a UI change, and the two can never drift apart.

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'الإعدادات', robots: { index: false } }

export default async function AdminSettingsPage() {
  const admin = createAdminClient()
  const { data, error } = await admin
    .from('app_config')
    .select('*')
    .order('group_key')
    .order('sort_order')

  if (error) {
    return <p className="j-admin-error">تعذّر تحميل الإعدادات: {error.message}</p>
  }

  return (
    <SettingsEditor
      rows={(data ?? []) as AppConfigRow[]}
      providers={availableProviders()}
    />
  )
}
