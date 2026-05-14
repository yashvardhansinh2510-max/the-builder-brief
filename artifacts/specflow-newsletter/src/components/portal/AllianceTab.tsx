import { useState } from "react";
import { motion } from "framer-motion";
import { Globe, Sparkles, Users as UsersIcon, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Globe as CobeGlobe } from "@/components/ui/cobe-globe";
import { toast } from "sonner";

interface AllianceTabProps {
  activeAlliance: any[];
  myWallProfile: any;
  setMyWallProfile: (p: any) => void;
  setWallMembers: (updater: (prev: any[]) => any[]) => void;
  setSelectedMember: (member: any) => void;
  setShowJoinAlliance: (show: boolean) => void;
  scorecard: any;
  wallMembers: any[];
  session: { user: any; access_token: string | null } | null;
  user: any;
}

export default function AllianceTab({
  activeAlliance,
  myWallProfile,
  setMyWallProfile,
  setWallMembers,
  setSelectedMember,
  setShowJoinAlliance,
  scorecard,
  wallMembers,
  session,
  user,
}: AllianceTabProps) {
  const [joining, setJoining] = useState(false);

  return (
    <div className="space-y-16">
      {/* Global Nexus: 3D Visualization */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-center">
        <div className="lg:col-span-1 space-y-8">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <Globe className="w-5 h-5 text-primary animate-spin-slow" />
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">
                Global_Nexus // Live_Network
              </p>
            </div>
            <h2 className="font-serif text-5xl mb-6">The Alliance Pulse.</h2>
            <p className="text-muted-foreground leading-relaxed">
              Visualize the global surge of building activity. You aren't just
              building a startup; you're part of a synchronized movement.
            </p>
          </div>

          <div className="p-6 rounded-[2.5rem] bg-card/40 border border-border/40 backdrop-blur-md">
            <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mb-4">
              LIVE_ACTIVITY_FEED
            </p>
            <div className="space-y-4">
              {[
                {
                  user: "Founder_72",
                  action: "Completed Blueprint Phase 1",
                  time: "2m ago",
                },
                {
                  user: "Nexus_Alpha",
                  action: "Initialized Marketplace Asset",
                  time: "5m ago",
                },
                {
                  user: "Builder_Zero",
                  action: "Referral Reward Claimed",
                  time: "12m ago",
                },
              ].map((item, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between text-[11px]"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="font-mono text-primary">{item.user}</span>
                    <span className="text-muted-foreground ml-1">
                      {item.action}
                    </span>
                  </div>
                  <span className="text-[9px] opacity-40 font-mono">
                    {item.time}
                  </span>
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
              { id: "4", location: [19.076, 72.8777], label: "MUM" },
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
                <div className="px-3 py-1 rounded-full bg-primary/20 text-primary text-[10px] font-black tracking-widest">
                  ECOSYSTEM_JOIN
                </div>
              </div>
              <h2 className="font-serif text-4xl mb-4">Join The Alliance.</h2>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Put your startup on the map. Connect with other founders
                building on the Builder Brief stack. Pro members get featured
                status.
              </p>
            </div>
            <button
              disabled={joining}
              onClick={async () => {
                setJoining(true);
                const data = {
                  name:
                    user?.user_metadata?.full_name ||
                    user?.email?.split("@")[0],
                  startupName: "Stealth Mode",
                  sector: "SaaS",
                  stage: "Idea",
                  bio: "Building something new.",
                };
                try {
                  const res = await fetch("/api/walls/me", {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                      Authorization: `Bearer ${session?.access_token}`,
                    },
                    body: JSON.stringify(data),
                  });
                  const p = await res.json();
                  setMyWallProfile(p);
                  setWallMembers((prev) => [p, ...prev]);
                  toast.success("Welcome to the Alliance.");
                } finally {
                  setJoining(false);
                }
              }}
              className="px-10 py-5 rounded-2xl bg-primary text-white font-black text-xs uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-primary/20 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {joining ? "Initializing…" : "Initialize Profile"}
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
              <p className="text-[10px] text-muted-foreground">
                Your profile is {myWallProfile.isVisible ? "visible" : "hidden"}
              </p>
            </div>
          </div>
          <button className="text-[10px] font-bold uppercase tracking-widest text-primary hover:underline">
            Edit Profile
          </button>
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
              <p className="text-[10px] font-black uppercase tracking-widest text-primary">
                Nexus_Matching // Talent_Layer
              </p>
            </div>
            <h2 className="font-serif text-4xl mb-6">Co-Founder Matches.</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {wallMembers
                .filter((m) => m.id !== myWallProfile?.id)
                .slice(0, 3)
                .map((match, i) => (
                  <div
                    key={i}
                    className="p-8 rounded-[2.5rem] bg-background/60 border border-border/40 backdrop-blur-sm group hover:border-primary/40 transition-all"
                  >
                    <p className="text-[9px] font-black uppercase tracking-widest text-primary mb-4">
                      92%_COMPATIBILITY
                    </p>
                    <h3 className="font-serif text-2xl mb-2">{match.name}</h3>
                    <p className="text-xs text-muted-foreground mb-6">
                      Looking for:{" "}
                      <span className="text-primary font-bold">
                        {(match.lookingFor || ["GTM Support"])[0]}
                      </span>
                    </p>
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
                  <Badge
                    className={`border-none text-[8px] tracking-[0.2em] px-3 py-1 ${member.status === "exited" ? "bg-emerald-500/10 text-emerald-500" : member.status === "scaling" || member.is_featured ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}
                  >
                    {(
                      member.status ||
                      (member.is_featured ? "PRO" : "BUILDING")
                    ).toUpperCase()}
                  </Badge>
                </div>
                <h3 className="font-serif text-2xl mb-1">{member.name}</h3>
                <p className="text-[10px] font-bold uppercase tracking-widest text-primary/60 mb-4">
                  {member.role || member.sector || "FOUNDER"}
                </p>

                {member.skills && (
                  <div className="flex flex-wrap gap-1.5 mb-6">
                    {member.skills.map((s: string) => (
                      <Badge
                        key={s}
                        variant="outline"
                        className="text-[7px] py-0 border-primary/10 text-primary/80"
                      >
                        {s.toUpperCase()}
                      </Badge>
                    ))}
                  </div>
                )}

                <div className="space-y-4 pt-4 border-t border-border/20">
                  <div>
                    <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-1">
                      {member.specialty ? "Specialty" : "Stage"}
                    </p>
                    <p className="text-xs font-medium">
                      {member.specialty || member.stage}
                    </p>
                  </div>
                  <div>
                    <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-1">
                      Active Venture
                    </p>
                    <p className="text-xs font-serif italic text-primary">
                      {member.currentVenture || member.startupName}
                    </p>
                  </div>
                </div>
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-primary/10">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{
                    width:
                      member.status === "exited"
                        ? "100%"
                        : member.status === "scaling" || member.is_featured
                          ? "70%"
                          : "30%",
                  }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                  className="h-full bg-primary"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
