import React, { useState, useMemo, useCallback } from 'react';
import { Link } from 'wouter';
import { Search, BookOpen, ArrowRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { issues, type Issue } from '@/lib/data';
import { usePageTracking } from '@/hooks/useAnalytics';
import PortalNav from '@/components/PortalNav';
import Footer from '@/components/Footer';
import { motion } from 'framer-motion';

const CATEGORIES = ["All", "B2B SaaS", "Fintech", "Health", "Climate Tech", "Energy Tech", "Consumer", "AI-Native"];
const YEARS = ["All", "2025", "2024", "2023"];
const PAGE_SIZE = 12;

function issueYear(issue: Issue): string {
  const num = parseInt(issue.number, 10);
  if (num >= 100) return '2025';
  if (num >= 50) return '2024';
  return '2023';
}

function IssueCard({ issue }: { issue: Issue }) {
  const numPadded = String(issue.number).padStart(3, '0');
  return (
    <Link href={`/archive/${issue.slug}`} className="block group">
      <motion.div
        whileHover={{ y: -2 }}
        className="h-full p-5 bg-card rounded-2xl border border-border hover:border-primary/50 hover:shadow-md transition-all duration-200 cursor-pointer"
      >
        <div className="flex items-start gap-3 mb-3">
          <span className="text-[10px] font-black tracking-widest text-muted-foreground font-mono shrink-0 mt-0.5">
            #{numPadded}
          </span>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-sm text-foreground line-clamp-2 group-hover:text-primary transition-colors">
              {issue.title}
            </h3>
          </div>
        </div>
        <p className="text-xs text-muted-foreground line-clamp-2 mb-4">{issue.tagline}</p>
        <div className="flex items-center justify-between">
          <Badge variant="outline" className="text-[9px] font-bold tracking-wide uppercase">
            {issue.category}
          </Badge>
          <span className="text-xs text-primary font-semibold flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
            Read Brief <ArrowRight className="w-3 h-3" />
          </span>
        </div>
      </motion.div>
    </Link>
  );
}

export default function ArchivePage() {
  usePageTracking('/archive');

  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [activeYear, setActiveYear] = useState('All');
  const [sort, setSort] = useState<'newest' | 'oldest'>('newest');
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    let result = [...issues];

    if (query.trim()) {
      const q = query.toLowerCase();
      result = result.filter(issue =>
        issue.title.toLowerCase().includes(q) ||
        issue.tagline.toLowerCase().includes(q) ||
        issue.problem?.toLowerCase().includes(q) ||
        issue.category.toLowerCase().includes(q)
      );
    }
    if (activeCategory !== 'All') {
      result = result.filter(issue => issue.category === activeCategory);
    }
    if (activeYear !== 'All') {
      result = result.filter(issue => issueYear(issue) === activeYear);
    }

    result.sort((a, b) =>
      sort === 'newest'
        ? Number(b.number) - Number(a.number)
        : Number(a.number) - Number(b.number)
    );

    return result;
  }, [query, activeCategory, activeYear, sort]);

  const paginated = useMemo(() => filtered.slice(0, page * PAGE_SIZE), [filtered, page]);
  const hasMore = paginated.length < filtered.length;

  const handleSearch = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    setPage(1);
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <PortalNav activePage="archive" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-24 pb-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-primary" />
          </div>
          <h1 className="font-serif text-4xl md:text-5xl tracking-tight">The Builder Brief Library</h1>
        </div>
        <p className="text-base text-muted-foreground max-w-xl leading-relaxed">
          Every issue we've published — searchable, filterable, and ready to read.
        </p>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 pb-32">

        {/* Search + controls */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1 max-w-2xl">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search by title, vertical, or keyword..."
                value={query}
                onChange={handleSearch}
                className="pl-11 rounded-xl border-border bg-card h-11 text-sm shadow-sm focus-visible:ring-primary"
              />
            </div>
            <select
              value={sort}
              onChange={e => { setSort(e.target.value as 'newest' | 'oldest'); setPage(1); }}
              className="h-11 px-3 rounded-xl border border-border bg-card text-sm font-medium focus:ring-primary"
            >
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
            </select>
          </div>

          {/* Category filters */}
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => { setActiveCategory(cat); setPage(1); }}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold tracking-wide border transition-all duration-150
                  ${activeCategory === cat
                    ? 'bg-foreground text-background border-foreground'
                    : 'bg-card border-border text-muted-foreground hover:text-foreground hover:border-foreground/30'
                  }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Year filters */}
          <div className="flex gap-2">
            {YEARS.map(year => (
              <button
                key={year}
                onClick={() => { setActiveYear(year); setPage(1); }}
                className={`px-3 py-1 rounded-md text-xs font-semibold transition-all duration-150
                  ${activeYear === year
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:text-foreground'
                  }`}
              >
                {year}
              </button>
            ))}
          </div>

          <p className="text-xs text-muted-foreground">
            {filtered.length} brief{filtered.length !== 1 ? 's' : ''} found
          </p>
        </div>

        {/* Grid */}
        {paginated.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {paginated.map(issue => (
                <IssueCard key={issue.slug} issue={issue} />
              ))}
            </div>

            {hasMore && (
              <div className="mt-10 text-center">
                <button
                  onClick={() => setPage(p => p + 1)}
                  className="px-8 py-3 border border-border rounded-xl text-sm font-semibold hover:bg-muted transition-colors"
                >
                  Load more ({filtered.length - paginated.length} remaining)
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-20 text-muted-foreground">
            <p className="text-lg font-medium mb-2">No briefs match your search.</p>
            <button
              onClick={() => { setQuery(''); setActiveCategory('All'); setActiveYear('All'); setPage(1); }}
              className="text-primary text-sm hover:underline"
            >
              Clear filters
            </button>
          </div>
        )}

      </main>
      <Footer />
    </div>
  );
}
