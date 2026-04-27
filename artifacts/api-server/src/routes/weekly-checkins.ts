import { Router, Request, Response } from 'express';
import { db } from '@workspace/db';
import { weeklyCheckInsTable, weeklyLeaderboardTable, founderProfilesTable, journeyProgressTable } from '@workspace/db/schema';
import { eq, desc, sql } from 'drizzle-orm';

const router = Router();

interface CheckInData {
  email: string;
  currentStage: string;
  reflections: string;
  focusArea: string;
  nextWeekGoals: string;
}

function getCurrentWeek(): { weekNumber: number; year: number } {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 1);
  const diff = now.getTime() - start.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  const dayOfYear = Math.floor(diff / oneDay);
  const weekNumber = Math.ceil((dayOfYear + start.getDay() + 1) / 7);

  return {
    weekNumber,
    year: now.getFullYear(),
  };
}

function calculateLeaderboardRank() {
  return sql<string>`
    ROW_NUMBER() OVER (ORDER BY ${weeklyLeaderboardTable.recentActivityScore} DESC, ${weeklyLeaderboardTable.averageProgress} DESC)
  `;
}

router.post('/submit', async (req: Request, res: Response) => {
  try {
    const { email, currentStage, reflections, focusArea, nextWeekGoals } = req.body as CheckInData;

    if (!email || !currentStage) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const { weekNumber, year } = getCurrentWeek();

    // Get founder profile for company name
    const profile = await db
      .select()
      .from(founderProfilesTable)
      .where(eq(founderProfilesTable.userId, email))
      .limit(1);

    // Get journey progress for scorecard
    const progress = await db
      .select()
      .from(journeyProgressTable)
      .where(eq(journeyProgressTable.userId, email))
      .limit(1);

    const companyName = profile[0]?.companyName || 'Anonymous';
    const scorecard = progress[0]
      ? {
          milestonesCompleted: progress[0].completedMilestones,
          milestonesTarget: progress[0].totalMilestones,
          progressPercentage: progress[0].progressPercentage,
        }
      : null;

    // Create or update check-in
    const existingCheckIn = await db
      .select()
      .from(weeklyCheckInsTable)
      .where(eq(weeklyCheckInsTable.userId, email));

    const thisWeeksCheckIn = existingCheckIn.find(
      ci => ci.weekNumber === weekNumber && ci.year === year
    );

    let checkInId;
    if (thisWeeksCheckIn) {
      await db
        .update(weeklyCheckInsTable)
        .set({
          currentStage,
          scorecard,
          reflections,
          focusArea,
          nextWeekGoals,
          completed: true,
          updatedAt: new Date(),
        })
        .where(eq(weeklyCheckInsTable.id, thisWeeksCheckIn.id));
      checkInId = thisWeeksCheckIn.id;
    } else {
      const [newCheckIn] = await db
        .insert(weeklyCheckInsTable)
        .values({
          userId: email,
          weekNumber,
          year,
          currentStage,
          scorecard,
          reflections,
          focusArea,
          nextWeekGoals,
          completed: true,
        })
        .returning({ id: weeklyCheckInsTable.id });
      checkInId = newCheckIn.id;
    }

    // Update or create leaderboard entry
    const existingLeaderboard = await db
      .select()
      .from(weeklyLeaderboardTable)
      .where(eq(weeklyLeaderboardTable.userId, email))
      .limit(1);

    const allCheckIns = existingCheckIn.length + 1;
    const consistencyScore = Math.min(allCheckIns * 10, 100);
    const avgProgress = scorecard?.progressPercentage || 0;
    const recentActivityScore = 50 + (scorecard?.progressPercentage || 0) / 2;

    if (existingLeaderboard.length > 0) {
      await db
        .update(weeklyLeaderboardTable)
        .set({
          companyName,
          currentStage,
          totalCheckIns: allCheckIns,
          consistency: consistencyScore,
          averageProgress: avgProgress,
          recentActivityScore,
          lastCheckInAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(weeklyLeaderboardTable.userId, email));
    } else {
      await db
        .insert(weeklyLeaderboardTable)
        .values({
          userId: email,
          companyName,
          currentStage,
          totalCheckIns: allCheckIns,
          consistency: consistencyScore,
          averageProgress: avgProgress,
          recentActivityScore,
          lastCheckInAt: new Date(),
        });
    }

    return res.json({ success: true, checkInId, weekNumber, year });
  } catch (error) {
    console.error('Check-in submission error:', error);
    return res.status(500).json({ error: 'Failed to submit check-in' });
  }
});

router.get('/:email/current', async (req: Request, res: Response) => {
  try {
    const { email } = req.params as { email: string };
    const { weekNumber, year } = getCurrentWeek();

    const checkIn = await db
      .select()
      .from(weeklyCheckInsTable)
      .where(eq(weeklyCheckInsTable.userId, email));

    const currentWeekCheckIn = checkIn.find(
      ci => ci.weekNumber === weekNumber && ci.year === year
    );

    if (!currentWeekCheckIn) {
      return res.status(404).json({ error: 'No check-in for current week' });
    }

    return res.json(currentWeekCheckIn);
  } catch (error) {
    console.error('Fetch check-in error:', error);
    return res.status(500).json({ error: 'Failed to fetch check-in' });
  }
});

router.get('/leaderboard', async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 20;

    const leaderboard = await db
      .select()
      .from(weeklyLeaderboardTable)
      .orderBy(desc(weeklyLeaderboardTable.recentActivityScore), desc(weeklyLeaderboardTable.averageProgress))
      .limit(limit);

    const ranked = leaderboard.map((entry, index) => ({
      ...entry,
      rank: index + 1,
    }));

    return res.json({ leaderboard: ranked });
  } catch (error) {
    console.error('Leaderboard fetch error:', error);
    return res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
});

router.get('/history/:email', async (req: Request, res: Response) => {
  try {
    const { email } = req.params as { email: string };

    const history = await db
      .select()
      .from(weeklyCheckInsTable)
      .where(eq(weeklyCheckInsTable.userId, email))
      .orderBy(desc(weeklyCheckInsTable.createdAt));

    return res.json({ checkIns: history });
  } catch (error) {
    console.error('History fetch error:', error);
    return res.status(500).json({ error: 'Failed to fetch history' });
  }
});

export default router;
