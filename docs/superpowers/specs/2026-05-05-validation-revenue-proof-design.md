# Validation with Revenue Proof — Phase 1 Design

**Date:** 2026-05-05  
**Feature:** Validation with Revenue Proof  
**Scope:** Phase 1 of The Build Brief roadmap  
**Status:** Design approved, ready for implementation

---

## Overview

Blueprint creators can add real traction/revenue data to their blueprints to prove execution. This proof-of-concept differentiates "theory" blueprints from "proven in market" blueprints, building credibility and incentivizing creator upgrades to Pro tier.

**Key outcomes:**
- Creators (Pro+ tier) add MRR, users, growth rate to blueprints
- Readers see proof-of-execution on blueprint detail pages
- Archive page can filter to show only "proven" blueprints
- Non-creators see traction data (builds trust), but cannot edit

---

## Data Model

### Blueprint Traction Structure

Embed traction object directly in each blueprint (issue) object in `data.ts`:

```typescript
interface BlueprintTraction {
  status: "added" | "pending" | "archived"
  mrr?: number              // Monthly recurring revenue, USD
  arr?: number              // Annual recurring revenue, USD (optional, calculated from MRR if not provided)
  users?: number            // Total active customers/users
  monthsSinceLaunch?: number // Integer, >= 1
  growthRate?: number       // Month-over-month percentage (0-100)
  addedAt: string           // ISO 8601 timestamp
  lastUpdated: string       // ISO 8601 timestamp
  notes?: string            // Creator's narrative (max 500 chars)
}

// Optional field on Issue type
traction?: BlueprintTraction
```

### Validation (Zod Schema)

```typescript
const tractioinSchema = z.object({
  status: z.enum(["added", "pending", "archived"]),
  mrr: z.number().min(0).optional(),
  arr: z.number().min(0).optional(),
  users: z.number().int().min(1).optional(),
  monthsSinceLaunch: z.number().int().min(1),
  growthRate: z.number().min(0).max(100).optional(),
  addedAt: z.string().datetime(),
  lastUpdated: z.string().datetime(),
  notes: z.string().max(500).optional(),
})
```

**Invariants:**
- If `status === "added"`, at least one metric (MRR, ARR, or users) must be provided
- `monthsSinceLaunch` required (defines how mature the execution is)
- `lastUpdated` >= `addedAt` (auditing)

---

## UI/UX Changes

### 1. Issue Detail Page (`issue.tsx`)

**New Section: Traction Proof**

Location: Below "Unit Economics" section, above fold on desktop.

**Rendering logic:**
```typescript
{issue.traction?.status === "added" && (
  <TractioinProofSection traction={issue.traction} />
)}
```

**Display format:**
- Heading: "🚀 Traction Proof" (emoji badges existing pattern)
- Four metric cards (matching existing metric card styles):
  - **MRR:** `$${traction.mrr?.toLocaleString()}` (if provided)
  - **Active Users:** `${traction.users?.toLocaleString()} customers`
  - **Growth Rate:** `${traction.growthRate}% MoM`
  - **Live Since:** `${traction.monthsSinceLaunch} months ago`
- Small text: "Last updated: [date]"
- If notes exist, show in smaller text below metrics

**Styling:** Use existing `bg-card`, `border-border`, rounded `xl` corners. Colors: primary accent for numbers (matching current "View Playbook" button style).

### 2. Creator Traction Dashboard (`/creator/traction` new page)

**Route:** `/creator/traction`  
**Auth:** verifyUser + TierGate("pro")

**Form structure:**
```
[Heading] Add Traction to Your Blueprint

[Card: Featured Blueprint Name]
  (shows creator's featured/latest blueprint)

[Form Fields]
  - Monthly Recurring Revenue (optional): _____ USD
  - Annual Recurring Revenue (optional): _____ USD
  - Active Users/Customers (optional): _____
  - Months Since Launch (required): _____ 
  - Month-over-Month Growth Rate (optional): ______ %
  - Notes (optional, max 500 chars): [textarea]

[Buttons]
  [Cancel] [Save Traction Data]

[Status message]
  "Last updated: [date]" (if traction exists)
  "Upgrade to Pro" (if user < Pro tier)
```

**Validation on submit:**
- monthsSinceLaunch: required, must be integer >= 1
- At least one metric (MRR/ARR/users) required
- Growth rate: 0-100 only
- Notes: max 500 chars
- Show field-level errors inline

**Success flow:**
- POST to `/api/blueprints/:slug/traction`
- On success: toast notification "Traction updated"
- Redirect to `/issue/:slug` to see live update

### 3. Archive Page Filter (optional enhancement)

**Add to archive.tsx:**
- New filter toggle: "📈 Show only blueprints with traction proof"
- Filter logic: `issue.traction?.status === "added"`
- Counts: display "X blueprints have proven traction"

---

## API Endpoints

### POST `/api/blueprints/:slug/traction`

**Purpose:** Create or update traction data for a blueprint

**Auth:** Requires `verifyUser` middleware + creator ownership validation

**Request body:**
```json
{
  "mrr": 5000,
  "users": 150,
  "monthsSinceLaunch": 8,
  "growthRate": 12,
  "notes": "Launched quietly in stealth mode, steady organic growth"
}
```

**Validation:**
- User must be authenticated
- User ID must match blueprint creator
- Payload must pass tractioinSchema validation
- monthsSinceLaunch required (integer >= 1)
- At least one metric (MRR, ARR, users) must be present

**Response (201 Created):**
```json
{
  "success": true,
  "traction": {
    "status": "added",
    "mrr": 5000,
    "users": 150,
    "monthsSinceLaunch": 8,
    "growthRate": 12,
    "addedAt": "2026-05-05T14:30:00Z",
    "lastUpdated": "2026-05-05T14:30:00Z"
  }
}
```

**Error responses:**
- 400: Missing required fields, invalid data (monthsSinceLaunch not integer, growthRate > 100, no metrics provided)
- 401: User not authenticated
- 403: User is not the blueprint creator
- 404: Blueprint not found
- 500: Server error

**Implementation location:** `routes/blueprints.ts`

---

### GET `/api/blueprints/:slug/traction`

**Purpose:** Fetch traction data for a blueprint (public read)

**Auth:** None required (public endpoint)

**Response (200 OK):**
```json
{
  "slug": "medtranslate-pro",
  "traction": {
    "status": "added",
    "mrr": 5000,
    "users": 150,
    "monthsSinceLaunch": 8,
    "growthRate": 12,
    "addedAt": "2026-05-05T14:30:00Z",
    "lastUpdated": "2026-05-05T14:30:00Z"
  }
}
```

**If no traction exists:**
```json
{
  "slug": "medtranslate-pro",
  "traction": null
}
```

**Error responses:**
- 404: Blueprint not found

**Implementation location:** `routes/blueprints.ts`

---

## Access Control & Tier Gating

**Creating/editing traction:**
- Requires Pro tier minimum (`TierGate` wrapper on form)
- Requires creator ownership (POST endpoint validates `req.user?.id === issue.creatorId`)
- Creates monetization lever: encourages free users to upgrade

**Reading traction:**
- Public (no auth required)
- Builds trust/credibility for that blueprint with all readers

**Deleting traction:**
- Out of scope for Phase 1
- Workaround: set `status: "archived"` instead
- Phase 2 can add full delete if needed

---

## Database & Storage

**Phase 1:** Store traction in `data.ts` memory (alongside blueprint data)

**Later migration path:** 
- Create `blueprint_traction` table (one-to-one with blueprints)
- Update schema if traction becomes heavy (uploads, history, comments)
- For now: embed to keep changes minimal

---

## Error Handling

All errors logged via existing logger instance.

**Validation errors:**
- Missing monthsSinceLaunch → 400 "monthsSinceLaunch is required"
- Invalid growthRate (> 100) → 400 "Growth rate must be 0-100%"
- No metrics provided → 400 "Provide at least MRR, ARR, or user count"
- Invalid data types → 400 with field name

**Authorization errors:**
- User not authenticated → 401 "Authentication required"
- User not creator → 403 "Only the blueprint creator can update traction"
- Insufficient tier (not Pro+) → 403 "Upgrade to Pro tier to add traction proof"

**Not found errors:**
- Blueprint slug doesn't exist → 404 "Blueprint not found"

**Server errors:**
- Database/query failures → 500 "Failed to save traction data" (log details)

---

## Testing

**Unit tests (Zod schema):**
- Valid traction object passes validation
- Invalid growthRate (101) fails
- Missing monthsSinceLaunch fails
- Valid data with optional fields passes

**Integration tests:**
- POST creates traction, GET returns it
- Creator can POST, non-creator gets 403
- Non-Pro tier POST returns 403
- Invalid blueprint slug returns 404
- Subsequent POST updates lastUpdated timestamp

**UI/E2E tests:**
- Traction section renders only if status === "added"
- Form submits valid data, redirects to issue page
- Archive filter works (shows/hides blueprints with traction)
- Tier gate shows upgrade prompt if user < Pro

---

## Implementation Order

1. Add traction field + schema to `data.ts`
2. Create `routes/blueprints.ts` with POST/GET endpoints
3. Create `TractioinProofSection` component in `issue.tsx`
4. Create `/creator/traction` dashboard page
5. Update `archive.tsx` with optional filter
6. Register route in `routes/index.ts`
7. Wire up TierGate on form
8. End-to-end test: creator adds traction → readers see it

---

## Success Criteria

- ✅ Creator can add traction data via form
- ✅ Traction data persists and displays on blueprint detail page
- ✅ Only Pro+ tier can add traction (tier gate enforced)
- ✅ Archive can filter by "has traction"
- ✅ API validates data (monthsSinceLaunch, growthRate, metrics)
- ✅ Error handling shows meaningful messages
- ✅ Public can read, only creator can edit
