import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'wouter';
import { ArrowLeft, ArrowRight, Search, Database } from 'lucide-react';
import { Input } from '@/components/ui/input';
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

const categories = ["All", "B2B SaaS", "Fintech", "Health", "Climate Tech", "Energy Tech", "Consumer", "AI-Native"];

export default function ArchivePage() {
  usePageTracking('/archive');

  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  const filteredIssues = useMemo(() => {
    return issues.filter(issue => {
      const matchCat = activeCategory === "All" || issue.category === activeCategory;
      const matchQ = query === "" ||
        issue.title.toLowerCase().includes(query.toLowerCase()) ||
        issue.tagline.toLowerCase().includes(query.toLowerCase()) ||
        issue.category.toLowerCase().includes(query.toLowerCase());
      return matchCat && matchQ;
    });
  }, [query, activeCategory]);

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/20">
      <PublicNav activePage="archive" />

      {/* Header */}
      <div className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-16 pb-20">
          <Link href="/blueprints" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-10 font-medium">
            <ArrowLeft className="w-4 h-4" /> Back to Execution Hub
          </Link>
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Database className="w-6 h-6 text-primary" />
            </div>
            <h1 className="font-serif text-5xl md:text-[4rem] tracking-tight">The Billion-Dollar Vault</h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl leading-relaxed mb-8">
            Access the complete, searchable database of our most lucrative, deep-tech startup blueprints. Stop searching for ideas. Start executing.
          </p>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        
        {/* Search + Filters */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp} className="mb-16 flex flex-col items-center gap-8">
          <div className="relative w-full max-w-3xl mx-auto">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search by keyword, industry, or tech stack..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-16 rounded-2xl border-border bg-card h-16 text-xl shadow-sm focus-visible:ring-primary"
            />
          </div>
          <div className="flex flex-wrap justify-center gap-3 max-w-4xl">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-6 py-2.5 rounded-xl text-sm font-bold tracking-wide border transition-all duration-200
                  ${activeCategory === cat
                    ? "bg-foreground text-background border-foreground shadow-md"
                    : "bg-card border-border text-muted-foreground hover:border-foreground/30 hover:text-foreground hover:shadow-sm"
                  }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Issues grid */}
        {filteredIssues.length === 0 ? (
          <div className="text-center py-32 text-muted-foreground bg-card rounded-3xl border border-dashed border-border">
            <p className="font-serif text-3xl mb-3 text-foreground">No blueprints found.</p>
            <p className="text-lg">Try a different filter or search term.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredIssues.map((issue, idx) => (
              <motion.div
                key={issue.slug}
                custom={idx}
                initial="hidden"
                animate="visible"
                variants={fadeUp}
              >
                <Link
                  href={`/issue/${issue.slug}`}
                  className="group block bg-card border border-border rounded-[2rem] p-8 h-full hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full -mr-10 -mt-10 transition-transform group-hover:scale-110" />
                  
                  <div className="flex items-center justify-between mb-4 relative z-10">
                    <span className="font-mono text-xs font-bold tracking-widest text-muted-foreground uppercase">Vault #{issue.number}</span>
                    <Badge variant="secondary" className="text-[10px] px-3 py-1 rounded-full uppercase tracking-wider bg-primary/10 text-primary border-0">{issue.category}</Badge>
                  </div>
                  
                  <h3 className="font-serif text-3xl mb-3 group-hover:text-primary transition-colors leading-snug relative z-10">{issue.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-8 line-clamp-2 relative z-10">{issue.tagline}</p>
                  
                  <div className="grid grid-cols-2 gap-4 mb-8 relative z-10">
                    <div className="bg-muted/50 p-3 rounded-xl border border-border">
                      <span className="text-[10px] uppercase font-bold text-muted-foreground block mb-1">Target TAM</span>
                      <span className="font-mono font-bold text-foreground">{issue.tam}</span>
                    </div>
                    <div className="bg-muted/50 p-3 rounded-xl border border-border">
                      <span className="text-[10px] uppercase font-bold text-muted-foreground block mb-1">First Rev</span>
                      <span className="font-mono font-bold text-primary">{issue.revenueIn}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between mt-auto relative z-10 border-t border-border pt-4">
                    <span className="flex items-center gap-1.5 font-bold text-primary group-hover:gap-2.5 transition-all bg-primary/5 px-4 py-2 rounded-xl">
                      View Playbook <ArrowRight className="w-4 h-4" />
                    </span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </main>

      <footer className="border-t border-border py-12 px-6 mt-20 bg-card">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <Link href="/" className="flex items-center gap-3">
             <img src={logoPath} alt="The Build Brief" className="w-6 h-6 rounded-sm opacity-60 grayscale" />
            <span className="font-serif text-xl">The Build Brief</span>
          </Link>
          <div className="flex items-center gap-8 text-sm text-muted-foreground">
            <Link href="/blueprints" className="hidden md:block text-sm text-muted-foreground hover:text-foreground transition-colors">Execution Hub</Link>
            <Link href="/about" className="hidden md:block text-sm text-muted-foreground hover:text-foreground transition-colors">About</Link>
          </div>
          <Button variant="outline" className="rounded-full border-border bg-card hover:bg-muted text-sm px-6">
            Sign In
          </Button>
        </div>
      </footer>
    </div>
  );
}
