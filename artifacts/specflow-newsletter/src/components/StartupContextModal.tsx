import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/lib/AuthContext";
import { X, ArrowRight } from "lucide-react";
import {
  StartupContext,
  StartupStage,
  StartupSector,
  BiggestChallenge,
  saveStartupContext,
  stageLabels,
  challengeLabels,
} from "@/lib/startup-context";

const SECTORS: StartupSector[] = [
  "B2B SaaS", "Consumer", "Fintech", "Health Tech", "Deep Tech",
  "Developer Infrastructure", "AI Tooling", "EdTech", "Marketplace", "Other",
];
const STAGES: StartupStage[] = ["idea", "pre-revenue", "revenue", "scaling"];
const CHALLENGES: BiggestChallenge[] = ["Validation", "Building", "Distribution", "Fundraising", "Hiring"];

interface Props {
  email?: string;
  onComplete: (ctx: StartupContext) => void;
  onDismiss?: () => void;
}

const STEPS = [
  { label: "01", heading: "What are you building?", sub: "One line. No buzzwords. What does it do and who is it for?" },
  { label: "02", heading: "Where are you right now?", sub: "Be honest. The advice changes completely based on your stage." },
  { label: "03", heading: "Who's the customer?", sub: "Not 'SMBs' or 'enterprises.' Describe the specific person who signs the check." },
  { label: "04", heading: "What's actually killing you right now?", sub: "Pick the one thing. Every platform tool will be calibrated to this." },
];

export default function StartupContextModal({ email, onComplete, onDismiss }: Props) {
  const { session } = useAuth();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<Partial<StartupContext>>({
    stage: "pre-revenue",
    sector: "B2B SaaS",
    biggestChallenge: "Distribution",
  });

  const update = (key: keyof StartupContext, val: string) =>
    setForm(prev => ({ ...prev, [key]: val }));

  const canAdvance = () => {
    if (step === 0) return !!form.whatBuilding?.trim();
    if (step === 1) return !!form.stage && !!form.sector;
    if (step === 2) return !!form.targetCustomer?.trim();
    if (step === 3) return !!form.biggestChallenge;
    return false;
  };

  const handleSubmit = async () => {
    if (!canAdvance()) return;
    setSaving(true);

    const ctx: StartupContext = {
      ...(form as StartupContext),
      updatedAt: new Date().toISOString(),
    };

    saveStartupContext(ctx);

    try {
      await fetch("/api/subscribers/me/context", {
        method: "PATCH",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({
          whatBuilding: ctx.whatBuilding,
          startupStage: ctx.stage,
          startupSector: ctx.sector,
          targetCustomer: ctx.targetCustomer,
          biggestChallenge: ctx.biggestChallenge,
        }),
      });
    } catch {
      // Non-blocking — localStorage already saved
    }

    setSaving(false);
    onComplete(ctx);
  };

  const isLast = step === 3;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/60 backdrop-blur-sm px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.97, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.97, y: 12 }}
        transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="relative w-full max-w-xl bg-background border border-border rounded-2xl overflow-hidden shadow-2xl"
      >
        {/* Progress bar */}
        <div className="absolute top-0 left-0 h-[2px] bg-primary/20 w-full">
          <motion.div
            className="h-full bg-primary"
            animate={{ width: `${((step + 1) / 4) * 100}%` }}
            transition={{ duration: 0.35, ease: "easeOut" }}
          />
        </div>

        <div className="p-8 pt-10">
          {/* Step counter */}
          <p className="text-[9px] font-bold tracking-[0.5em] text-primary uppercase mb-6">
            {STEPS[step].label} / 04
          </p>

          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              transition={{ duration: 0.2 }}
            >
              <h2 className="font-serif text-3xl tracking-tight text-foreground mb-2">
                {STEPS[step].heading}
              </h2>
              <p className="text-sm text-muted-foreground mb-8 leading-relaxed">
                {STEPS[step].sub}
              </p>

              {/* Step 0: whatBuilding */}
              {step === 0 && (
                <div>
                  <textarea
                    autoFocus
                    rows={3}
                    placeholder="e.g. Contract lifecycle management for mid-market logistics companies. Replaces the spreadsheet their ops team hates."
                    value={form.whatBuilding || ""}
                    onChange={e => update("whatBuilding", e.target.value)}
                    className="w-full px-4 py-3 bg-card border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-none leading-relaxed"
                  />
                  <p className="text-[11px] text-muted-foreground mt-2">
                    No pitching. Write like you're texting a co-founder at midnight.
                  </p>
                </div>
              )}

              {/* Step 1: stage + sector */}
              {step === 1 && (
                <div className="space-y-6">
                  <div>
                    <p className="text-[10px] font-bold tracking-[0.4em] text-muted-foreground uppercase mb-3">Stage</p>
                    <div className="flex flex-col gap-2">
                      {STAGES.map(s => (
                        <button
                          key={s}
                          onClick={() => update("stage", s)}
                          className={`text-left px-4 py-3 rounded-lg border text-sm transition-all ${
                            form.stage === s
                              ? "border-primary bg-primary/8 text-foreground font-medium"
                              : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"
                          }`}
                        >
                          {stageLabels[s]}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold tracking-[0.4em] text-muted-foreground uppercase mb-3">Sector</p>
                    <div className="flex flex-wrap gap-2">
                      {SECTORS.map(s => (
                        <button
                          key={s}
                          onClick={() => update("sector", s)}
                          className={`px-3 py-1.5 rounded-full border text-xs font-medium transition-all ${
                            form.sector === s
                              ? "border-primary bg-primary text-primary-foreground"
                              : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"
                          }`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: targetCustomer */}
              {step === 2 && (
                <div>
                  <textarea
                    autoFocus
                    rows={3}
                    placeholder="e.g. VP of Operations at a 3PL company doing $10M–$100M revenue. Technically literate, hates vendor integrations, reports to the CFO."
                    value={form.targetCustomer || ""}
                    onChange={e => update("targetCustomer", e.target.value)}
                    className="w-full px-4 py-3 bg-card border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-none leading-relaxed"
                  />
                  <p className="text-[11px] text-muted-foreground mt-2">
                    If you can't name the job title, the company size, and why they'd pay — you're not ready to sell yet.
                  </p>
                </div>
              )}

              {/* Step 3: biggestChallenge */}
              {step === 3 && (
                <div className="flex flex-col gap-2">
                  {CHALLENGES.map(c => (
                    <button
                      key={c}
                      onClick={() => update("biggestChallenge", c)}
                      className={`text-left px-4 py-3 rounded-lg border text-sm transition-all ${
                        form.biggestChallenge === c
                          ? "border-primary bg-primary/8 text-foreground font-medium"
                          : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"
                      }`}
                    >
                      {challengeLabels[c]}
                    </button>
                  ))}
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Nav */}
          <div className="flex items-center justify-between mt-10">
            <button
              onClick={() => step > 0 ? setStep(s => s - 1) : onDismiss?.()}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              {step === 0 ? "Skip for now" : "← Back"}
            </button>

            <button
              onClick={isLast ? handleSubmit : () => setStep(s => s + 1)}
              disabled={!canAdvance() || saving}
              className="flex items-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground rounded-full text-xs font-bold uppercase tracking-widest disabled:opacity-40 transition-opacity hover:opacity-90"
            >
              {saving ? "Saving..." : isLast ? "Lock it in" : "Next"}
              {!saving && <ArrowRight className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {onDismiss && (
          <button
            onClick={onDismiss}
            className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </motion.div>
    </div>
  );
}
