import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Globe, Building2, MapPin, X } from "lucide-react";
import { Link } from "wouter";
import { useAuth } from "@/lib/AuthContext";
import { useMode } from "@/lib/ModeContext";
import {
  groundGameIdeas,
  Country,
  Category,
  GroundGameIdea,
} from "@/lib/ground-game-data";
import PortalNav from "@/components/PortalNav";
import Footer from "@/components/Footer";
import { CountrySelector } from "@/components/ground-game/CountrySelector";
import { CategoryFilterBar } from "@/components/ground-game/CategoryFilterBar";
import { GroundGameCard } from "@/components/ground-game/GroundGameCard";
import { GroundGameDrawer } from "@/components/ground-game/GroundGameDrawer";

export default function GroundGame() {
  const { tier, isPremium } = useAuth();
  const { mode, setMode } = useMode();

  const [activeCountry, setActiveCountry] = useState<Country>("India");
  const [activeCategories, setActiveCategories] = useState<Set<Category>>(new Set());
  const [selectedIdea, setSelectedIdea] = useState<GroundGameIdea | null>(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const filteredIdeas = useMemo(() => {
    return groundGameIdeas.filter((idea) => {
      const matchCountry = idea.country === activeCountry;
      const matchCategory = activeCategories.size === 0 || activeCategories.has(idea.category);
      return matchCountry && matchCategory;
    });
  }, [activeCountry, activeCategories]);

  const isIdeaGated = (ideaTier: GroundGameIdea["tier"]) => {
    if (tier === "max" || tier === "incubator") return false;
    if (tier === "pro" && ideaTier !== "max") return false;
    if (tier === "free" && ideaTier === "free") return false;
    return true;
  };

  const toggleCategory = (cat: Category) => {
    setActiveCategories((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-background text-foreground pb-32 overflow-x-hidden">
      <PortalNav activePage="ground-game" />

      {/* HERO STRIP — max 120px, compact */}
      <section className="border-b border-border/40 border-l-4 border-l-primary bg-card/40">
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-5 flex items-center justify-between gap-6 min-h-0">
          <div className="flex items-center gap-3 min-w-0">
            <MapPin className="w-4 h-4 text-primary flex-shrink-0" />
            <div className="min-w-0">
              <h1 className="font-serif text-xl md:text-2xl font-bold text-foreground leading-tight">
                Physical World Intelligence
              </h1>
              <p className="text-xs text-muted-foreground mt-0.5 truncate">
                {groundGameIdeas.length} offline business ideas validated for 2026. India-first, globally aware.
              </p>
            </div>
          </div>

          {/* Mode toggle pill */}
          <div className="inline-flex items-center p-1 bg-background border border-border rounded-full shadow-sm flex-shrink-0">
            <button
              onClick={() => setMode("online")}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                mode === "online"
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Globe className="w-3.5 h-3.5" /> Online
            </button>
            <button
              onClick={() => setMode("offline")}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                mode === "offline"
                  ? "bg-primary text-white shadow-sm shadow-primary/30"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Building2 className="w-3.5 h-3.5" /> Offline
            </button>
          </div>
        </div>
      </section>

      {/* FILTER BAR — sticky below nav */}
      <div className="sticky top-[98px] z-30 bg-background/95 backdrop-blur-md border-b border-border/30">
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-4 space-y-3">
          <CountrySelector
            activeCountry={activeCountry}
            userTier={tier}
            onCountryChange={setActiveCountry}
            onLockedClick={() => setShowUpgradeModal(true)}
          />
          <CategoryFilterBar
            activeCategories={activeCategories}
            onToggle={toggleCategory}
            onClearAll={() => setActiveCategories(new Set())}
            filteredCount={filteredIdeas.length}
            activeCountry={activeCountry}
          />
        </div>
      </div>

      {/* IDEA GRID */}
      <main className="max-w-7xl mx-auto px-6 md:px-12 py-8">
        {filteredIdeas.length === 0 ? (
          <div className="text-center py-24">
            <svg
              className="w-12 h-12 mx-auto mb-4 text-muted-foreground/30"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <circle cx="12" cy="16" r="0.5" fill="currentColor" />
              <path d="M12 2v2M12 20v2M2 12h2M20 12h2" />
            </svg>
            <p className="text-muted-foreground text-sm">No ideas match this filter.</p>
            <p className="text-muted-foreground/60 text-xs mt-1">Try a different category or country.</p>
          </div>
        ) : (
          <motion.div
            key={`${activeCountry}-${Array.from(activeCategories).join(",")}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {filteredIdeas.map((idea, idx) => (
              <motion.div
                key={idea.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: idx * 0.04 }}
              >
                <GroundGameCard
                  idea={idea}
                  isGated={isIdeaGated(idea.tier)}
                  onClick={() => setSelectedIdea(idea)}
                />
              </motion.div>
            ))}
          </motion.div>
        )}
      </main>

      {/* DETAIL DRAWER */}
      <AnimatePresence>
        {selectedIdea && (
          <GroundGameDrawer
            idea={selectedIdea}
            onClose={() => setSelectedIdea(null)}
            userTier={tier}
            isPremium={isPremium}
            isGated={isIdeaGated(selectedIdea.tier)}
          />
        )}
      </AnimatePresence>

      {/* LOCKED COUNTRY UPGRADE MODAL */}
      <AnimatePresence>
        {showUpgradeModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center bg-foreground/20 backdrop-blur-sm px-4"
            onClick={() => setShowUpgradeModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: "spring", damping: 30, stiffness: 400 }}
              className="bg-card border border-border rounded-xl p-6 max-w-sm w-full shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-primary" />
                </div>
                <button
                  onClick={() => setShowUpgradeModal(false)}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <h3 className="font-serif text-lg font-bold text-foreground mb-1">
                Global Intelligence is Pro
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed mb-5">
                Access US, UK, Australia, UAE, and Southeast Asia idea databases.
                India stays free — everything else is Pro.
              </p>
              <Link href="/pricing">
                <button className="w-full bg-primary text-white py-2.5 rounded-full text-sm font-bold hover:bg-primary/90 transition-colors">
                  Upgrade to Pro
                </button>
              </Link>
              <button
                onClick={() => setShowUpgradeModal(false)}
                className="w-full mt-2 py-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                Maybe later
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
}
