// `Section` lives in `@/lib/store` — that is the single declaration everything
// derives from. This file used to carry a rival copy (19 members, but with
// 'handwriting' where the store has 'settings') that nothing imported.
export type { Section } from '@/lib/store'
export { SECTIONS, isSection } from '@/lib/store'
