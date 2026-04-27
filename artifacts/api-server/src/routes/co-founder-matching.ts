import { Router, Request, Response } from 'express';
import { db } from '@workspace/db';
import {
  coFounderProfilesTable,
  coFounderMatchesTable,
  coFounderInteractionsTable,
  coFounderSkillsTable,
} from '@workspace/db/schema';
import { eq, ne, desc } from 'drizzle-orm';

const router = Router();

interface ProfileData {
  firstName: string;
  lastName: string;
  email: string;
  bio?: string;
  linkedinUrl?: string;
  twitterUrl?: string;
  profileImage?: string;
  stage: string;
  industry: string;
  mainFocus: string;
  yearsExperience?: string | number;
  previousExits?: string | number;
  skills: Array<{
    id: number;
    name: string;
    level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  }>;
  interests: string[];
  lookingFor?: string;
  timezone?: string;
  openToRelocate?: boolean;
  commitmentLevel?: string;
}

interface MatchScore {
  complementaryScore: number;
  stageMatch: number;
  industryMatch: number;
  interestMatch: number;
  timelineAlignment: number;
  overallScore: number;
  reasons: string[];
}

function toNumericString(val: string | number | undefined): string | null {
  if (!val) return null;
  if (typeof val === 'string') return val;
  return val.toString();
}

function calculateSkillComplementarity(
  skills1: Array<{ name: string; level: string }>,
  skills2: Array<{ name: string; level: string }>
): number {
  const skillSet1 = new Set(skills1.map((s) => s.name.toLowerCase()));
  const skillSet2 = new Set(skills2.map((s) => s.name.toLowerCase()));

  const intersection = new Set([...skillSet1].filter((x) => skillSet2.has(x)));
  const union = new Set([...skillSet1, ...skillSet2]);

  // Lower overlap = higher complementarity
  const overlapRatio = intersection.size / union.size;
  return Math.round((1 - overlapRatio) * 100);
}

function calculateMatchScore(
  profile1: any,
  profile2: any,
  mainFocus1: string,
  mainFocus2: string
): MatchScore {
  const reasons: string[] = [];

  // Skill complementarity (0-100)
  const complementaryScore = calculateSkillComplementarity(profile1.skills, profile2.skills);
  if (complementaryScore >= 70) reasons.push('Highly complementary skill sets');

  // Stage alignment (0-100)
  const stageMatch =
    profile1.stage === profile2.stage ? 100 : profile1.stage !== profile2.stage ? 50 : 0;
  if (stageMatch === 100) reasons.push('Aligned on company stage');

  // Industry match (0-100)
  const industryMatch =
    profile1.industry.toLowerCase() === profile2.industry.toLowerCase() ? 100 : 40;
  if (industryMatch === 100) reasons.push('Same industry focus');

  // Shared interests (0-100)
  const interests1 = new Set(profile1.interests.map((i: string) => i.toLowerCase()));
  const interests2 = new Set(profile2.interests.map((i: string) => i.toLowerCase()));
  const sharedInterests = [...interests1].filter((x) => interests2.has(x)).length;
  const interestMatch = Math.round((sharedInterests / Math.max(interests1.size, interests2.size, 1)) * 100);
  if (sharedInterests > 0) reasons.push(`${sharedInterests} shared interests`);

  // Commitment timeline alignment
  const timelineAlignment =
    profile1.commitmentLevel === profile2.commitmentLevel ? 100 : 50;

  // Different main focuses is actually good (complementary)
  if (mainFocus1 !== mainFocus2) {
    reasons.push(`Complementary focus: ${mainFocus1} + ${mainFocus2}`);
  }

  // Overall weighted score
  const overallScore = Math.round(
    complementaryScore * 0.35 + // Most important
      stageMatch * 0.2 +
      industryMatch * 0.15 +
      interestMatch * 0.15 +
      timelineAlignment * 0.15
  );

  return {
    complementaryScore,
    stageMatch,
    industryMatch,
    interestMatch,
    timelineAlignment,
    overallScore,
    reasons,
  };
}

router.post('/profiles', async (req: Request, res: Response) => {
  try {
    const { userId, ...profileData } = req.body as ProfileData & { userId: string };

    if (!userId || !profileData.firstName || !profileData.lastName || !profileData.email) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const profileComplete = !!(
      profileData.bio &&
      profileData.stage &&
      profileData.industry &&
      profileData.mainFocus &&
      profileData.skills?.length > 0
    );

    // Normalize numeric fields to strings
    const normalizedData = {
      ...profileData,
      yearsExperience: toNumericString(profileData.yearsExperience),
      previousExits: toNumericString(profileData.previousExits),
    };

    // Check if profile exists
    const existing = await db
      .select()
      .from(coFounderProfilesTable)
      .where(eq(coFounderProfilesTable.userId, userId as string))
      .limit(1);

    let profile;
    if (existing.length > 0) {
      // Update
      const [updated] = await db
        .update(coFounderProfilesTable)
        .set({
          firstName: profileData.firstName,
          lastName: profileData.lastName,
          email: profileData.email,
          bio: profileData.bio,
          linkedinUrl: profileData.linkedinUrl,
          twitterUrl: profileData.twitterUrl,
          profileImage: profileData.profileImage,
          stage: profileData.stage,
          industry: profileData.industry,
          mainFocus: profileData.mainFocus,
          yearsExperience: toNumericString(profileData.yearsExperience),
          previousExits: toNumericString(profileData.previousExits),
          skills: profileData.skills,
          interests: profileData.interests,
          lookingFor: profileData.lookingFor,
          timezone: profileData.timezone,
          openToRelocate: profileData.openToRelocate,
          commitmentLevel: profileData.commitmentLevel,
          profileComplete,
        })
        .where(eq(coFounderProfilesTable.userId, userId as string))
        .returning();
      profile = updated;
    } else {
      // Create
      const [created] = await db
        .insert(coFounderProfilesTable)
        .values({
          userId,
          firstName: profileData.firstName,
          lastName: profileData.lastName,
          email: profileData.email,
          bio: profileData.bio,
          linkedinUrl: profileData.linkedinUrl,
          twitterUrl: profileData.twitterUrl,
          profileImage: profileData.profileImage,
          stage: profileData.stage,
          industry: profileData.industry,
          mainFocus: profileData.mainFocus,
          yearsExperience: toNumericString(profileData.yearsExperience),
          previousExits: toNumericString(profileData.previousExits),
          skills: profileData.skills,
          interests: profileData.interests,
          lookingFor: profileData.lookingFor,
          timezone: profileData.timezone,
          openToRelocate: profileData.openToRelocate,
          commitmentLevel: profileData.commitmentLevel,
          profileComplete,
        })
        .returning();
      profile = created;
    }

    return res.json({ success: true, profile });
  } catch (error) {
    console.error('Profile save error:', error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to save profile',
    });
  }
});

router.get('/profiles/:userId', async (req: Request, res: Response) => {
  try {
    const userId = Array.isArray(req.params.userId) ? req.params.userId[0] : req.params.userId;

    const profile = await db
      .select()
      .from(coFounderProfilesTable)
      .where(eq(coFounderProfilesTable.userId, userId))
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

router.get('/candidates/:userId', async (req: Request, res: Response) => {
  try {
    const userId = Array.isArray(req.params.userId) ? req.params.userId[0] : req.params.userId;
    const { limit = 10 } = req.query;

    // Get user profile
    const userProfiles = await db
      .select()
      .from(coFounderProfilesTable)
      .where(eq(coFounderProfilesTable.userId, userId))
      .limit(1);

    if (userProfiles.length === 0) {
      return res.status(404).json({ error: 'User profile not found' });
    }

    const userProfile = userProfiles[0];

    // Get all other profiles
    const allProfiles = await db
      .select()
      .from(coFounderProfilesTable)
      .where(ne(coFounderProfilesTable.userId, userId));

    // Calculate match scores
    const matches = allProfiles
      .map((profile) => {
        const matchScore = calculateMatchScore(
          userProfile,
          profile,
          userProfile.mainFocus,
          profile.mainFocus
        );
        return {
          profile,
          ...matchScore,
        };
      })
      .sort((a, b) => b.overallScore - a.overallScore)
      .slice(0, parseInt(limit as string) || 10);

    return res.json(matches);
  } catch (error) {
    console.error('Candidates fetch error:', error);
    return res.status(500).json({ error: 'Failed to fetch candidates' });
  }
});

router.post('/interact', async (req: Request, res: Response) => {
  try {
    const { userId, targetUserId, interactionType } = req.body as {
      userId: string;
      targetUserId: string;
      interactionType: string;
    };

    if (!userId || !targetUserId || !interactionType) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Record interaction
    const [interaction] = await db
      .insert(coFounderInteractionsTable)
      .values({
        userId,
        targetUserId,
        interactionType,
      })
      .returning();

    // Update viewed profiles in user profile
    if (interactionType === 'viewed') {
      const [profile] = await db
        .select()
        .from(coFounderProfilesTable)
        .where(eq(coFounderProfilesTable.userId, userId))
        .limit(1);

      if (profile) {
        const viewedProfiles = (profile.viewedProfiles as number[]) || [];
        if (!viewedProfiles.includes(parseInt(targetUserId))) {
          viewedProfiles.push(parseInt(targetUserId));
          await db
            .update(coFounderProfilesTable)
            .set({ viewedProfiles })
            .where(eq(coFounderProfilesTable.userId, userId));
        }
      }
    }

    return res.json({ success: true, interaction });
  } catch (error) {
    console.error('Interaction record error:', error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to record interaction',
    });
  }
});

router.get('/matches/:userId', async (req: Request, res: Response) => {
  try {
    const userId = Array.isArray(req.params.userId) ? req.params.userId[0] : req.params.userId;

    const matches = await db
      .select()
      .from(coFounderMatchesTable)
      .where(eq(coFounderMatchesTable.userId1, userId))
      .orderBy(desc(coFounderMatchesTable.overallScore))
      .limit(50);

    return res.json(matches);
  } catch (error) {
    console.error('Matches fetch error:', error);
    return res.status(500).json({ error: 'Failed to fetch matches' });
  }
});

export default router;
