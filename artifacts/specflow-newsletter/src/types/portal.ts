// Portal-related types for user/max/pro portal state.
// Many of these mirror API response shapes returned by the api-server
// and the static fallback data shipped in src/lib/*.

import type { Lesson } from "@/lib/playbook";

// Daily Drop content (matches the static DailyEdge shape from lib/daily.ts).
// Kept structurally compatible with DailyEdge so the two can be used
// interchangeably (e.g. `dailyDrop || getDailyEdge()`).
export interface DailyDrop {
  title: string;
  category: string;
  categoryIcon: string;
  value: string;
  content: string;
  actionLabel: string;
  pillar:
    | "startup"
    | "mental"
    | "physical"
    | "entrepreneur"
    | "scaling"
    | "endurance"
    | "friday";
  source?: string;
}

// Playbook module fetched from the API or sourced from lib/playbook.ts
export interface PlaybookModule {
  id?: string;
  slug?: string;
  title: string;
  description: string;
  tagline?: string;
  lessons: Lesson[];
}

// Founder wall / alliance member.
// A union of fields from the API (`/api/walls`) and the static
// fallback in lib/alliance.ts. Fields are loose because not every
// source emits the full shape.
export interface WallMember {
  id: string;
  name: string;
  role?: string;
  startupName?: string;
  sector?: string;
  stage?: string;
  status: string;
  specialty?: string;
  currentVenture?: string;
  joined?: string;
  bio?: string;
  links?: { name: string; url: string }[];
  skills?: string[];
  avatar?: string;
  avatarUrl?: string;
  linkedinUrl?: string;
  twitterUrl?: string;
  githubUrl?: string;
  websiteUrl?: string;
  isVisible?: boolean;
  isFeatured?: boolean;
  lookingFor?: string[];
}

// Referral / growth panel data
export interface ReferralReward {
  name: string;
  unlocked: boolean;
}

export interface ReferralData {
  referralCode: string;
  referralCount: number;
  shareUrl: string;
  rewards?: ReferralReward[];
}

// Marketplace product (Premium Blueprints) from /api/marketplace/products
export interface MarketplaceProduct {
  id: string;
  name: string;
  description?: string;
  category: string;
  price: number;
  priceUsd?: number;
  thumbnail?: string;
}

// A purchase record from /api/marketplace/my-purchases
export interface OwnedProduct {
  id?: string;
  productId: string;
  purchasedAt?: string;
}

// Scorecard result from /api/scorecard/me
export interface ScorecardRoadmapStep {
  day: number;
  task: string;
  completed?: boolean;
}

export interface Scorecard {
  score: number;
  verdict: string;
  breakdown: Record<string, number>;
  roadmap: ScorecardRoadmapStep[];
}

// Investor match for max-portal
export interface InvestorMatch {
  id: string;
  firmName: string;
  matchScore: number;
  stageAlignment?: string;
  ticketSize?: string;
  bio?: string;
}
