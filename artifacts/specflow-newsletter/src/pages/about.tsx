import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { ArrowLeft, Check } from "lucide-react";
import logoPath from "@assets/logo.jpg";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.55, delay: i * 0.08 } }),
};

const promises = [
  { label: "One idea per week", desc: "Not a list. Not a roundup. One specific, named startup concept with the full blueprint." },
  { label: "No AI hype, no fluff", desc: "We won't tell you AI is going to change everything. We'll tell you exactly what to build and how." },
  { label: "Real numbers", desc: "TAM, revenue timelines, first customer strategies — with specifics, not hand-waving." },
  { label: "Always free", desc: "The core newsletter will always be free. We make money when you make money." },
];

const faq = [
  {
    q: "Is this for technical or non-technical founders?",
    a: "Both. The Build Blueprint assumes you can use AI tools like Claude to code. The Claude Prompts section is specifically engineered so non-technical founders can ship v1 without a co-founder."
  },
  {
    q: "How do you pick the ideas?",
    a: "We look for three signals simultaneously: a market that's structurally broken, a technical unlock that makes a new solution possible now (usually AI), and a distribution path that doesn't require millions in marketing spend. Every idea in the archive passed this filter."
  },
  {
    q: "Can I use these ideas commercially?",
    a: "Yes. The ideas are yours to build. We ask only that you tell us what you built — we want to feature your story in a future issue."
  },
  {
    q: "What if someone else builds the same idea?",
    a: "That's how markets work. The first mover rarely wins — the best executor does. If 10 people read the same blueprint and only 1 builds it, that person wins. We're more worried about people not building than building the same thing."
  },
  {
    q: "How long does it take to read each issue?",
    a: "15–20 minutes. We write every word to earn its place. There is no padding."
  },
];

export default function About() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "success">("idle");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) { setStatus("success"); setEmail(""); setTimeout(() => setStatus("idle"), 5000); }
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
          <Link href="/about" className="hidden md:block text-sm font-medium text-foreground">About</Link>
          <Button
            data-testid="button-nav-subscribe"
            variant="default"
            className="rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium px-6"
            asChild
          >
            <Link href="/">Subscribe</Link>
          </Button>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-6 pt-12 pb-28">
        <motion.div initial="hidden" animate="visible" variants={fadeUp}>
          <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-10">
            <ArrowLeft className="w-4 h-4" /> Back to home
          </Link>

          <p className="text-sm font-medium text-primary uppercase tracking-widest mb-4">About</p>
          <h1 className="font-serif text-5xl md:text-6xl mb-8 leading-tight">
            Every Friday, one idea.<br /><span className="italic">By Monday, you could be live.</span>
          </h1>
        </motion.div>

        <motion.div initial="hidden" animate="visible" custom={1} variants={fadeUp} className="prose prose-neutral max-w-none mb-14">
          <p className="text-lg text-foreground/80 leading-relaxed mb-6">
            The Build Brief started from a simple observation: the hardest part of building a startup isn't the building — it's knowing what to build. Every week, there are thousands of founders with the skills, the drive, and the time, sitting paralyzed in front of a blank page.
          </p>
          <p className="text-lg text-foreground/80 leading-relaxed mb-6">
            We built this newsletter to solve that specific problem. Not with a curated list of trends. Not with hot takes. With a complete blueprint for one specific company — named, scoped, and ready to execute — delivered every Friday.
          </p>
          <p className="text-lg text-foreground/80 leading-relaxed">
            The tone is direct. No fluff. We write like a YC partner giving you office hours: here's what's real, here's what's hard, here's exactly what you should do next. Every word earns its place.
          </p>
        </motion.div>

        <div className="w-full h-px bg-border/50 mb-14" />

        {/* What we promise */}
        <motion.section initial="hidden" whileInView="visible" viewport={{ once: true }} custom={2} variants={fadeUp} className="mb-14">
          <h2 className="font-serif text-3xl mb-8">What we promise.</h2>
          <div className="space-y-5">
            {promises.map((p, idx) => (
              <motion.div
                key={idx}
                custom={idx}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                className="flex gap-5 bg-card border border-card-border rounded-2xl p-6"
              >
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium text-foreground mb-1">{p.label}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{p.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        <div className="w-full h-px bg-border/50 mb-14" />

        {/* FAQ */}
        <motion.section initial="hidden" whileInView="visible" viewport={{ once: true }} custom={3} variants={fadeUp} className="mb-16">
          <h2 className="font-serif text-3xl mb-8">Common questions.</h2>
          <div className="space-y-6">
            {faq.map((item, idx) => (
              <motion.div
                key={idx}
                custom={idx}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
              >
                <h3 className="font-medium text-foreground mb-2">{item.q}</h3>
                <p className="text-muted-foreground leading-relaxed text-sm">{item.a}</p>
                {idx < faq.length - 1 && <div className="mt-6 h-px bg-border/40" />}
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* CTA */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          className="bg-card border border-border rounded-2xl p-10 text-center"
        >
          <p className="text-sm font-medium text-primary uppercase tracking-widest mb-3">Start here</p>
          <h3 className="font-serif text-3xl mb-4">Get Issue #009<br /><span className="italic">this Friday.</span></h3>
          <p className="text-muted-foreground text-sm mb-7 max-w-sm mx-auto">Free forever. One idea. One blueprint. Delivered every Friday.</p>
          <form onSubmit={handleSubmit} className="max-w-sm mx-auto" data-testid="form-about-subscribe">
            <div className="flex flex-col sm:flex-row gap-3">
              <Input
                data-testid="input-about-email"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="rounded-full h-12 px-5 border-border/50 bg-background"
                required
              />
              <Button
                data-testid="button-about-subscribe"
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
