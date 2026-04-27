import { Router, Request, Response } from 'express';
import { db } from '@workspace/db';
import { journeyMilestonesTable, journeyProgressTable, founderProfilesTable } from '@workspace/db/schema';
import { eq } from 'drizzle-orm';

const router = Router();

type Stage = 'Ideation' | 'Building' | 'Validating' | 'Revenue' | 'Scaling';

const MILESTONE_TEMPLATES: Record<Stage, Array<{ name: string; description: string }>> = {
  Ideation: [
    { name: 'Validate Market Problem', description: 'Talk to 10+ potential customers about the problem' },
    { name: 'Create Minimal Concept', description: 'Build a simple prototype or mockup' },
    { name: 'Document Solution', description: 'Write down how your solution will work' },
    { name: 'Identify Competitors', description: 'Research and list 5+ direct and indirect competitors' },
    { name: 'Define Target Customer', description: 'Create a detailed profile of your ideal customer' },
  ],
  Building: [
    { name: 'Core Feature Complete', description: 'Build and deploy your core product feature' },
    { name: 'Invite Beta Users', description: 'Get 10+ beta users to test your product' },
    { name: 'Gather Feedback', description: 'Collect and document user feedback' },
    { name: 'Iterate on Feedback', description: 'Implement improvements based on user input' },
    { name: 'Beta Launch', description: 'Publicly launch beta version' },
  ],
  Validating: [
    { name: 'Measure Product-Market Fit', description: 'Survey users: would they be disappointed without this?' },
    { name: 'First 100 Users', description: 'Acquire your first 100 active users' },
    { name: 'User Retention Analysis', description: 'Analyze which users keep coming back' },
    { name: 'Identify Use Cases', description: 'Document your top 3 customer use cases' },
    { name: 'Pricing Strategy', description: 'Test and validate your pricing model' },
  ],
  Revenue: [
    { name: 'First Dollar Revenue', description: 'Get your first paying customer' },
    { name: 'Reach $1K MRR', description: 'Achieve $1,000 monthly recurring revenue' },
    { name: 'Build Sales Process', description: 'Document and systematize your sales approach' },
    { name: 'Customer Success Program', description: 'Create onboarding and support for customers' },
    { name: 'Reach $10K MRR', description: 'Achieve $10,000 monthly recurring revenue' },
  ],
  Scaling: [
    { name: 'Product-Market Fit Confirmed', description: 'Clear metrics showing product-market fit' },
    { name: 'Build Growth Loops', description: 'Implement viral or referral growth mechanisms' },
    { name: 'Hire First Team Member', description: 'Bring on your first full-time employee' },
    { name: 'Series A Preparation', description: 'Get financials and metrics investor-ready' },
    { name: 'Reach $100K MRR', description: 'Achieve $100,000 monthly recurring revenue' },
  ],
};

router.post('/initialize/:email', async (req: Request, res: Response) => {
  try {
    const { email } = req.params as { email: string };

    const profile = await db
      .select()
      .from(founderProfilesTable)
      .where(eq(founderProfilesTable.userId, email))
      .limit(1);

    if (profile.length === 0) {
      return res.status(404).json({ error: 'Founder profile not found. Complete onboarding first.' });
    }

    const stage = (profile[0].stage || 'Ideation') as Stage;
    const templates = MILESTONE_TEMPLATES[stage] || MILESTONE_TEMPLATES.Ideation;

    // Clear existing milestones for fresh start
    await db
      .delete(journeyMilestonesTable)
      .where(eq(journeyMilestonesTable.userId, email));

    // Create milestone records
    const milestoneIds: number[] = [];
    for (let i = 0; i < templates.length; i++) {
      const [milestone] = await db
        .insert(journeyMilestonesTable)
        .values({
          userId: email,
          stage,
          milestoneName: templates[i].name,
          description: templates[i].description,
          displayOrder: i,
          completed: false,
        })
        .returning({ id: journeyMilestonesTable.id });
      milestoneIds.push(milestone.id);
    }

    // Create or update progress record
    const existingProgress = await db
      .select()
      .from(journeyProgressTable)
      .where(eq(journeyProgressTable.userId, email))
      .limit(1);

    if (existingProgress.length > 0) {
      await db
        .update(journeyProgressTable)
        .set({
          currentStage: stage,
          completedMilestones: 0,
          totalMilestones: templates.length,
          progressPercentage: 0,
          updatedAt: new Date(),
        })
        .where(eq(journeyProgressTable.userId, email));
    } else {
      await db
        .insert(journeyProgressTable)
        .values({
          userId: email,
          currentStage: stage,
          completedMilestones: 0,
          totalMilestones: templates.length,
          progressPercentage: 0,
        });
    }

    return res.json({
      success: true,
      stage,
      milestones: milestoneIds.length,
    });
  } catch (error) {
    console.error('Journey initialization error:', error);
    return res.status(500).json({ error: 'Failed to initialize journey' });
  }
});

router.get('/milestones/:email', async (req: Request, res: Response) => {
  try {
    const { email } = req.params as { email: string };

    const milestones = await db
      .select()
      .from(journeyMilestonesTable)
      .where(eq(journeyMilestonesTable.userId, email));

    return res.json({ milestones });
  } catch (error) {
    console.error('Fetch milestones error:', error);
    return res.status(500).json({ error: 'Failed to fetch milestones' });
  }
});

router.get('/progress/:email', async (req: Request, res: Response) => {
  try {
    const { email } = req.params as { email: string };

    const progress = await db
      .select()
      .from(journeyProgressTable)
      .where(eq(journeyProgressTable.userId, email))
      .limit(1);

    if (progress.length === 0) {
      return res.status(404).json({ error: 'No journey progress found' });
    }

    return res.json(progress[0]);
  } catch (error) {
    console.error('Fetch progress error:', error);
    return res.status(500).json({ error: 'Failed to fetch progress' });
  }
});

router.post('/complete-milestone', async (req: Request, res: Response) => {
  try {
    const { email, milestoneId } = req.body as { email: string; milestoneId: number };

    if (!email || !milestoneId) {
      return res.status(400).json({ error: 'Missing email or milestoneId' });
    }

    // Mark milestone as complete
    await db
      .update(journeyMilestonesTable)
      .set({
        completed: true,
        completedAt: new Date(),
      })
      .where(eq(journeyMilestonesTable.id, milestoneId));

    // Get updated milestone count
    const completed = await db
      .select()
      .from(journeyMilestonesTable)
      .where(eq(journeyMilestonesTable.userId, email));

    const completedCount = completed.filter(m => m.completed).length;
    const totalCount = completed.length;
    const progressPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

    // Update progress
    await db
      .update(journeyProgressTable)
      .set({
        completedMilestones: completedCount,
        progressPercentage,
        updatedAt: new Date(),
      })
      .where(eq(journeyProgressTable.userId, email));

    return res.json({
      success: true,
      completed: completedCount,
      total: totalCount,
      percentage: progressPercentage,
    });
  } catch (error) {
    console.error('Complete milestone error:', error);
    return res.status(500).json({ error: 'Failed to complete milestone' });
  }
});

export default router;
