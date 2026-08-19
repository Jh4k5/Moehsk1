import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { UnitGate } from './UnitGate'
import { unitByRef } from '@/lib/curriculum'
import { isLocale, type Locale } from '@/lib/locale'
import type { HskLevelNo } from '@/lib/curriculum/types'

// ─── One unit's study session ───────────────────────────────────────────────
// A route, not a modal: a learner can bookmark where they are, the back button
// leaves the unit, and a shared link opens the same session.
//
// The unit is resolved on the SERVER, so a made-up URL 404s before any of the
// session code loads. Whether this particular learner may open it is decided on
// the client, because unlocking depends on their stored progress.

export const dynamicParams = true

export async function generateMetadata({
  params,
}: {
  params: Promise<{ level: string; lesson: string; unit: string }>
}): Promise<Metadata> {
  const { level, lesson, unit } = await params
  const found = resolve(level, lesson, unit)
  return { title: found ? found.title : 'وحدة', robots: { index: false } }
}

function resolve(level: string, lesson: string, unit: string) {
  const lv = Number(level)
  if (lv !== 1 && lv !== 2 && lv !== 3) return null
  const ref = { level: lv as HskLevelNo, lesson: Number(lesson), unit: Number(unit) }
  if (!Number.isInteger(ref.lesson) || !Number.isInteger(ref.unit)) return null
  return unitByRef(ref)
}

export default async function UnitPage({
  params,
}: {
  params: Promise<{ locale: string; level: string; lesson: string; unit: string }>
}) {
  const { locale: raw, level, lesson, unit } = await params
  if (!isLocale(raw)) notFound()
  const found = resolve(level, lesson, unit)
  if (!found) notFound()

  return <UnitGate unit={found} locale={raw as Locale} />
}
