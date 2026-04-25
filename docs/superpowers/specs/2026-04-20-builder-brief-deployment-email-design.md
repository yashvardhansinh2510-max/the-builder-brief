# The Builder Brief — Deployment & Email System Design

**Date:** 2026-04-20
**Status:** Approved

---

## Overview

Deploy the existing monorepo (React frontend + Express API) to Vercel. Add a double opt-in email confirmation system and a weekly Friday newsletter using Resend. Configure CLAUDE.md to mandate superpowers, code-review, and gstack skills before any task.

---

## 1. Deployment Architecture

**Platform:** Vercel

```
Vercel Project
├── Frontend (static)
│   └── artifacts/specflow-newsletter/
│       vite build → dist/public/ → Vercel CDN
│
├── API (Vercel Node.js serverless function)
│   └── vercel.json routes /api/* → artifacts/api-server/
│       Express app exported as a single handler
│
├── Cron Job
│   └── vercel.json schedule: "0 9 * * 5" (every Friday 9am UTC)
│       → GET /api/cron/newsletter (protected by CRON_SECRET)
│
└── Environment Variables (set in Vercel dashboard)
    VITE_CLERK_PUBLISHABLE_KEY
    CLERK_SECRET_KEY
    DATABASE_URL               (Supabase PostgreSQL)
    RESEND_API_KEY
    CRON_SECRET
    BASE_PATH=/
```

**Fixes to existing files:**

- `vite.config.ts` — remove hard throws for `PORT` and `BASE_PATH` at config-parse time; use sensible defaults (`PORT=5173`, `BASE_PATH=/`) so `vite build` works in CI without those vars set
- Remove `@replit/vite-plugin-cartographer`, `@replit/vite-plugin-dev-banner`, and `@replit/vite-plugin-runtime-error-modal` from production builds (guard with `REPL_ID` check that already exists, but also skip `runtimeErrorOverlay` in production)
- Add `vercel.json` at repo root

**`vercel.json` structure:**
```json
{
  "buildCommand": "pnpm run build",
  "outputDirectory": "artifacts/specflow-newsletter/dist/public",
  "rewrites": [
    { "source": "/api/(.*)", "destination": "/api/index" }
  ],
  "functions": {
    "api/index.ts": { "includeFiles": "artifacts/api-server/dist/**" }
  },
  "crons": [
    { "path": "/api/cron/newsletter", "schedule": "0 9 * * 5" }
  ]
}
```

---

## 2. Email System

### 2a. Database Schema Change

Add two columns to `subscribers` table:

```sql
confirmation_token  text  UNIQUE  NULL   -- cleared after confirmation
confirmed_at        timestamp with time zone  NULL
```

Drizzle migration: add columns, push to Supabase.

### 2b. Subscription Confirmation Flow

```
POST /api/subscribers  { email, source? }
  1. Validate with existing Zod schema
  2. Check for duplicate (existing logic)
  3. Generate confirmationToken = crypto.randomUUID()
  4. Insert subscriber: confirmed=false, confirmationToken=token
  5. Send confirmation email via Resend:
       To: user email
       Subject: "Confirm your subscription to The Builder Brief"
       Body: button linking to /confirm?token=<token>
  6. Return 201 { message: "Check your inbox to confirm" }

GET /api/subscribers/confirm?token=<uuid>
  1. Look up subscriber by confirmationToken
  2. If not found → redirect to /?error=invalid-token
  3. Set confirmed=true, confirmedAt=now, confirmationToken=null
  4. Redirect to /?confirmed=true
```

Frontend handles `?confirmed=true` query param on the home page to show a success toast.

### 2c. Friday Newsletter Cron

```
GET /api/cron/newsletter
  Auth: header Authorization: Bearer <CRON_SECRET>
  (Vercel sets this automatically for cron jobs)

  1. Verify CRON_SECRET
  2. Load latest issue from shared issues data (highest issue number)
  3. Query: all confirmed=true, unsubscribed=false subscribers
  4. Build HTML email from issue data (title, problem, blueprint, prompts, firstRevenue, firstTen)
  5. Send via Resend batch API (max 100/batch, loop if more)
  6. Return 200 { sent: N }
```

### 2d. Email Templates

**Confirmation email:**
- Subject: `Confirm your subscription to The Builder Brief`
- Body: Brief intro, "Confirm subscription" CTA button, note that they won't receive anything until confirmed

**Newsletter email:**
- Subject: `The Builder Brief #<number>: <title>`
- Sections: tagline, problem, why now, blueprint steps, 3 Claude prompts, first revenue path, first 10 customers
- Footer: unsubscribe link → `POST /api/subscribers/unsubscribe`

---

## 3. CLAUDE.md Configuration

Create `CLAUDE.md` at repo root:

```markdown
## Mandatory Skills — Run Before Any Task

Before starting ANY task invoke these skills in order:

1. **superpowers** — brainstorming for new features, systematic-debugging for bugs,
   executing-plans for implementation work
2. **code-review** — after every logical chunk of code is written
3. **gstack** — before any architectural or stack decisions
```

---

## 4. Clerk Auth Check

The frontend `App.tsx` throws if `VITE_CLERK_PUBLISHABLE_KEY` is missing. The key exists in `.env`. Confirm it is also added to Vercel environment variables. The `VITE_CLERK_PROXY_URL` is optional for dev but must be set correctly for production (or left unset if not using a proxy).

---

## Implementation Order

1. Fix `vite.config.ts` and remove Replit-only plugins from prod
2. Add `vercel.json`
3. Create `CLAUDE.md`
4. Add DB migration (confirmationToken, confirmedAt columns)
5. Install and configure Resend in api-server
6. Update `POST /api/subscribers` to send confirmation email
7. Add `GET /api/subscribers/confirm` endpoint
8. Add `GET /api/cron/newsletter` endpoint
9. Add issues data to api-server (shared or imported)
10. Handle `?confirmed=true` on frontend home page
11. Verify Clerk env vars for Vercel deployment
