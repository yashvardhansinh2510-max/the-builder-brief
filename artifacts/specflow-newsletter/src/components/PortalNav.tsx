import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/lib/AuthContext";
import { useAuth as useClerkAuth } from "@clerk/react";
import { UserButton } from "@clerk/react";
import { motion } from "framer-motion";
import { Lock, Flame, Menu, MapPin, BookOpen } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import logoPath from "@assets/logo.jpg";
import { PORTAL_NAV_TABS, type PortalTab } from "@/lib/portal-config";
export type { PortalTab } from "@/lib/portal-config";

interface PortalNavProps {
  activeTab?: PortalTab;
  onTabChange?: (tab: PortalTab) => void;
  streak?: number;
  activePage?: string;
}

const TIER_COLORS: Record<string, string> = {
  free:      "bg-zinc-500/10 text-zinc-500 border-zinc-500/20",
  pro:       "bg-amber-500/10 text-amber-600 border-amber-500/20",
  max:       "bg-primary/10 text-primary border-primary/30",
  incubator: "bg-primary/10 text-primary border-primary/30",
};

export default function PortalNav({ activeTab = "intel", onTabChange = () => {}, streak = 0, activePage }: PortalNavProps) {
  const { tier, isPremium } = useAuth();
  const { isSignedIn } = useClerkAuth();
  const [, setLocation] = useLocation();
  const [solid, setSolid] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > 100);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  function isTabLocked(id: PortalTab): boolean {
    if (id === "playbook" || id === "arsenal") return !isPremium;
    if (id === "alliance") return tier !== "max" && tier !== "incubator";
    return false;
  }

  function handleTabClick(id: PortalTab) {
    if (isTabLocked(id)) {
      setLocation("/pricing");
      return;
    }
    onTabChange(id);
    setMobileOpen(false);
  }

  const tierColor = TIER_COLORS[tier] ?? TIER_COLORS.free;
  const showUpgrade = tier === "free" || tier === "pro";

  return (
    <>
      {/* Main nav bar */}
      <nav
        className={`fixed top-0 inset-x-0 z-50 h-[60px] flex items-center px-4 sm:px-6 md:px-10 transition-all duration-200 ${
          solid
            ? "bg-background border-b border-border/40"
            : "bg-background/80 backdrop-blur-xl"
        }`}
      >
        {/* LEFT: Logo + wordmark */}
        <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
          <img
            src={logoPath}
            alt="The Builder Brief"
            className="w-8 h-8 rounded-sm object-cover group-hover:scale-105 transition-transform"
          />
          <span className="font-serif text-lg font-medium tracking-tight hidden sm:block">
            The Builder Brief
          </span>
        </Link>

        {/* CENTER: Tab nav (desktop only) */}
        <div className="hidden lg:flex items-center gap-1 mx-auto">
          {PORTAL_NAV_TABS.map((tab) => {
            const locked = isTabLocked(tab.id);
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab.id)}
                className={`relative px-4 py-2 text-[11px] font-bold uppercase tracking-widest transition-colors flex items-center gap-1.5 ${
                  locked
                    ? "text-muted-foreground/30 cursor-not-allowed"
                    : active
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {locked && <Lock className="w-2.5 h-2.5" />}
                {tab.label}
                {active && (
                  <motion.div
                    layoutId="portal-tab-indicator"
                    className="absolute bottom-0 inset-x-0 h-0.5 bg-primary rounded-full"
                    transition={{ type: "spring", stiffness: 500, damping: 35 }}
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* RIGHT: Tier badge + streak + avatar + upgrade */}
        <div className="flex items-center gap-3 ml-auto shrink-0">
          {isSignedIn && (
            <Badge
              variant="outline"
              className={`hidden sm:flex px-2.5 py-1 text-[9px] font-black uppercase tracking-widest ${tierColor}`}
            >
              {tier.toUpperCase()}
            </Badge>
          )}

          {isSignedIn && streak > 0 && (
            <div className="hidden md:flex items-center gap-1 text-[11px] font-bold text-primary">
              <Flame className="w-3.5 h-3.5 fill-primary" />
              {streak}
            </div>
          )}

          {isSignedIn && <UserButton />}

          {isSignedIn && (tier === 'pro' || tier === 'max' || tier === 'incubator') && (
            <Link
              href="/vault-trends"
              className={`hidden lg:block text-xs font-bold uppercase tracking-widest transition-colors ${
                activePage === 'vault-trends'
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Trends
            </Link>
          )}

          {isSignedIn && showUpgrade && (
            <button
              onClick={() => setLocation("/pricing")}
              className="hidden md:flex items-center px-4 py-2 rounded-full bg-primary text-primary-foreground text-[10px] font-black uppercase tracking-widest hover:opacity-90 transition-opacity shadow-sm"
            >
              Upgrade
            </button>
          )}

          {/* Mobile hamburger */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <button className="lg:hidden p-2 rounded-lg hover:bg-card transition-colors">
                <Menu className="w-5 h-5" />
              </button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[280px] p-6">
              <div className="flex items-center gap-2.5 mb-8">
                <img src={logoPath} alt="" className="w-8 h-8 rounded-sm object-cover" />
                <span className="font-serif text-lg font-medium">The Builder Brief</span>
              </div>

              <div className="space-y-1 mb-6">
                {PORTAL_NAV_TABS.map((tab) => {
                  const locked = isTabLocked(tab.id);
                  const active = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => handleTabClick(tab.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold uppercase tracking-widest text-left transition-colors ${
                        active
                          ? "bg-primary/10 text-primary"
                          : locked
                          ? "text-muted-foreground/30"
                          : "text-muted-foreground hover:bg-card hover:text-foreground"
                      }`}
                    >
                      {locked && <Lock className="w-3 h-3" />}
                      {tab.label}
                    </button>
                  );
                })}
              </div>

              {isSignedIn && (
                <div className="pt-4 border-t border-border/20 space-y-3">
                  <Badge
                    variant="outline"
                    className={`px-3 py-1 text-[9px] font-black uppercase tracking-widest ${tierColor}`}
                  >
                    {tier.toUpperCase()}
                  </Badge>
                  {showUpgrade && (
                    <button
                      onClick={() => {
                        setLocation("/pricing");
                        setMobileOpen(false);
                      }}
                      className="w-full py-3 rounded-full bg-primary text-primary-foreground text-[10px] font-black uppercase tracking-widest"
                    >
                      Upgrade
                    </button>
                  )}
                </div>
              )}
            </SheetContent>
          </Sheet>
        </div>
      </nav>

      {/* Secondary nav — page-level links */}
      <div className="fixed top-[60px] inset-x-0 z-40 border-b border-border/20 bg-card/30 backdrop-blur-xl px-4 sm:px-6 md:px-10 py-2 flex items-center gap-1 overflow-x-auto scrollbar-hide">
        <Link href="/blueprints">
          <button
            className={`shrink-0 flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${
              activePage === "blueprints"
                ? "bg-primary/10 text-primary border border-primary/20"
                : "text-muted-foreground hover:text-foreground hover:bg-card border border-transparent"
            }`}
          >
            <BookOpen className="w-3 h-3" /> Build
          </button>
        </Link>
        <Link href="/ground-game">
          <button
            className={`shrink-0 flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${
              activePage === "ground-game"
                ? "bg-primary/10 text-primary border border-primary/20"
                : "text-muted-foreground hover:text-foreground hover:bg-card border border-transparent"
            }`}
          >
            <MapPin className="w-3 h-3" /> Ground Game
          </button>
        </Link>
        <Link href="/archive">
          <button
            className={`shrink-0 px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${
              activePage === "archive"
                ? "bg-primary/10 text-primary border border-primary/20"
                : "text-muted-foreground hover:text-foreground hover:bg-card border border-transparent"
            }`}
          >
            Library
          </button>
        </Link>
        {isSignedIn && isPremium && (
          <>
            <Link href="/daily-drops">
              <button
                className={`shrink-0 px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${
                  activePage === "daily-drops"
                    ? "bg-primary/10 text-primary border border-primary/20"
                    : "text-muted-foreground hover:text-foreground hover:bg-card border border-transparent"
                }`}
              >
                Daily Drops
              </button>
            </Link>
            <Link href="/build-brief">
              <button
                className={`shrink-0 px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${
                  activePage === "build-brief"
                    ? "bg-primary/10 text-primary border border-primary/20"
                    : "text-muted-foreground hover:text-foreground hover:bg-card border border-transparent"
                }`}
              >
                Build Brief
              </button>
            </Link>
          </>
        )}
      </div>
    </>
  );
}
