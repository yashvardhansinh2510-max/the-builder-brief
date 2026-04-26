import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, TrendingUp, AlertCircle, ArrowRight, ExternalLink, Activity } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useAuth } from "@/lib/AuthContext";

interface MarketGap {
  title: string;
  description: string;
  intensity: "high" | "medium" | "low";
  source: string;
}

export default function MarketPulseFeed() {
  const { session } = useAuth();
  const [pulse, setPulse] = useState<MarketGap[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPulse() {
      try {
        const res = await fetch("/api/engine/pulse", {
          headers: { "Authorization": `Bearer ${session?.access_token}` }
        });
        const data = await res.json();
        if (data.success) {
          setPulse(data.pulse);
        }
      } catch (err) {
        console.error("Pulse fetch error:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchPulse();
  }, [session]);

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-24 w-full bg-card/20 animate-pulse rounded-2xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <AnimatePresence>
        {pulse.map((gap, i) => (
          <motion.div
            key={gap.title}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className="p-6 rounded-3xl bg-card border border-border/40 hover:border-primary/30 transition-all group relative overflow-hidden"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <Badge className={`
                    ${gap.intensity === "high" ? "bg-red-500/10 text-red-500" : 
                      gap.intensity === "medium" ? "bg-amber-500/10 text-amber-500" : 
                      "bg-emerald-500/10 text-emerald-500"} 
                    border-none text-[8px] tracking-[0.2em] font-black uppercase px-3
                  `}>
                    {gap.intensity}_INTENSITY // ALPHA
                  </Badge>
                  <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">SOURCE: {gap.source}</span>
                </div>
                <h4 className="font-serif text-xl mb-2 group-hover:text-primary transition-colors">{gap.title}</h4>
                <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">{gap.description}</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-background border border-border flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-white transition-all">
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
      
      <div className="pt-4 text-center">
        <p className="text-[9px] font-black uppercase tracking-[0.3em] text-primary/40 flex items-center justify-center gap-2">
          <Activity className="w-3 h-3" /> LIVE_DATA_STREAM // AUTO_REFRESHING
        </p>
      </div>
    </div>
  );
}
