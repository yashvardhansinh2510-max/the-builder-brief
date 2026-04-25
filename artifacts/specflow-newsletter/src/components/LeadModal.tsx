import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowRight, ArrowLeft, CheckCircle2, Shield, Loader2, Lock } from "lucide-react";
import { toast } from "sonner";
import { useLocation } from "wouter";

type Step = 1 | 2 | 3;

const STAGES = [
  { value: "idea", label: "Pre-Idea / Concept" },
  { value: "mvp", label: "Building MVP" },
  { value: "revenue", label: "Early Revenue" },
  { value: "scaling", label: "Scaling (>$10k MRR)" },
];

const LOOKING_FOR_OPTIONS = [
  "Technical Co-Founder / CTO",
  "GTM Strategy & Sales Systems",
  "Fundraising & VC Introductions",
  "Exit Positioning & Acquisition",
  "All of the above",
];

const REFERRAL_OPTIONS = [
  "The Build Brief Newsletter",
  "Word of Mouth / Referral",
  "Twitter / X",
  "LinkedIn",
  "Search",
  "Other",
];

const INDUSTRIES = [
  "AI / Machine Learning",
  "SaaS / B2B Software",
  "FinTech",
  "HealthTech",
  "LegalTech",
  "E-Commerce",
  "Developer Tools",
  "Consumer",
  "Deep Tech",
  "Other",
];

type FormData = {
  name: string;
  email: string;
  linkedin_url: string;
  twitter_handle: string;
  startup_name: string;
  stage: string;
  industry: string;
  problem: string;
  traction: string;
  goals: string;
  looking_for: string;
  revenue_goal: string;
  why_now: string;
  referral_source: string;
  deck_url: string;
};

const emptyForm: FormData = {
  name: "",
  email: "",
  linkedin_url: "",
  twitter_handle: "",
  startup_name: "",
  stage: "idea",
  industry: "",
  problem: "",
  traction: "",
  goals: "",
  looking_for: "",
  revenue_goal: "",
  why_now: "",
  referral_source: "",
  deck_url: "",
};

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="text-[10px] font-bold uppercase tracking-widest opacity-60 ml-1 font-sans block mb-1.5">
      {children}
    </label>
  );
}

function inputCls(extra = "") {
  return `w-full bg-background border border-border h-12 rounded-xl px-4 focus:outline-none focus:border-primary/40 transition-all font-sans text-sm ${extra}`;
}

function textareaCls() {
  return "w-full bg-background border border-border rounded-xl px-4 py-3 focus:outline-none focus:border-primary/40 transition-all resize-none font-sans text-sm leading-relaxed";
}

export function LeadModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [, setLocation] = useLocation();
  const [status, setStatus] = useState<"idle" | "loading" | "success">("idle");
  const [step, setStep] = useState<Step>(1);
  const [formData, setFormData] = useState<FormData>(emptyForm);

  useEffect(() => {
    const handleOpen = () => { setIsOpen(true); setStep(1); };
    window.addEventListener("open-lead-modal", handleOpen);
    return () => window.removeEventListener("open-lead-modal", handleOpen);
  }, []);

  const set = (field: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setFormData(prev => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!response.ok) throw new Error("Failed to submit");
      const data = await response.json();
      setStatus("success");
      toast.success("Application submitted. We'll be in touch.");
      setTimeout(() => {
        setIsOpen(false);
        setStatus("idle");
        setFormData(emptyForm);
        setStep(1);
        if (data.lead?.uuid) setLocation(`/incubator/status/${data.lead.uuid}`);
      }, 1800);
    } catch {
      toast.error("Something went wrong. Please try again.");
      setStatus("idle");
    }
  };

  const canAdvanceStep1 = formData.name.trim() && formData.email.trim();
  const canAdvanceStep2 = formData.stage && formData.industry && formData.problem.trim();

  const stepLabels = ["Who You Are", "Your Venture", "Your Ambition"];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="absolute inset-0 bg-background/70 backdrop-blur-md"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 12 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="relative w-full max-w-2xl bg-card border border-card-border rounded-[2rem] shadow-2xl overflow-hidden max-h-[92vh] flex flex-col"
          >
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-full hover:bg-muted transition-colors opacity-40 hover:opacity-100 z-10"
            >
              <X className="w-4 h-4" />
            </button>

            {status === "success" ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center text-center p-12 md:p-16"
              >
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-8">
                  <CheckCircle2 className="w-10 h-10 text-primary" />
                </div>
                <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary mb-4 font-sans">File Received</p>
                <h3 className="font-serif text-4xl mb-4 tracking-tight">Application <br/>in the Vault.</h3>
                <p className="text-muted-foreground leading-relaxed font-sans text-sm max-w-sm">
                  Your file is now with our partners. We review every application personally. If the fit is right, you'll hear from us within 48 hours.
                </p>
                <p className="mt-6 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50 font-sans">Redirecting to your status page...</p>
              </motion.div>
            ) : (
              <>
                {/* Header */}
                <div className="p-8 pb-0 shrink-0">
                  <div className="flex items-center gap-2 mb-5">
                    <div className="p-1.5 rounded-lg bg-primary/10">
                      <Shield className="w-3.5 h-3.5 text-primary" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-primary font-sans">3 Spots Per Cohort • Co-Builder Program</span>
                  </div>
                  <h2 className="font-serif text-3xl md:text-4xl mb-2 tracking-tight">Apply for the <span className="italic">Foundry.</span></h2>
                  <p className="text-muted-foreground font-sans text-sm leading-relaxed">
                    We don't run programs. We pick partners. Fill this out like your startup depends on it — because it might.
                  </p>

                  {/* Step indicator */}
                  <div className="flex items-center gap-2 mt-6 mb-6">
                    {([1, 2, 3] as Step[]).map((s) => (
                      <div key={s} className="flex items-center gap-2">
                        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full transition-all ${step === s ? "bg-primary/10 text-primary" : step > s ? "text-primary/40" : "text-muted-foreground/30"}`}>
                          <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold border transition-all ${step === s ? "border-primary bg-primary text-primary-foreground" : step > s ? "border-primary/30 bg-primary/10 text-primary" : "border-border"}`}>
                            {step > s ? "✓" : s}
                          </div>
                          <span className="text-[10px] font-bold uppercase tracking-widest font-sans hidden sm:block">{stepLabels[s - 1]}</span>
                        </div>
                        {s < 3 && <div className={`h-px flex-1 min-w-[16px] transition-all ${step > s ? "bg-primary/30" : "bg-border/50"}`} />}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Form body */}
                <div className="overflow-y-auto px-8 pb-8 flex-1">
                  <AnimatePresence mode="wait">
                    {step === 1 && (
                      <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <FieldLabel>Full Name *</FieldLabel>
                            <input required type="text" placeholder="Jane Doe" className={inputCls()} value={formData.name} onChange={set("name")} />
                          </div>
                          <div>
                            <FieldLabel>Work Email *</FieldLabel>
                            <input required type="email" placeholder="jane@startup.com" className={inputCls()} value={formData.email} onChange={set("email")} />
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <FieldLabel>LinkedIn URL</FieldLabel>
                            <input type="url" placeholder="linkedin.com/in/janedoe" className={inputCls()} value={formData.linkedin_url} onChange={set("linkedin_url")} />
                          </div>
                          <div>
                            <FieldLabel>Twitter / X Handle</FieldLabel>
                            <input type="text" placeholder="@janedoe" className={inputCls()} value={formData.twitter_handle} onChange={set("twitter_handle")} />
                          </div>
                        </div>
                        <div className="pt-4 flex justify-end">
                          <button
                            type="button"
                            disabled={!canAdvanceStep1}
                            onClick={() => setStep(2)}
                            className="h-12 px-8 rounded-full bg-foreground text-background font-bold text-sm flex items-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-30 disabled:scale-100 font-sans"
                          >
                            Next — Your Venture <ArrowRight className="w-4 h-4" />
                          </button>
                        </div>
                      </motion.div>
                    )}

                    {step === 2 && (
                      <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <FieldLabel>Startup / Idea Name</FieldLabel>
                            <input type="text" placeholder="AcmeCo" className={inputCls()} value={formData.startup_name} onChange={set("startup_name")} />
                          </div>
                          <div>
                            <FieldLabel>Current Stage *</FieldLabel>
                            <select className={inputCls("appearance-none cursor-pointer")} value={formData.stage} onChange={set("stage")}>
                              {STAGES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                            </select>
                          </div>
                        </div>
                        <div>
                          <FieldLabel>Industry / Vertical *</FieldLabel>
                          <select className={inputCls("appearance-none cursor-pointer")} value={formData.industry} onChange={set("industry")} required>
                            <option value="">Select your industry</option>
                            {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
                          </select>
                        </div>
                        <div>
                          <FieldLabel>What problem are you solving? *</FieldLabel>
                          <textarea
                            required
                            placeholder="Be specific. What's the pain, who feels it, and why hasn't it been solved well yet?"
                            rows={4}
                            className={textareaCls()}
                            value={formData.problem}
                            onChange={set("problem")}
                          />
                        </div>
                        <div>
                          <FieldLabel>Current Traction</FieldLabel>
                          <textarea
                            placeholder="MRR, users, waitlist signups, letters of intent — whatever you have. Zero is fine."
                            rows={2}
                            className={textareaCls()}
                            value={formData.traction}
                            onChange={set("traction")}
                          />
                        </div>
                        <div className="pt-4 flex justify-between">
                          <button type="button" onClick={() => setStep(1)} className="h-12 px-6 rounded-full border border-border font-bold text-sm flex items-center gap-2 hover:bg-muted transition-all font-sans">
                            <ArrowLeft className="w-4 h-4" /> Back
                          </button>
                          <button
                            type="button"
                            disabled={!canAdvanceStep2}
                            onClick={() => setStep(3)}
                            className="h-12 px-8 rounded-full bg-foreground text-background font-bold text-sm flex items-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-30 disabled:scale-100 font-sans"
                          >
                            Next — Your Ambition <ArrowRight className="w-4 h-4" />
                          </button>
                        </div>
                      </motion.div>
                    )}

                    {step === 3 && (
                      <motion.form key="step3" onSubmit={handleSubmit} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }} className="space-y-4">
                        <div>
                          <FieldLabel>What do you need most from us? *</FieldLabel>
                          <select className={inputCls("appearance-none cursor-pointer")} value={formData.looking_for} onChange={set("looking_for")} required>
                            <option value="">Select the primary need</option>
                            {LOOKING_FOR_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                          </select>
                        </div>
                        <div>
                          <FieldLabel>12-Month Revenue Target</FieldLabel>
                          <input type="text" placeholder="e.g. $500k ARR, $50k MRR, first $10k" className={inputCls()} value={formData.revenue_goal} onChange={set("revenue_goal")} />
                        </div>
                        <div>
                          <FieldLabel>Why is now the right time for this venture? *</FieldLabel>
                          <textarea
                            required
                            placeholder="What's the unlock? Regulation, technology, market shift — why this window exists today."
                            rows={3}
                            className={textareaCls()}
                            value={formData.why_now}
                            onChange={set("why_now")}
                          />
                        </div>
                        <div>
                          <FieldLabel>What you're building / your vision</FieldLabel>
                          <textarea
                            required
                            placeholder="The thesis, the moat, the exit. Speak freely."
                            rows={3}
                            className={textareaCls()}
                            value={formData.goals}
                            onChange={set("goals")}
                          />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <FieldLabel>How did you find us?</FieldLabel>
                            <select className={inputCls("appearance-none cursor-pointer")} value={formData.referral_source} onChange={set("referral_source")}>
                              <option value="">Select</option>
                              {REFERRAL_OPTIONS.map(r => <option key={r} value={r}>{r}</option>)}
                            </select>
                          </div>
                          <div>
                            <FieldLabel>Pitch Deck / Demo URL</FieldLabel>
                            <input type="url" placeholder="notion.so/... or drive.google.com/..." className={inputCls()} value={formData.deck_url} onChange={set("deck_url")} />
                          </div>
                        </div>

                        <div className="pt-4 flex flex-col gap-3">
                          <div className="flex justify-between items-center gap-3">
                            <button type="button" onClick={() => setStep(2)} className="h-12 px-6 rounded-full border border-border font-bold text-sm flex items-center gap-2 hover:bg-muted transition-all font-sans shrink-0">
                              <ArrowLeft className="w-4 h-4" /> Back
                            </button>
                            <button
                              type="submit"
                              disabled={status === "loading" || !formData.looking_for || !formData.why_now.trim() || !formData.goals.trim()}
                              className="flex-1 h-12 rounded-full bg-foreground text-background font-bold text-sm flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-40 disabled:scale-100 font-sans"
                            >
                              {status === "loading" ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                              ) : (
                                <>
                                  <Lock className="w-4 h-4" /> Submit Application
                                </>
                              )}
                            </button>
                          </div>
                          <p className="text-center text-[10px] text-muted-foreground font-sans uppercase tracking-widest opacity-50">
                            Selection based on technical & market viability. No commitments implied.
                          </p>
                        </div>
                      </motion.form>
                    )}
                  </AnimatePresence>
                </div>
              </>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
