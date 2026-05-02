/**
 * Vault Data Types
 * Core TypeScript interfaces for the AI-automated vault system
 */

export interface VaultScore {
  opportunity: number; // 0-100
  problem: number; // 0-100
  feasibility: number; // 0-100
  whyNow: number; // 0-100
  overall: number; // 0-100 (weighted average)
}

export interface SignalsSummary {
  reddit: string[];
  youtube: string[];
  hn: string[];
  ph: string[];
  linkedin: string[];
  twitter: string[];
}

export interface SourceAttribution {
  source: 'reddit' | 'youtube' | 'hn' | 'ph' | 'linkedin' | 'twitter' | 'trends';
  url?: string;
  metric?: string;
  value?: string | number;
}

export interface VerificationStatus {
  marketSizeVerified: 'verified' | 'unconfirmed' | 'contradicted';
  tamVerified: 'verified' | 'unconfirmed' | 'contradicted';
  unitEconomicsVerified: 'verified' | 'unconfirmed' | 'contradicted';
  confidenceScore: number; // 0-100
  issues: string[];
}

export interface Vault {
  id: string;
  title: string;
  tagline: string;
  problemStatement: string;
  description?: string;
  marketSize?: string;
  tam?: string;
  unitEconomics?: string;
  keywordsTrending?: string[];

  // Scores
  scores: VaultScore;

  // Signals
  signalsCount: number;
  signalsSummary: SignalsSummary;
  sourceAttribution: SourceAttribution[];

  // Tracking
  daysActive: number;
  momentum: number; // 0-100, calculated from signal growth
  publishedAt?: Date;
  verificationData?: VerificationStatus;

  // Metadata
  tier: 'free' | 'pro' | 'max'; // which tier receives this
  createdAt: Date;
  updatedAt: Date;
  archivedAt?: Date;
}

export interface VaultCandidate extends Omit<Vault, 'id' | 'publishedAt'> {
  id?: string;
  lastSeenAt?: Date;
  published: boolean;
}

export interface VaultFilter {
  tier?: 'free' | 'pro' | 'max';
  minScore?: number;
  maxScore?: number;
  dateFrom?: Date;
  dateTo?: Date;
  signalsMinCount?: number;
  searchQuery?: string;
  sortBy?: 'score' | 'momentum' | 'recent' | 'signals';
  sortOrder?: 'asc' | 'desc';
}

export interface VaultListResponse {
  vaults: Vault[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

export interface VaultDetailResponse {
  vault: Vault;
  relatedVaults: Vault[];
  userFeedback?: {
    liked: boolean;
    shared: boolean;
    saved: boolean;
  };
}
