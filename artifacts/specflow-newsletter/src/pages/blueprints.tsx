import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'wouter';
import { ArrowRight, Zap, Flame, CalendarDays, Rocket, BookOpen, Handshake, Users, Search, Check, DollarSign } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { issues } from '@/lib/data';
import { usePageTracking } from '@/hooks/useAnalytics';
import PublicNav from '@/components/PublicNav';
import logoPath from "@assets/logo.jpg";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.5, delay: i * 0.06 } }),
};

export default function BlueprintsPage() {
  usePageTracking('/blueprints');

  const featured = issues[0]; 

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/20">
      <PublicNav activePage="blueprints" />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 pt-20 pb-32">
        
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between text-sm text-muted-foreground font-mono tracking-wider mb-10">
          <span className="flex items-center gap-2 bg-card px-4 py-2 rounded-lg border border-border shadow-sm"><CalendarDays className="w-4 h-4 text-primary" /> {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
          <Button variant="outline" className="border-border bg-card text-foreground" asChild>
            <Link href="/archive"><Search className="w-4 h-4 mr-2"/> Search Past Ideas</Link>
          </Button>
        </div>

        {/* Idea of the Day Focus Section */}
        {featured && (
          <motion.div 
            initial="hidden" animate="visible" custom={1} variants={fadeUp} 
            className="mb-24 max-w-4xl mx-auto"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-bold mb-6 tracking-wide border border-primary/20">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              Idea of the Day
            </div>
            <h1 className="font-serif text-5xl md:text-7xl lg:text-[5rem] leading-[1.05] tracking-tight mb-8">
              {featured.title}
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed mb-10 max-w-2xl">
              {featured.tagline}
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href={`/issue/${featured.slug}`}>
                <Button className="h-14 px-8 text-lg rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold transition-all hover:scale-[1.02]">
                  Read Full Execution Playbook
                </Button>
              </Link>
              <Link href="/archive">
                <Button variant="outline" className="h-14 px-8 text-lg rounded-full border-border bg-card hover:bg-muted font-bold transition-all">
                  Browse Archive <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </div>
          </motion.div>
        )}

        <div className="w-full h-px bg-border mb-20" />

        {/* Universal Startup Toolkit */}
        <div className="max-w-6xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="mb-12">
            <h2 className="font-serif text-[3.5rem] mb-4 text-foreground">The Launch Toolkit</h2>
            <p className="text-xl text-muted-foreground max-w-2xl">
              Universal resources, sales scripts, and operational guides to help you scale any idea from $0 to $1M.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <div className="bg-card border border-border rounded-[2.5rem] p-10 md:p-12 hover:shadow-2xl hover:shadow-primary/5 transition-all duration-300">
              <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center mb-8">
                <Rocket className="w-7 h-7 text-indigo-600" />
              </div>
              <h3 className="font-serif text-3xl mb-4">Launch Playbook</h3>
              <p className="text-muted-foreground text-lg leading-relaxed mb-8">
                The exact step-by-step framework to go from zero to MVP to first revenue in under 30 days. No fluff.
              </p>
              <div className="space-y-4">
                {['Validating without code', 'Building the MVP stack', 'Acquiring the first 10 users'].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-indigo-500" />
                    <span className="font-medium text-sm text-foreground">{item}</span>
                  </div>
                ))}
              </div>
              <Button variant="outline" className="w-full mt-10 h-12 rounded-xl border-border bg-card hover:bg-muted font-bold text-indigo-600">
                Access Playbook
              </Button>
            </div>

            <div className="bg-card border border-border rounded-[2.5rem] p-10 md:p-12 hover:shadow-2xl hover:shadow-primary/5 transition-all duration-300">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center mb-8">
                <DollarSign className="w-7 h-7 text-emerald-600" />
              </div>
              <h3 className="font-serif text-3xl mb-4">B2B Outbound Engine</h3>
              <p className="text-muted-foreground text-lg leading-relaxed mb-8">
                Copy-paste our highest converting cold email scripts, LinkedIn sequences, and objection handling matrices.
              </p>
              <div className="space-y-4">
                {['Enterprise cold email scripts', 'LinkedIn voice-note strategy', 'Pricing objection handles'].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-emerald-500" />
                    <span className="font-medium text-sm text-foreground">{item}</span>
                  </div>
                ))}
              </div>
              <Button variant="outline" className="w-full mt-10 h-12 rounded-xl border-border bg-card hover:bg-muted font-bold text-emerald-600">
                Download Scripts
              </Button>
            </div>

          </div>
        </div>

      </main>

      <footer className="border-t border-border py-12 px-6 mt-20 bg-card">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <Link href="/" className="flex items-center gap-3">
             <img src={logoPath} alt="The Build Brief" className="w-6 h-6 rounded-sm opacity-60 grayscale" />
            <span className="font-serif text-xl text-foreground">The Build Brief</span>
          </Link>
          <div className="flex items-center gap-8 text-sm text-muted-foreground">
            <Link href="/archive" className="hidden md:block text-sm text-muted-foreground hover:text-foreground transition-colors">Archive</Link>
            <Link href="/about" className="hidden md:block text-sm text-muted-foreground hover:text-foreground transition-colors">About</Link>
          </div>
          <Button variant="outline" className="rounded-full border-border bg-background hover:bg-muted text-sm px-6">
            Sign In
          </Button>
        </div>
      </footer>
    </div>
  );
}
