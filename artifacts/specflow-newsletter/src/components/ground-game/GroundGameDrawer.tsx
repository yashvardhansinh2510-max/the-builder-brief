import { useState } from "react";
import { motion } from "framer-motion";
import { X, Check, Copy, Lock } from "lucide-react";
import { Link } from "wouter";
import { GroundGameIdea } from "@/lib/ground-game-data";

const COUNTRY_FLAGS: Record<string, string> = {
  India: "🇮🇳",
  "United States": "🇺🇸",
  "United Kingdom": "🇬🇧",
  Australia: "🇦🇺",
  UAE: "🇦🇪",
  "Southeast Asia": "🌏",
  "Rest of World": "🌍",
};

interface GroundGameDrawerProps {
  idea: GroundGameIdea;
  onClose: () => void;
  userTier: string;
  isPremium: boolean;
  isGated: boolean;
}

export function GroundGameDrawer({ idea, onClose, userTier, isPremium, isGated }: GroundGameDrawerProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const textToCopy = idea.gtmSteps.join("\n");
    navigator.clipboard.writeText(textToCopy).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="fixed inset-0 z-[100] flex justify-end">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-background/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Drawer panel */}
      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 30, stiffness: 300 }}
        className="relative w-full max-w-lg bg-card border-l border-border h-full overflow-y-auto flex flex-col"
      >
        {/* Sticky header */}
        <div className="sticky top-0 bg-card border-b border-border px-6 py-5 flex items-start justify-between gap-4 z-10">
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground bg-muted px-2 py-0.5 rounded">
                {idea.category}
              </span>
              <span className="text-sm">{COUNTRY_FLAGS[idea.country]}</span>
              <span className="text-xs text-muted-foreground">{idea.mode}</span>
            </div>
            <h2 className="font-serif font-bold text-xl leading-snug">{idea.title}</h2>
          </div>
          <button
            onClick={onClose}
            className="flex-shrink-0 w-8 h-8 rounded-full bg-muted hover:bg-muted/80 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 px-6 py-8 space-y-8">
          {/* Hook + Why Now — always visible */}
          <div>
            <p className="font-medium text-foreground leading-relaxed">{idea.hook}</p>
            <p className="text-sm text-muted-foreground mt-2 italic leading-relaxed">{idea.whyNow}</p>
          </div>

          {isGated ? (
            /* Full gated state */
            <div className="bg-primary/5 border border-primary/20 rounded-xl p-6 text-center">
              <Lock className="w-5 h-5 text-primary mx-auto mb-3" />
              <p className="font-bold text-primary mb-1">
                {idea.tier === "max" ? "Inner Circle" : "Pro"} access required
              </p>
              <p className="text-sm text-primary/70 mb-5 leading-relaxed">
                Full market intelligence, AI angle, and go-to-market strategy.
              </p>
              <Link href="/pricing">
                <button className="bg-primary text-white px-6 py-2.5 rounded-full text-sm font-bold w-full hover:bg-primary/90 transition-colors">
                  Unlock full intelligence
                </button>
              </Link>
            </div>
          ) : (
            <>
              {/* Step-by-step execution */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">
                  Execution Steps
                </h3>
                <ol className="space-y-3">
                  {idea.gtmSteps.map((step, i) => (
                    <li key={i} className="flex gap-3">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center mt-0.5">
                        {i + 1}
                      </span>
                      <p className="text-sm text-foreground leading-relaxed">{step}</p>
                    </li>
                  ))}
                </ol>
              </div>

              {/* AI Angle — code block style */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">
                  AI Angle / The 10x Lever
                </h3>
                <pre className="bg-muted rounded-xl p-4 text-xs font-mono leading-relaxed whitespace-pre-wrap overflow-x-auto">
                  {idea.aiAngle}
                </pre>
              </div>

              {/* Revenue model */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">
                  Revenue Model
                </h3>
                <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 text-sm text-foreground leading-relaxed">
                  {idea.revenueModel}
                </div>
              </div>

              {/* Defensibility */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">
                  Defensibility
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{idea.defensibility}</p>
              </div>
            </>
          )}
        </div>

        {/* Sticky footer CTA */}
        <div className="sticky bottom-0 bg-card border-t border-border px-6 py-5">
          {isGated ? (
            <Link href="/pricing">
              <button className="block w-full py-3 text-center rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-colors">
                Upgrade to unlock this tactic
              </button>
            </Link>
          ) : (
            <button
              onClick={handleCopy}
              className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" /> Copied to clipboard!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" /> Copy GTM steps
                </>
              )}
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}
