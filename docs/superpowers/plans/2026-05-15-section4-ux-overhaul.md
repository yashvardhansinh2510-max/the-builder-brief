# Section 4 UX Overhaul Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign six pages (Home Hero, Auth, Onboarding Quiz, Blueprints, Pricing, Ground Game, Idea Agent) and implement the Idea Agent backend with OpenAI streaming.

**Architecture:** All frontend changes live in `artifacts/specflow-newsletter/src/`. The one new API endpoint (`PATCH /api/subscribers/me`) and the Idea Agent backend live in `artifacts/api-server/src/routes/`. No DB migration needed — existing `startupStage`, `biggestChallenge`, and `portalState` columns cover all new data.

**Tech Stack:** React 18, Framer Motion, Tailwind CSS, shadcn/ui, Wouter, TanStack Query, Express 5, Drizzle ORM, OpenAI SDK v6, Vitest (API tests)

---

## File Map

**New files:**
- `artifacts/specflow-newsletter/src/components/VaultTeaserCard.tsx` — shared vault preview card (home + auth)

**Modified files:**
- `artifacts/specflow-newsletter/src/components/blueprints/TractioinProofSection.tsx` → renamed to `TractionProofSection.tsx`
- `artifacts/specflow-newsletter/src/pages/issue.tsx` — update import after rename
- `artifacts/api-server/src/routes/subscribers.ts` — add `PATCH /subscribers/me`
- `artifacts/specflow-newsletter/src/pages/home.tsx` — HeroSection rewrite
- `artifacts/specflow-newsletter/src/pages/auth.tsx` — left panel swap
- `artifacts/specflow-newsletter/src/components/OnboardingQuiz.tsx` — full rewrite
- `artifacts/specflow-newsletter/src/pages/blueprints.tsx` — full rewrite
- `artifacts/specflow-newsletter/src/pages/pricing.tsx` — full rewrite
- `artifacts/specflow-newsletter/src/components/ground-game/CountrySelector.tsx` — SVG map
- `artifacts/specflow-newsletter/src/components/ground-game/CategoryFilterBar.tsx` — pill restyle
- `artifacts/specflow-newsletter/src/components/ground-game/GroundGameCard.tsx` — effort badge + expand button
- `artifacts/specflow-newsletter/src/components/ground-game/GroundGameDrawer.tsx` — step guide + clipboard CTA
- `artifacts/specflow-newsletter/src/pages/ground-game.tsx` — header + offline toggle
- `artifacts/api-server/src/routes/idea-agent.ts` — full OpenAI SSE implementation
- `artifacts/specflow-newsletter/src/pages/idea-agent.tsx` — full rewrite

---

## Task 1: Rename TractioinProofSection

**Files:**
- Rename: `artifacts/specflow-newsletter/src/components/blueprints/TractioinProofSection.tsx` → `TractionProofSection.tsx`
- Modify: `artifacts/specflow-newsletter/src/pages/issue.tsx`

- [ ] **Step 1: Rename the file**

```bash
mv "artifacts/specflow-newsletter/src/components/blueprints/TractioinProofSection.tsx" \
   "artifacts/specflow-newsletter/src/components/blueprints/TractionProofSection.tsx"
```

- [ ] **Step 2: Fix the export name inside the file** (if internal name also has the typo)

Open `artifacts/specflow-newsletter/src/components/blueprints/TractionProofSection.tsx` and confirm the exported component name. If it says `TractioinProofSection`, rename it to `TractionProofSection`.

- [ ] **Step 3: Update import in issue.tsx**

Find the import line in `artifacts/specflow-newsletter/src/pages/issue.tsx` that references `TractioinProofSection` and change it:

```typescript
// Before
import { TractioinProofSection } from '@/components/blueprints/TractioinProofSection';
// After
import { TractionProofSection } from '@/components/blueprints/TractionProofSection';
```

Also update any usage of `<TractioinProofSection` → `<TractionProofSection`.

- [ ] **Step 4: Typecheck**

```bash
pnpm run typecheck
```

Expected: no TypeScript errors related to the rename.

- [ ] **Step 5: Commit**

```bash
git add artifacts/specflow-newsletter/src/components/blueprints/TractionProofSection.tsx \
        artifacts/specflow-newsletter/src/pages/issue.tsx
git commit -m "fix: rename TractioinProofSection → TractionProofSection"
```

---

## Task 2: PATCH /api/subscribers/me Endpoint

**Files:**
- Modify: `artifacts/api-server/src/routes/subscribers.ts`
- Test: `artifacts/api-server/src/routes/__tests__/subscribers-patch.test.ts`

- [ ] **Step 1: Write the failing test**

Create `artifacts/api-server/src/routes/__tests__/subscribers-patch.test.ts`:

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock Drizzle db
vi.mock('@workspace/db', () => ({
  db: {
    select: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    limit: vi.fn().mockResolvedValue([{
      email: 'test@example.com',
      portalState: {},
      startupStage: null,
      biggestChallenge: null,
    }]),
    update: vi.fn().mockReturnThis(),
    set: vi.fn().mockReturnThis(),
  },
  subscribersTable: {},
}));

vi.mock('../../../middleware/verifyUser', () => ({
  verifyUser: (req: any, _res: any, next: any) => {
    req.user = { id: 'user_123', email: 'test@example.com' };
    next();
  },
}));

import express from 'express';
import request from 'supertest';
import subscribersRouter from '../subscribers';

const app = express();
app.use(express.json());
app.use('/', subscribersRouter);

describe('PATCH /subscribers/me', () => {
  it('returns 200 with ok:true on valid payload', async () => {
    const res = await request(app)
      .patch('/subscribers/me')
      .set('Authorization', 'Bearer token')
      .send({ stage: 'Building', goal: 'Validate my idea', constraint: 'Time' });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true });
  });

  it('accepts partial payload', async () => {
    const res = await request(app)
      .patch('/subscribers/me')
      .set('Authorization', 'Bearer token')
      .send({ stage: 'Idea' });

    expect(res.status).toBe(200);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd artifacts/api-server && pnpm run test -- --reporter=verbose 2>&1 | grep -A5 "subscribers-patch"
```

Expected: FAIL — route doesn't exist yet.

- [ ] **Step 3: Add the PATCH endpoint to subscribers.ts**

In `artifacts/api-server/src/routes/subscribers.ts`, add this before `export default router`:

```typescript
router.patch("/subscribers/me", verifyUser, async (req, res): Promise<void> => {
  const email = req.user?.email;
  if (!email) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const { stage, goal, constraint } = req.body as {
    stage?: string;
    goal?: string;
    constraint?: string;
  };

  const [subscriber] = await db
    .select()
    .from(subscribersTable)
    .where(eq(subscribersTable.email, email))
    .limit(1);

  if (!subscriber) {
    res.status(404).json({ error: "Subscriber not found" });
    return;
  }

  const currentPortalState = (subscriber.portalState as Record<string, unknown>) ?? {};

  await db
    .update(subscribersTable)
    .set({
      ...(stage !== undefined && { startupStage: stage }),
      ...(constraint !== undefined && { biggestChallenge: constraint }),
      ...(goal !== undefined && {
        portalState: { ...currentPortalState, goal },
      }),
      contextUpdatedAt: new Date(),
    })
    .where(eq(subscribersTable.email, email));

  res.json({ ok: true });
});
```

- [ ] **Step 4: Run test to verify it passes**

```bash
cd artifacts/api-server && pnpm run test -- --reporter=verbose 2>&1 | grep -A5 "subscribers-patch"
```

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add artifacts/api-server/src/routes/subscribers.ts \
        artifacts/api-server/src/routes/__tests__/subscribers-patch.test.ts
git commit -m "feat: add PATCH /subscribers/me for onboarding quiz answers"
```

---

## Task 3: VaultTeaserCard Shared Component

**Files:**
- Create: `artifacts/specflow-newsletter/src/components/VaultTeaserCard.tsx`

- [ ] **Step 1: Create the component**

```typescript
// artifacts/specflow-newsletter/src/components/VaultTeaserCard.tsx
import { useEffect, useState } from 'react';
import { Vault } from '@/lib/vault-types';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

interface VaultTeaserCardProps {
  blurScore?: boolean;
}

const SCORE_LABELS = [
  { key: 'opportunity' as const, label: 'Opportunity' },
  { key: 'problem' as const, label: 'Problem' },
  { key: 'feasibility' as const, label: 'Feasibility' },
  { key: 'whyNow' as const, label: 'Why Now' },
];

function ScorePill({ label, score, blur }: { label: string; score: number; blur: boolean }) {
  const color =
    score >= 75 ? 'bg-green-100 text-green-700' :
    score >= 50 ? 'bg-yellow-100 text-yellow-700' :
    'bg-red-100 text-red-700';
  return (
    <div className="flex flex-col items-center gap-0.5">
      <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${color} ${blur ? 'blur-sm select-none' : ''}`}>
        {score}
      </span>
      <span className="text-[10px] text-muted-foreground">{label}</span>
    </div>
  );
}

export function VaultTeaserCard({ blurScore = false }: VaultTeaserCardProps) {
  const [vault, setVault] = useState<Vault | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE}/vaults?pageSize=1&order=desc`)
      .then(r => r.json())
      .then(data => {
        const v = data?.vaults?.[0];
        if (v) setVault(v);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-sm animate-pulse">
        <div className="h-5 bg-muted rounded w-3/4 mb-3" />
        <div className="h-4 bg-muted rounded w-full mb-6" />
        <div className="flex gap-3 justify-center">
          {[0, 1, 2, 3].map(i => (
            <div key={i} className="flex flex-col items-center gap-1">
              <div className="h-6 w-10 bg-muted rounded-full" />
              <div className="h-3 w-12 bg-muted rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!vault) return null;

  return (
    <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-sm">
      <h3 className="font-serif font-bold text-lg leading-snug mb-1">{vault.title}</h3>
      <p className="text-sm text-muted-foreground mb-5 line-clamp-2">{vault.tagline}</p>
      <div className="flex gap-4 justify-center mb-5">
        {SCORE_LABELS.map(({ key, label }) => (
          <ScorePill
            key={key}
            label={label}
            score={vault.scores[key]}
            blur={blurScore}
          />
        ))}
      </div>
      {blurScore && (
        <p className="text-center text-xs text-muted-foreground italic">
          Sign in to see the full breakdown
        </p>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Typecheck**

```bash
pnpm run typecheck
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add artifacts/specflow-newsletter/src/components/VaultTeaserCard.tsx
git commit -m "feat: add VaultTeaserCard shared component for home hero + auth"
```

---

## Task 4: P20 — Home Hero Redesign

**Files:**
- Modify: `artifacts/specflow-newsletter/src/pages/home.tsx`

- [ ] **Step 1: Replace HeroSection (lines 62–210)**

Replace the entire `HeroSection` function and the `contents` array (lines 37–46) with the following. Leave everything else in `home.tsx` untouched.

Delete lines 37–46 (the `contents` array).

Replace the `HeroSection` function entirely:

```typescript
function HeroSection({ onSuccess }: { onSuccess: () => void }) {
  const { status, subscribe } = useSubscribe("hero");
  const [email, setEmail] = useState("");
  const search = useSearch();
  const { toast } = useToast();

  useEffect(() => {
    if (status === "pending-confirmation" || status === "exists") {
      onSuccess();
    }
  }, [status, onSuccess]);

  useEffect(() => {
    const params = new URLSearchParams(search);
    if (params.get("confirmed") === "true") {
      toast({
        title: "You're confirmed!",
        description: "You'll receive your first blueprint this Friday.",
      });
      window.history.replaceState({}, "", window.location.pathname);
    }
    if (params.get("unsubscribed") === "true") {
      toast({ title: "Unsubscribed", description: "You've been removed from the list." });
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, [search, toast]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    subscribe(email);
    if (status !== "loading") setEmail("");
  };

  return (
    <section className="pt-28 md:pt-40 pb-32 px-6 max-w-4xl mx-auto text-center relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-primary/5 blur-[120px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="relative z-10"
      >
        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="font-serif text-[40px] md:text-[72px] leading-[1.05] tracking-tight mb-8"
        >
          Every week, one startup idea.{" "}
          <span className="italic text-primary">Researched. Scored. Ready to build.</span>
        </motion.h1>

        {/* Live Preview Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex justify-center mb-8"
        >
          <div className="w-full max-w-md">
            <VaultTeaserCard blurScore={false} />
            <a
              href="#subscribe-form"
              className="block mt-3 text-sm text-primary font-medium hover:underline"
            >
              Subscribe to unlock this →
            </a>
          </div>
        </motion.div>

        {/* Subscribe Form */}
        <motion.div
          id="subscribe-form"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <form onSubmit={handleSubmit} className="max-w-md mx-auto mb-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <Input
                type="email"
                placeholder="Your founder email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="rounded-full h-14 px-6 text-base border-border/50 bg-card/60 focus-visible:ring-primary"
                required
              />
              <Button
                type="submit"
                disabled={status === "loading"}
                className="rounded-full h-14 px-8 text-base font-semibold bg-foreground hover:bg-foreground/90 text-background transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                {status === "pending-confirmation" ? (
                  <><Check className="w-4 h-4 mr-2" />Check your inbox!</>
                ) : status === "exists" ? (
                  <>Already subscribed ✓</>
                ) : status === "loading" ? (
                  "Subscribing…"
                ) : (
                  "Get Friday's Idea"
                )}
              </Button>
            </div>
          </form>

          {status === "pending-confirmation" && (
            <p className="text-sm text-green-600 flex items-center justify-center gap-1.5 mb-3">
              <Check className="w-3.5 h-3.5" /> Check your inbox to confirm!
            </p>
          )}
          {status === "exists" && (
            <p className="text-sm text-amber-600 flex items-center justify-center gap-1.5 mb-3">
              <AlertCircle className="w-3.5 h-3.5" /> You're already subscribed.
            </p>
          )}
          {status === "error" && (
            <p className="text-sm text-destructive flex items-center justify-center gap-1.5 mb-3">
              <AlertCircle className="w-3.5 h-3.5" /> Something went wrong. Try again.
            </p>
          )}

          {/* Social Proof Bar */}
          <p className="text-sm text-muted-foreground">
            Join 15,000+ founders • 500+ companies shipped • Free forever
          </p>
        </motion.div>
      </motion.div>
    </section>
  );
}
```

- [ ] **Step 2: Add VaultTeaserCard import**

Add to the imports at the top of `home.tsx`:

```typescript
import { VaultTeaserCard } from "@/components/VaultTeaserCard";
```

Remove unused imports from the deleted `contents` array: `Lightbulb`, `Target`, `Compass`, `TrendingUp`, `Code2`, `Zap`, `DollarSign`, `Users2` — only remove these if they're not used elsewhere in the file.

- [ ] **Step 3: Typecheck**

```bash
pnpm run typecheck
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add artifacts/specflow-newsletter/src/pages/home.tsx
git commit -m "feat(P20): redesign home hero — live vault preview card + updated copy"
```

---

## Task 5: P21 — Auth Page Left Panel

**Files:**
- Modify: `artifacts/specflow-newsletter/src/pages/auth.tsx`

- [ ] **Step 1: Rewrite auth.tsx**

Replace the entire file content:

```typescript
import { motion } from "framer-motion";
import { Link } from "wouter";
import { SignIn, SignUp } from "@clerk/react";
import { ArrowLeft } from "lucide-react";
import logoPath from "@assets/logo.jpg";
import { VaultTeaserCard } from "@/components/VaultTeaserCard";

export default function AuthPage({ mode = "sign-in" }: { mode?: "sign-in" | "sign-up" }) {
  const isSignUp = mode === "sign-up";

  return (
    <div className="min-h-screen w-full flex items-center justify-center overflow-hidden bg-background font-sans">
      <div className="w-full h-screen flex flex-col md:flex-row">

        {/* LEFT PANEL — desktop only, 40% */}
        <div className="hidden md:flex w-[40%] relative bg-card flex-col items-center justify-center p-12 overflow-hidden">
          {/* Background glow */}
          <div className="absolute inset-0 z-0">
            <div className="absolute inset-0 bg-gradient-to-br from-background via-background/90 to-background/70" />
            <div className="w-[20rem] h-[20rem] bg-primary/20 absolute -z-10 rounded-full -bottom-10 -left-10 blur-[80px]" />
            <div className="w-[15rem] h-[15rem] bg-primary/30 absolute -z-10 rounded-full top-10 right-10 blur-[100px]" />
          </div>

          <div className="relative z-10 flex flex-col items-center gap-8 w-full max-w-xs">
            <Link href="/" className="self-start hover:opacity-80 transition-opacity">
              <img
                src={logoPath}
                alt="The Builder Brief"
                className="w-10 h-10 rounded-xl object-cover shadow-lg border border-border/50"
              />
            </Link>

            <VaultTeaserCard blurScore={true} />
          </div>
        </div>

        {/* RIGHT PANEL — full width mobile, 60% desktop */}
        <div className="flex-1 flex flex-col bg-background p-8 md:p-16 relative border-l border-border/50">
          <Link href="/" className="absolute top-8 right-8 text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" /> Home
          </Link>

          {/* Mobile logo */}
          <div className="flex justify-center mb-8 md:hidden">
            <Link href="/">
              <img
                src={logoPath}
                alt="The Builder Brief"
                className="w-10 h-10 rounded-xl object-cover shadow-lg border border-border/50"
              />
            </Link>
          </div>

          <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full">
            <div className="mb-10">
              <h2 className="font-serif text-3xl md:text-4xl mb-3 tracking-tight">
                {isSignUp ? "Get Started" : "Welcome Back"}
              </h2>
              <p className="text-muted-foreground text-base">
                {isSignUp
                  ? "Join the incubator and access the blueprints."
                  : "Sign in to access your dashboard."}
              </p>
            </div>

            <div className="w-full">
              {isSignUp ? (
                <SignUp
                  routing="path"
                  path="/sign-up"
                  signInUrl="/sign-in"
                  appearance={{
                    elements: {
                      rootBox: "w-full",
                      card: "shadow-none border-0 bg-transparent p-0",
                      headerTitle: "hidden",
                      headerSubtitle: "hidden",
                      logoBox: "hidden",
                      socialButtonsBlockButton: "h-12 rounded-xl border-border/50 bg-card hover:bg-card/80 text-foreground transition-all",
                      formButtonPrimary: "h-12 rounded-xl text-base font-semibold bg-primary hover:bg-primary/90 text-primary-foreground transition-all hover:scale-[1.02] active:scale-[0.98]",
                      formFieldInput: "h-12 px-5 rounded-xl text-base border-border/50 bg-card focus:ring-primary focus:border-primary transition-all",
                      footerActionLink: "text-foreground font-semibold underline decoration-border underline-offset-4 hover:decoration-primary transition-colors",
                    },
                  }}
                  fallbackRedirectUrl="/dashboard"
                />
              ) : (
                <SignIn
                  routing="path"
                  path="/sign-in"
                  signUpUrl="/sign-up"
                  appearance={{
                    elements: {
                      rootBox: "w-full",
                      card: "shadow-none border-0 bg-transparent p-0",
                      headerTitle: "hidden",
                      headerSubtitle: "hidden",
                      logoBox: "hidden",
                      socialButtonsBlockButton: "h-12 rounded-xl border-border/50 bg-card hover:bg-card/80 text-foreground transition-all",
                      formButtonPrimary: "h-12 rounded-xl text-base font-semibold bg-primary hover:bg-primary/90 text-primary-foreground transition-all hover:scale-[1.02] active:scale-[0.98]",
                      formFieldInput: "h-12 px-5 rounded-xl text-base border-border/50 bg-card focus:ring-primary focus:border-primary transition-all",
                      footerActionLink: "text-foreground font-semibold underline decoration-border underline-offset-4 hover:decoration-primary transition-colors",
                    },
                  }}
                  fallbackRedirectUrl="/dashboard"
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Typecheck**

```bash
pnpm run typecheck
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add artifacts/specflow-newsletter/src/pages/auth.tsx
git commit -m "feat(P21a): auth page left panel — vault teaser card replaces animated streaks"
```

---

## Task 6: P21 — OnboardingQuiz Rewrite

**Files:**
- Modify: `artifacts/specflow-newsletter/src/components/OnboardingQuiz.tsx`

- [ ] **Step 1: Rewrite OnboardingQuiz.tsx**

Replace the entire file:

```typescript
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/lib/AuthContext';
import { useLocation } from 'wouter';
import { toast } from 'sonner';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const QUESTIONS = [
  {
    id: 'stage',
    text: "What stage are you at?",
    options: ['Idea', 'Building', 'Launched', 'Scaling'],
  },
  {
    id: 'goal',
    text: "What's your primary goal with The Builder Brief?",
    options: ['Find an idea', 'Validate my idea', 'Grow my startup', 'Get investors'],
  },
  {
    id: 'constraint',
    text: "What's your biggest constraint right now?",
    options: ['Time', 'Money', 'Technical skills', 'Finding customers'],
  },
] as const;

type QuestionId = typeof QUESTIONS[number]['id'];
type Answers = Partial<Record<QuestionId, string>>;

export default function OnboardingQuiz({ onComplete }: { onComplete?: () => void }) {
  const { session } = useAuth();
  const [, setLocation] = useLocation();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [submitting, setSubmitting] = useState(false);

  const question = QUESTIONS[step];
  const isLast = step === QUESTIONS.length - 1;

  const handleSelect = async (value: string) => {
    const next = { ...answers, [question.id]: value };
    setAnswers(next);

    if (!isLast) {
      setStep(s => s + 1);
      return;
    }

    // Last question — submit
    setSubmitting(true);
    try {
      const token = await session?.getToken();
      const res = await fetch(`${API_BASE}/subscribers/me`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          stage: next.stage,
          goal: next.goal,
          constraint: next.constraint,
        }),
      });
      if (!res.ok) throw new Error('Failed to save');
      toast.success('Profile saved!');
      onComplete?.();
      setLocation('/dashboard');
    } catch {
      toast.error('Failed to save profile. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center px-6">
      {/* Progress dots */}
      <div className="flex gap-2 mb-16">
        {QUESTIONS.map((_, i) => (
          <div
            key={i}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              i <= step ? 'bg-primary' : 'bg-muted'
            }`}
          />
        ))}
      </div>

      <div className="w-full max-w-lg">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <h2 className="font-serif text-3xl md:text-5xl tracking-tight mb-10">
              {question.text}
            </h2>

            <div className="space-y-3">
              {question.options.map(option => (
                <button
                  key={option}
                  onClick={() => handleSelect(option)}
                  disabled={submitting}
                  className="w-full p-4 text-left border border-border rounded-xl hover:border-primary/50 hover:bg-primary/5 transition-all text-lg font-sans disabled:opacity-50"
                >
                  {option}
                </button>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Typecheck**

```bash
pnpm run typecheck
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add artifacts/specflow-newsletter/src/components/OnboardingQuiz.tsx
git commit -m "feat(P21b): onboarding quiz — 3 questions, slide animation, progress dots, PATCH /subscribers/me"
```

---

## Task 7: P22 — Blueprints Page Rewrite

**Files:**
- Modify: `artifacts/specflow-newsletter/src/pages/blueprints.tsx`

- [ ] **Step 1: Rewrite blueprints.tsx**

Replace the entire file:

```typescript
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TierGate } from '@/components/TierGate';
import PortalNav from '@/components/PortalNav';
import Footer from '@/components/Footer';
import { usePageTracking } from '@/hooks/useAnalytics';
import { ArchitectureDiagram } from '@/components/blueprints/ArchitectureDiagram';
import { ComplianceTimeline } from '@/components/blueprints/ComplianceTimeline';
import { ExitDashboard } from '@/components/blueprints/ExitDashboard';
import { GlobalArbitrageMap } from '@/components/blueprints/GlobalArbitrageMap';
import { HiringRoadmap } from '@/components/blueprints/HiringRoadmap';
import { PLGSequence } from '@/components/blueprints/PLGSequence';
import { TractionProofSection } from '@/components/blueprints/TractionProofSection';
import { UnitEconomicsCalculator } from '@/components/blueprints/UnitEconomicsCalculator';

type Stage = 'All' | 'Validate' | 'Build' | 'Scale' | 'Exit';

interface Blueprint {
  slug: string;
  title: string;
  stage: Exclude<Stage, 'All'>;
  description: string;
  hours: number;
  component: React.ReactNode;
}

const BLUEPRINTS: Blueprint[] = [
  {
    slug: 'architecture-diagram',
    title: 'Architecture Diagram',
    stage: 'Build',
    description: 'System design for your MVP',
    hours: 2,
    component: <ArchitectureDiagram />,
  },
  {
    slug: 'compliance-timeline',
    title: 'Compliance Timeline',
    stage: 'Build',
    description: 'Legal and compliance milestones',
    hours: 3,
    component: <ComplianceTimeline />,
  },
  {
    slug: 'exit-dashboard',
    title: 'Exit Dashboard',
    stage: 'Exit',
    description: 'Metrics and readiness for exit',
    hours: 4,
    component: <ExitDashboard />,
  },
  {
    slug: 'global-arbitrage-map',
    title: 'Global Arbitrage Map',
    stage: 'Validate',
    description: 'Geographic market opportunity',
    hours: 1,
    component: <GlobalArbitrageMap />,
  },
  {
    slug: 'hiring-roadmap',
    title: 'Hiring Roadmap',
    stage: 'Scale',
    description: 'First 10 hires, sequenced',
    hours: 2,
    component: <HiringRoadmap />,
  },
  {
    slug: 'plg-sequence',
    title: 'PLG Sequence',
    stage: 'Build',
    description: 'Product-led growth motion',
    hours: 3,
    component: <PLGSequence />,
  },
  {
    slug: 'traction-proof',
    title: 'Traction Proof',
    stage: 'Validate',
    description: 'Evidence framework for investors',
    hours: 2,
    component: <TractionProofSection />,
  },
  {
    slug: 'unit-economics-calculator',
    title: 'Unit Economics Calculator',
    stage: 'Validate',
    description: 'LTV/CAC/payback period model',
    hours: 1,
    component: <UnitEconomicsCalculator />,
  },
];

const STAGE_COLORS: Record<Exclude<Stage, 'All'>, string> = {
  Validate: 'bg-blue-100 text-blue-700',
  Build: 'bg-violet-100 text-violet-700',
  Scale: 'bg-green-100 text-green-700',
  Exit: 'bg-orange-100 text-orange-700',
};

const STAGES: Stage[] = ['All', 'Validate', 'Build', 'Scale', 'Exit'];

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.4, delay: i * 0.06 } }),
};

export default function BlueprintsPage() {
  usePageTracking('blueprints');
  const [activeStage, setActiveStage] = useState<Stage>('All');

  const visible = activeStage === 'All'
    ? BLUEPRINTS
    : BLUEPRINTS.filter(b => b.stage === activeStage);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <PortalNav activePage="blueprints" />

      {/* Header */}
      <section className="max-w-5xl mx-auto px-6 pt-20 pb-12">
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-serif text-4xl md:text-5xl tracking-tight mb-4"
        >
          Execution Blueprints
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-muted-foreground text-lg mb-8 max-w-2xl"
        >
          Not theory. Not inspiration. Execution-ready playbooks for specific startup stages.
        </motion.p>

        {/* Stage filter */}
        <div className="flex gap-2 flex-wrap">
          {STAGES.map(stage => (
            <button
              key={stage}
              onClick={() => setActiveStage(stage)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all ${
                activeStage === stage
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'border-border text-muted-foreground hover:border-foreground/30 hover:text-foreground'
              }`}
            >
              {stage}
            </button>
          ))}
        </div>
      </section>

      {/* Blueprint Card Grid */}
      <section className="max-w-5xl mx-auto px-6 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {visible.map((bp, i) => (
            <motion.div
              key={bp.slug}
              custom={i}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
            >
              <div className="bg-card border border-border rounded-2xl p-6 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 flex flex-col h-full">
                <div className="flex items-center justify-between mb-3">
                  <span className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${STAGE_COLORS[bp.stage]}`}>
                    {bp.stage}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="w-3.5 h-3.5" />
                    {bp.hours}h
                  </span>
                </div>
                <h3 className="font-serif font-bold text-xl mb-2">{bp.title}</h3>
                <p className="text-sm text-muted-foreground flex-1 mb-5">{bp.description}</p>
                <a
                  href={`#blueprint-${bp.slug}`}
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:gap-2.5 transition-all"
                >
                  Open Blueprint <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Blueprint Detail Sections */}
      {BLUEPRINTS.map((bp, i) => (
        <section
          key={bp.slug}
          id={`blueprint-${bp.slug}`}
          className="max-w-5xl mx-auto px-6 pb-24 scroll-mt-24"
        >
          <div className="border-t border-border/50 pt-12">
            <span className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${STAGE_COLORS[bp.stage]} inline-block mb-4`}>
              {bp.stage}
            </span>
            <h2 className="font-serif text-3xl mb-2">{bp.title}</h2>
            <p className="text-muted-foreground mb-8">{bp.description}</p>

            <TierGate
              requiredTier="pro"
              fallback={
                <div className="relative rounded-2xl overflow-hidden border border-border">
                  <div className="blur-sm pointer-events-none select-none opacity-40 p-6">
                    {bp.component}
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center bg-background/60">
                    <div className="text-center">
                      <p className="font-semibold mb-3">Pro or Max required</p>
                      <a
                        href="/pricing"
                        className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors"
                      >
                        Upgrade to unlock <ArrowRight className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                </div>
              }
            >
              {bp.component}
            </TierGate>

            {i < BLUEPRINTS.length - 1 && (
              <div className="mt-10 flex justify-end">
                <a
                  href={`#blueprint-${BLUEPRINTS[i + 1].slug}`}
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
                >
                  Next Blueprint: {BLUEPRINTS[i + 1].title} <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            )}
          </div>
        </section>
      ))}

      <Footer />
    </div>
  );
}
```

- [ ] **Step 2: Typecheck**

```bash
pnpm run typecheck
```

Expected: no errors. If a blueprint component doesn't export a named export matching the import, check the component file and adjust the import style (default vs named).

- [ ] **Step 3: Commit**

```bash
git add artifacts/specflow-newsletter/src/pages/blueprints.tsx
git commit -m "feat(P22): redesign blueprints page — stage filter, card grid, detail sections, tier gate"
```

---

## Task 8: P23 — Pricing Page Rewrite

**Files:**
- Modify: `artifacts/specflow-newsletter/src/pages/pricing.tsx`

- [ ] **Step 1: Rewrite pricing.tsx**

Replace the entire file:

```typescript
import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { Check, X, ArrowRight, Loader2, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import PublicNav from '@/components/PublicNav';
import Footer from '@/components/Footer';
import { usePayments } from '@/lib/usePayments';
import { useAuth } from '@/lib/AuthContext';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.5, delay: i * 0.1 } }),
};

const COMPARISON = [
  {
    others: 'Business books ($30)',
    need: 'One actionable idea',
    deliver: 'Weekly researched idea + blueprint',
  },
  {
    others: 'Consultants ($500/hr)',
    need: 'Execution plan',
    deliver: 'Step-by-step build guide',
  },
  {
    others: 'Other newsletters ($0)',
    need: 'Real market intelligence',
    deliver: 'Scored opportunity analysis',
  },
];

const TIERS = [
  {
    name: 'Free',
    label: 'Tester',
    price: '$0',
    subtext: 'forever',
    description: '1 free idea/month, basic vault access, newsletter',
    anchor: '',
    cta: 'Start Free',
    href: '/sign-up',
    highlight: false,
    ctaVariant: 'outline' as const,
  },
  {
    name: 'Pro',
    label: 'Builder',
    price: '$29',
    subtext: '/month',
    description: 'Full vault, blueprints, AI templates, weekly briefs',
    anchor: 'Less than a business book. More than a co-founder.',
    cta: 'Start Building',
    href: '/pro-portal',
    highlight: true,
    ctaVariant: 'default' as const,
  },
  {
    name: 'Max',
    label: 'Operator',
    price: '$99',
    subtext: '/month',
    description: 'Everything in Pro + investor matching, co-founder network, monthly strategy call, private community',
    anchor: 'Your first investor intro pays for 3 years of Max.',
    cta: 'Go Max',
    href: '/max-portal',
    highlight: false,
    ctaVariant: 'secondary' as const,
  },
];

const FAQ = [
  {
    q: 'Is the newsletter actually free?',
    a: 'Yes. The weekly startup idea brief is 100% free, always. You get one full idea every Friday — researched, scored, and blueprinted. Pro and Max unlock the full vault, AI tools, and community.',
  },
  {
    q: "What's the difference between Pro and Max?",
    a: 'Pro gives you full vault access (200+ ideas), blueprints, AI templates, and weekly briefs. Max adds investor matching, co-founder network, a monthly strategy call with a founder, and access to the private community.',
  },
  {
    q: 'Can I cancel anytime?',
    a: 'Yes, cancel anytime from your portal. No lock-ins, no cancellation fees. Your access continues until the end of the billing period.',
  },
  {
    q: 'How often do new ideas drop?',
    a: 'Every Friday. One complete startup idea — researched, scored, and blueprinted. Pro and Max subscribers get the full brief plus access to all past issues.',
  },
  {
    q: 'What if I already have an idea?',
    a: "The Builder Brief isn't just idea delivery. Use the Idea Agent to validate your existing idea, the blueprints to build it faster, and the community to find co-founders and early customers.",
  },
];

const FEATURES = [
  { name: 'Weekly startup idea brief', free: true, pro: true, max: true },
  { name: 'Basic vault access (1/month)', free: true, pro: false, max: false },
  { name: 'Full vault (200+ ideas)', free: false, pro: true, max: true },
  { name: 'Execution blueprints', free: false, pro: true, max: true },
  { name: 'AI Idea Agent', free: false, pro: true, max: true },
  { name: 'AI templates (landing page, PRD, GTM)', free: false, pro: true, max: true },
  { name: 'Investor matching', free: false, pro: false, max: true },
  { name: 'Co-founder network', free: false, pro: false, max: true },
  { name: 'Monthly strategy call', free: false, pro: false, max: true },
  { name: 'Private community', free: false, pro: false, max: true },
];

export default function PricingPage() {
  const { initiatePayment } = usePayments();
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [loadingTier, setLoadingTier] = useState<string | null>(null);

  const handleTierClick = async (tier: typeof TIERS[number]) => {
    if (tier.name === 'Free') {
      setLocation(tier.href);
      return;
    }
    if (!user) {
      setLocation('/sign-in');
      return;
    }
    setLoadingTier(tier.name);
    try {
      await initiatePayment(tier.name.toLowerCase() as 'pro' | 'max');
    } catch {
      setLocation(tier.href);
    } finally {
      setLoadingTier(null);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <PublicNav activePage="pricing" />

      {/* Headline */}
      <section className="max-w-4xl mx-auto px-6 pt-24 pb-12 text-center">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-serif text-4xl md:text-6xl tracking-tight mb-4"
        >
          Stop paying for ideas you'll never build.{' '}
          <span className="italic text-primary">Start with one.</span>
        </motion.h1>
      </section>

      {/* Comparison Table */}
      <section className="max-w-4xl mx-auto px-6 pb-16">
        <div className="overflow-hidden rounded-2xl border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-6 py-4 font-semibold text-muted-foreground">What others charge</th>
                <th className="text-left px-6 py-4 font-semibold text-muted-foreground">What you need</th>
                <th className="text-left px-6 py-4 font-semibold text-primary">What we deliver</th>
              </tr>
            </thead>
            <tbody>
              {COMPARISON.map((row, i) => (
                <tr key={i} className={i < COMPARISON.length - 1 ? 'border-b border-border/50' : ''}>
                  <td className="px-6 py-4 text-muted-foreground">{row.others}</td>
                  <td className="px-6 py-4 text-muted-foreground">{row.need}</td>
                  <td className="px-6 py-4 font-medium">{row.deliver}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Tier Cards */}
      <section className="max-w-5xl mx-auto px-6 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TIERS.map((tier, i) => (
            <motion.div
              key={tier.name}
              custom={i}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              className={`relative rounded-2xl border p-8 flex flex-col ${
                tier.highlight
                  ? 'border-primary shadow-lg shadow-primary/10 bg-card'
                  : 'border-border bg-card'
              }`}
            >
              {tier.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground px-3 py-0.5 text-xs font-bold uppercase tracking-wider">
                    Most Popular
                  </Badge>
                </div>
              )}

              <div className="mb-6">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground mb-2">
                  {tier.label}
                </p>
                <div className="flex items-baseline gap-1 mb-1">
                  <span className="font-serif text-4xl font-bold">{tier.price}</span>
                  <span className="text-muted-foreground text-sm">{tier.subtext}</span>
                </div>
                <p className="text-sm text-muted-foreground mt-3">{tier.description}</p>
                {tier.anchor && (
                  <p className="text-xs italic text-muted-foreground/70 mt-2">"{tier.anchor}"</p>
                )}
              </div>

              <div className="space-y-2.5 flex-1 mb-8">
                {FEATURES.map(feature => {
                  const included = tier.name === 'Free' ? feature.free
                    : tier.name === 'Pro' ? feature.pro
                    : feature.max;
                  return (
                    <div key={feature.name} className="flex items-center gap-2.5 text-sm">
                      {included ? (
                        <Check className="w-4 h-4 text-primary flex-shrink-0" />
                      ) : (
                        <X className="w-4 h-4 text-muted-foreground/40 flex-shrink-0" />
                      )}
                      <span className={included ? 'text-foreground' : 'text-muted-foreground/50'}>
                        {feature.name}
                      </span>
                    </div>
                  );
                })}
              </div>

              <Button
                onClick={() => handleTierClick(tier)}
                disabled={loadingTier === tier.name}
                variant={tier.ctaVariant}
                className="w-full h-12 font-semibold"
              >
                {loadingTier === tier.name ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>{tier.cta} <ArrowRight className="w-4 h-4 ml-1.5" /></>
                )}
              </Button>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Guarantee Strip */}
      <section className="bg-card border-y border-border py-8 px-6 mb-16">
        <div className="max-w-3xl mx-auto flex items-center justify-center gap-4 text-center">
          <Shield className="w-6 h-6 text-primary flex-shrink-0" />
          <p className="text-base font-medium">
            30-day no-questions refund. If you don't find one idea worth building, we'll give you your money back.
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-3xl mx-auto px-6 pb-24">
        <h2 className="font-serif text-2xl mb-8">Frequently asked</h2>
        <Accordion type="single" collapsible className="space-y-2">
          {FAQ.map((item, i) => (
            <AccordionItem key={i} value={`faq-${i}`} className="border border-border rounded-xl px-6">
              <AccordionTrigger className="text-left font-medium hover:no-underline py-5">
                {item.q}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground pb-5">
                {item.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>

      <Footer />
    </div>
  );
}
```

- [ ] **Step 2: Typecheck**

```bash
pnpm run typecheck
```

- [ ] **Step 3: Commit**

```bash
git add artifacts/specflow-newsletter/src/pages/pricing.tsx
git commit -m "feat(P23): redesign pricing page — comparison table, tier labels, guarantee strip, FAQ accordion"
```

---

## Task 9: P24 — Ground Game CountrySelector SVG Map

**Files:**
- Modify: `artifacts/specflow-newsletter/src/components/ground-game/CountrySelector.tsx`

- [ ] **Step 1: Rewrite CountrySelector.tsx**

Replace the entire file. The SVG map uses approximate positions for the 7 supported countries with clickable circles. A `<select>` fallback is shown on small screens.

```typescript
import { Country } from "@/lib/ground-game-data";
import { Lock } from "lucide-react";

const FLAGS: Record<Country, string> = {
  India: "🇮🇳",
  "United States": "🇺🇸",
  "United Kingdom": "🇬🇧",
  Australia: "🇦🇺",
  UAE: "🇦🇪",
  "Southeast Asia": "🌏",
  "Rest of World": "🌍",
};

const COUNTRIES: Country[] = [
  "India",
  "United States",
  "United Kingdom",
  "Australia",
  "UAE",
  "Southeast Asia",
  "Rest of World",
];

// Approximate (cx, cy) positions on a 400x200 viewBox world map
const PIN_POSITIONS: Record<Country, { cx: number; cy: number }> = {
  "United States":   { cx: 80,  cy: 80  },
  "United Kingdom":  { cx: 188, cy: 55  },
  India:             { cx: 272, cy: 100 },
  UAE:               { cx: 252, cy: 95  },
  "Southeast Asia":  { cx: 308, cy: 108 },
  Australia:         { cx: 318, cy: 148 },
  "Rest of World":   { cx: 200, cy: 100 },
};

interface CountrySelectorProps {
  activeCountry: Country;
  userTier: string;
  onCountryChange: (country: Country) => void;
  onLockedClick: () => void;
}

export function CountrySelector({
  activeCountry,
  userTier,
  onCountryChange,
  onLockedClick,
}: CountrySelectorProps) {
  const isLocked = (country: Country) => userTier === "free" && country !== "India";

  const handlePin = (country: Country) => {
    if (isLocked(country)) {
      onLockedClick();
    } else {
      onCountryChange(country);
    }
  };

  return (
    <div className="w-full">
      {/* SVG World Map — hidden on xs, shown sm+ */}
      <div className="hidden sm:block w-full mb-4">
        <svg
          viewBox="0 0 400 200"
          className="w-full max-w-lg mx-auto"
          aria-label="Country selector map"
        >
          {/* Simple world outline background */}
          <rect x="0" y="0" width="400" height="200" rx="12" fill="transparent" />

          {/* Country pins */}
          {COUNTRIES.filter(c => c !== "Rest of World").map(country => {
            const pos = PIN_POSITIONS[country];
            const active = activeCountry === country;
            const locked = isLocked(country);
            return (
              <g
                key={country}
                onClick={() => handlePin(country)}
                className="cursor-pointer"
                role="button"
                aria-label={country}
              >
                <circle
                  cx={pos.cx}
                  cy={pos.cy}
                  r={active ? 10 : 7}
                  className={`transition-all ${
                    active
                      ? "fill-primary stroke-primary/30 stroke-[4]"
                      : locked
                      ? "fill-muted stroke-border"
                      : "fill-card stroke-border hover:fill-primary/20 hover:stroke-primary"
                  }`}
                />
                <text
                  x={pos.cx}
                  y={pos.cy + 4}
                  textAnchor="middle"
                  fontSize="8"
                  className="pointer-events-none select-none fill-foreground"
                >
                  {FLAGS[country]}
                </text>
                {locked && (
                  <text
                    x={pos.cx}
                    y={pos.cy + 18}
                    textAnchor="middle"
                    fontSize="7"
                    className="pointer-events-none select-none fill-muted-foreground"
                  >
                    🔒
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Fallback dropdown — always shown on xs, hidden sm+ */}
      <div className="sm:hidden">
        <select
          value={activeCountry}
          onChange={e => {
            const c = e.target.value as Country;
            if (isLocked(c)) onLockedClick();
            else onCountryChange(c);
          }}
          className="w-full px-4 py-2.5 border border-border rounded-xl bg-card text-foreground text-sm"
        >
          {COUNTRIES.map(c => (
            <option key={c} value={c}>
              {FLAGS[c]} {c} {isLocked(c) ? "🔒 Pro" : ""}
            </option>
          ))}
        </select>
      </div>

      {/* Active country label */}
      <p className="text-center text-sm font-medium mt-2">
        {FLAGS[activeCountry]} {activeCountry}
      </p>
    </div>
  );
}
```

- [ ] **Step 2: Typecheck**

```bash
pnpm run typecheck
```

- [ ] **Step 3: Commit**

```bash
git add artifacts/specflow-newsletter/src/components/ground-game/CountrySelector.tsx
git commit -m "feat(P24a): country selector — SVG pin map with dropdown fallback"
```

---

## Task 10: P24 — Ground Game Card, Filter Bar, Drawer

**Files:**
- Modify: `artifacts/specflow-newsletter/src/components/ground-game/CategoryFilterBar.tsx`
- Modify: `artifacts/specflow-newsletter/src/components/ground-game/GroundGameCard.tsx`
- Modify: `artifacts/specflow-newsletter/src/components/ground-game/GroundGameDrawer.tsx`

- [ ] **Step 1: Restyle CategoryFilterBar.tsx as pill tabs**

Replace the file:

```typescript
import { Category } from "@/lib/ground-game-data";

const CATEGORIES: Category[] = [
  "Retail",
  "Services",
  "Tech",
  "Food & Beverage",
  "Healthcare",
  "Education",
  "Real Estate",
  "Logistics",
];

interface CategoryFilterBarProps {
  activeCategories: Set<Category>;
  onToggle: (cat: Category) => void;
}

export function CategoryFilterBar({ activeCategories, onToggle }: CategoryFilterBarProps) {
  return (
    <div className="flex gap-2 flex-wrap">
      {CATEGORIES.map(cat => {
        const active = activeCategories.has(cat);
        return (
          <button
            key={cat}
            onClick={() => onToggle(cat)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all ${
              active
                ? "bg-primary/10 text-primary border-primary/30"
                : "border-border text-muted-foreground hover:text-foreground hover:border-foreground/30"
            }`}
          >
            {cat}
          </button>
        );
      })}
    </div>
  );
}
```

> Note: Check the actual Category type values in `ground-game-data.ts` and update the `CATEGORIES` array to match exactly.

- [ ] **Step 2: Redesign GroundGameCard.tsx**

Replace the file:

```typescript
import { GroundGameIdea } from "@/lib/ground-game-data";

const EFFORT_STYLE: Record<GroundGameIdea["difficulty"], { label: string; cls: string }> = {
  "Founder-Friendly":      { label: "Low",    cls: "bg-green-100 text-green-700" },
  "Requires Local Network":{ label: "Medium", cls: "bg-yellow-100 text-yellow-700" },
  "Capital Intensive":     { label: "High",   cls: "bg-red-100 text-red-700" },
};

const COUNTRY_FLAGS: Record<string, string> = {
  India: "🇮🇳",
  "United States": "🇺🇸",
  "United Kingdom": "🇬🇧",
  Australia: "🇦🇺",
  UAE: "🇦🇪",
  "Southeast Asia": "🌏",
  "Rest of World": "🌍",
};

interface GroundGameCardProps {
  idea: GroundGameIdea;
  isGated: boolean;
  onClick: () => void;
}

export function GroundGameCard({ idea, isGated, onClick }: GroundGameCardProps) {
  const effort = EFFORT_STYLE[idea.difficulty];

  return (
    <div
      className="relative bg-card border border-border rounded-2xl p-6 hover:border-primary/30 hover:shadow-md transition-all duration-200 flex flex-col gap-3 cursor-pointer"
      onClick={onClick}
    >
      {/* Top row */}
      <div className="flex items-center justify-between">
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${effort.cls}`}>
          {effort.label} effort
        </span>
        <span className="text-xs text-muted-foreground">
          {COUNTRY_FLAGS[idea.country]} {idea.mode}
        </span>
      </div>

      {/* Title */}
      <h3 className="font-serif font-bold text-lg leading-snug">{idea.title}</h3>

      {/* Expected result (hook) */}
      <p className="text-sm text-foreground font-medium">{idea.hook}</p>

      {/* Why now quote */}
      <p className="text-xs text-muted-foreground italic line-clamp-1">{idea.whyNow}</p>

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-border/50 mt-auto">
        <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
          {idea.category}
        </span>
        <button
          className="text-xs font-semibold text-primary hover:underline"
          onClick={e => { e.stopPropagation(); onClick(); }}
        >
          Expand →
        </button>
      </div>

      {/* Gated overlay */}
      {isGated && (
        <>
          <div className="absolute bottom-0 left-0 right-0 h-2/5 backdrop-blur-[3px] bg-background/30 rounded-b-2xl z-10 pointer-events-none" />
          <div className="absolute bottom-4 left-0 right-0 z-20 flex justify-center pointer-events-none">
            <div className="bg-card/95 border border-border rounded-md px-3 py-1.5 shadow-sm text-[11px] font-bold">
              {idea.tier === "max" ? "Max" : "Pro"} only
            </div>
          </div>
        </>
      )}
    </div>
  );
}
```

- [ ] **Step 3: Redesign GroundGameDrawer.tsx**

Replace the file:

```typescript
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check, Copy } from "lucide-react";
import { GroundGameIdea } from "@/lib/ground-game-data";

const COUNTRY_FLAGS: Record<string, string> = {
  India: "🇮🇳",
  "United States": "🇺🇸",
  "United Kingdom": "🇬🇧",
  Australia: "🇦🇺",
  UAE: "🇦🇪",
  "Southeast Asia": "🌏",
  "Rest of World": "🌍",
};

interface GroundGameDrawerProps {
  idea: GroundGameIdea;
  onClose: () => void;
  userTier: string;
  isPremium: boolean;
  isGated: boolean;
}

export function GroundGameDrawer({ idea, onClose, isGated }: GroundGameDrawerProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (idea.gtmSteps[0]) {
      navigator.clipboard.writeText(idea.gtmSteps[0]);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex justify-end">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-background/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Drawer */}
      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 30, stiffness: 300 }}
        className="relative w-full max-w-lg bg-card border-l border-border h-full overflow-y-auto flex flex-col"
      >
        {/* Header */}
        <div className="sticky top-0 bg-card border-b border-border px-6 py-5 flex items-start justify-between gap-4 z-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground bg-muted px-2 py-0.5 rounded">
                {idea.category}
              </span>
              <span className="text-sm">{COUNTRY_FLAGS[idea.country]}</span>
            </div>
            <h2 className="font-serif font-bold text-xl">{idea.title}</h2>
          </div>
          <button
            onClick={onClose}
            className="flex-shrink-0 w-8 h-8 rounded-full bg-muted hover:bg-muted/80 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className={`flex-1 px-6 py-8 space-y-8 ${isGated ? "blur-sm pointer-events-none select-none" : ""}`}>

          {/* Hook */}
          <div>
            <p className="font-medium text-foreground">{idea.hook}</p>
            <p className="text-sm text-muted-foreground mt-2 italic">{idea.whyNow}</p>
          </div>

          {/* Step-by-step execution */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">
              Execution Steps
            </h3>
            <ol className="space-y-3">
              {idea.gtmSteps.map((step, i) => (
                <li key={i} className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center mt-0.5">
                    {i + 1}
                  </span>
                  <p className="text-sm text-foreground leading-relaxed">{step}</p>
                </li>
              ))}
            </ol>
          </div>

          {/* AI Angle — code block style */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">
              AI Angle / Script
            </h3>
            <pre className="bg-muted rounded-xl p-4 text-xs font-mono leading-relaxed whitespace-pre-wrap overflow-x-auto">
              {idea.aiAngle}
            </pre>
          </div>

          {/* Revenue model */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">
              Revenue Model
            </h3>
            <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 text-sm">
              {idea.revenueModel}
            </div>
          </div>
        </div>

        {/* CTA Footer */}
        <div className="sticky bottom-0 bg-card border-t border-border px-6 py-5">
          {isGated ? (
            <a
              href="/pricing"
              className="block w-full py-3 text-center rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-colors"
            >
              Upgrade to unlock this tactic
            </a>
          ) : (
            <button
              onClick={handleCopy}
              className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-colors"
            >
              {copied ? (
                <><Check className="w-4 h-4" /> Copied!</>
              ) : (
                <><Copy className="w-4 h-4" /> Try this tactic</>
              )}
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}
```

- [ ] **Step 4: Typecheck**

```bash
pnpm run typecheck
```

Expected: no errors. Fix any category type mismatch by checking `ground-game-data.ts` for the exact `Category` type values.

- [ ] **Step 5: Commit**

```bash
git add artifacts/specflow-newsletter/src/components/ground-game/
git commit -m "feat(P24b): ground game — pill filter bar, effort badges, drawer step guide + clipboard CTA"
```

---

## Task 11: P24 — Ground Game Page Header + Offline Toggle

**Files:**
- Modify: `artifacts/specflow-newsletter/src/pages/ground-game.tsx`

- [ ] **Step 1: Update the page header section and offline filter**

Find the `/* HERO STRIP */` section (around line 57) and replace it with:

```typescript
{/* HEADER */}
<section className="max-w-7xl mx-auto px-6 md:px-12 pt-8 pb-6">
  <div className="flex items-start justify-between gap-6 flex-wrap">
    <div>
      <h1 className="font-serif text-3xl md:text-4xl tracking-tight mb-2">Ground Game</h1>
      <p className="text-muted-foreground max-w-xl">
        The unglamorous, works-in-real-life playbook for getting your first 100 customers.
      </p>
    </div>

    {/* Offline mode toggle */}
    <button
      onClick={() => setMode(mode === "offline" ? "online" : "offline")}
      className={`flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-medium transition-all ${
        mode === "offline"
          ? "bg-primary/10 text-primary border-primary/30"
          : "border-border text-muted-foreground hover:text-foreground hover:border-foreground/30"
      }`}
    >
      <span className={`w-2 h-2 rounded-full ${mode === "offline" ? "bg-primary" : "bg-muted-foreground"}`} />
      {mode === "offline" ? "Offline only" : "All tactics"}
    </button>
  </div>
</section>
```

- [ ] **Step 2: Update `filteredIdeas` to include offline filter**

Find the `filteredIdeas` useMemo (around line 29) and update it:

```typescript
const filteredIdeas = useMemo(() => {
  return groundGameIdeas.filter((idea) => {
    const matchCountry = idea.country === activeCountry;
    const matchCategory = activeCategories.size === 0 || activeCategories.has(idea.category);
    const matchMode = mode !== "offline" || idea.mode === "OFFLINE";
    return matchCountry && matchCategory && matchMode;
  });
}, [activeCountry, activeCategories, mode]);
```

- [ ] **Step 3: Typecheck**

```bash
pnpm run typecheck
```

- [ ] **Step 4: Commit**

```bash
git add artifacts/specflow-newsletter/src/pages/ground-game.tsx
git commit -m "feat(P24c): ground game page — new header, subtitle, offline mode filter toggle"
```

---

## Task 12: P25 — Idea Agent Backend (OpenAI SSE)

**Files:**
- Modify: `artifacts/api-server/src/routes/idea-agent.ts`
- Test: `artifacts/api-server/src/routes/__tests__/idea-agent.test.ts`

- [ ] **Step 1: Write the failing test**

Create `artifacts/api-server/src/routes/__tests__/idea-agent.test.ts`:

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@workspace/db', () => ({
  db: {
    select: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    limit: vi.fn().mockResolvedValue([{
      email: 'test@example.com',
      tier: 'pro',
      portalState: { ideaAgentUsageCount: 1, ideaAgentUsageMonth: '2026-05' },
    }]),
    update: vi.fn().mockReturnThis(),
    set: vi.fn().mockReturnThis(),
  },
  subscribersTable: {},
}));

vi.mock('openai', () => ({
  default: class MockOpenAI {
    chat = {
      completions: {
        create: vi.fn().mockResolvedValue({
          [Symbol.asyncIterator]: async function* () {
            yield { choices: [{ delta: { content: '## SCORECARD\n' } }] };
            yield { choices: [{ delta: { content: 'Opportunity: 82\n' } }] };
          },
        }),
      },
    };
  },
}));

vi.mock('../../../middleware/verifyUser', () => ({
  verifyUser: (req: any, _res: any, next: any) => {
    req.user = { id: 'user_123', email: 'test@example.com' };
    next();
  },
}));

import express from 'express';
import request from 'supertest';
import ideaAgentRouter from '../idea-agent';

const app = express();
app.use(express.json());
app.use('/', ideaAgentRouter);

describe('POST /idea-agent/analyze', () => {
  it('returns 400 if idea is missing', async () => {
    const res = await request(app)
      .post('/analyze')
      .set('Authorization', 'Bearer token')
      .send({});
    expect(res.status).toBe(400);
  });

  it('streams SSE response for valid idea', async () => {
    const res = await request(app)
      .post('/analyze')
      .set('Authorization', 'Bearer token')
      .send({ idea: 'An app that matches dog walkers with senior citizens' });

    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toMatch(/text\/event-stream/);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd artifacts/api-server && pnpm run test -- --reporter=verbose 2>&1 | grep -A5 "idea-agent"
```

Expected: FAIL — route returns 501.

- [ ] **Step 3: Implement idea-agent.ts**

Replace the entire file:

```typescript
import { Router } from "express";
import OpenAI from "openai";
import { verifyUser } from "../middleware/verifyUser";
import { db, subscribersTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router = Router();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const USAGE_LIMITS: Record<string, number> = {
  free: 2,
  pro: 20,
  max: Infinity,
};

const SYSTEM_PROMPT = `You are a brutally honest startup advisor. Analyze the given idea and produce a structured report with exactly these 7 sections in order, each starting with ## followed by the section name on its own line:

## SCORECARD
Rate each dimension 0-100:
Opportunity: [number]
Problem: [number]
Feasibility: [number]
Why Now: [number]

## MARKET SIZE
Estimate TAM with reasoning.

## COMPETITOR GAPS
Bullet list of what existing players are missing.

## WHY NOW
3 bullets on timing.

## FIRST 10 CUSTOMERS
Specific, unglamorous acquisition strategy.

## FIRST REVENUE PATH
Pricing model and timeline to first dollar.

## RISK FLAGS
2-3 specific risks the founder must know.

Be direct. No fluff. Real numbers where possible.`;

router.post("/analyze", verifyUser, async (req, res): Promise<void> => {
  const email = req.user?.email;
  if (!email) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const { idea, stage, targetMarket, budget } = req.body as {
    idea?: string;
    stage?: string;
    targetMarket?: string;
    budget?: string;
  };

  if (!idea || idea.trim().length < 10) {
    res.status(400).json({ error: "idea is required (min 10 chars)" });
    return;
  }

  // Load subscriber + check usage
  const [subscriber] = await db
    .select()
    .from(subscribersTable)
    .where(eq(subscribersTable.email, email))
    .limit(1);

  if (!subscriber) {
    res.status(404).json({ error: "Subscriber not found" });
    return;
  }

  const tier = subscriber.tier ?? "free";
  const limit = USAGE_LIMITS[tier] ?? 2;
  const portalState = (subscriber.portalState as Record<string, unknown>) ?? {};
  const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM

  let usageCount = 0;
  if (portalState.ideaAgentUsageMonth === currentMonth) {
    usageCount = (portalState.ideaAgentUsageCount as number) ?? 0;
  }

  if (usageCount >= limit) {
    res.status(429).json({
      error: "Usage limit reached",
      limit,
      used: usageCount,
      resetMonth: currentMonth,
    });
    return;
  }

  // Increment usage before streaming
  await db
    .update(subscribersTable)
    .set({
      portalState: {
        ...portalState,
        ideaAgentUsageCount: usageCount + 1,
        ideaAgentUsageMonth: currentMonth,
      },
    })
    .where(eq(subscribersTable.email, email));

  // Build user message
  const contextParts = [
    `Idea: ${idea.trim()}`,
    stage && `Stage: ${stage}`,
    targetMarket && `Target market: ${targetMarket}`,
    budget && `Budget range: ${budget}`,
  ].filter(Boolean);
  const userMessage = contextParts.join("\n");

  // Stream SSE
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  try {
    const stream = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userMessage },
      ],
      stream: true,
      temperature: 0.7,
      max_tokens: 1500,
    });

    for await (const chunk of stream) {
      const token = chunk.choices[0]?.delta?.content ?? "";
      if (token) {
        res.write(`data: ${JSON.stringify({ token })}\n\n`);
      }
    }

    res.write("data: [DONE]\n\n");
  } catch (err) {
    res.write(`data: ${JSON.stringify({ error: "Stream error" })}\n\n`);
  } finally {
    res.end();
  }
});

router.post("/save", verifyUser, async (req, res): Promise<void> => {
  res.status(501).json({ error: "Save to vault not yet implemented" });
});

router.post("/share", verifyUser, async (req, res): Promise<void> => {
  res.status(501).json({ error: "Share analysis not yet implemented" });
});

export default router;
```

- [ ] **Step 4: Add OPENAI_API_KEY to .env.example if missing**

```bash
grep -q OPENAI_API_KEY artifacts/api-server/.env.example 2>/dev/null || \
  echo "OPENAI_API_KEY=sk-..." >> artifacts/api-server/.env.example
```

- [ ] **Step 5: Run test to verify it passes**

```bash
cd artifacts/api-server && pnpm run test -- --reporter=verbose 2>&1 | grep -A8 "idea-agent"
```

Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add artifacts/api-server/src/routes/idea-agent.ts \
        artifacts/api-server/src/routes/__tests__/idea-agent.test.ts \
        artifacts/api-server/.env.example
git commit -m "feat(P25a): idea agent backend — OpenAI SSE streaming, usage limits per tier"
```

---

## Task 13: P25 — Idea Agent Frontend

**Files:**
- Modify: `artifacts/specflow-newsletter/src/pages/idea-agent.tsx`

- [ ] **Step 1: Rewrite idea-agent.tsx**

Replace the entire file:

```typescript
import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { Redirect, Link } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import { Wand2, ChevronDown, Copy, Check, Loader2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import PublicNav from '@/components/PublicNav';
import Footer from '@/components/Footer';
import { usePageTracking } from '@/hooks/useAnalytics';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const SECTIONS = [
  'SCORECARD',
  'MARKET SIZE',
  'COMPETITOR GAPS',
  'WHY NOW',
  'FIRST 10 CUSTOMERS',
  'FIRST REVENUE PATH',
  'RISK FLAGS',
] as const;

type SectionName = typeof SECTIONS[number];

interface SectionContent {
  name: SectionName;
  content: string;
}

const USAGE_LIMITS: Record<string, number> = { free: 2, pro: 20, max: Infinity };

function parseToken(
  token: string,
  sections: SectionContent[],
  currentSection: SectionName | null,
): { sections: SectionContent[]; currentSection: SectionName | null } {
  let s = [...sections];
  let cur = currentSection;

  const sectionMatch = SECTIONS.find(name =>
    token.includes(`## ${name}`)
  );

  if (sectionMatch) {
    cur = sectionMatch;
    if (!s.find(x => x.name === sectionMatch)) {
      s = [...s, { name: sectionMatch, content: '' }];
    }
    return { sections: s, currentSection: cur };
  }

  if (cur) {
    s = s.map(x =>
      x.name === cur ? { ...x, content: x.content + token } : x
    );
  }

  return { sections: s, currentSection: cur };
}

export default function IdeaAgent() {
  usePageTracking('idea-agent');
  const { user, loading, tier, session } = useAuth();

  const [idea, setIdea] = useState('');
  const [stage, setStage] = useState('');
  const [targetMarket, setTargetMarket] = useState('');
  const [budget, setBudget] = useState('');
  const [contextOpen, setContextOpen] = useState(false);

  const [streaming, setStreaming] = useState(false);
  const [sections, setSections] = useState<SectionContent[]>([]);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const currentSectionRef = useRef<SectionName | null>(null);

  if (loading) return null;
  if (!user) return <Redirect to="/sign-in" />;

  const usageLimit = USAGE_LIMITS[tier ?? 'free'] ?? 2;
  const usageLimitText = usageLimit === Infinity ? 'Unlimited' : `${usageLimit}/month`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!idea.trim() || streaming) return;

    setSections([]);
    setDone(false);
    setError(null);
    setStreaming(true);
    currentSectionRef.current = null;

    try {
      const token = await session?.getToken();
      const res = await fetch(`${API_BASE}/idea-agent/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ idea, stage, targetMarket, budget }),
      });

      if (res.status === 429) {
        setError('Usage limit reached for this month. Upgrade for more analyses.');
        setStreaming(false);
        return;
      }

      if (!res.ok) {
        setError('Something went wrong. Please try again.');
        setStreaming(false);
        return;
      }

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        setError('Stream unavailable.');
        setStreaming(false);
        return;
      }

      while (true) {
        const { done: streamDone, value } = await reader.read();
        if (streamDone) break;

        const raw = decoder.decode(value);
        const lines = raw.split('\n').filter(l => l.startsWith('data: '));

        for (const line of lines) {
          const data = line.slice(6);
          if (data === '[DONE]') {
            setDone(true);
            continue;
          }
          try {
            const { token: tok, error: streamError } = JSON.parse(data);
            if (streamError) { setError(streamError); break; }
            if (tok) {
              setSections(prev => {
                const result = parseToken(tok, prev, currentSectionRef.current);
                currentSectionRef.current = result.currentSection;
                return result.sections;
              });
            }
          } catch {}
        }
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setStreaming(false);
    }
  };

  const handleCopyMarkdown = () => {
    const md = sections
      .map(s => `## ${s.name}\n\n${s.content.trim()}`)
      .join('\n\n---\n\n');
    navigator.clipboard.writeText(md);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <PublicNav activePage="agent" />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-20">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
              <Wand2 className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="font-serif text-3xl tracking-tight">Idea Agent</h1>
              <p className="text-sm text-muted-foreground">
                Drop your idea. Get a brutally honest analysis in 60 seconds.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Input Panel */}
        <form onSubmit={handleSubmit} className="mb-12">
          <textarea
            value={idea}
            onChange={e => setIdea(e.target.value)}
            placeholder="Describe your startup idea in 2-3 sentences"
            rows={4}
            className="w-full px-5 py-4 border border-border rounded-2xl bg-card text-base resize-none focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all mb-4"
            required
          />

          {/* Collapsible context */}
          <Collapsible open={contextOpen} onOpenChange={setContextOpen}>
            <CollapsibleTrigger asChild>
              <button
                type="button"
                className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
              >
                <ChevronDown
                  className={`w-4 h-4 transition-transform ${contextOpen ? 'rotate-180' : ''}`}
                />
                Add context (optional)
              </button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                <div>
                  <label className="text-xs text-muted-foreground mb-1.5 block font-medium">Stage</label>
                  <select
                    value={stage}
                    onChange={e => setStage(e.target.value)}
                    className="w-full px-3 py-2.5 border border-border rounded-xl bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  >
                    <option value="">Any</option>
                    <option>Idea</option>
                    <option>Building</option>
                    <option>Launched</option>
                    <option>Scaling</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1.5 block font-medium">Target market</label>
                  <input
                    type="text"
                    value={targetMarket}
                    onChange={e => setTargetMarket(e.target.value)}
                    placeholder="e.g. SMBs in India"
                    className="w-full px-3 py-2.5 border border-border rounded-xl bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1.5 block font-medium">Budget range</label>
                  <select
                    value={budget}
                    onChange={e => setBudget(e.target.value)}
                    className="w-full px-3 py-2.5 border border-border rounded-xl bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  >
                    <option value="">Any</option>
                    <option>Bootstrap (&lt;$1K)</option>
                    <option>Low ($1K–$10K)</option>
                    <option>Mid ($10K–$100K)</option>
                    <option>Capital-heavy ($100K+)</option>
                  </select>
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* Usage meter */}
          <p className="text-xs text-muted-foreground mb-3">
            {tier === 'max' ? '∞ Unlimited analyses' : `${usageLimitText} analyses`}
          </p>

          <Button
            type="submit"
            disabled={streaming || !idea.trim()}
            className="w-full sm:w-auto h-12 px-8 font-semibold"
          >
            {streaming ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Analyzing…</>
            ) : (
              <>Analyze This Idea <ArrowRight className="w-4 h-4 ml-1.5" /></>
            )}
          </Button>

          <p className="mt-4 text-sm text-muted-foreground">
            Or{' '}
            <Link href="/vault-archive" className="text-primary hover:underline">
              pick a random idea from the vault →
            </Link>
          </p>
        </form>

        {/* Error state */}
        {error && (
          <div className="mb-8 p-4 bg-destructive/10 border border-destructive/20 rounded-xl text-sm text-destructive">
            {error}
          </div>
        )}

        {/* Analysis output */}
        <AnimatePresence>
          {sections.length > 0 && (
            <div className="space-y-8">
              {sections.map(section => (
                <motion.div
                  key={section.name}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">
                    {section.name}
                  </h3>
                  <div className="bg-card border border-border rounded-xl p-5">
                    <pre className="font-sans text-sm leading-relaxed whitespace-pre-wrap">
                      {section.content}
                    </pre>
                  </div>
                </motion.div>
              ))}

              {/* Export bar — shown after streaming completes */}
              {done && (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-wrap gap-3 pt-4 border-t border-border"
                >
                  <button
                    onClick={handleCopyMarkdown}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border text-sm font-medium hover:bg-card transition-colors"
                  >
                    {copied ? (
                      <><Check className="w-4 h-4 text-green-600" /> Copied!</>
                    ) : (
                      <><Copy className="w-4 h-4" /> Copy as Markdown</>
                    )}
                  </button>
                  {(tier === 'pro' || tier === 'max') && (
                    <button
                      className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border text-sm font-medium hover:bg-card transition-colors opacity-50 cursor-not-allowed"
                      title="Coming soon"
                      disabled
                    >
                      Save to Vault
                    </button>
                  )}
                  <button
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border text-sm font-medium hover:bg-card transition-colors opacity-50 cursor-not-allowed"
                    title="Coming soon"
                    disabled
                  >
                    Share Analysis
                  </button>
                </motion.div>
              )}
            </div>
          )}
        </AnimatePresence>
      </main>

      <Footer />
    </div>
  );
}
```

- [ ] **Step 2: Typecheck**

```bash
pnpm run typecheck
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add artifacts/specflow-newsletter/src/pages/idea-agent.tsx
git commit -m "feat(P25b): idea agent frontend — SSE streaming UI, 7-section output, usage meter, export bar"
```

---

## Self-Review Spec Coverage Checklist

| Spec requirement | Task |
|---|---|
| P20: New headline, serif 72px/40px | Task 4 |
| P20: Live vault preview card with skeleton | Task 3, 4 |
| P20: Subscribe form placeholder + CTA text | Task 4 |
| P20: Social proof inline badges | Task 4 |
| P20: Remove contents array | Task 4 |
| P21a: Auth left panel vault teaser | Task 5 |
| P21a: Mobile logo above Clerk | Task 5 |
| P21b: 3 questions (stage/goal/constraint) | Task 6 |
| P21b: Slide animation + progress dots | Task 6 |
| P21b: PATCH /subscribers/me | Task 2, 6 |
| P21b: Redirect to /dashboard | Task 6 |
| P22: File rename | Task 1 |
| P22: Stage filter pills | Task 7 |
| P22: Blueprint card grid | Task 7 |
| P22: Detail sections with TierGate | Task 7 |
| P23: Comparison table | Task 8 |
| P23: Tier labels (Tester/Builder/Operator) | Task 8 |
| P23: Guarantee strip | Task 8 |
| P23: FAQ accordion | Task 8 |
| P24: SVG country map + fallback | Task 9 |
| P24: Pill filter bar | Task 10 |
| P24: Effort badges, hook, why-now | Task 10 |
| P24: Drawer step guide + AI angle + clipboard CTA | Task 10 |
| P24: Offline mode filter | Task 11 |
| P25: OpenAI SSE streaming | Task 12 |
| P25: Usage limits per tier | Task 12 |
| P25: 7-section streaming output | Task 12, 13 |
| P25: Textarea + collapsible context | Task 13 |
| P25: Usage meter | Task 13 |
| P25: Export bar (copy markdown) | Task 13 |

All spec requirements covered. ✓
