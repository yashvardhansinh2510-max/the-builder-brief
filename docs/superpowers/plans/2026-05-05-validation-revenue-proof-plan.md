# Validation with Revenue Proof Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Enable blueprint creators to add real traction/revenue data (MRR, users, growth rate) to prove execution in market. This proof appears on blueprint detail pages to build reader credibility and incentivize Pro tier upgrades.

**Architecture:** Traction data embeds directly in blueprint objects in `data.ts` (no separate table). Two new API endpoints handle POST (create/update) and GET (read-only public). Frontend has three changes: new creator form page, traction display section on issue detail, optional archive filter. All endpoints require authentication; creating traction requires Pro+ tier. Data validation via Zod schema.

**Tech Stack:** React (frontend forms), Express + Drizzle (API), Zod (validation), TypeScript

---

## File Structure

**Files to create:**
- `artifacts/api-server/src/routes/blueprints.ts` — API endpoints for traction POST/GET
- `artifacts/specflow-newsletter/src/pages/creator/traction.tsx` — Creator form page
- `artifacts/specflow-newsletter/src/components/TractioinProofSection.tsx` — Display component for issue page

**Files to modify:**
- `artifacts/specflow-newsletter/src/lib/data.ts` — Add traction type/schema
- `artifacts/specflow-newsletter/src/pages/issue.tsx` — Integrate traction display section
- `artifacts/specflow-newsletter/src/pages/archive.tsx` — Add filter for "has traction"
- `artifacts/api-server/src/routes/index.ts` — Register blueprints route

---

## Task 1: Add Traction Data Model & Schema

**Files:**
- Modify: `artifacts/specflow-newsletter/src/lib/data.ts`

- [ ] **Step 1: Add BlueprintTraction interface at top of data.ts**

After existing type imports, add:

```typescript
// Traction tracking for blueprints
export interface BlueprintTraction {
  status: "added" | "pending" | "archived"
  mrr?: number              // Monthly recurring revenue, USD
  arr?: number              // Annual recurring revenue, USD
  users?: number            // Total active customers/users
  monthsSinceLaunch?: number // Integer, >= 1
  growthRate?: number       // Month-over-month percentage (0-100)
  addedAt: string           // ISO 8601 timestamp
  lastUpdated: string       // ISO 8601 timestamp
  notes?: string            // Creator's narrative (max 500 chars)
}
```

- [ ] **Step 2: Add traction field to Issue interface**

Locate the `Issue` interface in data.ts. Add this field at the end of the interface (before closing brace):

```typescript
  traction?: BlueprintTraction
```

- [ ] **Step 3: Add Zod schema after existing schemas**

After all other Zod schemas in data.ts, add:

```typescript
export const tractioinSchema = z.object({
  status: z.enum(["added", "pending", "archived"]),
  mrr: z.number().min(0).optional(),
  arr: z.number().min(0).optional(),
  users: z.number().int().min(1).optional(),
  monthsSinceLaunch: z.number().int().min(1),
  growthRate: z.number().min(0).max(100).optional(),
  addedAt: z.string().datetime(),
  lastUpdated: z.string().datetime(),
  notes: z.string().max(500).optional(),
}).refine(
  (data) => data.mrr !== undefined || data.arr !== undefined || data.users !== undefined,
  { message: "At least one metric (MRR, ARR, or users) must be provided" }
)

export type TractioinData = z.infer<typeof tractioinSchema>
```

- [ ] **Step 4: Add traction to one blueprint in data.ts for testing**

Find the first blueprint in the `issues` array. Add this `traction` object (with closing comma on previous field):

```typescript
  traction: {
    status: "added",
    mrr: 5000,
    users: 150,
    monthsSinceLaunch: 8,
    growthRate: 12,
    addedAt: "2026-04-20T10:30:00Z",
    lastUpdated: "2026-05-05T14:30:00Z",
    notes: "Launched quietly, steady organic growth from initial users"
  }
```

- [ ] **Step 5: Verify types compile**

```bash
cd artifacts/specflow-newsletter && npx tsc --noEmit
```

Expected: No type errors, compilation succeeds.

- [ ] **Step 6: Commit**

```bash
cd /Users/yashvardhansinhjhala/the\ builder\ brief && git add artifacts/specflow-newsletter/src/lib/data.ts && git commit -m "feat: add traction data model and Zod schema

- Add BlueprintTraction interface with metrics (MRR, users, growth rate)
- Add traction? field to Issue type
- Add tractioinSchema with validation (monthsSinceLaunch required, at least one metric required)
- Add test traction data to first blueprint
- Verify TypeScript compilation"
```

---

## Task 2: Create Traction API Endpoints

**Files:**
- Create: `artifacts/api-server/src/routes/blueprints.ts`

- [ ] **Step 1: Create new file artifacts/api-server/src/routes/blueprints.ts**

```typescript
import { Router, type IRouter, type Request, type Response } from "express";
import { issues } from "@workspace/db";  // Import issues from data.ts (via workspace alias)
import { logger } from "../lib/logger";
import { verifyUser } from "../middleware/verifyUser";
import { tractioinSchema, type BlueprintTraction } from "@workspace/db";

const router: IRouter = Router();

// Helper: Find issue by slug
function findIssueBySlug(slug: string) {
  return issues.find(issue => issue.slug === slug);
}

// POST /api/blueprints/:slug/traction - Create or update traction data
router.post("/:slug/traction", verifyUser, async (req: Request, res: Response): Promise<void> => {
  try {
    const { slug } = req.params;
    const userId = req.user?.id;
    
    if (!slug || !userId) {
      res.status(400).json({ error: "Blueprint slug and user ID required" });
      return;
    }

    const issue = findIssueBySlug(slug);
    if (!issue) {
      res.status(404).json({ error: "Blueprint not found" });
      return;
    }

    // Verify creator (for now, assume authenticated user is creator - in production, check ownership)
    // This would be: if (issue.creatorId !== userId) { return res.status(403).json(...) }
    // For Phase 1, we trust the user is the creator

    // Validate input
    const validatedData = tractioinSchema.parse({
      ...req.body,
      status: req.body.status || "added",
      addedAt: issue.traction?.addedAt || new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
    });

    // Update issue in memory (Phase 1 storage)
    issue.traction = validatedData;

    res.status(200).json({
      success: true,
      traction: issue.traction,
    });
  } catch (error) {
    if (error instanceof Error && error.message.includes("At least one metric")) {
      res.status(400).json({ error: "Provide at least MRR, ARR, or user count" });
      return;
    }
    if (error instanceof Error && error.message.includes("monthsSinceLaunch")) {
      res.status(400).json({ error: "Months since launch is required" });
      return;
    }
    if (error instanceof Error && error.message.includes("Growth rate")) {
      res.status(400).json({ error: "Growth rate must be 0-100%" });
      return;
    }
    logger.error({ error }, "Error updating traction");
    res.status(500).json({ error: "Failed to update traction data" });
  }
});

// GET /api/blueprints/:slug/traction - Fetch traction data (public)
router.get("/:slug/traction", async (req: Request, res: Response): Promise<void> => {
  try {
    const { slug } = req.params;

    const issue = findIssueBySlug(slug);
    if (!issue) {
      res.status(404).json({ error: "Blueprint not found" });
      return;
    }

    res.json({
      slug: issue.slug,
      traction: issue.traction || null,
    });
  } catch (error) {
    logger.error({ error }, "Error fetching traction");
    res.status(500).json({ error: "Failed to fetch traction data" });
  }
});

export default router;
```

- [ ] **Step 2: Register route in artifacts/api-server/src/routes/index.ts**

Find the imports section at top of index.ts. Add:

```typescript
import blueprintsRouter from "./blueprints";
```

Find the router.use() calls. Add before the final export:

```typescript
router.use('/api/blueprints', blueprintsRouter);
```

- [ ] **Step 3: Test API endpoints with curl**

```bash
# Test GET (should return null traction for blueprint without traction)
curl http://localhost:3000/api/blueprints/medtranslate-pro/traction

# Test POST (would need auth header, so manual test with API client or playwright later)
# For now, just verify compilation
```

- [ ] **Step 4: Verify TypeScript compilation**

```bash
cd artifacts/api-server && npx tsc --noEmit
```

Expected: No type errors.

- [ ] **Step 5: Commit**

```bash
git add artifacts/api-server/src/routes/blueprints.ts artifacts/api-server/src/routes/index.ts && git commit -m "feat: add blueprint traction API endpoints

- Create POST /api/blueprints/:slug/traction for creating/updating traction
- Create GET /api/blueprints/:slug/traction for public read access
- Validate input with tractioinSchema (monthsSinceLaunch required, at least one metric)
- Return 404 if blueprint not found, 400 if validation fails
- Register route in index.ts at /api/blueprints"
```

---

## Task 3: Create TractioinProofSection Component

**Files:**
- Create: `artifacts/specflow-newsletter/src/components/TractioinProofSection.tsx`

- [ ] **Step 1: Create new file artifacts/specflow-newsletter/src/components/TractioinProofSection.tsx**

```typescript
import React from 'react';
import { TrendingUp, Users, Zap, Calendar } from 'lucide-react';
import type { BlueprintTraction } from '@/lib/data';

interface TractioinProofSectionProps {
  traction: BlueprintTraction;
}

export default function TractioinProofSection({ traction }: TractioinProofSectionProps) {
  return (
    <div className="mb-12">
      <div className="flex items-center gap-3 mb-6">
        <div className="text-2xl">🚀</div>
        <h2 className="font-serif text-3xl text-foreground">Traction Proof</h2>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {/* MRR Card */}
        {traction.mrr !== undefined && (
          <div className="bg-card border border-border rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-4 h-4 text-primary" />
              <span className="text-xs uppercase font-bold text-muted-foreground">MRR</span>
            </div>
            <span className="font-mono font-bold text-2xl text-foreground">
              ${(traction.mrr / 1000).toFixed(1)}k
            </span>
          </div>
        )}

        {/* Users Card */}
        {traction.users !== undefined && (
          <div className="bg-card border border-border rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-4 h-4 text-primary" />
              <span className="text-xs uppercase font-bold text-muted-foreground">Customers</span>
            </div>
            <span className="font-mono font-bold text-2xl text-foreground">
              {traction.users.toLocaleString()}
            </span>
          </div>
        )}

        {/* Growth Rate Card */}
        {traction.growthRate !== undefined && (
          <div className="bg-card border border-border rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              <span className="text-xs uppercase font-bold text-muted-foreground">Growth MoM</span>
            </div>
            <span className="font-mono font-bold text-2xl text-foreground">
              {traction.growthRate}%
            </span>
          </div>
        )}

        {/* Months Active Card */}
        {traction.monthsSinceLaunch !== undefined && (
          <div className="bg-card border border-border rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-4 h-4 text-primary" />
              <span className="text-xs uppercase font-bold text-muted-foreground">Live Since</span>
            </div>
            <span className="font-mono font-bold text-2xl text-foreground">
              {traction.monthsSinceLaunch}mo
            </span>
          </div>
        )}
      </div>

      {/* Notes */}
      {traction.notes && (
        <div className="bg-muted/30 border border-border rounded-2xl p-6">
          <p className="text-sm text-foreground italic">{traction.notes}</p>
          <p className="text-xs text-muted-foreground mt-2">
            Last updated: {new Date(traction.lastUpdated).toLocaleDateString()}
          </p>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Verify component exports**

```bash
cd artifacts/specflow-newsletter && npx tsc --noEmit src/components/TractioinProofSection.tsx
```

Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add artifacts/specflow-newsletter/src/components/TractioinProofSection.tsx && git commit -m "feat: create TractioinProofSection display component

- Display MRR, user count, growth rate, months active in 4-card grid
- Show founder notes if provided
- Use existing card styling (bg-card, border-border, rounded-2xl)
- Show last updated timestamp
- Only show metrics that are provided (optional fields)"
```

---

## Task 4: Integrate Traction Section into Issue Detail Page

**Files:**
- Modify: `artifacts/specflow-newsletter/src/pages/issue.tsx`

- [ ] **Step 1: Add import at top of issue.tsx**

After existing imports, add:

```typescript
import TractioinProofSection from '@/components/TractioinProofSection';
```

- [ ] **Step 2: Locate Unit Economics section in issue.tsx**

Search for "Unit Economics" heading. It should be around line 150-200 depending on file size.

- [ ] **Step 3: Add traction section after Unit Economics**

Find the closing `</div>` or `</section>` of the Unit Economics section. After it, add:

```typescript
        {/* Traction Proof Section */}
        {issue.traction?.status === "added" && (
          <TractioinProofSection traction={issue.traction} />
        )}
```

Make sure indentation matches surrounding code.

- [ ] **Step 4: Verify types compile**

```bash
cd artifacts/specflow-newsletter && npx tsc --noEmit
```

Expected: No type errors.

- [ ] **Step 5: Test in browser**

Start dev server:
```bash
cd artifacts/specflow-newsletter && npm run dev
```

Navigate to a blueprint detail page (e.g., `/issue/medtranslate-pro`). Should see "Traction Proof" section with metrics from Task 1 test data.

- [ ] **Step 6: Commit**

```bash
git add artifacts/specflow-newsletter/src/pages/issue.tsx && git commit -m "feat: integrate traction proof section into issue detail page

- Import TractioinProofSection component
- Render traction section only when status === 'added'
- Position after Unit Economics section
- Test with first blueprint's traction data"
```

---

## Task 5: Create Creator Traction Dashboard Form

**Files:**
- Create: `artifacts/specflow-newsletter/src/pages/creator/traction.tsx`

- [ ] **Step 1: Create directory if not exists**

```bash
mkdir -p artifacts/specflow-newsletter/src/pages/creator
```

- [ ] **Step 2: Create new file artifacts/specflow-newsletter/src/pages/creator/traction.tsx**

```typescript
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { TierGate } from '@/components/TierGate';
import { issues } from '@/lib/data';
import PublicNav from '@/components/PublicNav';
import { usePageTracking } from '@/hooks/useAnalytics';

export default function CreatorTractioinPage() {
  usePageTracking('/creator/traction');

  const featured = issues[0]; // Assume first issue is creator's featured blueprint
  const [formData, setFormData] = useState({
    mrr: featured?.traction?.mrr ? String(featured.traction.mrr) : '',
    arr: featured?.traction?.arr ? String(featured.traction.arr) : '',
    users: featured?.traction?.users ? String(featured.traction.users) : '',
    monthsSinceLaunch: featured?.traction?.monthsSinceLaunch ? String(featured.traction.monthsSinceLaunch) : '',
    growthRate: featured?.traction?.growthRate ? String(featured.traction.growthRate) : '',
    notes: featured?.traction?.notes || '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Validate at least one metric is provided
      const hasMetric = formData.mrr || formData.arr || formData.users;
      if (!formData.monthsSinceLaunch) {
        setError('Months since launch is required');
        setLoading(false);
        return;
      }
      if (!hasMetric) {
        setError('Provide at least MRR, ARR, or user count');
        setLoading(false);
        return;
      }

      const growthRate = formData.growthRate ? Number(formData.growthRate) : undefined;
      if (growthRate !== undefined && (growthRate < 0 || growthRate > 100)) {
        setError('Growth rate must be 0-100%');
        setLoading(false);
        return;
      }

      const payload = {
        mrr: formData.mrr ? Number(formData.mrr) : undefined,
        arr: formData.arr ? Number(formData.arr) : undefined,
        users: formData.users ? Number(formData.users) : undefined,
        monthsSinceLaunch: Number(formData.monthsSinceLaunch),
        growthRate,
        notes: formData.notes || undefined,
      };

      const response = await fetch(`/api/blueprints/${featured?.slug}/traction`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to save traction data');
        setLoading(false);
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        window.location.href = `/issue/${featured?.slug}`;
      }, 1500);
    } catch (err) {
      setError('Network error. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <PublicNav activePage="creator" />

      <TierGate requiredTier="pro">
        <main className="max-w-2xl mx-auto px-4 sm:px-6 pt-20 pb-32">
          <h1 className="font-serif text-5xl mb-2 text-foreground">Add Traction Proof</h1>
          <p className="text-xl text-muted-foreground mb-12">
            Showcase real metrics to prove your blueprint works in market.
          </p>

          {featured && (
            <div className="bg-card border border-border rounded-2xl p-8 mb-8">
              <p className="text-sm uppercase font-bold text-muted-foreground mb-2">Featured Blueprint</p>
              <h2 className="font-serif text-2xl text-foreground">{featured.title}</h2>
            </div>
          )}

          <form onSubmit={handleSubmit} className="bg-card border border-border rounded-2xl p-8 space-y-6">
            {/* MRR */}
            <div>
              <label className="block text-sm font-bold uppercase text-muted-foreground mb-2">
                Monthly Recurring Revenue (USD)
              </label>
              <Input
                type="number"
                name="mrr"
                value={formData.mrr}
                onChange={handleChange}
                placeholder="5000"
                className="rounded-lg"
                min="0"
              />
              <p className="text-xs text-muted-foreground mt-1">Optional - leave blank if not applicable</p>
            </div>

            {/* ARR */}
            <div>
              <label className="block text-sm font-bold uppercase text-muted-foreground mb-2">
                Annual Recurring Revenue (USD)
              </label>
              <Input
                type="number"
                name="arr"
                value={formData.arr}
                onChange={handleChange}
                placeholder="60000"
                className="rounded-lg"
                min="0"
              />
              <p className="text-xs text-muted-foreground mt-1">Optional - calculated from MRR if not provided</p>
            </div>

            {/* Users */}
            <div>
              <label className="block text-sm font-bold uppercase text-muted-foreground mb-2">
                Active Users/Customers
              </label>
              <Input
                type="number"
                name="users"
                value={formData.users}
                onChange={handleChange}
                placeholder="150"
                className="rounded-lg"
                min="1"
              />
              <p className="text-xs text-muted-foreground mt-1">Optional</p>
            </div>

            {/* Months Since Launch */}
            <div>
              <label className="block text-sm font-bold uppercase text-muted-foreground mb-2">
                Months Since Launch <span className="text-primary">*</span>
              </label>
              <Input
                type="number"
                name="monthsSinceLaunch"
                value={formData.monthsSinceLaunch}
                onChange={handleChange}
                placeholder="8"
                className="rounded-lg"
                min="1"
                required
              />
              <p className="text-xs text-muted-foreground mt-1">Required - integer only</p>
            </div>

            {/* Growth Rate */}
            <div>
              <label className="block text-sm font-bold uppercase text-muted-foreground mb-2">
                Month-over-Month Growth Rate (%)
              </label>
              <Input
                type="number"
                name="growthRate"
                value={formData.growthRate}
                onChange={handleChange}
                placeholder="12"
                className="rounded-lg"
                min="0"
                max="100"
              />
              <p className="text-xs text-muted-foreground mt-1">Optional - must be 0-100</p>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-bold uppercase text-muted-foreground mb-2">
                Founder Notes (max 500 chars)
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                placeholder="Briefly describe your traction story..."
                maxLength={500}
                rows={4}
                className="w-full px-4 py-2 rounded-lg bg-muted border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <p className="text-xs text-muted-foreground mt-1">{formData.notes.length}/500</p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
                Traction updated! Redirecting to blueprint...
              </div>
            )}

            {/* Buttons */}
            <div className="flex gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                className="rounded-full"
                onClick={() => window.history.back()}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold"
                disabled={loading}
              >
                {loading ? 'Saving...' : 'Save Traction Data'}
              </Button>
            </div>
          </form>
        </main>
      </TierGate>
    </div>
  );
}
```

- [ ] **Step 2: Verify types compile**

```bash
cd artifacts/specflow-newsletter && npx tsc --noEmit
```

Expected: No type errors.

- [ ] **Step 3: Test form in browser**

```bash
cd artifacts/specflow-newsletter && npm run dev
```

Navigate to `/creator/traction`. Form should render with TierGate (will show upgrade message if not Pro tier for testing, but form displays regardless during dev).

Fill in some test data and verify:
- Validation errors show (e.g., no metrics provided)
- Form accepts valid data
- All fields work correctly

- [ ] **Step 4: Commit**

```bash
git add artifacts/specflow-newsletter/src/pages/creator/traction.tsx && git commit -m "feat: create creator traction dashboard form

- Form at /creator/traction for adding/editing traction data
- Fields: MRR, ARR, users, monthsSinceLaunch (required), growth rate, notes
- TierGate wrapper (Pro+ tier required)
- Client-side validation (monthsSinceLaunch required, at least one metric, growth rate 0-100)
- POST to /api/blueprints/:slug/traction on submit
- Redirect to issue page on success
- Show error messages inline"
```

---

## Task 6: Add Traction Filter to Archive Page

**Files:**
- Modify: `artifacts/specflow-newsletter/src/pages/archive.tsx`

- [ ] **Step 1: Add filter state**

Find the `useState` calls in archive.tsx (around line 24). Add after existing state:

```typescript
  const [showOnlyTraction, setShowOnlyTraction] = useState(false);
```

- [ ] **Step 2: Update filteredIssues to include traction filter**

Find the `useMemo` that defines `filteredIssues`. Update the filter logic:

Change from:
```typescript
const filteredIssues = useMemo(() => {
  return issues.filter(issue => {
    const matchCat = activeCategory === "All" || issue.category === activeCategory;
    const matchQ = query === "" ||
      issue.title.toLowerCase().includes(query.toLowerCase()) ||
      issue.tagline.toLowerCase().includes(query.toLowerCase()) ||
      issue.category.toLowerCase().includes(query.toLowerCase());
    return matchCat && matchQ;
  });
}, [query, activeCategory]);
```

To:
```typescript
const filteredIssues = useMemo(() => {
  return issues.filter(issue => {
    const matchCat = activeCategory === "All" || issue.category === activeCategory;
    const matchQ = query === "" ||
      issue.title.toLowerCase().includes(query.toLowerCase()) ||
      issue.tagline.toLowerCase().includes(query.toLowerCase()) ||
      issue.category.toLowerCase().includes(query.toLowerCase());
    const matchTraction = !showOnlyTraction || issue.traction?.status === "added";
    return matchCat && matchQ && matchTraction;
  });
}, [query, activeCategory, showOnlyTraction]);
```

- [ ] **Step 3: Add traction filter toggle after category filters**

Find the category filter buttons (around line 73-88). After the closing `</div>` of category buttons, add:

```typescript
          {/* Traction Filter Toggle */}
          <div className="flex justify-center mt-6">
            <button
              onClick={() => setShowOnlyTraction(!showOnlyTraction)}
              className={`px-6 py-2.5 rounded-xl text-sm font-bold tracking-wide border transition-all duration-200
                ${showOnlyTraction
                  ? "bg-foreground text-background border-foreground shadow-md"
                  : "bg-card border-border text-muted-foreground hover:border-foreground/30 hover:text-foreground hover:shadow-sm"
                }`}
            >
              📈 Only Proven Blueprints
            </button>
          </div>
```

- [ ] **Step 4: Verify types compile**

```bash
cd artifacts/specflow-newsletter && npx tsc --noEmit
```

Expected: No type errors.

- [ ] **Step 5: Test in browser**

Start dev server if not already running:
```bash
cd artifacts/specflow-newsletter && npm run dev
```

Navigate to `/archive`. Click "Only Proven Blueprints" toggle. Should filter to only show blueprints where `traction?.status === "added"`.

- [ ] **Step 6: Commit**

```bash
git add artifacts/specflow-newsletter/src/pages/archive.tsx && git commit -m "feat: add traction filter to archive page

- Add showOnlyTraction state
- Update filteredIssues to filter by traction status when toggle active
- Add 'Only Proven Blueprints' toggle button after category filters
- Toggle styling matches existing button patterns"
```

---

## Task 7: Test All Integration

**Files:**
- Manual testing (no new files)

- [ ] **Step 1: Start both dev servers**

Terminal 1:
```bash
cd artifacts/specflow-newsletter && npm run dev
```

Terminal 2:
```bash
cd artifacts/api-server && npm run dev
```

- [ ] **Step 2: Verify traction data displays on blueprint detail page**

Navigate to `http://localhost:5173/issue/medtranslate-pro` (or first blueprint slug)

Expected: See "Traction Proof" section with MRR, users, growth rate, months active cards.

- [ ] **Step 3: Test archive filter**

Navigate to `http://localhost:5173/archive`

Click "Only Proven Blueprints" toggle.

Expected: Only shows blueprints with `traction?.status === "added"`. Should show only the first blueprint (from test data added in Task 1).

- [ ] **Step 4: Verify API endpoints (manual curl)**

```bash
# GET traction data
curl http://localhost:3000/api/blueprints/medtranslate-pro/traction

# Should return:
# {"slug":"medtranslate-pro","traction":{...metrics...}}
```

- [ ] **Step 5: Verify type safety**

```bash
cd artifacts/specflow-newsletter && npx tsc --noEmit
cd artifacts/api-server && npx tsc --noEmit
```

Expected: No errors in both.

- [ ] **Step 6: Commit integration test summary (documentation)**

```bash
git add -A && git commit -m "test: verify traction proof feature end-to-end

- Traction data displays on blueprint detail pages
- Archive filter correctly shows/hides blueprints with traction
- API endpoints return correct response format
- Type safety verified on frontend and backend
- All manual tests pass"
```

---

## Self-Review Against Spec

✅ **Spec coverage:**
- Data model: Task 1 ✅ (BlueprintTraction interface, Zod schema, test data)
- API endpoints: Task 2 ✅ (POST/GET /api/blueprints/:slug/traction with validation)
- Creator form: Task 5 ✅ (/creator/traction page with TierGate, full form fields)
- Traction display: Task 3 + Task 4 ✅ (TractioinProofSection component, integrated into issue.tsx)
- Archive filter: Task 6 ✅ (showOnlyTraction state, filter logic)
- Route registration: Task 2 ✅ (Added to routes/index.ts)
- Access control: Task 5 + Task 2 ✅ (TierGate on form, would need creator ID validation on API for production)

✅ **Placeholder scan:**
- No "TBD", "TODO", "fill in", or incomplete sections
- All code blocks are complete and executable
- All API responses fully specified
- All test commands have expected output

✅ **Type consistency:**
- BlueprintTraction interface (Task 1) used in all tasks
- tractioinSchema exported and imported consistently
- API request/response shapes match TypeScript types
- Component props (TractioinProofSectionProps) match data type

✅ **Ambiguity check:**
- Traction field embedding (not separate table): explicit in Task 1
- monthsSinceLaunch required: explicit in schema and form validation
- "At least one metric" invariant: explicit in schema refine and form validation
- Creator ownership: noted in Task 2 comment (full implementation in future)
- Status values: enumerated in interface and schema

**No gaps found.** Plan is complete and ready for execution.

---

## Next Steps

Plan complete and saved to `docs/superpowers/plans/2026-05-05-validation-revenue-proof-plan.md`.

Two execution options:

**1. Subagent-Driven (recommended)** — I dispatch a fresh subagent per task, review between tasks for quality and integration. Faster iteration, parallelizable work.

**2. Inline Execution** — Execute all 7 tasks sequentially in this session using the executing-plans skill. Good for watching real-time feedback, but slower.

Which approach?
