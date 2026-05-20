import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { userId, wordId, action, srsData } = await req.json()
    if (!userId || !wordId) {
      return NextResponse.json({ error: 'معرّف المستخدم والكلمة مطلوبان' }, { status: 400 })
    }

    if (action === 'toggleLearned') {
      const existing = await db.userProgress.findUnique({
        where: { userId_wordId: { userId, wordId } },
      })
      if (existing) {
        const updated = await db.userProgress.update({
          where: { userId_wordId: { userId, wordId } },
          data: { learned: !existing.learned },
        })
        return NextResponse.json({ learned: updated.learned })
      } else {
        const created = await db.userProgress.create({
          data: { userId, wordId, learned: true },
        })
        return NextResponse.json({ learned: created.learned })
      }
    }

    if (action === 'toggleBookmark') {
      const existing = await db.userProgress.findUnique({
        where: { userId_wordId: { userId, wordId } },
      })
      if (existing) {
        const updated = await db.userProgress.update({
          where: { userId_wordId: { userId, wordId } },
          data: { bookmarked: !existing.bookmarked },
        })
        return NextResponse.json({ bookmarked: updated.bookmarked })
      } else {
        const created = await db.userProgress.create({
          data: { userId, wordId, bookmarked: true },
        })
        return NextResponse.json({ bookmarked: created.bookmarked })
      }
    }

    if (action === 'updateSRS') {
      const existing = await db.userProgress.findUnique({
        where: { userId_wordId: { userId, wordId } },
      })
      if (existing) {
        await db.userProgress.update({
          where: { userId_wordId: { userId, wordId } },
          data: { srsData: srsData ? JSON.stringify(srsData) : null },
        })
      } else {
        await db.userProgress.create({
          data: { userId, wordId, srsData: srsData ? JSON.stringify(srsData) : null },
        })
      }
      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: 'إجراء غير معروف' }, { status: 400 })
  } catch {
    return NextResponse.json({ error: 'خطأ في الخادم' }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get('userId')
    if (!userId) {
      return NextResponse.json({ error: 'معرّف المستخدم مطلوب' }, { status: 400 })
    }
    const progress = await db.userProgress.findMany({
      where: { userId },
    })
    return NextResponse.json(progress)
  } catch {
    return NextResponse.json({ error: 'خطأ في الخادم' }, { status: 500 })
  }
}
