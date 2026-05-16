import {
  BookOpen,
  Boxes,
  Cpu,
  Flame,
  Layers,
  Map,
  Share2,
  Star,
  Target,
  Terminal,
  TrendingUp,
  Users,
  Zap,
  type LucideIcon,
} from "lucide-react";

export type PortalTab = "intel" | "vault" | "playbook" | "arsenal" | "path" | "alliance";

export type PortalContentTab =
  | PortalTab
  | "performance"
  | "terminal"
  | "growth"
  | "engine"
  | "strategy"
  | "referral";

export interface PortalNavTab {
  id: PortalTab;
  label: string;
}

export interface PortalContentTabDef {
  id: PortalContentTab;
  label: string;
  icon: LucideIcon;
  freeVisible?: boolean;
}

export const PORTAL_NAV_TABS: PortalNavTab[] = [
  { id: "intel", label: "Intel" },
  { id: "vault", label: "Vault" },
  { id: "playbook", label: "Playbook" },
  { id: "arsenal", label: "Arsenal" },
  { id: "path", label: "Path" },
  { id: "alliance", label: "Alliance" },
];

export const PORTAL_CONTENT_TABS: PortalContentTabDef[] = [
  { id: "intel", label: "Intel Feed", icon: Zap, freeVisible: true },
  { id: "playbook", label: "Playbook", icon: BookOpen },
  { id: "path", label: "Foundry Path", icon: Layers, freeVisible: true },
  { id: "vault", label: "Vault Archive", icon: Map, freeVisible: true },
  { id: "alliance", label: "The Alliance", icon: Users },
  { id: "arsenal", label: "Leverage Arsenal", icon: Boxes },
  { id: "performance", label: "Scorecard", icon: TrendingUp, freeVisible: true },
  { id: "terminal", label: "Terminal", icon: Terminal },
  { id: "engine", label: "Engine", icon: Cpu },
  { id: "strategy", label: "Strategy", icon: Target },
  { id: "growth", label: "Viral Growth", icon: Flame },
  { id: "referral", label: "Refer & Earn", icon: Share2 },
];

export const PORTAL_TAB_IDS = PORTAL_CONTENT_TABS.map((tab) => tab.id);

export interface FoundryPathTier {
  title: string;
  sub: string;
  icon: LucideIcon;
  val: string;
  detail: string;
}

export const FOUNDRY_PATH_TIERS: FoundryPathTier[] = [
  {
    title: "Free",
    sub: "Foundations",
    icon: BookOpen,
    val: "Knowledge",
    detail: "Foundational blueprints and weekly market tracking.",
  },
  {
    title: "Pro",
    sub: "Industrial",
    icon: Zap,
    val: "Execution",
    detail: "Premium toolkits, scripts, and private community access.",
  },
  {
    title: "Max",
    sub: "Venture Elite",
    icon: Layers,
    val: "Leverage",
    detail: "Direct advisory, advanced networking, and scaling secrets.",
  },
  {
    title: "Incubator",
    sub: "Alliance",
    icon: Star,
    val: "Partnership",
    detail: "0-to-1 building, equity alignment, and exit strategy.",
  },
];
