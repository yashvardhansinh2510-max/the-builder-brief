export type Tier = 'free' | 'pro' | 'max';

export const TIER_LIMITS = {
  free: {
    ideaSearchLimit: 10,
    savedIdeasLimit: 3,
    featuresAccess: ['search', 'basic_vault_view'],
    aiAgentAccess: false,
    templateAccess: false,
    coachingAccess: false,
    communityAccess: false,
  },
  pro: {
    ideaSearchLimit: 500,
    savedIdeasLimit: 50,
    featuresAccess: ['search', 'full_vault_view', 'revenue_models', 'sales_scripts', 'checklists'],
    aiAgentAccess: true,
    templateAccess: true, // Landing page, ads, PRD, GTM
    coachingAccess: false,
    communityAccess: false,
  },
  max: {
    ideaSearchLimit: Infinity,
    savedIdeasLimit: Infinity,
    featuresAccess: ['search', 'full_vault_view', 'revenue_models', 'sales_scripts', 'checklists', 'investor_matching', 'cap_table', 'exit_roadmaps', 'founder_network'],
    aiAgentAccess: true,
    templateAccess: true,
    coachingAccess: true, // Monthly 1:1 or group
    communityAccess: true, // Private Slack + monthly calls
  },
};

export const FEATURE_NAMES = {
  search: 'Idea Search',
  basic_vault_view: 'Limited Blueprint Preview',
  full_vault_view: 'Full Blueprint Access',
  revenue_models: 'Revenue Modeling Tool',
  sales_scripts: 'Sales Scripts Library',
  checklists: 'Founder Checklists',
  investor_matching: 'Investor Matching',
  cap_table: 'Cap Table & SAFE Templates',
  exit_roadmaps: 'Exit Playbooks',
  founder_network: 'Co-founder Marketplace',
};

export function hasFeature(userTier: Tier, feature: string): boolean {
  return (TIER_LIMITS[userTier].featuresAccess as string[]).includes(feature);
}

export function canAccessFeature(userTier: Tier, feature: keyof typeof TIER_LIMITS[Tier]): boolean {
  const tier = TIER_LIMITS[userTier];
  return tier[feature as keyof typeof tier] !== false && tier[feature as keyof typeof tier] !== 0;
}
