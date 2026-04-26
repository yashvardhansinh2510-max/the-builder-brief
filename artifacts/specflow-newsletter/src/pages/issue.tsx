import { useState } from "react";
import { motion } from "framer-motion";
import { Link, useRoute } from "wouter";
import {
  ArrowLeft, ArrowRight, Check, Lightbulb, Target, Compass,
  TrendingUp, Code2, Zap, DollarSign, Users2, Copy
} from "lucide-react";
import logoPath from "@assets/logo.jpg";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { issues } from "@/lib/data";
import PortalNav from "@/components/PortalNav";

const sectionIcons = [Lightbulb, Target, Compass, TrendingUp, Code2, Zap, DollarSign, Users2];

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.5, delay: i * 0.07 } }),
};

export default function IssuePage() {
  const [, params] = useRoute("/issue/:slug");
  const slug = params?.slug ?? "";
  const issue = issues.find(i => i.slug === slug);
  const issueIndex = issues.findIndex(i => i.slug === slug);
  const prevIssue = issueIndex < issues.length - 1 ? issues[issueIndex + 1] : null;
  const nextIssue = issueIndex > 0 ? issues[issueIndex - 1] : null;

  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "success">("idle");
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) { setStatus("success"); setEmail(""); setTimeout(() => setStatus("idle"), 5000); }
  };

  const handleCopy = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  if (!issue) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-center">
          <p className="font-serif text-4xl mb-4">Issue not found.</p>
          <Link href="/archive" className="text-primary hover:underline text-sm">Browse all issues</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <PortalNav activePage="issue" />

      <main className="max-w-3xl mx-auto px-6 pt-12 pb-28">
        {/* Back */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp}>
          <Link href="/archive" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-10">
            <ArrowLeft className="w-4 h-4" /> All issues
          </Link>

          {/* Header */}
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-5">
              <span className="text-xs font-mono text-muted-foreground">Issue #{issue.number}</span>
              <Badge variant="secondary" className="rounded-full text-xs">{issue.category}</Badge>
              <span className="text-xs text-primary font-medium">{issue.tam}</span>
            </div>
            <h1 className="font-serif text-5xl md:text-6xl mb-5 leading-tight">{issue.title}</h1>
            <p className="text-xl text-muted-foreground leading-relaxed">{issue.tagline}</p>
            <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
              First revenue in <strong>{issue.revenueIn}</strong>
            </div>
          </div>
        </motion.div>

        <div className="w-full h-px bg-border/50 mb-12" />

        {/* The Problem */}
        <motion.section initial="hidden" whileInView="visible" viewport={{ once: true }} custom={0} variants={fadeUp} className="mb-12">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-8 h-8 rounded-lg bg-card border border-border flex items-center justify-center">
              <Target className="w-4 h-4 text-primary" />
            </div>
            <h2 className="font-serif text-2xl">The Problem</h2>
          </div>
          <p className="text-foreground/80 leading-relaxed text-lg">{issue.problem}</p>
        </motion.section>

        {/* Why Now */}
        <motion.section initial="hidden" whileInView="visible" viewport={{ once: true }} custom={1} variants={fadeUp} className="mb-12">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-8 h-8 rounded-lg bg-card border border-border flex items-center justify-center">
              <Compass className="w-4 h-4 text-primary" />
            </div>
            <h2 className="font-serif text-2xl">Why Now</h2>
          </div>
          <div className="space-y-4">
            {issue.whyNow.map((point, idx) => (
              <div key={idx} className="flex gap-4">
                <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">{idx + 1}</span>
                <p className="text-foreground/80 leading-relaxed">{point}</p>
              </div>
            ))}
          </div>
        </motion.section>

        {/* Market Intelligence */}
        <motion.section initial="hidden" whileInView="visible" viewport={{ once: true }} custom={2} variants={fadeUp} className="mb-12">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-8 h-8 rounded-lg bg-card border border-border flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-primary" />
            </div>
            <h2 className="font-serif text-2xl">Market Intelligence</h2>
          </div>
          <div className="bg-card border border-card-border rounded-2xl p-6">
            <p className="text-foreground/80 leading-relaxed">{issue.tam_detail}</p>
          </div>
        </motion.section>

        {/* Build Blueprint */}
        <motion.section initial="hidden" whileInView="visible" viewport={{ once: true }} custom={3} variants={fadeUp} className="mb-12">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-8 h-8 rounded-lg bg-card border border-border flex items-center justify-center">
              <Code2 className="w-4 h-4 text-primary" />
            </div>
            <h2 className="font-serif text-2xl">Build Blueprint</h2>
          </div>
          <div className="space-y-3">
            {issue.blueprint.map((step, idx) => (
              <motion.div
                key={idx}
                custom={idx}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                className="flex gap-4 bg-card border border-card-border rounded-xl p-5"
              >
                <span className="font-mono text-sm font-bold text-primary min-w-[2rem]">0{idx + 1}</span>
                <p className="text-foreground/80 leading-relaxed text-sm">{step}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Claude Prompts */}
        <motion.section initial="hidden" whileInView="visible" viewport={{ once: true }} custom={4} variants={fadeUp} className="mb-12">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <h2 className="font-serif text-2xl">Claude Prompts</h2>
          </div>
          <p className="text-sm text-muted-foreground mb-5">Copy and paste these directly. Engineered for this exact build.</p>
          <div className="space-y-4">
            {issue.prompts.map((prompt, idx) => (
              <div key={idx} className="relative group bg-foreground/[0.03] border border-border rounded-2xl p-6">
                <p className="text-sm leading-relaxed text-foreground/80 font-mono pr-12">{prompt}</p>
                <button
                  data-testid={`button-copy-prompt-${idx}`}
                  onClick={() => handleCopy(prompt, idx)}
                  className="absolute top-4 right-4 p-2 rounded-lg border border-border bg-card text-muted-foreground hover:text-foreground transition-colors opacity-0 group-hover:opacity-100"
                >
                  {copiedIdx === idx ? <Check className="w-4 h-4 text-primary" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            ))}
          </div>
        </motion.section>

        {/* First Revenue Path */}
        <motion.section initial="hidden" whileInView="visible" viewport={{ once: true }} custom={5} variants={fadeUp} className="mb-12">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-8 h-8 rounded-lg bg-card border border-border flex items-center justify-center">
              <DollarSign className="w-4 h-4 text-primary" />
            </div>
            <h2 className="font-serif text-2xl">First Revenue Path</h2>
          </div>
          <div className="bg-card border border-card-border rounded-2xl p-6">
            <p className="text-foreground/80 leading-relaxed">{issue.firstRevenue}</p>
          </div>
        </motion.section>

        {/* First 10 Customers */}
        <motion.section initial="hidden" whileInView="visible" viewport={{ once: true }} custom={6} variants={fadeUp} className="mb-16">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-8 h-8 rounded-lg bg-card border border-border flex items-center justify-center">
              <Users2 className="w-4 h-4 text-primary" />
            </div>
            <h2 className="font-serif text-2xl">First 10 Customers</h2>
          </div>
          <div className="bg-primary/5 border border-primary/20 rounded-2xl p-6">
            <p className="text-foreground/80 leading-relaxed">{issue.firstTen}</p>
          </div>
        </motion.section>

        {/* Prev / Next navigation */}
        <div className="flex items-center justify-between gap-4 py-8 border-t border-border/50">
          {prevIssue ? (
            <Link href={`/issue/${prevIssue.slug}`} className="group flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors" data-testid="link-prev-issue">
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              <span>#{prevIssue.number} {prevIssue.title}</span>
            </Link>
          ) : <div />}
          {nextIssue ? (
            <Link href={`/issue/${nextIssue.slug}`} className="group flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors ml-auto" data-testid="link-next-issue">
              <span>#{nextIssue.number} {nextIssue.title}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          ) : <div />}
        </div>

        {/* Subscribe CTA */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          className="bg-card border border-border rounded-2xl p-10 text-center mt-6"
        >
          <p className="text-sm font-medium text-primary uppercase tracking-widest mb-3">Never miss an issue</p>
          <h3 className="font-serif text-3xl mb-4">Get the next blueprint<br /><span className="italic">this Friday.</span></h3>
          <form onSubmit={handleSubscribe} className="max-w-sm mx-auto" data-testid="form-issue-subscribe">
            <div className="flex flex-col sm:flex-row gap-3">
              <Input
                data-testid="input-issue-email"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="rounded-full h-12 px-5 border-border/50 bg-background"
                required
              />
              <Button
                data-testid="button-issue-subscribe"
                type="submit"
                className="rounded-full h-12 px-6 bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
              >
                {status === "success" ? <><Check className="w-4 h-4 mr-1.5" />Done</> : "Subscribe"}
              </Button>
            </div>
          </form>
        </motion.div>
      </main>

      <footer className="border-t border-border/40 py-10 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
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
