# Blueprints Redesign & Bug Fixes — Design Spec
**Date:** 2026-05-06  
**Status:** Approved

---

## Problem

1. Blueprints and Archive pages look identical — same cards, same data, same layout. No differentiation.
2. TierGate always shows "Upgrade to Pro/Max" even for Pro/Max users — auth token never sent to `/api/user/tier`.
3. Clicking "Upgrade Now" in TierGate links to `/pricing` which has no route in `App.tsx` → 404.
4. Vault numbering shows raw IDs (e.g. "111222") in the vault system — no human-readable sequential display numbers.

---

## Solution Overview

**Archive** stays as a searchable library — browse, discover, filter by category.  
**Blueprints** becomes a founder's execution workspace — stage-based, tool-heavy, tier-differentiated.

---

## Blueprints Page — Full Design

### Purpose
Blueprints is the answer to: "I want to start a company — what do I do next?" It's organized around where a founder is in their journey, not just what ideas exist.

### Layout Sections

#### 1. Hero — Founder Context Bar
- Heading: "Pick your stage. Get the exact playbook."
- Venture type filter (pill buttons): All / B2B SaaS / Fintech / Health / Climate / Consumer / AI-Native
- This filter persists across all sections below

#### 2. Vertical Starter Kits (horizontal scroll row)
6 kit cards, one per vertical. Click → filters entire page to that vertical.
Each kit shows: vertical name, number of blueprints, key stat (e.g. "avg TAM: $8B").
This replaces the bland category chips. Visual, clickable, scannable.

#### 3. Stage 1 — IDEATION & VALIDATION
Label: "Prove the market before you build."
- Blueprint cards filtered to `difficulty: Low` and `devTime: Days`
- Shows 3 cards in a row (filtered by selected vertical)
- Inline tool: **Market Sizing Calculator** (quick TAM/SAM/SOM inputs → number output)
  - Free: see the tool, cannot run it (locked with TierGate pro)
  - Pro/Max: fully interactive

#### 4. Stage 2 — BUILD & LAUNCH  
Label: "Get to first revenue in 30 days."
- Blueprint cards filtered to `devTime: Days or Weeks`
- Shows 3 cards, filtered by vertical
- Inline tool: **GTM Planner** — shows the "First 10 Customers" strategy for the selected vertical as an interactive checklist
  - Free: first 2 steps visible, rest locked (TierGate pro)
  - Pro/Max: full checklist, copyable

#### 5. Stage 3 — SCALE & EXIT
Label: "Unit economics locked. Now grow."
- Blueprint cards filtered to those with `traction?.status === "added"` or having exitStrategy defined
- Shows 3 cards
- Inline tool: **Unit Economics Dashboard** — pulls from issue.unitEconomicsExpanded data
  - Free: completely hidden (TierGate max)
  - Pro: visible but read-only
  - Max: interactive with custom inputs

#### 6. Pro/Max Exclusive Section
Visible only to Pro/Max users. Title: "Your Inner Circle Toolkit."
- Investor Matching teaser (links to investor-portal)
- Exit Playbook access (links to relevant issue sections)
- Hiring Roadmap builder
- For free users: a single locked card showing what's inside, with CTA to pricing

---

## TierGate Fix

### Root Cause
`TierGate.tsx` fetches `/api/user/tier` with no Authorization header. The endpoint requires `verifyUser` middleware → returns 401 → TierGate falls back to `free` tier.

### Fix
Replace the standalone fetch in TierGate with the shared `useAuth()` hook from `@/lib/AuthContext` which already handles Clerk token and tier resolution correctly.

```tsx
// Before (broken)
const { userId } = useAuth(); // from @clerk/react
useEffect(() => {
  fetch('/api/user/tier') // no token → 401
}, [userId]);

// After (fixed)
const { tier } = useAuth(); // from @/lib/AuthContext — already has correct tier
// No fetch needed — use tier directly
```

TierGate becomes a pure presentation component driven by the already-resolved tier from AuthContext.

---

## /pricing Route Fix

### Root Cause
`TierGate.tsx` links to `/pricing`. The page `pricing.tsx` exists but is not registered in `App.tsx`.

### Fix
Add `<Route path="/pricing" component={PricingPage} />` to App.tsx.
Import `PricingPage` from `@/pages/pricing`.

---

## Vault Numbering Fix

### Root Cause
- In Archive/Blueprints pages: `issue.number` from `data.ts` is a zero-padded string ("020") displayed as "Vault #020" — correct.
- In vault-archive page: VaultCard links to `/vault/${vault.id}` where `vault.id` is a raw database integer (e.g. `111222`). No human-readable display number exists.

### Fix
Two parts:
1. **Archive/Blueprints cards**: Display `issue.number` with explicit zero-padding format — ensure it renders as `#001`, not a concatenated string.
2. **VaultCard (vault-archive)**: Add a `displayNumber` field — use the array index + 1 as a display number (e.g. "Vault #1", "Vault #2") since database IDs are not sequential. Format as zero-padded 3-digit string.

---

## Issue Page — Pro/Max Exclusive Sections

The `TierGate` components wrapping Unit Economics, PLG Loops, Compliance Timeline, Hiring Roadmap, Global Arbitrage Map, and Exit Dashboard already exist in `issue.tsx`. Once TierGate is fixed (reads tier from AuthContext), these sections will automatically unlock for Pro/Max users.

No structural changes needed to `issue.tsx` — the fix is entirely in TierGate.

---

## Component Changes Summary

| File | Change |
|------|--------|
| `src/components/TierGate.tsx` | Replace fetch+useState with `useAuth()` from AuthContext |
| `src/App.tsx` | Add `/pricing` route |
| `src/pages/blueprints.tsx` | Full redesign — stage-based layout with inline tools |
| `src/components/VaultCard.tsx` | Add display index number rendering |
| `src/pages/archive.tsx` | Minor — confirm number display is correctly formatted |

---

## What Does NOT Change

- Archive page layout and functionality — stays as a searchable library
- `data.ts` issue data — not modified
- `TierGate` fallback UI — lockout message and styling stays the same
- All other pages

---

## Success Criteria

1. Pro/Max users see unlocked sections on `/issue/:slug` pages without any "Upgrade" prompts
2. Clicking "Upgrade Now" in TierGate navigates to `/pricing` (no 404)
3. Blueprints page has 3 visible build stages + vertical starter kits + inline tools
4. Blueprints and Archive are visually and structurally distinct — different purpose, different layout
5. Vault numbers display as clean sequential or zero-padded strings, never raw database IDs
