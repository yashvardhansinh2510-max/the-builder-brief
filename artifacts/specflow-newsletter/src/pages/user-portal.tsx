import { useUser } from "@clerk/react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { BookOpen, ArrowRight, Zap, TrendingUp, LogOut } from "lucide-react";
import logoPath from "@assets/logo.jpg";
import { issues } from "@/lib/data";
import { Badge } from "@/components/ui/badge";
import { useClerk } from "@clerk/react";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.06, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] },
  }),
};

export default function UserPortal() {
  const { user } = useUser();
  const { signOut } = useClerk();
  const firstName = user?.firstName || user?.emailAddresses?.[0]?.emailAddress?.split("@")[0] || "Reader";
  const latestIssues = issues.slice(-3).reverse();

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <nav className="border-b border-border/40 py-4 px-6 md:px-12 flex justify-between items-center sticky top-0 bg-background/90 backdrop-blur-md z-50">
        <Link href="/" className="flex items-center gap-3">
          <img src={logoPath} alt="The Build Brief" className="w-8 h-8 rounded-sm object-cover" />
          <span className="font-serif text-xl font-medium tracking-tight">The Build Brief</span>
        </Link>
        <div className="flex items-center gap-5">
          <Link href="/archive" className="hidden md:block text-sm text-muted-foreground hover:text-foreground transition-colors">Archive</Link>
          <Link href="/about" className="hidden md:block text-sm text-muted-foreground hover:text-foreground transition-colors">About</Link>
          <button
            onClick={() => signOut({ redirectUrl: "/" })}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign out
          </button>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 py-16 pb-28">
        <motion.div initial="hidden" animate="visible" variants={fadeUp} className="mb-14">
          <p className="text-sm text-primary font-medium uppercase tracking-widest mb-3">Your library</p>
          <h1 className="font-serif text-5xl md:text-6xl">Good to see you,<br /><span className="italic">{firstName}.</span></h1>
          <p className="text-muted-foreground mt-4 text-lg max-w-xl">Every issue, every blueprint — ready to build.</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-14">
          <motion.div custom={1} initial="hidden" animate="visible" variants={fadeUp} className="bg-primary text-primary-foreground rounded-2xl p-8 col-span-1">
            <Zap className="w-7 h-7 mb-6 text-white" />
            <p className="text-5xl font-serif mb-2">8</p>
            <p className="text-white/80 text-sm">Complete startup blueprints available</p>
          </motion.div>
          <motion.div custom={2} initial="hidden" animate="visible" variants={fadeUp} className="bg-card border border-card-border rounded-2xl p-8 col-span-1">
            <BookOpen className="w-7 h-7 text-primary mb-6" />
            <p className="text-5xl font-serif mb-2">6</p>
            <p className="text-muted-foreground text-sm">Sections per issue — zero fluff</p>
          </motion.div>
          <motion.div custom={3} initial="hidden" animate="visible" variants={fadeUp} className="bg-card border border-card-border rounded-2xl p-8 col-span-1">
            <TrendingUp className="w-7 h-7 text-primary mb-6" />
            <p className="text-5xl font-serif mb-2">#009</p>
            <p className="text-muted-foreground text-sm">Next issue drops this Friday</p>
          </motion.div>
        </div>

        <motion.div custom={4} initial="hidden" animate="visible" variants={fadeUp} className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-serif text-3xl">Latest Issues</h2>
            <Link href="/archive" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
              All issues <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {latestIssues.map((issue, idx) => (
              <motion.div key={issue.slug} custom={5 + idx} initial="hidden" animate="visible" variants={fadeUp}>
                <Link href={`/issue/${issue.slug}`} className="group block bg-card border border-card-border rounded-2xl p-6 hover:border-primary/40 hover:shadow-lg transition-all duration-300">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-medium text-muted-foreground">#{issue.number}</span>
                    <Badge variant="secondary" className="text-[10px] px-2 py-0.5 rounded-full">{issue.category}</Badge>
                  </div>
                  <h3 className="font-serif text-xl mb-2 group-hover:text-primary transition-colors">{issue.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-4 line-clamp-2">{issue.tagline}</p>
                  <div className="flex items-center justify-between text-xs text-muted-foreground border-t border-border/50 pt-3">
                    <span>{issue.tam}</span>
                    <span className="text-primary font-medium">Rev in {issue.revenueIn}</span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div custom={8} initial="hidden" animate="visible" variants={fadeUp}>
          <Link href="/archive" className="group flex items-center justify-between bg-card border border-card-border hover:border-primary/40 rounded-2xl p-8 transition-all duration-300">
            <div>
              <h3 className="font-serif text-2xl mb-1">Browse the full archive</h3>
              <p className="text-muted-foreground text-sm">All 8 issues — searchable, filterable, ready to build</p>
            </div>
            <ArrowRight className="w-6 h-6 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
          </Link>
        </motion.div>
      </main>

      <footer className="border-t border-border/40 py-12 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <Link href="/" className="flex items-center gap-3">
            <img src={logoPath} alt="The Build Brief" className="w-6 h-6 rounded-sm opacity-40 grayscale" />
            <span className="font-serif text-lg text-muted-foreground">The Build Brief</span>
          </Link>
          <p className="text-sm text-muted-foreground">© {new Date().getFullYear()} The Build Brief</p>
        </div>
      </footer>
    </div>
  );
}
