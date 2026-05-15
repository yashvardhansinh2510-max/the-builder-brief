import React, { useState, useRef } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { Redirect, Link } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import { Wand2, ChevronDown, Copy, Check, Loader2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import PublicNav from '@/components/PublicNav';
import Footer from '@/components/Footer';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const SECTIONS = [
  'SCORECARD',
  'MARKET SIZE',
  'COMPETITOR GAPS',
  'WHY NOW',
  'FIRST 10 CUSTOMERS',
  'FIRST REVENUE PATH',
  'RISK FLAGS',
] as const;

type SectionName = typeof SECTIONS[number];

interface SectionContent {
  name: SectionName;
  content: string;
}

const USAGE_LIMITS: Record<string, number> = { free: 2, pro: 20, max: Infinity };

function parseToken(
  token: string,
  sections: SectionContent[],
  currentSection: SectionName | null,
): { sections: SectionContent[]; currentSection: SectionName | null } {
  let s = [...sections];
  let cur = currentSection;

  const sectionMatch = SECTIONS.find(name =>
    token.includes(`## ${name}`)
  );

  if (sectionMatch) {
    cur = sectionMatch;
    if (!s.find(x => x.name === sectionMatch)) {
      s = [...s, { name: sectionMatch, content: '' }];
    }
    return { sections: s, currentSection: cur };
  }

  if (cur) {
    s = s.map(x =>
      x.name === cur ? { ...x, content: x.content + token } : x
    );
  }

  return { sections: s, currentSection: cur };
}

export default function IdeaAgent() {
  const { user, loading, tier, getToken } = useAuth();

  const [idea, setIdea] = useState('');
  const [stage, setStage] = useState('');
  const [targetMarket, setTargetMarket] = useState('');
  const [budget, setBudget] = useState('');
  const [contextOpen, setContextOpen] = useState(false);

  const [streaming, setStreaming] = useState(false);
  const [sections, setSections] = useState<SectionContent[]>([]);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const currentSectionRef = useRef<SectionName | null>(null);

  if (loading) return null;
  if (!user) return <Redirect to="/sign-in" />;

  const usageLimit = USAGE_LIMITS[tier ?? 'free'] ?? 2;
  const usageLimitText = usageLimit === Infinity ? 'Unlimited' : `${usageLimit}/month`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!idea.trim() || streaming) return;

    setSections([]);
    setDone(false);
    setError(null);
    setStreaming(true);
    currentSectionRef.current = null;

    try {
      const token = await getToken();
      const res = await fetch(`${API_BASE}/idea-agent/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ idea, stage, targetMarket, budget }),
      });

      if (res.status === 429) {
        setError('Usage limit reached for this month. Upgrade for more analyses.');
        setStreaming(false);
        return;
      }

      if (!res.ok) {
        setError('Something went wrong. Please try again.');
        setStreaming(false);
        return;
      }

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        setError('Stream unavailable.');
        setStreaming(false);
        return;
      }

      while (true) {
        const { done: streamDone, value } = await reader.read();
        if (streamDone) break;

        const raw = decoder.decode(value);
        const lines = raw.split('\n').filter(l => l.startsWith('data: '));

        for (const line of lines) {
          const data = line.slice(6);
          if (data === '[DONE]') {
            setDone(true);
            continue;
          }
          try {
            const { token: tok, error: streamError } = JSON.parse(data);
            if (streamError) { setError(streamError); break; }
            if (tok) {
              setSections(prev => {
                const result = parseToken(tok, prev, currentSectionRef.current);
                currentSectionRef.current = result.currentSection;
                return result.sections;
              });
            }
          } catch {
            // ignore malformed SSE lines
          }
        }
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setStreaming(false);
    }
  };

  const handleCopyMarkdown = () => {
    const md = sections
      .map(s => `## ${s.name}\n\n${s.content.trim()}`)
      .join('\n\n---\n\n');
    navigator.clipboard.writeText(md);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <PublicNav activePage="agent" />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-20">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
              <Wand2 className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="font-serif text-3xl tracking-tight">Idea Agent</h1>
              <p className="text-sm text-muted-foreground">
                Drop your idea. Get a brutally honest analysis in 60 seconds.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Input Panel */}
        <form onSubmit={handleSubmit} className="mb-12">
          <textarea
            value={idea}
            onChange={e => setIdea(e.target.value)}
            placeholder="Describe your startup idea in 2-3 sentences"
            rows={4}
            className="w-full px-5 py-4 border border-border rounded-2xl bg-card text-base resize-none focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all mb-4"
            required
          />

          {/* Collapsible context */}
          <Collapsible open={contextOpen} onOpenChange={setContextOpen}>
            <CollapsibleTrigger asChild>
              <button
                type="button"
                className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
              >
                <ChevronDown
                  className={`w-4 h-4 transition-transform ${contextOpen ? 'rotate-180' : ''}`}
                />
                Add context (optional)
              </button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                <div>
                  <label className="text-xs text-muted-foreground mb-1.5 block font-medium">Stage</label>
                  <select
                    value={stage}
                    onChange={e => setStage(e.target.value)}
                    className="w-full px-3 py-2.5 border border-border rounded-xl bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  >
                    <option value="">Any</option>
                    <option>Idea</option>
                    <option>Building</option>
                    <option>Launched</option>
                    <option>Scaling</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1.5 block font-medium">Target market</label>
                  <input
                    type="text"
                    value={targetMarket}
                    onChange={e => setTargetMarket(e.target.value)}
                    placeholder="e.g. SMBs in India"
                    className="w-full px-3 py-2.5 border border-border rounded-xl bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1.5 block font-medium">Budget range</label>
                  <select
                    value={budget}
                    onChange={e => setBudget(e.target.value)}
                    className="w-full px-3 py-2.5 border border-border rounded-xl bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  >
                    <option value="">Any</option>
                    <option>Bootstrap (&lt;$1K)</option>
                    <option>Low ($1K–$10K)</option>
                    <option>Mid ($10K–$100K)</option>
                    <option>Capital-heavy ($100K+)</option>
                  </select>
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* Usage meter */}
          <p className="text-xs text-muted-foreground mb-3">
            {tier === 'max' ? '∞ Unlimited analyses' : `${usageLimitText} analyses`}
          </p>

          <Button
            type="submit"
            disabled={streaming || !idea.trim()}
            className="w-full sm:w-auto h-12 px-8 font-semibold"
          >
            {streaming ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Analyzing…</>
            ) : (
              <>Analyze This Idea <ArrowRight className="w-4 h-4 ml-1.5" /></>
            )}
          </Button>

          <p className="mt-4 text-sm text-muted-foreground">
            Or{' '}
            <Link href="/vault-archive" className="text-primary hover:underline">
              pick a random idea from the vault →
            </Link>
          </p>
        </form>

        {/* Error state */}
        {error && (
          <div className="mb-8 p-4 bg-destructive/10 border border-destructive/20 rounded-xl text-sm text-destructive">
            {error}
          </div>
        )}

        {/* Analysis output */}
        <AnimatePresence>
          {sections.length > 0 && (
            <div className="space-y-8">
              {sections.map(section => (
                <motion.div
                  key={section.name}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">
                    {section.name}
                  </h3>
                  <div className="bg-card border border-border rounded-xl p-5">
                    <pre className="font-sans text-sm leading-relaxed whitespace-pre-wrap">
                      {section.content}
                    </pre>
                  </div>
                </motion.div>
              ))}

              {/* Export bar */}
              {done && (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-wrap gap-3 pt-4 border-t border-border"
                >
                  <button
                    onClick={handleCopyMarkdown}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border text-sm font-medium hover:bg-card transition-colors"
                  >
                    {copied ? (
                      <><Check className="w-4 h-4 text-green-600" /> Copied!</>
                    ) : (
                      <><Copy className="w-4 h-4" /> Copy as Markdown</>
                    )}
                  </button>
                  {(tier === 'pro' || tier === 'max') && (
                    <button
                      className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border text-sm font-medium hover:bg-card transition-colors opacity-50 cursor-not-allowed"
                      title="Coming soon"
                      disabled
                    >
                      Save to Vault
                    </button>
                  )}
                  <button
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border text-sm font-medium hover:bg-card transition-colors opacity-50 cursor-not-allowed"
                    title="Coming soon"
                    disabled
                  >
                    Share Analysis
                  </button>
                </motion.div>
              )}
            </div>
          )}
        </AnimatePresence>
      </main>

      <Footer />
    </div>
  );
}
