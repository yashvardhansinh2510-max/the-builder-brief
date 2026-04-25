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
