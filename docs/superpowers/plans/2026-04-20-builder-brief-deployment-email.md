# Builder Brief — Deployment & Email System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deploy the monorepo to Vercel, add double opt-in email confirmation via Resend, and schedule a weekly Friday newsletter cron job.

**Architecture:** Express API runs as a single Vercel serverless function behind a rewrite rule; the React frontend builds to static files. Resend handles all transactional email. Vercel Cron triggers the Friday newsletter. DB schema gains two columns (confirmationToken, confirmedAt) on the existing Supabase subscribers table.

**Tech Stack:** Vercel (hosting + cron), Resend (email), Supabase (PostgreSQL), Drizzle ORM, Express 5, React + Vite, pnpm workspaces

---

## File Map

| File | Action | Purpose |
|------|--------|---------|
| `CLAUDE.md` | Create | Mandate skills before every task |
| `vercel.json` | Create | Vercel build + rewrite + cron config |
| `api/index.ts` | Create | Vercel function entry — re-exports Express app |
| `artifacts/specflow-newsletter/vite.config.ts` | Modify | Remove hard throws for PORT/BASE_PATH; guard runtimeErrorOverlay |
| `artifacts/specflow-newsletter/.env` | Modify | Add PORT=5173, BASE_PATH=/ |
| `artifacts/api-server/.env` | Modify | Add RESEND_API_KEY, CRON_SECRET, uncomment DATABASE_URL |
| `lib/db/src/schema/subscribers.ts` | Modify | Add confirmationToken and confirmedAt columns |
| `artifacts/api-server/package.json` | Modify | Add resend dependency |
| `artifacts/api-server/src/lib/resend.ts` | Create | Resend client singleton |
| `artifacts/api-server/src/lib/email-templates.ts` | Create | Confirmation + newsletter HTML templates |
| `artifacts/api-server/src/lib/issues-data.ts` | Create | Copy of newsletter issues data for use in cron |
| `artifacts/api-server/src/routes/subscribers.ts` | Modify | Generate token + send confirmation email on subscribe |
| `artifacts/api-server/src/routes/confirm.ts` | Create | GET /api/subscribers/confirm?token=xxx |
| `artifacts/api-server/src/routes/cron.ts` | Create | GET /api/cron/newsletter (Vercel Cron) |
| `artifacts/api-server/src/routes/index.ts` | Modify | Mount confirm and cron routers |
| `artifacts/specflow-newsletter/src/hooks/useSubscribe.ts` | Modify | Handle new "check inbox" success state |
| `artifacts/specflow-newsletter/src/pages/home.tsx` | Modify | Show confirmed=true toast from query param |

---

## Task 1: Create CLAUDE.md

**Files:**
- Create: `CLAUDE.md`

- [ ] **Step 1: Create the file**

```markdown
# The Builder Brief — Claude Code Configuration

## Mandatory Skills — Run Before Any Task

Before starting ANY task (coding, reviewing, planning, debugging, or
architectural decisions), invoke these skills in this order:

1. **superpowers** — use `superpowers:brainstorming` for new features,
   `superpowers:systematic-debugging` for bugs, `superpowers:executing-plans`
   for implementation work
2. **code-review** — invoke `code-review:code-review` after every logical
   chunk of code is written or modified
3. **gstack** — invoke `gstack` before any architectural decision, stack
   change, or deployment configuration change

These are non-negotiable. Do not skip them even for "small" changes.

## Stack

pnpm monorepo. See `replit.md` for commands.

- Frontend: React + Vite → `artifacts/specflow-newsletter/`
- API: Express 5 → `artifacts/api-server/`
- DB: PostgreSQL + Drizzle ORM → `lib/db/`
- Email: Resend
- Auth: Clerk
- Deploy: Vercel
```

Save to `CLAUDE.md` at repo root.

- [ ] **Step 2: Verify file exists**

```bash
cat CLAUDE.md
```

Expected: file contents printed without error.

- [ ] **Step 3: Commit**

```bash
git add CLAUDE.md
git commit -m "chore: add CLAUDE.md with mandatory skill configuration"
```

---

## Task 2: Fix vite.config.ts for Vercel Build

**Files:**
- Modify: `artifacts/specflow-newsletter/vite.config.ts`
- Modify: `artifacts/specflow-newsletter/.env`

The current config throws if `PORT` or `BASE_PATH` are missing. During `vite build` on Vercel CI, these may not be set. Fix: use defaults.

- [ ] **Step 1: Update vite.config.ts**

Replace the entire file contents:

```typescript
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

const port = Number(process.env.PORT ?? "5173");
const basePath = process.env.BASE_PATH ?? "/";

export default defineConfig({
  base: basePath,
  plugins: [
    react(),
    tailwindcss(),
    ...(process.env.NODE_ENV !== "production" &&
    process.env.REPL_ID !== undefined
      ? [
          await import("@replit/vite-plugin-runtime-error-modal").then((m) =>
            m.default(),
          ),
          await import("@replit/vite-plugin-cartographer").then((m) =>
            m.cartographer({
              root: path.resolve(import.meta.dirname, ".."),
            }),
          ),
          await import("@replit/vite-plugin-dev-banner").then((m) =>
            m.devBanner(),
          ),
        ]
      : []),
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "src"),
      "@assets": path.resolve(import.meta.dirname, "..", "..", "attached_assets"),
    },
    dedupe: ["react", "react-dom"],
  },
  root: path.resolve(import.meta.dirname),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
  },
  server: {
    port,
    host: "0.0.0.0",
    allowedHosts: true,
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
    proxy: {
      "/api": {
        target: "http://localhost:3001",
        changeOrigin: true,
      },
    },
  },
  preview: {
    port,
    host: "0.0.0.0",
    allowedHosts: true,
  },
});
```

- [ ] **Step 2: Add PORT and BASE_PATH to frontend .env**

Add these two lines to `artifacts/specflow-newsletter/.env`:

```
PORT=5173
BASE_PATH=/
```

- [ ] **Step 3: Verify the build runs without errors**

```bash
cd "artifacts/specflow-newsletter" && pnpm run typecheck
```

Expected: exits 0, no TypeScript errors.

- [ ] **Step 4: Commit**

```bash
git add artifacts/specflow-newsletter/vite.config.ts artifacts/specflow-newsletter/.env
git commit -m "fix: make PORT and BASE_PATH optional in vite.config.ts for Vercel CI builds"
```

---

## Task 3: Add vercel.json and Vercel Function Entry

**Files:**
- Create: `vercel.json`
- Create: `api/index.ts`

- [ ] **Step 1: Create api/index.ts**

Create the directory and file:

```typescript
// api/index.ts
import app from "../artifacts/api-server/src/app";

export default app;
```

This re-exports the Express app. Vercel's Node.js runtime recognises an Express app as a valid serverless function handler.

- [ ] **Step 2: Create vercel.json**

```json
{
  "buildCommand": "pnpm --filter @workspace/specflow-newsletter run build",
  "outputDirectory": "artifacts/specflow-newsletter/dist/public",
  "rewrites": [
    { "source": "/api/(.*)", "destination": "/api/index" }
  ],
  "crons": [
    { "path": "/api/cron/newsletter", "schedule": "0 9 * * 5" }
  ]
}
```

- [ ] **Step 3: Verify typecheck passes with new api/index.ts**

```bash
pnpm run typecheck
```

Expected: exits 0. If there are type errors in `api/index.ts` related to Express app type, they will surface here.

- [ ] **Step 4: Commit**

```bash
git add vercel.json api/index.ts
git commit -m "feat: add Vercel deployment config and serverless function entry"
```

---

## Task 4: DB Migration — Add Confirmation Columns

**Files:**
- Modify: `lib/db/src/schema/subscribers.ts`

- [ ] **Step 1: Add two new columns to the schema**

Replace the file contents:

```typescript
import { pgTable, text, serial, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const subscribersTable = pgTable("subscribers", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  source: text("source").notNull().default("homepage"),
  confirmed: boolean("confirmed").notNull().default(false),
  confirmedAt: timestamp("confirmed_at", { withTimezone: true }),
  confirmationToken: text("confirmation_token").unique(),
  unsubscribed: boolean("unsubscribed").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertSubscriberSchema = createInsertSchema(subscribersTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertSubscriber = z.infer<typeof insertSubscriberSchema>;
export type Subscriber = typeof subscribersTable.$inferSelect;
```

- [ ] **Step 2: Set DATABASE_URL in the api-server .env**

Edit `artifacts/api-server/.env` — uncomment and fill in the Supabase connection string:

```
DATABASE_URL=postgresql://postgres:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres
```

Replace `[PASSWORD]` and `[REGION]` with your actual Supabase credentials (found in Supabase dashboard → Project Settings → Database → Connection string → URI).

- [ ] **Step 3: Push the schema to Supabase**

```bash
DATABASE_URL="postgresql://postgres:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres" \
  pnpm --filter @workspace/db run push
```

Expected output: Drizzle prints the new columns being created (`confirmation_token`, `confirmed_at`) and confirms success.

- [ ] **Step 4: Verify columns exist**

In Supabase dashboard → Table Editor → subscribers table, confirm `confirmed_at` and `confirmation_token` columns are present.

- [ ] **Step 5: Commit**

```bash
git add lib/db/src/schema/subscribers.ts
git commit -m "feat(db): add confirmationToken and confirmedAt columns to subscribers"
```

---

## Task 5: Install Resend and Create Email Infrastructure

**Files:**
- Modify: `artifacts/api-server/package.json`
- Create: `artifacts/api-server/src/lib/resend.ts`
- Create: `artifacts/api-server/src/lib/email-templates.ts`
- Modify: `artifacts/api-server/.env`

- [ ] **Step 1: Add RESEND_API_KEY and CRON_SECRET to api-server .env**

Add to `artifacts/api-server/.env`:

```
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxx
CRON_SECRET=some-long-random-secret-string
```

Get `RESEND_API_KEY` from [resend.com](https://resend.com) → API Keys.
Generate `CRON_SECRET` with: `openssl rand -hex 32`

- [ ] **Step 2: Install resend package**

```bash
pnpm --filter @workspace/api-server add resend
```

Expected: resend added to `artifacts/api-server/package.json` dependencies.

- [ ] **Step 3: Create the Resend client singleton**

Create `artifacts/api-server/src/lib/resend.ts`:

```typescript
import { Resend } from "resend";

if (!process.env.RESEND_API_KEY) {
  throw new Error("RESEND_API_KEY must be set");
}

export const resend = new Resend(process.env.RESEND_API_KEY);

export const FROM_EMAIL = "The Builder Brief <newsletter@yourdomain.com>";
export const SITE_URL = process.env.SITE_URL ?? "https://yourdomain.com";
```

Replace `yourdomain.com` with the actual domain you will configure in Resend and Vercel. For testing with Resend's sandbox, you can use `onboarding@resend.dev` as the FROM address initially.

- [ ] **Step 4: Create email templates**

Create `artifacts/api-server/src/lib/email-templates.ts`:

```typescript
import { SITE_URL } from "./resend";

export function confirmationEmailHtml(token: string): string {
  const confirmUrl = `${SITE_URL}/api/subscribers/confirm?token=${token}`;
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Confirm your subscription</title>
</head>
<body style="margin:0;padding:0;background:#F8F4EF;font-family:'DM Sans',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F8F4EF;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid rgba(0,0,0,0.08);">
          <tr>
            <td style="background:#E9591C;padding:32px 40px;">
              <p style="margin:0;color:#ffffff;font-size:13px;letter-spacing:0.1em;text-transform:uppercase;font-weight:600;">The Builder Brief</p>
            </td>
          </tr>
          <tr>
            <td style="padding:40px;">
              <h1 style="margin:0 0 16px;font-size:28px;font-weight:700;color:#0D0D0D;font-family:Georgia,serif;">One click to confirm</h1>
              <p style="margin:0 0 24px;font-size:16px;color:#6B6459;line-height:1.6;">
                You're almost in. Confirm your email to start receiving a fresh startup blueprint every Friday.
              </p>
              <a href="${confirmUrl}"
                 style="display:inline-block;background:#E9591C;color:#ffffff;text-decoration:none;padding:14px 32px;border-radius:100px;font-size:15px;font-weight:600;">
                Confirm subscription
              </a>
              <p style="margin:32px 0 0;font-size:13px;color:#8C7B6E;">
                If the button doesn't work, copy and paste this link:<br>
                <a href="${confirmUrl}" style="color:#E9591C;word-break:break-all;">${confirmUrl}</a>
              </p>
              <p style="margin:24px 0 0;font-size:13px;color:#8C7B6E;">
                If you didn't sign up, ignore this email — you won't hear from us again.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function newsletterEmailHtml(issue: { number: string; title: string; tagline: string; problem: string; whyNow: string[]; blueprint: string[]; prompts: string[]; firstRevenue: string; firstTen: string }, unsubscribeEmail: string): string {
  const unsubscribeUrl = `${SITE_URL}/api/subscribers/unsubscribe-link?email=${encodeURIComponent(unsubscribeEmail)}`;
  const blueprintItems = issue.blueprint
    .map((step, i) => `<tr><td style="padding:6px 0;"><span style="color:#E9591C;font-weight:700;">${i + 1}.</span> ${step}</td></tr>`)
    .join("");
  const promptItems = issue.prompts
    .map((p) => `<tr><td style="padding:8px 12px;background:#F8F4EF;border-radius:8px;font-size:14px;color:#0D0D0D;margin-bottom:8px;line-height:1.6;">${p}</td></tr>`)
    .join("<tr><td style='padding:4px 0;'></td></tr>");
  const whyNowItems = issue.whyNow
    .map((w) => `<li style="margin-bottom:8px;color:#6B6459;">${w}</li>`)
    .join("");

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>The Builder Brief #${issue.number}: ${issue.title}</title>
</head>
<body style="margin:0;padding:0;background:#F8F4EF;font-family:'DM Sans',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F8F4EF;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid rgba(0,0,0,0.08);">
          <!-- Header -->
          <tr>
            <td style="background:#E9591C;padding:24px 40px;">
              <p style="margin:0;color:#ffffff;font-size:12px;letter-spacing:0.12em;text-transform:uppercase;font-weight:600;">The Builder Brief · Issue #${issue.number}</p>
            </td>
          </tr>
          <!-- Title -->
          <tr>
            <td style="padding:40px 40px 0;">
              <h1 style="margin:0 0 12px;font-size:36px;font-weight:700;color:#0D0D0D;font-family:Georgia,serif;">${issue.title}</h1>
              <p style="margin:0 0 32px;font-size:16px;color:#6B6459;line-height:1.6;font-style:italic;">${issue.tagline}</p>
            </td>
          </tr>
          <!-- Problem -->
          <tr>
            <td style="padding:0 40px 32px;">
              <h2 style="margin:0 0 12px;font-size:18px;font-weight:700;color:#0D0D0D;text-transform:uppercase;letter-spacing:0.05em;font-size:13px;">The Problem</h2>
              <p style="margin:0;font-size:15px;color:#0D0D0D;line-height:1.7;">${issue.problem}</p>
            </td>
          </tr>
          <!-- Why Now -->
          <tr>
            <td style="padding:0 40px 32px;">
              <h2 style="margin:0 0 12px;font-size:13px;font-weight:700;color:#0D0D0D;text-transform:uppercase;letter-spacing:0.05em;">Why Now</h2>
              <ul style="margin:0;padding-left:20px;">
                ${whyNowItems}
              </ul>
            </td>
          </tr>
          <!-- Blueprint -->
          <tr>
            <td style="padding:0 40px 32px;">
              <h2 style="margin:0 0 16px;font-size:13px;font-weight:700;color:#0D0D0D;text-transform:uppercase;letter-spacing:0.05em;">Build Blueprint</h2>
              <table width="100%" cellpadding="0" cellspacing="0">
                ${blueprintItems}
              </table>
            </td>
          </tr>
          <!-- Claude Prompts -->
          <tr>
            <td style="padding:0 40px 32px;">
              <h2 style="margin:0 0 16px;font-size:13px;font-weight:700;color:#E9591C;text-transform:uppercase;letter-spacing:0.05em;">Claude Prompts</h2>
              <table width="100%" cellpadding="0" cellspacing="8">
                ${promptItems}
              </table>
            </td>
          </tr>
          <!-- First Revenue -->
          <tr>
            <td style="padding:0 40px 32px;">
              <h2 style="margin:0 0 12px;font-size:13px;font-weight:700;color:#0D0D0D;text-transform:uppercase;letter-spacing:0.05em;">First Revenue Path</h2>
              <p style="margin:0;font-size:15px;color:#0D0D0D;line-height:1.7;">${issue.firstRevenue}</p>
            </td>
          </tr>
          <!-- First 10 Customers -->
          <tr>
            <td style="padding:0 40px 40px;">
              <h2 style="margin:0 0 12px;font-size:13px;font-weight:700;color:#0D0D0D;text-transform:uppercase;letter-spacing:0.05em;">First 10 Customers</h2>
              <p style="margin:0;font-size:15px;color:#0D0D0D;line-height:1.7;">${issue.firstTen}</p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:24px 40px;background:#F8F4EF;border-top:1px solid rgba(0,0,0,0.08);">
              <p style="margin:0;font-size:12px;color:#8C7B6E;line-height:1.6;">
                You're receiving this because you subscribed at ${SITE_URL}.<br>
                <a href="${unsubscribeUrl}" style="color:#E9591C;">Unsubscribe</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
```

- [ ] **Step 5: Verify TypeScript compiles**

```bash
pnpm --filter @workspace/api-server run typecheck
```

Expected: exits 0.

- [ ] **Step 6: Commit**

```bash
git add artifacts/api-server/src/lib/resend.ts artifacts/api-server/src/lib/email-templates.ts artifacts/api-server/package.json pnpm-lock.yaml
git commit -m "feat(api): add Resend client and email templates"
```

---

## Task 6: Copy Issues Data to API Server

**Files:**
- Create: `artifacts/api-server/src/lib/issues-data.ts`

The cron job needs access to the newsletter issues. The data lives in the frontend — copy it to the API server as a static module.

- [ ] **Step 1: Create issues-data.ts in api-server**

Create `artifacts/api-server/src/lib/issues-data.ts` by copying the full issues array from `artifacts/specflow-newsletter/src/lib/data.ts`.

The file should have this shape (fill in all issues from the source file):

```typescript
export interface Issue {
  number: string;
  slug: string;
  title: string;
  category: string;
  tam: string;
  revenueIn: string;
  tagline: string;
  problem: string;
  whyNow: string[];
  tam_detail: string;
  blueprint: string[];
  prompts: string[];
  firstRevenue: string;
  firstTen: string;
}

export const issues: Issue[] = [
  // paste all entries from artifacts/specflow-newsletter/src/lib/data.ts here
];

export function getLatestIssue(): Issue {
  return [...issues].sort((a, b) =>
    b.number.localeCompare(a.number, undefined, { numeric: true })
  )[0];
}
```

Open `artifacts/specflow-newsletter/src/lib/data.ts`, copy the full `issues` array, and paste it into the `issues` array above.

- [ ] **Step 2: Verify typecheck**

```bash
pnpm --filter @workspace/api-server run typecheck
```

Expected: exits 0.

- [ ] **Step 3: Commit**

```bash
git add artifacts/api-server/src/lib/issues-data.ts
git commit -m "feat(api): add issues data for newsletter cron"
```

---

## Task 7: Update POST /api/subscribers — Send Confirmation Email

**Files:**
- Modify: `artifacts/api-server/src/routes/subscribers.ts`

- [ ] **Step 1: Update the subscribers route**

Replace the file contents:

```typescript
import { Router, type IRouter } from "express";
import { eq, gte, count } from "drizzle-orm";
import { randomUUID } from "crypto";
import { db, subscribersTable } from "@workspace/db";
import { CreateSubscriberBody, UnsubscribeBody } from "@workspace/api-zod";
import { resend, FROM_EMAIL, SITE_URL } from "../lib/resend";
import { confirmationEmailHtml } from "../lib/email-templates";

const router: IRouter = Router();

router.post("/subscribers", async (req, res): Promise<void> => {
  const parsed = CreateSubscriberBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const existing = await db
    .select()
    .from(subscribersTable)
    .where(eq(subscribersTable.email, parsed.data.email))
    .limit(1);

  if (existing.length > 0 && !existing[0].unsubscribed) {
    res.status(409).json({ error: "Already subscribed" });
    return;
  }

  const token = randomUUID();

  if (existing.length > 0 && existing[0].unsubscribed) {
    await db
      .update(subscribersTable)
      .set({
        unsubscribed: false,
        confirmed: false,
        confirmationToken: token,
        confirmedAt: null,
        source: parsed.data.source ?? "homepage",
      })
      .where(eq(subscribersTable.email, parsed.data.email));
  } else {
    await db.insert(subscribersTable).values({
      email: parsed.data.email,
      source: parsed.data.source ?? "homepage",
      confirmationToken: token,
    });
  }

  await resend.emails.send({
    from: FROM_EMAIL,
    to: parsed.data.email,
    subject: "Confirm your subscription to The Builder Brief",
    html: confirmationEmailHtml(token),
  });

  res.status(201).json({ message: "Check your inbox to confirm your subscription" });
});

router.post("/subscribers/unsubscribe", async (req, res): Promise<void> => {
  const parsed = UnsubscribeBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [updated] = await db
    .update(subscribersTable)
    .set({ unsubscribed: true })
    .where(eq(subscribersTable.email, parsed.data.email))
    .returning();

  if (!updated) {
    res.status(404).json({ error: "Subscriber not found" });
    return;
  }

  res.json({ message: "Unsubscribed successfully" });
});

router.get("/subscribers/unsubscribe-link", async (req, res): Promise<void> => {
  const email = req.query.email as string;
  if (!email) {
    res.status(400).json({ error: "email query param required" });
    return;
  }

  await db
    .update(subscribersTable)
    .set({ unsubscribed: true })
    .where(eq(subscribersTable.email, email));

  res.redirect(`${SITE_URL}/?unsubscribed=true`);
});

router.get("/subscribers/stats", async (req, res): Promise<void> => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const weekAgo = new Date(today);
  weekAgo.setDate(weekAgo.getDate() - 7);

  const [totalRow] = await db.select({ count: count() }).from(subscribersTable);
  const [confirmedRow] = await db
    .select({ count: count() })
    .from(subscribersTable)
    .where(eq(subscribersTable.confirmed, true));
  const [unsubscribedRow] = await db
    .select({ count: count() })
    .from(subscribersTable)
    .where(eq(subscribersTable.unsubscribed, true));
  const [todayRow] = await db
    .select({ count: count() })
    .from(subscribersTable)
    .where(gte(subscribersTable.createdAt, today));
  const [weekRow] = await db
    .select({ count: count() })
    .from(subscribersTable)
    .where(gte(subscribersTable.createdAt, weekAgo));

  res.json({
    total: totalRow.count,
    confirmed: confirmedRow.count,
    unsubscribed: unsubscribedRow.count,
    todaySignups: todayRow.count,
    weekSignups: weekRow.count,
  });
});

export default router;
```

- [ ] **Step 2: Verify typecheck**

```bash
pnpm --filter @workspace/api-server run typecheck
```

Expected: exits 0.

- [ ] **Step 3: Manual test (with running API server)**

Start the API server:
```bash
PORT=3001 pnpm --filter @workspace/api-server run dev
```

In another terminal:
```bash
curl -s -X POST http://localhost:3001/api/subscribers \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","source":"test"}' | jq
```

Expected response:
```json
{"message": "Check your inbox to confirm your subscription"}
```

Check the Resend dashboard at [resend.com](https://resend.com) → Emails to confirm the email was queued.

- [ ] **Step 4: Commit**

```bash
git add artifacts/api-server/src/routes/subscribers.ts
git commit -m "feat(api): send confirmation email on subscribe"
```

---

## Task 8: Add Confirmation Endpoint

**Files:**
- Create: `artifacts/api-server/src/routes/confirm.ts`

- [ ] **Step 1: Create confirm.ts**

```typescript
import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, subscribersTable } from "@workspace/db";
import { SITE_URL } from "../lib/resend";

const router: IRouter = Router();

router.get("/subscribers/confirm", async (req, res): Promise<void> => {
  const token = req.query.token as string;

  if (!token) {
    res.redirect(`${SITE_URL}/?error=missing-token`);
    return;
  }

  const [subscriber] = await db
    .select()
    .from(subscribersTable)
    .where(eq(subscribersTable.confirmationToken, token))
    .limit(1);

  if (!subscriber) {
    res.redirect(`${SITE_URL}/?error=invalid-token`);
    return;
  }

  await db
    .update(subscribersTable)
    .set({
      confirmed: true,
      confirmedAt: new Date(),
      confirmationToken: null,
    })
    .where(eq(subscribersTable.id, subscriber.id));

  res.redirect(`${SITE_URL}/?confirmed=true`);
});

export default router;
```

- [ ] **Step 2: Verify typecheck**

```bash
pnpm --filter @workspace/api-server run typecheck
```

Expected: exits 0.

- [ ] **Step 3: Commit**

```bash
git add artifacts/api-server/src/routes/confirm.ts
git commit -m "feat(api): add subscriber email confirmation endpoint"
```

---

## Task 9: Add Friday Newsletter Cron Endpoint

**Files:**
- Create: `artifacts/api-server/src/routes/cron.ts`

- [ ] **Step 1: Create cron.ts**

```typescript
import { Router, type IRouter } from "express";
import { eq, and } from "drizzle-orm";
import { db, subscribersTable } from "@workspace/db";
import { resend, FROM_EMAIL } from "../lib/resend";
import { newsletterEmailHtml } from "../lib/email-templates";
import { getLatestIssue } from "../lib/issues-data";

const router: IRouter = Router();

router.get("/cron/newsletter", async (req, res): Promise<void> => {
  const secret = process.env.CRON_SECRET;
  const authHeader = req.headers.authorization;

  if (!secret || authHeader !== `Bearer ${secret}`) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const issue = getLatestIssue();

  const subscribers = await db
    .select({ email: subscribersTable.email })
    .from(subscribersTable)
    .where(
      and(
        eq(subscribersTable.confirmed, true),
        eq(subscribersTable.unsubscribed, false),
      ),
    );

  if (subscribers.length === 0) {
    res.json({ sent: 0, message: "No confirmed subscribers" });
    return;
  }

  const BATCH_SIZE = 100;
  let totalSent = 0;

  for (let i = 0; i < subscribers.length; i += BATCH_SIZE) {
    const batch = subscribers.slice(i, i + BATCH_SIZE);

    const emails = batch.map((sub) => ({
      from: FROM_EMAIL,
      to: sub.email,
      subject: `The Builder Brief #${issue.number}: ${issue.title}`,
      html: newsletterEmailHtml(issue, sub.email),
    }));

    await resend.batch.send(emails);
    totalSent += batch.length;
  }

  res.json({ sent: totalSent, issue: issue.number });
});

export default router;
```

- [ ] **Step 2: Verify typecheck**

```bash
pnpm --filter @workspace/api-server run typecheck
```

Expected: exits 0.

- [ ] **Step 3: Commit**

```bash
git add artifacts/api-server/src/routes/cron.ts
git commit -m "feat(api): add Friday newsletter cron endpoint"
```

---

## Task 10: Wire Up New Routes in Router

**Files:**
- Modify: `artifacts/api-server/src/routes/index.ts`

- [ ] **Step 1: Update routes/index.ts**

```typescript
import { Router, type IRouter } from "express";
import healthRouter from "./health";
import subscribersRouter from "./subscribers";
import analyticsRouter from "./analytics";
import confirmRouter from "./confirm";
import cronRouter from "./cron";

const router: IRouter = Router();

router.use(healthRouter);
router.use(subscribersRouter);
router.use(analyticsRouter);
router.use(confirmRouter);
router.use(cronRouter);

export default router;
```

- [ ] **Step 2: Verify full typecheck**

```bash
pnpm run typecheck
```

Expected: exits 0, no errors across all packages.

- [ ] **Step 3: Manual smoke test of confirm endpoint**

With API server running (`PORT=3001 pnpm --filter @workspace/api-server run dev`):

1. Subscribe with a test email (Task 7 Step 3)
2. Get the confirmation token from Supabase → Table Editor → subscribers → `confirmation_token` column
3. Run:
```bash
curl -v "http://localhost:3001/api/subscribers/confirm?token=<TOKEN>"
```
Expected: HTTP 302 redirect to `/?confirmed=true`

4. Check Supabase: subscriber row should now have `confirmed=true`, `confirmed_at` set, `confirmation_token=null`

- [ ] **Step 4: Manual smoke test of cron endpoint**

```bash
curl -s -H "Authorization: Bearer $(grep CRON_SECRET artifacts/api-server/.env | cut -d= -f2)" \
  http://localhost:3001/api/cron/newsletter | jq
```

Expected (if test subscriber is confirmed):
```json
{"sent": 1, "issue": "008"}
```

Check Resend dashboard to confirm the newsletter email was queued.

- [ ] **Step 5: Commit**

```bash
git add artifacts/api-server/src/routes/index.ts
git commit -m "feat(api): wire up confirm and cron routes"
```

---

## Task 11: Update Frontend for Confirmation Flow

**Files:**
- Modify: `artifacts/specflow-newsletter/src/hooks/useSubscribe.ts`
- Modify: `artifacts/specflow-newsletter/src/pages/home.tsx`

The API now returns `{ message: "Check your inbox..." }` instead of a subscriber object. The frontend's `success` state label should reflect this. Also, when users land on `/?confirmed=true` after clicking the confirmation link, show a toast.

- [ ] **Step 1: Update useSubscribe.ts**

Replace the file contents:

```typescript
import { useState } from "react";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

export type SubscribeStatus = "idle" | "loading" | "pending-confirmation" | "error" | "exists";

export function useSubscribe(source = "homepage") {
  const [status, setStatus] = useState<SubscribeStatus>("idle");

  async function subscribe(email: string) {
    if (!email) return;
    setStatus("loading");
    try {
      const res = await fetch(`${BASE}/api/subscribers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source }),
      });
      if (res.status === 409) {
        setStatus("exists");
        setTimeout(() => setStatus("idle"), 5000);
        return;
      }
      if (!res.ok) throw new Error("Failed");
      setStatus("pending-confirmation");
      setTimeout(() => setStatus("idle"), 8000);
    } catch {
      setStatus("error");
      setTimeout(() => setStatus("idle"), 4000);
    }
  }

  return { status, subscribe };
}
```

- [ ] **Step 2: Update home.tsx — handle ?confirmed=true query param**

Find the `HeroSection` function in `artifacts/specflow-newsletter/src/pages/home.tsx`. Add this import at the top of the file (with the other imports):

```typescript
import { useEffect } from "react";
import { useSearch } from "wouter";
import { useToast } from "@/hooks/use-toast";
```

Then inside the `HeroSection` function body, before the `return` statement, add:

```typescript
const search = useSearch();
const { toast } = useToast();

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
```

- [ ] **Step 3: Update the subscribe button status text in HeroSection**

In `home.tsx`, find all references to `status === "success"` in the HeroSection and update them to `status === "pending-confirmation"`. The message to show should be "Check your inbox to confirm!" instead of any previous success message.

Search for the submit button/status display in HeroSection and update the status check. The exact JSX will look something like:

```tsx
{status === "pending-confirmation" ? (
  <p className="text-sm text-green-600 mt-2">Check your inbox to confirm!</p>
) : status === "exists" ? (
  <p className="text-sm text-amber-600 mt-2">Already subscribed.</p>
) : status === "error" ? (
  <p className="text-sm text-red-500 mt-2">Something went wrong. Try again.</p>
) : null}
```

Find the existing status display in `HeroSection` and update it to match this pattern.

- [ ] **Step 4: Verify typecheck**

```bash
pnpm --filter @workspace/specflow-newsletter run typecheck
```

Expected: exits 0.

- [ ] **Step 5: Full build verification**

```bash
pnpm run build
```

Expected: typecheck passes, frontend Vite build produces `artifacts/specflow-newsletter/dist/public/`, API server esbuild produces `artifacts/api-server/dist/index.mjs`.

- [ ] **Step 6: Commit**

```bash
git add artifacts/specflow-newsletter/src/hooks/useSubscribe.ts artifacts/specflow-newsletter/src/pages/home.tsx
git commit -m "feat(frontend): update subscribe flow for double opt-in confirmation"
```

---

## Task 12: Final Vercel Deployment Checklist

No code changes. Verification and deployment steps.

- [ ] **Step 1: Set all environment variables in Vercel dashboard**

Go to your Vercel project → Settings → Environment Variables. Add:

| Variable | Value |
|----------|-------|
| `DATABASE_URL` | Your Supabase connection string |
| `CLERK_SECRET_KEY` | From `artifacts/api-server/.env` |
| `VITE_CLERK_PUBLISHABLE_KEY` | From `artifacts/specflow-newsletter/.env` |
| `RESEND_API_KEY` | Your Resend API key |
| `CRON_SECRET` | Your generated secret |
| `SITE_URL` | `https://your-vercel-domain.vercel.app` |
| `BASE_PATH` | `/` |
| `PORT` | `5173` |

- [ ] **Step 2: Verify Resend domain or use sandbox**

In Resend dashboard → Domains, either:
- Add and verify your domain (enables sending from `newsletter@yourdomain.com`)
- OR for initial testing, use `onboarding@resend.dev` as the `FROM_EMAIL` in `artifacts/api-server/src/lib/resend.ts` (only sends to your own verified email)

Update `FROM_EMAIL` in `artifacts/api-server/src/lib/resend.ts` to match your verified Resend sender.

- [ ] **Step 3: Push to main and verify Vercel deployment**

```bash
git push origin main
```

In Vercel dashboard, watch the build log. Expected:
- `pnpm --filter @workspace/specflow-newsletter run build` succeeds
- Frontend deployed to CDN
- `api/index.ts` compiled as serverless function
- Cron job scheduled

- [ ] **Step 4: Test live endpoints**

```bash
# Health check
curl https://your-vercel-domain.vercel.app/api/health

# Subscribe (should send confirmation email)
curl -X POST https://your-vercel-domain.vercel.app/api/subscribers \
  -H "Content-Type: application/json" \
  -d '{"email":"you@example.com"}'
```

Expected: confirmation email arrives in inbox within 30 seconds.

- [ ] **Step 5: Commit final env documentation**

```bash
git add artifacts/api-server/.env artifacts/specflow-newsletter/.env
# Note: .env files are in .gitignore — this step is a reminder to
# keep the Vercel env var list up to date in your team docs
```

---

## Spec Coverage Check

| Spec Requirement | Covered By |
|-----------------|-----------|
| CLAUDE.md with mandatory skills | Task 1 |
| Fix vite.config.ts PORT/BASE_PATH hard throws | Task 2 |
| Remove Replit plugins from production | Task 2 |
| vercel.json with build + rewrite + cron | Task 3 |
| api/index.ts Vercel function entry | Task 3 |
| confirmationToken + confirmedAt DB columns | Task 4 |
| Resend client + email templates | Task 5 |
| Issues data in api-server | Task 6 |
| POST /api/subscribers sends confirmation email | Task 7 |
| GET /api/subscribers/unsubscribe-link | Task 7 |
| GET /api/subscribers/confirm endpoint | Task 8 |
| GET /api/cron/newsletter with CRON_SECRET auth | Task 9 |
| Batch send to all confirmed subscribers | Task 9 |
| Frontend handles confirmed=true query param | Task 11 |
| Frontend useSubscribe updated for new flow | Task 11 |
| Vercel env vars checklist | Task 12 |
