import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'wouter';
import { ArrowRight, Search, Database, Lock, Check } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { issues } from '@/lib/data';
import { usePageTracking } from '@/hooks/useAnalytics';
import PortalNav from '@/components/PortalNav';
import Footer from '@/components/Footer';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.5, delay: i * 0.06 } }),
};

const categories = ["All", "B2B SaaS", "Fintech", "Health", "Climate Tech", "Energy Tech", "Consumer", "AI-Native"];

const DEPTH_CHIPS: { label: string; field: keyof typeof issues[0]; tier: 'pro' | 'max' }[] = [
  { label: 'Unit Economics', field: 'unitEconomicsExpanded', tier: 'pro' },
  { label: 'Kill Switches', field: 'competitorKillSwitch', tier: 'pro' },
  { label: 'PLG Loops', field: 'plgLoops', tier: 'pro' },
  { label: 'Architecture', field: 'architecture', tier: 'max' },
  { label: 'Hiring Plan', field: 'hiringRoadmap', tier: 'max' },
  { label: 'Exit Strategy', field: 'exitStrategy', tier: 'max' },
];

export default function ArchivePage() {
  usePageTracking('/archive');

  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [showOnlyTraction, setShowOnlyTraction] = useState(false);

  const filteredIssues = useMemo(() => {
    return issues.filter(issue => {
      const matchCat = activeCategory === "All" || issue.category === activeCategory;
      const matchQ = query === "" ||
        issue.title.toLowerCase().includes(query.toLowerCase()) ||
        issue.tagline.toLowerCase().includes(query.toLowerCase()) ||
        issue.category.toLowerCase().includes(query.toLowerCase());
      const matchTraction = !showOnlyTraction || issue.traction?.status === "added";
      return matchCat && matchQ && matchTraction;
    });
  }, [query, activeCategory, showOnlyTraction]);

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <PortalNav activePage="archive" />

      {/* Page header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-24 pb-10">
        <motion.div initial="hidden" animate="visible" variants={fadeUp}>
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Database className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="font-serif text-4xl md:text-5xl tracking-tight">The Billion-Dollar Vault</h1>
            </div>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl leading-relaxed">
            {issues.length} deep-tech startup blueprints, searchable and filterable.
            Stop browsing for ideas. Start executing.
          </p>
        </motion.div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 pb-32">

        {/* Search + filters */}
        <motion.div initial="hidden" animate="visible" custom={1} variants={fadeUp} className="mb-12">
          <div className="relative w-full max-w-2xl mb-6">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search by keyword, industry, or tech stack..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-14 rounded-xl border-border bg-card h-13 text-base shadow-sm focus-visible:ring-primary"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-lg text-sm font-bold tracking-wide border transition-all duration-150
                  ${activeCategory === cat
                    ? "bg-foreground text-background border-foreground"
                    : "bg-card border-border text-muted-foreground hover:text-foreground hover:border-foreground/30"
                  }`}
              >
                {cat}
              </button>
            ))}
            <button
              onClick={() => setShowOnlyTraction(!showOnlyTraction)}
              className={`px-4 py-2 rounded-lg text-sm font-bold tracking-wide border transition-all duration-150
                ${showOnlyTraction
                  ? "bg-foreground text-background border-foreground"
                  : "bg-card border-border text-muted-foreground hover:text-foreground hover:border-foreground/30"
                }`}
            >
              Proven Traction
            </button>
          </div>

          <p className="text-sm text-muted-foreground mt-4">
            {filteredIssues.length} blueprint{filteredIssues.length !== 1 ? 's' : ''}
            {activeCategory !== 'All' ? ` in ${activeCategory}` : ''}
            {showOnlyTraction ? ' with proven traction' : ''}
          </p>
        </motion.div>

        {/* Grid */}
        {filteredIssues.length === 0 ? (
          <div className="text-center py-24 text-muted-foreground bg-card rounded-2xl border border-dashed border-border">
            <p className="font-serif text-3xl mb-2 text-foreground">No blueprints found.</p>
            <p className="text-base">Try a different filter or search term.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredIssues.map((issue, idx) => (
              <motion.div
                key={issue.slug}
                custom={idx}
                initial="hidden"
                animate="visible"
                variants={fadeUp}
                className="group"
              >
                <Link
                  href={`/issue/${issue.slug}`}
                  className="block bg-card border border-border rounded-2xl overflow-hidden h-full hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300"
                >
                  {/* Header */}
                  <div className="p-6 border-b border-border">
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-sans text-[10px] font-bold tracking-widest text-muted-foreground uppercase">
                        Vault #{String(issue.number).padStart(3, '0')}
                      </span>
                      <Badge
                        variant="secondary"
                        className="text-[9px] px-2.5 py-0.5 rounded-full uppercase tracking-wider bg-primary/10 text-primary border-0"
                      >
                        {issue.category}
                      </Badge>
                    </div>
                    <h3 className="font-serif text-2xl mb-2 group-hover:text-primary transition-colors leading-snug">
                      {issue.title}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
                      {issue.tagline}
                    </p>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 divide-x divide-border border-b border-border">
                    <div className="p-4">
                      <p className="text-[9px] uppercase font-bold text-muted-foreground tracking-widest mb-1">Target TAM</p>
                      <p className="font-sans font-bold text-sm text-foreground">{issue.tam}</p>
                    </div>
                    <div className="p-4">
                      <p className="text-[9px] uppercase font-bold text-muted-foreground tracking-widest mb-1">First Revenue</p>
                      <p className="font-sans font-bold text-sm text-primary">{issue.revenueIn}</p>
                    </div>
                  </div>

                  {/* Depth indicators */}
                  <div className="p-6">
                    <p className="text-[9px] uppercase font-bold text-muted-foreground tracking-widest mb-3">Premium Depth</p>
                    <div className="flex flex-wrap gap-1.5">
                      {DEPTH_CHIPS.map(({ label, field }) => {
                        const hasData = !!(issue as any)[field];
                        return (
                          <span
                            key={label}
                            className={`inline-flex items-center gap-1 text-[10px] px-2 py-1 rounded-lg font-bold ${
                              hasData
                                ? 'bg-primary/10 text-primary'
                                : 'bg-muted text-muted-foreground'
                            }`}
                          >
                            {hasData
                              ? <Check className="w-2.5 h-2.5" />
                              : <Lock className="w-2.5 h-2.5" />
                            }
                            {label}
                          </span>
                        );
                      })}
                    </div>
                  </div>

                  {/* CTA */}
                  <div className="px-6 pb-6">
                    <div className="flex items-center gap-1.5 font-bold text-primary text-sm group-hover:gap-2.5 transition-all bg-primary/5 px-4 py-2.5 rounded-xl w-fit">
                      Read Blueprint <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </main>

      <Footer variant="public" />
    </div>
  );
}
