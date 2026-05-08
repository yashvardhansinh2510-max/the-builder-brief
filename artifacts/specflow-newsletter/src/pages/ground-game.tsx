import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { useAuth } from "@/lib/AuthContext";
import { useMode } from "@/lib/ModeContext";
import {
  groundGameIdeas,
  Country,
  Category,
  GroundGameIdea,
} from "@/lib/ground-game-data";
import {
  Globe,
  Building2,
  Lock,
  X,
  Bookmark,
  Download,
  Zap,
  TrendingUp,
  ChevronRight,
  MapPin,
  ArrowRight,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { LineChart, Line, ResponsiveContainer } from "recharts";
import PublicNav from "@/components/PublicNav";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.06 },
  }),
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07 } },
};

const COUNTRY_FLAGS: Record<Country, string> = {
  India: "🇮🇳",
  "United States": "🇺🇸",
  "United Kingdom": "🇬🇧",
  Australia: "🇦🇺",
  UAE: "🇦🇪",
  "Southeast Asia": "🌏",
  "Rest of World": "🌍",
};

const INVESTMENT_DOTS: Record<string, number> = {
  Bootstrap: 1,
  Low: 2,
  Mid: 3,
  "Capital-Heavy": 4,
};

const COUNTRIES: Country[] = [
  "India",
  "United States",
  "United Kingdom",
  "Australia",
  "UAE",
  "Southeast Asia",
  "Rest of World",
];

const CATEGORIES: Category[] = [
  "Food & Hospitality",
  "Health & Wellness",
  "Trade & Home Services",
  "Education & Coaching",
  "Micro-Manufacturing",
  "Family Business Transformation",
  "AI-Augmented Offline",
];

export default function GroundGame() {
  const { tier, isPremium } = useAuth();
  const { mode, setMode } = useMode();

  const [activeCountry, setActiveCountry] = useState<Country>("India");
  const [activeCategory, setActiveCategory] = useState<Category | "All">("All");
  const [selectedIdea, setSelectedIdea] = useState<GroundGameIdea | null>(null);

  const filteredIdeas = useMemo(() => {
    return groundGameIdeas.filter((idea) => {
      const matchCountry = idea.country === activeCountry;
      const matchCategory = activeCategory === "All" || idea.category === activeCategory;
      return matchCountry && matchCategory;
    });
  }, [activeCountry, activeCategory]);

  const handleCountryClick = (country: Country) => {
    if (tier === "free" && country !== "India") return;
    setActiveCountry(country);
  };

  const isIdeaGatedForUser = (ideaTier: "free" | "pro" | "max") => {
    if (tier === "max" || tier === "incubator") return false;
    if (tier === "pro" && ideaTier !== "max") return false;
    if (tier === "free" && ideaTier === "free") return false;
    return true;
  };

  return (
    <div className="min-h-screen bg-background text-foreground pb-32 overflow-x-hidden">
      <PublicNav />

      {/* HERO SECTION */}
      <section className="relative w-full pt-24 pb-16 px-6 md:px-12 overflow-hidden border-b border-border/40">
        {/* Subtle grid texture */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,theme(colors.border)_1px,transparent_0)] [background-size:32px_32px] opacity-40" />

        <div className="relative max-w-7xl mx-auto flex flex-col items-center text-center">
          <motion.div initial="hidden" animate="visible" variants={fadeUp}>
            <Badge className="mb-5 bg-primary/10 text-primary border-primary/20 hover:bg-primary/10 uppercase tracking-widest text-[10px] font-bold px-3 py-1">
              The Physical Frontier
            </Badge>
          </motion.div>

          <motion.h1
            initial="hidden"
            animate="visible"
            custom={1}
            variants={fadeUp}
            className="font-serif text-6xl md:text-8xl font-bold tracking-tight text-foreground mb-5"
          >
            Ground Game
          </motion.h1>

          <motion.p
            initial="hidden"
            animate="visible"
            custom={2}
            variants={fadeUp}
            className="text-muted-foreground max-w-xl text-lg md:text-xl mb-8 leading-relaxed"
          >
            Hard assets. High cash flow. AI-augmented operations. The only startup intel built for the physical world.
          </motion.p>

          {/* Stat Bar */}
          <motion.div
            initial="hidden"
            animate="visible"
            custom={3}
            variants={fadeUp}
            className="flex items-center gap-6 mb-10 font-mono text-sm text-muted-foreground"
          >
            <span>
              <span className="text-foreground font-bold">{groundGameIdeas.length}</span> Ideas
            </span>
            <span className="w-px h-4 bg-border" />
            <span>
              <span className="text-foreground font-bold">7</span> Countries
            </span>
            <span className="w-px h-4 bg-border" />
            <span>
              <span className="text-foreground font-bold">7</span> Categories
            </span>
          </motion.div>

          {/* Online / Offline Toggle */}
          <motion.div
            initial="hidden"
            animate="visible"
            custom={4}
            variants={fadeUp}
            className="inline-flex items-center p-1.5 bg-card border border-border rounded-full shadow-sm"
          >
            <button
              onClick={() => setMode("online")}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-semibold transition-all ${
                mode === "online"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Globe className="w-4 h-4" />
              Online
            </button>
            <button
              onClick={() => setMode("offline")}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-semibold transition-all ${
                mode === "offline"
                  ? "bg-primary text-white shadow-md shadow-primary/30"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Building2 className="w-4 h-4" />
              Offline
            </button>
          </motion.div>
        </div>
      </section>

      {/* FILTER SECTION */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 mt-10">
        {/* Country Selector */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          custom={5}
          className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar"
        >
          {COUNTRIES.map((country) => {
            const isLocked = tier === "free" && country !== "India";
            const isActive = activeCountry === country;
            return (
              <button
                key={country}
                onClick={() => handleCountryClick(country)}
                className={`flex items-center gap-2 whitespace-nowrap px-4 py-2.5 rounded-full text-sm font-semibold transition-all border ${
                  isActive
                    ? "bg-primary text-white border-primary shadow-sm shadow-primary/20"
                    : isLocked
                    ? "bg-card text-muted-foreground/40 border-border cursor-not-allowed"
                    : "bg-card text-muted-foreground border-border hover:text-foreground hover:border-foreground/20"
                }`}
              >
                <span className="text-base leading-none">{COUNTRY_FLAGS[country]}</span>
                {country}
                {isLocked && <Lock className="w-3 h-3 opacity-50" />}
              </button>
            );
          })}
        </motion.div>

        {/* Category Filter */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          custom={6}
          className="flex flex-wrap items-center gap-2 mt-5"
        >
          <button
            onClick={() => setActiveCategory("All")}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-colors border ${
              activeCategory === "All"
                ? "bg-foreground text-background border-foreground"
                : "bg-transparent text-muted-foreground border-border hover:border-foreground/20 hover:text-foreground"
            }`}
          >
            All
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-colors border ${
                activeCategory === cat
                  ? "bg-foreground text-background border-foreground"
                  : "bg-transparent text-muted-foreground border-border hover:border-foreground/20 hover:text-foreground"
              }`}
            >
              {cat}
            </button>
          ))}
        </motion.div>
      </section>

      {/* IDEA GRID */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 mt-10">
        {filteredIdeas.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20 bg-card rounded-2xl border border-dashed border-border"
          >
            <p className="text-muted-foreground">No ideas found for these filters.</p>
          </motion.div>
        ) : (
          <motion.div
            key={`${activeCountry}-${activeCategory}`}
            initial="hidden"
            animate="visible"
            variants={stagger}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
          >
            {filteredIdeas.map((idea, idx) => {
              const isGated = isIdeaGatedForUser(idea.tier);
              const dots = INVESTMENT_DOTS[idea.investmentRange] ?? 2;

              return (
                <motion.div
                  key={idea.id}
                  variants={fadeUp}
                  custom={idx}
                  onClick={() => setSelectedIdea(idea)}
                  className="group relative bg-card border border-border rounded-2xl p-6 hover:shadow-[0_8px_40px_rgba(0,0,0,0.08)] hover:-translate-y-1 transition-all cursor-pointer overflow-hidden flex flex-col h-[270px]"
                >
                  {/* Top Row */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex flex-col gap-1.5">
                      <Badge
                        className={`px-2 py-0.5 text-[9px] uppercase tracking-wider font-bold w-fit ${
                          idea.mode === "OFFLINE"
                            ? "bg-primary/10 text-primary border-transparent hover:bg-primary/10"
                            : "bg-amber-500/10 text-amber-700 border-transparent hover:bg-amber-500/10"
                        }`}
                      >
                        {idea.mode}
                      </Badge>
                      <span className="text-[10px] text-muted-foreground font-medium">{idea.category}</span>
                    </div>

                    {isGated ? (
                      <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center">
                        <Lock className="w-3.5 h-3.5 text-muted-foreground" />
                      </div>
                    ) : (
                      <span className="text-[10px] font-mono text-muted-foreground/60">
                        {idea.country.slice(0, 2).toUpperCase()}
                      </span>
                    )}
                  </div>

                  {/* Content */}
                  <div className={`flex-1 transition-all ${isGated ? "blur-[2px] opacity-50" : ""}`}>
                    <h3 className="font-serif font-bold text-lg leading-tight mb-2 text-foreground group-hover:text-primary transition-colors line-clamp-2">
                      {idea.title}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">{idea.hook}</p>
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-4 border-t border-border/60 mt-auto">
                    {/* Investment dots */}
                    <div className="flex items-center gap-1.5">
                      {[1, 2, 3, 4].map((level) => (
                        <div
                          key={level}
                          className={`w-2 h-2 rounded-full transition-colors ${
                            level <= dots ? "bg-primary" : "bg-border"
                          }`}
                        />
                      ))}
                      <span className="text-[10px] text-muted-foreground ml-1.5 font-medium">
                        {idea.investmentRange}
                      </span>
                    </div>

                    {/* Sparkline */}
                    <div className="w-[56px] h-[22px]">
                      <svg viewBox="0 0 56 22" className="w-full h-full overflow-visible">
                        <polyline
                          fill="none"
                          stroke={idea.mode === "OFFLINE" ? "#E9591C" : "#d97706"}
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          points={idea.trendSparkline
                            .map(
                              (val, i) =>
                                `${i * (56 / 7)},${22 - (val / Math.max(...idea.trendSparkline)) * 18}`
                            )
                            .join(" ")}
                        />
                      </svg>
                    </div>
                  </div>

                  {/* Gated Overlay */}
                  {isGated && (
                    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-background/50 backdrop-blur-[2px] rounded-2xl">
                      <div className="bg-card shadow-lg border border-border rounded-xl p-4 max-w-[80%] text-center group-hover:scale-105 transition-transform">
                        <Lock className="w-4 h-4 mx-auto mb-2 text-primary" />
                        <p className="text-sm font-bold text-foreground mb-0.5">
                          {idea.tier === "max" ? "Inner Circle" : "Pro"} only
                        </p>
                        <p className="text-xs text-muted-foreground">Full business blueprint</p>
                      </div>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </section>

      {/* DRAWER */}
      {selectedIdea && (
        <div className="fixed inset-0 z-[100] flex justify-end">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-foreground/10 backdrop-blur-sm"
            onClick={() => setSelectedIdea(null)}
          />

          {/* Drawer Panel */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            transition={{ type: "spring", damping: 28, stiffness: 260 }}
            className="relative w-full max-w-[520px] h-full bg-background shadow-2xl border-l border-border flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-7 py-5 border-b border-border">
              <div className="flex items-center gap-2">
                <Badge
                  className={`px-2.5 py-0.5 text-[9px] uppercase tracking-wider font-bold ${
                    selectedIdea.mode === "OFFLINE"
                      ? "bg-primary/10 text-primary border-transparent hover:bg-primary/10"
                      : "bg-amber-500/10 text-amber-700 border-transparent"
                  }`}
                >
                  {selectedIdea.mode}
                </Badge>
                <span className="text-xs text-muted-foreground font-medium">{selectedIdea.country}</span>
              </div>
              <button
                onClick={() => setSelectedIdea(null)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="flex-1 overflow-y-auto px-7 py-7 space-y-8 no-scrollbar">
              {/* Title + Gap */}
              <div>
                <h2 className="font-serif text-3xl font-bold text-foreground leading-tight mb-3">
                  {selectedIdea.title}
                </h2>
                <p className="text-muted-foreground text-[15px] leading-relaxed">{selectedIdea.theGap}</p>
              </div>

              {isIdeaGatedForUser(selectedIdea.tier) ? (
                <div className="bg-primary/5 border border-primary/20 rounded-xl p-6 text-center">
                  <Lock className="w-6 h-6 text-primary mx-auto mb-3" />
                  <p className="text-primary font-bold mb-1">
                    Unlock with {selectedIdea.tier === "max" ? "Inner Circle" : "Pro"}
                  </p>
                  <p className="text-sm text-primary/70 mb-5">
                    Full AI angle, market sizing, revenue model, and GTM strategy.
                  </p>
                  <Link href="/pricing">
                    <button className="bg-primary text-white px-6 py-2.5 rounded-full text-sm font-bold w-full hover:bg-primary/90 transition-colors">
                      Upgrade Now
                    </button>
                  </Link>
                </div>
              ) : (
                <>
                  {/* Stats Row */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-card border border-border rounded-xl p-4">
                      <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-1.5">
                        Market Size
                      </p>
                      <p className="text-sm font-bold text-foreground">{selectedIdea.marketSize}</p>
                    </div>
                    <div className="bg-card border border-border rounded-xl p-4">
                      <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-1.5">
                        Difficulty
                      </p>
                      <p className="text-sm font-bold text-foreground">{selectedIdea.difficulty}</p>
                    </div>
                  </div>

                  {/* Why Now */}
                  <div>
                    <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-3 flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-primary" /> Why Now
                    </p>
                    <p className="text-foreground text-[15px] leading-relaxed">{selectedIdea.whyNow}</p>
                  </div>

                  {/* AI Angle */}
                  <div className="bg-primary/5 border border-primary/15 rounded-xl p-5 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-primary/10 to-transparent rounded-bl-full pointer-events-none" />
                    <p className="text-[9px] font-bold text-primary uppercase tracking-widest mb-3 flex items-center gap-1.5 relative z-10">
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
                      </svg>
                      AI Integration Angle
                    </p>
                    <p className="text-foreground text-[15px] leading-relaxed relative z-10">{selectedIdea.aiAngle}</p>
                  </div>

                  {/* Trend Chart */}
                  {(tier === "pro" || tier === "max" || tier === "incubator") && (
                    <div>
                      <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-3 flex items-center gap-1.5">
                        <TrendingUp className="w-3.5 h-3.5 text-primary" /> 12-Month Trajectory
                      </p>
                      <div className="h-[140px] bg-card border border-border rounded-xl p-4">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={selectedIdea.trendChartData}>
                            <Line
                              type="monotone"
                              dataKey="value"
                              stroke="#E9591C"
                              strokeWidth={2.5}
                              dot={false}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  )}

                  {/* Revenue Model */}
                  <div>
                    <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-3">
                      Revenue Model
                    </p>
                    <div className="bg-card border border-border rounded-xl p-4">
                      <p className="text-foreground text-[15px] leading-relaxed">{selectedIdea.revenueModel}</p>
                    </div>
                  </div>

                  {/* GTM Steps */}
                  <div>
                    <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-4">
                      Year 1 Go-To-Market
                    </p>
                    <ul className="space-y-3">
                      {selectedIdea.gtmSteps.map((step, idx) => (
                        <li key={idx} className="flex gap-3 text-[15px] text-foreground">
                          <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">
                            {idx + 1}
                          </span>
                          <span className="pt-0.5 leading-relaxed">{step}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Defensibility */}
                  <div className="pb-4 border-b border-border">
                    <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-3 flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-primary" /> Moat / Defensibility
                    </p>
                    <p className="text-muted-foreground text-[14px] leading-relaxed">{selectedIdea.defensibility}</p>
                  </div>

                  {/* Global Viability */}
                  <div>
                    <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-3">
                      Global Viability
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {selectedIdea.worksIn.map((country) => (
                        <Badge
                          key={country}
                          variant="secondary"
                          className="bg-muted text-muted-foreground font-medium rounded-lg px-2.5 py-1 text-xs border-transparent hover:bg-muted"
                        >
                          {COUNTRY_FLAGS[country]} {country}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Footer CTAs */}
            {!isIdeaGatedForUser(selectedIdea.tier) && isPremium && (
              <div className="px-7 py-5 border-t border-border space-y-3">
                <div className="flex gap-3">
                  <button className="flex-1 bg-muted hover:bg-muted/80 text-foreground rounded-xl py-3 font-semibold text-sm flex items-center justify-center gap-2 transition-colors">
                    <Bookmark className="w-4 h-4" /> Save
                  </button>
                  {tier === "max" || tier === "incubator" ? (
                    <button className="flex-1 bg-muted hover:bg-muted/80 text-foreground rounded-xl py-3 font-semibold text-sm flex items-center justify-center gap-2 transition-colors">
                      <Download className="w-4 h-4" /> Export
                    </button>
                  ) : (
                    <button
                      title="Inner Circle only"
                      className="flex-1 bg-muted text-muted-foreground/40 rounded-xl py-3 font-semibold text-sm flex items-center justify-center gap-2 cursor-not-allowed"
                    >
                      <Download className="w-4 h-4" /> Export
                    </button>
                  )}
                </div>
                {(tier === "max" || tier === "incubator") && (
                  <Link href={`/build-brief?prefill=${encodeURIComponent(selectedIdea.title)}`}>
                    <button className="w-full bg-primary hover:bg-primary/90 text-white rounded-xl py-3.5 font-bold text-sm flex items-center justify-center gap-2 transition-colors shadow-lg shadow-primary/20">
                      Build This <ChevronRight className="w-4 h-4" />
                    </button>
                  </Link>
                )}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </div>
  );
}
