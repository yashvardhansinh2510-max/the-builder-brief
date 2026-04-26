import { useState, useRef, useEffect, useCallback } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { Link } from "wouter";
import { useSearch } from "wouter";
import { useToast } from "@/hooks/use-toast";
import {
  ArrowRight, Check, Zap, Target, Compass,
  Code2, DollarSign, Users2, TrendingUp, Lightbulb,
  Rocket, LineChart, Users, Code, AlertCircle
} from "lucide-react";
import logoPath from "@assets/logo.jpg";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { issues } from "@/lib/data";
import { Badge } from "@/components/ui/badge";
import { useSubscribe } from "@/hooks/useSubscribe";
import { usePageTracking } from "@/hooks/useAnalytics";
import { useAuth } from "@clerk/react";
import { SubscribeSuccessOverlay } from "@/components/SubscribeSuccessOverlay";
import { PainPointsSection } from "@/components/PainPointsSection";
import { DashboardPreviewSection } from "@/components/DashboardPreviewSection";
import { EngineShowcaseSection } from "@/components/EngineShowcaseSection";
import { FeaturesSection } from "@/components/FeaturesSection";
import { TiersShowcaseSection } from "@/components/TiersShowcaseSection";
import { PricingSection } from "@/components/PricingSection";
import { IncubatorSection } from "@/components/IncubatorSection";
import { LeadModal } from "@/components/LeadModal";
import { TestimonialSection } from "@/components/TestimonialSection";
import { FoundersGlobeSection } from "@/components/FoundersGlobeSection";
import { PlatformGrowthSection } from "@/components/PlatformGrowthSection";
import RuixenSection from "@/components/ui/ruixen-feature-section";
import CombinedFeaturedSection from "@/components/ui/combined-featured-section";
import PersonalizedBuildBriefFeatures from "@/components/ui/personalized-features";
import CustomersTableCard from "@/components/ui/customers-table-card";

const contents = [
  { title: "The Idea", desc: "A specific named startup concept — not a category, a company.", icon: Lightbulb },
  { title: "The Problem", desc: "The exact pain, with real numbers if possible.", icon: Target },
  { title: "Why Now", desc: "3 bullets on why this window is open today and not 3 years ago.", icon: Compass },
  { title: "Market Intelligence", desc: "TAM, competitive gap, who's NOT serving this yet.", icon: TrendingUp },
  { title: "Build Blueprint", desc: "6 concrete steps to ship v1. Starts from zero, ends at a working product.", icon: Code2 },
  { title: "AI Execution Prompts", desc: "Ready-to-use AI prompts for landing page, email, pitch deck. Copy-paste and ship.", icon: Zap, accent: true },
  { title: "First Revenue Path", desc: "Exactly how to charge the first customer. Pricing, timeline.", icon: DollarSign },
  { title: "First 10 Customers", desc: "A specific, unglamorous, works-in-real-life strategy.", icon: Users2 },
];

const audiences = [
  { title: "Aspiring Founders", desc: "Want to build real companies but don't know what to build.", icon: Rocket },
  { title: "Early-stage Founders", desc: "Validating directions and looking for the next pivot.", icon: LineChart },
  { title: "Product Managers", desc: "PMs who want to go solo and own the full product.", icon: Users },
  { title: "AI/No-Code Builders", desc: "Shipping with AI and no-code tools. Ship 10x faster, validate in days.", icon: Code },
];

const stats = [
  { value: "15,000+", label: "founders & PMs" },
  { value: "500+", label: "companies shipped" },
  { value: "8", label: "complete blueprints" },
  { value: "100%", label: "free, always" },
];

function HeroSection({ onSuccess }: { onSuccess: () => void }) {
  const { status, subscribe } = useSubscribe("hero");
  const [email, setEmail] = useState("");
  const search = useSearch();
  const { toast } = useToast();

  useEffect(() => {
    if (status === "pending-confirmation" || status === "exists") {
      onSuccess();
    }
  }, [status, onSuccess]);

  useEffect(() => {
    const params = new URLSearchParams(search);
    if (params.get("confirmed") === "true") {
      toast({
        title: "You're confirmed!",
        description: "You'll receive your first blueprint this Friday.",
      });
      window.history.replaceState({}, "", window.location.pathname);
    }
    if (params.get("unsubscribed") === "true") {
      toast({ title: "Unsubscribed", description: "You've been removed from the list." });
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, [search, toast]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    subscribe(email);
    if (status !== "loading") setEmail("");
  };

  const wordVariants = {
    hidden: { opacity: 0, y: 40, filter: "blur(8px)" },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: { duration: 0.7, delay: 0.1 + i * 0.12, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] },
    }),
  };

  return (
    <section className="pt-28 md:pt-40 pb-32 px-6 max-w-5xl mx-auto text-center relative overflow-hidden">
      {/* Static ambient glow — no scroll animation */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-primary/5 blur-[120px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="relative z-10"
      >
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.05 }}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-8"
        >
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          Issue #009 drops this Friday
        </motion.div>

        <h1 className="font-serif text-5xl md:text-7xl lg:text-[5.5rem] leading-[1.04] tracking-tight mb-8">
          {["Ship", "a", "real", "startup"].map((word, i) => (
            <motion.span
              key={word + i}
              custom={i}
              initial="hidden"
              animate="visible"
              variants={wordVariants}
              className="inline-block mr-[0.25em]"
            >
              {word}
            </motion.span>
          ))}
          <br />
          <motion.span
            custom={4}
            initial="hidden"
            animate="visible"
            variants={wordVariants}
            className="italic text-primary inline-block"
          >
            by Monday.
          </motion.span>
        </h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.65 }}
          className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-12"
        >
          Every Friday, one complete startup idea — researched by founders who've exited,
          AI-refined for execution, and blueprinted with real code.
          Open it on Friday. Ship something by Monday.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <form onSubmit={handleSubmit} className="max-w-md mx-auto mb-5">
            <div className="flex flex-col sm:flex-row gap-3">
              <Input
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="rounded-full h-14 px-6 text-base border-border/50 bg-card/60 focus-visible:ring-primary"
                required
              />
              <Button
                type="submit"
                disabled={status === "loading"}
                className="rounded-full h-14 px-8 text-base font-semibold bg-foreground hover:bg-foreground/90 text-background transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                {status === "pending-confirmation" ? <><Check className="w-4 h-4 mr-2" />Check your inbox!</> :
                  status === "exists" ? <>Already subscribed ✓</> :
                    status === "loading" ? "Subscribing…" : "Get the brief"}
              </Button>
            </div>
          </form>
          {status === "pending-confirmation" && (
            <p className="text-sm text-green-600 flex items-center justify-center gap-1.5 mb-3">
              <Check className="w-3.5 h-3.5" /> Check your inbox to confirm!
            </p>
          )}
          {status === "exists" && (
            <p className="text-sm text-amber-600 flex items-center justify-center gap-1.5 mb-3">
              <AlertCircle className="w-3.5 h-3.5" /> You're already subscribed.
            </p>
          )}
          {status === "error" && (
            <p className="text-sm text-destructive flex items-center justify-center gap-1.5 mb-3">
              <AlertCircle className="w-3.5 h-3.5" /> Something went wrong. Try again.
            </p>
          )}
          <p className="text-sm text-muted-foreground">Join 15,000+ founders. Shipped 500+ companies. Free forever. (Pro tier: founders helping founders directly.)</p>
        </motion.div>
      </motion.div>
    </section>
  );
}

function StatsBar() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <section ref={ref} className="px-6 max-w-5xl mx-auto mb-28">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-border/30 rounded-2xl overflow-hidden border border-border/30">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 16 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: i * 0.08, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="bg-card/40 px-8 py-8 text-center"
          >
            <p className="font-serif text-3xl md:text-4xl mb-1.5">{s.value}</p>
            <p className="text-sm text-muted-foreground">{s.label}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

function BentoSection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  const cellVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.97 },
    visible: (i: number) => ({
      opacity: 1, y: 0, scale: 1,
      transition: { duration: 0.55, delay: i * 0.065, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] },
    }),
  };

  return (
    <section className="px-6 max-w-6xl mx-auto mb-28">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.55, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="text-center mb-12"
      >
        <p className="text-sm font-medium text-primary uppercase tracking-widest mb-3">Every issue</p>
        <h2 className="font-serif text-4xl md:text-5xl">8 sections. Zero fluff.</h2>
      </motion.div>

      <div ref={ref} className="grid grid-cols-4 gap-4">
        {/* Row 1 */}
        {[0, 1].map((i) => (
          <motion.div
            key={i}
            custom={i}
            initial="hidden"
            animate={inView ? "visible" : "hidden"}
            variants={cellVariants}
            whileHover={{ y: -3, transition: { duration: 0.2 } }}
            className="col-span-2 md:col-span-1 bg-card border border-card-border rounded-2xl p-6 flex flex-col gap-3 cursor-default"
          >
            <div className="w-10 h-10 rounded-xl bg-background border border-border flex items-center justify-center">
              {i === 0 ? <Lightbulb className="w-5 h-5 text-primary" /> : <Target className="w-5 h-5 text-primary" />}
            </div>
            <h3 className="font-serif text-xl">{contents[i].title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{contents[i].desc}</p>
          </motion.div>
        ))}
        <motion.div
          custom={2}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          variants={cellVariants}
          whileHover={{ y: -3, transition: { duration: 0.2 } }}
          className="col-span-4 md:col-span-2 bg-card border border-card-border rounded-2xl p-6 flex flex-col gap-3 cursor-default"
        >
          <div className="w-10 h-10 rounded-xl bg-background border border-border flex items-center justify-center">
            <Compass className="w-5 h-5 text-primary" />
          </div>
          <h3 className="font-serif text-xl">{contents[2].title}</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">{contents[2].desc}</p>
          <div className="mt-auto flex gap-2 flex-wrap">
            {["Market timing", "Tech unlock", "Behavior shift"].map(tag => (
              <span key={tag} className="text-xs px-3 py-1 rounded-full bg-background border border-border text-muted-foreground">{tag}</span>
            ))}
          </div>
        </motion.div>

        {/* Row 2 */}
        <motion.div
          custom={3}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          variants={cellVariants}
          whileHover={{ y: -3, transition: { duration: 0.2 } }}
          className="col-span-4 md:col-span-2 bg-card border border-card-border rounded-2xl p-6 flex flex-col gap-3 cursor-default"
        >
          <div className="w-10 h-10 rounded-xl bg-background border border-border flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-primary" />
          </div>
          <h3 className="font-serif text-xl">{contents[3].title}</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">{contents[3].desc}</p>
          <div className="mt-auto grid grid-cols-3 gap-2 pt-2">
            {["TAM Size", "Who's missing", "Entry gap"].map(label => (
              <div key={label} className="text-center p-2 rounded-xl bg-background border border-border">
                <p className="text-xs text-muted-foreground">{label}</p>
              </div>
            ))}
          </div>
        </motion.div>
        <motion.div
          custom={4}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          variants={cellVariants}
          whileHover={{ y: -3, transition: { duration: 0.2 } }}
          className="col-span-2 md:col-span-1 bg-card border border-card-border rounded-2xl p-6 flex flex-col gap-3 cursor-default"
        >
          <div className="w-10 h-10 rounded-xl bg-background border border-border flex items-center justify-center">
            <Code2 className="w-5 h-5 text-primary" />
          </div>
          <h3 className="font-serif text-xl">{contents[4].title}</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">{contents[4].desc}</p>
          <div className="mt-auto space-y-1.5 pt-2">
            {[1, 2, 3, 4, 5, 6].map(n => (
              <div key={n} className="h-1.5 rounded-full bg-background border border-border overflow-hidden">
                <motion.div
                  className="h-full bg-primary/40 rounded-full"
                  initial={{ width: 0 }}
                  animate={inView ? { width: `${100 - n * 10}%` } : { width: 0 }}
                  transition={{ duration: 0.8, delay: 0.4 + n * 0.06, ease: [0.25, 0.46, 0.45, 0.94] }}
                />
              </div>
            ))}
          </div>
        </motion.div>

        {/* Claude Prompts — accent tall cell */}
        <motion.div
          custom={5}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          variants={cellVariants}
          whileHover={{ y: -3, transition: { duration: 0.2 } }}
          className="col-span-2 md:col-span-1 row-span-1 md:row-span-2 bg-primary text-primary-foreground rounded-2xl p-6 flex flex-col gap-3 cursor-default"
        >
          <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <h3 className="font-serif text-xl text-white">{contents[5].title}</h3>
          <p className="text-sm text-white/75 leading-relaxed">{contents[5].desc}</p>
          <div className="mt-4 space-y-2.5">
            {["Build the landing page", "Write the onboarding email", "Draft the pitch deck"].map((p, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -12 }}
                animate={inView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.45, delay: 0.55 + i * 0.1 }}
                className="bg-white/10 rounded-xl p-3 text-xs text-white/70 font-mono leading-relaxed"
              >
                ⌘ {p}
              </motion.div>
            ))}
          </div>
          <p className="mt-auto text-xs text-white/50 leading-relaxed">The signature feature. No other newsletter does this.</p>
        </motion.div>

        {/* Row 3 */}
        <motion.div
          custom={6}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          variants={cellVariants}
          whileHover={{ y: -3, transition: { duration: 0.2 } }}
          className="col-span-2 md:col-span-1 bg-card border border-card-border rounded-2xl p-6 flex flex-col gap-3 cursor-default"
        >
          <div className="w-10 h-10 rounded-xl bg-background border border-border flex items-center justify-center">
            <DollarSign className="w-5 h-5 text-primary" />
          </div>
          <h3 className="font-serif text-xl">{contents[6].title}</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">{contents[6].desc}</p>
        </motion.div>
        <motion.div
          custom={7}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          variants={cellVariants}
          whileHover={{ y: -3, transition: { duration: 0.2 } }}
          className="col-span-4 md:col-span-2 bg-card border border-card-border rounded-2xl p-6 flex flex-col gap-3 cursor-default"
        >
          <div className="w-10 h-10 rounded-xl bg-background border border-border flex items-center justify-center">
            <Users2 className="w-5 h-5 text-primary" />
          </div>
          <h3 className="font-serif text-xl">{contents[7].title}</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">{contents[7].desc}</p>
          <div className="mt-auto flex items-center gap-3">
            <div className="flex -space-x-2">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="w-7 h-7 rounded-full bg-muted border-2 border-card flex items-center justify-center text-[10px] font-semibold text-muted-foreground">{i + 1}</div>
              ))}
            </div>
            <span className="text-xs text-muted-foreground">specific, unglamorous, real</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function ArchivePreviewSection() {
  return (
    <section className="px-6 max-w-6xl mx-auto mb-28">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.55, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10"
      >
        <div>
          <p className="text-sm font-medium text-primary uppercase tracking-widest mb-2">The vault (AI-researched, founder-validated)</p>
          <h2 className="font-serif text-4xl md:text-5xl">8 ideas. 8 blueprints.</h2>
        </div>
        <Link href="/archive" className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors group">
          Browse all issues <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {issues.map((issue, idx) => (
          <motion.div
            key={issue.slug}
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5, delay: idx * 0.07, ease: [0.25, 0.46, 0.45, 0.94] }}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
          >
            <Link href={`/issue/${issue.slug}`} className="group block bg-card border border-card-border rounded-2xl p-6 h-full hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium text-muted-foreground">#{issue.number}</span>
                <Badge variant="secondary" className="text-[10px] px-2 py-0.5 rounded-full">{issue.category}</Badge>
              </div>
              <h3 className="font-serif text-xl mb-2 group-hover:text-primary transition-colors leading-snug">{issue.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed mb-5 line-clamp-3">{issue.tagline}</p>
              <div className="flex items-center justify-between text-xs text-muted-foreground border-t border-border/50 pt-3">
                <span>{issue.tam}</span>
                <span className="text-primary font-medium">Rev in {issue.revenueIn}</span>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

function AudienceSection() {
  return (
    <section className="px-6 max-w-5xl mx-auto mb-28">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.55, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="text-center mb-12"
      >
        <p className="text-sm font-medium text-primary uppercase tracking-widest mb-3">Who reads it</p>
        <h2 className="font-serif text-4xl md:text-5xl">
          If you've ever thought<br />
          <span className="italic">"I could have built that."</span>
        </h2>
      </motion.div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {audiences.map((a, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: idx * 0.08, ease: [0.25, 0.46, 0.45, 0.94] }}
            whileHover={{ y: -3, transition: { duration: 0.2 } }}
            className="bg-card/60 border border-border/50 rounded-2xl p-7 text-center"
          >
            <div className="mx-auto bg-background w-12 h-12 flex items-center justify-center rounded-xl border border-border mb-4 text-primary">
              <a.icon className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-lg mb-2">{a.title}</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">{a.desc}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

function BottomCTASection() {
  const { status, subscribe } = useSubscribe("bottom-cta");
  const [email, setEmail] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    subscribe(email);
    if (status !== "loading") setEmail("");
  };

  return (
    <section className="px-6 max-w-6xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 28 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="bg-card border border-border rounded-[2.5rem] p-10 md:p-20 text-center relative overflow-hidden"
      >
        <div className="absolute -top-32 -right-32 w-80 h-80 rounded-full bg-primary/6 blur-[100px] pointer-events-none" />
        <div className="absolute -bottom-32 -left-32 w-80 h-80 rounded-full bg-primary/6 blur-[100px] pointer-events-none" />
        <p className="text-sm font-medium text-primary uppercase tracking-widest mb-4 relative z-10">Every Friday</p>
        <h2 className="font-serif text-4xl md:text-6xl mb-5 relative z-10">
          Stop waiting for<br /><span className="italic">the right idea.</span>
        </h2>
        <p className="text-xl text-muted-foreground max-w-xl mx-auto mb-10 relative z-10 leading-relaxed">
          We deliver it. AI-refined. Founder-validated. With the blueprint to build it. So the only thing left is for you to start.
        </p>
        <form onSubmit={handleSubmit} className="max-w-md mx-auto relative z-10">
          <div className="flex flex-col sm:flex-row gap-3">
            <Input
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded-full h-14 px-6 text-base border-border/50 bg-background"
              required
            />
            <Button
              type="submit"
              disabled={status === "loading"}
              className="rounded-full h-14 px-8 text-base font-semibold bg-primary hover:bg-primary/90 text-primary-foreground transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              {status === "pending-confirmation" ? <><Check className="w-4 h-4 mr-2" />Check your inbox!</> :
                status === "exists" ? <>Already in ✓</> :
                  status === "loading" ? "Joining…" : "Join the brief"}
            </Button>
          </div>
        </form>
        {status === "pending-confirmation" && (
          <p className="text-sm text-green-600 flex items-center justify-center gap-1.5 mt-3 relative z-10">
            <Check className="w-3.5 h-3.5" /> Check your inbox to confirm!
          </p>
        )}
        {status === "exists" && (
          <p className="text-sm text-amber-600 flex items-center justify-center gap-1.5 mt-3 relative z-10">
            <AlertCircle className="w-3.5 h-3.5" /> You're already subscribed.
          </p>
        )}
        {status === "error" && (
          <p className="text-sm text-destructive flex items-center justify-center gap-1.5 mt-3 relative z-10">
            <AlertCircle className="w-3.5 h-3.5" /> Something went wrong. Try again.
          </p>
        )}
      </motion.div>
    </section>
  );
}

export default function Home() {
  usePageTracking("/");
  const { isSignedIn } = useAuth();
  const [showOverlay, setShowOverlay] = useState(false);
  const [navLocked, setNavLocked] = useState(false);

  const handleSuccess = useCallback(() => {
    setShowOverlay(true);
    setNavLocked(true);
  }, []);

  const handleDismiss = useCallback(() => {
    setShowOverlay(false);
    setNavLocked(false);
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      {/* NAV */}
      <motion.nav
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="border-b border-border/40 py-4 px-6 md:px-12 flex justify-between items-center sticky top-0 bg-background/90 backdrop-blur-md z-50"
      >
        <Link href="/" className="flex items-center gap-3">
          <img src={logoPath} alt="The Build Brief" className="w-8 h-8 rounded-sm object-cover" />
          <span className="font-serif text-xl font-medium tracking-tight">The Build Brief</span>
        </Link>
        <div className="flex items-center gap-6">
          <Link href="/archive" className="hidden md:block text-sm text-muted-foreground hover:text-foreground transition-colors">Archive</Link>
          <Link href="/about" className="hidden md:block text-sm text-muted-foreground hover:text-foreground transition-colors">About</Link>
          {!navLocked && (
            isSignedIn ? (
              <Link href="/dashboard" className="text-sm font-medium text-primary hover:text-primary/80 transition-colors">
                Dashboard
              </Link>
            ) : (
              <Link href="/sign-up">
                <Button
                  variant="default"
                  className="rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium px-6 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  Subscribe
                </Button>
              </Link>
            )
          )}
        </div>
      </motion.nav>

      <AnimatePresence>
        {showOverlay && <SubscribeSuccessOverlay onDismiss={handleDismiss} />}
      </AnimatePresence>

      <LeadModal />

      <main className="pb-24">
        <HeroSection onSuccess={handleSuccess} />
        <StatsBar />
        <PainPointsSection />
        <DashboardPreviewSection />
        <EngineShowcaseSection />
        <BentoSection />
        <FeaturesSection />
        <RuixenSection />
        <CombinedFeaturedSection />
        <PersonalizedBuildBriefFeatures />
        <div>
          <CustomersTableCard />
        </div>
        <TiersShowcaseSection />
        <PricingSection />
        <IncubatorSection />
        <TestimonialSection />
        <FoundersGlobeSection />
        <PlatformGrowthSection />
        <ArchivePreviewSection />
        <AudienceSection />
        <BottomCTASection />
      </main>

      <footer className="border-t border-border/40 py-12 px-6 mt-24">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <Link href="/" className="flex items-center gap-3">
            <img src={logoPath} alt="The Build Brief" className="w-6 h-6 rounded-sm opacity-40 grayscale" />
            <span className="font-serif text-lg text-muted-foreground">The Build Brief</span>
          </Link>
          <div className="flex items-center gap-8 text-sm text-muted-foreground">
            <Link href="/archive" className="hover:text-foreground transition-colors">Archive</Link>
            <Link href="/about" className="hover:text-foreground transition-colors">About</Link>
            <Link href="/sign-in" className="hover:text-foreground transition-colors">Sign in</Link>
          </div>
          <p className="text-sm text-muted-foreground">© {new Date().getFullYear()} The Build Brief</p>
        </div>
      </footer>
    </div>
  );
}
