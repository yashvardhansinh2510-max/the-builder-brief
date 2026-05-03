# Archive Redesign + Automation Validation — Parallel Design

**Date:** 2026-05-03  
**Status:** Design Phase  
**Scope:** Archive page visual redesign + vault automation system validation

---

## Problem

Archive page lacks depth—doesn't reflect work invested in making it detailed. Users see shallow data display without graphs, trends, signal details, or filtering capability (like ideabrowser.com). Simultaneously, automated vault system (daily monitoring, Friday publishes, notifications) needs validation to confirm jobs actually execute and produce data.

---

## Solution: Parallel Execution

Two independent tracks run simultaneously, converging when both complete.

### Track 1: Archive Page Redesign (Frontend)

**Current state:** Basic list view of vaults  
**Target state:** Rich, interactive dashboard with data visualization and drill-down

#### Components

1. **Data Table**
   - Columns: Vault ID, Created Date, Source Count, Signals Detected, Relevance Score, Last Updated
   - Sortable by all columns
   - Click row to expand inline detail view
   - Pagination for large datasets

2. **Visualization Section**
   - **Trend graph:** Signal volume over time (line chart, 7-day/30-day view)
   - **Source distribution:** Pie or bar chart showing signal sources (Slack, Twitter, News, etc.)
   - **Heatmap:** Signal clusters over time, intensity = detection frequency
   - **Stats cards:** Total vaults, active signals this week, avg confidence score

3. **Filter Panel** (Sidebar)
   - Date range picker (from/to)
   - Source type multiselect (Slack, Twitter, News, etc.)
   - Signal strength slider (0–100)
   - Trend direction toggle (Rising/Stable/Declining)

4. **Drill-Down Detail View** (Inline expansion)
   - Raw signal list with timestamps
   - Signal reasoning/context
   - Confidence scores
   - Source attribution
   - Link to source (Slack thread, tweet, article)

#### Data Flow

```
Backend (existing vault endpoints)
  ↓
API: GET /api/vaults (with filters: dateRange, sourceType, strength, trend)
  ↓
Archive.tsx fetches + caches vault list
  ↓
Components render table, charts, filters
  ↓
User interactions (sort, filter, expand) → re-fetch/re-filter in memory
```

#### Tech Details

- **Charts:** Use existing library (if Recharts/Visx available) or add lightweight alternative
- **Data source:** Existing vault endpoints (`/api/vaults` or equivalent)
- **State:** React hooks + context for filters, sort order, expanded rows
- **Styling:** Match existing design system, responsive (mobile: table collapses to cards, charts stack)

---

### Track 2: Automation Validation (Backend)

**Goal:** Confirm vault processing pipeline executes end-to-end with no silent failures

#### Jobs to Validate

1. **Daily Vault Monitoring Job**
   - Trigger: Manually invoke (or wait for next scheduled run)
   - Check: New signals ingested into `signals` table
   - Verify: Signal data has source, timestamp, metadata populated
   - Success criteria: At least 1 new signal in DB with complete fields

2. **Friday Publish Job**
   - Trigger: Manually invoke (or run on test schedule)
   - Check: Vault marked as `published = true` in DB
   - Check: Email queued in Resend (or delivery logs)
   - Check: Slack message posted (check Slack thread or logs)
   - Success criteria: DB updated + email + Slack all confirmed

3. **Email Notification Service**
   - Trigger: Run publish job
   - Check: Resend API logs for successful sends
   - Check: Email content includes vault title, signals, links
   - Success criteria: Email delivered to test subscriber

4. **Slack Notification Service**
   - Trigger: Run publish job
   - Check: Slack channel for message
   - Verify: Message includes vault summary, signal counts, link
   - Success criteria: Message appears in designated channel

#### Validation Approach

1. **Setup:**
   - Create test vault with synthetic signals in staging DB
   - Identify test email/Slack channel for deliveries
   - Document current job schedules and trigger mechanisms

2. **Execution (per job):**
   - Trigger job manually
   - Wait for completion (check logs for errors)
   - Inspect DB state (new records, updated timestamps)
   - Check external systems (email provider, Slack channel, logs)
   - Document results (working/broken, error messages if any)

3. **Troubleshooting:**
   - If job fails: Check server logs for exceptions
   - If data incomplete: Verify API responses, check service chain
   - If notification missing: Check queue, provider credentials, event listeners

4. **Output:**
   - Results table: Job | Status (✅/❌) | Issue (if any) | Fix needed (Y/N)
   - Prioritize fixes by impact (e.g., missing signals > missing email)

---

## Convergence Point

Once **Track 2 validates that signals are being ingested and published**, Archive page redesign (**Track 1**) has real data to display. If automation finds broken jobs, fixes are prioritized so archive UI consumes accurate, current data.

**Definition of "done":**
- Track 1: Archive page renders all 5 components (table, 3 charts, filters, drill-down) with live vault data
- Track 2: All 4 jobs validated as working; broken ones fixed
- Both: Tested in browser; data flows end-to-end; no console errors

---

## Success Criteria

✅ Archive page shows rich data visualization comparable to ideabrowser.com  
✅ Vault automation jobs execute without silent failures  
✅ Data flows correctly from ingestion → enrichment → publication  
✅ User can filter, sort, drill into vault signals on archive page  
✅ Email and Slack notifications deliver reliably

---

## Out of Scope (Next Phase)

- Landing page improvements
- Free tier dashboard fixes
- Pro tier enhancements
- Max portal refinements

(These follow once archive + automation stable)
