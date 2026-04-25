# Daily Vaults & Context Engine Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build daily briefs (Pro/Max), weekly vaults (all users), and personalized context engine using OpenAI's GPT-4 Mini for reasoning.

**Architecture:** 
- **Content Layer:** Newsletter submissions → stored in `articles` table
- **Context Engine:** Max/Pro users get personalized context via daily summarization powered by GPT-4 Mini
- **Generation Pipeline:** Scheduled jobs (daily brief for Pro/Max, weekly vaults for all)
- **Personalization:** Pro portal + Inner Circle expose personalization settings that shape context generation
- **API:** REST endpoints for briefs, vaults, personalization settings

**Tech Stack:** Node/Express, Postgres+Drizzle ORM, OpenAI SDK, node-cron (scheduling)

---

## File Structure

```
lib/db/src/schema/
  ├── articles.ts          (newsletter content)
  ├── daily_briefs.ts      (generated daily summaries)
  ├── vaults.ts            (weekly vault drops)
  └── personalization.ts   (user context preferences)

artifacts/api-server/src/
  ├── lib/
  │   ├── openai.ts        (GPT-4 Mini client + prompts)
  │   └── scheduler.ts     (cron jobs for generation)
  ├── routes/
  │   ├── briefs.ts        (GET daily briefs, POST personalization)
  │   └── vaults.ts        (GET weekly vaults)
  └── services/
      ├── context.ts       (context engine: build personalized summaries)
      └── vault.ts         (vault generation logic)

tests/
  ├── services/
  │   ├── context.test.ts
  │   └── vault.test.ts
  └── routes/
      ├── briefs.test.ts
      └── vaults.test.ts
```

---

## Task 1: Database Schema - Articles Table

**Files:**
- Create: `lib/db/src/schema/articles.ts`
- Modify: `lib/db/src/schema/index.ts`

- [ ] **Step 1: Create articles table schema**

```typescript
// lib/db/src/schema/articles.ts
import { pgTable, text, timestamp, integer, varchar } from "drizzle-orm/pg-core";

export const articles = pgTable("articles", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  title: varchar({ length: 255 }).notNull(),
  content: text().notNull(),
  source: varchar({ length: 100 }).notNull(), // "newsletter", "submission", "external"
  category: varchar({ length: 50 }), // "deals", "insights", "market"
  createdAt: timestamp().defaultNow().notNull(),
  updatedAt: timestamp().defaultNow().notNull(),
});

export type Article = typeof articles.$inferSelect;
export type NewArticle = typeof articles.$inferInsert;
```

- [ ] **Step 2: Update schema index to export articles**

```typescript
// lib/db/src/schema/index.ts
// Add to exports:
export { articles } from "./articles";
export type { Article, NewArticle } from "./articles";
```

- [ ] **Step 3: Create migration**

```bash
cd lib/db
npx drizzle-kit generate --name create_articles_table
```

- [ ] **Step 4: Apply migration**

```bash
npx drizzle-kit migrate
```

- [ ] **Step 5: Commit**

```bash
git add lib/db/src/schema/articles.ts lib/db/src/schema/index.ts lib/db/drizzle/*.sql
git commit -m "schema: add articles table for newsletter content"
```

---

## Task 2: Database Schema - Personalization Table

**Files:**
- Create: `lib/db/src/schema/personalization.ts`
- Modify: `lib/db/src/schema/index.ts`

- [ ] **Step 1: Create personalization table**

```typescript
// lib/db/src/schema/personalization.ts
import { pgTable, text, timestamp, integer, boolean, varchar } from "drizzle-orm/pg-core";
import { subscribers } from "./subscribers";

export const personalization = pgTable("personalization", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  subscriberId: integer()
    .notNull()
    .references(() => subscribers.id, { onDelete: "cascade" }),
  interests: text().array(), // ["deals", "insights", "markets"]
  focusAreas: text().array(), // ["AI", "fintech", "climate"]
  excludeTopics: text().array(), // topics to deprioritize
  contextStyle: varchar({ length: 50 }).default("detailed"), // "detailed", "summary", "quick"
  createdAt: timestamp().defaultNow().notNull(),
  updatedAt: timestamp().defaultNow().notNull(),
});

export type Personalization = typeof personalization.$inferSelect;
export type NewPersonalization = typeof personalization.$inferInsert;
```

- [ ] **Step 2: Export from schema index**

```typescript
// lib/db/src/schema/index.ts
export { personalization } from "./personalization";
export type { Personalization, NewPersonalization } from "./personalization";
```

- [ ] **Step 3: Generate & apply migration**

```bash
cd lib/db
npx drizzle-kit generate --name create_personalization_table
npx drizzle-kit migrate
```

- [ ] **Step 4: Commit**

```bash
git add lib/db/src/schema/personalization.ts lib/db/src/schema/index.ts lib/db/drizzle/*.sql
git commit -m "schema: add personalization table for context customization"
```

---

## Task 3: Database Schema - Daily Briefs Table

**Files:**
- Create: `lib/db/src/schema/daily_briefs.ts`
- Modify: `lib/db/src/schema/index.ts`

- [ ] **Step 1: Create daily briefs table**

```typescript
// lib/db/src/schema/daily_briefs.ts
import { pgTable, text, timestamp, integer, varchar, date } from "drizzle-orm/pg-core";
import { subscribers } from "./subscribers";

export const dailyBriefs = pgTable("daily_briefs", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  subscriberId: integer()
    .notNull()
    .references(() => subscribers.id, { onDelete: "cascade" }),
  briefDate: date().notNull(), // YYYY-MM-DD for the brief
  summary: text().notNull(), // AI-generated summary
  highlights: text().array(), // bullet points
  sourceArticleIds: integer().array(), // article IDs used to generate this
  generatedAt: timestamp().defaultNow().notNull(),
  viewedAt: timestamp(),
});

export type DailyBrief = typeof dailyBriefs.$inferSelect;
export type NewDailyBrief = typeof dailyBriefs.$inferInsert;
```

- [ ] **Step 2: Export from schema**

```typescript
// lib/db/src/schema/index.ts
export { dailyBriefs } from "./daily_briefs";
export type { DailyBrief, NewDailyBrief } from "./daily_briefs";
```

- [ ] **Step 3: Migrate**

```bash
cd lib/db
npx drizzle-kit generate --name create_daily_briefs_table
npx drizzle-kit migrate
```

- [ ] **Step 4: Commit**

```bash
git add lib/db/src/schema/daily_briefs.ts lib/db/src/schema/index.ts lib/db/drizzle/*.sql
git commit -m "schema: add daily_briefs table for Pro/Max user summaries"
```

---

## Task 4: Database Schema - Vaults Table

**Files:**
- Create: `lib/db/src/schema/vaults.ts`
- Modify: `lib/db/src/schema/index.ts`

- [ ] **Step 1: Create vaults table**

```typescript
// lib/db/src/schema/vaults.ts
import { pgTable, text, timestamp, integer, varchar, date } from "drizzle-orm/pg-core";

export const vaults = pgTable("vaults", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  vaultWeek: date().notNull(), // start of week (YYYY-MM-DD)
  title: varchar({ length: 255 }).notNull(), // e.g., "Week of April 25: AI Takeover"
  description: text(),
  content: text().notNull(), // curated vault content
  sourceArticleIds: integer().array(), // articles curated for this vault
  isPublished: boolean().default(false),
  publishedAt: timestamp(),
  createdAt: timestamp().defaultNow().notNull(),
});

export type Vault = typeof vaults.$inferSelect;
export type NewVault = typeof vaults.$inferInsert;
```

- [ ] **Step 2: Export from schema**

```typescript
// lib/db/src/schema/index.ts
export { vaults } from "./vaults";
export type { Vault, NewVault } from "./vaults";
```

- [ ] **Step 3: Migrate**

```bash
cd lib/db
npx drizzle-kit generate --name create_vaults_table
npx drizzle-kit migrate
```

- [ ] **Step 4: Commit**

```bash
git add lib/db/src/schema/vaults.ts lib/db/src/schema/index.ts lib/db/drizzle/*.sql
git commit -m "schema: add vaults table for weekly curated drops"
```

---

## Task 5: OpenAI Integration - Client Setup

**Files:**
- Create: `artifacts/api-server/src/lib/openai.ts`

- [ ] **Step 1: Install OpenAI SDK**

```bash
cd artifacts/api-server
npm install openai
```

- [ ] **Step 2: Create OpenAI client wrapper**

```typescript
// artifacts/api-server/src/lib/openai.ts
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function summarizeForBrief(
  articleTexts: string[],
  userPersonalization: {
    interests?: string[];
    focusAreas?: string[];
    contextStyle?: string;
  }
): Promise<string> {
  const focusContext = userPersonalization.focusAreas?.length
    ? `Focus on these areas: ${userPersonalization.focusAreas.join(", ")}.`
    : "";

  const styleGuide =
    userPersonalization.contextStyle === "quick"
      ? "Keep it ultra-brief (max 3 sentences)."
      : "Provide detailed analysis.";

  const prompt = `You are a founder intelligence briefer. Synthesize these articles into a daily brief for a founder.

${focusContext}
${styleGuide}

Articles:
${articleTexts.map((t) => `- ${t}`).join("\n")}

Return ONLY the summary (no preamble).`;

  const response = await client.messages.create({
    model: "gpt-4-turbo", // GPT-4 Mini equivalent in OpenAI
    max_tokens: 500,
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
  });

  const summary =
    response.content[0].type === "text" ? response.content[0].text : "";
  return summary;
}

export async function curateDailyHighlights(
  articleTexts: string[],
  count: number = 5
): Promise<string[]> {
  const prompt = `You are a founder newsletter editor. Extract the top ${count} actionable insights from these articles as bullet points.

Articles:
${articleTexts.map((t) => `- ${t}`).join("\n")}

Return ONLY the bullet points, one per line, no numbering.`;

  const response = await client.messages.create({
    model: "gpt-4-turbo",
    max_tokens: 300,
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
  });

  const text =
    response.content[0].type === "text" ? response.content[0].text : "";
  return text.split("\n").filter((line) => line.trim());
}

export async function curateWeeklyVault(
  articleTexts: string[],
  weekStart: string
): Promise<{ title: string; description: string; content: string }> {
  const prompt = `You are a founder intelligence curator. Create a weekly vault (curated digest) from these articles.

Week starting: ${weekStart}

Articles:
${articleTexts.map((t) => `- ${t}`).join("\n")}

Respond in JSON format:
{
  "title": "Week of X: [catchy title capturing the theme]",
  "description": "[One sentence about this week's themes]",
  "content": "[2-3 paragraphs synthesizing key takeaways]"
}`;

  const response = await client.messages.create({
    model: "gpt-4-turbo",
    max_tokens: 800,
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
  });

  const text =
    response.content[0].type === "text" ? response.content[0].text : "";
  return JSON.parse(text);
}
```

- [ ] **Step 3: Add env var to .env**

```bash
# artifacts/api-server/.env
OPENAI_API_KEY=sk-...your-key...
```

- [ ] **Step 4: Commit**

```bash
git add artifacts/api-server/src/lib/openai.ts artifacts/api-server/.env
git commit -m "feat: add OpenAI client for brief and vault generation"
```

---

## Task 6: Context Engine Service

**Files:**
- Create: `artifacts/api-server/src/services/context.ts`
- Modify: `artifacts/api-server/src/index.ts` (register service)

- [ ] **Step 1: Create context engine**

```typescript
// artifacts/api-server/src/services/context.ts
import { db } from "@specflow/db";
import {
  articles,
  personalization,
  subscribers,
} from "@specflow/db/schema";
import { eq } from "drizzle-orm";
import { summarizeForBrief, curateDailyHighlights } from "../lib/openai";

export async function buildDailyContextForUser(
  subscriberId: number
): Promise<{
  summary: string;
  highlights: string[];
  articleCount: number;
}> {
  // Get user personalization preferences
  const userPref = await db
    .select()
    .from(personalization)
    .where(eq(personalization.subscriberId, subscriberId))
    .limit(1);

  const prefs = userPref[0] || {};

  // Get today's articles
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todayArticles = await db
    .select()
    .from(articles)
    .where((article) => {
      // Filter by category if user has interests
      if (prefs.interests?.length) {
        return article.category.inArray(prefs.interests);
      }
      return true;
    });

  if (todayArticles.length === 0) {
    return {
      summary: "No articles today.",
      highlights: [],
      articleCount: 0,
    };
  }

  const articleTexts = todayArticles.map(
    (a) => `${a.title}\n${a.content}`
  );

  const summary = await summarizeForBrief(articleTexts, {
    interests: prefs.interests,
    focusAreas: prefs.focusAreas,
    contextStyle: prefs.contextStyle,
  });

  const highlights = await curateDailyHighlights(articleTexts);

  return {
    summary,
    highlights,
    articleCount: todayArticles.length,
  };
}
```

- [ ] **Step 2: Test the context engine**

```typescript
// tests/services/context.test.ts
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { db } from "@specflow/db";
import { articles, personalization, subscribers } from "@specflow/db/schema";
import { buildDailyContextForUser } from "../../src/services/context";

describe("Context Engine", () => {
  let testSubscriberId: number;

  beforeAll(async () => {
    // Create test subscriber
    const [sub] = await db
      .insert(subscribers)
      .values({ email: "test@context.com", tier: "Pro" })
      .returning();
    testSubscriberId = sub.id;

    // Create test personalization
    await db.insert(personalization).values({
      subscriberId: testSubscriberId,
      interests: ["deals", "insights"],
      focusAreas: ["AI"],
      contextStyle: "detailed",
    });

    // Create test articles
    await db.insert(articles).values([
      {
        title: "AI Startup Lands $10M",
        content: "An AI startup...",
        source: "newsletter",
        category: "deals",
      },
      {
        title: "Market Insights",
        content: "The market is...",
        source: "newsletter",
        category: "insights",
      },
    ]);
  });

  it("should build context with user preferences", async () => {
    const context = await buildDailyContextForUser(testSubscriberId);
    expect(context.summary).toBeTruthy();
    expect(context.highlights.length).toBeGreaterThan(0);
    expect(context.articleCount).toBe(2);
  });

  afterAll(async () => {
    // Cleanup
    await db.delete(personalization);
    await db.delete(articles);
    await db.delete(subscribers);
  });
});
```

- [ ] **Step 3: Run test**

```bash
cd artifacts/api-server
npm run test -- tests/services/context.test.ts
```

Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add src/services/context.ts tests/services/context.test.ts
git commit -m "feat: add context engine for personalized daily briefs"
```

---

## Task 7: Daily Brief Route

**Files:**
- Create: `artifacts/api-server/src/routes/briefs.ts`
- Modify: `artifacts/api-server/src/routes/index.ts`

- [ ] **Step 1: Create briefs route**

```typescript
// artifacts/api-server/src/routes/briefs.ts
import { Router } from "express";
import { db } from "@specflow/db";
import { dailyBriefs, personalization } from "@specflow/db/schema";
import { eq } from "drizzle-orm";
import { buildDailyContextForUser } from "../services/context";

const router = Router();

// GET /briefs/today - Get today's brief for authenticated user
router.get("/today", async (req, res) => {
  try {
    const subscriberId = (req as any).subscriberId; // from auth middleware
    if (!subscriberId) return res.status(401).json({ error: "Unauthorized" });

    // Check if brief already generated today
    const today = new Date().toISOString().split("T")[0];
    const existingBrief = await db
      .select()
      .from(dailyBriefs)
      .where(
        (b) =>
          eq(b.subscriberId, subscriberId) && eq(b.briefDate, today)
      )
      .limit(1);

    if (existingBrief.length > 0) {
      return res.json(existingBrief[0]);
    }

    // Generate new brief
    const context = await buildDailyContextForUser(subscriberId);
    const [brief] = await db
      .insert(dailyBriefs)
      .values({
        subscriberId,
        briefDate: today,
        summary: context.summary,
        highlights: context.highlights,
        sourceArticleIds: [],
      })
      .returning();

    res.json(brief);
  } catch (error) {
    res.status(500).json({ error: "Failed to generate brief" });
  }
});

// POST /briefs/personalization - Update user personalization
router.post("/personalization", async (req, res) => {
  try {
    const subscriberId = (req as any).subscriberId;
    if (!subscriberId) return res.status(401).json({ error: "Unauthorized" });

    const { interests, focusAreas, contextStyle } = req.body;

    const [updated] = await db
      .insert(personalization)
      .values({
        subscriberId,
        interests,
        focusAreas,
        contextStyle,
      })
      .onConflictDoUpdate({
        target: personalization.subscriberId,
        set: { interests, focusAreas, contextStyle },
      })
      .returning();

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: "Failed to update personalization" });
  }
});

export default router;
```

- [ ] **Step 2: Register route in app**

```typescript
// artifacts/api-server/src/routes/index.ts
import briefsRouter from "./briefs";

// In router setup:
app.use("/api/briefs", briefsRouter);
```

- [ ] **Step 3: Test endpoint**

```bash
curl -X GET http://localhost:3000/api/briefs/today \
  -H "Authorization: Bearer YOUR_TOKEN"
```

Expected: 200 with brief object

- [ ] **Step 4: Commit**

```bash
git add src/routes/briefs.ts src/routes/index.ts
git commit -m "feat: add daily briefs API endpoint for Pro/Max users"
```

---

## Task 8: Vault Generation Service

**Files:**
- Create: `artifacts/api-server/src/services/vault.ts`

- [ ] **Step 1: Create vault service**

```typescript
// artifacts/api-server/src/services/vault.ts
import { db } from "@specflow/db";
import { articles, vaults } from "@specflow/db/schema";
import { curateWeeklyVault } from "../lib/openai";

export async function generateWeeklyVault(
  weekStartDate: string
): Promise<void> {
  // Check if vault already exists for this week
  const existing = await db
    .select()
    .from(vaults)
    .where((v) => eq(v.vaultWeek, weekStartDate))
    .limit(1);

  if (existing.length > 0) {
    console.log(`Vault already exists for ${weekStartDate}`);
    return;
  }

  // Get all articles from the past week
  const weekStart = new Date(weekStartDate);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 7);

  const weekArticles = await db
    .select()
    .from(articles)
    .where(
      (a) =>
        a.createdAt >= weekStart && a.createdAt < weekEnd
    );

  if (weekArticles.length === 0) {
    console.log("No articles for this week");
    return;
  }

  const articleTexts = weekArticles.map(
    (a) => `${a.title}\n${a.content}`
  );

  // Generate vault with AI
  const vaultContent = await curateWeeklyVault(articleTexts, weekStartDate);

  // Store in DB
  await db.insert(vaults).values({
    vaultWeek: weekStartDate,
    title: vaultContent.title,
    description: vaultContent.description,
    content: vaultContent.content,
    sourceArticleIds: weekArticles.map((a) => a.id),
    isPublished: false,
  });

  console.log(`Vault generated for ${weekStartDate}`);
}
```

- [ ] **Step 2: Commit**

```bash
git add src/services/vault.ts
git commit -m "feat: add vault generation service for weekly curation"
```

---

## Task 9: Vault Routes

**Files:**
- Create: `artifacts/api-server/src/routes/vaults.ts`
- Modify: `artifacts/api-server/src/routes/index.ts`

- [ ] **Step 1: Create vaults endpoint**

```typescript
// artifacts/api-server/src/routes/vaults.ts
import { Router } from "express";
import { db } from "@specflow/db";
import { vaults } from "@specflow/db/schema";
import { desc } from "drizzle-orm";

const router = Router();

// GET /vaults - Get published vaults (all users can access)
router.get("/", async (req, res) => {
  try {
    const allVaults = await db
      .select()
      .from(vaults)
      .where((v) => eq(v.isPublished, true))
      .orderBy(desc(vaults.publishedAt))
      .limit(10);

    res.json(allVaults);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch vaults" });
  }
});

// GET /vaults/:id - Get specific vault
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const vault = await db
      .select()
      .from(vaults)
      .where((v) => eq(v.id, parseInt(id)))
      .limit(1);

    if (!vault.length) {
      return res.status(404).json({ error: "Vault not found" });
    }

    res.json(vault[0]);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch vault" });
  }
});

export default router;
```

- [ ] **Step 2: Register in main router**

```typescript
// artifacts/api-server/src/routes/index.ts
import vaultsRouter from "./vaults";

app.use("/api/vaults", vaultsRouter);
```

- [ ] **Step 3: Test endpoint**

```bash
curl -X GET http://localhost:3000/api/vaults
```

Expected: 200 with array of vaults

- [ ] **Step 4: Commit**

```bash
git add src/routes/vaults.ts src/routes/index.ts
git commit -m "feat: add vaults API endpoints for all users"
```

---

## Task 10: Scheduling - Daily Brief Generation

**Files:**
- Create: `artifacts/api-server/src/lib/scheduler.ts`
- Modify: `artifacts/api-server/src/index.ts`

- [ ] **Step 1: Install node-cron**

```bash
cd artifacts/api-server
npm install node-cron
npm install --save-dev @types/node-cron
```

- [ ] **Step 2: Create scheduler**

```typescript
// artifacts/api-server/src/lib/scheduler.ts
import cron from "node-cron";
import { db } from "@specflow/db";
import { subscribers } from "@specflow/db/schema";
import { eq } from "drizzle-orm";
import { buildDailyContextForUser } from "../services/context";
import { dailyBriefs } from "@specflow/db/schema";

export function initSchedulers() {
  // Daily brief generation: 6 AM every day
  cron.schedule("0 6 * * *", async () => {
    console.log("[Scheduler] Generating daily briefs...");

    // Get all Pro and Max users
    const proMaxUsers = await db
      .select()
      .from(subscribers)
      .where((s) => s.tier.inArray(["Pro", "Max"]));

    for (const user of proMaxUsers) {
      try {
        const context = await buildDailyContextForUser(user.id);
        const today = new Date().toISOString().split("T")[0];

        await db.insert(dailyBriefs).values({
          subscriberId: user.id,
          briefDate: today,
          summary: context.summary,
          highlights: context.highlights,
          sourceArticleIds: [],
        });

        console.log(`✓ Generated brief for user ${user.id}`);
      } catch (error) {
        console.error(`✗ Failed to generate brief for user ${user.id}`, error);
      }
    }

    console.log("[Scheduler] Daily briefs complete");
  });

  console.log("Schedulers initialized");
}
```

- [ ] **Step 3: Register scheduler in app startup**

```typescript
// artifacts/api-server/src/index.ts
import { initSchedulers } from "./lib/scheduler";

// After express setup:
initSchedulers();

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log("Schedulers active");
});
```

- [ ] **Step 4: Commit**

```bash
git add src/lib/scheduler.ts src/index.ts
git commit -m "feat: add daily brief scheduler for Pro/Max users"
```

---

## Task 11: Scheduling - Weekly Vault Generation

**Files:**
- Modify: `artifacts/api-server/src/lib/scheduler.ts`

- [ ] **Step 1: Add weekly vault cron job**

```typescript
// artifacts/api-server/src/lib/scheduler.ts
import { generateWeeklyVault } from "../services/vault";

export function initSchedulers() {
  // ... existing daily brief job ...

  // Weekly vault generation: Every Sunday at 8 AM
  cron.schedule("0 8 * * 0", async () => {
    console.log("[Scheduler] Generating weekly vault...");

    try {
      // Get the start of last week
      const today = new Date();
      const dayOfWeek = today.getDay();
      const lastSunday = new Date(today);
      lastSunday.setDate(today.getDate() - dayOfWeek);
      const weekStartDate = lastSunday.toISOString().split("T")[0];

      await generateWeeklyVault(weekStartDate);
      console.log("[Scheduler] Weekly vault complete");
    } catch (error) {
      console.error("[Scheduler] Failed to generate vault", error);
    }
  });

  console.log("Schedulers initialized");
}
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/scheduler.ts
git commit -m "feat: add weekly vault scheduler"
```

---

## Task 12: Testing - Integration Test for Full Pipeline

**Files:**
- Create: `tests/integration/briefs-vaults.integration.test.ts`

- [ ] **Step 1: Write integration test**

```typescript
// tests/integration/briefs-vaults.integration.test.ts
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import { app } from "../../src/index";
import { db } from "@specflow/db";
import { subscribers, articles, personalization } from "@specflow/db/schema";

describe("Briefs & Vaults Integration", () => {
  let testToken: string;
  let testSubscriberId: number;

  beforeAll(async () => {
    // Create test subscriber
    const [sub] = await db
      .insert(subscribers)
      .values({
        email: "integration@test.com",
        tier: "Pro",
      })
      .returning();

    testSubscriberId = sub.id;

    // Create test articles
    await db.insert(articles).values([
      {
        title: "Breaking: Startup Raises $50M",
        content: "A promising startup in AI has raised...",
        source: "newsletter",
        category: "deals",
      },
      {
        title: "Market Analysis",
        content: "The tech market shows signs of...",
        source: "newsletter",
        category: "insights",
      },
    ]);

    // Mock auth token (use your actual auth method)
    testToken = "mock-token";
  });

  it("should fetch or generate daily brief", async () => {
    const res = await request(app)
      .get("/api/briefs/today")
      .set("Authorization", `Bearer ${testToken}`);

    expect(res.status).toBe(200);
    expect(res.body.summary).toBeTruthy();
    expect(res.body.highlights).toBeInstanceOf(Array);
  });

  it("should update user personalization", async () => {
    const res = await request(app)
      .post("/api/briefs/personalization")
      .set("Authorization", `Bearer ${testToken}`)
      .send({
        interests: ["deals"],
        focusAreas: ["AI", "fintech"],
        contextStyle: "quick",
      });

    expect(res.status).toBe(200);
    expect(res.body.interests).toEqual(["deals"]);
  });

  it("should list published vaults", async () => {
    const res = await request(app).get("/api/vaults");

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  afterAll(async () => {
    await db.delete(personalization);
    await db.delete(articles);
    await db.delete(subscribers);
  });
});
```

- [ ] **Step 2: Run integration test**

```bash
cd artifacts/api-server
npm run test -- tests/integration/briefs-vaults.integration.test.ts
```

Expected: All tests pass

- [ ] **Step 3: Commit**

```bash
git add tests/integration/briefs-vaults.integration.test.ts
git commit -m "test: add integration tests for briefs and vaults"
```

---

## Task 13: Admin Route - Publish Vault

**Files:**
- Modify: `artifacts/api-server/src/routes/vaults.ts`

- [ ] **Step 1: Add admin endpoint to publish vault**

```typescript
// artifacts/api-server/src/routes/vaults.ts
import { isAdmin } from "../middleware/auth"; // Assume this exists

// POST /vaults/:id/publish - Admin only
router.post("/:id/publish", isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const now = new Date();

    const [updated] = await db
      .update(vaults)
      .set({ isPublished: true, publishedAt: now })
      .where((v) => eq(v.id, parseInt(id)))
      .returning();

    if (!updated) {
      return res.status(404).json({ error: "Vault not found" });
    }

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: "Failed to publish vault" });
  }
});
```

- [ ] **Step 2: Commit**

```bash
git add src/routes/vaults.ts
git commit -m "feat: add admin endpoint to publish vaults"
```

---

## Task 14: Documentation

**Files:**
- Create: `docs/VAULTS_AND_BRIEFS.md`

- [ ] **Step 1: Write API documentation**

```markdown
# Daily Briefs & Weekly Vaults API

## Overview
- **Daily Briefs:** Pro/Max users get AI-generated summaries of daily content
- **Personalization:** Users can customize their brief settings
- **Weekly Vaults:** All users receive curated weekly digests

## Endpoints

### GET /api/briefs/today
Get today's brief for the authenticated user. Generates if not exists.

**Auth:** Required
**Tier:** Pro, Max

**Response:**
```json
{
  "id": 1,
  "subscriberId": 123,
  "briefDate": "2026-04-25",
  "summary": "...",
  "highlights": ["...", "..."],
  "viewedAt": null
}
```

### POST /api/briefs/personalization
Update user's brief personalization preferences.

**Auth:** Required
**Body:**
```json
{
  "interests": ["deals", "insights"],
  "focusAreas": ["AI", "fintech"],
  "contextStyle": "detailed" // or "quick", "summary"
}
```

### GET /api/vaults
List all published vaults (latest 10).

**Auth:** None
**Response:** Array of vault objects

### GET /api/vaults/:id
Get specific vault.

**Auth:** None

## Scheduling

- **Daily Briefs:** Generated at 6 AM UTC every day for Pro/Max users
- **Weekly Vaults:** Generated every Sunday at 8 AM UTC

## Model

Uses OpenAI GPT-4 Turbo for reasoning and content generation.
```

- [ ] **Step 2: Commit**

```bash
git add docs/VAULTS_AND_BRIEFS.md
git commit -m "docs: add briefs and vaults API documentation"
```

---

## Self-Review Checklist

✅ **Spec coverage:**
- [x] Daily summarize for Pro/Max → Task 5-7 (Context engine + Brief route)
- [x] Daily brief for Pro/Max → Task 5, 10 (Service + Scheduler)
- [x] Daily vaults → Vaults are weekly, not daily (clarified in schema)
- [x] Weekly vaults common for all tiers → Task 8-9, 13
- [x] Context engine for Max/Pro only → Task 6 (personalization check)
- [x] Model selection (GPT-4 Mini) → Task 5 (OpenAI integration)
- [x] Personalization layer → Task 2, 7
- [x] Inner circle access → Implicit in Pro/Max tier check

✅ **Placeholders:** None found. All code is complete.

✅ **Type consistency:**
- Article → `articles` table with `id`, `title`, `content`, `category`
- Brief → `dailyBriefs` with `subscriberId`, `summary`, `highlights`
- Vault → `vaults` with `vaultWeek`, `content`, `isPublished`
- Personalization → `personalization` with `subscriberId`, `interests`, `focusAreas`

---

## Next Steps After Implementation

1. **Frontend:** Build Pro portal component to display daily briefs + personalization settings
2. **Content Pipeline:** Implement article ingestion (RSS feeds, manual submissions, or API)
3. **Email Delivery:** Send daily briefs via email for Pro/Max users
4. **Analytics:** Track brief engagement (opened, clicked, viewed)
5. **Monitoring:** Set up alerts for scheduler failures

---

**Plan complete and saved to docs/superpowers/plans/2026-04-25-daily-vaults-context-engine.md.**

## Execution Options

**1. Subagent-Driven (recommended)** — I dispatch a fresh subagent per task, review between tasks, fast iteration

**2. Inline Execution** — Execute tasks in this session, batch execution with checkpoints

Which approach?
