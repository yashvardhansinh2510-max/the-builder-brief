# Subscribe Celebration + Auth Gate Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Gate `/archive` and `/about` behind Clerk auth, replace the broken NotFound page, and add a full-screen celebration overlay with sound when a user subscribes via email.

**Architecture:** Four focused changes — fix NotFound, add two gated route wrappers in App.tsx, create a standalone `SubscribeSuccessOverlay` component, then wire the overlay into home.tsx and add lock icons to the nav. No API changes, no new dependencies.

**Tech Stack:** React 18, Framer Motion, Clerk React (`Show`), Lucide React, Wouter, Web Audio API (built-in), Tailwind CSS

---

## File Map

| Action | File | Responsibility |
|--------|------|----------------|
| Modify | `src/pages/not-found.tsx` | Branded 404 with "Go home" button |
| Modify | `src/App.tsx` | Add `ArchiveGated` + `AboutGated` wrappers, update routes |
| Create | `src/components/SubscribeSuccessOverlay.tsx` | Celebration overlay: confetti, chime, CTA |
| Modify | `src/pages/home.tsx` | Wire overlay state, add `onSuccess` callbacks, add lock icons |

---

## Task 1: Fix the NotFound Page

**Files:**
- Modify: `src/pages/not-found.tsx`

- [ ] **Step 1: Replace the file content**

Open `src/pages/not-found.tsx` and replace the entire file with:

```tsx
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background text-foreground font-sans flex flex-col items-center justify-center px-6 text-center">
      <p className="font-serif text-8xl md:text-9xl text-primary/20 mb-6 leading-none">404</p>
      <h1 className="font-serif text-3xl md:text-4xl mb-3">This page doesn't exist.</h1>
      <p className="text-muted-foreground mb-8 max-w-xs">
        The link might be broken, or the page may have moved.
      </p>
      <Button className="rounded-full px-8 h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-medium" asChild>
        <Link href="/">Go home</Link>
      </Button>
    </div>
  );
}
```

- [ ] **Step 2: Verify manually**

Start the dev server (`pnpm --filter specflow-newsletter dev`) and navigate to `http://localhost:5173/this-does-not-exist`. You should see the branded 404 with a serif "404" heading and a "Go home" button. No "Did you forget to add the page to the router?" text.

- [ ] **Step 3: Commit**

```bash
git add artifacts/specflow-newsletter/src/pages/not-found.tsx
git commit -m "fix: replace placeholder NotFound with branded 404 page"
```

---

## Task 2: Add Auth Gates to App.tsx

**Files:**
- Modify: `src/App.tsx`

- [ ] **Step 1: Add `ArchiveGated` and `AboutGated` components**

Open `src/App.tsx`. After the closing brace of `IssuePageGated` (around line 147), add:

```tsx
function ArchiveGated() {
  return (
    <>
      <Show when="signed-in">
        <Archive />
      </Show>
      <Show when="signed-out">
        <Redirect to="/sign-in" />
      </Show>
    </>
  );
}

function AboutGated() {
  return (
    <>
      <Show when="signed-in">
        <About />
      </Show>
      <Show when="signed-out">
        <Redirect to="/sign-in" />
      </Show>
    </>
  );
}
```

- [ ] **Step 2: Update the route registrations**

In the `<Switch>` inside `ClerkProviderWithRoutes`, find:

```tsx
<Route path="/archive" component={Archive} />
<Route path="/about" component={About} />
```

Replace with:

```tsx
<Route path="/archive" component={ArchiveGated} />
<Route path="/about" component={AboutGated} />
```

- [ ] **Step 3: Verify manually**

Sign out of the app (or open an incognito window). Navigate to `http://localhost:5173/archive`. You should be redirected to `/sign-in`. Same for `/about`. Then sign in — both pages should load normally.

- [ ] **Step 4: Commit**

```bash
git add artifacts/specflow-newsletter/src/App.tsx
git commit -m "feat: gate /archive and /about behind Clerk auth"
```

---

## Task 3: Create SubscribeSuccessOverlay Component

**Files:**
- Create: `src/components/SubscribeSuccessOverlay.tsx`

- [ ] **Step 1: Create the file**

Create `src/components/SubscribeSuccessOverlay.tsx` with this content:

```tsx
import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "wouter";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";

const CONFETTI_COLORS = ["#E9591C", "#F97316", "#FCD34D", "#FBBF24", "#F5E6D3"];
const PARTICLE_COUNT = 32;

function Confetti() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-3xl">
      {Array.from({ length: PARTICLE_COUNT }).map((_, i) => {
        const angle = (i / PARTICLE_COUNT) * 360;
        const distance = 90 + (i % 5) * 28;
        const size = 5 + (i % 4);
        const color = CONFETTI_COLORS[i % CONFETTI_COLORS.length];
        const tx = Math.cos((angle * Math.PI) / 180) * distance;
        const ty = Math.sin((angle * Math.PI) / 180) * distance - 40;
        return (
          <motion.div
            key={i}
            className="absolute rounded-sm"
            style={{
              top: "50%",
              left: "50%",
              width: size,
              height: size,
              marginLeft: -size / 2,
              marginTop: -size / 2,
              backgroundColor: color,
            }}
            initial={{ x: 0, y: 0, opacity: 1, rotate: 0, scale: 1 }}
            animate={{
              x: tx,
              y: ty,
              opacity: 0,
              rotate: angle * 3,
              scale: 0.4,
            }}
            transition={{
              duration: 0.75 + (i % 3) * 0.15,
              ease: "easeOut",
              delay: 0.08,
            }}
          />
        );
      })}
    </div>
  );
}

function playSuccessChime() {
  try {
    const ctx = new AudioContext();
    // C5, E5, G5
    const notes = [523.25, 659.25, 783.99];
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = "sine";
      osc.frequency.value = freq;
      const t = ctx.currentTime + i * 0.13;
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.18, t + 0.025);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.38);
      osc.start(t);
      osc.stop(t + 0.38);
    });
  } catch {
    // Web Audio not available — silent fail is fine
  }
}

interface SubscribeSuccessOverlayProps {
  onDismiss: () => void;
}

export function SubscribeSuccessOverlay({ onDismiss }: SubscribeSuccessOverlayProps) {
  const played = useRef(false);

  useEffect(() => {
    if (!played.current) {
      played.current = true;
      playSuccessChime();
    }
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onDismiss();
      }}
    >
      <motion.div
        initial={{ scale: 0.82, opacity: 0, y: 28 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 16 }}
        transition={{ type: "spring", stiffness: 320, damping: 26 }}
        className="relative bg-[#F8F4EF] border border-border rounded-3xl p-10 max-w-md w-full text-center overflow-hidden shadow-2xl"
      >
        <Confetti />

        {/* Checkmark circle */}
        <div className="relative z-10 flex justify-center mb-7">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <motion.div
              initial={{ scale: 0, rotate: -30 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 450, damping: 22, delay: 0.18 }}
            >
              <Check className="w-8 h-8 text-primary" strokeWidth={3} />
            </motion.div>
          </div>
        </div>

        <motion.h2
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.28, duration: 0.45 }}
          className="font-serif text-4xl md:text-5xl mb-3 relative z-10"
        >
          You're in.
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.38, duration: 0.45 }}
          className="text-muted-foreground leading-relaxed mb-8 relative z-10 max-w-xs mx-auto"
        >
          Your archive is unlocked. Create your free account to read every blueprint.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.48, duration: 0.45 }}
          className="flex flex-col items-center gap-3 relative z-10"
        >
          <Button
            className="rounded-full h-12 px-8 text-base font-semibold bg-primary hover:bg-primary/90 text-primary-foreground w-full max-w-xs transition-all hover:scale-[1.02] active:scale-[0.98]"
            asChild
          >
            <Link href="/sign-up">Create your account →</Link>
          </Button>
          <button
            onClick={onDismiss}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors py-1"
          >
            I'll do it later
          </button>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
```

- [ ] **Step 2: Verify the file compiles**

Run the dev server and check the browser console for TypeScript errors:

```bash
pnpm --filter specflow-newsletter dev
```

Expected: no errors in terminal or browser console (the component isn't used yet, so it won't render).

- [ ] **Step 3: Commit**

```bash
git add artifacts/specflow-newsletter/src/components/SubscribeSuccessOverlay.tsx
git commit -m "feat: add SubscribeSuccessOverlay with confetti and success chime"
```

---

## Task 4: Wire Overlay + Lock Icons into home.tsx

**Files:**
- Modify: `src/pages/home.tsx`

- [ ] **Step 1: Update imports**

At the top of `src/pages/home.tsx`, make the following changes:

Add `useEffect` to the React import:
```tsx
import { useState, useRef, useEffect } from "react";
```

Add `AnimatePresence` to the framer-motion import:
```tsx
import { motion, useScroll, useTransform, useInView, AnimatePresence } from "framer-motion";
```

Add `Lock` to the lucide-react import block:
```tsx
import {
  ArrowRight, Check, Zap, Target, Compass, BookOpen,
  Code2, DollarSign, Users2, TrendingUp, Lightbulb,
  Rocket, LineChart, Users, Code, AlertCircle, Lock
} from "lucide-react";
```

Add `Show` from Clerk:
```tsx
import { Show } from "@clerk/react";
```

Add the overlay component:
```tsx
import { SubscribeSuccessOverlay } from "@/components/SubscribeSuccessOverlay";
```

- [ ] **Step 2: Add `onSuccess` prop to `HeroSection`**

Find the `HeroSection` function signature (around line 42) and add a prop:

```tsx
function HeroSection({ onSuccess }: { onSuccess: () => void }) {
```

Inside `HeroSection`, after the `useSubscribe` call, add a `useEffect` that fires the callback on success or already-exists:

```tsx
const { status, subscribe } = useSubscribe("hero");
const [email, setEmail] = useState("");

useEffect(() => {
  if (status === "success" || status === "exists") {
    onSuccess();
  }
}, [status, onSuccess]);
```

- [ ] **Step 3: Add `onSuccess` prop to `BottomCTASection`**

Find the `BottomCTASection` function signature and add the same prop:

```tsx
function BottomCTASection({ onSuccess }: { onSuccess: () => void }) {
```

After the `useSubscribe` call in `BottomCTASection`, add the same `useEffect`:

```tsx
const { status, subscribe } = useSubscribe("bottom-cta");
const [email, setEmail] = useState("");

useEffect(() => {
  if (status === "success" || status === "exists") {
    onSuccess();
  }
}, [status, onSuccess]);
```

- [ ] **Step 4: Add overlay state and wiring to the `Home` component**

Find the `Home` export (around line 517). Add state and update the JSX:

```tsx
export default function Home() {
  usePageTracking("/");
  const [showOverlay, setShowOverlay] = useState(false);

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <AnimatePresence>
        {showOverlay && (
          <SubscribeSuccessOverlay onDismiss={() => setShowOverlay(false)} />
        )}
      </AnimatePresence>

      {/* NAV */}
      <motion.nav
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="border-b border-border/40 py-4 px-6 md:px-12 flex justify-between items-center sticky top-0 bg-background/90 backdrop-blur-md z-50"
      >
        <Link href="/" className="flex items-center gap-3">
          <img src={logoPath} alt="The Build Brief" className="w-8 h-8 rounded-sm object-cover" />
          <span className="font-serif text-xl font-medium tracking-tight">The Build Brief</span>
        </Link>
        <div className="flex items-center gap-6">
          <Show when="signed-out">
            <Link href="/archive" className="hidden md:flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
              Archive <Lock className="w-3 h-3 text-muted-foreground/50" />
            </Link>
            <Link href="/about" className="hidden md:flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
              About <Lock className="w-3 h-3 text-muted-foreground/50" />
            </Link>
          </Show>
          <Show when="signed-in">
            <Link href="/archive" className="hidden md:block text-sm text-muted-foreground hover:text-foreground transition-colors">Archive</Link>
            <Link href="/about" className="hidden md:block text-sm text-muted-foreground hover:text-foreground transition-colors">About</Link>
          </Show>
          <Link href="/sign-up">
            <Button
              variant="default"
              className="rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium px-6 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              Subscribe
            </Button>
          </Link>
        </div>
      </motion.nav>

      <main className="pb-24">
        <HeroSection onSuccess={() => setShowOverlay(true)} />
        <StatsBar />
        <BentoSection />
        <ArchivePreviewSection />
        <AudienceSection />
        <BottomCTASection onSuccess={() => setShowOverlay(true)} />
      </main>

      <footer className="border-t border-border/40 py-12 px-6 mt-24">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <Link href="/" className="flex items-center gap-3">
            <img src={logoPath} alt="The Build Brief" className="w-6 h-6 rounded-sm opacity-40 grayscale" />
            <span className="font-serif text-lg text-muted-foreground">The Build Brief</span>
          </Link>
          <div className="flex items-center gap-8 text-sm text-muted-foreground">
            <Link href="/archive" className="hover:text-foreground transition-colors">Archive</Link>
            <Link href="/about" className="hover:text-foreground transition-colors">About</Link>
            <Link href="/sign-in" className="hover:text-foreground transition-colors">Sign in</Link>
          </div>
          <p className="text-sm text-muted-foreground">© {new Date().getFullYear()} The Build Brief</p>
        </div>
      </footer>
    </div>
  );
}
```

- [ ] **Step 5: Verify the full flow manually**

1. Sign out (or use incognito). The home page nav Archive and About links should show a small lock icon.
2. Click Archive — should redirect to `/sign-in`.
3. Click About — should redirect to `/sign-in`.
4. Go back to home, submit a valid email in the hero form.
5. The full-screen celebration overlay should appear: confetti burst, animated checkmark, "You're in." heading, 3-note chime plays.
6. Click "I'll do it later" — overlay dismisses.
7. Submit again with the same email (409 → `exists`) — overlay should still appear.
8. Click "Create your account →" — navigates to `/sign-up`.
9. After signing in, Archive and About links in nav have no lock icons and are accessible.

- [ ] **Step 6: Commit**

```bash
git add artifacts/specflow-newsletter/src/pages/home.tsx
git commit -m "feat: add subscribe celebration overlay and nav lock indicators"
```
