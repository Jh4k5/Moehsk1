import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

// GET: Return all SRS cards from database
export async function GET() {
  try {
    const cards = await db.sRSCard.findMany({
      orderBy: { wordId: 'asc' },
    })
    return NextResponse.json(cards)
  } catch (error) {
    console.error('Failed to fetch SRS cards:', error)
    return NextResponse.json({ error: 'Failed to fetch SRS cards' }, { status: 500 })
  }
}

// POST: Upsert an SRS card (accept wordId, quality rating 0-5)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { wordId, quality } = body

    if (wordId === undefined || quality === undefined) {
      return NextResponse.json({ error: 'wordId and quality are required' }, { status: 400 })
    }

    if (typeof quality !== 'number' || quality < 0 || quality > 5) {
      return NextResponse.json({ error: 'quality must be between 0 and 5' }, { status: 400 })
    }

    const q = quality as number

    // Check if card exists
    const existing = await db.sRSCard.findUnique({
      where: { wordId: wordId as number },
    })

    let easeFactor: number
    let interval: number
    let repetitions: number

    if (existing) {
      easeFactor = existing.easeFactor
      interval = existing.interval
      repetitions = existing.repetitions
    } else {
      easeFactor = 2.5
      interval = 1
      repetitions = 0
    }

    // SM-2 Algorithm
    if (q >= 3) {
      // Success
      if (repetitions === 0) {
        interval = 1
      } else if (repetitions === 1) {
        interval = 6
      } else {
        interval = Math.round(interval * easeFactor)
      }
      repetitions++
    } else {
      // Failure
      repetitions = 0
      interval = 1
    }

    // Ease factor adjustment
    easeFactor = Math.max(
      1.3,
      easeFactor + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
    )

    // Calculate next review date
    const nextReview = new Date()
    nextReview.setDate(nextReview.getDate() + interval)

    const reviewCount = existing ? existing.reviewCount + 1 : 1

    // Upsert the card
    const card = await db.sRSCard.upsert({
      where: { wordId: wordId as number },
      create: {
        wordId: wordId as number,
        easeFactor,
        interval,
        repetitions,
        nextReview,
        lastReview: new Date(),
        reviewCount,
      },
      update: {
        easeFactor,
        interval,
        repetitions,
        nextReview,
        lastReview: new Date(),
        reviewCount,
      },
    })

    return NextResponse.json(card)
  } catch (error) {
    console.error('Failed to upsert SRS card:', error)
    return NextResponse.json({ error: 'Failed to upsert SRS card' }, { status: 500 })
  }
}

// DELETE: Reset all cards
export async function DELETE() {
  try {
    await db.sRSCard.deleteMany()
    return NextResponse.json({ success: true, message: 'All SRS cards reset' })
  } catch (error) {
    console.error('Failed to delete SRS cards:', error)
    return NextResponse.json({ error: 'Failed to delete SRS cards' }, { status: 500 })
  }
}
