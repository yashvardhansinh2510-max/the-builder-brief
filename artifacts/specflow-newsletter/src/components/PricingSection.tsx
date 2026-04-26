import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Star, Zap, PhoneCall, X, Shield, ArrowRight } from "lucide-react";
import { SpotlightCard } from "@/components/ui/spotlight-card";
import { toast } from "sonner";
import { useAuth } from "@/lib/AuthContext";
import { useLocation } from "wouter";
import { Input } from "@/components/ui/input";
import type { RazorpayPaymentResponse, RazorpayCheckoutOptions } from "@/types/razorpay";



export function PricingSection() {
  const [region, setRegion] = useState<"US" | "IN">("US");
  const [guestEmail, setGuestEmail] = useState("");
  const [guestPlan, setGuestPlan] = useState<string | null>(null);
  const [guestLoading, setGuestLoading] = useState(false);

  const { session } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    // Automatic Region Detection based on Timezone
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (timezone.includes("Asia/Calcutta") || timezone.includes("Asia/Kolkata") || timezone.includes("India")) {
      setRegion("IN");
    } else if (timezone.includes("America/") || timezone.includes("US/")) {
      setRegion("US");
    }
  }, []);


  const loadRazorpay = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleCheckout = async (planName: string, emailOverride?: string) => {
    const email = session?.user?.email ?? emailOverride;
    if (!email) {
      setGuestPlan(planName);
      return;
    }


    if (planName === "Enterprise Request") {
      window.dispatchEvent(new CustomEvent('open-lead-modal'));
      return;
    }

    const toastId = toast.loading("Preparing checkout...");

    try {
      const response = await fetch("/api/payments/create-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          plan: planName,
          region: region
        }),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.error || "Failed to create session");

      if (data.provider === "razorpay") {
        const res = await loadRazorpay();
        if (!res) {
          toast.error("Payment Error", { description: "Razorpay SDK failed to load." });
          return;
        }

        const options: RazorpayCheckoutOptions = {
          key: data.key,
          amount: data.amount,
          currency: data.currency,
          name: "The Builder Brief",
          description: `Subscribe to ${planName}`,
          order_id: data.orderId,
          handler: async (response: RazorpayPaymentResponse) => {
            const verifyRes = await fetch("/api/payments/verify-razorpay", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                ...response,
                email,
                plan: planName
              }),
            });
            const verifyData = await verifyRes.json();
            if (verifyData.success) {
              toast.success("Payment Successful", { description: "Your plan has been updated!" });
              setLocation("/payment-success");
            } else {
              toast.error("Verification Failed", { description: verifyData.error });
            }
          },
          prefill: {
            email,
          },
          theme: {
            color: "#f97316",
          },
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
        toast.dismiss(toastId);
      }
    } catch (error: any) {
      toast.error("Checkout Error", { description: error.message });
      toast.dismiss(toastId);
    }
  };

  const plans = [
    {
      name: "Free",
      tagline: "Ship your first idea.",
      priceUS: "$0",
      priceIN: "₹0",
      period: "forever",
      description: "One complete blueprint every Friday. Built by 500+ founders who've exited. All yours forever.",
      features: [
        "Weekly blueprint drop every Friday",
        "Full build blueprint for each idea",
        "Copy-paste Claude prompts for every issue",
        "First 10 customers strategy included",
      ],
      icon: Star,
      buttonText: "Current Plan",
      buttonVariant: "outline",
      popular: false,
    },
    {
      name: "Pro",
      tagline: "Tap into the founder network.",
      priceUS: "$29",
      priceIN: "₹2,407",
      period: "per month",
      description: "Daily insights from 500+ founders. Full playbook. Direct access to advisors who've shipped. Used by founders building the next unicorns.",
      features: [
        "Daily venture drops — 5 days a week",
        "Full Vault Archive — all 8+ blueprints, forever",
        "Complete 7-module Playbook (28 lessons)",
        "Full 21-day roadmap with metric calculators",
        "AI Advisor — 5 sessions per month",
        "Priority support — WhatsApp & Slack",
      ],
      icon: Zap,
      buttonText: "Upgrade to Pro",
      buttonVariant: "default",
      popular: true,
    },
    {
      name: "Max",
      tagline: "Co-founder access. Accelerator-level.",
      priceUS: "$149",
      priceIN: "₹12,367",
      period: "per month",
      description: "Everything in Pro, plus direct access to operators who've built and exited. Weekly strategy calls. Your personal operating system for scaling.",
      features: [
        "Everything in Pro, plus:",
        "AI Advisor — 20 sessions per month (Deep strategy depth)",
        "Weekly 30-min strategy call with founder operators",
        "Private architecture & systems review",
        "GTM strategy & execution review",
        "Early access to new features & founder network",
      ],
      icon: PhoneCall,
      buttonText: "Upgrade to Max",
      buttonVariant: "default",
      popular: false,
    },

  ];

  const comparisonFeatures = [
    { name: "Venture Drops", free: "Mon & Fri", pro: "Every Day", max: "Every Day" },
    { name: "The Vault Archive", free: false, pro: true, max: true },
    { name: "Startup of the Week", free: false, pro: true, max: true },
    { name: "Personal Startup Building", free: false, pro: "Tech to Sales", max: "Tech to Sales" },
    { name: "Priority Support", free: false, pro: "WhatsApp/Slack", max: "All Channels" },
    { name: "AI Advisor Sessions", free: false, pro: "5/mo", max: "20/mo" },
    { name: "1-on-1 Coaching (30m)", free: false, pro: false, max: true },
  ];

  return (
    <>
    <section id="pricing" className="py-28 px-6 max-w-6xl mx-auto relative z-10">
      <div className="text-center mb-16 relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-primary/10 blur-[100px] pointer-events-none rounded-full" />
        <p className="text-sm font-medium text-primary uppercase tracking-widest mb-3 relative z-10">Pricing</p>
        <h2 className="font-serif text-4xl md:text-5xl mb-3 relative z-10">
          Pick your path to ship.
        </h2>
        <p className="text-muted-foreground max-w-lg mx-auto text-base relative z-10 mb-6">Free: Get the blueprint. Pro: Join 500+ founders shipping daily. Max: Get accelerator access + co-founder operators.</p>
        
        {/* Toggle Region */}
        <div className="flex items-center justify-center gap-4 relative z-10">
          <span className={`text-sm font-medium transition-colors ${region === "US" ? "text-foreground" : "text-muted-foreground"}`}>
            USD ($)
          </span>
          <button 
            type="button" 
            onClick={() => setRegion(r => r === "US" ? "IN" : "US")}
            className="w-14 h-7 bg-card border border-border rounded-full relative p-1 flex items-center transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <motion.div
              layout
              className="w-5 h-5 bg-primary rounded-full shadow-md"
              initial={false}
              animate={{
                x: region === "IN" ? 26 : 0,
              }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            />
          </button>
          <span className={`text-sm font-medium transition-colors ${region === "IN" ? "text-foreground" : "text-muted-foreground"}`}>
            INR (₹)
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start relative z-10 mb-20">
        <AnimatePresence>
          {plans.map((plan, idx) => {
            const isPopular = plan.popular;
            return (
              <SpotlightCard
                key={plan.name + region}
                className={`relative bg-card border ${isPopular ? "border-primary shadow-2xl shadow-primary/10" : "border-card-border"} rounded-3xl p-8 flex flex-col h-full`}
              >
                {isPopular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-4 py-1 rounded-full text-xs font-bold tracking-wide">
                    MOST POPULAR
                  </div>
                )}
                
                <div className="w-12 h-12 rounded-xl bg-background border border-border flex items-center justify-center mb-6">
                  <plan.icon className={`w-6 h-6 ${isPopular ? "text-primary" : "text-foreground"}`} />
                </div>
                
                <h3 className="font-serif text-2xl mb-2">{plan.name}</h3>
                <p className="text-sm text-muted-foreground mb-6 h-10">{plan.description}</p>
                
                <div className="mb-8 relative h-[60px] flex items-end gap-2">
                  <motion.span 
                    key={region}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-5xl font-serif leading-none tracking-tight"
                  >
                    {region === "US" ? plan.priceUS : plan.priceIN}
                  </motion.span>
                  {plan.priceUS !== "$0" && <span className="text-muted-foreground mb-1">/{plan.period}</span>}
                </div>

                <div className="space-y-4 mb-8 flex-grow">
                  {plan.features.map((feature, i) => (
                    <div key={i} className="flex gap-3 text-sm text-foreground/80">
                      <Check className="w-5 h-5 text-primary shrink-0" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => handleCheckout(plan.name)}
                  className={`w-full py-4 rounded-xl font-semibold text-sm transition-all focus:outline-none cursor-pointer
                    ${isPopular 
                      ? "bg-primary text-primary-foreground hover:bg-primary/90 hover:scale-[1.02] active:scale-[0.98]" 
                      : "bg-background border border-border hover:bg-muted/50 hover:scale-[1.02] active:scale-[0.98]"
                    }
                  `}
                >
                  {plan.buttonText}
                </button>
              </SpotlightCard>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Comparison Table */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="mb-20 relative z-10 overflow-x-auto"
      >
        <div className="text-center mb-10">
          <h3 className="font-serif text-3xl mb-3">Which Tier Gets You to Revenue Fastest?</h3>
          <p className="text-muted-foreground max-w-xl mx-auto">Free ships ideas. Pro ships companies. Max accelerates exits.</p>
        </div>
        <SpotlightCard className="min-w-[700px] border border-border rounded-3xl overflow-hidden bg-card">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-muted/30">
                <th className="p-6 font-semibold text-foreground w-1/3 border-b border-border">Features</th>
                <th className="p-6 font-semibold text-foreground border-b border-border text-center">Free</th>
                <th className="p-6 font-semibold text-primary border-b border-border text-center">Pro</th>
                <th className="p-6 font-semibold text-foreground border-b border-border text-center">Max</th>
              </tr>
            </thead>
            <tbody>
              {comparisonFeatures.map((row, i) => (
                <tr key={i} className="hover:bg-muted/20 transition-colors border-b border-border/50 last:border-0">
                  <td className="p-6 text-sm text-foreground/90 font-medium">{row.name}</td>
                  <td className="p-6 text-sm text-center">
                    {typeof row.free === "boolean" ? (
                      row.free ? <Check className="w-5 h-5 text-primary mx-auto" /> : <X className="w-5 h-5 text-muted-foreground/40 mx-auto" />
                    ) : (
                      <span className="text-muted-foreground">{row.free}</span>
                    )}
                  </td>
                  <td className="p-6 text-sm text-center bg-primary/5">
                    {typeof row.pro === "boolean" ? (
                      row.pro ? <Check className="w-5 h-5 text-primary mx-auto" /> : <X className="w-5 h-5 text-muted-foreground/40 mx-auto" />
                    ) : (
                      <span className="text-primary font-medium">{row.pro}</span>
                    )}
                  </td>
                  <td className="p-6 text-sm text-center">
                    {typeof row.max === "boolean" ? (
                      row.max ? <Check className="w-5 h-5 text-primary mx-auto" /> : <X className="w-5 h-5 text-muted-foreground/40 mx-auto" />
                    ) : (
                      <span className="text-foreground">{row.max}</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </SpotlightCard>
      </motion.div>

      {/* Enterprise Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full rounded-3xl overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-primary/5 to-background z-0" />
        <div className="border border-primary/20 bg-card/40 backdrop-blur-md rounded-3xl p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
          <div className="flex gap-6 items-start">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0 border border-primary/20">
              <Shield className="w-7 h-7 text-primary" />
            </div>
            <div>
              <h3 className="font-serif text-3xl mb-2">The Incubator — 3 spots per cohort.</h3>
              <p className="text-muted-foreground max-w-xl text-sm leading-relaxed">
                We co-build your venture: architecture, first revenue, and the exit positioning that gets acquirers to call you. Not a program — a co-founder arrangement. If you're serious about an exit, let's talk.
              </p>
            </div>
          </div>
          <button 
            onClick={() => window.dispatchEvent(new CustomEvent('open-lead-modal'))}
            className="shrink-0 bg-foreground text-background px-8 py-4 rounded-xl font-semibold text-sm hover:scale-105 active:scale-95 transition-transform flex items-center gap-2 whitespace-nowrap cursor-pointer"
          >
            Apply for the Foundry <ArrowRight className="w-4 h-4" />
          </button>


        </div>
      </motion.div>

    </section>

    {/* Guest email modal — shown when unauthenticated user clicks a paid plan */}

    <AnimatePresence>
      {guestPlan && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center px-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setGuestPlan(null)}
            className="absolute inset-0 bg-background/90 backdrop-blur-xl"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-md bg-card border border-primary/20 rounded-[2.5rem] p-10 shadow-2xl"
          >
            <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 blur-3xl pointer-events-none" />
            <div className="relative z-10">
              <button onClick={() => setGuestPlan(null)} className="absolute top-0 right-0 p-2 hover:bg-background rounded-full transition-colors">
                <X className="w-4 h-4" />
              </button>
              <p className="text-[10px] font-bold uppercase tracking-widest text-primary mb-2">One step away</p>
              <h3 className="font-serif text-3xl mb-2">Enter your email</h3>
              <p className="text-sm text-muted-foreground mb-8 leading-relaxed">
                We'll take you straight to checkout for <span className="text-foreground font-semibold">{guestPlan}</span>. No account required to pay — you can set up your portal after.
              </p>
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (!guestEmail.trim()) return;
                  setGuestLoading(true);
                  await handleCheckout(guestPlan!, guestEmail.trim());
                  setGuestLoading(false);
                }}
                className="space-y-4"
              >
                <Input
                  type="email"
                  placeholder="your@email.com"
                  value={guestEmail}
                  onChange={e => setGuestEmail(e.target.value)}
                  required
                  className="h-12 rounded-xl border-border/60 bg-background"
                />
                <button
                  type="submit"
                  disabled={guestLoading}
                  className="w-full py-4 rounded-xl bg-primary text-primary-foreground font-bold text-sm hover:bg-primary/90 transition-all disabled:opacity-60 cursor-pointer"
                >
                  {guestLoading ? "Preparing checkout…" : `Continue to ${guestPlan} →`}
                </button>
              </form>
              <p className="text-center text-[10px] text-muted-foreground mt-6">
                Already have an account?{" "}
                <a href="/sign-in" className="text-primary underline underline-offset-2">Sign in</a>
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
    </>
  );
}

