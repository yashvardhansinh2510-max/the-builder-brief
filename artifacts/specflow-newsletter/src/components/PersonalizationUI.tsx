import { useState, useEffect } from "react";
import { Sparkles, Save, CheckCircle2 } from "lucide-react";
import { Badge } from "./ui/badge";
import { toast } from "sonner";
import { useAuth } from "@/lib/AuthContext";

interface Personalization {
  interests: string[];
  focusAreas: string[];
  contextStyle: string;
}

const INTEREST_OPTIONS = ["deals", "insights", "market", "tech", "operations"];
const FOCUS_OPTIONS = ["AI", "fintech", "climate", "saas", "ecommerce", "bio"];
const STYLE_OPTIONS = ["detailed", "summary", "quick"];

export default function PersonalizationUI() {
  const { session } = useAuth();
  const [personalization, setPersonalization] = useState<Personalization>({
    interests: [],
    focusAreas: [],
    contextStyle: "detailed",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (session?.user?.email) {
      // Fetch existing personalization
      fetch(`/api/briefs/personalization`)
        .then(res => res.ok ? res.json() : null)
        .then(data => {
          if (data) setPersonalization(data);
        });
    }
  }, [session]);

  const toggleInterest = (interest: string) => {
    setPersonalization(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
  };

  const toggleFocus = (focus: string) => {
    setPersonalization(prev => ({
      ...prev,
      focusAreas: prev.focusAreas.includes(focus)
        ? prev.focusAreas.filter(f => f !== focus)
        : [...prev.focusAreas, focus]
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/briefs/personalization", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(personalization)
      });
      if (res.ok) {
        toast.success("Personalization saved", { description: "Your daily briefs will now reflect these preferences." });
      } else {
        throw new Error("Failed to save");
      }
    } catch (error) {
      toast.error("Error saving preferences");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-8 bg-card border border-border rounded-3xl shadow-sm">
      <div className="flex items-center gap-3 mb-8">
        <Sparkles className="w-5 h-5 text-primary" />
        <h3 className="font-serif text-2xl tracking-tight">Context <span className="italic text-primary">Engine Settings</span></h3>
      </div>

      <div className="space-y-8">
        {/* Interests */}
        <div>
          <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-4 block">Core Interests</label>
          <div className="flex flex-wrap gap-2">
            {INTEREST_OPTIONS.map(opt => (
              <button
                key={opt}
                onClick={() => toggleInterest(opt)}
                className={`px-4 py-2 rounded-xl border text-xs font-bold uppercase tracking-widest transition-all ${
                  personalization.interests.includes(opt)
                    ? "bg-primary/10 text-primary border-primary/30"
                    : "border-border text-muted-foreground hover:border-primary/20"
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>

        {/* Focus Areas */}
        <div>
          <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-4 block">Focus Sectors</label>
          <div className="flex flex-wrap gap-2">
            {FOCUS_OPTIONS.map(opt => (
              <button
                key={opt}
                onClick={() => toggleFocus(opt)}
                className={`px-4 py-2 rounded-xl border text-xs font-bold uppercase tracking-widest transition-all ${
                  personalization.focusAreas.includes(opt)
                    ? "bg-primary/10 text-primary border-primary/30"
                    : "border-border text-muted-foreground hover:border-primary/20"
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>

        {/* Style */}
        <div>
          <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-4 block">Delivery Style</label>
          <div className="flex gap-2">
            {STYLE_OPTIONS.map(opt => (
              <button
                key={opt}
                onClick={() => setPersonalization(prev => ({ ...prev, contextStyle: opt }))}
                className={`flex-1 py-3 rounded-xl border text-xs font-bold uppercase tracking-widest transition-all ${
                  personalization.contextStyle === opt
                    ? "bg-primary/10 text-primary border-primary/30"
                    : "border-border text-muted-foreground hover:border-primary/20"
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full h-14 rounded-2xl bg-foreground text-background font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-3 hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {saving ? "Saving..." : (
            <>
              Save Engine Context <Save className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
