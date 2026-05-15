export interface VaultScore {
  opportunity: number;
  problem: number;
  feasibility: number;
  whyNow: number;
  overall: number;
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
  confidenceScore: number;
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
  scores: VaultScore;
  signalsCount: number;
  signalsSummary: SignalsSummary;
  sourceAttribution: SourceAttribution[];
  daysActive: number;
  momentum: number;
  publishedAt?: Date;
  verificationData?: VerificationStatus;
  tier: 'free' | 'pro' | 'max';
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
  archivedAt?: Date;
  bookmarkCount?: number;
  isBookmarked?: boolean;
  isLocked?: boolean;
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
  category?: string;
  pageSizeOverride?: number;
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
