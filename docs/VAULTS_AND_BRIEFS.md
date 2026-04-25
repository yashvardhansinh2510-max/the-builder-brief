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
  "contextStyle": "detailed"
}
```

### GET /api/vaults
List all published vaults (latest 10).

**Auth:** None
**Response:** Array of vault objects

### GET /api/vaults/:id
Get specific vault.

**Auth:** None

### POST /api/vaults/:id/publish
Publish a vault (admin only).

**Auth:** Admin Bearer token
**Response:** Updated vault object

## Scheduling

- **Daily Briefs:** Generated at 6 AM UTC every day for Pro/Max users
- **Weekly Vaults:** Generated every Friday at 8 AM UTC

## Model

Uses OpenAI gpt-4-mini for reasoning and content generation.
