import { useMemo, useState } from 'react';
import { useParams, Link } from 'wouter';
import { ArrowLeft, ArrowRight, Share2, Check } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { issues } from '@/lib/data';
import { usePageTracking } from '@/hooks/useAnalytics';
import PortalNav from '@/components/PortalNav';
import Footer from '@/components/Footer';
import { useToast } from '@/hooks/use-toast';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-8">
      <h2 className="font-bold text-xs uppercase tracking-widest text-muted-foreground mb-3">{title}</h2>
      {children}
    </div>
  );
}

function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-2">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-2 text-sm text-foreground/80">
          <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
          {item}
        </li>
      ))}
    </ul>
  );
}

function NumberedList({ items }: { items: string[] }) {
  return (
    <ol className="space-y-2">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-3 text-sm text-foreground/80">
          <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
            {i + 1}
          </span>
          {item}
        </li>
      ))}
    </ol>
  );
}

function CodeBlock({ items }: { items: string[] }) {
  return (
    <div className="space-y-3">
      {items.map((prompt, i) => (
        <div key={i} className="rounded-xl bg-muted/60 border border-border p-4 text-sm font-mono text-foreground/80 whitespace-pre-wrap">
          {prompt}
        </div>
      ))}
    </div>
  );
}

export default function ArchiveDetail() {
  const { slug } = useParams<{ slug: string }>();
  usePageTracking(`/archive/${slug}`);
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const sorted = useMemo(
    () => [...issues].sort((a, b) => Number(b.number) - Number(a.number)),
    []
  );

  const idx = useMemo(() => sorted.findIndex(i => i.slug === slug), [sorted, slug]);
  const issue = sorted[idx];
  const prevIssue = sorted[idx + 1] ?? null;
  const nextIssue = sorted[idx - 1] ?? null;

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try { await navigator.share({ title: issue?.title, url }); return; } catch {}
    }
    await navigator.clipboard.writeText(url);
    setCopied(true);
    toast({ title: 'Link copied', description: 'Brief URL copied to clipboard.' });
    setTimeout(() => setCopied(false), 2000);
  };

  if (!issue) {
    return (
      <div className="min-h-screen bg-background text-foreground font-sans">
        <PortalNav activePage="archive" />
        <div className="max-w-2xl mx-auto px-6 pt-32 text-center">
          <p className="text-muted-foreground mb-4">Brief not found.</p>
          <Link href="/archive" className="text-primary text-sm hover:underline">← Back to Archive</Link>
        </div>
      </div>
    );
  }

  const numPadded = String(issue.number).padStart(3, '0');

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <PortalNav activePage="archive" />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 pt-24 pb-32">
        <Link href="/archive" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Archive
        </Link>

        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-xs font-black tracking-widest text-muted-foreground font-mono">#{numPadded}</span>
            <Badge variant="outline" className="text-[9px] font-bold uppercase tracking-widest">{issue.category}</Badge>
            <button
              onClick={handleShare}
              className="ml-auto flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Share2 className="w-3.5 h-3.5" />}
              {copied ? 'Copied' : 'Share'}
            </button>
          </div>
          <h1 className="font-serif text-3xl md:text-4xl tracking-tight mb-3">{issue.title}</h1>
          <p className="text-lg text-muted-foreground">{issue.tagline}</p>
        </div>

        {/* Content sections */}
        <div className="divide-y divide-border space-y-8">
          <Section title="The Problem">
            <p className="text-sm text-foreground/80 leading-relaxed">{issue.problem}</p>
          </Section>

          {issue.whyNow?.length > 0 && (
            <div className="pt-8">
              <Section title="Why Now">
                <BulletList items={issue.whyNow} />
              </Section>
            </div>
          )}

          {(issue.tam || issue.tam_detail) && (
            <div className="pt-8">
              <Section title="Market Size">
                {issue.tam && <p className="text-2xl font-bold mb-2">{issue.tam}</p>}
                {issue.tam_detail && <p className="text-sm text-foreground/80 leading-relaxed">{issue.tam_detail}</p>}
              </Section>
            </div>
          )}

          {issue.blueprint?.length > 0 && (
            <div className="pt-8">
              <Section title="Build Blueprint">
                <NumberedList items={issue.blueprint} />
              </Section>
            </div>
          )}

          {issue.prompts?.length > 0 && (
            <div className="pt-8">
              <Section title="AI Execution Prompts">
                <CodeBlock items={issue.prompts} />
              </Section>
            </div>
          )}

          {issue.firstRevenue && (
            <div className="pt-8">
              <Section title="First Revenue Path">
                <p className="text-sm text-foreground/80 leading-relaxed">{issue.firstRevenue}</p>
              </Section>
            </div>
          )}

          {issue.firstTen && (
            <div className="pt-8">
              <Section title="First 10 Customers">
                <p className="text-sm text-foreground/80 leading-relaxed">{issue.firstTen}</p>
              </Section>
            </div>
          )}
        </div>

        {/* Prev / Next navigation */}
        <div className="flex items-center justify-between mt-16 pt-8 border-t border-border">
          {prevIssue ? (
            <Link href={`/archive/${prevIssue.slug}`} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors max-w-[45%]">
              <ArrowLeft className="w-4 h-4 shrink-0" />
              <span className="line-clamp-1">{prevIssue.title}</span>
            </Link>
          ) : <span />}
          {nextIssue ? (
            <Link href={`/archive/${nextIssue.slug}`} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors max-w-[45%] text-right">
              <span className="line-clamp-1">{nextIssue.title}</span>
              <ArrowRight className="w-4 h-4 shrink-0" />
            </Link>
          ) : <span />}
        </div>

      </main>
      <Footer />
    </div>
  );
}
