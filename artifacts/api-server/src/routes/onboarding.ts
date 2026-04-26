import { Router, Request, Response } from 'express';
import { db } from '@workspace/db';
import { founderProfilesTable, onboardingQuizzesTable } from '@workspace/db/schema';
import { eq } from 'drizzle-orm';

const router = Router();

interface OnboardingData {
  email: string;
  sector: string;
  stage: string;
  goal: string;
  teamSize: number;
  companyName: string;
  targetCustomer?: string;
  ideaDescription?: string;
}

router.post('/submit', async (req: Request, res: Response) => {
  try {
    const { email, sector, stage, goal, teamSize, companyName, targetCustomer, ideaDescription } = req.body as OnboardingData;

    if (!email || !sector || !stage || !goal) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Create or update founder profile
    const existingProfile = await db
      .select()
      .from(founderProfilesTable)
      .where(eq(founderProfilesTable.userId, email))
      .limit(1);

    let profileId;

    if (existingProfile.length > 0) {
      await db
        .update(founderProfilesTable)
        .set({
          sector,
          stage,
          goal,
          teamSize,
          companyName,
          targetCustomer,
          ideaDescription,
          completedQuiz: true,
          updatedAt: new Date(),
        })
        .where(eq(founderProfilesTable.userId, email));
      profileId = existingProfile[0].id;
    } else {
      const [newProfile] = await db
        .insert(founderProfilesTable)
        .values({
          userId: email,
          sector,
          stage,
          goal,
          teamSize,
          companyName,
          targetCustomer,
          ideaDescription,
          completedQuiz: true,
        })
        .returning({ id: founderProfilesTable.id });
      profileId = newProfile.id;
    }

    // Record quiz answers
    const existingQuiz = await db
      .select()
      .from(onboardingQuizzesTable)
      .where(eq(onboardingQuizzesTable.userId, email))
      .limit(1);

    if (existingQuiz.length > 0) {
      await db
        .update(onboardingQuizzesTable)
        .set({
          answer1_sector: sector,
          answer2_stage: stage,
          answer3_goal: goal,
          answer4_teamSize: teamSize,
          answer5_company: companyName,
          completedAt: new Date(),
        })
        .where(eq(onboardingQuizzesTable.userId, email));
    } else {
      await db
        .insert(onboardingQuizzesTable)
        .values({
          userId: email,
          answer1_sector: sector,
          answer2_stage: stage,
          answer3_goal: goal,
          answer4_teamSize: teamSize,
          answer5_company: companyName,
          completedAt: new Date(),
        });
    }

    return res.json({ success: true, profileId });
  } catch (error) {
    console.error('Onboarding error:', error);
    return res.status(500).json({ error: 'Failed to save onboarding data' });
  }
});

router.get('/profile/:email', async (req: Request, res: Response) => {
  try {
    const { email } = req.params as { email: string };
    const profile = await db
      .select()
      .from(founderProfilesTable)
      .where(eq(founderProfilesTable.userId, email))
      .limit(1);

    if (profile.length === 0) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    return res.json(profile[0]);
  } catch (error) {
    console.error('Profile fetch error:', error);
    return res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

export default router;
