import { useState, useEffect } from "react";
import logoPath from "@assets/logo.jpg";
import { useAuth } from "@/lib/AuthContext";
import { useClerk } from "@clerk/react";
import { useSubscriberCount } from "@/hooks/useSubscriberCount";
import FounderChat from "@/components/FounderChat";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useLocation } from "wouter";
import {
  BookOpen, ArrowRight, Zap,
  Lock, TrendingUp, Trophy, Star,
  ShieldCheck, Map, X,
  Layers, CheckCircle, Info, Terminal,
  Copy, Flame, Sparkles,
  ExternalLink, Cpu, Globe, Users as UsersIcon, Shield, Activity, Database, Boxes
} from "lucide-react";
import { typedIssues as issues, Issue } from "@/lib/data";
import { playbookModules, type Lesson } from "@/lib/playbook";
import { featuredVentures } from "@/lib/ventures";
import { roadmapSteps } from "@/lib/roadmap";
import { getDailyEdge, getFridayDropProgress, getFridayDropTeaser } from "@/lib/daily";

import { milestoneRewards, getEligibleReward, getNextReward, Reward } from "@/lib/rewards";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Globe as CobeGlobe } from "@/components/ui/cobe-globe";
import { allianceMembers } from "@/lib/alliance";
import { arsenalTools } from "@/lib/arsenal";
import PortalNav from "@/components/PortalNav";
import { getStartupContext, saveStartupContext, type StartupContext } from "@/lib/startup-context";
import StartupContextModal from "@/components/StartupContextModal";
import ContextManager from "@/components/ContextManager";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.06, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] },
  }),
};

export default function UserPortal() {
  // ── GLOBAL AUTH & TIER (resolved once in AuthContext) ──
  const { session, tier, isPremium } = useAuth();
  const { signOut } = useClerk();
  const [, setLocation] = useLocation();
  const user = session?.user;
  const firstName = user?.user_metadata?.full_name?.split(" ")[0] || user?.email?.split("@")[0] || "Reader";
  const isPro = isPremium; // alias for existing code
  const subscriberCount = useSubscriberCount();
  const [chatUsageThisMonth, setChatUsageThisMonth] = useState(0);
  const [dailyDrop, setDailyDrop] = useState<any>(null);
  const [playbookData, setPlaybookData] = useState<any[]>([]);
  const [wallMembers, setWallMembers] = useState<any[]>([]);
  const [myWallProfile, setMyWallProfile] = useState<any>(null);
  const [referralData, setReferralData] = useState<any>(null);
  const [personalizedBrief, setPersonalizedBrief] = useState<string | null>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [ownedProducts, setOwnedProducts] = useState<any[]>([]);
  const [scorecard, setScorecard] = useState<any>(null);

  // Local state
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [showPortfolioModal, setShowPortfolioModal] = useState(false);
  const [streak, setStreak] = useState(0);
  const [hasClaimedDaily, setHasClaimedDaily] = useState(false);
  const [deployedArsenal, setDeployedArsenal] = useState<string[]>([]);
  const [selectedMember, setSelectedMember] = useState<any>(null);
  const [selectedTool, setSelectedTool] = useState<any>(null);
  const [isDeploying, setIsDeploying] = useState(false);
  const [showJoinAlliance, setShowJoinAlliance] = useState(false);
  const [allianceJoinData, setAllianceJoinData] = useState<any>({});

  // Sync portal state to backend
  const syncPortalState = (newState: any) => {
    const token = session?.access_token;
    if (token) {
      fetch("/api/subscribers/me/sync", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ portalState: newState })
      }).catch(() => {});
    }
  };

  // Load persisted portal state (streak, steps, etc.) — NOT tier (that's in AuthContext now)
  useEffect(() => {
    const token = session?.access_token;
    if (token) {
      fetch(`/api/subscribers/me`, {
        headers: { "Authorization": `Bearer ${token}` }
      })
        .then(res => res.ok ? res.json() : null)
        .then(data => {
          if (!data) return;
          if (data.portalState) {
            setStreak(data.portalState.streak || 0);
            setCompletedSteps(data.portalState.completedSteps || []);
            setIsBonusUnlocked(data.portalState.unlockedItems?.includes("master-blueprint") || false);
            setDeployedArsenal(data.portalState.deployedArsenal || []);
            const today = new Date().toDateString();
            if (data.portalState.lastVisit === today) setHasClaimedDaily(true);
            const monthKey = new Date().toISOString().slice(0, 7);
            setChatUsageThisMonth((data.portalState.chatUsage?.[monthKey]) || 0);
          }
          // Fetch dynamic content
          fetch("/api/content/daily").then(res => res.ok ? res.json() : null).then(setDailyDrop);
          fetch("/api/content/playbook").then(res => res.ok ? res.json() : null).then(setPlaybookData);
          fetch("/api/walls").then(res => res.ok ? res.json() : null).then(data => data && setWallMembers(data));
          fetch("/api/walls/me", {
            headers: { "Authorization": `Bearer ${session?.access_token}` }
          }).then(res => res.ok ? res.json() : null).then(setMyWallProfile);
          fetch("/api/referrals/me", {
            headers: { "Authorization": `Bearer ${session?.access_token}` }
          }).then(res => res.ok ? res.json() : null).then(setReferralData);

          // Personalize Drop
          fetch("/api/content/daily/personalize", {
            method: "POST",
            headers: { "Authorization": `Bearer ${session?.access_token}` }
          }).then(res => res.ok ? res.json() : null).then(data => data && setPersonalizedBrief(data.personalizedBrief));

          fetch("/api/marketplace/products").then(res => res.ok ? res.json() : []).then(setProducts);
          fetch("/api/marketplace/my-purchases", {
            headers: { "Authorization": `Bearer ${session?.access_token}` }
          }).then(res => res.ok ? res.json() : []).then(setOwnedProducts);

          fetch("/api/scorecard/me", {
            headers: { "Authorization": `Bearer ${session?.access_token}` }
          }).then(res => res.ok ? res.json() : null).then(setScorecard);

          // Resolve startup context: DB first, then localStorage
          if (data.whatBuilding) {
            const dbCtx: StartupContext = {
              whatBuilding: data.whatBuilding,
              stage: (data.startupStage as StartupContext["stage"]) || "pre-revenue",
              sector: (data.startupSector as StartupContext["sector"]) || "B2B SaaS",
              targetCustomer: data.targetCustomer || "",
              biggestChallenge: (data.biggestChallenge as StartupContext["biggestChallenge"]) || "Distribution",
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
  const activePlaybook = playbookData.length > 0 ? playbookData : playbookModules;
  const activeAlliance = wallMembers.length > 0 ? wallMembers : allianceMembers;

  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [startupCtx, setStartupCtx] = useState<StartupContext | null>(null);
  const [showContextModal, setShowContextModal] = useState(false);
  const [contextChecked, setContextChecked] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [showLoginBonus, setShowLoginBonus] = useState(false);
  const [isBonusUnlocked, setIsBonusUnlocked] = useState(false);
  const [activeTab, setActiveTab] = useState<"playbook" | "path" | "vault" | "alliance" | "arsenal" | "performance" | "terminal" | "growth" | "engine">("playbook");
  
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tab = params.get("tab");
    if (tab && ["playbook", "path", "vault", "alliance", "arsenal", "performance", "terminal", "engine", "growth"].includes(tab)) {
      setActiveTab(tab as any);
    }
  }, []);

  // Live telemetry from real API
  const [telemetryLogs, setTelemetryLogs] = useState<string[]>([]);
  
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
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        const logs = data
          ? buildLogs(data.total, data.weekSignups)
          : buildLogs(0, 0);
        let i = 0;
        const interval = setInterval(() => {
          setTelemetryLogs(prev => [...prev.slice(-4), logs[i % logs.length]]);
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
          setTelemetryLogs(prev => [...prev.slice(-4), fallback[i % fallback.length]]);
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
        audio.play().catch(e => console.log("Audio requires interaction"));
      }, 1500);
    }
  }, []);

  const claimLoginBonus = () => {
    localStorage.setItem("loginBonus_" + new Date().toDateString(), "true");
    localStorage.setItem("isBonusUnlocked", "true");
    setIsBonusUnlocked(true);
    setShowLoginBonus(false);
    toast.success("Strategic Vault Unlocked", {
      description: "Access Granted to 'The 90-Day Master Blueprint' in your Vault Archive."
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
      ? completedSteps.filter(s => s !== title)
      : [...completedSteps, title];
      
    setCompletedSteps(newSteps);
    
    if (!completedSteps.includes(title)) {
      toast.success("Focus locked!", {
        description: `You've completed the ${title} stage. Keep pushing.`
      });
    }

    syncPortalState({
      streak,
      lastVisit: new Date().toDateString(),
      unlockedItems: isBonusUnlocked ? ["master-blueprint"] : [],
      completedSteps: newSteps,
      deployedArsenal
    });
  };


  const copyHack = () => {
    navigator.clipboard.writeText(dailyEdge.content);
    toast.success("Tactic Copied", {
      description: "Ready to deploy. Go build."
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
      description: "Check your email. This one's worth the read."
    });
  };

  const handleDeploy = (tool: any) => {
    if (deployedArsenal.includes(tool.id)) {
      toast.info("Already Integrated", { description: `${tool.name} is already active in your stack.` });
      return;
    }
    
    setIsDeploying(true);
    setSelectedTool(tool);
    
    setTimeout(() => {
      const newDeployed = [...deployedArsenal, tool.id];
      setDeployedArsenal(newDeployed);
      setIsDeploying(false);
      toast.success("Stack Deployed", {
        description: `${tool.name} architecture has been injected into your current build.`
      });
      
      syncPortalState({
        streak,
        lastVisit: new Date().toDateString(),
        unlockedItems: isBonusUnlocked ? ["master-blueprint"] : [],
        completedSteps,
        deployedArsenal: newDeployed
      });
    }, 2000);
  };


  const viewPortfolio = () => {
    setShowPortfolioModal(true);
  };

  const handleIssueOpen = (issue: Issue) => {
    setSelectedIssue(issue);
  };

  const latestIssue = issues.find(i => !i.isBonus) || issues[0];
  const currentPastIssues = issues.filter(i => {
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
              Every tool on this platform — the AI Advisor, the Signal Vault, the Build Brief — will be calibrated to your specific company. This takes 60 seconds. It changes everything.
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

            {/* FREE TIER HERO */}
            {tier === "free" && (
              <motion.div initial="hidden" animate="visible" variants={fadeUp} className="relative p-10 rounded-[3rem] bg-card/30 border border-primary/5 overflow-hidden group">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2 group-hover:bg-primary/10 transition-colors duration-700" />
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                    <p className="text-[10px] uppercase font-bold tracking-[0.4em] text-primary/60">System Operational • {new Date().toLocaleDateString()}</p>
                  </div>
                  <h1 className="font-serif text-5xl md:text-7xl leading-[1.1]">Good to have<br />you back, <span className="italic text-primary/90">{firstName}.</span></h1>
                  {/* Streak HERO */}
                  <div className="flex items-center gap-6 mt-8 mb-2">
                    <div className="flex items-center gap-3 px-6 py-4 rounded-2xl bg-primary/10 border border-primary/20">
                      <Flame className="w-6 h-6 text-primary" />
                      <div>
                        <p className="text-3xl font-black text-primary leading-none">{streak}</p>
                        <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-primary/60 mt-0.5">Day Streak</p>
                      </div>
                    </div>
                    {nextReward && (
                      <div className="text-xs text-muted-foreground">
                        <span className="font-bold text-foreground">{nextReward.day - streak} days</span> until {nextReward.title}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mt-6">
                    <p className="text-muted-foreground text-lg max-w-xl leading-relaxed">
                      The next drop lands Friday. Your blueprints are waiting. The only question is — what are you building this week?
                    </p>
                    {eligibleReward && (
                      <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="bg-primary/95 backdrop-blur-xl p-8 rounded-[2.5rem] text-primary-foreground shadow-[0_0_50px_rgba(249,115,22,0.3)] relative overflow-hidden group/reward min-w-[300px] border border-white/20"
                      >
                        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
                        <Sparkles className="absolute top-6 right-6 w-6 h-6 text-white/40 group-hover/reward:rotate-90 transition-transform duration-500" />
                        <div className="relative z-10">
                          <p className="text-[10px] font-bold uppercase tracking-[0.3em] mb-3 opacity-70">MILESTONE UNLOCKED: DAY {eligibleReward.day}</p>
                          <h4 className="font-serif text-2xl mb-6 leading-tight">{eligibleReward.title}</h4>
                          <button
                            onClick={() => claimReward(eligibleReward)}
                            className="w-full bg-white text-primary text-[10px] font-black py-4 rounded-2xl uppercase tracking-widest hover:bg-opacity-90 transition-all hover:translate-y-[-2px] active:translate-y-[0px] shadow-lg shadow-black/5"
                          >
                            {eligibleReward.actionLabel}
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {/* PRO TIER HERO */}
            {tier === "pro" && (
              <motion.div initial="hidden" animate="visible" variants={fadeUp} className="relative p-10 rounded-2xl bg-card/80 border border-primary/10 overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/[0.04] to-transparent h-10 w-full animate-scanline pointer-events-none" />
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-[0_0_8px_rgba(249,115,22,0.6)]" />
                    <p className="text-[10px] uppercase font-black tracking-[0.4em] text-primary/70 font-mono">Operator Mode • {new Date().toLocaleDateString()}</p>
                  </div>
                  <h1 className="font-serif text-5xl md:text-7xl leading-[1.1]">Back at it,<br /><span className="italic text-primary">{firstName}.</span></h1>
                  <p className="text-muted-foreground text-base mt-4 max-w-xl leading-relaxed">
                    Daily briefing is live. Vault is open. You've got signals to run through — let's go.
                  </p>
                  <div className="flex gap-6 p-6 mt-6 rounded-2xl bg-background/40 border border-primary/20 font-mono w-fit">
                    <div>
                      <p className="text-[9px] uppercase tracking-[0.3em] text-muted-foreground">Streak</p>
                      <p className="text-2xl font-bold text-primary">{streak}d</p>
                    </div>
                    <div className="w-px bg-border/40" />
                    <div>
                      <p className="text-[9px] uppercase tracking-[0.3em] text-muted-foreground">Vault</p>
                      <p className="text-2xl font-bold">OPEN</p>
                    </div>
                    <div className="w-px bg-border/40" />
                    <div>
                      <p className="text-[9px] uppercase tracking-[0.3em] text-muted-foreground">Briefings</p>
                      <p className="text-2xl font-bold">DAILY</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* MAX / INCUBATOR TIER HERO */}
            {(tier === "max" || tier === "incubator") && (
              <motion.div
                initial={{ opacity: 0, filter: "blur(8px)" }}
                animate={{ opacity: 1, filter: "blur(0px)" }}
                transition={{ duration: 1.2, ease: "easeOut" }}
                className="py-16 px-2"
              >
                <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-muted-foreground/60 mb-4">
                  {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
                </p>
                <h1 className="font-serif text-6xl md:text-8xl leading-[1.0] mb-8">
                  Good morning,<br /><span className="italic text-primary">{firstName}.</span>
                </h1>
                <div className="flex gap-8 pt-8 border-t border-border/20">
                  <div>
                    <p className="text-[9px] uppercase tracking-[0.3em] text-muted-foreground/60 mb-1">AI Advisor</p>
                    <p className="font-serif text-lg">Active — {20 - chatUsageThisMonth} sessions remaining</p>
                  </div>
                  <div className="w-px bg-border/20" />
                  <div>
                    <p className="text-[9px] uppercase tracking-[0.3em] text-muted-foreground/60 mb-1">Next Call</p>
                    <p className="font-serif text-lg italic">Book via Inner Circle</p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Venture Hall of Fame - High Visibility Spotlight */}
            <motion.section custom={4.5} initial="hidden" animate="visible" variants={fadeUp}>
               <div className="p-8 md:p-10 rounded-[3rem] bg-card/60 backdrop-blur-md border border-primary/20 relative overflow-hidden group shadow-2xl shadow-primary/[0.04]">
                  <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 blur-[120px] rounded-full" />
                  <div className="relative z-10 grid grid-cols-1 xl:grid-cols-12 gap-10">
                     <div className="xl:col-span-8">
                        <div className="flex items-center gap-3 mb-6">
                           <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                              <Trophy className="w-4 h-4 text-primary" />
                           </div>
                           <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-primary">Hall of Fame // Active Spotlight</p>
                        </div>
                        <h2 className="font-serif text-4xl md:text-5xl mb-4 group-hover:text-primary transition-colors">{votw?.name}</h2>
                        <p className="text-muted-foreground text-sm leading-relaxed mb-8 max-w-2xl">{votw?.whyItWon}</p>
                        <div className="flex items-center gap-6 pt-6 border-t border-border/20 w-fit">
                           <div>
                              <p className="text-[10px] font-bold text-muted-foreground uppercase mb-1">Founder</p>
                              <p className="font-serif text-lg">{votw?.founder}</p>
                           </div>
                           <div className="w-px h-8 bg-border/20" />
                           <div>
                              <p className="text-[10px] font-bold text-muted-foreground uppercase mb-1">Impact</p>
                              <p className="font-serif text-lg text-primary">{votw?.revenue}</p>
                           </div>
                        </div>
                     </div>
                     <div className="xl:col-span-4 flex flex-col justify-center gap-4">
                        <div className="p-6 rounded-3xl bg-background/50 border border-primary/10">
                           <h4 className="font-serif text-xl mb-2 flex items-center gap-2">
                             <ShieldCheck className="w-5 h-5 text-primary" /> Performance
                           </h4>
                           <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Peer-reviewed. Founder-tested.</p>
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
            <motion.section custom={5} initial="hidden" animate="visible" variants={fadeUp} className="space-y-6">

              {/* FREE: Portal Advantages */}
              {tier === "free" && (
                <>
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="font-serif text-3xl">Portal Advantages</h2>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">FREE_TIER://ECOSYSTEM_VALUE</p>
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
                          <h3 className="font-serif text-3xl mb-4">The Weekly Signal</h3>
                          <p className="text-muted-foreground text-sm leading-relaxed max-w-sm">Every Friday, one startup idea deconstructed end-to-end. Market gap, build plan, first revenue path, and copy-paste Claude prompts — so you can act before the weekend is over.</p>
                        </div>
                        <div className="flex items-center gap-4 pt-6">
                          <div className="flex -space-x-2">
                            {[1, 2, 3, 4].map(i => (
                              <div key={i} className="w-8 h-8 rounded-full border-2 border-background bg-card flex items-center justify-center overflow-hidden">
                                <div className="w-full h-full bg-primary/10 flex items-center justify-center text-[8px] font-bold">BB</div>
                              </div>
                            ))}
                          </div>
                          <span className="text-[10px] font-bold text-primary uppercase tracking-widest">Join {subscriberCount} founders</span>
                        </div>
                      </div>
                    </div>
                    <div className="p-6 rounded-[2rem] bg-primary/5 border border-primary/10 relative group hover:border-primary/30 transition-all overflow-hidden">
                      <div className="relative z-10">
                        <Terminal className="w-5 h-5 text-primary mb-4" />
                        <h4 className="font-serif text-xl mb-2">Daily Signals</h4>
                        <p className="text-[10px] text-muted-foreground leading-relaxed">One growth tactic, one market angle, every day. Pro & Max only.</p>
                      </div>
                    </div>
                    <div className="p-6 rounded-[2rem] bg-card/60 border border-border/40 relative group hover:border-primary/20 transition-all overflow-hidden">
                      <div className="relative z-10">
                        <Trophy className="w-5 h-5 text-primary mb-4" />
                        <h4 className="font-serif text-xl mb-2">Milestone Vault</h4>
                        <p className="text-[10px] text-muted-foreground leading-relaxed">Consistency compounds. Hit 30 days, unlock the full advisor stack. Hit 60, get early access to the next cohort.</p>
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
                        <p className="text-xs text-muted-foreground italic">Permanent access to all past Free Tier blueprints.</p>
                      </div>
                    </div>
                    <div className="p-8 rounded-[2.5rem] bg-background border border-border/60 hover:border-primary/20 transition-all flex items-center gap-6">
                      <div className="w-14 h-14 rounded-2xl bg-card flex items-center justify-center text-primary border border-border/40 shadow-sm">
                        <ShieldCheck className="w-7 h-7" />
                      </div>
                      <div>
                        <h4 className="font-serif text-xl mb-1">Venture Spotlight</h4>
                        <p className="text-xs text-muted-foreground italic">Benchmark your scalability against vetted Foundry winners.</p>
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
                    <p className="text-[10px] font-mono font-bold uppercase tracking-widest text-muted-foreground">PRO_TIER://FULL_ACCESS</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 grid-rows-2 gap-4 h-auto md:h-[500px]">
                    <div className="md:col-span-2 md:row-span-2 p-8 rounded-2xl bg-card/80 border border-primary/20 relative overflow-hidden group hover:border-primary/40 transition-all">
                      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/[0.04] to-transparent h-10 w-full animate-scanline pointer-events-none" />
                      <div className="relative z-10 flex flex-col h-full justify-between">
                        <div>
                          <div className="w-10 h-10 rounded-sm bg-primary/10 flex items-center justify-center text-primary mb-6 border border-primary/20">
                            <Zap className="w-5 h-5 fill-current" />
                          </div>
                          <h3 className="font-serif text-3xl mb-4">Friday Blueprint</h3>
                          <p className="font-mono text-sm text-muted-foreground leading-relaxed max-w-sm">
                            {new Date().getDay() === 5
                              ? "Friday blueprint is live. Tap to read."
                              : "Next signal drops Friday 09:00."}
                          </p>
                        </div>
                        <div className="flex items-center gap-4 pt-6 border-t border-border/20">
                          <span className="font-mono text-[10px] font-bold text-primary uppercase tracking-widest">{subscriberCount} operators active</span>
                        </div>
                      </div>
                    </div>
                    <div className="p-6 rounded-2xl bg-primary/5 border border-primary/20 relative group hover:border-primary/40 transition-all overflow-hidden">
                      <div className="relative z-10">
                        <Terminal className="w-5 h-5 text-primary mb-4" />
                        <h4 className="font-mono text-sm font-bold uppercase tracking-widest mb-2">Daily Signals</h4>
                        <p className="text-[10px] text-muted-foreground leading-relaxed font-mono">Today's operator briefing is ready.</p>
                      </div>
                    </div>
                    <div className="p-6 rounded-2xl bg-card/80 border border-border/40 relative group hover:border-primary/20 transition-all overflow-hidden">
                      <div className="relative z-10">
                        <Trophy className="w-5 h-5 text-primary mb-4" />
                        <h4 className="font-mono text-sm font-bold uppercase tracking-widest mb-2">Milestone Vault</h4>
                        <p className="text-[10px] text-muted-foreground leading-relaxed font-mono">{streak}-day streak. Next unlock at day 30.</p>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* MAX / INCUBATOR: This Week's Intelligence */}
              {(tier === "max" || tier === "incubator") && (
                <>
                  <div>
                    <h2 className="font-serif text-3xl">This Week's Intelligence</h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                      { label: "Friday Signal", val: latestIssue.title, sub: latestIssue.category || "Blueprint" },
                      { label: "AI Advisor", val: `${20 - chatUsageThisMonth} sessions`, sub: "this month" },
                      { label: "Streak", val: `${streak} days`, sub: "consecutive" },
                    ].map(item => (
                      <div key={item.label} className="p-8 border border-border/20 rounded-none">
                        <p className="text-[9px] uppercase tracking-[0.3em] text-muted-foreground/60 mb-4">{item.label}</p>
                        <p className="font-serif text-3xl mb-1">{item.val}</p>
                        <p className="text-xs text-muted-foreground">{item.sub}</p>
                      </div>
                    ))}
                  </div>
                </>
              )}

            </motion.section>

            {/* Content Discovery Tabs */}
            <div className="space-y-8">
               {/* Tab container — style varies by tier */}
               <div className={tier === "free" ? "flex items-center gap-2 p-1.5 bg-card/50 border border-border/40 rounded-2xl w-fit max-w-full overflow-x-auto no-scrollbar" : "flex items-center gap-0 w-fit max-w-full overflow-x-auto no-scrollbar"}>
                    {[
                     { id: "playbook", label: "Playbook", icon: BookOpen },
                     { id: "path", label: "Foundry Path", icon: Layers },
                     { id: "vault", label: "Vault Archive", icon: Map },
                     { id: "alliance", label: "The Alliance", icon: UsersIcon },
                     { id: "arsenal", label: "Leverage Arsenal", icon: Boxes },
                     { id: "performance", label: "Scorecard", icon: TrendingUp },
                     { id: "terminal", label: "Terminal", icon: Terminal },
                     { id: "engine", label: "Engine", icon: Cpu },
                     { id: "growth", label: "Viral Growth", icon: Flame },
                   ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={
                        tier === "pro"
                          ? `px-4 py-2 text-xs font-bold uppercase tracking-widest transition-all border-b-2 ${activeTab === tab.id ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`
                          : (tier === "max" || tier === "incubator")
                          ? `px-4 py-2 text-xs uppercase tracking-widest transition-all ${activeTab === tab.id ? "text-primary" : "text-muted-foreground hover:text-foreground"}`
                          : `flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${activeTab === tab.id ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" : "text-muted-foreground hover:text-foreground hover:bg-background/40"}`
                      }
                    >
                      {tier === "free" && <tab.icon className="w-3.5 h-3.5" />} {tab.label}
                      {tab.id === "engine" && (
                        <span className="ml-2 px-1.5 py-0.5 rounded-full bg-primary/20 text-primary text-[8px] font-bold animate-pulse">NEW</span>
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
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {activePlaybook.map((module) => (
                          <div key={module.id || module.slug} className="group flex flex-col bg-card/40 border border-border/20 rounded-[2.5rem] p-8 hover:border-primary/30 transition-all overflow-hidden relative backdrop-blur-sm shadow-xl shadow-primary/[0.02]">
                             <div className="mb-6">
                               <p className="text-[10px] font-bold uppercase tracking-widest text-primary mb-2 italic opacity-60">FOUNDRY_INTERNAL://{(module.id || module.slug).toUpperCase()}</p>
                               <h3 className="font-serif text-2xl mb-3 group-hover:text-primary transition-colors">{module.title}</h3>
                               <p className="text-xs text-muted-foreground leading-relaxed font-sans line-clamp-2">{module.description}</p>
                             </div>

                             <div className="space-y-3">
                               {module.lessons.map((lesson: any) => (
                                 <button 
                                   key={lesson.id || lesson.slug} 
                                   onClick={() => handleLessonOpen(lesson)}
                                   className={`w-full flex items-center justify-between p-3.5 rounded-2xl border transition-all text-left ${lesson.free || isPro ? "bg-background/30 border-border/40 hover:border-primary/40 hover:bg-background/50" : "bg-background/10 border-dashed border-border/20 opacity-50 cursor-not-allowed"}`}
                                 >
                                    <div className="flex items-center gap-3">
                                       {lesson.free || isPro ? <Sparkles className="w-3.5 h-3.5 text-primary" /> : <Lock className="w-3.5 h-3.5 text-muted-foreground" />}
                                       <span className="text-[11px] font-medium tracking-tight font-sans">{lesson.title}</span>
                                    </div>
                                    {lesson.free || isPro ? <ArrowRight className="w-3 h-3 text-primary" /> : <span className="text-[9px] font-bold text-muted-foreground/40 uppercase">SERIES_A</span>}
                                 </button>
                               ))}
                             </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {activeTab === "path" && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {[
                          { title: "Free", sub: "Foundations", icon: BookOpen, val: "Knowledge", detail: "Foundational blueprints and weekly market tracking." },
                          { title: "Pro", sub: "Industrial", icon: Zap, val: "Execution", detail: "Premium toolkits, scripts, and private community access." },
                          { title: "Max", sub: "Venture Elite", icon: Layers, val: "Leverage", detail: "Direct advisory, advanced networking, and scaling secrets." },
                          { title: "Incubator", sub: "Alliance", icon: Star, val: "Partnership", detail: "0-to-1 building, equity alignment, and exit strategy." }
                        ].map((tier) => (
                          <div key={tier.title} className="bg-card/40 border border-border/20 p-8 rounded-[2.5rem] relative group hover:border-primary/30 transition-all backdrop-blur-sm">
                             <div className="flex items-center gap-4 mb-6">
                                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                                   <tier.icon className="w-6 h-6" />
                                </div>
                                <div>
                                   <h3 className="font-serif text-2xl mb-0.5">{tier.title}</h3>
                                   <p className="text-[10px] font-bold uppercase tracking-widest text-primary">{tier.sub}</p>
                                </div>
                             </div>
                             <p className="text-xs text-muted-foreground leading-relaxed mb-6">{tier.detail}</p>
                             <div className="p-3 bg-primary/5 rounded-xl border border-primary/10 text-center font-bold text-[10px] uppercase tracking-tighter text-primary">
                                POWERED BY: {tier.val}
                             </div>
                          </div>
                        ))}
                      </div>
                    )}
                    {activeTab === "engine" && (
                      <div className="space-y-6">
                        <ContextManager />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="p-8 rounded-[2.5rem] bg-card/20 border border-border/40">
                             <h4 className="font-serif text-xl mb-4 flex items-center gap-2">
                               <Cpu className="w-5 h-5 text-primary" /> Proprietary Intelligence
                             </h4>
                             <p className="text-xs text-muted-foreground leading-relaxed">
                               Your Engine is currently connected to the **YC Signal Vault** and **Elite VC Persona Cluster**. All advice generated is calibrated against these proprietary datasets.
                             </p>
                          </div>
                          <div className="p-8 rounded-[2.5rem] bg-card/20 border border-border/40">
                             <h4 className="font-serif text-xl mb-4 flex items-center gap-2">
                               <Shield className="w-5 h-5 text-primary" /> Knowledge Integrity
                             </h4>
                             <p className="text-xs text-muted-foreground leading-relaxed">
                               Data uploaded to your private vault is encrypted and used only to fine-tune your specific Advisor sessions. It is never shared with other users.
                             </p>
                          </div>
                        </div>
                      </div>
                    )}
                    {activeTab === "vault" && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {currentPastIssues.map((issue) => (
                          <div 
                            key={issue.number} 
                            className={`group relative p-8 rounded-[2.5rem] border transition-all overflow-hidden ${
                              issue.isBonus 
                              ? "bg-primary/[0.03] border-primary/40 shadow-[0_0_40px_rgba(249,115,22,0.15)]" 
                              : "bg-card/40 border-border/20 hover:border-primary/20 backdrop-blur-sm shadow-xl shadow-primary/[0.02]"
                            }`}
                          >
                             {issue.isBonus && (
                               <div className="absolute top-4 right-4 flex items-center gap-2">
                                  <Sparkles className="w-3.5 h-3.5 text-primary" />
                                  <span className="text-[8px] font-bold text-primary uppercase tracking-[0.2em]">Bonus Unlock</span>
                                </div>
                             )}
                             <div className="flex items-center gap-4 mb-6">
                               <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-mono font-bold shrink-0 ${issue.isBonus ? "bg-primary text-white shadow-lg shadow-primary/20 text-[9px]" : "bg-primary/10 text-primary border border-primary/20 text-xs"}`}>
                                 {issue.isBonus ? "MB" : issue.number}
                               </div>
                               <div>
                                 <h3 className="font-serif text-xl group-hover:text-primary transition-colors leading-tight">{issue.title}</h3>
                                 <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{issue.category}</p>
                               </div>
                             </div>
                             <p className="text-xs text-muted-foreground leading-relaxed mb-6 opacity-60 line-clamp-2">{issue.tagline}</p>
                             
                             <button 
                               onClick={() => handleIssueOpen(issue)}
                               className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-primary group-hover:gap-3 transition-all"
                             >
                                Access Blueprint <ArrowRight className="w-3 h-3" />
                             </button>

                             {!isPro && !issue.isBonus && (
                               <div className="absolute inset-0 bg-background/80 backdrop-blur-[6px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                                 <div className="bg-card border border-border/40 p-8 rounded-[2.5rem] shadow-2xl flex flex-col items-center max-w-[220px]">
                                   <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                                      <Lock className="w-6 h-6 text-primary" />
                                   </div>
                                   <p className="text-[10px] font-bold text-center uppercase tracking-widest mb-6 opacity-60">Pro & Max access only</p>
                                   <button onClick={handleUpgradeClick} className="w-full bg-primary text-white text-[10px] font-bold py-3.5 rounded-full uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-[1.05] transition-transform">
                                     Unlock Full Archive
                                   </button>
                                 </div>
                               </div>
                             )}
                          </div>
                        ))}
                      </div>
                    )}

                    {activeTab === "alliance" && (
                      <div className="space-y-16">
                         {/* Global Nexus: 3D Visualization */}
                         <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-center">
                            <div className="lg:col-span-1 space-y-8">
                               <div>
                                  <div className="flex items-center gap-3 mb-4">
                                     <Globe className="w-5 h-5 text-primary animate-spin-slow" />
                                     <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Global_Nexus // Live_Network</p>
                                  </div>
                                  <h2 className="font-serif text-5xl mb-6">The Alliance Pulse.</h2>
                                  <p className="text-muted-foreground leading-relaxed">
                                     Visualize the global surge of building activity. You aren't just building a startup; you're part of a synchronized movement.
                                  </p>
                               </div>

                               <div className="p-6 rounded-[2.5rem] bg-card/40 border border-border/40 backdrop-blur-md">
                                  <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mb-4">LIVE_ACTIVITY_FEED</p>
                                  <div className="space-y-4">
                                     {[
                                       { user: "Founder_72", action: "Completed Blueprint Phase 1", time: "2m ago" },
                                       { user: "Nexus_Alpha", action: "Initialized Marketplace Asset", time: "5m ago" },
                                       { user: "Builder_Zero", action: "Referral Reward Claimed", time: "12m ago" },
                                     ].map((item, i) => (
                                       <div key={i} className="flex items-center justify-between text-[11px]">
                                          <div className="flex items-center gap-2">
                                             <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                             <span className="font-mono text-primary">{item.user}</span>
                                             <span className="text-muted-foreground ml-1">{item.action}</span>
                                          </div>
                                          <span className="text-[9px] opacity-40 font-mono">{item.time}</span>
                                       </div>
                                     ))}
                                  </div>
                               </div>
                            </div>

                            <div className="lg:col-span-2 relative h-[500px] flex items-center justify-center overflow-hidden rounded-[4rem] bg-gradient-to-b from-primary/5 to-transparent border border-primary/10">
                               <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-from)_0%,_transparent_70%)] opacity-20" />
                               <CobeGlobe
                                 className="w-[800px] h-[800px] opacity-80"
                                 markerSize={0.05}
                                 markers={[
                                   { id: "1", location: [37.7749, -122.4194], label: "SF" },
                                   { id: "2", location: [51.5074, -0.1278], label: "LON" },
                                   { id: "3", location: [1.3521, 103.8198], label: "SGP" },
                                   { id: "4", location: [19.0760, 72.8777], label: "MUM" },
                                 ]}
                               />
                            </div>
                         </div>

                         <div className="h-px bg-border/40" />
                        {/* Own Profile Management */}
                        {!myWallProfile ? (
                          <div className="p-10 rounded-[3rem] bg-primary/5 border border-primary/20 backdrop-blur-md relative overflow-hidden group">
                             <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[100px] -mr-32 -mt-32" />
                             <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                                <div className="max-w-xl">
                                   <div className="flex items-center gap-3 mb-4">
                                      <div className="px-3 py-1 rounded-full bg-primary/20 text-primary text-[10px] font-black tracking-widest">ECOSYSTEM_JOIN</div>
                                   </div>
                                   <h2 className="font-serif text-4xl mb-4">Join The Alliance.</h2>
                                   <p className="text-muted-foreground text-sm leading-relaxed">
                                      Put your startup on the map. Connect with other founders building on the Builder Brief stack. 
                                      Pro members get featured status.
                                   </p>
                                </div>
                                <button 
                                  onClick={() => {
                                    // Quick join with existing context
                                    const data = {
                                      name: user?.user_metadata?.full_name || user?.email?.split("@")[0],
                                      startupName: "Stealth Mode",
                                      sector: "SaaS",
                                      stage: "Idea",
                                      bio: "Building something new."
                                    };
                                    fetch("/api/walls/me", {
                                      method: "POST",
                                      headers: { 
                                        "Content-Type": "application/json",
                                        "Authorization": `Bearer ${session?.access_token}`
                                      },
                                      body: JSON.stringify(data)
                                    }).then(res => res.json()).then(p => {
                                      setMyWallProfile(p);
                                      setWallMembers(prev => [p, ...prev]);
                                      toast.success("Welcome to the Alliance.");
                                    });
                                  }}
                                  className="px-10 py-5 rounded-2xl bg-primary text-white font-black text-xs uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-primary/20"
                                >
                                   Initialize Profile
                                </button>
                             </div>
                          </div>
                        ) : (
                          <div className="p-6 rounded-2xl bg-card border border-border/40 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                                {myWallProfile.name[0]}
                              </div>
                              <div>
                                <p className="text-xs font-bold">{myWallProfile.name}</p>
                                <p className="text-[10px] text-muted-foreground">Your profile is {myWallProfile.isVisible ? "visible" : "hidden"}</p>
                              </div>
                            </div>
                            <button className="text-[10px] font-bold uppercase tracking-widest text-primary hover:underline">Edit Profile</button>
                          </div>
                        )}

                         <div className="h-px bg-border/40" />

                         {/* Co-Founder Nexus: AI Matching */}
                         {scorecard && (
                           <div className="p-10 rounded-[3rem] bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-primary/20 relative overflow-hidden">
                              <div className="absolute top-0 right-0 p-8 opacity-10">
                                 <Zap className="w-20 h-20 text-primary" />
                              </div>
                              <div className="relative z-10">
                                 <div className="flex items-center gap-3 mb-4">
                                    <Sparkles className="w-4 h-4 text-primary animate-pulse" />
                                    <p className="text-[10px] font-black uppercase tracking-widest text-primary">Nexus_Matching // Talent_Layer</p>
                                 </div>
                                 <h2 className="font-serif text-4xl mb-6">Co-Founder Matches.</h2>
                                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                    {wallMembers.filter(m => m.id !== myWallProfile?.id).slice(0, 3).map((match, i) => (
                                      <div key={i} className="p-8 rounded-[2.5rem] bg-background/60 border border-border/40 backdrop-blur-sm group hover:border-primary/40 transition-all">
                                         <p className="text-[9px] font-black uppercase tracking-widest text-primary mb-4">92%_COMPATIBILITY</p>
                                         <h3 className="font-serif text-2xl mb-2">{match.name}</h3>
                                         <p className="text-xs text-muted-foreground mb-6">Looking for: <span className="text-primary font-bold">{(match.lookingFor || ["GTM Support"])[0]}</span></p>
                                         <button className="w-full py-4 rounded-2xl bg-primary/5 border border-primary/20 text-[10px] font-bold uppercase tracking-widest hover:bg-primary hover:text-white transition-all">
                                            Request Intro
                                         </button>
                                      </div>
                                    ))}
                                 </div>
                              </div>
                           </div>
                         )}

                         <div className="h-px bg-border/40" />

                         <div>
                            <div className="flex items-center justify-between mb-8">
                               <h3 className="font-serif text-3xl">Vetted Directory</h3>
                               {!myWallProfile && (
                                 <button 
                                   onClick={() => setShowJoinAlliance(true)}
                                   className="px-6 py-3 rounded-xl bg-primary text-white text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-lg shadow-primary/20"
                                 >
                                    Initialize Profile
                                 </button>
                               )}
                            </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {activeAlliance.map((member) => (
                            <div 
                              key={member.id} 
                              onClick={() => setSelectedMember(member)}
                              className={`p-8 rounded-[2.5rem] bg-card/40 border ${member.is_featured ? "border-primary/40 shadow-primary/[0.05]" : "border-border/20"} backdrop-blur-sm relative group hover:border-primary/40 transition-all overflow-hidden shadow-xl cursor-pointer`}
                            >
                               <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl" />
                               <div className="relative z-10">
                                  <div className="flex items-center justify-between mb-6">
                                     <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                                        <UsersIcon className="w-6 h-6" />
                                     </div>
                                     <Badge className={`border-none text-[8px] tracking-[0.2em] px-3 py-1 ${member.status === "exited" ? "bg-emerald-500/10 text-emerald-500" : (member.status === "scaling" || member.is_featured) ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
                                        {(member.status || (member.is_featured ? "PRO" : "BUILDING")).toUpperCase()}
                                     </Badge>
                                  </div>
                                  <h3 className="font-serif text-2xl mb-1">{member.name}</h3>
                                  <p className="text-[10px] font-bold uppercase tracking-widest text-primary/60 mb-4">{member.role || member.sector || "FOUNDER"}</p>
                                  
                                  {member.skills && (
                                     <div className="flex flex-wrap gap-1.5 mb-6">
                                        {member.skills.map((s: string) => (
                                          <Badge key={s} variant="outline" className="text-[7px] py-0 border-primary/10 text-primary/80">{s.toUpperCase()}</Badge>
                                        ))}
                                     </div>
                                  )}

                                  <div className="space-y-4 pt-4 border-t border-border/20">
                                     <div>
                                        <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-1">{member.specialty ? "Specialty" : "Stage"}</p>
                                        <p className="text-xs font-medium">{member.specialty || member.stage}</p>
                                     </div>
                                     <div>
                                        <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Active Venture</p>
                                        <p className="text-xs font-serif italic text-primary">{member.currentVenture || member.startupName}</p>
                                     </div>
                                  </div>
                               </div>
                               <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-primary/10">
                                  <motion.div 
                                    initial={{ width: 0 }}
                                    animate={{ width: member.status === "exited" ? "100%" : (member.status === "scaling" || member.is_featured) ? "70%" : "30%" }}
                                    transition={{ duration: 1.5, ease: "easeOut" }}
                                    className="h-full bg-primary"
                                  />
                               </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    )}

                    {activeTab === "performance" && (
                      <div className="max-w-5xl mx-auto py-12">
                         {!scorecard ? (
                           <div className="text-center py-24 bg-card/40 border border-border/40 rounded-[3rem] backdrop-blur-md">
                              <TrendingUp className="w-16 h-16 mx-auto mb-8 text-primary opacity-20" />
                              <h2 className="font-serif text-4xl mb-4">Initialize Your Scorecard.</h2>
                              <p className="text-muted-foreground mb-12 max-w-lg mx-auto">Get an AI-powered diagnostic of your startup's current health and a 7-day tactical execution roadmap.</p>
                              <button 
                                onClick={async () => {
                                  const tid = toast.loading("Analyzing startup context...");
                                  const res = await fetch("/api/scorecard/generate", { 
                                    method: "POST", 
                                    headers: { "Authorization": `Bearer ${session?.access_token}` }
                                  });
                                  if (res.ok) {
                                    const data = await res.json();
                                    setScorecard(data);
                                    toast.success("Scorecard Generated", { id: tid });
                                  } else {
                                    toast.error("Analysis failed", { id: tid });
                                  }
                                }}
                                className="px-12 py-5 rounded-[2rem] bg-primary text-white font-black text-xs uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-primary/20"
                              >
                                 Generate Diagnostic
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
                                    <p className="text-[10px] font-black uppercase tracking-widest mb-2 opacity-60">FOUNDRY_SCORE</p>
                                    <h3 className="font-serif text-8xl mb-4">{scorecard.score}</h3>
                                    <p className="text-sm font-medium leading-relaxed opacity-90 italic">"{scorecard.verdict}"</p>
                                 </div>

                                 <div className="p-8 rounded-[3rem] bg-card border border-border/40 space-y-6">
                                    {Object.entries(scorecard.breakdown).map(([key, val]: [string, any]) => (
                                      <div key={key}>
                                         <div className="flex justify-between mb-2">
                                            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{key}</span>
                                            <span className="text-[10px] font-black text-primary">{val}%</span>
                                         </div>
                                         <div className="w-full h-1.5 bg-background rounded-full overflow-hidden">
                                            <motion.div initial={{ width: 0 }} animate={{ width: `${val}%` }} className="h-full bg-primary" />
                                         </div>
                                      </div>
                                    ))}
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
                                      <div key={i} className="p-6 rounded-3xl bg-card border border-border/40 hover:border-primary/20 transition-all group">
                                         <div className="flex gap-6">
                                            <div className="w-12 h-12 rounded-2xl bg-background flex-shrink-0 flex items-center justify-center font-mono font-bold text-primary border border-border/40">
                                               D{step.day}
                                            </div>
                                            <div>
                                               <h4 className="font-bold mb-1 text-lg group-hover:text-primary transition-colors">{step.task}</h4>
                                               <p className="text-xs text-muted-foreground uppercase tracking-widest font-black text-[9px] mb-1">GOAL: {step.goal}</p>
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
                                  <span className="text-[10px] font-bold text-primary/60 uppercase tracking-widest">Foundry_OS // v0.9.1-Alpha</span>
                               </div>
                               <Badge className="bg-primary/10 text-primary border-primary/20">{tier.toUpperCase()}_SESSION</Badge>
                            </div>

                            {/* Terminal Output */}
                            <div className="flex-1 overflow-y-auto space-y-4 mb-8 text-sm">
                               <p className="text-primary/40 leading-relaxed">
                                  Welcome to the Foundry Terminal. Accessing intelligence nodes... <br />
                                  Type /market-scan, /roast, or /sprint to begin.
                               </p>
                               <div className="text-primary/60 border-l border-primary/20 pl-4 py-2 bg-primary/5 rounded-r-xl">
                                  SYSTEM: Intelligence energy at 100%. Ready for commands.
                               </div>
                            </div>

                            {/* Terminal Input */}
                            <div className="relative mt-auto">
                               <div className="absolute left-0 top-1/2 -translate-y-1/2 text-primary font-bold">{">"}</div>
                               <input 
                                 type="text"
                                 placeholder="Enter Command..."
                                 onKeyDown={async (e) => {
                                   if (e.key === "Enter") {
                                     const input = (e.target as HTMLInputElement).value;
                                     (e.target as HTMLInputElement).value = "";
                                     
                                     const tid = toast.loading(`Executing ${input}...`);
                                     const [cmd, ...args] = input.split(" ");
                                     
                                     const res = await fetch("/api/terminal/command", {
                                       method: "POST",
                                       headers: { 
                                         "Content-Type": "application/json",
                                         "Authorization": `Bearer ${session?.access_token}`
                                       },
                                       body: JSON.stringify({ command: cmd, args: args.join(" ") })
                                     });
                                     
                                     if (res.ok) {
                                       const data = await res.json();
                                       toast.success("Command Output Received", { 
                                         id: tid, 
                                         description: data.output,
                                         duration: 10000 
                                       });
                                     } else {
                                       toast.error("Execution failed", { id: tid });
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
                            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-20 h-20 bg-primary/10 rounded-[2rem] flex items-center justify-center text-primary mx-auto mb-8 border border-primary/20">
                               <Flame className="w-10 h-10" />
                            </motion.div>
                            <h2 className="font-serif text-5xl mb-6">Multiply Your Edge.</h2>
                            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                               Invite 3 founders to the Builder Brief. Get 1 month of Pro access free. 
                               They get the "90-Day Master Blueprint" immediately.
                            </p>
                         </div>

                         <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="p-10 rounded-[3rem] bg-card border border-border/40 relative overflow-hidden">
                               <div className="absolute top-0 right-0 p-8 text-primary/10">
                                  <Trophy className="w-20 h-20" />
                               </div>
                               <div className="relative z-10">
                                  <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-2">YOUR_PROGRESS</p>
                                  <h3 className="font-serif text-3xl mb-8">{referralData?.referralCount || 0} / 3 Referred</h3>
                                  
                                  <div className="w-full h-3 bg-background rounded-full overflow-hidden mb-6 border border-border/40">
                                     <motion.div 
                                       initial={{ width: 0 }}
                                       animate={{ width: `${Math.min(((referralData?.referralCount || 0) / 3) * 100, 100)}%` }}
                                       className="h-full bg-primary shadow-[0_0_20px_rgba(249,115,22,0.4)]"
                                     />
                                  </div>
                                  <p className="text-sm text-muted-foreground">
                                     {3 - (referralData?.referralCount || 0) > 0 
                                       ? `Just ${3 - (referralData?.referralCount || 0)} more to unlock your reward.`
                                       : "Reward Unlocked! Check your email for activation."}
                                  </p>
                               </div>
                            </div>

                            <div className="p-10 rounded-[3rem] bg-primary/5 border border-primary/20 relative overflow-hidden">
                               <div className="relative z-10">
                                  <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-2">SHARE_CODE</p>
                                  <h3 className="font-serif text-3xl mb-8">Viral Blueprint</h3>
                                  
                                  <div className="flex items-center gap-2 p-4 bg-background border border-border/40 rounded-2xl mb-6 font-mono text-lg font-bold text-center justify-center tracking-widest">
                                     {referralData?.referralCode || "LOADING..."}
                                  </div>

                                  <button 
                                    onClick={() => {
                                      navigator.clipboard.writeText(referralData?.shareUrl || "");
                                      toast.success("Link Copied", { description: "Time to build the network." });
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
                    {activeTab === "arsenal" && (
                      <div className="space-y-12">
                         {/* Premium Marketplace Section */}
                         <div>
                            <div className="flex items-center gap-3 mb-8">
                               <Sparkles className="w-6 h-6 text-primary" />
                               <h2 className="font-serif text-4xl">Premium Blueprints</h2>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                               {products.map((product) => {
                                 const isOwned = ownedProducts.some(p => p.productId === product.id);
                                 return (
                                   <div key={product.id} className="p-8 rounded-[2.5rem] bg-card border border-border/40 relative overflow-hidden group hover:border-primary/40 transition-all">
                                      <div className="absolute top-0 right-0 p-8 text-primary/10 group-hover:scale-110 transition-transform">
                                         <Boxes className="w-16 h-16" />
                                      </div>
                                      <div className="relative z-10">
                                         <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">{product.category.toUpperCase()}</Badge>
                                         <h3 className="font-serif text-2xl mb-2">{product.name}</h3>
                                         <p className="text-xs text-muted-foreground mb-8 line-clamp-2">{product.description}</p>
                                         
                                         <div className="flex items-center justify-between">
                                            <span className="font-mono text-xl font-bold">${product.price}</span>
                                            {isOwned ? (
                                              <button className="px-6 py-3 rounded-xl bg-emerald-500/10 text-emerald-500 text-[10px] font-black uppercase tracking-widest border border-emerald-500/20">
                                                 OWNED
                                              </button>
                                            ) : (
                                              <button className="px-6 py-3 rounded-xl bg-primary text-white text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-lg shadow-primary/20">
                                                 ACQUIRE_ASSET
                                              </button>
                                            )}
                                         </div>
                                      </div>
                                   </div>
                                 );
                               })}
                            </div>
                         </div>

                         <div className="h-px bg-border/40" />

                         <div className="relative">
                            <div className="flex items-center gap-3 mb-8">
                               <Terminal className="w-6 h-6 text-primary" />
                               <h2 className="font-serif text-4xl">Operator Tooling</h2>
                            </div>
                            <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ${!isPro ? "pointer-events-none select-none opacity-40" : ""}`}>
                          {arsenalTools.map((tool) => (
                            <div key={tool.id} className="p-8 rounded-[2.5rem] bg-background border border-border/60 group relative overflow-hidden shadow-lg shadow-black/[0.02]">
                               <div className="absolute top-0 right-0 p-4 opacity-10">
                                  <p className="font-mono text-4xl font-black">{tool.logo}</p>
                               </div>
                               <div className="relative z-10 h-full flex flex-col">
                                  <div className="mb-8">
                                     <Badge variant="outline" className="border-primary/20 text-primary text-[8px] tracking-[0.2em] mb-4">{tool.category.toUpperCase()} TOOL</Badge>
                                     <h3 className="font-serif text-3xl mb-2">{tool.name}</h3>
                                     <p className="text-xs text-muted-foreground leading-relaxed font-sans">{tool.description}</p>
                                  </div>
                                  <div className="mt-auto">
                                     <div className="p-4 rounded-2xl bg-primary/5 border border-primary/20 mb-6">
                                        <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-primary mb-1">Founder Advantage</p>
                                        <p className="text-[11px] font-medium italic">{tool.perk}</p>
                                     </div>
                                     <button onClick={() => handleDeploy(tool)} className="w-full py-4 border border-border/60 hover:border-primary/40 rounded-2xl text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all">
                                        Deploy Stack <ExternalLink className="w-3 h-3" />
                                     </button>
                                  </div>
                               </div>
                            </div>
                          ))}
                        </div>
                        {/* Coming Soon overlay for Free tier */}
                        {!isPro && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="bg-card/90 backdrop-blur-md border border-primary/20 rounded-[3rem] p-12 text-center shadow-2xl shadow-primary/10 max-w-sm mx-auto">
                              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
                                <Boxes className="w-8 h-8 text-primary" />
                              </div>
                              <Badge className="bg-primary text-white border-none text-[8px] tracking-[0.3em] mb-4">PRO & MAX EXCLUSIVE</Badge>
                              <h3 className="font-serif text-3xl mb-3">Leverage Arsenal</h3>
                              <p className="text-sm text-muted-foreground leading-relaxed">Full tool integrations and one-click deployment rails are locked. Upgrade to access.</p>
                              <button onClick={handleUpgradeClick} className="mt-6 w-full py-4 bg-primary text-white rounded-full text-[10px] font-bold uppercase tracking-widest hover:scale-105 transition-transform">
                                Unlock Arsenal
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    )}
                  </motion.div>
               </AnimatePresence>

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
                     <Badge className="bg-primary/10 text-primary border-none text-[10px] px-4">ISSUE #{selectedIssue.number}</Badge>
                     <button onClick={() => setSelectedIssue(null)} className="p-2 hover:bg-background rounded-full transition-colors">
                        <ArrowRight className="w-5 h-5 rotate-180" />
                     </button>
                  </div>

                  <h2 className="font-serif text-4xl md:text-5xl mb-2">{selectedIssue.title}</h2>
                  <p className="text-primary font-bold uppercase tracking-[0.3em] text-[10px] mb-8 italic">{selectedIssue.category} • TAM: {selectedIssue.tam}</p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-12">
                     <div>
                        <h4 className="text-[10px] font-bold uppercase text-muted-foreground mb-4 flex items-center gap-2">
                           <Info className="w-3.5 h-3.5" /> Logical Problem
                        </h4>
                        <p className="text-sm text-foreground/80 leading-relaxed font-sans">{selectedIssue.problem}</p>
                     </div>
                     <div>
                        <h4 className="text-[10px] font-bold uppercase text-muted-foreground mb-4 flex items-center gap-2">
                           <Zap className="w-3.5 h-3.5 shadow-sm" /> The Distribution Why
                        </h4>
                        {Array.isArray(selectedIssue.whyNow) ? (
                           <ul className="space-y-3">
                           {selectedIssue.whyNow.map((why, i) => (
                             <li key={i} className="text-xs flex items-start gap-2 text-muted-foreground">
                                <span className="w-1 h-1 rounded-full bg-primary mt-1.5 shrink-0" />
                                {why}
                             </li>
                           ))}
                        </ul>
                        ) : (
                           <p className="text-sm text-muted-foreground leading-relaxed">{selectedIssue.whyNow}</p>
                        )}
                     </div>
                  </div>

                  <div className="space-y-8">
                     <div className="p-8 rounded-[2rem] bg-background/50 border border-primary/10">
                        <h4 className="text-[10px] font-bold uppercase text-primary mb-6 flex items-center gap-2 tracking-widest">
                           <Terminal className="w-4 h-4" /> Architectural Blueprint
                        </h4>
                        <div className="space-y-4">
                           {(selectedIssue.blueprint ?? selectedIssue.buildBrief ?? []).map((step, i) => (
                             <div key={i} className="flex gap-4 p-4 rounded-xl bg-card border border-border/40 hover:border-primary/20 transition-all group">
                                <span className="font-mono text-xs text-primary/40 font-bold">0{i+1}</span>
                                <p className="text-xs text-foreground/90 font-medium">{step}</p>
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
                             <div key={i} className="bg-background/80 p-4 rounded-xl border border-border/40 font-mono text-[11px] leading-relaxed relative group">
                                <button 
                                  onClick={() => {
                                    navigator.clipboard.writeText(prompt);
                                    toast.success("Prompt Copied", {
                                      description: "Industrial injection ready."
                                    });
                                  }}
                                  className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity p-2 bg-card rounded-md border border-border/40"
                                >
                                   <Copy className="w-3 h-3 text-primary" />
                                </button>
                                <span className="text-primary mr-2 italic">PROMPT_{i+1}:</span> {prompt}
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
          </div>

          {/* Right Sidebar Intelligence Feed (4 columns) */}
          <div className="lg:col-span-4 space-y-10">
            
            {/* The Intelligence Feed (formerly Daily Edge) */}
            <div className="sticky top-28 space-y-8">
               {/* Redesigned Foundry Terminal Widget - Premium Industrial Cream */}
               <div className="p-8 rounded-[2.5rem] bg-card/40 border border-primary/20 relative overflow-hidden group shadow-2xl shadow-primary/[0.03] backdrop-blur-xl hover:border-primary/40 transition-colors duration-500">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl animate-pulse" />
                  <div className="relative z-10">
                     <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-2.5">
                           <div className="flex gap-1.5">
                              <div className="w-2 h-2 rounded-full bg-primary/20" />
                              <div className="w-2 h-2 rounded-full bg-primary/40" />
                              <div className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-[0_0_8px_rgba(249,115,22,0.5)]" />
                           </div>
                           <Activity className="w-3.5 h-3.5 text-primary ml-2 animate-telemetry" />
                           <span className="text-[9px] font-black uppercase tracking-[0.3em] text-primary/70">FOUNDRY_TELEMETRY</span>
                        </div>
                        <Badge className="bg-primary/5 text-primary text-[8px] border-primary/20 px-3">ACTIVE_SYNC</Badge>
                     </div>
                     
                     <div className="space-y-4 font-mono text-[10px] text-muted-foreground leading-relaxed min-h-[120px]">

                        {telemetryLogs.map((log, idx) => (
                           <motion.div 
                             key={idx}
                             initial={{ opacity: 0, x: -5 }}
                             animate={{ opacity: 1, x: 0 }}
                             className="flex gap-3"
                           >
                              <span className="text-primary/30">[{new Date().toLocaleTimeString([], { hour12: false })}]</span>
                              <span>{log}</span>
                           </motion.div>
                        ))}
                        <motion.div 
                          animate={{ opacity: [1, 0] }}
                          transition={{ repeat: Infinity, duration: 0.8 }}
                          className="w-2 h-3 bg-primary/50"
                        />
                     </div>
                  </div>
                  {/* Digital scanline effect */}
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/[0.05] to-transparent h-10 w-full animate-scanline pointer-events-none" />
               </div>

               <div className="p-8 rounded-[2.5rem] bg-card border border-primary/20 relative overflow-hidden group shadow-2xl shadow-primary/[0.05]">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-3xl" />
                  <div className="relative z-10">
                     <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-2.5">
                           <div className="flex gap-1">
                              <div className="w-2 h-2 rounded-full bg-red-400/20" />
                              <div className="w-2 h-2 rounded-full bg-amber-400/20" />
                              <div className="w-2 h-2 rounded-full bg-emerald-400/20" />
                           </div>
                           <Terminal className="w-3.5 h-3.5 text-primary ml-2" />
                           <span className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-80">Signals_Feed</span>
                        </div>
                        <Badge className="bg-primary/10 text-primary text-[8px] tracking-tight border-primary/20">LIVE_24H</Badge>
                     </div>
                     
                     <div className="space-y-6 relative">
                        {/* Scanline effect */}
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/[0.02] to-transparent h-2 w-full animate-scanline pointer-events-none" />
                        
                        <div>
                           <h3 className="font-serif text-2xl mb-2 group-hover:text-primary transition-colors">{dailyEdge.title}</h3>
                           <p className="text-[9px] uppercase font-bold tracking-widest text-primary/60 mb-6 flex items-center gap-2">
                              {dailyEdge.category} <span className="w-1 h-1 rounded-full bg-primary/30" /> {dailyEdge.value}
                           </p>

                           {/* AI Personalized Application */}
                           {personalizedBrief && (
                             <motion.div 
                               initial={{ opacity: 0, y: -10 }}
                               animate={{ opacity: 1, y: 0 }}
                               className="mb-6 p-5 rounded-2xl bg-primary/10 border border-primary/20 relative overflow-hidden group/ai"
                             >
                                <div className="absolute top-0 right-0 p-3 opacity-10 group-hover/ai:rotate-12 transition-transform">
                                   <Cpu className="w-6 h-6" />
                                </div>
                                <div className="flex items-center gap-2 mb-2">
                                   <Sparkles className="w-3 h-3 text-primary animate-pulse" />
                                   <p className="text-[9px] font-black uppercase tracking-[0.2em] text-primary">Founder_Alignment</p>
                                </div>
                                <p className="text-[11px] font-medium leading-relaxed italic text-foreground">
                                   "{personalizedBrief}"
                                </p>
                             </motion.div>
                           )}

                           <div className="p-5 rounded-2xl bg-background/60 border border-primary/20 font-mono text-xs leading-relaxed text-foreground/80 mb-6 relative group overflow-hidden">
                              <motion.span 
                                animate={{ opacity: [1, 0] }}
                                transition={{ repeat: Infinity, duration: 0.8 }}
                                className="absolute left-5 top-5 text-primary"
                              >
                                _
                              </motion.span>
                              <div className="pl-4">
                                 {dailyEdge.content}
                              </div>
                           </div>
                           <button onClick={copyHack} className="group/btn flex items-center gap-2 text-primary font-bold text-[10px] uppercase tracking-[0.2em] hover:translate-x-1 transition-all">
                              {dailyEdge.actionLabel} 
                              <div className="relative overflow-hidden w-3 h-3">
                                 <Copy className="w-3 h-3 transition-transform group-hover/btn:-translate-y-full" />
                                 <Copy className="w-3 h-3 absolute top-full transition-transform group-hover/btn:-translate-y-full" />
                              </div>
                           </button>
                        </div>
                     </div>
                  </div>
               </div>

               {/* Momentum & Goal Rail */}
               <div className="p-8 rounded-[2.5rem] bg-primary/[0.03] border border-border/40 backdrop-blur-sm">
                  <div className="flex items-center gap-3 mb-8">
                     <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
                        <Map className="w-4 h-4 text-primary" />
                     </div>
                     <span className="text-[10px] font-bold uppercase tracking-widest">Roadmap Status</span>
                  </div>
                  <div className="space-y-8 relative">
                    <div className="absolute left-4 top-2 bottom-2 w-px bg-border/40" />
                    {roadmapSteps.map((step, idx) => {
                      const isLockedForUser = (step as any).proOnly && !isPro;
                      return (
                      <div
                       key={idx}
                       className={`relative pl-10 group cursor-pointer`}
                       onClick={() => !isLockedForUser && toggleStep(step.title)}
                      >
                         <div className={`absolute left-0 top-0 w-8 h-8 rounded-full border-2 flex items-center justify-center z-10 transition-colors ${
                           completedSteps.includes(step.title)
                           ? "bg-primary border-primary"
                           : isLockedForUser
                           ? "bg-background border-border/30"
                           : "bg-background border-border"
                         }`}>
                            {completedSteps.includes(step.title)
                            ? <CheckCircle className="w-4 h-4 text-white" />
                            : isLockedForUser
                            ? <Lock className="w-3 h-3 text-muted-foreground/40" />
                            : <span className="text-[10px] font-bold">{idx + 1}</span>}
                         </div>

                         <div className={`transition-transform group-hover:translate-x-1 ${isLockedForUser ? "select-none" : ""}`}>
                            <h4 className={`text-xs font-bold uppercase tracking-widest mb-1 ${completedSteps.includes(step.title) ? "text-primary" : isLockedForUser ? "text-muted-foreground/40" : "text-foreground"}`}>{step.title}</h4>
                            <p className={`text-[10px] mb-2 ${isLockedForUser ? "text-muted-foreground/30" : "text-muted-foreground"}`}>{step.day}</p>
                            {isLockedForUser ? (
                               <button onClick={(e) => { e.stopPropagation(); handleUpgradeClick(); }} className="text-[8px] font-bold uppercase tracking-widest text-primary/60 hover:text-primary transition-colors">
                                 Unlock with Pro →
                               </button>
                            ) : completedSteps.includes(step.title) && (
                               <Badge className="bg-primary/10 text-primary text-[8px] py-0 border-none">COMPLETE</Badge>
                            )}
                         </div>
                      </div>
                      );
                    })}
                 </div>

                  {!isPro && (
                     <button onClick={handleUpgradeClick} className="mt-10 w-full py-4 rounded-2xl bg-foreground text-background text-xs font-bold uppercase tracking-widest hover:bg-primary transition-all">
                        Unlock Days 11–21 →
                     </button>
                  )}
               </div>

               {/* Friday Drop Teaser — Free + Pro only */}
               {(tier === "free" || tier === "pro") && (() => {
                 const dropPct = getFridayDropProgress();
                 const teaser = getFridayDropTeaser();
                 const isFriday = new Date().getDay() === 5;
                 return (
                 <div className="p-8 rounded-[2.5rem] bg-gradient-to-br from-card to-card/40 border border-primary/30 relative overflow-hidden group shadow-2xl shadow-primary/[0.08]">
                   <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/10 blur-[80px] group-hover:bg-primary/20 transition-colors" />
                   <div className="relative z-10">
                      <div className="flex items-center justify-between mb-6">
                         <div className="flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-primary" />
                            <span className="text-[10px] font-bold uppercase tracking-widest">Friday Drop</span>
                         </div>
                         {isFriday
                           ? <Badge className="bg-primary text-white text-[8px] border-none">LIVE NOW</Badge>
                           : <Badge className="bg-primary/20 text-primary text-[8px] animate-pulse border-primary/30">IN PROGRESS</Badge>
                         }
                      </div>
                      
                      {/* Tease the niche only — full title on Friday */}
                      <p className="text-[9px] uppercase font-bold tracking-widest text-primary/60 mb-2">{teaser.niche} // This Week's Signal</p>
                      <h3 className={`font-serif text-2xl mb-2 group-hover:text-primary transition-colors ${!isFriday ? "blur-[3px] select-none" : ""}`}>
                        {isFriday ? "This Week's Blueprint — Full Access" : "Classified Until Friday 09:00 AM"}
                      </h3>
                      <p className="text-[10px] text-muted-foreground leading-relaxed italic mb-6">
                        "{teaser.hook}"
                      </p>
                      
                      <div className="flex items-center gap-3 opacity-60 mb-6">
                         <ShieldCheck className="w-4 h-4 text-primary" />
                         <span className="text-[10px] font-medium">Technical Audit Status: PASS — Ready for Release</span>
                      </div>
                      
                      <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden mb-2">
                         <motion.div
                           initial={{ width: 0 }}
                           animate={{ width: `${dropPct}%` }}
                           transition={{ duration: 1.5, ease: "easeOut" }}
                           className="bg-primary h-full shadow-[0_0_10px_rgba(249,115,22,0.3)]"
                         />
                      </div>
                      <p className="text-[8px] text-right font-bold text-primary/60 uppercase tracking-widest">{dropPct}% Architected</p>
                   </div>
                 </div>
                 );
               })()}

               {/* AI Advisor — Pro/Max only */}
               {isPro && (
                 <div id="ai-advisor-chat">
                   <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3">AI Advisor</p>
                   <FounderChat
                     usedThisMonth={chatUsageThisMonth}
                     onUsageUpdate={(next) => setChatUsageThisMonth(next)}
                   />
                 </div>
               )}

               {/* Context Engine Widget */}
               <div className="p-8 rounded-[2.5rem] bg-card border border-border/30 relative overflow-hidden">
                 <div className="flex items-center gap-3 mb-4">
                   <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
                     <Cpu className="w-3.5 h-3.5 text-primary" />
                   </div>
                   <span className="text-[10px] font-bold uppercase tracking-[0.25em]">Context Engine</span>
                   {startupCtx && <div className="w-2 h-2 rounded-full bg-primary animate-pulse ml-auto" />}
                 </div>
                 {startupCtx ? (
                   <>
                     <p className="text-sm font-serif mb-1 line-clamp-2">{startupCtx.whatBuilding}</p>
                     <p className="text-[10px] text-muted-foreground mb-4">{startupCtx.sector} · {startupCtx.stage}</p>
                     <p className="text-[10px] text-muted-foreground leading-relaxed line-clamp-2 mb-4 italic">"{startupCtx.biggestChallenge}"</p>
                     <button onClick={() => setShowContextModal(true)} className="text-[9px] font-bold uppercase tracking-widest text-primary hover:underline">Update Context →</button>
                   </>
                 ) : (
                   <>
                     <p className="text-xs text-muted-foreground leading-relaxed mb-5">Set your startup context. Every signal, metric, and blueprint becomes specific to your build.</p>
                     <button onClick={() => setShowContextModal(true)} className="w-full py-3 rounded-xl bg-primary/10 border border-primary/20 text-[10px] font-bold uppercase tracking-widest text-primary hover:bg-primary hover:text-white transition-all">
                       Activate Context →
                     </button>
                   </>
                 )}
               </div>

               {/* FREE: Upgrade CTA */}
               {tier === "free" && (
                 <div className="p-8 rounded-[2.5rem] border border-primary/20 bg-gradient-to-br from-primary/10 to-transparent">
                    <div className="flex items-center gap-3 mb-4 text-primary">
                       <Zap className="w-5 h-5 fill-current" />
                       <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Ready to Move Faster?</span>
                    </div>
                    <h3 className="font-serif text-2xl mb-3 italic text-primary">Stop reading. Start building.</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed mb-6">Pro gives you the full vault, the playbook, and the AI Advisor. Max adds a 30-minute monthly call with someone who has actually done it.</p>
                    <button onClick={handleUpgradeClick} className="w-full py-3 bg-primary/10 rounded-xl text-center text-[10px] font-bold uppercase tracking-widest text-primary hover:bg-primary hover:text-white transition-all">
                       See What You're Missing →
                    </button>
                 </div>
               )}

               {/* PRO: Today's Briefing */}
               {tier === "pro" && (
                 <div className="p-8 rounded-2xl bg-card/80 border border-primary/20">
                   <div className="flex items-center gap-2 mb-4">
                     <Terminal className="w-4 h-4 text-primary" />
                     <span className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-primary">Today's Briefing</span>
                   </div>
                   <h3 className="font-serif text-xl mb-2">{dailyEdge.title}</h3>
                   <p className="font-mono text-[10px] text-muted-foreground leading-relaxed line-clamp-4 mb-4">{dailyEdge.content}</p>
                   <button onClick={copyHack} className="w-full py-3 rounded-sm bg-primary/10 border border-primary/20 text-[10px] font-mono font-bold uppercase tracking-widest text-primary hover:bg-primary hover:text-white transition-all">
                     Copy Tactic →
                   </button>
                 </div>
               )}

               {/* MAX: Your 100-Day Arc + AI Advisor CTA */}
               {(tier === "max" || tier === "incubator") && (
                 <>
                   <div className="p-8 border border-border/20 rounded-none">
                     <p className="text-[9px] uppercase tracking-[0.3em] text-muted-foreground/60 mb-6">Your 100-Day Arc</p>
                     <div className="space-y-3">
                       {roadmapSteps.map((step, idx) => (
                         <div key={idx} onClick={() => toggleStep(step.title)} className="flex items-center gap-3 cursor-pointer group">
                           <div className={`w-4 h-4 border flex-shrink-0 flex items-center justify-center transition-colors ${completedSteps.includes(step.title) ? "bg-primary border-primary" : "border-border/40 group-hover:border-primary/40"}`}>
                             {completedSteps.includes(step.title) && <CheckCircle className="w-3 h-3 text-white" />}
                           </div>
                           <div>
                             <p className={`text-xs ${completedSteps.includes(step.title) ? "text-primary line-through" : "text-foreground"}`}>{step.title}</p>
                             <p className="text-[9px] text-muted-foreground/60">{step.day}</p>
                           </div>
                         </div>
                       ))}
                     </div>
                   </div>
                   <div id="ai-advisor" className="p-8 border border-primary/20 rounded-none bg-primary/5">
                     <p className="text-[9px] uppercase tracking-[0.3em] text-muted-foreground/60 mb-3">Your AI Advisor</p>
                     <p className="font-serif text-lg mb-4">You have {20 - chatUsageThisMonth} sessions this month. Use them.</p>
                     <a href="#ai-advisor-chat" className="block w-full py-3 border border-primary/30 text-center text-[10px] uppercase tracking-widest text-primary hover:bg-primary hover:text-white transition-all">
                       Open Advisor →
                     </a>
                   </div>
                 </>
               )}
            </div>
          </div>
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
                     <Badge className="bg-primary/10 text-primary border-none text-[9px] tracking-widest px-4 py-1">FREE BLUEPRINT</Badge>
                     <button onClick={() => setSelectedLesson(null)} className="p-2 hover:bg-background rounded-full transition-colors">
                       <X className="w-4 h-4" />
                     </button>
                  </div>

                  <p className="text-[10px] font-bold uppercase tracking-widest text-primary/60 mb-2 italic">{selectedLesson.tagline}</p>
                  <h2 className="font-serif text-3xl md:text-4xl mb-8 leading-tight">{selectedLesson.title}</h2>

                  {/* Core Insight */}
                  <div className="mb-6">
                    <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground mb-3">The Insight</p>
                    <p className="text-sm text-foreground/85 leading-relaxed">{selectedLesson.content.insight}</p>
                  </div>

                  {/* Tactic */}
                  <div className="p-6 bg-primary/5 border border-primary/15 rounded-2xl mb-6">
                    <p className="text-[9px] font-bold uppercase tracking-widest text-primary mb-3">The Tactic</p>
                    <p className="text-sm text-foreground/80 leading-relaxed">{selectedLesson.content.tactic}</p>
                  </div>

                  {/* Steps */}
                  <div className="mb-6">
                    <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground mb-4">Exact Steps</p>
                    <div className="space-y-3">
                      {selectedLesson.content.steps.map((step, i) => (
                        <div key={i} className="flex gap-3 p-4 bg-background/60 border border-border/40 rounded-xl">
                          <span className="text-[10px] font-black text-primary/50 font-mono shrink-0 mt-0.5">0{i + 1}</span>
                          <p className="text-xs text-foreground/85 leading-relaxed">{step}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Warning */}
                  <div className="p-5 bg-amber-500/5 border border-amber-500/20 rounded-xl mb-6">
                    <p className="text-[9px] font-bold uppercase tracking-widest text-amber-600 dark:text-amber-400 mb-2">Watch Out</p>
                    <p className="text-xs text-foreground/75 leading-relaxed">{selectedLesson.content.warning}</p>
                  </div>

                  {/* Pro Tip */}
                  {selectedLesson.content.proTip && (
                    <div className="p-5 bg-primary/10 border border-primary/20 rounded-xl mb-8">
                      <p className="text-[9px] font-bold uppercase tracking-widest text-primary mb-2">Pro Insight</p>
                      <p className="text-xs text-foreground/80 leading-relaxed italic">{selectedLesson.content.proTip}</p>
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
                       transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                       className="absolute inset-0 border-2 border-dashed border-primary/30 rounded-full"
                     />
                     <ShieldCheck className="w-10 h-10 text-primary" />
                  </div>
                  <Badge className="bg-primary/20 text-primary border-none mb-4 tracking-[0.2em] px-4 py-1">BONUS_UNLOCKED</Badge>
                  <h2 className="font-serif text-4xl mb-4 italic">Strategic Login Bonus</h2>
                  <p className="text-muted-foreground leading-relaxed transition-opacity mb-10 text-sm">
                    Access Granted: <span className="text-foreground font-bold">The 90-Day Master Blueprint</span>. 
                    Your commitment to the Foundry has been verified. 
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
                      <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-primary">Hall of Fame // Venture Portfolio</p>
                    </div>
                    <h2 className="font-serif text-4xl">Foundry Winners</h2>
                  </div>
                  <button onClick={() => setShowPortfolioModal(false)} className="p-2 hover:bg-background rounded-full transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-6">
                  {featuredVentures.map((venture) => (
                    <div key={venture.id} className="p-8 rounded-[2.5rem] bg-background/60 border border-border/30 hover:border-primary/30 transition-all group">
                      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <Badge className={`border-none text-[8px] tracking-[0.2em] px-3 ${venture.status === "Winner" ? "bg-primary/10 text-primary" : "bg-emerald-500/10 text-emerald-500"}`}>
                              {venture.status.toUpperCase()}
                            </Badge>
                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{venture.category}</span>
                          </div>
                          <h3 className="font-serif text-2xl mb-1 group-hover:text-primary transition-colors">{venture.name}</h3>
                          <p className="text-[10px] font-bold text-muted-foreground uppercase mb-4">Founded by {venture.founder} • {venture.stage}</p>
                          <p className="text-sm text-muted-foreground leading-relaxed max-w-xl">{venture.whyItWon}</p>
                          <div className="flex flex-wrap gap-2 mt-4">
                            {venture.tags.map((tag) => (
                              <span key={tag} className="text-[9px] font-bold uppercase tracking-widest bg-primary/5 text-primary border border-primary/10 px-3 py-1 rounded-full">{tag}</span>
                            ))}
                          </div>
                        </div>
                        <div className="flex flex-row md:flex-col gap-4 md:gap-3 md:min-w-[160px] md:items-end">
                          <div className="text-right">
                            <p className="text-[9px] font-bold text-muted-foreground uppercase mb-1">Revenue</p>
                            <p className="font-serif text-xl text-primary">{venture.revenue}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-[9px] font-bold text-muted-foreground uppercase mb-1">Growth</p>
                            <p className="font-bold text-sm text-emerald-500">{venture.growth}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-[9px] font-bold text-muted-foreground uppercase mb-1">Time to Rev.</p>
                            <p className="font-bold text-sm">{venture.timeToRevenue}</p>
                          </div>
                        </div>
                      </div>
                      <div className="mt-6 pt-6 border-t border-border/20">
                        <p className="text-[9px] font-bold uppercase text-muted-foreground tracking-widest mb-1">Key Metric</p>
                        <p className="text-xs font-medium font-mono text-primary">{venture.keyMetric}</p>
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

      <footer className="border-t border-border/40 py-16 px-6 mt-20">
        <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row justify-between items-center gap-8 text-muted-foreground">
          <div className="flex items-center gap-4">
            <img src={logoPath} alt="The Build Brief" className="w-6 h-6 opacity-40 grayscale" />
            <span className="font-serif text-lg">The Build Brief</span>
          </div>
          <div className="flex items-center gap-8 text-[10px] font-bold uppercase tracking-widest">
             <Link href="/dashboard" className="hover:text-primary transition-colors">Founder Portal</Link>
             <Link href="/archive" className="hover:text-primary transition-colors">Blueprint Archive</Link>
             <Link href="/" className="hover:text-primary transition-colors">Back to Home</Link>
          </div>
          <p className="text-xs">© 2026 BUILDING THE FUTURE.</p>
        </div>
      </footer>
      {/* Alliance Member Modal */}
      <AnimatePresence>
        {selectedMember && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center px-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedMember(null)} className="absolute inset-0 bg-background/90 backdrop-blur-md" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative w-full max-w-xl bg-card border border-primary/20 p-10 rounded-[3rem] shadow-2xl overflow-hidden">
               <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-3xl" />
               <div className="relative z-10">
                  <div className="flex items-center justify-between mb-8">
                     <Badge className="bg-primary/10 text-primary">{selectedMember.status.toUpperCase()}</Badge>
                     <button onClick={() => setSelectedMember(null)} className="p-2 hover:bg-background rounded-full transition-colors"><X className="w-5 h-5" /></button>
                  </div>
                  <h3 className="font-serif text-4xl mb-2">{selectedMember.name}</h3>
                  <p className="text-primary font-bold uppercase tracking-widest text-[10px] mb-8">{selectedMember.role}</p>
                  
                  <div className="space-y-6">
                     <div className="p-6 rounded-2xl bg-background/50 border border-border/40">
                        <p className="text-[10px] font-bold uppercase text-muted-foreground mb-3">Strategic Moat</p>
                        <p className="text-sm leading-relaxed">{selectedMember.specialty}</p>
                     </div>
                     <div className="p-6 rounded-2xl bg-primary/5 border border-primary/10">
                        <p className="text-[10px] font-bold uppercase text-primary mb-3">Active Venture Loop</p>
                        <p className="text-sm font-serif italic text-primary text-lg">"{selectedMember.currentVenture}"</p>
                     </div>
                     <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 rounded-xl border border-border/40 bg-background/30">
                           <p className="text-[9px] font-bold uppercase text-muted-foreground mb-1">Foundry Tenure</p>
                           <p className="text-xs font-bold">{selectedMember.joined}</p>
                        </div>
                        <div className="p-4 rounded-xl border border-border/40 bg-background/30">
                           <p className="text-[9px] font-bold uppercase text-muted-foreground mb-1">Network Authority</p>
                           <p className="text-xs font-bold">Level 4 Active</p>
                        </div>
                     </div>
                  </div>
                  <button onClick={() => { setSelectedMember(null); toast.success("Request Sent", { description: "You'll hear back within 48 hours." }); }} className="mt-10 w-full py-4 bg-primary text-white rounded-full font-bold text-xs uppercase tracking-widest shadow-xl shadow-primary/20">Request Introduction</button>
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Arsenal Deploy Modal */}
      <AnimatePresence>
        {isDeploying && selectedTool && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center px-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 bg-background/95 backdrop-blur-xl" />
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative w-full max-w-sm text-center">
               <div className="w-24 h-24 rounded-[2rem] bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-8 animate-pulse text-4xl shadow-[0_0_50px_rgba(249,115,22,0.2)]">
                  {selectedTool.logo}
               </div>
               <h3 className="font-serif text-3xl mb-4">Deploying System...</h3>
               <p className="text-sm text-muted-foreground mb-10 px-8">Configuring {selectedTool.name} for your stack. This takes a moment.</p>
               <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden mb-2">
                  <motion.div initial={{ width: 0 }} animate={{ width: "100%" }} transition={{ duration: 2 }} className="h-full bg-primary shadow-[0_0_15px_rgba(249,115,22,0.5)]" />
               </div>
               <p className="text-[10px] font-bold text-primary animate-pulse tracking-[0.3em]">STACK_ACTIVE</p>
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
                    <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-primary mb-2">Choose Your Edge</p>
                    <h2 className="font-serif text-4xl">Unlock the full vault.</h2>
                    <p className="text-muted-foreground mt-2 text-sm">Most founders get stuck. Pro founders get the playbooks, scripts, and 1-on-1 sessions that unstick them.</p>
                  </div>
                  <button onClick={() => setShowUpgradeModal(false)} className="p-3 hover:bg-background rounded-2xl transition-colors border border-transparent hover:border-border/40">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  {/* Pro Plan */}
                  <div className="relative p-8 rounded-[2rem] bg-primary border border-primary shadow-2xl shadow-primary/20 flex flex-col">
                    <div className="absolute -top-3 left-8 bg-white text-primary text-[9px] font-black px-4 py-1 rounded-full tracking-widest">MOST POPULAR</div>
                    <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center mb-6">
                      <Zap className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="font-serif text-2xl text-white mb-1">Pro</h3>
                    <p className="text-white/70 text-xs mb-6">For founders who are done reading and ready to build.</p>
                    <div className="mb-8">
                      <span className="font-serif text-5xl text-white">$9.99</span>
                      <span className="text-white/60 text-sm">/month</span>
                    </div>
                    <ul className="space-y-3 mb-8 flex-1">
                      {["Full Vault Archive — all 8+ blueprints", "Daily venture drops (not just Mon & Fri)", "Complete Playbook — all 28 lessons", "Full 21-day roadmap with metric calculators", "Priority WhatsApp / Slack support"].map(f => (
                        <li key={f} className="flex gap-3 text-xs text-white/85">
                          <CheckCircle className="w-4 h-4 text-white shrink-0 mt-0.5" />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                    <button
                      onClick={async () => {
                        if (!user?.email) {
                          toast.error("Sign in required", { description: "Please sign in to upgrade." });
                          return;
                        }
                        const toastId = toast.loading("Preparing checkout…");
                        try {
                          const res = await fetch("/api/payments/create-session", {
                            method: "POST",
                            headers: { 
                              "Content-Type": "application/json",
                              "Authorization": `Bearer ${session?.access_token}`
                            },
                            body: JSON.stringify({ plan: "Pro", region: "US" })
                          });
                          const data = await res.json();
                          toast.dismiss(toastId);
                          if (data.provider === "razorpay") {
                            toast.success("Redirecting to payment gateway...");
                            setShowUpgradeModal(false);
                          } else {
                            toast.error("Checkout unavailable", { description: data.error || "Payment gateway not configured yet — check back soon." });
                          }
                        } catch {
                          toast.dismiss(toastId);
                          toast.error("Checkout error — try again");
                        }
                      }}
                      className="w-full py-4 rounded-xl bg-white text-primary font-bold text-sm hover:bg-white/90 transition-all"
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
                    <p className="text-muted-foreground text-xs mb-6">When you need someone who has done it before to sit across the table from you.</p>
                    <div className="mb-8">
                      <span className="font-serif text-5xl">$49</span>
                      <span className="text-muted-foreground text-sm">/month</span>
                    </div>
                    <ul className="space-y-3 mb-8 flex-1">
                      {["Everything in Pro, plus:", "30-min 1-on-1 coaching call every month", "Private code review sessions", "Private sales script reviews", "Direct access on any channel"].map(f => (
                        <li key={f} className="flex gap-3 text-xs text-foreground/80">
                          <CheckCircle className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                    <button
                      onClick={async () => {
                        if (!user?.email) {
                          toast.error("Sign in required", { description: "Please sign in to upgrade." });
                          return;
                        }
                        const toastId = toast.loading("Preparing checkout…");
                        try {
                          const res = await fetch("/api/payments/create-session", {
                            method: "POST",
                            headers: { 
                              "Content-Type": "application/json",
                              "Authorization": `Bearer ${session?.access_token}`
                            },
                            body: JSON.stringify({ plan: "Max", region: "US" })
                          });
                          const data = await res.json();
                          toast.dismiss(toastId);
                          if (data.provider === "razorpay") {
                            toast.success("Redirecting to payment gateway...");
                            setShowUpgradeModal(false);
                          } else {
                            toast.error("Checkout unavailable", { description: data.error || "Payment gateway not configured yet — check back soon." });
                          }
                        } catch {
                          toast.dismiss(toastId);
                          toast.error("Checkout error — try again");
                        }
                      }}
                      className="w-full py-4 rounded-xl bg-foreground text-background font-bold text-sm hover:bg-primary hover:text-white transition-all"
                    >
                      Go Max — $49/mo
                    </button>
                  </div>
                </div>

                <p className="text-center text-[10px] text-muted-foreground">
                  Prefer INR pricing? <button onClick={() => { setShowUpgradeModal(false); setLocation("/"); setTimeout(() => { const el = document.getElementById("pricing"); el?.scrollIntoView({ behavior: "smooth" }); }, 200); }} className="text-primary underline underline-offset-2">View full pricing page →</button>
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
              toast.success("Context updated.", { description: "Every signal is now specific to your build." });
            }}
            onDismiss={() => setShowContextModal(false)}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {showJoinAlliance && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 sm:p-12">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setShowJoinAlliance(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-xl" 
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-2xl bg-card border border-border/40 rounded-[3rem] p-10 shadow-2xl overflow-hidden"
            >
               <div className="absolute top-0 right-0 p-8">
                  <button onClick={() => setShowJoinAlliance(false)} className="p-3 rounded-full hover:bg-primary/10 transition-colors">
                     <X className="w-6 h-6 text-muted-foreground" />
                  </button>
               </div>

               <div className="relative z-10 space-y-8">
                  <div>
                     <div className="flex items-center gap-3 mb-4">
                        <UsersIcon className="w-5 h-5 text-primary" />
                        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Alliance_Onboarding</p>
                     </div>
                     <h2 className="font-serif text-5xl mb-4">Create Your Node.</h2>
                     <p className="text-muted-foreground leading-relaxed">
                        Join the most elite network of founders. Your profile will be visible to fellow builders and vetted investors.
                     </p>
                  </div>

                  <div className="space-y-6">
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                           <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">STARTUP_NAME</p>
                           <input 
                             placeholder="Stealth Mode"
                             className="w-full bg-background border border-border/40 rounded-2xl px-6 py-4 text-sm focus:ring-1 focus:ring-primary/40 outline-none"
                             onChange={(e) => setAllianceJoinData({ ...allianceJoinData, startupName: e.target.value })}
                           />
                        </div>
                        <div className="space-y-2">
                           <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">PRIMARY_SECTOR</p>
                           <input 
                             placeholder="B2B SaaS"
                             className="w-full bg-background border border-border/40 rounded-2xl px-6 py-4 text-sm focus:ring-1 focus:ring-primary/40 outline-none"
                             onChange={(e) => setAllianceJoinData({ ...allianceJoinData, sector: e.target.value })}
                           />
                        </div>
                     </div>

                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                           <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">YOUR_SKILLS (Comma Separated)</p>
                           <input 
                             placeholder="Next.js, Sales, Design"
                             className="w-full bg-background border border-border/40 rounded-2xl px-6 py-4 text-sm focus:ring-1 focus:ring-primary/40 outline-none"
                             onChange={(e) => setAllianceJoinData({ ...allianceJoinData, skillsString: e.target.value })}
                           />
                        </div>
                        <div className="space-y-2">
                           <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">LOOKING_FOR (Comma Separated)</p>
                           <input 
                             placeholder="AI Engineer, Marketing"
                             className="w-full bg-background border border-border/40 rounded-2xl px-6 py-4 text-sm focus:ring-1 focus:ring-primary/40 outline-none"
                             onChange={(e) => setAllianceJoinData({ ...allianceJoinData, lookingForString: e.target.value })}
                           />
                        </div>
                     </div>

                     <div className="space-y-2">
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">ONE_SENTENCE_MISSION</p>
                        <textarea 
                          placeholder="Building the infrastructure for X..."
                          className="w-full bg-background border border-border/40 rounded-2xl px-6 py-4 text-sm focus:ring-1 focus:ring-primary/40 outline-none h-24 resize-none"
                          onChange={(e) => setAllianceJoinData({ ...allianceJoinData, bio: e.target.value })}
                        />
                     </div>

                     <button 
                       onClick={async () => {
                         const tid = toast.loading("Deploying profile node...");
                         const res = await fetch("/api/walls", {
                           method: "POST",
                           headers: { 
                             "Content-Type": "application/json",
                             "Authorization": `Bearer ${session?.access_token}`
                           },
                           body: JSON.stringify({
                             name: user?.user_metadata?.full_name || user?.email?.split("@")[0],
                             startupName: allianceJoinData.startupName,
                             sector: allianceJoinData.sector,
                             bio: allianceJoinData.bio,
                             skills: allianceJoinData.skillsString?.split(",").map((s: any) => s.trim()),
                             lookingFor: allianceJoinData.lookingForString?.split(",").map((s: any) => s.trim())
                           })
                         });
                         if (res.ok) {
                           const profile = await res.json();
                           setMyWallProfile(profile);
                           toast.success("Welcome to the Alliance.", { id: tid });
                           setShowJoinAlliance(false);
                           fetch("/api/walls").then(res => res.ok ? res.json() : null).then(data => data && setWallMembers(data));
                         } else {
                           toast.error("Deployment failed", { id: tid });
                         }
                       }}
                       className="w-full py-5 rounded-2xl bg-primary text-white font-black text-xs uppercase tracking-widest hover:scale-[1.02] transition-all shadow-xl shadow-primary/20"
                     >
                        Confirm Alliance Profile
                     </button>
                  </div>
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

