import React, { useState, useMemo } from 'react';
import { Link } from 'wouter';
import { Search, BookOpen } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { issues } from '@/lib/data';
import { usePageTracking } from '@/hooks/useAnalytics';
import PortalNav from '@/components/PortalNav';
import Footer from '@/components/Footer';

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
    <div className="min-h-screen bg-white dark:bg-background text-foreground font-sans">
      <PortalNav activePage="archive" />

      {/* Page header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-24 pb-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="font-serif text-4xl md:text-5xl tracking-tight">The Builder Brief Library</h1>
          </div>
        </div>
        <p className="text-base text-muted-foreground max-w-xl leading-relaxed">
          Every issue we've published — searchable, filterable, and ready to read.
        </p>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 pb-32">

        {/* Search + tag filters */}
        <div className="mb-10">
          <div className="relative w-full max-w-2xl mb-5">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search by title, vertical, or keyword..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-12 rounded-xl border-border bg-card h-12 text-sm shadow-sm focus-visible:ring-primary"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold tracking-wide border transition-all duration-150
                  ${activeCategory === cat
                    ? "bg-foreground text-background border-foreground"
                    : "bg-card border-border text-muted-foreground hover:text-foreground hover:border-foreground/30"
                  }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <p className="text-xs text-muted-foreground mt-3">
            {filteredIssues.length} issue{filteredIssues.length !== 1 ? 's' : ''}
            {activeCategory !== 'All' ? ` · ${activeCategory}` : ''}
          </p>
        </div>

        {/* Card grid */}
        {filteredIssues.length === 0 ? (
          <div className="text-center py-24 text-muted-foreground bg-card rounded-2xl border border-dashed border-border">
            <p className="font-serif text-2xl mb-2 text-foreground">Nothing found.</p>
            <p className="text-sm">Try a different filter or search term.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredIssues.map((issue) => (
              <Link
                key={issue.slug}
                href={`/vault/${issue.slug}`}
                className="block bg-card border border-border rounded-xl overflow-hidden h-full hover:border-primary/30 hover:shadow-md transition-all duration-200 group"
              >
                {/* Top row: badge + read time */}
                <div className="px-5 pt-5 flex items-center justify-between mb-3">
                  <Badge
                    variant="secondary"
                    className="text-[9px] px-2 py-0.5 rounded-full uppercase tracking-wider bg-primary/10 text-primary border-0"
                  >
                    {issue.category}
                  </Badge>
                  <span className="text-[10px] text-muted-foreground font-medium">5 min read</span>
                </div>

                {/* Title + tagline */}
                <div className="px-5 pb-5">
                  <h3 className="font-serif text-xl mb-2 group-hover:text-primary transition-colors leading-snug line-clamp-2">
                    {issue.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
                    {issue.tagline}
                  </p>
                </div>

                {/* Bottom: issue number */}
                <div className="px-5 pb-4 border-t border-border/60 pt-3">
                  <span className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest">
                    Issue #{String(issue.number).padStart(3, '0')}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>

      <Footer variant="public" />
    </div>
  );
}
