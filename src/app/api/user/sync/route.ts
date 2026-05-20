import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

// GET: Retrieve user's full synced profile data
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as { id: string }).id;

    const user = await db.user.findUnique({
      where: { id: userId },
      select: {
        dailyStreak: true,
        xp: true,
        lastActiveDate: true,
        profileData: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    let profileData: Record<string, unknown> = {};
    try {
      profileData = user.profileData ? JSON.parse(user.profileData) : {};
    } catch {
      profileData = {};
    }

    return NextResponse.json({
      dailyStreak: user.dailyStreak,
      xp: user.xp,
      lastActiveDate: user.lastActiveDate,
      profileData,
    });
  } catch (error) {
    console.error("Failed to fetch sync data:", error);
    return NextResponse.json(
      { error: "Failed to fetch sync data" },
      { status: 500 }
    );
  }
}

// POST: Save user's full synced profile data
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as { id: string }).id;
    const body = await req.json();

    const {
      learnedWords,
      bookmarkedWords,
      completedStories,
      quizHistory,
      highScores,
      dailyStreak,
      lastStudyDate,
      srsCards,
      dailyActivity,
      xp,
    } = body as {
      learnedWords?: number[];
      bookmarkedWords?: number[];
      completedStories?: number[];
      quizHistory?: unknown[];
      highScores?: Record<string, number>;
      dailyStreak?: number;
      lastStudyDate?: string;
      srsCards?: Record<string, unknown>;
      dailyActivity?: Record<string, unknown>;
      xp?: number;
    };

    // Build the profile data blob
    const profileData: Record<string, unknown> = {};
    if (learnedWords !== undefined) profileData.learnedWords = learnedWords;
    if (bookmarkedWords !== undefined) profileData.bookmarkedWords = bookmarkedWords;
    if (completedStories !== undefined) profileData.completedStories = completedStories;
    if (quizHistory !== undefined) profileData.quizHistory = quizHistory;
    if (highScores !== undefined) profileData.highScores = highScores;
    if (lastStudyDate !== undefined) profileData.lastStudyDate = lastStudyDate;
    if (srsCards !== undefined) profileData.srsCards = srsCards;
    if (dailyActivity !== undefined) profileData.dailyActivity = dailyActivity;

    const today = new Date().toISOString().split("T")[0];

    // Update the user record
    await db.user.update({
      where: { id: userId },
      data: {
        dailyStreak: dailyStreak ?? 0,
        xp: xp ?? 0,
        lastActiveDate: today,
        profileData: JSON.stringify(profileData),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to save sync data:", error);
    return NextResponse.json(
      { error: "Failed to save sync data" },
      { status: 500 }
    );
  }
}
