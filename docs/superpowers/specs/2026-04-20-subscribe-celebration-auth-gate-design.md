# Subscribe Celebration + Auth Gate Design

**Date:** 2026-04-20  
**Status:** Approved

---

## Problem

1. Email subscription has no satisfying confirmation UX — button text changes to "Subscribed" and that's it.
2. `/archive` and `/about` are publicly accessible — any visitor can browse past issues without subscribing or signing in.
3. The NotFound page is a placeholder card with a developer-facing message, not a user-facing 404.

---

## Goals

- Make email submission feel rewarding: animation, sound, and a clear next step.
- Gate `/archive` and `/about` behind Clerk authentication.
- Fix the NotFound page to be on-brand and navigable.
- Hint in the nav that Archive and About are locked for signed-out users.

---

## Architecture

### 1. Routing Changes (`App.tsx`)

Two new gated wrapper components, following the existing pattern of `UserPortalPage` and `IssuePageGated`:

```tsx
function ArchiveGated() {
  return (
    <>
      <Show when="signed-in"><Archive /></Show>
      <Show when="signed-out"><Redirect to="/sign-in" /></Show>
    </>
  );
}

function AboutGated() {
  return (
    <>
      <Show when="signed-in"><About /></Show>
      <Show when="signed-out"><Redirect to="/sign-in" /></Show>
    </>
  );
}
```

Routes updated:
- `/archive` → `ArchiveGated`
- `/about` → `AboutGated`

### 2. Subscribe Success Overlay (`SubscribeSuccessOverlay`)

New component in `src/components/SubscribeSuccessOverlay.tsx`.

**Trigger:** Rendered when `useSubscribe` returns `status === "success"` OR `status === "exists"`. Both states show the overlay — existing subscribers deserve the same celebration.

**Visual structure:**
- Fixed full-screen backdrop: `bg-black/60 backdrop-blur-sm`
- Center card (max-w-md, rounded-2xl, brand background):
  - Animated SVG checkmark (stroke-dashoffset animation, 600ms)
  - Confetti burst: ~30 CSS-animated particles, brand orange `#E9591C` and warm accent colors, radiate outward on mount
  - Headline: `"You're in."` — serif, ~3rem
  - Subline: `"Your archive is unlocked. Create your free account to read every blueprint."`
  - Primary CTA: `"Create your account →"` — links to `/sign-up`, primary button style
  - Dismiss: `"I'll do it later"` — small muted text link, closes overlay

**Sound:**
- Web Audio API, synthesized (no audio file needed)
- 3-note ascending chime: C5 → E5 → G5, each 120ms, sine wave, soft gain envelope
- Fires on overlay mount, after user interaction (no autoplay block)

**State management:**
- `home.tsx` holds `showOverlay` boolean state
- Set to `true` when `status` transitions to `"success"` or `"exists"` in either the hero or bottom-CTA form
- Overlay dismissed by clicking CTA or "I'll do it later"
- `useSubscribe` hook unchanged — overlay is purely presentational

### 3. Nav Lock Indicators (`home.tsx`)

In the home page nav, Archive and About links conditionally show a `Lock` icon (Lucide, 12px, muted) next to the label for signed-out users.

```tsx
<Show when="signed-out">
  <Link href="/archive">Archive <Lock className="w-3 h-3 inline ml-1 text-muted-foreground/60" /></Link>
  <Link href="/about">About <Lock className="w-3 h-3 inline ml-1 text-muted-foreground/60" /></Link>
</Show>
<Show when="signed-in">
  <Link href="/archive">Archive</Link>
  <Link href="/about">About</Link>
</Show>
```

Scope: home page nav only. Archive and About pages' own navs are unaffected (signed-out users can't reach them).

### 4. NotFound Page

Replace the placeholder card with a branded page:
- Full-screen, matches site background
- Serif `"404"` heading
- Subline: `"This page doesn't exist."`
- Button: `"Go home"` → links to `/`
- No "Did you forget to add the page to the router?" copy

---

## Files Changed

| File | Change |
|------|--------|
| `src/App.tsx` | Add `ArchiveGated`, `AboutGated`; update route registrations |
| `src/pages/home.tsx` | Add overlay state, `showOverlay` trigger, lock icons in nav |
| `src/components/SubscribeSuccessOverlay.tsx` | New component |
| `src/pages/not-found.tsx` | Replace content |

No API changes. No changes to `useSubscribe` hook logic.

---

## Out of Scope

- Email pre-fill in Clerk sign-up form (Clerk doesn't support this via URL params)
- Changes to Archive or About page navs
- Any backend changes
