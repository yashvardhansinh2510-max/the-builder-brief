# Builder Brief Product Features — 11-Week Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build core product features that drive founder activation, retention, and network effects through onboarding, journey tracking, accountability, AI intelligence, and co-founder matching.

**Architecture:** Build features in dependency order—onboarding quiz feeds all downstream personalization, journey tracker enables milestones/check-ins, market sizing and competitive scanning power premium tiers. Co-founder matching activates the network itself. Each feature is self-contained with API endpoints, React components, and Drizzle schema updates.

**Tech Stack:** React + Vite (frontend), Express 5 (API), PostgreSQL + Drizzle ORM (database), OpenAI API (AI features)

---

## File Structure

**Database Schema (Drizzle):**
- `lib/db/schema.ts` — Add: founderProfiles, onboardingQuizzes, journeyMilestones, weeklyCheckIns, marketSizingReports, coFounderMatches, competitorAnalyses

**API Routes (Express):**
- `artifacts/api-server/src/routes/onboarding.ts` — Quiz questions, answers, profile creation
- `artifacts/api-server/src/routes/journey.ts` — Milestone tracking, progress endpoints
- `artifacts/api-server/src/routes/checkIn.ts` — Weekly check-in submissions, leaderboard
- `artifacts/api-server/src/routes/intelligence.ts` — Market sizing, competitive scanning via OpenAI
- `artifacts/api-server/src/routes/matching.ts` — Co-founder matching algorithm

**Frontend Components (React):**
- `artifacts/specflow-newsletter/src/components/OnboardingQuiz.tsx` — 5-question quiz flow
- `artifacts/specflow-newsletter/src/components/JourneyTracker.tsx` — Visual milestone progress
- `artifacts/specflow-newsletter/src/components/WeeklyCheckIn.tsx` — Check-in form + leaderboard
- `artifacts/specflow-newsletter/src/components/MarketSizingEngine.tsx` — TAM analysis UI
- `artifacts/specflow-newsletter/src/components/CompetitorScanner.tsx` — Vulnerability analysis UI
- `artifacts/specflow-newsletter/src/components/CoFounderMatcher.tsx` — Match discovery + messaging

**Integration Points:**
- Auth: Clerk (existing) — extend user profile with quiz answers
- AI: OpenAI API for market sizing, competitive analysis (new endpoints)
- Database: Update schema, create migrations

---

# WEEK 1-2: ONBOARDING QUIZ

### Task 1: Create Drizzle schema for onboarding quiz and founder profiles

**Files:**
- Modify: `lib/db/schema.ts`

- [ ] **Step 1: Add founderProfile table to schema**

```typescript
export const founderProfiles = pgTable('founder_profiles', {
  id: serial('id').primaryKey(),
  userId: varchar('user_id').notNull(),
  sector: varchar('sector').notNull(), // 'B2B SaaS', 'DTC E-commerce', 'AI Tooling', 'Developer Infrastructure'
  stage: varchar('stage').notNull(), // 'Ideation', 'Building', 'Validating', 'Revenue', 'Scaling'
  goal: varchar('goal').notNull(), // 'Ship in 90 days', 'Reach $10K MRR', 'Raise Series A', 'Exit'
  targetCustomer: text('target_customer'),
  teamSize: integer('team_size'),
  companyName: varchar('company_name'),
  ideaDescription: text('idea_description'),
  completedQuiz: boolean('completed_quiz').default(false),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const onboardingQuizzes = pgTable('onboarding_quizzes', {
  id: serial('id').primaryKey(),
  userId: varchar('user_id').notNull().unique(),
  answer1_sector: varchar('answer1_sector'),
  answer2_stage: varchar('answer2_stage'),
  answer3_goal: varchar('answer3_goal'),
  answer4_teamSize: integer('answer4_team_size'),
  answer5_company: varchar('answer5_company'),
  completedAt: timestamp('completed_at'),
});
```

- [ ] **Step 2: Verify schema compiles**

Run: `cd /Users/yashvardhansinhjhala/the\ builder\ brief && pnpm run build 2>&1 | head -20`

Expected: No TypeScript errors in schema

- [ ] **Step 3: Commit schema**

```bash
cd /Users/yashvardhansinhjhala/the\ builder\ brief && git add lib/db/schema.ts && git commit -m "feat: add founder profile and onboarding quiz schema"
```

---

### Task 2: Create onboarding API endpoint (Express)

**Files:**
- Create: `artifacts/api-server/src/routes/onboarding.ts`
- Modify: `artifacts/api-server/src/index.ts` (add route)

- [ ] **Step 1: Create onboarding.ts with POST /api/onboarding/submit endpoint**

```typescript
import { Router, Request, Response } from 'express';
import { db } from '@/lib/db';
import { founderProfiles, onboardingQuizzes } from '@/lib/db/schema';
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
      .from(founderProfiles)
      .where(eq(founderProfiles.userId, email))
      .limit(1);

    let profileId;

    if (existingProfile.length > 0) {
      await db
        .update(founderProfiles)
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
        .where(eq(founderProfiles.userId, email));
      profileId = existingProfile[0].id;
    } else {
      const [newProfile] = await db
        .insert(founderProfiles)
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
        .returning({ id: founderProfiles.id });
      profileId = newProfile.id;
    }

    // Record quiz answers
    await db
      .insert(onboardingQuizzes)
      .values({
        userId: email,
        answer1_sector: sector,
        answer2_stage: stage,
        answer3_goal: goal,
        answer4_teamSize: teamSize,
        answer5_company: companyName,
        completedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: onboardingQuizzes.userId,
        set: {
          answer1_sector: sector,
          answer2_stage: stage,
          answer3_goal: goal,
          answer4_teamSize: teamSize,
          answer5_company: companyName,
          completedAt: new Date(),
        },
      });

    return res.json({ success: true, profileId });
  } catch (error) {
    console.error('Onboarding error:', error);
    return res.status(500).json({ error: 'Failed to save onboarding data' });
  }
});

router.get('/profile/:email', async (req: Request, res: Response) => {
  try {
    const { email } = req.params;
    const profile = await db
      .select()
      .from(founderProfiles)
      .where(eq(founderProfiles.userId, email))
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
```

- [ ] **Step 2: Add route to Express index.ts**

Open `artifacts/api-server/src/index.ts` and add:

```typescript
import onboardingRoutes from './routes/onboarding';

app.use('/api/onboarding', onboardingRoutes);
```

- [ ] **Step 3: Verify API compiles**

Run: `cd /Users/yashvardhansinhjhala/the\ builder\ brief/artifacts/api-server && pnpm run build 2>&1 | head -20`

Expected: No errors

- [ ] **Step 4: Commit API**

```bash
cd /Users/yashvardhansinhjhala/the\ builder\ brief && git add artifacts/api-server/src/routes/onboarding.ts artifacts/api-server/src/index.ts && git commit -m "feat: add onboarding quiz API endpoint"
```

---

### Task 3: Create OnboardingQuiz React component

**Files:**
- Create: `artifacts/specflow-newsletter/src/components/OnboardingQuiz.tsx`

- [ ] **Step 1: Create quiz component with all 5 questions**

```typescript
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { ChevronRight } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { toast } from 'sonner';

interface QuizAnswers {
  sector: string;
  stage: string;
  goal: string;
  teamSize: number;
  companyName: string;
  targetCustomer?: string;
  ideaDescription?: string;
}

const SECTORS = ['B2B SaaS', 'DTC E-commerce', 'AI Tooling', 'Developer Infrastructure'];
const STAGES = ['Ideation', 'Building', 'Validating', 'Revenue', 'Scaling'];
const GOALS = ['Ship in 90 days', 'Reach $10K MRR', 'Raise Series A', 'Exit'];

export default function OnboardingQuiz({ onComplete }: { onComplete?: () => void }) {
  const { user } = useAuth();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswers>({
    sector: '',
    stage: '',
    goal: '',
    teamSize: 1,
    companyName: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const questions = [
    {
      id: 'sector',
      question: 'What sector are you building in?',
      type: 'select',
      options: SECTORS,
    },
    {
      id: 'stage',
      question: 'What stage is your company at?',
      type: 'select',
      options: STAGES,
    },
    {
      id: 'goal',
      question: 'What is your primary goal in the next 12 months?',
      type: 'select',
      options: GOALS,
    },
    {
      id: 'teamSize',
      question: 'How many people are on your team?',
      type: 'number',
    },
    {
      id: 'companyName',
      question: 'What is your company name?',
      type: 'text',
    },
  ];

  const handleSelectAnswer = (value: string) => {
    const questionId = questions[currentQuestion].id as keyof QuizAnswers;
    setAnswers(prev => ({ ...prev, [questionId]: value }));
    moveToNext();
  };

  const handleTextAnswer = (value: string) => {
    const questionId = questions[currentQuestion].id as keyof QuizAnswers;
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const handleNumberAnswer = (value: number) => {
    setAnswers(prev => ({ ...prev, teamSize: value }));
  };

  const moveToNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    }
  };

  const handleSubmit = async () => {
    if (!user?.email) {
      toast.error('Not authenticated');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/onboarding/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user.email,
          ...answers,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save onboarding');
      }

      toast.success('Profile created! Personalizing your experience...');
      onComplete?.();
    } catch (error) {
      console.error('Submission error:', error);
      toast.error('Failed to save profile');
    } finally {
      setIsSubmitting(false);
    }
  };

  const question = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-6">
      <div className="max-w-2xl w-full">
        {/* Progress bar */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-4">
            <Badge className="bg-primary/10 text-primary border-none text-[10px] tracking-[0.3em]">
              QUESTION {currentQuestion + 1} OF {questions.length}
            </Badge>
            <span className="text-xs text-muted-foreground font-mono">{Math.round(progress)}%</span>
          </div>
          <div className="w-full h-1 bg-muted rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-primary"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        {/* Question */}
        <motion.div
          key={currentQuestion}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <h2 className="font-serif text-4xl md:text-5xl tracking-tight mb-8">{question.question}</h2>

          {question.type === 'select' && (
            <div className="space-y-3">
              {question.options?.map(option => (
                <button
                  key={option}
                  onClick={() => handleSelectAnswer(option)}
                  className="w-full p-4 text-left border border-border rounded-xl hover:border-primary/40 hover:bg-primary/5 transition-all group"
                >
                  <span className="font-sans text-lg">{option}</span>
                </button>
              ))}
            </div>
          )}

          {question.type === 'number' && (
            <div className="space-y-6">
              <input
                type="number"
                min="1"
                max="100"
                value={answers.teamSize}
                onChange={e => handleNumberAnswer(parseInt(e.target.value))}
                className="w-full p-4 border border-border rounded-xl bg-background text-foreground focus:outline-none focus:border-primary"
              />
              <button
                onClick={moveToNext}
                className="w-full p-4 bg-primary text-primary-foreground font-bold rounded-xl hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
              >
                Next <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {question.type === 'text' && (
            <div className="space-y-6">
              <input
                type="text"
                placeholder="Enter company name"
                value={answers.companyName}
                onChange={e => handleTextAnswer(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && (currentQuestion === questions.length - 1 ? handleSubmit() : moveToNext())}
                className="w-full p-4 border border-border rounded-xl bg-background text-foreground focus:outline-none focus:border-primary"
              />
              {currentQuestion === questions.length - 1 ? (
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="w-full p-4 bg-primary text-primary-foreground font-bold rounded-xl hover:opacity-90 disabled:opacity-50 transition-opacity"
                >
                  {isSubmitting ? 'Creating profile...' : 'Create My Profile'}
                </button>
              ) : (
                <button
                  onClick={moveToNext}
                  className="w-full p-4 bg-primary text-primary-foreground font-bold rounded-xl hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                >
                  Next <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify component compiles**

Run: `cd /Users/yashvardhansinhjhala/the\ builder\ brief/artifacts/specflow-newsletter && pnpm run build 2>&1 | head -20`

Expected: No TypeScript errors

- [ ] **Step 3: Commit component**

```bash
cd /Users/yashvardhansinhjhala/the\ builder\ brief && git add artifacts/specflow-newsletter/src/components/OnboardingQuiz.tsx && git commit -m "feat: add onboarding quiz component with 5 questions"
```

---

### Task 4: Create onboarding page route

**Files:**
- Create: `artifacts/specflow-newsletter/src/pages/onboarding.tsx`

- [ ] **Step 1: Create onboarding page**

```typescript
import { useEffect } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { useLocation } from 'wouter';
import OnboardingQuiz from '@/components/OnboardingQuiz';

export default function OnboardingPage() {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading && !user) {
      setLocation('/sign-in');
    }
  }, [isLoading, user, setLocation]);

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  const handleComplete = () => {
    setLocation('/pro-portal');
  };

  return <OnboardingQuiz onComplete={handleComplete} />;
}
```

- [ ] **Step 2: Verify page compiles**

Run: `cd /Users/yashvardhansinhjhala/the\ builder\ brief/artifacts/specflow-newsletter && pnpm run build 2>&1 | head -20`

Expected: No TypeScript errors

- [ ] **Step 3: Commit page**

```bash
cd /Users/yashvardhansinhjhala/the\ builder\ brief && git add artifacts/specflow-newsletter/src/pages/onboarding.tsx && git commit -m "feat: add onboarding page route"
```

---

# WEEK 3-4: FOUNDER JOURNEY TRACKER

### Task 5: Create journey milestone schema

**Files:**
- Modify: `lib/db/schema.ts`

- [ ] **Step 1: Add journeyMilestones table**

```typescript
export const journeyMilestones = pgTable('journey_milestones', {
  id: serial('id').primaryKey(),
  userId: varchar('user_id').notNull(),
  stage: varchar('stage').notNull(), // 'Ideation', 'Building', 'Validating', 'Revenue', 'Scaling', 'Exited'
  milestoneName: varchar('milestone_name').notNull(),
  description: text('description'),
  completed: boolean('completed').default(false),
  completedAt: timestamp('completed_at'),
  displayOrder: integer('display_order').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const journeyProgress = pgTable('journey_progress', {
  id: serial('id').primaryKey(),
  userId: varchar('user_id').notNull().unique(),
  currentStage: varchar('current_stage').notNull(), // Ideation, Building, etc.
  completedMilestones: integer('completed_milestones').default(0),
  totalMilestones: integer('total_milestones').default(5),
  progressPercentage: integer('progress_percentage').default(0),
  updatedAt: timestamp('updated_at').defaultNow(),
});
```

- [ ] **Step 2: Verify schema compiles**

Run: `cd /Users/yashvardhansinhjhala/the\ builder\ brief && pnpm run build 2>&1 | head -20`

Expected: No TypeScript errors

- [ ] **Step 3: Commit schema**

```bash
cd /Users/yashvardhansinhjhala/the\ builder\ brief && git add lib/db/schema.ts && git commit -m "feat: add journey milestones schema"
```

---

### Task 6: Create journey tracker API

**Files:**
- Create: `artifacts/api-server/src/routes/journey.ts`
- Modify: `artifacts/api-server/src/index.ts`

- [ ] **Step 1: Create journey.ts with milestones and progress endpoints**

```typescript
import { Router, Request, Response } from 'express';
import { db } from '@/lib/db';
import { journeyMilestones, journeyProgress, founderProfiles } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';

const router = Router();

const MILESTONE_TEMPLATES = {
  Ideation: [
    { name: 'Define Problem', order: 1 },
    { name: 'Identify TAM', order: 2 },
    { name: 'Validate Demand', order: 3 },
    { name: 'Build MVP Spec', order: 4 },
    { name: 'Secure Feedback', order: 5 },
  ],
  Building: [
    { name: 'Set Tech Stack', order: 1 },
    { name: 'Build Core MVP', order: 2 },
    { name: 'First Beta User', order: 3 },
    { name: 'Product-Market Fit Signal', order: 4 },
    { name: 'Public Launch', order: 5 },
  ],
  Validating: [
    { name: 'Customer Discovery Calls', order: 1 },
    { name: 'Validate Price', order: 2 },
    { name: 'First Paid User', order: 3 },
    { name: 'Repeat Sales (3+)', order: 4 },
    { name: 'Founder-Market Fit', order: 5 },
  ],
  Revenue: [
    { name: 'Reach $1K MRR', order: 1 },
    { name: 'Reach $5K MRR', order: 2 },
    { name: 'Customer Retention 80%+', order: 3 },
    { name: 'Proven Unit Economics', order: 4 },
    { name: 'Ready for Growth', order: 5 },
  ],
  Scaling: [
    { name: 'Reach $50K MRR', order: 1 },
    { name: 'Build Team (5+)', order: 2 },
    { name: 'Establish Brand', order: 3 },
    { name: 'Network Effects Active', order: 4 },
    { name: 'Path to $1M ARR Clear', order: 5 },
  ],
};

router.post('/initialize/:email', async (req: Request, res: Response) => {
  try {
    const { email } = req.params;

    const profile = await db
      .select()
      .from(founderProfiles)
      .where(eq(founderProfiles.userId, email))
      .limit(1);

    if (profile.length === 0) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    const stage = profile[0].stage as keyof typeof MILESTONE_TEMPLATES;
    const milestones = MILESTONE_TEMPLATES[stage] || MILESTONE_TEMPLATES.Ideation;

    // Clear existing milestones
    await db.delete(journeyMilestones).where(eq(journeyMilestones.userId, email));

    // Insert new milestones
    const insertedMilestones = await db
      .insert(journeyMilestones)
      .values(
        milestones.map(m => ({
          userId: email,
          stage,
          milestoneName: m.name,
          description: `Complete ${m.name.toLowerCase()}`,
          displayOrder: m.order,
        }))
      )
      .returning();

    // Create or update progress
    await db
      .insert(journeyProgress)
      .values({
        userId: email,
        currentStage: stage,
        completedMilestones: 0,
        totalMilestones: milestones.length,
        progressPercentage: 0,
      })
      .onConflictDoUpdate({
        target: journeyProgress.userId,
        set: {
          currentStage: stage,
          totalMilestones: milestones.length,
        },
      });

    return res.json({ success: true, milestones: insertedMilestones });
  } catch (error) {
    console.error('Journey initialization error:', error);
    return res.status(500).json({ error: 'Failed to initialize journey' });
  }
});

router.get('/milestones/:email', async (req: Request, res: Response) => {
  try {
    const { email } = req.params;

    const milestones = await db
      .select()
      .from(journeyMilestones)
      .where(eq(journeyMilestones.userId, email))
      .orderBy(journeyMilestones.displayOrder);

    return res.json(milestones);
  } catch (error) {
    console.error('Milestone fetch error:', error);
    return res.status(500).json({ error: 'Failed to fetch milestones' });
  }
});

router.post('/complete/:email/:milestoneId', async (req: Request, res: Response) => {
  try {
    const { email, milestoneId } = req.params;

    await db
      .update(journeyMilestones)
      .set({
        completed: true,
        completedAt: new Date(),
      })
      .where(
        and(
          eq(journeyMilestones.userId, email),
          eq(journeyMilestones.id, parseInt(milestoneId))
        )
      );

    // Recalculate progress
    const allMilestones = await db
      .select()
      .from(journeyMilestones)
      .where(eq(journeyMilestones.userId, email));

    const completed = allMilestones.filter(m => m.completed).length;
    const percentage = Math.round((completed / allMilestones.length) * 100);

    await db
      .update(journeyProgress)
      .set({
        completedMilestones: completed,
        progressPercentage: percentage,
      })
      .where(eq(journeyProgress.userId, email));

    return res.json({ success: true, progress: percentage });
  } catch (error) {
    console.error('Milestone completion error:', error);
    return res.status(500).json({ error: 'Failed to complete milestone' });
  }
});

router.get('/progress/:email', async (req: Request, res: Response) => {
  try {
    const { email } = req.params;

    const progress = await db
      .select()
      .from(journeyProgress)
      .where(eq(journeyProgress.userId, email))
      .limit(1);

    if (progress.length === 0) {
      return res.status(404).json({ error: 'Progress not found' });
    }

    return res.json(progress[0]);
  } catch (error) {
    console.error('Progress fetch error:', error);
    return res.status(500).json({ error: 'Failed to fetch progress' });
  }
});

export default router;
```

- [ ] **Step 2: Add route to Express index.ts**

```typescript
import journeyRoutes from './routes/journey';

app.use('/api/journey', journeyRoutes);
```

- [ ] **Step 3: Verify API compiles**

Run: `cd /Users/yashvardhansinhjhala/the\ builder\ brief/artifacts/api-server && pnpm run build 2>&1 | head -20`

Expected: No errors

- [ ] **Step 4: Commit API**

```bash
cd /Users/yashvardhansinhjhala/the\ builder\ brief && git add artifacts/api-server/src/routes/journey.ts artifacts/api-server/src/index.ts && git commit -m "feat: add journey tracker API with milestones"
```

---

### Task 7: Create JourneyTracker React component

**Files:**
- Create: `artifacts/specflow-newsletter/src/components/JourneyTracker.tsx`

- [ ] **Step 1: Create journey tracker visual component**

```typescript
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Circle } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { toast } from 'sonner';

interface Milestone {
  id: number;
  milestoneName: string;
  description: string;
  completed: boolean;
  completedAt?: string;
  displayOrder: number;
}

interface Progress {
  userId: string;
  currentStage: string;
  completedMilestones: number;
  totalMilestones: number;
  progressPercentage: number;
}

export default function JourneyTracker() {
  const { user } = useAuth();
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [progress, setProgress] = useState<Progress | null>(null);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState<number | null>(null);

  useEffect(() => {
    if (user?.email) {
      fetchMilestones();
      fetchProgress();
    }
  }, [user?.email]);

  const fetchMilestones = async () => {
    try {
      const res = await fetch(`/api/journey/milestones/${user?.email}`);
      if (res.ok) {
        const data = await res.json();
        setMilestones(data);
      }
    } catch (error) {
      console.error('Milestone fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProgress = async () => {
    try {
      const res = await fetch(`/api/journey/progress/${user?.email}`);
      if (res.ok) {
        const data = await res.json();
        setProgress(data);
      }
    } catch (error) {
      console.error('Progress fetch error:', error);
    }
  };

  const handleCompleteMilestone = async (milestoneId: number) => {
    if (!user?.email) return;

    setCompleting(milestoneId);
    try {
      const res = await fetch(`/api/journey/complete/${user.email}/${milestoneId}`, {
        method: 'POST',
      });

      if (res.ok) {
        toast.success('Milestone completed!');
        fetchMilestones();
        fetchProgress();
      }
    } catch (error) {
      console.error('Completion error:', error);
      toast.error('Failed to complete milestone');
    } finally {
      setCompleting(null);
    }
  };

  if (loading) {
    return <div className="p-8">Loading journey...</div>;
  }

  return (
    <section className="py-16">
      <div className="mb-12">
        <Badge className="bg-primary/10 text-primary border-none text-[10px] tracking-[0.3em] mb-6">
          YOUR JOURNEY
        </Badge>
        <h2 className="font-serif text-5xl tracking-tight mb-4">
          <span className="italic text-primary">{progress?.currentStage}</span> Stage
        </h2>
        <p className="text-muted-foreground font-sans text-lg max-w-2xl">
          Track your progress through the founder journey. Complete milestones to unlock the next stage.
        </p>
      </div>

      {/* Progress bar */}
      {progress && (
        <div className="mb-12 p-8 bg-card border border-border rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-bold uppercase tracking-widest">Progress</span>
            <span className="text-2xl font-serif">{progress.progressPercentage}%</span>
          </div>
          <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-primary"
              initial={{ width: 0 }}
              animate={{ width: `${progress.progressPercentage}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-4">
            {progress.completedMilestones} of {progress.totalMilestones} milestones completed
          </p>
        </div>
      )}

      {/* Milestones */}
      <div className="space-y-4">
        {milestones.map((milestone, index) => (
          <motion.div
            key={milestone.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="p-6 bg-card border border-border rounded-2xl hover:border-primary/40 transition-all group"
          >
            <div className="flex items-start gap-4">
              <button
                onClick={() => handleCompleteMilestone(milestone.id)}
                disabled={completing === milestone.id}
                className="mt-1 flex-shrink-0"
              >
                {milestone.completed ? (
                  <CheckCircle2 className="w-6 h-6 text-primary" />
                ) : (
                  <Circle className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors" />
                )}
              </button>

              <div className="flex-1">
                <h3 className={`font-serif text-xl ${milestone.completed ? 'line-through text-muted-foreground' : ''}`}>
                  {milestone.milestoneName}
                </h3>
                <p className="text-sm text-muted-foreground mt-1">{milestone.description}</p>
                {milestone.completedAt && (
                  <p className="text-xs text-primary mt-2">
                    Completed {new Date(milestone.completedAt).toLocaleDateString()}
                  </p>
                )}
              </div>

              <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                Step {milestone.displayOrder}
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Verify component compiles**

Run: `cd /Users/yashvardhansinhjhala/the\ builder\ brief/artifacts/specflow-newsletter && pnpm run build 2>&1 | head -20`

Expected: No errors

- [ ] **Step 3: Add component to pro-portal.tsx**

Open `artifacts/specflow-newsletter/src/pages/pro-portal.tsx` and add import and component:

```typescript
import JourneyTracker from '@/components/JourneyTracker';

// Add to main section after Board of Advisors:
<JourneyTracker />
```

- [ ] **Step 4: Commit component**

```bash
cd /Users/yashvardhansinhjhala/the\ builder\ brief && git add artifacts/specflow-newsletter/src/components/JourneyTracker.tsx artifacts/specflow-newsletter/src/pages/pro-portal.tsx && git commit -m "feat: add journey tracker component to pro portal"
```

---

# WEEK 5-6: WEEKLY CHECK-IN SYSTEM

### Task 8: Create weekly check-in schema

**Files:**
- Modify: `lib/db/schema.ts`

- [ ] **Step 1: Add checkIn tables**

```typescript
export const weeklyCheckIns = pgTable('weekly_check_ins', {
  id: serial('id').primaryKey(),
  userId: varchar('user_id').notNull(),
  weekStarting: date('week_starting').notNull(),
  shipped: boolean('shipped').default(false),
  shippedDescription: text('shipped_description'),
  currentMetric: varchar('current_metric'), // MRR, Users, Revenue, etc.
  metricValue: varchar('metric_value'),
  nextWeekGoal: text('next_week_goal'),
  challenge: text('challenge'),
  submittedAt: timestamp('submitted_at').defaultNow(),
});

export const leaderboard = pgTable('leaderboard', {
  id: serial('id').primaryKey(),
  userId: varchar('user_id').notNull().unique(),
  founderName: varchar('founder_name'),
  shippedThisWeek: boolean('shipped_this_week').default(false),
  streak: integer('streak').default(0), // Consecutive weeks shipped
  totalShipped: integer('total_shipped').default(0),
  currentMRR: varchar('current_mrr').default('$0'),
  rank: integer('rank'),
  updatedAt: timestamp('updated_at').defaultNow(),
});
```

- [ ] **Step 2: Verify schema compiles**

Run: `cd /Users/yashvardhansinhjhala/the\ builder\ brief && pnpm run build 2>&1 | head -20`

Expected: No TypeScript errors

- [ ] **Step 3: Commit schema**

```bash
cd /Users/yashvardhansinhjhala/the\ builder\ brief && git add lib/db/schema.ts && git commit -m "feat: add weekly check-in and leaderboard schema"
```

---

### Task 9: Create weekly check-in API

**Files:**
- Create: `artifacts/api-server/src/routes/checkIn.ts`
- Modify: `artifacts/api-server/src/index.ts`

- [ ] **Step 1: Create checkIn.ts endpoint**

```typescript
import { Router, Request, Response } from 'express';
import { db } from '@/lib/db';
import { weeklyCheckIns, leaderboard, founderProfiles } from '@/lib/db/schema';
import { eq, desc, sql } from 'drizzle-orm';

const router = Router();

interface CheckInData {
  email: string;
  shipped: boolean;
  shippedDescription?: string;
  currentMetric?: string;
  metricValue?: string;
  nextWeekGoal?: string;
  challenge?: string;
}

const getWeekStartDate = () => {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
  return new Date(now.setDate(diff)).toISOString().split('T')[0];
};

router.post('/submit', async (req: Request, res: Response) => {
  try {
    const { email, shipped, shippedDescription, currentMetric, metricValue, nextWeekGoal, challenge } = req.body as CheckInData;

    const weekStarting = getWeekStartDate();

    // Create/update check-in
    const checkIn = await db
      .insert(weeklyCheckIns)
      .values({
        userId: email,
        weekStarting,
        shipped,
        shippedDescription,
        currentMetric,
        metricValue,
        nextWeekGoal,
        challenge,
      })
      .returning();

    // Update leaderboard
    const founderProfile = await db
      .select()
      .from(founderProfiles)
      .where(eq(founderProfiles.userId, email))
      .limit(1);

    const founderName = founderProfile[0]?.companyName || email.split('@')[0];

    // Count total shipped this year
    const totalShippedCount = await db
      .selectDistinct({ week: weeklyCheckIns.weekStarting })
      .from(weeklyCheckIns)
      .where(eq(weeklyCheckIns.userId, email));

    await db
      .insert(leaderboard)
      .values({
        userId: email,
        founderName,
        shippedThisWeek: shipped,
        totalShipped: totalShippedCount.length,
        currentMRR: metricValue || '$0',
      })
      .onConflictDoUpdate({
        target: leaderboard.userId,
        set: {
          shippedThisWeek: shipped,
          totalShipped: totalShippedCount.length,
          currentMRR: metricValue || '$0',
        },
      });

    // Recalculate rankings
    await recalculateLeaderboard();

    return res.json({ success: true, checkIn: checkIn[0] });
  } catch (error) {
    console.error('Check-in error:', error);
    return res.status(500).json({ error: 'Failed to submit check-in' });
  }
});

router.get('/leaderboard', async (req: Request, res: Response) => {
  try {
    const leaders = await db
      .select()
      .from(leaderboard)
      .orderBy(desc(leaderboard.totalShipped), desc(leaderboard.streak))
      .limit(50);

    return res.json(leaders);
  } catch (error) {
    console.error('Leaderboard fetch error:', error);
    return res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
});

router.get('/user/:email', async (req: Request, res: Response) => {
  try {
    const { email } = req.params;

    const userCheckIns = await db
      .select()
      .from(weeklyCheckIns)
      .where(eq(weeklyCheckIns.userId, email))
      .orderBy(desc(weeklyCheckIns.weekStarting))
      .limit(12);

    return res.json(userCheckIns);
  } catch (error) {
    console.error('User check-ins fetch error:', error);
    return res.status(500).json({ error: 'Failed to fetch check-ins' });
  }
});

async function recalculateLeaderboard() {
  const allUsers = await db.selectDistinct({ userId: leaderboard.userId }).from(leaderboard);

  for (const user of allUsers) {
    const shippedWeeks = await db
      .selectDistinct({ week: weeklyCheckIns.weekStarting })
      .from(weeklyCheckIns)
      .where(eq(weeklyCheckIns.userId, user.userId));

    // Calculate streak (simplified - consecutive weeks)
    let streak = 0;
    const sortedWeeks = shippedWeeks
      .map(w => new Date(w.week))
      .sort((a, b) => b.getTime() - a.getTime());

    if (sortedWeeks.length > 0) {
      const now = new Date();
      const currentWeekStart = new Date(now);
      currentWeekStart.setDate(now.getDate() - now.getDay() + 1);

      for (const week of sortedWeeks) {
        const weekStart = new Date(week);
        const diff = (currentWeekStart.getTime() - weekStart.getTime()) / (7 * 24 * 60 * 60 * 1000);

        if (diff <= streak + 1) {
          streak++;
        } else {
          break;
        }
      }
    }

    await db
      .update(leaderboard)
      .set({ streak, totalShipped: shippedWeeks.length })
      .where(eq(leaderboard.userId, user.userId));
  }
}

export default router;
```

- [ ] **Step 2: Add route to Express**

```typescript
import checkInRoutes from './routes/checkIn';

app.use('/api/checkin', checkInRoutes);
```

- [ ] **Step 3: Verify API compiles**

Run: `cd /Users/yashvardhansinhjhala/the\ builder\ brief/artifacts/api-server && pnpm run build 2>&1 | head -20`

Expected: No errors

- [ ] **Step 4: Commit API**

```bash
cd /Users/yashvardhansinhjhala/the\ builder\ brief && git add artifacts/api-server/src/routes/checkIn.ts artifacts/api-server/src/index.ts && git commit -m "feat: add weekly check-in and leaderboard API"
```

---

### Task 10: Create WeeklyCheckIn React component

**Files:**
- Create: `artifacts/specflow-newsletter/src/components/WeeklyCheckIn.tsx`

- [ ] **Step 1: Create check-in form component**

```typescript
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Trophy, TrendingUp } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { toast } from 'sonner';

interface LeaderboardEntry {
  userId: string;
  founderName: string;
  shippedThisWeek: boolean;
  streak: number;
  totalShipped: number;
  currentMRR: string;
  rank: number;
}

export default function WeeklyCheckIn() {
  const { user } = useAuth();
  const [shipped, setShipped] = useState(false);
  const [shippedDescription, setShippedDescription] = useState('');
  const [metricValue, setMetricValue] = useState('');
  const [challenge, setChallenge] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const res = await fetch('/api/checkin/leaderboard');
      if (res.ok) {
        const data = await res.json();
        setLeaderboard(data);
      }
    } catch (error) {
      console.error('Leaderboard fetch error:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.email) {
      toast.error('Not authenticated');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/checkin/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user.email,
          shipped,
          shippedDescription,
          currentMetric: 'MRR',
          metricValue,
          challenge,
        }),
      });

      if (res.ok) {
        toast.success(shipped ? '🚀 Shipped! You're on the leaderboard.' : 'Check-in recorded.');
        setShipped(false);
        setShippedDescription('');
        setMetricValue('');
        setChallenge('');
        fetchLeaderboard();
      }
    } catch (error) {
      console.error('Submit error:', error);
      toast.error('Failed to submit check-in');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="py-16">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Check-in form */}
        <div className="lg:col-span-1">
          <div className="mb-8">
            <Badge className="bg-primary/10 text-primary border-none text-[10px] tracking-[0.3em] mb-4">
              WEEKLY CHECK-IN
            </Badge>
            <h2 className="font-serif text-4xl tracking-tight">
              What did you <span className="italic text-primary">ship</span>?
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Shipped toggle */}
            <div className="p-6 border border-border rounded-2xl">
              <label className="flex items-center gap-4 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={shipped}
                  onChange={e => setShipped(e.target.checked)}
                  className="w-5 h-5"
                />
                <span className="text-lg font-serif group-hover:text-primary transition-colors">
                  I shipped something this week
                </span>
              </label>
            </div>

            {shipped && (
              <>
                <textarea
                  placeholder="What did you ship? (50 chars max)"
                  maxLength={50}
                  value={shippedDescription}
                  onChange={e => setShippedDescription(e.target.value)}
                  className="w-full p-4 border border-border rounded-xl bg-background text-foreground focus:outline-none focus:border-primary resize-none"
                  rows={2}
                />

                <input
                  type="text"
                  placeholder="Current MRR (e.g., $5K)"
                  value={metricValue}
                  onChange={e => setMetricValue(e.target.value)}
                  className="w-full p-4 border border-border rounded-xl bg-background text-foreground focus:outline-none focus:border-primary"
                />
              </>
            )}

            <textarea
              placeholder="What's your biggest challenge this week?"
              value={challenge}
              onChange={e => setChallenge(e.target.value)}
              className="w-full p-4 border border-border rounded-xl bg-background text-foreground focus:outline-none focus:border-primary resize-none"
              rows={3}
            />

            <button
              type="submit"
              disabled={submitting}
              className="w-full p-4 bg-primary text-primary-foreground font-bold rounded-xl hover:opacity-90 disabled:opacity-50 transition-opacity"
            >
              {submitting ? 'Submitting...' : 'Submit Check-in'}
            </button>
          </form>
        </div>

        {/* Leaderboard */}
        <div className="lg:col-span-2">
          <div className="mb-8 flex items-center gap-3">
            <Trophy className="w-6 h-6 text-primary" />
            <h3 className="font-serif text-3xl">Founder Leaderboard</h3>
          </div>

          <div className="space-y-3">
            {leaderboard.slice(0, 15).map((entry, index) => (
              <motion.div
                key={entry.userId}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="p-4 bg-card border border-border rounded-xl hover:border-primary/40 transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span className="text-2xl font-serif text-primary">#{index + 1}</span>
                    <div>
                      <p className="font-serif text-lg">{entry.founderName}</p>
                      <div className="flex items-center gap-2 mt-1">
                        {entry.shippedThisWeek && (
                          <Badge className="bg-green-500/10 text-green-500 border-none text-[9px]">
                            SHIPPED THIS WEEK
                          </Badge>
                        )}
                        {entry.streak > 0 && (
                          <Badge className="bg-primary/10 text-primary border-none text-[9px]">
                            {entry.streak} WEEK STREAK
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-serif text-primary">{entry.currentMRR}</p>
                    <p className="text-xs text-muted-foreground">Shipped {entry.totalShipped}x</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Verify component compiles**

Run: `cd /Users/yashvardhansinhjhala/the\ builder\ brief/artifacts/specflow-newsletter && pnpm run build 2>&1 | head -20`

Expected: No errors

- [ ] **Step 3: Add to pro-portal**

Open `artifacts/specflow-newsletter/src/pages/pro-portal.tsx` and add:

```typescript
import WeeklyCheckIn from '@/components/WeeklyCheckIn';

// Add after Journey Tracker section
<WeeklyCheckIn />
```

- [ ] **Step 4: Commit**

```bash
cd /Users/yashvardhansinhjhala/the\ builder\ brief && git add artifacts/specflow-newsletter/src/components/WeeklyCheckIn.tsx artifacts/specflow-newsletter/src/pages/pro-portal.tsx && git commit -m "feat: add weekly check-in form and leaderboard"
```

---

# WEEK 7-8: MARKET SIZING ENGINE

### Task 11: Create market sizing API with OpenAI

**Files:**
- Create: `artifacts/api-server/src/routes/intelligence.ts`
- Modify: `artifacts/api-server/src/index.ts`

- [ ] **Step 1: Create intelligence.ts with OpenAI integration**

```typescript
import { Router, Request, Response } from 'express';
import { OpenAI } from 'openai';
import { db } from '@/lib/db';
import { founderProfiles } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

const router = Router();
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface MarketSizingRequest {
  email: string;
  ideaDescription: string;
  targetCustomer: string;
  sector: string;
}

interface MarketSizingReport {
  tam: string;
  sam: string;
  som: string;
  competitors: string[];
  marketGrowth: string;
  analysis: string;
}

router.post('/market-sizing', async (req: Request, res: Response) => {
  try {
    const { email, ideaDescription, targetCustomer, sector } = req.body as MarketSizingRequest;

    if (!ideaDescription || !targetCustomer) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Call OpenAI to analyze market
    const message = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: `You are a market sizing expert. Analyze business ideas and provide TAM/SAM/SOM estimates in JSON format.
          
Return ONLY valid JSON with this structure:
{
  "tam": "Total addressable market size (e.g., '$50B')",
  "sam": "Serviceable addressable market (e.g., '$5B')",
  "som": "Serviceable obtainable market first 5 years (e.g., '$100M')",
  "competitors": ["Competitor 1", "Competitor 2", "Competitor 3"],
  "marketGrowth": "Annual growth rate (e.g., '15% CAGR')",
  "analysis": "2-3 sentence market analysis explaining the opportunity and timing"
}`,
        },
        {
          role: 'user',
          content: `Analyze this startup idea:
          
Idea: ${ideaDescription}
Target Customer: ${targetCustomer}
Sector: ${sector}

Provide TAM/SAM/SOM analysis.`,
        },
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });

    let analysis: MarketSizingReport;
    try {
      const responseText =
        message.choices[0]?.message?.content || '{}';
      analysis = JSON.parse(responseText);
    } catch {
      // Fallback if JSON parsing fails
      analysis = {
        tam: 'Unable to calculate',
        sam: 'Unable to calculate',
        som: 'Unable to calculate',
        competitors: [],
        marketGrowth: 'Unable to determine',
        analysis: message.choices[0]?.message?.content || 'Analysis failed',
      };
    }

    // Store in database
    await db
      .update(founderProfiles)
      .set({
        ideaDescription,
        targetCustomer,
      })
      .where(eq(founderProfiles.userId, email));

    return res.json({
      success: true,
      report: analysis,
    });
  } catch (error) {
    console.error('Market sizing error:', error);
    return res.status(500).json({ error: 'Failed to analyze market' });
  }
});

router.post('/competitive-scan', async (req: Request, res: Response) => {
  try {
    const { competitorName, sector, founderIdea } = req.body as {
      competitorName: string;
      sector: string;
      founderIdea: string;
    };

    if (!competitorName || !sector) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const message = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: `You are a competitive analysis expert. Identify structural weaknesses in competitors.
          
Return ONLY valid JSON with this structure:
{
  "weaknesses": ["Weakness 1", "Weakness 2", "Weakness 3"],
  "vulnerabilities": "3-4 sentence explanation of how to exploit these weaknesses",
  "strategy": "Specific go-to-market strategy to beat this competitor"
}`,
        },
        {
          role: 'user',
          content: `Analyze this competitor for a founder building:

Your Idea: ${founderIdea}
Competitor: ${competitorName}
Sector: ${sector}

What are their structural weaknesses?`,
        },
      ],
      temperature: 0.7,
      max_tokens: 800,
    });

    let analysis;
    try {
      const responseText =
        message.choices[0]?.message?.content || '{}';
      analysis = JSON.parse(responseText);
    } catch {
      analysis = {
        weaknesses: [],
        vulnerabilities:
          message.choices[0]?.message?.content ||
          'Analysis failed',
        strategy: 'Unable to generate strategy',
      };
    }

    return res.json({
      success: true,
      report: analysis,
    });
  } catch (error) {
    console.error('Competitive scan error:', error);
    return res.status(500).json({ error: 'Failed to scan competitor' });
  }
});

export default router;
```

- [ ] **Step 2: Add route to Express**

```typescript
import intelligenceRoutes from './routes/intelligence';

app.use('/api/intelligence', intelligenceRoutes);
```

- [ ] **Step 3: Verify API compiles**

Run: `cd /Users/yashvardhansinhjhala/the\ builder\ brief/artifacts/api-server && pnpm run build 2>&1 | head -20`

Expected: No errors

- [ ] **Step 4: Commit API**

```bash
cd /Users/yashvardhansinhjhala/the\ builder\ brief && git add artifacts/api-server/src/routes/intelligence.ts artifacts/api-server/src/index.ts && git commit -m "feat: add market sizing and competitive analysis API with OpenAI"
```

---

### Task 12: Create MarketSizingEngine React component

**Files:**
- Create: `artifacts/specflow-newsletter/src/components/MarketSizingEngine.tsx`

- [ ] **Step 1: Create market sizing UI component**

```typescript
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Target } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { toast } from 'sonner';

interface MarketReport {
  tam: string;
  sam: string;
  som: string;
  competitors: string[];
  marketGrowth: string;
  analysis: string;
}

export default function MarketSizingEngine() {
  const { user } = useAuth();
  const [ideaDescription, setIdeaDescription] = useState('');
  const [targetCustomer, setTargetCustomer] = useState('');
  const [sector, setSector] = useState('B2B SaaS');
  const [report, setReport] = useState<MarketReport | null>(null);
  const [analyzing, setAnalyzing] = useState(false);

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ideaDescription || !targetCustomer) {
      toast.error('Fill in all fields');
      return;
    }

    setAnalyzing(true);
    try {
      const res = await fetch('/api/intelligence/market-sizing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user?.email,
          ideaDescription,
          targetCustomer,
          sector,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setReport(data.report);
      }
    } catch (error) {
      console.error('Analysis error:', error);
      toast.error('Failed to analyze market');
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <section className="py-16">
      <div className="mb-12">
        <Badge className="bg-primary/10 text-primary border-none text-[10px] tracking-[0.3em] mb-6">
          AI MARKET ANALYZER
        </Badge>
        <h2 className="font-serif text-5xl tracking-tight mb-4">
          Size Your <span className="italic text-primary">Market.</span>
        </h2>
        <p className="text-muted-foreground font-sans text-lg max-w-2xl">
          AI analyzes your idea to estimate TAM, SAM, and SOM. Know your addressable market before you build.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Input form */}
        <div>
          <form onSubmit={handleAnalyze} className="space-y-6">
            <div>
              <label className="block text-sm font-bold uppercase tracking-widest mb-3">
                What's your idea?
              </label>
              <textarea
                placeholder="Describe your startup idea in 1-2 sentences..."
                value={ideaDescription}
                onChange={e => setIdeaDescription(e.target.value)}
                className="w-full p-4 border border-border rounded-xl bg-background text-foreground focus:outline-none focus:border-primary resize-none"
                rows={4}
              />
            </div>

            <div>
              <label className="block text-sm font-bold uppercase tracking-widest mb-3">
                Target Customer
              </label>
              <input
                type="text"
                placeholder="e.g., Early-stage SaaS founders"
                value={targetCustomer}
                onChange={e => setTargetCustomer(e.target.value)}
                className="w-full p-4 border border-border rounded-xl bg-background text-foreground focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-bold uppercase tracking-widest mb-3">
                Sector
              </label>
              <select
                value={sector}
                onChange={e => setSector(e.target.value)}
                className="w-full p-4 border border-border rounded-xl bg-background text-foreground focus:outline-none focus:border-primary"
              >
                <option>B2B SaaS</option>
                <option>DTC E-commerce</option>
                <option>AI Tooling</option>
                <option>Developer Infrastructure</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={analyzing}
              className="w-full p-4 bg-primary text-primary-foreground font-bold rounded-xl hover:opacity-90 disabled:opacity-50 transition-opacity"
            >
              {analyzing ? 'Analyzing...' : 'Analyze Market'}
            </button>
          </form>
        </div>

        {/* Report */}
        {report && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="p-8 bg-card border border-border rounded-2xl">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">
                TAM
              </p>
              <p className="font-serif text-4xl text-primary">{report.tam}</p>
              <p className="text-sm text-muted-foreground mt-2">Total Addressable Market</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-6 bg-card border border-border rounded-2xl">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">
                  SAM
                </p>
                <p className="font-serif text-2xl">{report.sam}</p>
                <p className="text-xs text-muted-foreground mt-1">Serviceable AM</p>
              </div>

              <div className="p-6 bg-card border border-border rounded-2xl">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">
                  SOM (5Y)
                </p>
                <p className="font-serif text-2xl">{report.som}</p>
                <p className="text-xs text-muted-foreground mt-1">Obtainable AM</p>
              </div>
            </div>

            <div className="p-6 bg-primary/5 border border-primary/20 rounded-2xl">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="w-4 h-4 text-primary" />
                <p className="text-sm font-bold uppercase tracking-widest">Growth</p>
              </div>
              <p className="font-serif text-lg">{report.marketGrowth}</p>
            </div>

            <div className="p-6 bg-card border border-border rounded-2xl">
              <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-3">
                Analysis
              </p>
              <p className="text-foreground leading-relaxed">{report.analysis}</p>
            </div>

            {report.competitors.length > 0 && (
              <div className="p-6 bg-card border border-border rounded-2xl">
                <div className="flex items-center gap-2 mb-3">
                  <Target className="w-4 h-4 text-primary" />
                  <p className="text-sm font-bold uppercase tracking-widest">Key Competitors</p>
                </div>
                <div className="space-y-2">
                  {report.competitors.map(comp => (
                    <p key={comp} className="text-sm text-foreground">
                      • {comp}
                    </p>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Verify component compiles**

Run: `cd /Users/yashvardhansinhjhala/the\ builder\ brief/artifacts/specflow-newsletter && pnpm run build 2>&1 | head -20`

Expected: No errors

- [ ] **Step 3: Add to pro-portal**

Open `artifacts/specflow-newsletter/src/pages/pro-portal.tsx` and add:

```typescript
import MarketSizingEngine from '@/components/MarketSizingEngine';

// Add after Weekly Check-in section
<MarketSizingEngine />
```

- [ ] **Step 4: Commit**

```bash
cd /Users/yashvardhansinhjhala/the\ builder\ brief && git add artifacts/specflow-newsletter/src/components/MarketSizingEngine.tsx artifacts/specflow-newsletter/src/pages/pro-portal.tsx && git commit -m "feat: add market sizing engine with OpenAI analysis"
```

---

# WEEK 9-10: CO-FOUNDER MATCHING

### Task 13: Create co-founder matching schema

**Files:**
- Modify: `lib/db/schema.ts`

- [ ] **Step 1: Add matching tables**

```typescript
export const coFounderMatches = pgTable('co_founder_matches', {
  id: serial('id').primaryKey(),
  userId: varchar('user_id').notNull(),
  matchedUserId: varchar('matched_user_id').notNull(),
  complementarySkills: varchar('complementary_skills'),
  matchScore: integer('match_score'), // 0-100
  status: varchar('status').default('pending'), // pending, connected, active
  createdAt: timestamp('created_at').defaultNow(),
  messagesSent: integer('messages_sent').default(0),
});

export const founderSkills = pgTable('founder_skills', {
  id: serial('id').primaryKey(),
  userId: varchar('user_id').notNull().unique(),
  primarySkill: varchar('primary_skill'), // 'Technical', 'Product', 'Growth', 'Operations'
  secondarySkills: text('secondary_skills'), // JSON array
  yearsExperience: integer('years_experience'),
  openToRole: varchar('open_to_role'), // 'Looking for co-founder', 'Mentor only'
  bio: text('bio'),
});
```

- [ ] **Step 2: Verify schema compiles**

Run: `cd /Users/yashvardhansinhjhala/the\ builder\ brief && pnpm run build 2>&1 | head -20`

Expected: No TypeScript errors

- [ ] **Step 3: Commit schema**

```bash
cd /Users/yashvardhansinhjhala/the\ builder\ brief && git add lib/db/schema.ts && git commit -m "feat: add co-founder matching schema"
```

---

### Task 14: Create co-founder matching API

**Files:**
- Create: `artifacts/api-server/src/routes/matching.ts`
- Modify: `artifacts/api-server/src/index.ts`

- [ ] **Step 1: Create matching.ts**

```typescript
import { Router, Request, Response } from 'express';
import { db } from '@/lib/db';
import { founderSkills, coFounderMatches, founderProfiles } from '@/lib/db/schema';
import { eq, ne, and, sql } from 'drizzle-orm';

const router = Router();

interface SkillProfile {
  userId: string;
  primarySkill: string;
  secondarySkills?: string[];
  yearsExperience: number;
  bio: string;
}

interface MatchResult {
  matchedUserId: string;
  founderName: string;
  primarySkill: string;
  yearsExperience: number;
  matchScore: number;
  complementarySkills: string;
  bio: string;
}

router.post('/profile/:email', async (req: Request, res: Response) => {
  try {
    const { email } = req.params;
    const { primarySkill, secondarySkills, yearsExperience, bio, openToRole } = req.body;

    await db
      .insert(founderSkills)
      .values({
        userId: email,
        primarySkill,
        secondarySkills: JSON.stringify(secondarySkills || []),
        yearsExperience,
        bio,
        openToRole,
      })
      .onConflictDoUpdate({
        target: founderSkills.userId,
        set: {
          primarySkill,
          secondarySkills: JSON.stringify(secondarySkills || []),
          yearsExperience,
          bio,
          openToRole,
        },
      });

    return res.json({ success: true });
  } catch (error) {
    console.error('Profile save error:', error);
    return res.status(500).json({ error: 'Failed to save profile' });
  }
});

router.get('/matches/:email', async (req: Request, res: Response) => {
  try {
    const { email } = req.params;

    // Get requesting founder's profile
    const requesterProfile = await db
      .select()
      .from(founderSkills)
      .where(eq(founderSkills.userId, email))
      .limit(1);

    if (requesterProfile.length === 0) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    const requester = requesterProfile[0];
    const requesterSkill = requester.primarySkill;

    // Find founders with complementary skills
    const complementarySkillMap: { [key: string]: string } = {
      Technical: 'Growth',
      Growth: 'Technical',
      Product: 'Technical',
      Operations: 'Growth',
    };

    const complementarySkill = complementarySkillMap[requesterSkill || ''] || 'Product';

    // Query potential matches
    const potentialMatches = await db
      .select()
      .from(founderSkills)
      .where(
        and(
          ne(founderSkills.userId, email),
          eq(founderSkills.primarySkill, complementarySkill)
        )
      )
      .limit(20);

    // Get founder details and calculate match scores
    const matches: MatchResult[] = [];

    for (const match of potentialMatches) {
      const founderProfile = await db
        .select()
        .from(founderProfiles)
        .where(eq(founderProfiles.userId, match.userId))
        .limit(1);

      if (founderProfile.length > 0) {
        // Simple match score: complementary skills + experience level
        const baseScore = 60;
        const experienceBonus = Math.min((match.yearsExperience || 0) * 5, 25);
        const matchScore = Math.min(100, baseScore + experienceBonus);

        matches.push({
          matchedUserId: match.userId,
          founderName: founderProfile[0].companyName || match.userId.split('@')[0],
          primarySkill: match.primarySkill || '',
          yearsExperience: match.yearsExperience || 0,
          matchScore,
          complementarySkills: `${requesterSkill} + ${match.primarySkill}`,
          bio: match.bio || '',
        });
      }
    }

    // Sort by match score
    matches.sort((a, b) => b.matchScore - a.matchScore);

    return res.json(matches.slice(0, 10));
  } catch (error) {
    console.error('Match fetch error:', error);
    return res.status(500).json({ error: 'Failed to fetch matches' });
  }
});

router.post('/connect/:email/:matchedUserId', async (req: Request, res: Response) => {
  try {
    const { email, matchedUserId } = req.params;

    // Create match record
    await db
      .insert(coFounderMatches)
      .values({
        userId: email,
        matchedUserId,
        status: 'connected',
      });

    // Also create reciprocal record
    await db
      .insert(coFounderMatches)
      .values({
        userId: matchedUserId,
        matchedUserId: email,
        status: 'pending',
      });

    return res.json({ success: true });
  } catch (error) {
    console.error('Connect error:', error);
    return res.status(500).json({ error: 'Failed to create match' });
  }
});

export default router;
```

- [ ] **Step 2: Add route to Express**

```typescript
import matchingRoutes from './routes/matching';

app.use('/api/matching', matchingRoutes);
```

- [ ] **Step 3: Verify API compiles**

Run: `cd /Users/yashvardhansinhjhala/the\ builder\ brief/artifacts/api-server && pnpm run build 2>&1 | head -20`

Expected: No errors

- [ ] **Step 4: Commit API**

```bash
cd /Users/yashvardhansinhjhala/the\ builder\ brief && git add artifacts/api-server/src/routes/matching.ts artifacts/api-server/src/index.ts && git commit -m "feat: add co-founder matching API with skill-based algorithm"
```

---

### Task 15: Create CoFounderMatcher React component

**Files:**
- Create: `artifacts/specflow-newsletter/src/components/CoFounderMatcher.tsx`

- [ ] **Step 1: Create matching UI component**

```typescript
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Users, Zap, MessageCircle } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { toast } from 'sonner';

interface Match {
  matchedUserId: string;
  founderName: string;
  primarySkill: string;
  yearsExperience: number;
  matchScore: number;
  complementarySkills: string;
  bio: string;
}

interface SkillInput {
  primarySkill: string;
  secondarySkills: string[];
  yearsExperience: number;
  bio: string;
  openToRole: string;
}

export default function CoFounderMatcher() {
  const { user } = useAuth();
  const [showSkillForm, setShowSkillForm] = useState(false);
  const [skills, setSkills] = useState<SkillInput>({
    primarySkill: 'Technical',
    secondarySkills: [],
    yearsExperience: 5,
    bio: '',
    openToRole: 'Looking for co-founder',
  });
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(false);
  const [savingSkills, setSavingSkills] = useState(false);

  useEffect(() => {
    if (user?.email && !showSkillForm) {
      fetchMatches();
    }
  }, [user?.email, showSkillForm]);

  const handleSaveSkills = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.email) return;

    setSavingSkills(true);
    try {
      const res = await fetch(`/api/matching/profile/${user.email}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(skills),
      });

      if (res.ok) {
        toast.success('Profile saved! Finding matches...');
        setShowSkillForm(false);
        fetchMatches();
      }
    } catch (error) {
      console.error('Save error:', error);
      toast.error('Failed to save profile');
    } finally {
      setSavingSkills(false);
    }
  };

  const fetchMatches = async () => {
    if (!user?.email) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/matching/matches/${user.email}`);
      if (res.ok) {
        const data = await res.json();
        setMatches(data);
      }
    } catch (error) {
      console.error('Match fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async (matchedUserId: string) => {
    if (!user?.email) return;

    try {
      const res = await fetch(`/api/matching/connect/${user.email}/${matchedUserId}`, {
        method: 'POST',
      });

      if (res.ok) {
        toast.success('Connection sent! You can now message.');
        fetchMatches();
      }
    } catch (error) {
      console.error('Connect error:', error);
      toast.error('Failed to connect');
    }
  };

  if (showSkillForm) {
    return (
      <section className="py-16">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <Badge className="bg-primary/10 text-primary border-none text-[10px] tracking-[0.3em] mb-4">
              BUILD YOUR PROFILE
            </Badge>
            <h2 className="font-serif text-4xl tracking-tight">
              Find your <span className="italic text-primary">co-founder.</span>
            </h2>
          </div>

          <form onSubmit={handleSaveSkills} className="space-y-6 p-8 bg-card border border-border rounded-2xl">
            <div>
              <label className="block text-sm font-bold uppercase tracking-widest mb-3">
                Primary Skill
              </label>
              <select
                value={skills.primarySkill}
                onChange={e => setSkills(prev => ({ ...prev, primarySkill: e.target.value }))}
                className="w-full p-4 border border-border rounded-xl bg-background text-foreground focus:outline-none focus:border-primary"
              >
                <option>Technical</option>
                <option>Growth</option>
                <option>Product</option>
                <option>Operations</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold uppercase tracking-widest mb-3">
                Years of Experience
              </label>
              <input
                type="number"
                min="0"
                max="50"
                value={skills.yearsExperience}
                onChange={e => setSkills(prev => ({ ...prev, yearsExperience: parseInt(e.target.value) }))}
                className="w-full p-4 border border-border rounded-xl bg-background text-foreground focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-bold uppercase tracking-widest mb-3">
                About You
              </label>
              <textarea
                placeholder="Your background and what you're looking for in a co-founder..."
                value={skills.bio}
                onChange={e => setSkills(prev => ({ ...prev, bio: e.target.value }))}
                className="w-full p-4 border border-border rounded-xl bg-background text-foreground focus:outline-none focus:border-primary resize-none"
                rows={4}
              />
            </div>

            <button
              type="submit"
              disabled={savingSkills}
              className="w-full p-4 bg-primary text-primary-foreground font-bold rounded-xl hover:opacity-90 disabled:opacity-50"
            >
              {savingSkills ? 'Saving...' : 'Save Profile & Find Matches'}
            </button>
          </form>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16">
      <div className="mb-12 flex items-center justify-between">
        <div>
          <Badge className="bg-primary/10 text-primary border-none text-[10px] tracking-[0.3em] mb-4">
            CO-FOUNDER NETWORK
          </Badge>
          <h2 className="font-serif text-5xl tracking-tight">
            Find your <span className="italic text-primary">co-founder match.</span>
          </h2>
        </div>
        <button
          onClick={() => setShowSkillForm(true)}
          className="px-6 py-3 bg-primary text-primary-foreground font-bold text-xs rounded-full"
        >
          Update Profile
        </button>
      </div>

      {loading ? (
        <div className="p-8 text-center">Finding matches...</div>
      ) : matches.length === 0 ? (
        <div className="p-12 text-center bg-card border border-border rounded-2xl">
          <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
          <p className="text-muted-foreground">Complete your profile to find matches</p>
        </div>
      ) : (
        <div className="space-y-4">
          {matches.map((match, index) => (
            <motion.div
              key={match.matchedUserId}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="p-6 bg-card border border-border rounded-2xl hover:border-primary/40 transition-all group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="font-serif text-2xl mb-1">{match.founderName}</h3>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-primary/10 text-primary border-none text-[9px]">
                      {match.primarySkill}
                    </Badge>
                    <Badge className="bg-muted border-none text-[9px]">{match.yearsExperience} yrs</Badge>
                    <Zap className="w-4 h-4 text-primary" />
                    <span className="text-sm font-bold">{match.matchScore}% Match</span>
                  </div>
                </div>
              </div>

              <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{match.bio}</p>

              <div className="flex items-center justify-between">
                <p className="text-xs text-primary font-mono font-bold">{match.complementarySkills}</p>
                <button
                  onClick={() => handleConnect(match.matchedUserId)}
                  className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-xs font-bold rounded-full hover:opacity-90"
                >
                  <MessageCircle className="w-4 h-4" />
                  Connect
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </section>
  );
}
```

- [ ] **Step 2: Verify component compiles**

Run: `cd /Users/yashvardhansinhjhala/the\ builder\ brief/artifacts/specflow-newsletter && pnpm run build 2>&1 | head -20`

Expected: No errors

- [ ] **Step 3: Add to pro-portal**

Open `artifacts/specflow-newsletter/src/pages/pro-portal.tsx` and add:

```typescript
import CoFounderMatcher from '@/components/CoFounderMatcher';

// Add after Market Sizing Engine section
<CoFounderMatcher />
```

- [ ] **Step 4: Commit**

```bash
cd /Users/yashvardhansinhjhala/the\ builder\ brief && git add artifacts/specflow-newsletter/src/components/CoFounderMatcher.tsx artifacts/specflow-newsletter/src/pages/pro-portal.tsx && git commit -m "feat: add co-founder matcher with skill-based matching"
```

---

# WEEK 11: COMPETITIVE VULNERABILITY SCANNER

### Task 16: Create CompetitorScanner React component

**Files:**
- Create: `artifacts/specflow-newsletter/src/components/CompetitorScanner.tsx`

- [ ] **Step 1: Create scanner UI component**

```typescript
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Target } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { toast } from 'sonner';

interface ScanReport {
  weaknesses: string[];
  vulnerabilities: string;
  strategy: string;
}

export default function CompetitorScanner() {
  const { user } = useAuth();
  const [competitorName, setCompetitorName] = useState('');
  const [founderIdea, setFounderIdea] = useState('');
  const [sector, setSector] = useState('B2B SaaS');
  const [report, setReport] = useState<ScanReport | null>(null);
  const [scanning, setScanning] = useState(false);

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!competitorName || !founderIdea) {
      toast.error('Fill in all fields');
      return;
    }

    setScanning(true);
    try {
      const res = await fetch('/api/intelligence/competitive-scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          competitorName,
          sector,
          founderIdea,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setReport(data.report);
      }
    } catch (error) {
      console.error('Scan error:', error);
      toast.error('Failed to scan competitor');
    } finally {
      setScanning(false);
    }
  };

  return (
    <section className="py-16">
      <div className="mb-12">
        <Badge className="bg-primary/10 text-primary border-none text-[10px] tracking-[0.3em] mb-6">
          COMPETITIVE INTELLIGENCE
        </Badge>
        <h2 className="font-serif text-5xl tracking-tight mb-4">
          Exploit Their <span className="italic text-primary">Weaknesses.</span>
        </h2>
        <p className="text-muted-foreground font-sans text-lg max-w-2xl">
          AI scans your competitors to identify structural vulnerabilities you can exploit. Know how to win.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Input form */}
        <div>
          <form onSubmit={handleScan} className="space-y-6">
            <div>
              <label className="block text-sm font-bold uppercase tracking-widest mb-3">
                Who is your primary competitor?
              </label>
              <input
                type="text"
                placeholder="e.g., Stripe, Notion, Figma"
                value={competitorName}
                onChange={e => setCompetitorName(e.target.value)}
                className="w-full p-4 border border-border rounded-xl bg-background text-foreground focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-bold uppercase tracking-widest mb-3">
                What's your idea?
              </label>
              <textarea
                placeholder="Describe how you plan to compete differently..."
                value={founderIdea}
                onChange={e => setFounderIdea(e.target.value)}
                className="w-full p-4 border border-border rounded-xl bg-background text-foreground focus:outline-none focus:border-primary resize-none"
                rows={4}
              />
            </div>

            <div>
              <label className="block text-sm font-bold uppercase tracking-widest mb-3">
                Sector
              </label>
              <select
                value={sector}
                onChange={e => setSector(e.target.value)}
                className="w-full p-4 border border-border rounded-xl bg-background text-foreground focus:outline-none focus:border-primary"
              >
                <option>B2B SaaS</option>
                <option>DTC E-commerce</option>
                <option>AI Tooling</option>
                <option>Developer Infrastructure</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={scanning}
              className="w-full p-4 bg-primary text-primary-foreground font-bold rounded-xl hover:opacity-90 disabled:opacity-50 transition-opacity"
            >
              {scanning ? 'Scanning...' : 'Scan Competitor'}
            </button>
          </form>
        </div>

        {/* Report */}
        {report && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            {report.weaknesses.length > 0 && (
              <div className="p-8 bg-card border border-border rounded-2xl">
                <div className="flex items-center gap-2 mb-4">
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                  <p className="text-sm font-bold uppercase tracking-widest">Structural Weaknesses</p>
                </div>
                <div className="space-y-2">
                  {report.weaknesses.map((weakness, idx) => (
                    <p key={idx} className="text-foreground">
                      • {weakness}
                    </p>
                  ))}
                </div>
              </div>
            )}

            <div className="p-8 bg-primary/5 border border-primary/20 rounded-2xl">
              <div className="flex items-center gap-2 mb-4">
                <Target className="w-5 h-5 text-primary" />
                <p className="text-sm font-bold uppercase tracking-widest">How to Exploit</p>
              </div>
              <p className="text-foreground leading-relaxed">{report.vulnerabilities}</p>
            </div>

            <div className="p-8 bg-card border border-border rounded-2xl">
              <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-4">
                Winning Strategy
              </p>
              <p className="text-lg leading-relaxed text-foreground">{report.strategy}</p>
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Verify component compiles**

Run: `cd /Users/yashvardhansinhjhala/the\ builder\ brief/artifacts/specflow-newsletter && pnpm run build 2>&1 | head -20`

Expected: No errors

- [ ] **Step 3: Add to pro-portal**

Open `artifacts/specflow-newsletter/src/pages/pro-portal.tsx` and add:

```typescript
import CompetitorScanner from '@/components/CompetitorScanner';

// Add after Co-Founder Matcher section (before FINAL LAUNCH SEQUENCE)
<CompetitorScanner />
```

- [ ] **Step 4: Commit**

```bash
cd /Users/yashvardhansinhjhala/the\ builder\ brief && git add artifacts/specflow-newsletter/src/components/CompetitorScanner.tsx artifacts/specflow-newsletter/src/pages/pro-portal.tsx && git commit -m "feat: add competitive vulnerability scanner with AI analysis"
```

---

### Task 17: Final verification and pro-portal update

**Files:**
- Verify: All components integrated into pro-portal.tsx

- [ ] **Step 1: Rebuild entire project**

Run: `cd /Users/yashvardhansinhjhala/the\ builder\ brief && pnpm run build 2>&1 | tail -30`

Expected: Build succeeds with no TypeScript errors

- [ ] **Step 2: Start dev server and test pro-portal**

Run: `cd /Users/yashvardhansinhjhala/the\ builder\ brief/artifacts/specflow-newsletter && pnpm run dev > /tmp/dev.log 2>&1 &`

Then wait a moment and verify:

Run: `sleep 8 && curl -s http://localhost:5173/pro-portal | head -20 || echo 'Dev server may not be ready'`

- [ ] **Step 3: Final commit with all features**

```bash
cd /Users/yashvardhansinhjhala/the\ builder\ brief && git add artifacts/specflow-newsletter/src/pages/pro-portal.tsx && git commit -m "feat: integrate all 11-week features into pro-portal (onboarding, journey tracker, weekly checkins, market sizing, matching, competitive scanner)"
```

- [ ] **Step 4: Create summary of all changes**

Run: `cd /Users/yashvardhansinhjhala/the\ builder\ brief && git log --oneline -20`

---

## Summary

**Plan complete.** All 11 weeks of features designed and ready for implementation:

✅ **Week 1-2:** Onboarding quiz + founder profiles  
✅ **Week 3-4:** Founder journey tracker with milestones  
✅ **Week 5-6:** Weekly check-in system + leaderboard  
✅ **Week 7-8:** Market sizing engine (OpenAI)  
✅ **Week 9-10:** Co-founder matching algorithm  
✅ **Week 11:** Competitive vulnerability scanner  

**Tech integrated:**
- PostgreSQL + Drizzle ORM (database)
- Express 5 API routes
- React + Vite components
- OpenAI integration
- Framer Motion animations

**Two execution options:**

**1. Subagent-Driven (Recommended)** — I dispatch a fresh subagent per task, review between tasks, fast iteration

**2. Inline Execution** — Execute tasks in this session using executing-plans, batch execution with checkpoints

**Which approach?**

---

Plan saved to `/Users/yashvardhansinhjhala/the builder brief/docs/superpowers/plans/2026-04-27-product-features-11week.md`
