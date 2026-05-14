# Content Depth Phase (8 Sections) Implementation Plan

> **For agentic workers:** Use superpowers:subagent-driven-development or superpowers:executing-plans to implement task-by-task. Steps use checkbox syntax for tracking.

**Goal:** Expand blueprint data model to include 8 advanced sections (architecture, competitor kill-switch, unit economics, compliance, hiring, global arbitrage, PLG loops, exit strategy) and render them on the issue page.

**Architecture:** Extend `data.ts` with 8 new typed fields, create 8 reusable section components, update `issue.tsx` layout to render them in sequence with existing content moved to a collapsible sidebar.

**Tech Stack:** TypeScript, React, Recharts (existing), Mermaid.js (new), Zod for schema validation, Tailwind CSS

---

## File Structure

**Modified:**
- `lib/data.ts` — extend blueprint type with 8 new fields, update 2 blueprints with complete data

**New Components:**
- `components/blueprints/ArchitectureDiagram.tsx` — Mermaid diagram renderer
- `components/blueprints/UnitEconomicsCalculator.tsx` — interactive sliders + live calculations
- `components/blueprints/ComplianceTimeline.tsx` — compliance milestone timeline
- `components/blueprints/HiringRoadmap.tsx` — job role cards with descriptions
- `components/blueprints/GlobalArbitrageMap.tsx` — region-based opportunity cards
- `components/blueprints/PLGSequence.tsx` — product-led growth loop narratives
- `components/blueprints/ExitDashboard.tsx` — acquirer list + key metrics

**Modified:**
- `pages/issue.tsx` — new 8-section layout, sidebar for existing context

---

### Task 1: Extend Data Schema with Zod Validation

**Files:**
- Modify: `lib/data.ts`

**Goal:** Add TypeScript types for 8 new blueprint sections + update 2 template blueprints with full data.

- [ ] **Step 1: Define Zod schemas for the 8 sections**

Add to `lib/data.ts` before the issue data:

```typescript
import { z } from "zod";

const ArchitectureSchema = z.object({
  mermaidCode: z.string(), // Mermaid diagram code
  description: z.string(),
});

const CompetitorKillSwitchSchema = z.object({
  competitors: z.array(z.object({
    name: z.string(),
    weakness: z.string(),
    howWeBeat: z.string(),
  })),
});

const UnitEconomicsSchema = z.object({
  unitPrice: z.number(),
  cogs: z.number(), // cost of goods sold
  grossMarginPercent: z.number(),
  cac: z.number(), // customer acquisition cost
  ltv: z.number(), // lifetime value
  paybackMonths: z.number(),
  assumptions: z.string().optional(),
});

const ComplianceRoadmapSchema = z.object({
  items: z.array(z.object({
    requirement: z.string(), // e.g., "SOC2 Type II"
    timeline: z.string(), // e.g., "Month 6-9"
    effort: z.enum(["Low", "Medium", "High"]),
    whyMatters: z.string(),
  })),
});

const HiringRoadmapSchema = z.object({
  roles: z.array(z.object({
    role: z.string(), // e.g., "Lead Engineer"
    responsibilities: z.array(z.string()),
    salary: z.string(), // e.g., "$120k-150k"
    whyFirst: z.string(),
    jobDescription: z.string(), // AI-generated or manual
  })).min(3).max(3), // exactly 3 roles
});

const GlobalArbitrageSchema = z.object({
  regions: z.array(z.object({
    region: z.string(),
    unmetDemandScore: z.number().min(1).max(10),
    regulatoryEase: z.number().min(1).max(10),
    entryStrategy: z.string(),
  })),
});

const PLGLoopsSchema = z.object({
  loops: z.array(z.object({
    loop: z.string(), // e.g., "Freemium → Trial → Paid"
    trigger: z.string(),
    aha: z.string(),
    viral: z.string(), // viral coefficient / mechanism
  })),
});

const ExitStrategySchema = z.object({
  acquirers: z.array(z.string()), // company names
  metricsNeeded: z.array(z.string()), // e.g., "$10M ARR", "10M users"
  timeline: z.string(), // e.g., "Year 3-5"
  valuationTarget: z.string(), // e.g., "$500M-$1B"
});

export const BlueprintSchema = z.object({
  number: z.string(),
  slug: z.string(),
  title: z.string(),
  category: z.string(),
  tam: z.string(),
  revenueIn: z.string(),
  tagline: z.string(),
  problem: z.string(),
  whyNow: z.array(z.string()),
  blueprint: z.array(z.string()),
  prompts: z.array(z.string()),
  // ... existing fields ...
  
  // 8 NEW SECTIONS
  architecture: ArchitectureSchema.optional(),
  competitorKillSwitch: CompetitorKillSwitchSchema.optional(),
  unitEconomics: UnitEconomicsSchema.optional(),
  complianceRoadmap: ComplianceRoadmapSchema.optional(),
  hiringRoadmap: HiringRoadmapSchema.optional(),
  globalArbitrage: GlobalArbitrageSchema.optional(),
  plgLoops: PLGLoopsSchema.optional(),
  exitStrategy: ExitStrategySchema.optional(),
});

export type Blueprint = z.infer<typeof BlueprintSchema>;
```

- [ ] **Step 2: Update MedTranslate Pro blueprint with all 8 sections**

See plan for full data structure.

- [ ] **Step 3: Update AgroYield AI blueprint with all 8 sections**

See plan for full data structure.

- [ ] **Step 4: Validate schemas against updated data**

Run TypeScript check:
```bash
pnpm run typecheck
```

- [ ] **Step 5: Commit**

```bash
git add lib/data.ts
git commit -m "feat: extend blueprint schema with 8 sections"
```

---

### Task 2: Create ArchitectureDiagram Component

**Files:**
- Create: `components/blueprints/ArchitectureDiagram.tsx`

- [ ] **Step 1: Install Mermaid**

```bash
pnpm add mermaid
```

- [ ] **Step 2: Create component**

```typescript
import { useEffect, useRef } from "react";
import mermaid from "mermaid";

export interface ArchitectureDiagramProps {
  mermaidCode: string;
  description: string;
}

export default function ArchitectureDiagram({ mermaidCode, description }: ArchitectureDiagramProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      mermaid.initialize({ startOnLoad: true, theme: "default" });
      mermaid.contentLoaderCb = undefined;
      mermaid.run();
    }
  }, [mermaidCode]);

  return (
    <section className="py-12 border-b border-border">
      <h2 className="text-2xl font-serif mb-4">Technical Architecture</h2>
      <p className="text-muted-foreground mb-8">{description}</p>
      <div 
        ref={containerRef} 
        className="bg-slate-50 p-8 rounded-lg overflow-x-auto border border-border"
      >
        <div className="mermaid">{mermaidCode}</div>
      </div>
    </section>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add components/blueprints/ArchitectureDiagram.tsx
git commit -m "feat: create ArchitectureDiagram component"
```

---

### Task 3: Create UnitEconomicsCalculator Component

**Files:**
- Create: `components/blueprints/UnitEconomicsCalculator.tsx`

- [ ] **Step 1: Create component with interactive sliders**

```typescript
import { useState } from "react";
import { Card } from "@/components/ui/card";

export interface UnitEconomicsData {
  unitPrice: number;
  cogs: number;
  grossMarginPercent: number;
  cac: number;
  ltv: number;
  paybackMonths: number;
  assumptions?: string;
}

export default function UnitEconomicsCalculator({ data }: { data: UnitEconomicsData }) {
  const [price, setPrice] = useState(data.unitPrice);
  const [cogs, setCogs] = useState(data.cogs);
  const [cac, setCac] = useState(data.cac);

  const grossMargin = ((price - cogs) / price) * 100;
  const paybackMonths = cac > 0 ? Math.ceil(cac / ((price - cogs) * 5)) : 0;

  return (
    <section className="py-12 border-b border-border">
      <h2 className="text-2xl font-serif mb-4">Unit Economics</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">
              Unit Price: ${price.toFixed(0)}
            </label>
            <input
              type="range"
              min="10"
              max="1000"
              value={price}
              onChange={(e) => setPrice(Number(e.target.value))}
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              COGS: ${cogs.toFixed(0)}
            </label>
            <input
              type="range"
              min="0"
              max={price * 0.8}
              value={cogs}
              onChange={(e) => setCogs(Number(e.target.value))}
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              CAC: ${cac.toFixed(0)}
            </label>
            <input
              type="range"
              min="0"
              max="10000"
              step="100"
              value={cac}
              onChange={(e) => setCac(Number(e.target.value))}
              className="w-full"
            />
          </div>
        </div>

        <div className="space-y-4">
          <Card className="p-4">
            <p className="text-sm text-muted-foreground">Gross Margin</p>
            <p className="text-3xl font-bold">{grossMargin.toFixed(1)}%</p>
          </Card>

          <Card className="p-4">
            <p className="text-sm text-muted-foreground">Payback Period</p>
            <p className="text-3xl font-bold">{paybackMonths} months</p>
          </Card>

          <Card className="p-4">
            <p className="text-sm text-muted-foreground">LTV (12-month)</p>
            <p className="text-3xl font-bold">${(price * 12).toFixed(0)}</p>
          </Card>

          <Card className="p-4">
            <p className="text-sm text-muted-foreground">LTV:CAC Ratio</p>
            <p className="text-3xl font-bold">{((price * 12) / (cac || 1)).toFixed(1)}:1</p>
          </Card>
        </div>
      </div>

      {data.assumptions && (
        <div className="mt-6 p-4 bg-muted rounded-lg">
          <p className="text-sm text-muted-foreground"><strong>Assumptions:</strong> {data.assumptions}</p>
        </div>
      )}
    </section>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/blueprints/UnitEconomicsCalculator.tsx
git commit -m "feat: create UnitEconomicsCalculator with sliders"
```

---

### Task 4: Create 5 Remaining Components

Create ComplianceTimeline, HiringRoadmap, GlobalArbitrageMap, PLGSequence, ExitDashboard (see plan for full code).

- [ ] **Step 1-5: Implement all 5 components**

(Each component implementation following pattern from Tasks 2-3)

- [ ] **Step 6: Commit all 5**

```bash
git add components/blueprints/
git commit -m "feat: create 5 blueprint section components"
```

---

### Task 5: Integrate All 8 Sections into issue.tsx

**Files:**
- Modify: `pages/issue.tsx`

- [ ] **Step 1: Import all components**

- [ ] **Step 2: Add 8 sections to page layout**

- [ ] **Step 3: Test page renders**

- [ ] **Step 4: Commit**

```bash
git add pages/issue.tsx
git commit -m "feat: integrate all 8 sections into issue page"
```

---

**Status:** Ready for subagent-driven execution
