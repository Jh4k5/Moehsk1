import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { calculateNextReview } from "@/lib/srs";
import type { Quality } from "@/lib/srs";

// GET: Retrieve user's word progress and stats
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as { id: string }).id;

    const [wordProgress, dailyProgress, stats] = await Promise.all([
      db.wordProgress.findMany({
        where: { userId },
        orderBy: { updatedAt: "desc" },
      }),
      db.userProgress.findMany({
        where: { userId },
        orderBy: { date: "desc" },
        take: 30,
      }),
      db.wordProgress.aggregate({
        where: { userId },
        _count: {
          _all: true,
        },
        _sum: {
          pronunciationScore: true,
          srsReviewCount: true,
        },
      }),
    ]);

    const learnedCount = await db.wordProgress.count({
      where: { userId, isLearned: true },
    });

    const bookmarkedCount = await db.wordProgress.count({
      where: { userId, isBookmarked: true },
    });

    return NextResponse.json({
      wordProgress,
      dailyProgress,
      stats: {
        totalWords: stats._count._all,
        learnedWords: learnedCount,
        bookmarkedWords: bookmarkedCount,
        avgPronunciationScore: stats._sum.pronunciationScore
          ? Math.round(
              (stats._sum.pronunciationScore as number) / stats._count._all
            )
          : 0,
        totalReviews: stats._sum.srsReviewCount || 0,
      },
    });
  } catch (error) {
    console.error("Failed to fetch user progress:", error);
    return NextResponse.json(
      { error: "Failed to fetch progress" },
      { status: 500 }
    );
  }
}

// POST: Save or update word progress
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as { id: string }).id;
    const body = await req.json();
    const { wordId, isLearned, isBookmarked, pronunciationScore, srsQuality } =
      body;

    if (typeof wordId !== "number") {
      return NextResponse.json(
        { error: "wordId is required and must be a number" },
        { status: 400 }
      );
    }

    // Get existing progress or create defaults
    const existing = await db.wordProgress.findUnique({
      where: { userId_wordId: { userId, wordId } },
    });

    const updateData: Record<string, unknown> = {};

    if (typeof isLearned === "boolean") updateData.isLearned = isLearned;
    if (typeof isBookmarked === "boolean") updateData.isBookmarked = isBookmarked;
    if (typeof pronunciationScore === "number") {
      updateData.pronunciationScore = pronunciationScore;
      updateData.pronunciationAttempts = {
        increment: 1,
      };
    }

    // Handle SRS update
    if (typeof srsQuality === "number" && srsQuality >= 0 && srsQuality <= 5) {
      const quality = srsQuality as Quality;
      const currentCard = existing
        ? {
            wordId: existing.wordId,
            easeFactor: existing.srsEaseFactor,
            interval: existing.srsInterval,
            repetitions: existing.srsRepetitions,
            nextReview: existing.srsNextReview?.toISOString() ?? null,
            lastReview: existing.srsLastReview?.toISOString() ?? null,
            reviewCount: existing.srsReviewCount,
            correctCount: existing.srsRepetitions, // use reps as correct count
          }
        : {
            wordId,
            easeFactor: 2.5,
            interval: 0,
            repetitions: 0,
            nextReview: null,
            lastReview: null,
            reviewCount: 0,
            correctCount: 0,
          };

      const updatedCard = calculateNextReview(currentCard, quality);

      updateData.srsEaseFactor = updatedCard.easeFactor;
      updateData.srsInterval = updatedCard.interval;
      updateData.srsRepetitions = updatedCard.repetitions;
      updateData.srsNextReview = updatedCard.nextReview
        ? new Date(updatedCard.nextReview)
        : new Date();
      updateData.srsLastReview = updatedCard.lastReview
        ? new Date(updatedCard.lastReview)
        : new Date();
      updateData.srsReviewCount = updatedCard.reviewCount;
    }

    const progress = await db.wordProgress.upsert({
      where: { userId_wordId: { userId, wordId } },
      create: {
        userId,
        wordId,
        ...(updateData.isLearned !== undefined && { isLearned: updateData.isLearned as boolean }),
        ...(updateData.isBookmarked !== undefined && { isBookmarked: updateData.isBookmarked as boolean }),
        ...(updateData.pronunciationScore !== undefined && { pronunciationScore: updateData.pronunciationScore as number }),
        ...(updateData.srsEaseFactor !== undefined && { srsEaseFactor: updateData.srsEaseFactor as number }),
        ...(updateData.srsInterval !== undefined && { srsInterval: updateData.srsInterval as number }),
        ...(updateData.srsRepetitions !== undefined && { srsRepetitions: updateData.srsRepetitions as number }),
        ...(updateData.srsNextReview !== undefined && { srsNextReview: updateData.srsNextReview as Date }),
        ...(updateData.srsLastReview !== undefined && { srsLastReview: updateData.srsLastReview as Date }),
        ...(updateData.srsReviewCount !== undefined && { srsReviewCount: updateData.srsReviewCount as number }),
      },
      update: {
        ...updateData,
        ...(updateData.pronunciationAttempts && {
          pronunciationAttempts: {
            increment: 1,
          },
        }),
      },
    });

    return NextResponse.json({ progress });
  } catch (error) {
    console.error("Failed to save progress:", error);
    return NextResponse.json(
      { error: "Failed to save progress" },
      { status: 500 }
    );
  }
}
