import React, { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Check, ChevronRight, Compass, Inbox, Target, Zap, ZapOff, Users, LineChart, Code, Rocket } from "lucide-react";
import logoPath from "@assets/logo.jpg";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const issues = [
  {
    number: "008",
    title: "RentShield",
    tags: "B2B SaaS · $40B TAM",
    description: "AI reads 10,000 comparable leases so renters know exactly what to push back on before signing. First revenue in 14 days."
  },
  {
    number: "007",
    title: "RefundRadar",
    tags: "Fintech · $12B TAM",
    description: "AI agent audits SaaS invoices, finds overcharges, and files refunds automatically — takes 30% of whatever it recovers. First revenue in 7 days."
  },
  {
    number: "006",
    title: "TrialMatch",
    tags: "Health · $8B TAM",
    description: "Matches qualifying patients to clinical trial slots using their existing medical records. First revenue in 30 days."
  },
  {
    number: "005",
    title: "ContractPulse",
    tags: "B2B SaaS · $18B TAM",
    description: "AI monitors all vendor contracts, alerts before auto-renew clauses, and writes renegotiation briefs. First revenue in 14 days."
  },
  {
    number: "004",
    title: "VoiceClone",
    tags: "AI-Native · $6B TAM",
    description: "AI trains on their writing/emails to ghostwrite LinkedIn in their exact voice. First revenue in 7 days."
  },
  {
    number: "003",
    title: "SkillGap Oracle",
    tags: "Education · $22B TAM",
    description: "AI maps the exact learning path from where someone is to where a specific job requires. First revenue in 21 days."
  },
  {
    number: "002",
    title: "PermitFlow",
    tags: "Real Estate · $30B TAM",
    description: "AI reads municipal codes and pre-fills permit applications perfectly. First revenue in 14 days."
  },
  {
    number: "001",
    title: "GriefSupport AI",
    tags: "Consumer · $5B TAM",
    description: "Always-on AI grief support between therapy sessions. First revenue in 10 days."
  }
];

const contents = [
  { title: "The Idea", desc: "A specific named startup concept", icon: Zap },
  { title: "The Problem", desc: "Exact pain with real numbers", icon: Target },
  { title: "Why Now", desc: "3 bullets on why this window is open", icon: Compass },
  { title: "Market Intelligence", desc: "TAM, competitive gap, who's NOT serving this yet", icon: Inbox },
  { title: "Build Blueprint", desc: "6 concrete steps to ship v1 from zero", icon: ChevronRight },
  { title: "Claude Prompts", desc: "3–5 copy-paste prompts engineered for this exact build", icon: ZapOff },
  { title: "First Revenue Path", desc: "Exactly how to charge the first customer", icon: ArrowRight },
  { title: "First 10 Customers", desc: "Specific, unglamorous, works-in-real-life strategy", icon: Check }
];

const audiences = [
  { title: "Aspiring Founders", desc: "People who want to build real companies but don't know what to build.", icon: Rocket },
  { title: "Early-stage Founders", desc: "Validating directions and looking for their next pivot or feature.", icon: LineChart },
  { title: "Product Managers", desc: "PMs who want to go solo and build their own products.", icon: Users },
  { title: "Indie Hackers", desc: "Tired of building toys and ready to tackle real, profitable problems.", icon: Code },
];

export default function Home() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "success">("idle");

  const [bottomEmail, setBottomEmail] = useState("");
  const [bottomStatus, setBottomStatus] = useState<"idle" | "success">("idle");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setStatus("success");
      setEmail("");
      setTimeout(() => setStatus("idle"), 5000);
    }
  };

  const handleBottomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (bottomEmail) {
      setBottomStatus("success");
      setBottomEmail("");
      setTimeout(() => setBottomStatus("idle"), 5000);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <nav className="border-b border-border/40 py-4 px-6 md:px-12 flex justify-between items-center sticky top-0 bg-background/90 backdrop-blur-md z-50">
        <div className="flex items-center gap-3">
          <img src={logoPath} alt="SpecFlow Logo" className="w-8 h-8 rounded-sm object-cover" />
          <span className="font-serif text-2xl font-medium tracking-tight">The Build Brief</span>
        </div>
        <Button 
          data-testid="button-nav-subscribe"
          variant="default" 
          className="rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium px-6"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        >
          Subscribe
        </Button>
      </nav>

      <main className="pt-20 pb-24 md:pt-32 md:pb-40 px-6 max-w-7xl mx-auto">
        <section className="text-center max-w-4xl mx-auto mb-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              Issue #009 drops this Friday
            </div>
            <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl leading-[1.05] tracking-tight mb-8">
              Ship a real startup <br /> <span className="italic text-primary">by Monday.</span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-12">
              Every Friday, we send one complete startup idea — named, researched, and blueprinted. Direct, no-fluff, packed with insider-level information.
            </p>
            
            <form onSubmit={handleSubmit} className="max-w-md mx-auto relative group" data-testid="form-hero-subscribe">
              <div className="flex flex-col sm:flex-row gap-3">
                <Input 
                  data-testid="input-hero-email"
                  type="email" 
                  placeholder="name@example.com" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="rounded-full h-14 px-6 text-lg border-border/50 bg-card/50 focus-visible:ring-primary focus-visible:border-primary transition-all duration-300"
                  required
                />
                <Button 
                  data-testid="button-hero-submit"
                  type="submit" 
                  className="rounded-full h-14 px-8 text-lg font-semibold bg-foreground hover:bg-foreground/90 text-background transition-all"
                >
                  {status === "success" ? <Check className="w-5 h-5 mr-2" /> : null}
                  {status === "success" ? "Subscribed" : "Get the brief"}
                </Button>
              </div>
            </form>
            <p className="text-sm text-muted-foreground mt-4">Join 15,000+ founders, PMs, and indie hackers.</p>
          </motion.div>
        </section>

        <section className="mb-32">
          <div className="text-center mb-16">
            <h2 className="font-serif text-4xl md:text-5xl mb-4">Inside the vault.</h2>
            <p className="text-lg text-muted-foreground">What you've missed so far.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {issues.map((issue, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="group relative bg-card rounded-2xl p-6 border border-card-border hover:border-primary/30 hover:shadow-lg transition-all duration-300 flex flex-col h-full cursor-pointer"
                data-testid={`card-issue-${idx}`}
              >
                <div className="text-sm font-medium text-muted-foreground mb-3 flex items-center justify-between">
                  <span>Issue {issue.number}</span>
                  <span className="text-xs bg-background px-2 py-1 rounded-full text-foreground/70 border border-border/50">{issue.tags}</span>
                </div>
                <h3 className="font-serif text-2xl mb-3 group-hover:text-primary transition-colors">{issue.title}</h3>
                <p className="text-foreground/80 text-sm leading-relaxed mb-6 flex-grow">{issue.description}</p>
                <div className="pt-4 border-t border-border/50 text-sm font-medium text-primary flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-2 group-hover:translate-y-0">
                  Read blueprint <ArrowRight className="w-4 h-4" />
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        <section className="mb-32 max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="font-serif text-4xl md:text-5xl mb-6">What's in the box?</h2>
              <p className="text-lg text-muted-foreground leading-relaxed mb-8">
                We don't do fluff. Every issue is a teardown of exactly what to build, why it works, and how to get your first customer. It's like a strategy doc that was never supposed to be public.
              </p>
              <div className="space-y-4">
                {contents.slice(0, 4).map((item, idx) => (
                  <div key={idx} className="flex gap-4 items-start">
                    <div className="bg-card p-2 rounded-lg border border-border mt-1">
                      <item.icon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-medium text-foreground">{item.title}</h4>
                      <p className="text-sm text-muted-foreground">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-card rounded-3xl p-8 border border-border shadow-sm relative overflow-hidden"
            >
               <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full" />
               <div className="space-y-6 relative z-10">
                {contents.slice(4).map((item, idx) => (
                  <div key={idx} className="flex gap-4 items-start">
                    <div className="bg-background p-2 rounded-lg border border-border mt-1">
                      <item.icon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-medium text-foreground">{item.title}</h4>
                      <p className="text-sm text-muted-foreground">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        <section className="mb-32">
          <div className="text-center mb-16">
            <h2 className="font-serif text-4xl md:text-5xl mb-4">Who it's for.</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              If you've ever looked at a successful product and thought "I could have built that," this is for you.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {audiences.map((audience, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="bg-card/50 rounded-2xl p-6 border border-border/50 text-center"
              >
                <div className="mx-auto bg-background w-12 h-12 flex items-center justify-center rounded-xl border border-border mb-4 text-primary">
                  <audience.icon className="w-6 h-6" />
                </div>
                <h3 className="font-serif text-xl mb-2">{audience.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{audience.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>

        <section className="mb-16">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="bg-card border border-border rounded-[2.5rem] p-10 md:p-20 text-center relative overflow-hidden"
          >
            <div className="absolute inset-0 opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
            <h2 className="font-serif text-4xl md:text-6xl mb-6 relative z-10">Stop building toys.</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10 relative z-10">
              Get the spark and the plan simultaneously. That's what we deliver. Delivered every Friday, so you can ship by Monday.
            </p>
            <form onSubmit={handleBottomSubmit} className="max-w-md mx-auto relative z-10" data-testid="form-bottom-subscribe">
              <div className="flex flex-col sm:flex-row gap-3">
                <Input 
                  data-testid="input-bottom-email"
                  type="email" 
                  placeholder="name@example.com" 
                  value={bottomEmail}
                  onChange={(e) => setBottomEmail(e.target.value)}
                  className="rounded-full h-14 px-6 text-lg border-border/50 bg-background focus-visible:ring-primary focus-visible:border-primary transition-all duration-300"
                  required
                />
                <Button 
                  data-testid="button-bottom-submit"
                  type="submit" 
                  className="rounded-full h-14 px-8 text-lg font-semibold bg-primary hover:bg-primary/90 text-primary-foreground transition-all"
                >
                  {bottomStatus === "success" ? <Check className="w-5 h-5 mr-2" /> : null}
                  {bottomStatus === "success" ? "Subscribed" : "Join the brief"}
                </Button>
              </div>
            </form>
          </motion.div>
        </section>
      </main>

      <footer className="border-t border-border/40 py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <img src={logoPath} alt="SpecFlow Logo" className="w-6 h-6 rounded-sm opacity-50 grayscale mix-blend-multiply" />
            <span className="font-serif text-xl font-medium tracking-tight text-muted-foreground">The Build Brief</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} The Build Brief. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}