import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Zap, ChevronRight, Share2, Calendar } from "lucide-react";
import { Badge } from "./ui/badge";
import { useAuth } from "@/lib/AuthContext";

interface DailyBrief {
  id: number;
  summary: string;
  highlights: string[];
  briefDate: string;
}

export default function DailyBriefUI() {
  const { session } = useAuth();
  const [brief, setBrief] = useState<DailyBrief | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session?.user?.email) {
      fetch("/api/briefs/today")
        .then(res => res.ok ? res.json() : null)
        .then(data => {
          if (data) setBrief(data);
        })
        .finally(() => setLoading(false));
    }
  }, [session]);

  if (loading) return <div className="p-12 text-center text-muted-foreground animate-pulse">Synchronizing Intelligence...</div>;

  if (!brief) return (
    <div className="p-12 text-center bg-card border border-border rounded-3xl">
      <Calendar className="w-10 h-10 text-muted-foreground/30 mx-auto mb-4" />
      <p className="text-muted-foreground">Today's brief is being generated. Check back in a few minutes.</p>
    </div>
  );

  return (
    <div className="p-8 md:p-12 bg-zinc-950 border border-zinc-800 rounded-3xl text-white shadow-2xl relative overflow-hidden">
      <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
        <Zap className="w-32 h-32 text-primary" />
      </div>

      <div className="flex items-center gap-4 mb-8">
        <Badge className="bg-primary text-black border-none text-[10px] tracking-[0.3em] font-bold">DAILY VENTURE DROP</Badge>
        <span className="text-zinc-500 text-xs font-mono">{brief.briefDate}</span>
      </div>

      <h2 className="font-serif text-3xl md:text-5xl mb-8 tracking-tight leading-tight">
        {brief.summary}
      </h2>

      <div className="space-y-6 mb-12">
        <p className="text-[10px] font-bold uppercase tracking-widest text-primary">Strategic Signals</p>
        <div className="grid gap-4">
          {brief.highlights?.map((h, i) => (
            <div key={i} className="flex gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-primary/30 transition-all group">
              <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 group-hover:scale-150 transition-transform" />
              <p className="text-zinc-300 text-sm leading-relaxed">{h}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <button className="h-12 px-8 rounded-full bg-primary text-black font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:scale-105 transition-all">
          Explore Research Data <ChevronRight className="w-4 h-4" />
        </button>
        <button className="h-12 px-8 rounded-full bg-white/5 text-white border border-white/10 font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-white/10 transition-all">
          Share Intelligence <Share2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
