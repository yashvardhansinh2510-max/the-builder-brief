import { Link, useLocation } from "wouter";
import { useAuth } from "@/lib/AuthContext";
import { supabase } from "@/lib/supabase";
import { Star, LogOut } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import logoPath from "@assets/logo.jpg";

/**
 * Shared navigation bar used across UserPortal, ProPortal, and MaxPortal.
 * It automatically adapts based on the user's tier and current page.
 */
export default function PortalNav({ activePage }: { activePage: "dashboard" | "pro" | "max" | "archive" | "daily-drops" | "build-brief" }) {
  const { tier, isPremium } = useAuth();
  const [, setLocation] = useLocation();
  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setLocation("/");
  };

  // Determine the premium portal link
  const premiumPortalPath = tier === "pro" ? "/pro-portal" : "/max-portal";
  const premiumPortalLabel =
    tier === "pro" ? "Pro Portal" :
    tier === "max" ? "Inner Circle" :
    tier === "incubator" ? "Inner Circle" : "Dashboard";

  return (
    <>
      {/* Primary Nav */}
      <nav className="border-b border-border/40 py-4 px-6 md:px-12 flex justify-between items-center sticky top-0 bg-background/80 backdrop-blur-xl z-50">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative">
            <img src={logoPath} alt="The Build Brief" className="w-8 h-8 rounded-sm object-cover group-hover:scale-105 transition-transform" />
            <div className="absolute inset-0 ring-1 ring-primary/20 rounded-sm" />
          </div>
          <span className="font-serif text-xl font-medium tracking-tight">The Build Brief</span>
        </Link>

        <div className="flex items-center gap-4 md:gap-6">
          {/* Tier Badge */}
          <div className="hidden lg:flex items-center gap-3 mr-4 border-r border-border/40 pr-6">
            <div className="flex flex-col items-end">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Active Tier</p>
              <p className="text-sm font-medium text-primary flex items-center gap-1 uppercase">
                <Star className="w-3 h-3 fill-current" /> {tier.toUpperCase()}
              </p>
            </div>
          </div>

          {/* Premium badge */}
          {isPremium && (
            <Badge
              className={`px-3 py-1 text-[9px] font-black uppercase tracking-[0.2em] shadow-sm hidden sm:flex items-center gap-1.5 ${
                tier === "max" || tier === "incubator"
                  ? "rounded-none bg-primary/10 text-primary border border-primary/40"
                  : "rounded-sm bg-amber-500/10 text-amber-700 border border-amber-500/20"
              }`}
            >
              <Star className="w-2.5 h-2.5 fill-current" />
              {tier === "max" || tier === "incubator" ? "Inner Circle" : "Pro Member"}
            </Badge>
          )}

          <button
            onClick={handleSignOut}
            className="p-2 rounded-full hover:bg-card border border-transparent hover:border-border/40 transition-all text-muted-foreground hover:text-foreground"
            title="Sign out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </nav>

      {/* Secondary Nav — Page Switcher */}
      <div className="border-b border-border/20 bg-card/30 px-6 md:px-12 py-2.5 flex items-center justify-between sticky top-[57px] z-40 backdrop-blur-xl">
        <div className="flex items-center gap-1">
          {/* Dashboard / User Portal — always visible */}
          <Link href="/dashboard">
            <button className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${
              activePage === "dashboard"
                ? "bg-primary/10 text-primary border border-primary/20"
                : "text-muted-foreground hover:text-foreground hover:bg-card border border-transparent"
            }`}>
              Dashboard
            </button>
          </Link>

          {/* Archive — always visible */}
          <Link href="/archive">
            <button className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${
              activePage === "archive"
                ? "bg-primary/10 text-primary border border-primary/20"
                : "text-muted-foreground hover:text-foreground hover:bg-card border border-transparent"
            }`}>
              Archive
            </button>
          </Link>

          {/* Premium Portal — only for Pro/Max */}
          {isPremium && (
            <Link href={premiumPortalPath}>
              <button className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all flex items-center gap-1.5 ${
                activePage === "pro" || activePage === "max"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-primary hover:bg-primary/5 border border-transparent hover:border-primary/20"
              }`}>
                <Star className="w-3 h-3" />
                {premiumPortalLabel}
              </button>
            </Link>
          )}

          {/* Daily Drops — Pro/Max only */}
          {isPremium && (
            <Link href="/daily-drops">
              <button className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${
                activePage === "daily-drops"
                  ? "bg-primary/10 text-primary border border-primary/20"
                  : "text-muted-foreground hover:text-foreground hover:bg-card border border-transparent"
              }`}>
                Daily Drops
              </button>
            </Link>
          )}

          {/* Build Brief — Pro/Max only */}
          {isPremium && (
            <Link href="/build-brief">
              <button className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${
                activePage === "build-brief"
                  ? "bg-primary/10 text-primary border border-primary/20"
                  : "text-muted-foreground hover:text-foreground hover:bg-card border border-transparent"
              }`}>
                Build Brief
              </button>
            </Link>
          )}
        </div>

        {/* Right side — context label */}
        <div className="hidden md:flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
          <span className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">
            {isPremium ? `${tier.toUpperCase()} ACCESS` : "FREE ACCESS"}
          </span>
        </div>
      </div>
    </>
  );
}
