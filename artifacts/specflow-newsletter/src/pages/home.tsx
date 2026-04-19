import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import {
  ArrowRight, Check, Zap, Target, Compass, BookOpen,
  Code2, DollarSign, Users2, TrendingUp, Lightbulb,
  Rocket, LineChart, Users, Code
} from "lucide-react";
import logoPath from "@assets/logo.jpg";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { issues } from "@/lib/data";
import { Badge } from "@/components/ui/badge";

const contents = [
  { title: "The Idea", desc: "A specific named startup concept — not a category, a company.", icon: Lightbulb, span: "col-span-1 row-span-1" },
  { title: "The Problem", desc: "The exact pain, with real numbers if possible.", icon: Target, span: "col-span-1 row-span-1" },
  { title: "Why Now", desc: "3 bullets on why this window is open today and not 3 years ago.", icon: Compass, span: "col-span-2 row-span-1" },
  { title: "Market Intelligence", desc: "TAM, competitive gap, who's NOT serving this yet — so you know how real the opportunity is.", icon: TrendingUp, span: "col-span-2 row-span-1" },
  { title: "Build Blueprint", desc: "6 concrete steps to ship v1. Starts from zero, ends at a working product. No ambiguity, no hand-waving.", icon: Code2, span: "col-span-1 row-span-1" },
  { title: "Claude Prompts", desc: "3–5 copy-paste prompts engineered for this specific build. The newsletter's signature feature.", icon: Zap, span: "col-span-1 row-span-2", accent: true },
  { title: "First Revenue Path", desc: "Exactly how to charge the first customer. Pricing model, acquisition tactic, timeline.", icon: DollarSign, span: "col-span-1 row-span-1" },
  { title: "First 10 Customers", desc: "A specific, unglamorous, works-in-real-life strategy to get the first 10 paying users.", icon: Users2, span: "col-span-2 row-span-1" },
];

const audiences = [
  { title: "Aspiring Founders", desc: "Want to build real companies but don't know what to build.", icon: Rocket },
  { title: "Early-stage Founders", desc: "Validating directions and looking for the next pivot.", icon: LineChart },
  { title: "Product Managers", desc: "PMs who want to go solo and own the full product.", icon: Users },
  { title: "Indie Hackers", desc: "Tired of building toys and ready for real, profitable problems.", icon: Code },
];

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.55, delay: i * 0.07 } }),
};

export default function Home() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "success">("idle");
  const [bottomEmail, setBottomEmail] = useState("");
  const [bottomStatus, setBottomStatus] = useState<"idle" | "success">("idle");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) { setStatus("success"); setEmail(""); setTimeout(() => setStatus("idle"), 5000); }
  };
  const handleBottomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (bottomEmail) { setBottomStatus("success"); setBottomEmail(""); setTimeout(() => setBottomStatus("idle"), 5000); }
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      {/* NAV */}
      <nav className="border-b border-border/40 py-4 px-6 md:px-12 flex justify-between items-center sticky top-0 bg-background/90 backdrop-blur-md z-50">
        <Link href="/" className="flex items-center gap-3">
          <img src={logoPath} alt="The Build Brief" className="w-8 h-8 rounded-sm object-cover" />
          <span className="font-serif text-xl font-medium tracking-tight">The Build Brief</span>
        </Link>
        <div className="flex items-center gap-6">
          <Link href="/archive" className="hidden md:block text-sm text-muted-foreground hover:text-foreground transition-colors">Archive</Link>
          <Link href="/about" className="hidden md:block text-sm text-muted-foreground hover:text-foreground transition-colors">About</Link>
          <Button
            data-testid="button-nav-subscribe"
            variant="default"
            className="rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium px-6"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          >
            Subscribe
          </Button>
        </div>
      </nav>

      <main className="pb-24">
        {/* HERO */}
        <section className="pt-24 md:pt-36 pb-28 px-6 max-w-5xl mx-auto text-center">
          <motion.div initial="hidden" animate="visible" variants={fadeUp}>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-7">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              Issue #009 drops this Friday
            </div>
            <h1 className="font-serif text-5xl md:text-7xl lg:text-[5.5rem] leading-[1.04] tracking-tight mb-7">
              Ship a real startup <br />
              <span className="italic text-primary">by Monday.</span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-12">
              Every Friday, one complete startup idea — named, researched, and blueprinted. Open it on Friday. Ship something by Monday.
            </p>
            <form onSubmit={handleSubmit} className="max-w-md mx-auto" data-testid="form-hero-subscribe">
              <div className="flex flex-col sm:flex-row gap-3">
                <Input
                  data-testid="input-hero-email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="rounded-full h-14 px-6 text-base border-border/50 bg-card/60 focus-visible:ring-primary"
                  required
                />
                <Button
                  data-testid="button-hero-submit"
                  type="submit"
                  className="rounded-full h-14 px-8 text-base font-semibold bg-foreground hover:bg-foreground/90 text-background"
                >
                  {status === "success" ? <><Check className="w-4 h-4 mr-2" />Subscribed</> : "Get the brief"}
                </Button>
              </div>
            </form>
            <p className="text-sm text-muted-foreground mt-4">Join 15,000+ founders, PMs, and indie hackers. Free forever.</p>
          </motion.div>
        </section>

        {/* BENTO GRID — what's inside */}
        <section className="px-6 max-w-6xl mx-auto mb-28">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={fadeUp}
            className="text-center mb-12"
          >
            <p className="text-sm font-medium text-primary uppercase tracking-widest mb-3">Every issue</p>
            <h2 className="font-serif text-4xl md:text-5xl">8 sections. Zero fluff.</h2>
          </motion.div>

          <div className="grid grid-cols-4 grid-rows-[auto_auto_auto] gap-4">
            {/* Row 1: Idea, Problem, Why Now (wide) */}
            {[0, 1].map((i) => (
              <motion.div
                key={i}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                className="col-span-2 md:col-span-1 bg-card border border-card-border rounded-2xl p-6 flex flex-col gap-3"
              >
                <div className="w-10 h-10 rounded-xl bg-background border border-border flex items-center justify-center">
                  {i === 0 ? <Lightbulb className="w-5 h-5 text-primary" /> : <Target className="w-5 h-5 text-primary" />}
                </div>
                <h3 className="font-serif text-xl">{contents[i].title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{contents[i].desc}</p>
              </motion.div>
            ))}
            {/* Why Now — spans 2 cols */}
            <motion.div
              custom={2}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              className="col-span-4 md:col-span-2 bg-card border border-card-border rounded-2xl p-6 flex flex-col gap-3"
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

            {/* Row 2: Market Intel (wide), Blueprint */}
            <motion.div
              custom={3}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              className="col-span-4 md:col-span-2 bg-card border border-card-border rounded-2xl p-6 flex flex-col gap-3"
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
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              className="col-span-2 md:col-span-1 bg-card border border-card-border rounded-2xl p-6 flex flex-col gap-3"
            >
              <div className="w-10 h-10 rounded-xl bg-background border border-border flex items-center justify-center">
                <Code2 className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-serif text-xl">{contents[4].title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{contents[4].desc}</p>
              <div className="mt-auto space-y-1.5">
                {[1, 2, 3, 4, 5, 6].map(n => (
                  <div key={n} className="h-1.5 rounded-full bg-background border border-border overflow-hidden">
                    <div className="h-full bg-primary/30 rounded-full" style={{ width: `${100 - n * 10}%` }} />
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Claude Prompts — tall accent cell */}
            <motion.div
              custom={5}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              className="col-span-2 md:col-span-1 row-span-1 md:row-span-2 bg-primary text-primary-foreground rounded-2xl p-6 flex flex-col gap-3"
            >
              <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <h3 className="font-serif text-xl text-white">{contents[5].title}</h3>
              <p className="text-sm text-white/80 leading-relaxed">{contents[5].desc}</p>
              <div className="mt-4 space-y-3">
                {["Prompt 01", "Prompt 02", "Prompt 03"].map((p, i) => (
                  <div key={i} className="bg-white/10 rounded-xl p-3 text-xs text-white/70 font-mono">
                    {p} — copy &amp; paste ready
                  </div>
                ))}
              </div>
              <p className="mt-auto text-xs text-white/60">The signature feature. No other newsletter does this.</p>
            </motion.div>

            {/* Row 3: First Revenue, First 10 Customers */}
            <motion.div
              custom={6}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              className="col-span-2 md:col-span-1 bg-card border border-card-border rounded-2xl p-6 flex flex-col gap-3"
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
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              className="col-span-4 md:col-span-2 bg-card border border-card-border rounded-2xl p-6 flex flex-col gap-3"
            >
              <div className="w-10 h-10 rounded-xl bg-background border border-border flex items-center justify-center">
                <Users2 className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-serif text-xl">{contents[7].title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{contents[7].desc}</p>
              <div className="mt-auto flex items-center gap-2">
                <div className="flex -space-x-2">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="w-7 h-7 rounded-full bg-muted border-2 border-card flex items-center justify-center text-xs font-medium text-muted-foreground">{i + 1}</div>
                  ))}
                </div>
                <span className="text-xs text-muted-foreground">specific, unglamorous, real</span>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ARCHIVE PREVIEW */}
        <section className="px-6 max-w-6xl mx-auto mb-28">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10"
          >
            <div>
              <p className="text-sm font-medium text-primary uppercase tracking-widest mb-2">The vault</p>
              <h2 className="font-serif text-4xl md:text-5xl">8 ideas. 8 blueprints.</h2>
            </div>
            <Link href="/archive" className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Browse all issues <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {issues.map((issue, idx) => (
              <motion.div
                key={issue.slug}
                custom={idx}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-60px" }}
                variants={fadeUp}
              >
                <Link href={`/issue/${issue.slug}`} className="group block bg-card border border-card-border rounded-2xl p-6 h-full hover:border-primary/40 hover:shadow-md transition-all duration-300">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-medium text-muted-foreground">#{issue.number}</span>
                    <Badge variant="secondary" className="text-[10px] px-2 py-0.5 rounded-full">{issue.category}</Badge>
                  </div>
                  <h3 className="font-serif text-xl mb-2 group-hover:text-primary transition-colors">{issue.title}</h3>
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

        {/* WHO IT'S FOR */}
        <section className="px-6 max-w-5xl mx-auto mb-28">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="text-center mb-12">
            <p className="text-sm font-medium text-primary uppercase tracking-widest mb-3">Who reads it</p>
            <h2 className="font-serif text-4xl md:text-5xl">If you've ever thought<br /><span className="italic">"I could have built that."</span></h2>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {audiences.map((a, idx) => (
              <motion.div
                key={idx}
                custom={idx}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                className="bg-card/60 border border-border/50 rounded-2xl p-6 text-center"
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

        {/* BOTTOM CTA */}
        <section className="px-6 max-w-6xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            className="bg-card border border-border rounded-[2rem] p-10 md:p-20 text-center relative overflow-hidden"
          >
            <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-primary/5 blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -left-24 w-64 h-64 rounded-full bg-primary/5 blur-3xl pointer-events-none" />
            <p className="text-sm font-medium text-primary uppercase tracking-widest mb-4 relative z-10">Every Friday</p>
            <h2 className="font-serif text-4xl md:text-6xl mb-5 relative z-10">Stop waiting for<br /><span className="italic">the right idea.</span></h2>
            <p className="text-xl text-muted-foreground max-w-xl mx-auto mb-10 relative z-10">
              We deliver it. With the blueprint to build it. So the only thing left is for you to start.
            </p>
            <form onSubmit={handleBottomSubmit} className="max-w-md mx-auto relative z-10" data-testid="form-bottom-subscribe">
              <div className="flex flex-col sm:flex-row gap-3">
                <Input
                  data-testid="input-bottom-email"
                  type="email"
                  placeholder="name@example.com"
                  value={bottomEmail}
                  onChange={(e) => setBottomEmail(e.target.value)}
                  className="rounded-full h-14 px-6 text-base border-border/50 bg-background"
                  required
                />
                <Button
                  data-testid="button-bottom-submit"
                  type="submit"
                  className="rounded-full h-14 px-8 text-base font-semibold bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  {bottomStatus === "success" ? <><Check className="w-4 h-4 mr-2" />Done</> : "Join the brief"}
                </Button>
              </div>
            </form>
          </motion.div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="border-t border-border/40 py-12 px-6 mt-24">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <Link href="/" className="flex items-center gap-3">
            <img src={logoPath} alt="The Build Brief" className="w-6 h-6 rounded-sm opacity-40 grayscale" />
            <span className="font-serif text-lg text-muted-foreground">The Build Brief</span>
          </Link>
          <div className="flex items-center gap-8 text-sm text-muted-foreground">
            <Link href="/archive" className="hover:text-foreground transition-colors">Archive</Link>
            <Link href="/about" className="hover:text-foreground transition-colors">About</Link>
          </div>
          <p className="text-sm text-muted-foreground">© {new Date().getFullYear()} The Build Brief</p>
        </div>
      </footer>
    </div>
  );
}
