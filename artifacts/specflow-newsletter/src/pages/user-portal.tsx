import { useState, useEffect } from "react";
import logoPath from "@assets/logo.jpg";
import { useAuth } from "@/lib/AuthContext";
import { useClerk } from "@clerk/react";
import { useSubscriberCount } from "@/hooks/useSubscriberCount";
import FounderChat from "@/components/FounderChat";
import Footer from "@/components/Footer";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useLocation } from "wouter";
import {
  BookOpen,
  ArrowRight,
  Zap,
  Lock,
  TrendingUp,
  Trophy,
  Star,
  ShieldCheck,
  Map,
  X,
  Layers,
  CheckCircle,
  Info,
  Terminal,
  Copy,
  Flame,
  Sparkles,
  ExternalLink,
  Cpu,
  Globe,
  Users as UsersIcon,
  Shield,
  Activity,
  Database,
  Boxes,
  Target,
} from "lucide-react";
import { typedIssues as issues, Issue } from "@/lib/data";
import { projections, type IntelligenceProjection } from "@/lib/data/projections";
import { playbookModules, type Lesson } from "@/lib/playbook";
import type { Tool } from "@/lib/arsenal";
import type {
  DailyDrop,
  PlaybookModule,
  WallMember,
  ReferralData,
  MarketplaceProduct,
  OwnedProduct,
  Scorecard,
} from "@/types/portal";
import { featuredVentures } from "@/lib/ventures";
import { roadmapSteps } from "@/lib/roadmap";
import {
  getDailyEdge,
  getFridayDropProgress,
  getFridayDropTeaser,
} from "@/lib/daily";

import {
  milestoneRewards,
  getEligibleReward,
  getNextReward,
  Reward,
} from "@/lib/rewards";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Globe as CobeGlobe } from "@/components/ui/cobe-globe";
import { allianceMembers } from "@/lib/alliance";
import { arsenalTools } from "@/lib/arsenal";
import PortalNav from "@/components/PortalNav";
import {
  getStartupContext,
  saveStartupContext,
  type StartupContext,
} from "@/lib/startup-context";
import StartupContextModal from "@/components/StartupContextModal";
import ContextManager from "@/components/ContextManager";
import MarketPulseFeed from "@/components/MarketPulseFeed";
import { usePayments } from "@/lib/usePayments";
import WelcomeHero from "@/components/portal/WelcomeHero";
import PlaybookTab from "@/components/portal/PlaybookTab";
import VaultTab from "@/components/portal/VaultTab";
import IntelligenceFeed from "@/components/portal/IntelligenceFeed";
import PathTab from "@/components/portal/PathTab";
import AllianceTab from "@/components/portal/AllianceTab";
import ArsenalTab from "@/components/portal/ArsenalTab";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      delay: i * 0.06,
      ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number],
    },
  }),
};

export default function UserPortal() {
  // ── GLOBAL AUTH & TIER (resolved once in AuthContext) ──
  const { session, tier, isPremium } = useAuth();
  const { signOut } = useClerk();
  const [, setLocation] = useLocation();
  const user = session?.user;
  const firstName =
    user?.user_metadata?.full_name?.split(" ")[0] ||
    user?.email?.split("@")[0] ||
    "Reader";
  const isPro = isPremium; // alias for existing code
  const subscriberCount = useSubscriberCount();
  const [chatUsageThisMonth, setChatUsageThisMonth] = useState(0);
  const [dailyDrop, setDailyDrop] = useState<DailyDrop | null>(null);
  const [playbookData, setPlaybookData] = useState<PlaybookModule[]>([]);
  const [wallMembers, setWallMembers] = useState<WallMember[]>([]);
  const [myWallProfile, setMyWallProfile] = useState<WallMember | null>(null);
  const [referralData, setReferralData] = useState<ReferralData | null>(null);
  const [personalizedBrief, setPersonalizedBrief] = useState<string | null>(
    null,
  );
  const [products, setProducts] = useState<MarketplaceProduct[]>([]);
  const [ownedProducts, setOwnedProducts] = useState<OwnedProduct[]>([]);
  const [scorecard, setScorecard] = useState<Scorecard | null>(null);

  // Local state
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [showPortfolioModal, setShowPortfolioModal] = useState(false);
  const [streak, setStreak] = useState(0);
  const [activeProjection, setActiveProjection] = useState(projections[0].id);
  const [hasClaimedDaily, setHasClaimedDaily] = useState(false);
  const [deployedArsenal, setDeployedArsenal] = useState<string[]>([]);
  const [selectedMember, setSelectedMember] = useState<WallMember | null>(null);
  const [selectedTool, setSelectedTool] = useState<Tool | null>(null);
  const [isDeploying, setIsDeploying] = useState(false);
  const [showJoinAlliance, setShowJoinAlliance] = useState(false);
  const [allianceJoinData, setAllianceJoinData] = useState<Partial<WallMember>>(
    {},
  );

  // Sync portal state to backend
  const syncPortalState = (newState: any) => {
    const token = session?.access_token;
    if (token) {
      fetch("/api/subscribers/me/sync", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ portalState: newState }),
      }).catch(() => {});
    }
  };

  // Load persisted portal state (streak, steps, etc.) — NOT tier (that's in AuthContext now)
  useEffect(() => {
    const token = session?.access_token;
    if (token) {
      fetch(`/api/subscribers/me`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (!data) return;
          if (data.portalState) {
            setStreak(data.portalState.streak || 0);
            setCompletedSteps(data.portalState.completedSteps || []);
            setIsBonusUnlocked(
              data.portalState.unlockedItems?.includes("master-blueprint") ||
                false,
            );
            setDeployedArsenal(data.portalState.deployedArsenal || []);
            const today = new Date().toDateString();
            if (data.portalState.lastVisit === today) setHasClaimedDaily(true);
            const monthKey = new Date().toISOString().slice(0, 7);
            setChatUsageThisMonth(data.portalState.chatUsage?.[monthKey] || 0);
          }
          // Fetch dynamic content
          fetch("/api/content/daily")
            .then((res) => (res.ok ? res.json() : null))
            .then(setDailyDrop);
          fetch("/api/content/playbook")
            .then((res) => (res.ok ? res.json() : null))
            .then(setPlaybookData);
          fetch("/api/walls")
            .then((res) => (res.ok ? res.json() : null))
            .then((data) => data?.data && setWallMembers(data.data));
          fetch("/api/walls/me", {
            headers: { Authorization: `Bearer ${session?.access_token}` },
          })
            .then((res) => (res.ok ? res.json() : null))
            .then(setMyWallProfile);
          fetch("/api/referrals/me", {
            headers: { Authorization: `Bearer ${session?.access_token}` },
          })
            .then((res) => (res.ok ? res.json() : null))
            .then(setReferralData);

          // Personalize Drop
          fetch("/api/content/daily/personalize", {
            method: "POST",
            headers: { Authorization: `Bearer ${session?.access_token}` },
          })
            .then((res) => (res.ok ? res.json() : null))
            .then(
              (data) => data && setPersonalizedBrief(data.personalizedBrief),
            );

          fetch("/api/marketplace/products")
            .then((res) => (res.ok ? res.json() : []))
            .then(setProducts);
          fetch("/api/marketplace/my-purchases", {
            headers: { Authorization: `Bearer ${session?.access_token}` },
          })
            .then((res) => (res.ok ? res.json() : []))
            .then(setOwnedProducts);

          fetch("/api/scorecard/me", {
            headers: { Authorization: `Bearer ${session?.access_token}` },
          })
            .then((res) => (res.ok ? res.json() : null))
            .then(setScorecard);

          // Resolve startup context: DB first, then localStorage
          if (data.whatBuilding) {
            const dbCtx: StartupContext = {
              whatBuilding: data.whatBuilding,
              stage:
                (data.startupStage as StartupContext["stage"]) || "pre-revenue",
              sector:
                (data.startupSector as StartupContext["sector"]) || "B2B SaaS",
              targetCustomer: data.targetCustomer || "",
              biggestChallenge:
                (data.biggestChallenge as StartupContext["biggestChallenge"]) ||
                "Distribution",
              updatedAt: data.contextUpdatedAt || new Date().toISOString(),
            };
            setStartupCtx(dbCtx);
            saveStartupContext(dbCtx);
          } else {
            const local = getStartupContext();
            if (local) setStartupCtx(local);
          }
          setContextChecked(true);
        })
        .catch(() => {});
    }
  }, [session]);

  const dailyEdge = dailyDrop || getDailyEdge();
  const activePlaybook =
    playbookData.length > 0 ? playbookData : playbookModules;
  const activeAlliance = wallMembers.length > 0 ? wallMembers : allianceMembers;

  const { initiatePayment } = usePayments();
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [startupCtx, setStartupCtx] = useState<StartupContext | null>(null);
  const [showContextModal, setShowContextModal] = useState(false);
  const [contextChecked, setContextChecked] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [showLoginBonus, setShowLoginBonus] = useState(false);
  const [isBonusUnlocked, setIsBonusUnlocked] = useState(false);
  const [activeTab, setActiveTab] = useState<
    | "playbook"
    | "path"
    | "vault"
    | "alliance"
    | "arsenal"
    | "performance"
    | "terminal"
    | "growth"
    | "engine"
    | "strategy"
  >(tier === "free" ? "performance" : "playbook");
  const [terminalHistory, setTerminalHistory] = useState<
    { type: "cmd" | "out"; text: string }[]
  >([]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tab = params.get("tab");
    if (
      tab &&
      [
        "playbook",
        "path",
        "vault",
        "alliance",
        "arsenal",
        "performance",
        "terminal",
        "engine",
        "growth",
        "strategy",
      ].includes(tab)
    ) {
      setActiveTab(tab as any);
    }
  }, []);

  // Live telemetry from real API
  const [telemetryLogs, setTelemetryLogs] = useState<string[]>([]);
  const [engineBusy, setEngineBusy] = useState(false);
  const [milestoneBusy, setMilestoneBusy] = useState(false);

  useEffect(() => {
    const buildLogs = (total: number, week: number) => [
      `Signal loaded. ${total.toLocaleString()} founders active on the platform.`,
      `${week} new members joined the Foundry this week.`,
      `Friday drop: ${getFridayDropProgress()}% complete. Release confirmed.`,
      `System uptime: 99.9%. All modules operational.`,
      `Intelligence Engine: active. Awaiting context payload.`,
    ];

    // Fetch real stats first
    fetch("/api/subscribers/stats")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        const logs = data
          ? buildLogs(data.total, data.weekSignups)
          : buildLogs(0, 0);
        let i = 0;
        const interval = setInterval(() => {
          setTelemetryLogs((prev) => [
            ...prev.slice(-4),
            logs[i % logs.length],
          ]);
          i++;
        }, 4000);
        return () => clearInterval(interval);
      })
      .catch(() => {
        // Fallback with system-level truths
        const fallback = [
          "Signal loaded. Platform is operational.",
          `Friday drop: ${getFridayDropProgress()}% complete.`,
          "Intelligence Engine active. Awaiting context.",
          "System uptime: 99.9%.",
        ];
        let i = 0;
        const interval = setInterval(() => {
          setTelemetryLogs((prev) => [
            ...prev.slice(-4),
            fallback[i % fallback.length],
          ]);
          i++;
        }, 4000);
        return () => clearInterval(interval);
      });
  }, []);

  const eligibleReward = getEligibleReward(streak);
  const nextReward = getNextReward(streak);

  useEffect(() => {
    // Login Bonus logic
    const today = new Date().toDateString();
    const hasClaimedToday = localStorage.getItem("loginBonus_" + today);
    const bonusUnlocked = localStorage.getItem("isBonusUnlocked") === "true";

    setIsBonusUnlocked(bonusUnlocked);

    if (!hasClaimedToday) {
      setTimeout(() => {
        setShowLoginBonus(true);
        // High-end digital unlock chime
        const audio = new Audio("/chime.mp3");
        audio.volume = 0.2;
        audio.play().catch((e) => console.log("Audio requires interaction"));
      }, 1500);
    }
  }, []);

  const claimLoginBonus = () => {
    localStorage.setItem("loginBonus_" + new Date().toDateString(), "true");
    localStorage.setItem("isBonusUnlocked", "true");
    setIsBonusUnlocked(true);
    setShowLoginBonus(false);
    toast.success("Strategic Vault Unlocked", {
      description:
        "Access Granted to 'The 90-Day Master Blueprint' in your Vault Archive.",
    });
  };

  useEffect(() => {
    // Basic streak logic
    const lastVisit = localStorage.getItem("lastVisit");
    const currentStreak = parseInt(localStorage.getItem("streak") || "0");
    const today = new Date().toDateString();

    if (lastVisit === today) {
      setStreak(currentStreak);
      setHasClaimedDaily(true);
    } else {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      if (lastVisit === yesterday.toDateString()) {
        const newStreak = currentStreak + 1;
        setStreak(newStreak);
        localStorage.setItem("streak", newStreak.toString());
      } else {
        setStreak(1);
        localStorage.setItem("streak", "1");
      }
      localStorage.setItem("lastVisit", today);
      setHasClaimedDaily(false);
    }
  }, []);

  // Context resolved in subscriber fetch effect — no separate effect needed

  const handleSignOut = () => signOut(() => setLocation("/"));

  const handleUpgradeClick = () => {
    setShowUpgradeModal(true);
  };

  const toggleStep = (title: string) => {
    const newSteps = completedSteps.includes(title)
      ? completedSteps.filter((s) => s !== title)
      : [...completedSteps, title];

    setCompletedSteps(newSteps);

    if (!completedSteps.includes(title)) {
      toast.success("Focus locked!", {
        description: `You've completed the ${title} stage. Keep pushing.`,
      });
    }

    syncPortalState({
      streak,
      lastVisit: new Date().toDateString(),
      unlockedItems: isBonusUnlocked ? ["master-blueprint"] : [],
      completedSteps: newSteps,
      deployedArsenal,
    });
  };

  const copyHack = () => {
    navigator.clipboard.writeText(dailyEdge.content);
    toast.success("Tactic Copied", {
      description: "Ready to deploy. Go build.",
    });
  };

  const handleLessonOpen = (lesson: Lesson) => {
    if (lesson.free || isPro) {
      setSelectedLesson(lesson);
    } else {
      handleUpgradeClick();
    }
  };

  const claimReward = (reward: Reward) => {
    toast.success(`${reward.title} Claimed`, {
      description: "Check your email. This one's worth the read.",
    });
  };

  const handleDeploy = (tool: any) => {
    if (deployedArsenal.includes(tool.id)) {
      toast.info("Already Integrated", {
        description: `${tool.name} is already active in your stack.`,
      });
      return;
    }

    setIsDeploying(true);
    setSelectedTool(tool);

    setTimeout(() => {
      const newDeployed = [...deployedArsenal, tool.id];
      setDeployedArsenal(newDeployed);
      setIsDeploying(false);
      toast.success("Stack Deployed", {
        description: `${tool.name} architecture has been injected into your current build.`,
      });

      syncPortalState({
        streak,
        lastVisit: new Date().toDateString(),
        unlockedItems: isBonusUnlocked ? ["master-blueprint"] : [],
        completedSteps,
        deployedArsenal: newDeployed,
      });
    }, 2000);
  };

  const viewPortfolio = () => {
    setShowPortfolioModal(true);
  };

  const handleIssueOpen = (issue: Issue) => {
    setSelectedIssue(issue);
  };

  const latestIssue = issues.find((i) => !i.isBonus) || issues[0];
  const currentPastIssues = issues.filter((i) => {
    if (i.isBonus) return isBonusUnlocked;
    return i !== latestIssue;
  });
  const votw = featuredVentures[0];

  // Pro/Max first-time context gate — blocks dashboard until context is set
  if (isPremium && contextChecked && !startupCtx && !showContextModal) {
    return (
      <div className="min-h-screen bg-background text-foreground font-sans flex flex-col">
        <PortalNav activePage="dashboard" />
        <div className="flex-1 flex flex-col items-center justify-center px-4 py-20">
          <div className="max-w-lg w-full text-center mb-12">
            <p className="text-[9px] font-bold tracking-[0.6em] text-primary uppercase mb-6">
              Before we start
            </p>
            <h1 className="font-serif text-5xl tracking-tight mb-4">
              What are you <em className="text-primary italic">building?</em>
            </h1>
            <p className="text-muted-foreground leading-relaxed">
              Every tool on this platform — the AI Advisor, the Signal Vault,
              the Build Brief — will be calibrated to your specific company.
              This takes 60 seconds. It changes everything.
            </p>
          </div>
          <StartupContextModal
            email={user?.email || ""}
            onComplete={(ctx) => {
              setStartupCtx(ctx);
              setContextChecked(true);
            }}
            onDismiss={() => setContextChecked(false)}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/30">
      <PortalNav activePage="dashboard" />

      <main className="max-w-[1400px] mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Main Content Area (8 columns) */}
          <div className="lg:col-span-8 space-y-12">
            {/* Welcome Hero — conditional by tier */}
            <WelcomeHero
              tier={tier}
              firstName={firstName}
              streak={streak}
              chatUsageThisMonth={chatUsageThisMonth}
              eligibleReward={eligibleReward}
              nextReward={nextReward}
              onClaimReward={claimReward}
            />

            {/* Venture Hall of Fame - High Visibility Spotlight */}
            <motion.section
              custom={4.5}
              initial="hidden"
              animate="visible"
              variants={fadeUp}
            >
              <div className="p-8 md:p-10 rounded-[3rem] bg-card/60 backdrop-blur-md border border-primary/20 relative overflow-hidden group shadow-2xl shadow-primary/[0.04]">
                <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 blur-[120px] rounded-full" />
                <div className="relative z-10 grid grid-cols-1 xl:grid-cols-12 gap-10">
                  <div className="xl:col-span-8">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                        <Trophy className="w-4 h-4 text-primary" />
                      </div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-primary">
                        Hall of Fame // Active Spotlight
                      </p>
                    </div>
                    <h2 className="font-serif text-4xl md:text-5xl mb-4 group-hover:text-primary transition-colors">
                      {votw?.name}
                    </h2>
                    <p className="text-muted-foreground text-sm leading-relaxed mb-8 max-w-2xl">
                      {votw?.whyItWon}
                    </p>
                    <div className="flex items-center gap-6 pt-6 border-t border-border/20 w-fit">
                      <div>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase mb-1">
                          Founder
                        </p>
                        <p className="font-serif text-lg">{votw?.founder}</p>
                      </div>
                      <div className="w-px h-8 bg-border/20" />
                      <div>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase mb-1">
                          Impact
                        </p>
                        <p className="font-serif text-lg text-primary">
                          {votw?.revenue}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="xl:col-span-4 flex flex-col justify-center gap-4">
                    <div className="p-6 rounded-3xl bg-background/50 border border-primary/10">
                      <h4 className="font-serif text-xl mb-2 flex items-center gap-2">
                        <ShieldCheck className="w-5 h-5 text-primary" />{" "}
                        Performance
                      </h4>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">
                        Peer-reviewed. Founder-tested.
                      </p>
                    </div>
                    <button
                      onClick={viewPortfolio}
                      className="flex items-center justify-center gap-2 w-full py-4 rounded-full bg-primary text-primary-foreground font-bold text-xs uppercase tracking-widest hover:opacity-90 transition-all shadow-xl shadow-primary/5 border border-primary/10"
                    >
                      Study Portfolio <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.section>

            {/* Bento / Command Board — conditional by tier */}
            <div className="space-y-6">
              {/* FREE: Portal Advantages */}
              {tier === "free" && (
                <>
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="font-serif text-3xl">Portal Advantages</h2>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                        FREE_TIER://ECOSYSTEM_VALUE
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 grid-rows-2 gap-4 h-auto md:h-[500px]">
                    <div className="md:col-span-2 md:row-span-2 p-8 rounded-[2.5rem] bg-card/40 border border-primary/20 relative overflow-hidden group hover:border-primary/40 transition-all">
                      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[100px] group-hover:bg-primary/10 transition-colors" />
                      <div className="relative z-10 flex flex-col h-full justify-between">
                        <div>
                          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-6">
                            <Zap className="w-6 h-6 fill-current" />
                          </div>
                          <h3 className="font-serif text-3xl mb-4">
                            The Weekly Signal
                          </h3>
                          <p className="text-muted-foreground text-sm leading-relaxed max-w-sm">
                            Every Friday, one startup idea deconstructed
                            end-to-end. Market gap, build plan, first revenue
                            path, and copy-paste Claude prompts — so you can act
                            before the weekend is over.
                          </p>
                        </div>
                        <div className="flex items-center gap-4 pt-6">
                          <div className="flex -space-x-2">
                            {[1, 2, 3, 4].map((i) => (
                              <div
                                key={i}
                                className="w-8 h-8 rounded-full border-2 border-background bg-card flex items-center justify-center overflow-hidden"
                              >
                                <div className="w-full h-full bg-primary/10 flex items-center justify-center text-[8px] font-bold">
                                  BB
                                </div>
                              </div>
                            ))}
                          </div>
                          <span className="text-[10px] font-bold text-primary uppercase tracking-widest">
                            Join {subscriberCount} founders
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="p-6 rounded-[2rem] bg-primary/5 border border-primary/10 relative group hover:border-primary/30 transition-all overflow-hidden">
                      <div className="relative z-10">
                        <Terminal className="w-5 h-5 text-primary mb-4" />
                        <h4 className="font-serif text-xl mb-2">
                          Daily Signals
                        </h4>
                        <p className="text-[10px] text-muted-foreground leading-relaxed">
                          One growth tactic, one market angle, every day. Pro &
                          Max only.
                        </p>
                      </div>
                    </div>
                    <div className="p-6 rounded-[2rem] bg-card/60 border border-border/40 relative group hover:border-primary/20 transition-all overflow-hidden">
                      <div className="relative z-10">
                        <Trophy className="w-5 h-5 text-primary mb-4" />
                        <h4 className="font-serif text-xl mb-2">
                          Milestone Vault
                        </h4>
                        <p className="text-[10px] text-muted-foreground leading-relaxed">
                          Consistency compounds. Hit 30 days, unlock the full
                          advisor stack. Hit 60, get early access to the next
                          cohort.
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-8 rounded-[2.5rem] bg-background border border-border/60 hover:border-primary/20 transition-all flex items-center gap-6">
                      <div className="w-14 h-14 rounded-2xl bg-card flex items-center justify-center text-primary border border-border/40 shadow-sm">
                        <BookOpen className="w-7 h-7" />
                      </div>
                      <div>
                        <h4 className="font-serif text-xl mb-1">The Archive</h4>
                        <p className="text-xs text-muted-foreground italic">
                          Permanent access to all past Free Tier blueprints.
                        </p>
                      </div>
                    </div>
                    <div className="p-8 rounded-[2.5rem] bg-background border border-border/60 hover:border-primary/20 transition-all flex items-center gap-6">
                      <div className="w-14 h-14 rounded-2xl bg-card flex items-center justify-center text-primary border border-border/40 shadow-sm">
                        <ShieldCheck className="w-7 h-7" />
                      </div>
                      <div>
                        <h4 className="font-serif text-xl mb-1">
                          Venture Spotlight
                        </h4>
                        <p className="text-xs text-muted-foreground italic">
                          Benchmark your scalability against vetted Foundry
                          winners.
                        </p>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* PRO: Command Board */}
              {tier === "pro" && (
                <>
                  <div>
                    <h2 className="font-serif text-3xl">Command Board</h2>
                    <p className="text-[10px] font-mono font-bold uppercase tracking-widest text-muted-foreground">
                      PRO_TIER://FULL_ACCESS
                    </p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 grid-rows-2 gap-4 h-auto md:h-[500px]">
                    <div className="md:col-span-2 md:row-span-2 p-8 rounded-2xl bg-card/80 border border-primary/20 relative overflow-hidden group hover:border-primary/40 transition-all">
                      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/[0.04] to-transparent h-10 w-full animate-scanline pointer-events-none" />
                      <div className="relative z-10 flex flex-col h-full justify-between">
                        <div>
                          <div className="w-10 h-10 rounded-sm bg-primary/10 flex items-center justify-center text-primary mb-6 border border-primary/20">
                            <Zap className="w-5 h-5 fill-current" />
                          </div>
                          <h3 className="font-serif text-3xl mb-4">
                            Friday Blueprint
                          </h3>
                          <p className="font-mono text-sm text-muted-foreground leading-relaxed max-w-sm">
                            {new Date().getDay() === 5
                              ? "Friday blueprint is live. Tap to read."
                              : "Next signal drops Friday 09:00."}
                          </p>
                        </div>
                        <div className="flex items-center gap-4 pt-6 border-t border-border/20">
                          <span className="font-mono text-[10px] font-bold text-primary uppercase tracking-widest">
                            {subscriberCount} operators active
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="p-6 rounded-2xl bg-primary/5 border border-primary/20 relative group hover:border-primary/40 transition-all overflow-hidden">
                      <div className="relative z-10">
                        <Terminal className="w-5 h-5 text-primary mb-4" />
                        <h4 className="font-mono text-sm font-bold uppercase tracking-widest mb-2">
                          Daily Signals
                        </h4>
                        <p className="text-[10px] text-muted-foreground leading-relaxed font-mono">
                          Today's operator briefing is ready.
                        </p>
                      </div>
                    </div>
                    <div className="p-6 rounded-2xl bg-card/80 border border-border/40 relative group hover:border-primary/20 transition-all overflow-hidden">
                      <div className="relative z-10">
                        <Trophy className="w-5 h-5 text-primary mb-4" />
                        <h4 className="font-mono text-sm font-bold uppercase tracking-widest mb-2">
                          Milestone Vault
                        </h4>
                        <p className="text-[10px] text-muted-foreground leading-relaxed font-mono">
                          {streak}-day streak. Next unlock at day 30.
                        </p>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* MAX / INCUBATOR: Intelligence Projections */}
              {(tier === "max" || tier === "incubator") && (
                <>
                  <div>
                    <h2 className="font-serif text-3xl">
                      Intelligence Projections
                    </h2>
                    <p className="text-xs text-muted-foreground mt-1">
                      Select a strategy. Execute the steps. Track the metric.
                    </p>
                  </div>

                  {/* Tab strip */}
                  <div className="overflow-x-auto no-scrollbar">
                    <div className="flex gap-0 border-b border-border/30 w-max min-w-full">
                      {projections.map((p) => (
                        <button
                          key={p.id}
                          onClick={() => setActiveProjection(p.id)}
                          className={`px-5 py-3 text-[11px] font-bold uppercase tracking-widest whitespace-nowrap transition-colors ${
                            activeProjection === p.id
                              ? "border-b-2 border-primary text-foreground"
                              : "text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          {p.codename}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Projection panel */}
                  {(() => {
                    const p = projections.find((x) => x.id === activeProjection)!;
                    const riskColor =
                      p.riskLevel === "low"
                        ? "bg-green-50 text-green-700 border-green-200"
                        : p.riskLevel === "medium"
                        ? "bg-amber-50 text-amber-700 border-amber-200"
                        : "bg-red-50 text-red-700 border-red-200";
                    return (
                      <div className="p-8 border border-border/20 rounded-none">
                        {/* Header */}
                        <p className="font-mono text-2xl font-bold tracking-tight mb-2">
                          {p.codename.toUpperCase()}
                        </p>
                        <p className="text-sm text-muted-foreground mb-5">
                          {p.tagline}
                        </p>

                        {/* Badges */}
                        <div className="flex flex-wrap gap-2 mb-6">
                          <span className="text-[10px] font-bold uppercase tracking-widest border px-3 py-1 rounded-full bg-card border-border/40">
                            {p.timeHorizon}
                          </span>
                          <span className={`text-[10px] font-bold uppercase tracking-widest border px-3 py-1 rounded-full ${riskColor}`}>
                            {p.riskLevel} risk
                          </span>
                          {p.verticals.slice(0, 2).map((v) => (
                            <span
                              key={v}
                              className="text-[10px] font-bold uppercase tracking-widest border px-3 py-1 rounded-full bg-card border-border/40 text-muted-foreground"
                            >
                              {v}
                            </span>
                          ))}
                        </div>

                        {/* Key metric KPI */}
                        <div className="mb-6 p-5 bg-primary/5 border border-primary/15 rounded-none">
                          <p className="text-[9px] uppercase tracking-[0.3em] text-muted-foreground/60 mb-2">
                            Target Metric
                          </p>
                          <p className="font-mono text-3xl font-bold text-primary">
                            {p.keyMetric}
                          </p>
                        </div>

                        {/* Action steps */}
                        <ol className="space-y-3 mb-6">
                          {p.steps.map((step, i) => (
                            <li
                              key={i}
                              className="flex gap-4 text-sm text-muted-foreground leading-relaxed"
                            >
                              <span className="font-mono text-[10px] font-bold text-primary mt-0.5 shrink-0 w-4">
                                {String(i + 1).padStart(2, "0")}
                              </span>
                              <span>{step}</span>
                            </li>
                          ))}
                        </ol>

                        {/* Vault link */}
                        {p.issueRef && (
                          <Link
                            href={p.issueRef}
                            className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-primary hover:opacity-70 transition-opacity"
                          >
                            Go deep <ArrowRight className="w-3 h-3" />
                          </Link>
                        )}
                      </div>
                    );
                  })()}
                </>
              )}
            </div>

            {/* Content Discovery Tabs */}
            <div className="space-y-8">
              {/* Tab container — style varies by tier */}
              <div
                className={
                  tier === "free"
                    ? "flex items-center gap-2 p-1.5 bg-card/50 border border-border/40 rounded-2xl w-fit max-w-full overflow-x-auto no-scrollbar"
                    : "flex items-center gap-0 w-fit max-w-full overflow-x-auto no-scrollbar"
                }
              >
                {[
                  { id: "playbook", label: "Playbook", icon: BookOpen },
                  { id: "path", label: "Foundry Path", icon: Layers },
                  { id: "vault", label: "Vault Archive", icon: Map },
                  { id: "alliance", label: "The Alliance", icon: UsersIcon },
                  { id: "arsenal", label: "Leverage Arsenal", icon: Boxes },
                  { id: "performance", label: "Scorecard", icon: TrendingUp },
                  { id: "terminal", label: "Terminal", icon: Terminal },
                  { id: "engine", label: "Engine", icon: Cpu },
                  { id: "strategy", label: "Strategy", icon: Target },
                  { id: "growth", label: "Viral Growth", icon: Flame },
                ]
                  .filter(
                    (tab) => tier !== "free" || tab.id === "performance"
                  )
                  .map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={
                      tier === "pro"
                        ? `px-4 py-2 text-xs font-bold uppercase tracking-widest transition-all border-b-2 ${activeTab === tab.id ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`
                        : tier === "max" || tier === "incubator"
                          ? `px-4 py-2 text-xs uppercase tracking-widest transition-all ${activeTab === tab.id ? "text-primary" : "text-muted-foreground hover:text-foreground"}`
                          : `flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${activeTab === tab.id ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" : "text-muted-foreground hover:text-foreground hover:bg-background/40"}`
                    }
                  >
                    {tier === "free" && <tab.icon className="w-3.5 h-3.5" />}{" "}
                    {tab.label}
                    {tab.id === "engine" && (
                      <span className="ml-2 px-1.5 py-0.5 rounded-full bg-primary/20 text-primary text-[8px] font-bold animate-pulse">
                        NEW
                      </span>
                    )}
                  </button>
                ))}
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                >
                  {activeTab === "playbook" && (
                    <PlaybookTab
                      activePlaybook={activePlaybook}
                      isPro={isPro}
                      onLessonOpen={handleLessonOpen}
                    />
                  )}

                  {activeTab === "path" && <PathTab />}
                  {activeTab === "engine" && (
                    <div className="space-y-6">
                      <ContextManager />
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="p-8 rounded-[2.5rem] bg-card/20 border border-border/40">
                          <h4 className="font-serif text-xl mb-4 flex items-center gap-2">
                            <Cpu className="w-5 h-5 text-primary" /> Proprietary
                            Intelligence
                          </h4>
                          <p className="text-xs text-muted-foreground leading-relaxed">
                            Your Engine is currently connected to the **YC
                            Signal Vault** and **Elite VC Persona Cluster**. All
                            advice generated is calibrated against these
                            proprietary datasets.
                          </p>
                        </div>
                        <div className="p-8 rounded-[2.5rem] bg-card/20 border border-border/40">
                          <h4 className="font-serif text-xl mb-4 flex items-center gap-2">
                            <Shield className="w-5 h-5 text-primary" />{" "}
                            Knowledge Integrity
                          </h4>
                          <p className="text-xs text-muted-foreground leading-relaxed">
                            Data uploaded to your private vault is encrypted and
                            used only to fine-tune your specific Advisor
                            sessions. It is never shared with other users.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                  {activeTab === "vault" && (
                    <VaultTab
                      currentPastIssues={currentPastIssues}
                      isPro={isPro}
                      onIssueOpen={handleIssueOpen}
                      onUpgradeClick={handleUpgradeClick}
                    />
                  )}

                  {activeTab === "alliance" && (
                    <AllianceTab
                      activeAlliance={activeAlliance}
                      myWallProfile={myWallProfile}
                      setMyWallProfile={setMyWallProfile}
                      setWallMembers={setWallMembers}
                      setSelectedMember={setSelectedMember}
                      setShowJoinAlliance={setShowJoinAlliance}
                      scorecard={scorecard}
                      wallMembers={wallMembers}
                      session={session}
                      user={user}
                    />
                  )}

                  {activeTab === "performance" && (
                    <div className="max-w-5xl mx-auto py-12">
                      {!scorecard ? (
                        <div className="text-center py-24 bg-card/40 border border-border/40 rounded-[3rem] backdrop-blur-md">
                          <TrendingUp className="w-16 h-16 mx-auto mb-8 text-primary opacity-20" />
                          <h2 className="font-serif text-4xl mb-4">
                            Initialize Your Scorecard.
                          </h2>
                          <p className="text-muted-foreground mb-12 max-w-lg mx-auto">
                            Get an AI-powered diagnostic of your startup's
                            current health and a 7-day tactical execution
                            roadmap.
                          </p>
                          <button
                            disabled={engineBusy}
                            onClick={async () => {
                              setEngineBusy(true);
                              const tid = toast.loading(
                                "Analyzing startup context...",
                              );
                              try {
                                const res = await fetch(
                                  "/api/scorecard/generate",
                                  {
                                    method: "POST",
                                    headers: {
                                      Authorization: `Bearer ${session?.access_token}`,
                                    },
                                  },
                                );
                                if (res.ok) {
                                  const data = await res.json();
                                  setScorecard(data);
                                  toast.success("Scorecard Generated", {
                                    id: tid,
                                  });
                                } else {
                                  toast.error("Analysis failed", { id: tid });
                                }
                              } finally {
                                setEngineBusy(false);
                              }
                            }}
                            className="px-12 py-5 rounded-[2rem] bg-primary text-white font-black text-xs uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-primary/20 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
                          >
                            {engineBusy ? "Analyzing…" : "Generate Diagnostic"}
                          </button>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                          {/* Main Score */}
                          <div className="lg:col-span-1 space-y-8">
                            <div className="p-10 rounded-[3rem] bg-primary text-white relative overflow-hidden shadow-2xl shadow-primary/20">
                              <div className="absolute top-0 right-0 p-8 opacity-10">
                                <Zap className="w-24 h-24" />
                              </div>
                              <p className="text-[10px] font-black uppercase tracking-widest mb-2 opacity-60">
                                FOUNDRY_SCORE
                              </p>
                              <h3 className="font-serif text-8xl mb-4">
                                {scorecard.score}
                              </h3>
                              <p className="text-sm font-medium leading-relaxed opacity-90 italic">
                                "{scorecard.verdict}"
                              </p>
                            </div>

                            <div className="p-8 rounded-[3rem] bg-card border border-border/40 space-y-6">
                              {Object.entries(scorecard.breakdown).map(
                                ([key, val]: [string, any]) => (
                                  <div key={key}>
                                    <div className="flex justify-between mb-2">
                                      <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                                        {key}
                                      </span>
                                      <span className="text-[10px] font-black text-primary">
                                        {val}%
                                      </span>
                                    </div>
                                    <div className="w-full h-1.5 bg-background rounded-full overflow-hidden">
                                      <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${val}%` }}
                                        className="h-full bg-primary"
                                      />
                                    </div>
                                  </div>
                                ),
                              )}
                            </div>
                          </div>

                          {/* Roadmap */}
                          <div className="lg:col-span-2">
                            <h3 className="font-serif text-3xl mb-8 flex items-center gap-3">
                              <Activity className="w-6 h-6 text-primary" />
                              7-Day Execution Roadmap
                            </h3>
                            <div className="space-y-4">
                              {scorecard.roadmap.map((step: any, i: number) => (
                                <div
                                  key={i}
                                  className="p-6 rounded-3xl bg-card border border-border/40 hover:border-primary/20 transition-all group"
                                >
                                  <div className="flex gap-6">
                                    <div className="w-12 h-12 rounded-2xl bg-background flex-shrink-0 flex items-center justify-center font-mono font-bold text-primary border border-border/40">
                                      D{step.day}
                                    </div>
                                    <div>
                                      <h4 className="font-bold mb-1 text-lg group-hover:text-primary transition-colors">
                                        {step.task}
                                      </h4>
                                      <p className="text-xs text-muted-foreground uppercase tracking-widest font-black text-[9px] mb-1">
                                        GOAL: {step.goal}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                  {activeTab === "terminal" && (
                    <div className="max-w-4xl mx-auto py-12">
                      <div className="p-8 rounded-[3rem] bg-[#050505] border border-primary/20 shadow-2xl shadow-primary/[0.05] relative overflow-hidden font-mono min-h-[600px] flex flex-col">
                        {/* Terminal Header */}
                        <div className="flex items-center justify-between mb-8 pb-4 border-b border-primary/10">
                          <div className="flex items-center gap-4">
                            <div className="flex gap-1.5">
                              <div className="w-2.5 h-2.5 rounded-full bg-red-500/20" />
                              <div className="w-2.5 h-2.5 rounded-full bg-amber-500/20" />
                              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/20" />
                            </div>
                            <span className="text-[10px] font-bold text-primary/60 uppercase tracking-widest">
                              Foundry_OS // v0.9.1-Alpha
                            </span>
                          </div>
                          <Badge className="bg-primary/10 text-primary border-primary/20">
                            {tier.toUpperCase()}_SESSION
                          </Badge>
                        </div>

                        {/* Terminal Output */}
                        <div className="flex-1 overflow-y-auto space-y-4 mb-8 text-sm custom-scrollbar pr-4">
                          <p className="text-primary/40 leading-relaxed">
                            Welcome to the Foundry Terminal. Accessing
                            intelligence nodes... <br />
                            Type /market-scan, /roast, or /sprint to begin.
                          </p>

                          {terminalHistory.map((item, i) => (
                            <div
                              key={i}
                              className={`flex gap-3 ${item.type === "cmd" ? "text-primary/80" : "text-primary/60 border-l border-primary/20 pl-4 py-2 bg-primary/5 rounded-r-xl"}`}
                            >
                              {item.type === "cmd" && (
                                <span className="text-primary opacity-40 font-bold shrink-0">
                                  {">"}
                                </span>
                              )}
                              <div className="whitespace-pre-wrap break-words">
                                {item.text}
                              </div>
                            </div>
                          ))}

                          {terminalHistory.length === 0 && (
                            <div className="text-primary/60 border-l border-primary/20 pl-4 py-2 bg-primary/5 rounded-r-xl">
                              SYSTEM: Intelligence energy at 100%. Ready for
                              commands.
                            </div>
                          )}
                        </div>

                        {/* Terminal Input */}
                        <div className="relative mt-auto">
                          <div className="absolute left-0 top-1/2 -translate-y-1/2 text-primary font-bold">
                            {">"}
                          </div>
                          <input
                            type="text"
                            placeholder="Enter Command..."
                            onKeyDown={async (e) => {
                              if (e.key === "Enter") {
                                const input = (e.target as HTMLInputElement)
                                  .value;
                                (e.target as HTMLInputElement).value = "";

                                setTerminalHistory((prev) => [
                                  ...prev,
                                  { type: "cmd", text: input },
                                ]);
                                const tid = toast.loading(
                                  `Executing ${input}...`,
                                );

                                try {
                                  const res = await fetch(
                                    "/api/terminal/command",
                                    {
                                      method: "POST",
                                      headers: {
                                        "Content-Type": "application/json",
                                        Authorization: `Bearer ${session?.access_token}`,
                                      },
                                      body: JSON.stringify({
                                        command: input,
                                        context: startupCtx,
                                      }),
                                    },
                                  );

                                  if (res.ok) {
                                    const data = await res.json();
                                    setTerminalHistory((prev) => [
                                      ...prev,
                                      { type: "out", text: data.output },
                                    ]);
                                    toast.success("Done.", { id: tid });
                                  } else {
                                    toast.error("Execution failed", {
                                      id: tid,
                                    });
                                  }
                                } catch {
                                  toast.error("Network error", { id: tid });
                                }
                              }
                            }}
                            className="w-full bg-transparent border-none focus:ring-0 text-primary pl-6 font-mono placeholder:text-primary/20"
                            autoFocus
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === "growth" && (
                    <div className="max-w-4xl mx-auto py-12">
                      <div className="text-center mb-16">
                        <motion.div
                          initial={{ scale: 0.9, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          className="w-20 h-20 bg-primary/10 rounded-[2rem] flex items-center justify-center text-primary mx-auto mb-8 border border-primary/20"
                        >
                          <Flame className="w-10 h-10" />
                        </motion.div>
                        <h2 className="font-serif text-5xl mb-6">
                          Multiply Your Edge.
                        </h2>
                        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                          Invite 3 founders to the Builder Brief. Get 1 month of
                          Pro access free. Reach 10 founders to unlock permanent
                          Max access.
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="p-10 rounded-[3rem] bg-card border border-border/40 relative overflow-hidden">
                          <div className="absolute top-0 right-0 p-8 text-primary/10">
                            <Trophy className="w-20 h-20" />
                          </div>
                          <div className="relative z-10">
                            <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-2">
                              YOUR_PROGRESS
                            </p>
                            <h3 className="font-serif text-3xl mb-8">
                              {referralData?.referralCount || 0} Referred
                            </h3>

                            <div className="w-full h-3 bg-background rounded-full overflow-hidden mb-6 border border-border/40">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{
                                  width: `${Math.min(((referralData?.referralCount || 0) / 3) * 100, 100)}%`,
                                }}
                                className="h-full bg-primary shadow-[0_0_20px_rgba(249,115,22,0.4)]"
                              />
                            </div>
                            <p className="text-sm text-muted-foreground mb-8">
                              {3 - (referralData?.referralCount || 0) > 0
                                ? `Just ${3 - (referralData?.referralCount || 0)} more to unlock Pro Tier.`
                                : "Milestone Reached! Claim your reward below."}
                            </p>

                            {(referralData?.referralCount || 0) >= 3 && (
                              <button
                                disabled={milestoneBusy}
                                onClick={async () => {
                                  setMilestoneBusy(true);
                                  const tid = toast.loading(
                                    "Verifying milestones...",
                                  );
                                  try {
                                    const res = await fetch(
                                      "/api/referrals/verify-milestone",
                                      {
                                        method: "POST",
                                        headers: {
                                          Authorization: `Bearer ${session?.access_token}`,
                                        },
                                      },
                                    );
                                    if (res.ok) {
                                      const data = await res.json();
                                      if (data.upgraded) {
                                        toast.success(
                                          `Milestone Verified! Tier upgraded to ${data.currentTier.toUpperCase()}.`,
                                          { id: tid },
                                        );
                                        setTimeout(
                                          () => window.location.reload(),
                                          2000,
                                        );
                                      } else {
                                        toast.info(
                                          "No new milestones to claim yet.",
                                          { id: tid },
                                        );
                                      }
                                    } else {
                                      toast.error("Verification failed", {
                                        id: tid,
                                      });
                                    }
                                  } finally {
                                    setMilestoneBusy(false);
                                  }
                                }}
                                className="w-full py-4 rounded-2xl bg-emerald-500 text-white font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-emerald-500/20 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
                              >
                                {milestoneBusy ? "Verifying…" : "Claim Tier Upgrade"}
                              </button>
                            )}
                          </div>
                        </div>

                        <div className="p-10 rounded-[3rem] bg-primary/5 border border-primary/20 relative overflow-hidden">
                          <div className="relative z-10">
                            <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-2">
                              SHARE_CODE
                            </p>
                            <h3 className="font-serif text-3xl mb-8">
                              Viral Link
                            </h3>

                            <div className="flex items-center gap-2 p-4 bg-background border border-border/40 rounded-2xl mb-6 font-mono text-lg font-bold text-center justify-center tracking-widest">
                              {referralData?.referralCode || "LOADING..."}
                            </div>

                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(
                                  referralData?.shareUrl || "",
                                );
                                toast.success("Link Copied", {
                                  description: "Time to build the network.",
                                });
                              }}
                              className="w-full py-5 rounded-2xl bg-primary text-white font-black text-xs uppercase tracking-widest hover:scale-[1.02] transition-all shadow-xl shadow-primary/20"
                            >
                              Copy Referral Link
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  {activeTab === "strategy" && (
                    <div className="max-w-6xl mx-auto py-12 space-y-12">
                      <div className="text-center mb-16">
                        <motion.div
                          initial={{ scale: 0.9, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          className="w-20 h-20 bg-primary/10 rounded-[2rem] flex items-center justify-center text-primary mx-auto mb-8 border border-primary/20"
                        >
                          <Target className="w-10 h-10" />
                        </motion.div>
                        <h2 className="font-serif text-5xl mb-6">
                          Strategic Intelligence.
                        </h2>
                        <p className="text-muted-foreground text-lg max-w-2xl mx-auto italic">
                          Personalized blueprints sourced from our proprietary
                          vault of YC logic and VC personas.
                        </p>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Roadmap & Matches Column */}
                        <div className="lg:col-span-2 space-y-8">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Roadmap Card */}
                            <div className="p-10 rounded-[3rem] bg-card border border-border/40 relative overflow-hidden group h-full flex flex-col justify-between">
                              <div className="absolute top-0 right-0 p-8 text-primary/10 group-hover:rotate-12 transition-transform">
                                <Map className="w-20 h-20" />
                              </div>
                              <div className="relative z-10">
                                <Badge className="mb-6 bg-primary/10 text-primary border-primary/20 tracking-widest uppercase text-[9px]">
                                  The_100B_Blueprint
                                </Badge>
                                <h3 className="font-serif text-3xl mb-4">
                                  Hyper-Growth Roadmap
                                </h3>
                                <p className="text-xs text-muted-foreground mb-8 leading-relaxed">
                                  A 4-phase tactical execution plan generated
                                  from your startup context and our growth
                                  blueprints.
                                </p>

                                <button
                                  disabled={engineBusy}
                                  onClick={async () => {
                                    setEngineBusy(true);
                                    const tid = toast.loading(
                                      "Synthesizing roadmap...",
                                    );
                                    try {
                                      const res = await fetch(
                                        "/api/engine/roadmap",
                                        {
                                          method: "POST",
                                          headers: {
                                            Authorization: `Bearer ${session?.access_token}`,
                                          },
                                        },
                                      );
                                      if (res.ok) {
                                        const data = await res.json();
                                        setPersonalizedBrief(data.roadmap);
                                        toast.success("Roadmap Generated", {
                                          id: tid,
                                        });
                                      } else {
                                        toast.error("Synthesis failed", {
                                          id: tid,
                                        });
                                      }
                                    } finally {
                                      setEngineBusy(false);
                                    }
                                  }}
                                  className="px-8 py-4 rounded-2xl bg-primary text-white text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-primary/20 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
                                >
                                  {engineBusy ? "Synthesizing…" : "Generate Roadmap"}
                                </button>
                              </div>
                            </div>

                            {/* Investor Matchmaker Card */}
                            <div className="p-10 rounded-[3rem] bg-primary/5 border border-primary/20 relative overflow-hidden group h-full flex flex-col justify-between">
                              <div className="absolute top-0 right-0 p-8 text-primary/10 group-hover:rotate-12 transition-transform">
                                <ShieldCheck className="w-20 h-20" />
                              </div>
                              <div className="relative z-10">
                                <Badge className="mb-6 bg-primary/10 text-primary border-primary/20 tracking-widest uppercase text-[9px]">
                                  Venture_Matching
                                </Badge>
                                <h3 className="font-serif text-4xl mb-4">
                                  Investor Matchmaker
                                </h3>
                                <p className="text-xs text-muted-foreground mb-8 leading-relaxed">
                                  Match your venture against the investment
                                  criteria of Tier-1 VC archetypes.
                                </p>

                                <button
                                  disabled={engineBusy}
                                  onClick={async () => {
                                    setEngineBusy(true);
                                    const tid = toast.loading(
                                      "Analyzing investor fit...",
                                    );
                                    try {
                                      const res = await fetch(
                                        "/api/engine/investor-matches",
                                        {
                                          method: "POST",
                                          headers: {
                                            Authorization: `Bearer ${session?.access_token}`,
                                          },
                                        },
                                      );
                                      if (res.ok) {
                                        const data = await res.json();
                                        setPersonalizedBrief(data.matches);
                                        toast.success("Matches Found", {
                                          id: tid,
                                        });
                                      } else {
                                        toast.error("Analysis failed", {
                                          id: tid,
                                        });
                                      }
                                    } finally {
                                      setEngineBusy(false);
                                    }
                                  }}
                                  className="px-8 py-4 rounded-2xl bg-background border border-primary/20 text-primary text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
                                >
                                  {engineBusy ? "Analyzing…" : "Find Matches"}
                                </button>
                              </div>
                            </div>
                          </div>

                          {/* Results Display */}
                          {personalizedBrief && (
                            <motion.div
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="p-12 rounded-[3.5rem] bg-card border border-border/40 font-serif leading-relaxed text-lg whitespace-pre-wrap relative overflow-hidden shadow-2xl"
                            >
                              <div className="absolute top-0 right-0 p-12 opacity-5">
                                <Sparkles className="w-32 h-32 text-primary" />
                              </div>
                              <div className="relative z-10 max-w-4xl mx-auto prose prose-invert prose-orange">
                                {personalizedBrief}
                              </div>
                            </motion.div>
                          )}
                        </div>

                        {/* Alpha Feed Column */}
                        <div className="lg:col-span-1 space-y-6">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-serif text-2xl">Alpha Feed</h3>
                            <div className="flex items-center gap-2">
                              <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                              <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
                                LIVE
                              </span>
                            </div>
                          </div>
                          <MarketPulseFeed />
                        </div>
                      </div>
                    </div>
                  )}
                  {activeTab === "arsenal" && (
                    <ArsenalTab
                      products={products}
                      ownedProducts={ownedProducts}
                      isPro={isPro}
                      onDeploy={handleDeploy}
                      onUpgradeClick={handleUpgradeClick}
                    />
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
            {/* Issue Content Modal */}
            <AnimatePresence>
              {selectedIssue && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center px-6">
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setSelectedIssue(null)}
                    className="absolute inset-0 bg-background/90 backdrop-blur-md"
                  />
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 30 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 30 }}
                    className="relative w-full max-w-3xl max-h-[90vh] bg-card border border-primary/20 rounded-[3.5rem] shadow-2xl overflow-hidden flex flex-col"
                  >
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-3xl pointer-events-none" />

                    <div className="p-8 md:p-12 overflow-y-auto custom-scrollbar">
                      <div className="flex items-center justify-between mb-8">
                        <Badge className="bg-primary/10 text-primary border-none text-[10px] px-4">
                          ISSUE #{selectedIssue.number}
                        </Badge>
                        <button
                          onClick={() => setSelectedIssue(null)}
                          className="p-2 hover:bg-background rounded-full transition-colors"
                        >
                          <ArrowRight className="w-5 h-5 rotate-180" />
                        </button>
                      </div>

                      <h2 className="font-serif text-4xl md:text-5xl mb-2">
                        {selectedIssue.title}
                      </h2>
                      <p className="text-primary font-bold uppercase tracking-[0.3em] text-[10px] mb-8 italic">
                        {selectedIssue.category} • TAM: {selectedIssue.tam}
                      </p>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-12">
                        <div>
                          <h4 className="text-[10px] font-bold uppercase text-muted-foreground mb-4 flex items-center gap-2">
                            <Info className="w-3.5 h-3.5" /> Logical Problem
                          </h4>
                          <p className="text-sm text-foreground/80 leading-relaxed font-sans">
                            {selectedIssue.problem}
                          </p>
                        </div>
                        <div>
                          <h4 className="text-[10px] font-bold uppercase text-muted-foreground mb-4 flex items-center gap-2">
                            <Zap className="w-3.5 h-3.5 shadow-sm" /> The
                            Distribution Why
                          </h4>
                          {Array.isArray(selectedIssue.whyNow) ? (
                            <ul className="space-y-3">
                              {selectedIssue.whyNow.map((why, i) => (
                                <li
                                  key={i}
                                  className="text-xs flex items-start gap-2 text-muted-foreground"
                                >
                                  <span className="w-1 h-1 rounded-full bg-primary mt-1.5 shrink-0" />
                                  {why}
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-sm text-muted-foreground leading-relaxed">
                              {selectedIssue.whyNow}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="space-y-8">
                        <div className="p-8 rounded-[2rem] bg-background/50 border border-primary/10">
                          <h4 className="text-[10px] font-bold uppercase text-primary mb-6 flex items-center gap-2 tracking-widest">
                            <Terminal className="w-4 h-4" /> Architectural
                            Blueprint
                          </h4>
                          <div className="space-y-4">
                            {(
                              selectedIssue.blueprint ??
                              selectedIssue.buildBrief ??
                              []
                            ).map((step, i) => (
                              <div
                                key={i}
                                className="flex gap-4 p-4 rounded-xl bg-card border border-border/40 hover:border-primary/20 transition-all group"
                              >
                                <span className="font-mono text-xs text-primary/40 font-bold">
                                  0{i + 1}
                                </span>
                                <p className="text-xs text-foreground/90 font-medium">
                                  {step}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="p-8 rounded-[2rem] bg-primary/5 border border-primary/10">
                          <h4 className="text-[10px] font-bold uppercase text-primary mb-6 flex items-center gap-2 tracking-widest">
                            <Map className="w-4 h-4" /> AI Execution Prompts
                          </h4>
                          <div className="space-y-4">
                            {(selectedIssue.prompts ?? []).map((prompt, i) => (
                              <div
                                key={i}
                                className="bg-background/80 p-4 rounded-xl border border-border/40 font-mono text-[11px] leading-relaxed relative group"
                              >
                                <button
                                  onClick={() => {
                                    navigator.clipboard.writeText(prompt);
                                    toast.success("Prompt Copied", {
                                      description:
                                        "Industrial injection ready.",
                                    });
                                  }}
                                  className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity p-2 bg-card rounded-md border border-border/40"
                                >
                                  <Copy className="w-3 h-3 text-primary" />
                                </button>
                                <span className="text-primary mr-2 italic">
                                  PROMPT_{i + 1}:
                                </span>{" "}
                                {prompt}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => setSelectedIssue(null)}
                        className="mt-12 w-full py-5 bg-foreground text-background rounded-full font-bold text-xs uppercase tracking-widest hover:bg-primary transition-all shadow-xl"
                      >
                        Close Blueprint Details
                      </button>
                    </div>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>
          </div>

          {/* Section below VOTW removed as it was moved above */}

          {/* Right Sidebar Intelligence Feed (4 columns) */}
          <IntelligenceFeed
            tier={tier}
            isPro={isPro}
            telemetryLogs={telemetryLogs}
            dailyEdge={dailyEdge}
            personalizedBrief={personalizedBrief}
            completedSteps={completedSteps}
            startupCtx={startupCtx}
            chatUsageThisMonth={chatUsageThisMonth}
            onCopyHack={copyHack}
            onToggleStep={toggleStep}
            onUpgradeClick={handleUpgradeClick}
            onShowContextModal={() => setShowContextModal(true)}
            onChatUsageUpdate={(next) => setChatUsageThisMonth(next)}
          />
        </div>
      </main>

      {/* Lesson Content Modal */}
      <AnimatePresence>
        {selectedLesson && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 py-8">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedLesson(null)}
              className="absolute inset-0 bg-background/90 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-card border border-primary/20 rounded-[2.5rem] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-3xl pointer-events-none" />
              <div className="relative z-10 overflow-y-auto p-8 md:p-12">
                <div className="flex items-center justify-between mb-6">
                  <Badge className="bg-primary/10 text-primary border-none text-[9px] tracking-widest px-4 py-1">
                    FREE BLUEPRINT
                  </Badge>
                  <button
                    onClick={() => setSelectedLesson(null)}
                    className="p-2 hover:bg-background rounded-full transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <p className="text-[10px] font-bold uppercase tracking-widest text-primary/60 mb-2 italic">
                  {selectedLesson.tagline}
                </p>
                <h2 className="font-serif text-3xl md:text-4xl mb-8 leading-tight">
                  {selectedLesson.title}
                </h2>

                {/* Core Insight */}
                <div className="mb-6">
                  <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground mb-3">
                    The Insight
                  </p>
                  <p className="text-sm text-foreground/85 leading-relaxed">
                    {selectedLesson.content.insight}
                  </p>
                </div>

                {/* Tactic */}
                <div className="p-6 bg-primary/5 border border-primary/15 rounded-2xl mb-6">
                  <p className="text-[9px] font-bold uppercase tracking-widest text-primary mb-3">
                    The Tactic
                  </p>
                  <p className="text-sm text-foreground/80 leading-relaxed">
                    {selectedLesson.content.tactic}
                  </p>
                </div>

                {/* Steps */}
                <div className="mb-6">
                  <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground mb-4">
                    Exact Steps
                  </p>
                  <div className="space-y-3">
                    {selectedLesson.content.steps.map((step, i) => (
                      <div
                        key={i}
                        className="flex gap-3 p-4 bg-background/60 border border-border/40 rounded-xl"
                      >
                        <span className="text-[10px] font-black text-primary/50 font-mono shrink-0 mt-0.5">
                          0{i + 1}
                        </span>
                        <p className="text-xs text-foreground/85 leading-relaxed">
                          {step}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Warning */}
                <div className="p-5 bg-amber-500/5 border border-amber-500/20 rounded-xl mb-6">
                  <p className="text-[9px] font-bold uppercase tracking-widest text-amber-600 dark:text-amber-400 mb-2">
                    Watch Out
                  </p>
                  <p className="text-xs text-foreground/75 leading-relaxed">
                    {selectedLesson.content.warning}
                  </p>
                </div>

                {/* Pro Tip */}
                {selectedLesson.content.proTip && (
                  <div className="p-5 bg-primary/10 border border-primary/20 rounded-xl mb-8">
                    <p className="text-[9px] font-bold uppercase tracking-widest text-primary mb-2">
                      Pro Insight
                    </p>
                    <p className="text-xs text-foreground/80 leading-relaxed italic">
                      {selectedLesson.content.proTip}
                    </p>
                  </div>
                )}

                <button
                  onClick={() => setSelectedLesson(null)}
                  className="w-full py-4 bg-foreground text-background rounded-full font-bold text-xs uppercase tracking-widest hover:bg-primary transition-all"
                >
                  Close — Go Execute
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Login Bonus Reveal Modal */}
      <AnimatePresence>
        {showLoginBonus && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center px-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-background/95 backdrop-blur-xl"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.5, rotateY: 90 }}
              animate={{ opacity: 1, scale: 1, rotateY: 0 }}
              exit={{ opacity: 0, scale: 0.5, rotateY: -90 }}
              transition={{ type: "spring", damping: 20 }}
              className="relative w-full max-w-lg bg-card border-[0.5px] border-primary/40 p-12 rounded-[3.5rem] shadow-[0_0_100px_rgba(249,115,22,0.15)] text-center overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-b from-primary/10 to-transparent pointer-events-none" />
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="relative z-10"
              >
                <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-8 relative">
                  <motion.div
                    animate={{ scale: [1, 1.2, 1], rotate: [0, 360] }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                    className="absolute inset-0 border-2 border-dashed border-primary/30 rounded-full"
                  />
                  <ShieldCheck className="w-10 h-10 text-primary" />
                </div>
                <Badge className="bg-primary/20 text-primary border-none mb-4 tracking-[0.2em] px-4 py-1">
                  BONUS_UNLOCKED
                </Badge>
                <h2 className="font-serif text-4xl mb-4 italic">
                  Strategic Login Bonus
                </h2>
                <p className="text-muted-foreground leading-relaxed transition-opacity mb-10 text-sm">
                  Access Granted:{" "}
                  <span className="text-foreground font-bold">
                    The 90-Day Master Blueprint
                  </span>
                  . Your commitment to the Foundry has been verified.
                </p>
                <button
                  onClick={claimLoginBonus}
                  className="w-full bg-primary text-primary-foreground py-5 rounded-[2rem] font-bold text-xs uppercase tracking-widest hover:scale-[1.02] transition-all shadow-xl shadow-primary/20"
                >
                  Enter the Master Vault
                </button>
              </motion.div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Study Portfolio Modal */}
      <AnimatePresence>
        {showPortfolioModal && (
          <div className="fixed inset-0 z-[130] flex items-center justify-center px-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowPortfolioModal(false)}
              className="absolute inset-0 bg-background/90 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 30 }}
              className="relative w-full max-w-4xl max-h-[90vh] bg-card border border-primary/20 rounded-[3.5rem] shadow-2xl overflow-hidden flex flex-col"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-3xl pointer-events-none" />
              <div className="p-8 md:p-12 overflow-y-auto">
                <div className="flex items-center justify-between mb-10">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <Trophy className="w-5 h-5 text-primary" />
                      <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-primary">
                        Hall of Fame // Venture Portfolio
                      </p>
                    </div>
                    <h2 className="font-serif text-4xl">Foundry Winners</h2>
                  </div>
                  <button
                    onClick={() => setShowPortfolioModal(false)}
                    className="p-2 hover:bg-background rounded-full transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-6">
                  {featuredVentures.map((venture) => (
                    <div
                      key={venture.id}
                      className="p-8 rounded-[2.5rem] bg-background/60 border border-border/30 hover:border-primary/30 transition-all group"
                    >
                      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <Badge
                              className={`border-none text-[8px] tracking-[0.2em] px-3 ${venture.status === "Winner" ? "bg-primary/10 text-primary" : "bg-emerald-500/10 text-emerald-500"}`}
                            >
                              {venture.status.toUpperCase()}
                            </Badge>
                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                              {venture.category}
                            </span>
                          </div>
                          <h3 className="font-serif text-2xl mb-1 group-hover:text-primary transition-colors">
                            {venture.name}
                          </h3>
                          <p className="text-[10px] font-bold text-muted-foreground uppercase mb-4">
                            Founded by {venture.founder} • {venture.stage}
                          </p>
                          <p className="text-sm text-muted-foreground leading-relaxed max-w-xl">
                            {venture.whyItWon}
                          </p>
                          <div className="flex flex-wrap gap-2 mt-4">
                            {venture.tags.map((tag) => (
                              <span
                                key={tag}
                                className="text-[9px] font-bold uppercase tracking-widest bg-primary/5 text-primary border border-primary/10 px-3 py-1 rounded-full"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div className="flex flex-row md:flex-col gap-4 md:gap-3 md:min-w-[160px] md:items-end">
                          <div className="text-right">
                            <p className="text-[9px] font-bold text-muted-foreground uppercase mb-1">
                              Revenue
                            </p>
                            <p className="font-serif text-xl text-primary">
                              {venture.revenue}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-[9px] font-bold text-muted-foreground uppercase mb-1">
                              Growth
                            </p>
                            <p className="font-bold text-sm text-emerald-500">
                              {venture.growth}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-[9px] font-bold text-muted-foreground uppercase mb-1">
                              Time to Rev.
                            </p>
                            <p className="font-bold text-sm">
                              {venture.timeToRevenue}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="mt-6 pt-6 border-t border-border/20">
                        <p className="text-[9px] font-bold uppercase text-muted-foreground tracking-widest mb-1">
                          Key Metric
                        </p>
                        <p className="text-xs font-medium font-mono text-primary">
                          {venture.keyMetric}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => setShowPortfolioModal(false)}
                  className="mt-10 w-full py-5 bg-foreground text-background rounded-full font-bold text-xs uppercase tracking-widest hover:bg-primary transition-all shadow-xl"
                >
                  Close Portfolio
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <Footer variant="authenticated" />
      {/* Alliance Member Modal */}
      <AnimatePresence>
        {selectedMember && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center px-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedMember(null)}
              className="absolute inset-0 bg-background/90 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-xl bg-card border border-primary/20 p-10 rounded-[3rem] shadow-2xl overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-3xl" />
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-8">
                  <Badge className="bg-primary/10 text-primary">
                    {selectedMember.status.toUpperCase()}
                  </Badge>
                  <button
                    onClick={() => setSelectedMember(null)}
                    className="p-2 hover:bg-background rounded-full transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <h3 className="font-serif text-4xl mb-2">
                  {selectedMember.name}
                </h3>
                <p className="text-primary font-bold uppercase tracking-widest text-[10px] mb-8">
                  {selectedMember.role}
                </p>

                <div className="space-y-6">
                  <div className="p-6 rounded-2xl bg-background/50 border border-border/40">
                    <p className="text-[10px] font-bold uppercase text-muted-foreground mb-3">
                      Strategic Moat
                    </p>
                    <p className="text-sm leading-relaxed">
                      {selectedMember.specialty}
                    </p>
                  </div>
                  <div className="p-6 rounded-2xl bg-primary/5 border border-primary/10">
                    <p className="text-[10px] font-bold uppercase text-primary mb-3">
                      Active Venture Loop
                    </p>
                    <p className="text-sm font-serif italic text-primary text-lg">
                      "{selectedMember.currentVenture}"
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl border border-border/40 bg-background/30">
                      <p className="text-[9px] font-bold uppercase text-muted-foreground mb-1">
                        Foundry Tenure
                      </p>
                      <p className="text-xs font-bold">
                        {selectedMember.joined}
                      </p>
                    </div>
                    <div className="p-4 rounded-xl border border-border/40 bg-background/30">
                      <p className="text-[9px] font-bold uppercase text-muted-foreground mb-1">
                        Network Authority
                      </p>
                      <p className="text-xs font-bold">Level 4 Active</p>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setSelectedMember(null);
                    toast.success("Request Sent", {
                      description: "You'll hear back within 48 hours.",
                    });
                  }}
                  className="mt-10 w-full py-4 bg-primary text-white rounded-full font-bold text-xs uppercase tracking-widest shadow-xl shadow-primary/20"
                >
                  Request Introduction
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Arsenal Deploy Modal */}
      <AnimatePresence>
        {isDeploying && selectedTool && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center px-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 bg-background/95 backdrop-blur-xl"
            />
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative w-full max-w-sm text-center"
            >
              <div className="w-24 h-24 rounded-[2rem] bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-8 animate-pulse text-4xl shadow-[0_0_50px_rgba(249,115,22,0.2)]">
                {selectedTool.logo}
              </div>
              <h3 className="font-serif text-3xl mb-4">Deploying System...</h3>
              <p className="text-sm text-muted-foreground mb-10 px-8">
                Configuring {selectedTool.name} for your stack. This takes a
                moment.
              </p>
              <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden mb-2">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 2 }}
                  className="h-full bg-primary shadow-[0_0_15px_rgba(249,115,22,0.5)]"
                />
              </div>
              <p className="text-[10px] font-bold text-primary animate-pulse tracking-[0.3em]">
                STACK_ACTIVE
              </p>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Upgrade / Pricing Modal */}
      <AnimatePresence>
        {showUpgradeModal && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center px-4 py-8 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowUpgradeModal(false)}
              className="absolute inset-0 bg-background/95 backdrop-blur-xl"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-4xl bg-card border border-primary/20 rounded-[2.5rem] shadow-2xl overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 blur-[120px] pointer-events-none" />
              <div className="relative z-10 p-8 md:p-12">
                <div className="flex items-center justify-between mb-10">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-primary mb-2">
                      Choose Your Edge
                    </p>
                    <h2 className="font-serif text-4xl">
                      Unlock the full vault.
                    </h2>
                    <p className="text-muted-foreground mt-2 text-sm">
                      Most founders get stuck. Pro founders get the playbooks,
                      scripts, and 1-on-1 sessions that unstick them.
                    </p>
                  </div>
                  <button
                    onClick={() => setShowUpgradeModal(false)}
                    className="p-3 hover:bg-background rounded-2xl transition-colors border border-transparent hover:border-border/40"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  {/* Pro Plan */}
                  <div className="relative p-8 rounded-[2rem] bg-primary border border-primary shadow-2xl shadow-primary/20 flex flex-col">
                    <div className="absolute -top-3 left-8 bg-primary-foreground text-primary text-[9px] font-black px-4 py-1 rounded-full tracking-widest">
                      MOST POPULAR
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center mb-6">
                      <Zap className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="font-serif text-2xl text-white mb-1">Pro</h3>
                    <p className="text-white/70 text-xs mb-6">
                      For founders who are done reading and ready to build.
                    </p>
                    <div className="mb-8">
                      <span className="font-serif text-5xl text-white">
                        $9.99
                      </span>
                      <span className="text-white/60 text-sm">/month</span>
                    </div>
                    <ul className="space-y-3 mb-8 flex-1">
                      {[
                        "Full Vault Archive — all 8+ blueprints",
                        "Daily venture drops (not just Mon & Fri)",
                        "Complete Playbook — all 28 lessons",
                        "Full 21-day roadmap with metric calculators",
                        "Priority WhatsApp / Slack support",
                      ].map((f) => (
                        <li
                          key={f}
                          className="flex gap-3 text-xs text-white/85"
                        >
                          <CheckCircle className="w-4 h-4 text-white shrink-0 mt-0.5" />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                    <button
                      onClick={() => {
                        setShowUpgradeModal(false);
                        initiatePayment("pro");
                      }}
                      className="w-full py-4 rounded-xl bg-primary-foreground text-primary font-bold text-sm hover:bg-primary-foreground/90 transition-all"
                    >
                      Upgrade to Pro — $9.99/mo
                    </button>
                  </div>

                  {/* Max Plan */}
                  <div className="p-8 rounded-[2rem] bg-card/60 border border-border/40 flex flex-col">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-6">
                      <Star className="w-5 h-5 text-primary" />
                    </div>
                    <h3 className="font-serif text-2xl mb-1">Max</h3>
                    <p className="text-muted-foreground text-xs mb-6">
                      When you need someone who has done it before to sit across
                      the table from you.
                    </p>
                    <div className="mb-8">
                      <span className="font-serif text-5xl">$49</span>
                      <span className="text-muted-foreground text-sm">
                        /month
                      </span>
                    </div>
                    <ul className="space-y-3 mb-8 flex-1">
                      {[
                        "Everything in Pro, plus:",
                        "30-min 1-on-1 coaching call every month",
                        "Private code review sessions",
                        "Private sales script reviews",
                        "Direct access on any channel",
                      ].map((f) => (
                        <li
                          key={f}
                          className="flex gap-3 text-xs text-foreground/80"
                        >
                          <CheckCircle className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                    <button
                      onClick={() => {
                        setShowUpgradeModal(false);
                        initiatePayment("max");
                      }}
                      className="w-full py-4 rounded-xl bg-foreground text-background font-bold text-sm hover:bg-primary hover:text-white transition-all"
                    >
                      Go Max — $49/mo
                    </button>
                  </div>
                </div>

                <p className="text-center text-[10px] text-muted-foreground">
                  Prefer INR pricing?{" "}
                  <button
                    onClick={() => {
                      setShowUpgradeModal(false);
                      setLocation("/");
                      setTimeout(() => {
                        const el = document.getElementById("pricing");
                        el?.scrollIntoView({ behavior: "smooth" });
                      }, 200);
                    }}
                    className="text-primary underline underline-offset-2"
                  >
                    View full pricing page →
                  </button>
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Startup Context Modal */}
      <AnimatePresence>
        {showContextModal && (
          <StartupContextModal
            email={user?.email || ""}
            onComplete={(ctx) => {
              setStartupCtx(ctx);
              setShowContextModal(false);
              toast.success("Context updated.", {
                description: "Every signal is now specific to your build.",
              });
            }}
            onDismiss={() => setShowContextModal(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
