// ─── The navigation model — one table, every consumer reads it ──────────────
// Bottom bar, drawer, desktop rail and the library index are four views of this
// one list. A section added here appears in all of them, with a route, at once.
import {
  BookMarked, Bot, FileText, Gamepad2, GraduationCap, HelpCircle, Home,
  Image as ImageIcon, Languages, LayoutList, Library, Map, Medal,
  MessageCircle, MessageSquare, Mic, PenTool, RotateCcw, Target, User,
  type LucideIcon,
} from 'lucide-react'
import { SECTIONS, type Section } from '@/lib/store'
import type { Locale } from '@/lib/locale'

export type { Section }

export interface NavEntry {
  section: Section
  /** Path under the locale segment, e.g. `home` or `library/grammar`. */
  path: string
  ar: string
  en: string
  icon: LucideIcon
  /** Short label for the bottom bar, where 60px of width is the whole budget. */
  shortAr?: string
  shortEn?: string
  /** Free sections live in the library grid; the four primaries do not. */
  inLibrary: boolean
}

/**
 * Four sections are primary — they get a bottom-bar slot and a top-level route.
 * The remaining fifteen are the "free sections": review material, reachable
 * from the library and the drawer, outside the mandatory path.
 */
export const NAV: Record<Section, NavEntry> = {
  dashboard:     { section: 'dashboard',     path: 'home',                    ar: 'الرئيسية',        en: 'Home',                icon: Home,          inLibrary: false },
  lessons:       { section: 'lessons',       path: 'path',                    ar: 'مساري',           en: 'My path',             icon: LayoutList,    inLibrary: false },
  vocabulary:    { section: 'vocabulary',    path: 'review',                  ar: 'مراجعة',          en: 'Review',              icon: RotateCcw,     inLibrary: false },
  settings:      { section: 'settings',      path: 'me',                      ar: 'حسابي',           en: 'Account',             icon: User,          inLibrary: false },

  grammar:       { section: 'grammar',       path: 'library/grammar',         ar: 'القواعد',          en: 'Grammar',             icon: GraduationCap, inLibrary: true },
  sentences:     { section: 'sentences',     path: 'library/sentences',       ar: 'الجمل',            en: 'Sentences',           icon: MessageCircle, inLibrary: true },
  stories:       { section: 'stories',       path: 'library/stories',         ar: 'القصص',            en: 'Stories',             icon: BookMarked,    inLibrary: true },
  conversations: { section: 'conversations', path: 'library/conversations',   ar: 'المحادثات',        en: 'Conversations',       icon: MessageSquare, inLibrary: true },
  practice:      { section: 'practice',      path: 'library/practice',        ar: 'التمارين',         en: 'Exercises',           icon: Target,        inLibrary: true },
  games:         { section: 'games',         path: 'library/games',           ar: 'الألعاب',          en: 'Games',               icon: Gamepad2,      inLibrary: true },
  exam:          { section: 'exam',          path: 'library/exam',            ar: 'محاكي الامتحان',   en: 'Exam simulator',      icon: FileText,      inLibrary: true },
  qa:            { section: 'qa',            path: 'library/qa',              ar: 'أسئلة يومية',      en: 'Daily Q&A',           icon: HelpCircle,    inLibrary: true },
  'visual-dict': { section: 'visual-dict',   path: 'library/visual-dict',     ar: 'القاموس البصري',   en: 'Visual dictionary',   icon: ImageIcon,     inLibrary: true },
  pinyin:        { section: 'pinyin',        path: 'library/pinyin',          ar: 'البينين',          en: 'Pinyin',              icon: Languages,     inLibrary: true },
  hanzi:         { section: 'hanzi',         path: 'library/hanzi',           ar: 'الحروف',           en: 'Characters',          icon: PenTool,       inLibrary: true },
  pronunciation: { section: 'pronunciation', path: 'library/pronunciation',   ar: 'تدريب النطق',      en: 'Pronunciation',       icon: Mic,           inLibrary: true },
  roadmap:       { section: 'roadmap',       path: 'library/roadmap',         ar: 'خريطة الطريق',     en: 'Roadmap',             icon: Map,           inLibrary: true },
  achievements:  { section: 'achievements',  path: 'library/achievements',    ar: 'الإنجازات',        en: 'Achievements',        icon: Medal,         inLibrary: true },
  chat:          { section: 'chat',          path: 'library/chat',            ar: 'المعلّم الذكي',     en: 'AI tutor',            icon: Bot,           inLibrary: true },
}

/** Full href for a section, e.g. `/ar/library/grammar`. */
export function hrefFor(locale: Locale, section: Section): string {
  return `/${locale}/${NAV[section].path}`
}

/** The library index itself — a route, not a section. */
export function libraryHref(locale: Locale): string {
  return `/${locale}/library`
}

/** Every free section, in the order the library grid shows them. */
export const LIBRARY_SECTIONS: Section[] = SECTIONS.filter((s) => NAV[s].inLibrary)

/** The library slug for a section, e.g. `grammar` — used by `library/[section]`. */
export const LIBRARY_SLUGS: string[] = LIBRARY_SECTIONS.map((s) => NAV[s].path.split('/')[1])

/** Reverse lookup: `grammar` → the `grammar` section. */
export function sectionForSlug(slug: string): Section | null {
  const found = LIBRARY_SECTIONS.find((s) => NAV[s].path === `library/${slug}`)
  return found ?? null
}

/**
 * The five bottom-bar slots, exactly as the design files draw them:
 * الرئيسية · مساري · مراجعة · المكتبة · حسابي.
 * The fifth is the library index, not a section — so it carries its own entry.
 */
export interface BottomTab {
  key: string
  href: (locale: Locale) => string
  ar: string
  en: string
  icon: LucideIcon
  /** Which pathnames light this tab up, beyond an exact match. */
  matches: (pathAfterLocale: string) => boolean
}

export const BOTTOM_TABS: BottomTab[] = [
  {
    key: 'home',
    href: (l) => hrefFor(l, 'dashboard'),
    ar: NAV.dashboard.ar, en: NAV.dashboard.en, icon: NAV.dashboard.icon,
    matches: (p) => p === '' || p === 'home',
  },
  {
    key: 'path',
    href: (l) => hrefFor(l, 'lessons'),
    ar: NAV.lessons.ar, en: NAV.lessons.en, icon: NAV.lessons.icon,
    matches: (p) => p === 'path' || p.startsWith('path/'),
  },
  {
    key: 'review',
    href: (l) => hrefFor(l, 'vocabulary'),
    ar: NAV.vocabulary.ar, en: NAV.vocabulary.en, icon: NAV.vocabulary.icon,
    matches: (p) => p === 'review' || p.startsWith('review/'),
  },
  {
    key: 'library',
    href: (l) => libraryHref(l),
    ar: 'المكتبة', en: 'Library', icon: Library,
    matches: (p) => p === 'library' || p.startsWith('library/'),
  },
  {
    key: 'me',
    href: (l) => hrefFor(l, 'settings'),
    ar: NAV.settings.ar, en: NAV.settings.en, icon: NAV.settings.icon,
    matches: (p) => p === 'me' || p.startsWith('me/'),
  },
]

/** Drawer groups — the overflow the bottom bar has no room for. */
export const DRAWER_GROUPS: { ar: string; en: string; sections: Section[] }[] = [
  { ar: 'التعلّم', en: 'Learn',    sections: ['grammar', 'sentences', 'stories', 'conversations'] },
  { ar: 'التدريب', en: 'Practice', sections: ['practice', 'games', 'exam', 'qa'] },
  { ar: 'الأدوات', en: 'Tools',    sections: ['visual-dict', 'pinyin', 'hanzi', 'pronunciation'] },
  { ar: 'أخرى',   en: 'More',     sections: ['roadmap', 'achievements', 'chat', 'settings'] },
]

/** Everything below the locale segment, e.g. `/ar/library/grammar` → `library/grammar`. */
export function pathAfterLocale(pathname: string): string {
  const parts = pathname.split('/').filter(Boolean)
  return parts.slice(1).join('/')
}
