// ─── [2.7] Chapters, and where the exam belongs ─────────────────────────────
//
// The curriculum had two levels of grouping — lesson and unit — and an exam
// stapled onto the last unit of EVERY lesson. The owner's brief is explicit
// that this is wrong: «اختبار الفصل → في نهاية كل فصل، لا بعد كل درس».
//
// The reasoning is not administrative. An exam sat at the end of a lesson tests
// material the learner met in the last twenty minutes; it measures short-term
// recall and reliably returns a high score, which feels like progress and
// predicts nothing. An exam that spans a chapter is the first point at which
// anything has had time to be forgotten — so it is the first point at which a
// score means something. Doing it after every lesson does not make the platform
// stricter, it makes the number meaningless.
//
// A chapter is DATA, like the stage table: how a level divides is a curriculum
// decision, and it must be changeable without touching engine code.

import type { HskLevelNo } from './types'

export interface ChapterSpec {
  level: HskLevelNo
  /** 1-based chapter number within its level. */
  number: number
  /** Lesson ids this chapter covers, in order. */
  lessons: number[]
  titleAr: string
  titleEn: string
}

/**
 * How each level divides into chapters.
 *
 * The sizes follow the levels' own lesson counts — HSK1 and HSK2 have fifteen
 * lessons and split into three fives; HSK3 has eighteen and splits into three
 * sixes. Even chapters matter more than a fixed chapter size: a final chapter
 * of one or two lessons would put a cumulative exam over almost no material,
 * which is the same defect as a per-lesson exam wearing a different name.
 */
const CHAPTER_PLAN: { level: HskLevelNo; lessons: number; per: number }[] = [
  { level: 1, lessons: 15, per: 5 },
  { level: 2, lessons: 15, per: 5 },
  { level: 3, lessons: 18, per: 6 },
]

function buildChapters(): ChapterSpec[] {
  const out: ChapterSpec[] = []
  for (const plan of CHAPTER_PLAN) {
    let number = 1
    for (let start = 1; start <= plan.lessons; start += plan.per) {
      const lessons: number[] = []
      for (let id = start; id < start + plan.per && id <= plan.lessons; id += 1) lessons.push(id)
      out.push({
        level: plan.level,
        number,
        lessons,
        titleAr: `الفصل ${number} — الدروس ${lessons[0]}–${lessons[lessons.length - 1]}`,
        titleEn: `Chapter ${number} — lessons ${lessons[0]}–${lessons[lessons.length - 1]}`,
      })
      number += 1
    }
  }
  return out
}

export const CHAPTERS: readonly ChapterSpec[] = buildChapters()

/** The chapter a lesson belongs to, or null if the lesson is out of range. */
export function chapterOf(level: HskLevelNo, lesson: number): ChapterSpec | null {
  return CHAPTERS.find((c) => c.level === level && c.lessons.includes(lesson)) ?? null
}

/** Is this the last lesson of its chapter? The exam sits after it. */
export function isChapterEnd(level: HskLevelNo, lesson: number): boolean {
  const chapter = chapterOf(level, lesson)
  if (!chapter) return false
  return chapter.lessons[chapter.lessons.length - 1] === lesson
}

export function chaptersOf(level: HskLevelNo): ChapterSpec[] {
  return CHAPTERS.filter((c) => c.level === level)
}

export function chapterTitle(chapter: ChapterSpec, locale: 'ar' | 'en'): string {
  return locale === 'en' ? chapter.titleEn : chapter.titleAr
}

/** Stable key for progress records: `chapter:1:2`. */
export function chapterKey(chapter: ChapterSpec): string {
  return `chapter:${chapter.level}:${chapter.number}`
}
