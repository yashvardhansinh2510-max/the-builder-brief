import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { ArrowLeft, ArrowRight, Search } from "lucide-react";
import logoPath from "@assets/logo.jpg";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { issues } from "@/lib/data";

const categories = ["All", "B2B SaaS", "Fintech", "Health", "AI-Native", "Education", "Real Estate", "Consumer"];

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.5, delay: i * 0.06 } }),
};

export default function Archive() {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  const filtered = issues.filter(issue => {
    const matchCat = activeCategory === "All" || issue.category === activeCategory;
    const matchQ = query === "" ||
      issue.title.toLowerCase().includes(query.toLowerCase()) ||
      issue.tagline.toLowerCase().includes(query.toLowerCase()) ||
      issue.category.toLowerCase().includes(query.toLowerCase());
    return matchCat && matchQ;
  });

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      {/* NAV */}
      <nav className="border-b border-border/40 py-4 px-6 md:px-12 flex justify-between items-center sticky top-0 bg-background/90 backdrop-blur-md z-50">
        <Link href="/" className="flex items-center gap-3">
          <img src={logoPath} alt="The Build Brief" className="w-8 h-8 rounded-sm object-cover" />
          <span className="font-serif text-xl font-medium tracking-tight">The Build Brief</span>
        </Link>
        <div className="flex items-center gap-6">
          <Link href="/archive" className="hidden md:block text-sm font-medium text-foreground">Archive</Link>
          <Link href="/about" className="hidden md:block text-sm text-muted-foreground hover:text-foreground transition-colors">About</Link>
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

      <main className="max-w-6xl mx-auto px-6 pt-16 pb-28">
        {/* Header */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp} className="mb-12">
          <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8">
            <ArrowLeft className="w-4 h-4" /> Back to home
          </Link>
          <p className="text-sm font-medium text-primary uppercase tracking-widest mb-3">The vault</p>
          <h1 className="font-serif text-5xl md:text-6xl mb-4">All issues.</h1>
          <p className="text-lg text-muted-foreground max-w-xl">
            Every idea we've blueprinted. Every one with a working business behind it — if you build it.
          </p>
        </motion.div>

        {/* Search + Filters */}
        <motion.div initial="hidden" animate="visible" custom={1} variants={fadeUp} className="mb-10 space-y-4">
          <div className="relative max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              data-testid="input-search"
              type="search"
              placeholder="Search ideas..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-10 rounded-full border-border/60 bg-card/60 h-11"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {categories.map(cat => (
              <button
                key={cat}
                data-testid={`filter-${cat}`}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all duration-200
                  ${activeCategory === cat
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-card border-border text-muted-foreground hover:border-foreground/40 hover:text-foreground"
                  }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Issues grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-24 text-muted-foreground">
            <p className="font-serif text-2xl mb-2">Nothing here yet.</p>
            <p className="text-sm">Try a different filter or search term.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((issue, idx) => (
              <motion.div
                key={issue.slug}
                custom={idx}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-60px" }}
                variants={fadeUp}
              >
                <Link
                  href={`/issue/${issue.slug}`}
                  className="group flex flex-col bg-card border border-card-border rounded-2xl p-7 h-full hover:border-primary/40 hover:shadow-md transition-all duration-300"
                  data-testid={`card-issue-${issue.slug}`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-mono text-muted-foreground">#{issue.number}</span>
                    <Badge variant="secondary" className="text-[10px] px-2 py-0.5 rounded-full">{issue.category}</Badge>
                  </div>
                  <h3 className="font-serif text-2xl mb-3 group-hover:text-primary transition-colors">{issue.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed flex-1 mb-6">{issue.tagline}</p>
                  <div className="flex items-center justify-between text-xs pt-4 border-t border-border/50">
                    <span className="text-muted-foreground">{issue.tam}</span>
                    <span className="flex items-center gap-1 font-medium text-primary group-hover:gap-2 transition-all">
                      Read blueprint <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}

        {/* CTA strip */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          className="mt-20 bg-card border border-border rounded-2xl p-10 text-center"
        >
          <h2 className="font-serif text-3xl mb-3">Issue #009 lands Friday.</h2>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">Don't miss it. Subscribe and get every future issue before anyone else.</p>
          <Button className="rounded-full bg-primary hover:bg-primary/90 text-primary-foreground px-8 h-12" asChild>
            <Link href="/" data-testid="button-archive-cta">Subscribe free</Link>
          </Button>
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
