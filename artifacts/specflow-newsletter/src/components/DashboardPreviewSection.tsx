import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import {
  BookOpen, Zap, Trophy, ShieldCheck,
  Terminal, Lock, ArrowRight, Layers, Map,
  Users as UsersIcon, Boxes
} from "lucide-react";
import { SpotlightCard } from "@/components/ui/spotlight-card";
import { issues } from "@/lib/data";
import { playbookModules } from "@/lib/playbook";
import { featuredVentures } from "@/lib/ventures";
import { Badge } from "@/components/ui/badge";

export function DashboardPreviewSection() {
  const [activeTab, setActiveTab] = useState<"playbook" | "vault" | "alliance">("playbook");
  const [showOverlay, setShowOverlay] = useState(false);

  // Trigger the "Sign up to unlock" overlay after interaction
  useEffect(() => {
    let timer: NodeJS.Timeout;
    const handleInteraction = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        setShowOverlay(true);
      }, 15000); // Show after 15 seconds of interaction
    };

    window.addEventListener("mousemove", handleInteraction);
    window.addEventListener("click", handleInteraction);
    window.addEventListener("scroll", handleInteraction);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("mousemove", handleInteraction);
      window.removeEventListener("click", handleInteraction);
      window.removeEventListener("scroll", handleInteraction);
    };
  }, []);

  const votw = featuredVentures[0];
  const currentPastIssues = issues.slice(0, 4); // Just show a few

  return (
    <section className="relative py-24 px-6 overflow-hidden">
      <div className="max-w-[1400px] mx-auto">
        <div className="text-center mb-16 relative z-20">
          <p className="text-sm font-medium text-primary uppercase tracking-widest mb-3">Live Platform Preview</p>
          <h2 className="font-serif text-4xl md:text-5xl mb-6">
            Step inside the data room.
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto text-base">
            This is the actual founder portal. No mockups. No waitlists. Feel the leverage before you join.
          </p>
        </div>

        {/* The Dashboard Mockup Container */}
        <SpotlightCard className="relative rounded-[2rem] border border-border/40 bg-background/50 shadow-2xl overflow-hidden backdrop-blur-xl">
          {/* Top Bar Fake Window Nav */}
          <div className="h-12 border-b border-border/40 bg-card/30 flex items-center px-4 gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500/80" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
            <div className="w-3 h-3 rounded-full bg-green-500/80" />
            <div className="mx-auto flex items-center gap-2 bg-background/50 px-4 py-1 rounded-md border border-border/40">
              <Lock className="w-3 h-3 text-muted-foreground" />
              <span className="text-[10px] text-muted-foreground font-mono">portal.thebuildbrief.com</span>
            </div>
          </div>

          <div className="p-8 h-[700px] overflow-y-auto custom-scrollbar relative">
            
            {/* Overlay that fades in */}
            {showOverlay && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute inset-0 z-50 flex items-center justify-center bg-background/60 backdrop-blur-sm"
              >
                <div className="bg-card border border-primary/20 p-10 rounded-[2.5rem] shadow-2xl text-center max-w-sm">
                  <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
                    <Lock className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="font-serif text-3xl mb-3">Access Locked</h3>
                  <p className="text-sm text-muted-foreground mb-8">You've seen the systems. Now use them. Join the platform to build your first exit.</p>
                  <Link href="/sign-up">
                    <button className="w-full bg-primary text-primary-foreground font-bold text-xs uppercase tracking-widest py-4 rounded-full hover:scale-105 active:scale-95 transition-transform shadow-xl shadow-primary/20 cursor-pointer">
                      Claim Your Free Portal
                    </button>
                  </Link>
                </div>
              </motion.div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pointer-events-auto">
              
              <div className="lg:col-span-8 space-y-8">
                {/* Hero */}
                <SpotlightCard className="p-8 rounded-[2rem] bg-card/40 border border-primary/10 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary/5 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2" />
                  <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                      <p className="text-[10px] uppercase font-bold tracking-[0.4em] text-primary/60">System Operational</p>
                    </div>
                    <h1 className="font-serif text-4xl leading-[1.1] mb-2">Welcome to the inside, <span className="italic text-primary/90">Builder.</span></h1>
                    <p className="text-muted-foreground text-sm max-w-md">The next drop lands Friday. Your blueprints are waiting.</p>
                  </div>
                </SpotlightCard>

                {/* Tabs */}
                <div className="flex items-center gap-2 p-1.5 bg-card/50 border border-border/40 rounded-2xl w-fit">
                   {[
                    { id: "playbook", label: "Playbook", icon: BookOpen },
                    { id: "vault", label: "Vault Archive", icon: Map },
                    { id: "alliance", label: "The Alliance", icon: UsersIcon },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`flex items-center gap-2 px-5 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${
                        activeTab === tab.id 
                        ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" 
                        : "text-muted-foreground hover:text-foreground hover:bg-background/40"
                      }`}
                    >
                      <tab.icon className="w-3.5 h-3.5" /> {tab.label}
                    </button>
                  ))}
                </div>

                {/* Tab Content */}
                {activeTab === "playbook" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {playbookModules.slice(0, 4).map((module) => (
                      <SpotlightCard key={module.id} className="bg-card/40 border border-border/20 rounded-[2rem] p-6">
                         <p className="text-[9px] font-bold uppercase tracking-widest text-primary mb-2 italic opacity-60">MODULE_{module.id.toUpperCase()}</p>
                         <h3 className="font-serif text-xl mb-3">{module.title}</h3>
                         <div className="space-y-2">
                           {module.lessons.slice(0, 2).map((lesson) => (
                             <div key={lesson.id} className="flex items-center justify-between p-3 rounded-xl border bg-background/30 border-border/40">
                                <span className="text-[10px] font-medium">{lesson.title}</span>
                                <Lock className="w-3 h-3 text-muted-foreground" />
                             </div>
                           ))}
                         </div>
                      </SpotlightCard>
                    ))}
                  </div>
                )}

                {activeTab === "vault" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {currentPastIssues.map((issue) => (
                      <SpotlightCard key={issue.number} className="p-6 rounded-[2rem] border bg-card/40 border-border/20">
                         <div className="flex items-center gap-3 mb-4">
                           <div className="w-8 h-8 rounded-xl flex items-center justify-center font-mono font-bold shrink-0 bg-primary/10 text-primary border border-primary/20 text-[10px]">
                             {issue.number}
                           </div>
                           <h3 className="font-serif text-lg leading-tight truncate">{issue.title}</h3>
                         </div>
                         <p className="text-[10px] text-muted-foreground line-clamp-2">{issue.tagline}</p>
                      </SpotlightCard>
                    ))}
                  </div>
                )}
                
                {activeTab === "alliance" && (
                  <div className="p-8 text-center border border-dashed border-border/40 rounded-[2rem]">
                    <UsersIcon className="w-8 h-8 text-muted-foreground mx-auto mb-4" />
                    <p className="font-serif text-xl">Alliance Network Locked</p>
                    <p className="text-xs text-muted-foreground mt-2">Sign in to view incubator members and network.</p>
                  </div>
                )}

              </div>

              {/* Sidebar */}
              <div className="lg:col-span-4 space-y-6">
                 {/* Terminal Widget */}
                 <SpotlightCard className="p-6 rounded-[2rem] bg-card/40 border border-primary/20 relative overflow-hidden">
                    <div className="flex items-center gap-2 mb-4">
                       <Terminal className="w-4 h-4 text-primary" />
                       <span className="text-[9px] font-mono uppercase text-primary tracking-widest">Live Telemetry</span>
                    </div>
                    <div className="space-y-3 font-mono text-[10px] text-muted-foreground">
                      <p className="text-primary">&gt; System active...</p>
                      <p>&gt; 3 new market gaps flagged</p>
                      <p>&gt; Blueprint #4 deployed by 12 founders</p>
                      <p className="animate-pulse">_</p>
                    </div>
                 </SpotlightCard>

                 {/* VOTW */}
                 <SpotlightCard className="p-6 rounded-[2rem] bg-card/40 border border-border/20">
                    <div className="flex items-center gap-2 mb-4">
                       <Trophy className="w-4 h-4 text-primary" />
                       <span className="text-[9px] font-bold uppercase tracking-[0.2em]">Spotlight</span>
                    </div>
                    <h4 className="font-serif text-xl mb-2">{votw?.name}</h4>
                    <p className="text-[10px] text-muted-foreground mb-4 line-clamp-3">{votw?.whyItWon}</p>
                    <div className="pt-4 border-t border-border/20">
                      <span className="text-[9px] text-primary uppercase font-bold tracking-widest">Impact: {votw?.revenue}</span>
                    </div>
                 </SpotlightCard>
              </div>

            </div>
          </div>
          
          {/* Bottom Banner */}
          <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-background via-background/90 to-transparent flex justify-center pb-8 pointer-events-none">
            <Link href="/sign-up" className="pointer-events-auto">
              <button className="flex items-center gap-3 bg-foreground text-background px-8 py-4 rounded-full font-bold text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-2xl cursor-pointer">
                Start Building Free <ArrowRight className="w-4 h-4" />
              </button>
            </Link>
          </div>
        </SpotlightCard>
      </div>
    </section>
  );
}
