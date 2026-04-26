import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Database, Target, Rocket, Users, AlertCircle, Save, Check } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/lib/AuthContext";

interface StartupContext {
  whatBuilding: string;
  stage: "pre-revenue" | "scaling" | "pivoting" | "exit-mode";
  sector: "B2B SaaS" | "Consumer Tech" | "AI/ML" | "Fintech" | "Deeptech";
  targetCustomer: string;
  biggestChallenge: "Distribution" | "Hiring" | "Technical" | "Fundraising";
}

export default function ContextManager() {
  const { session } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [context, setContext] = useState<StartupContext>({
    whatBuilding: "",
    stage: "pre-revenue",
    sector: "B2B SaaS",
    targetCustomer: "",
    biggestChallenge: "Distribution",
  });

  useEffect(() => {
    if (session?.access_token) {
      fetch("/api/subscribers/me", {
        headers: { "Authorization": `Bearer ${session.access_token}` }
      })
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data) {
          setContext({
            whatBuilding: data.whatBuilding || "",
            stage: data.startupStage || "pre-revenue",
            sector: data.startupSector || "B2B SaaS",
            targetCustomer: data.targetCustomer || "",
            biggestChallenge: data.biggestChallenge || "Distribution",
          });
        }
      });
    }
  }, [session]);

  const save = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/subscribers/me/sync", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          whatBuilding: context.whatBuilding,
          startupStage: context.stage,
          startupSector: context.sector,
          targetCustomer: context.targetCustomer,
          biggestChallenge: context.biggestChallenge,
          contextUpdatedAt: new Date().toISOString()
        })
      });

      if (res.ok) {
        setSaved(true);
        toast.success("Intelligence Engine Calibrated", {
          description: "Your founder context has been updated across all advisor modules."
        });
        setTimeout(() => setSaved(false), 3000);
      }
    } catch (e) {
      toast.error("Calibration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 rounded-[2.5rem] bg-card/40 border border-border/40 backdrop-blur-sm relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[100px] pointer-events-none" />
      
      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-serif text-2xl">Calibration Hub</h3>
            <p className="text-[10px] font-bold uppercase tracking-widest text-primary opacity-60">Engine_Control://Context_Payload</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div>
              <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground mb-2 block">What are you building?</label>
              <textarea
                value={context.whatBuilding}
                onChange={e => setContext({...context, whatBuilding: e.target.value})}
                placeholder="Describe your product, core value prop, and vision..."
                className="w-full bg-background/40 border border-border/40 rounded-2xl p-4 text-xs min-h-[120px] outline-none focus:border-primary/40 transition-all resize-none"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground mb-2 block">Target Customer</label>
              <input
                type="text"
                value={context.targetCustomer}
                onChange={e => setContext({...context, targetCustomer: e.target.value})}
                placeholder="e.g. Series A Fintech Founders, Indie Hackers..."
                className="w-full bg-background/40 border border-border/40 rounded-2xl p-4 text-xs outline-none focus:border-primary/40 transition-all"
              />
            </div>
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground mb-2 block">Stage</label>
                <select 
                  value={context.stage}
                  onChange={e => setContext({...context, stage: e.target.value as any})}
                  className="w-full bg-background/40 border border-border/40 rounded-xl p-3 text-xs outline-none"
                >
                  <option value="pre-revenue">Pre-Revenue</option>
                  <option value="scaling">Scaling / PMF</option>
                  <option value="pivoting">Pivoting</option>
                  <option value="exit-mode">Exit Mode</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground mb-2 block">Sector</label>
                <select 
                  value={context.sector}
                  onChange={e => setContext({...context, sector: e.target.value as any})}
                  className="w-full bg-background/40 border border-border/40 rounded-xl p-3 text-xs outline-none"
                >
                  <option value="B2B SaaS">B2B SaaS</option>
                  <option value="Consumer Tech">Consumer Tech</option>
                  <option value="AI/ML">AI/ML</option>
                  <option value="Fintech">Fintech</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground mb-2 block">Biggest Blocker</label>
              <div className="grid grid-cols-2 gap-2">
                {["Distribution", "Hiring", "Technical", "Fundraising"].map(opt => (
                  <button
                    key={opt}
                    onClick={() => setContext({...context, biggestChallenge: opt as any})}
                    className={`p-3 rounded-xl border text-[10px] font-bold uppercase tracking-wider transition-all ${context.biggestChallenge === opt ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20" : "bg-background/20 border-border/40 text-muted-foreground hover:bg-background/40"}`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-4">
              <button
                onClick={save}
                disabled={loading}
                className="w-full py-4 rounded-2xl bg-primary text-primary-foreground font-bold text-xs uppercase tracking-widest hover:opacity-90 transition-all flex items-center justify-center gap-2 shadow-xl shadow-primary/10"
              >
                {loading ? "Calibrating..." : saved ? <><Check className="w-4 h-4" /> Calibrated</> : <><Save className="w-4 h-4" /> Update Engine</>}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
