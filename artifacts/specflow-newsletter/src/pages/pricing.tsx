import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { Check, X, ArrowRight, Loader2, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import PublicNav from '@/components/PublicNav';
import Footer from '@/components/Footer';
import { usePayments } from '@/lib/usePayments';
import { useAuth } from '@/lib/AuthContext';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.5, delay: i * 0.1 } }),
};

const COMPARISON = [
  {
    others: 'Business books ($30)',
    need: 'One actionable idea',
    deliver: 'Weekly researched idea + blueprint',
  },
  {
    others: 'Consultants ($500/hr)',
    need: 'Execution plan',
    deliver: 'Step-by-step build guide',
  },
  {
    others: 'Other newsletters ($0)',
    need: 'Real market intelligence',
    deliver: 'Scored opportunity analysis',
  },
];

const TIERS = [
  {
    name: 'Free',
    label: 'Tester',
    price: '$0',
    subtext: 'forever',
    description: '1 free idea/month, basic vault access, newsletter',
    anchor: '',
    cta: 'Start Free',
    href: '/sign-up',
    highlight: false,
    ctaVariant: 'outline' as const,
  },
  {
    name: 'Pro',
    label: 'Builder',
    price: '$29',
    subtext: '/month',
    description: 'Full vault, blueprints, AI templates, weekly briefs',
    anchor: 'Less than a business book. More than a co-founder.',
    cta: 'Start Building',
    href: '/pro-portal',
    highlight: true,
    ctaVariant: 'default' as const,
  },
  {
    name: 'Max',
    label: 'Operator',
    price: '$99',
    subtext: '/month',
    description: 'Everything in Pro + investor matching, co-founder network, monthly strategy call, private community',
    anchor: 'Your first investor intro pays for 3 years of Max.',
    cta: 'Go Max',
    href: '/max-portal',
    highlight: false,
    ctaVariant: 'secondary' as const,
  },
];

const FAQ = [
  {
    q: 'Is the newsletter actually free?',
    a: 'Yes. The weekly startup idea brief is 100% free, always. You get one full idea every Friday — researched, scored, and blueprinted. Pro and Max unlock the full vault, AI tools, and community.',
  },
  {
    q: "What's the difference between Pro and Max?",
    a: 'Pro gives you full vault access (200+ ideas), blueprints, AI templates, and weekly briefs. Max adds investor matching, co-founder network, a monthly strategy call with a founder, and access to the private community.',
  },
  {
    q: 'Can I cancel anytime?',
    a: 'Yes, cancel anytime from your portal. No lock-ins, no cancellation fees. Your access continues until the end of the billing period.',
  },
  {
    q: 'How often do new ideas drop?',
    a: 'Every Friday. One complete startup idea — researched, scored, and blueprinted. Pro and Max subscribers get the full brief plus access to all past issues.',
  },
  {
    q: 'What if I already have an idea?',
    a: "The Builder Brief isn't just idea delivery. Use the Idea Agent to validate your existing idea, the blueprints to build it faster, and the community to find co-founders and early customers.",
  },
];

const FEATURES = [
  { name: 'Weekly startup idea brief', free: true, pro: true, max: true },
  { name: 'Basic vault access (1/month)', free: true, pro: false, max: false },
  { name: 'Full vault (200+ ideas)', free: false, pro: true, max: true },
  { name: 'Execution blueprints', free: false, pro: true, max: true },
  { name: 'AI Idea Agent', free: false, pro: true, max: true },
  { name: 'AI templates (landing page, PRD, GTM)', free: false, pro: true, max: true },
  { name: 'Investor matching', free: false, pro: false, max: true },
  { name: 'Co-founder network', free: false, pro: false, max: true },
  { name: 'Monthly strategy call', free: false, pro: false, max: true },
  { name: 'Private community', free: false, pro: false, max: true },
];

export default function PricingPage() {
  const { initiatePayment } = usePayments();
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [loadingTier, setLoadingTier] = useState<string | null>(null);

  const handleTierClick = async (tier: typeof TIERS[number]) => {
    if (tier.name === 'Free') {
      setLocation(tier.href);
      return;
    }
    if (!user) {
      setLocation('/sign-in');
      return;
    }
    setLoadingTier(tier.name);
    try {
      await initiatePayment(tier.name.toLowerCase() as 'pro' | 'max');
    } catch {
      setLocation(tier.href);
    } finally {
      setLoadingTier(null);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <PublicNav activePage="pricing" />

      {/* Headline */}
      <section className="max-w-4xl mx-auto px-6 pt-24 pb-12 text-center">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-serif text-4xl md:text-6xl tracking-tight mb-4"
        >
          Stop paying for ideas you'll never build.{' '}
          <span className="italic text-primary">Start with one.</span>
        </motion.h1>
      </section>

      {/* Comparison Table */}
      <section className="max-w-4xl mx-auto px-6 pb-16">
        <div className="overflow-hidden rounded-2xl border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-6 py-4 font-semibold text-muted-foreground">What others charge</th>
                <th className="text-left px-6 py-4 font-semibold text-muted-foreground">What you need</th>
                <th className="text-left px-6 py-4 font-semibold text-primary">What we deliver</th>
              </tr>
            </thead>
            <tbody>
              {COMPARISON.map((row, i) => (
                <tr key={i} className={i < COMPARISON.length - 1 ? 'border-b border-border/50' : ''}>
                  <td className="px-6 py-4 text-muted-foreground">{row.others}</td>
                  <td className="px-6 py-4 text-muted-foreground">{row.need}</td>
                  <td className="px-6 py-4 font-medium">{row.deliver}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Tier Cards */}
      <section className="max-w-5xl mx-auto px-6 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TIERS.map((tier, i) => (
            <motion.div
              key={tier.name}
              custom={i}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              className={`relative rounded-2xl border p-8 flex flex-col ${
                tier.highlight
                  ? 'border-primary shadow-lg shadow-primary/10 bg-card'
                  : 'border-border bg-card'
              }`}
            >
              {tier.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground px-3 py-0.5 text-xs font-bold uppercase tracking-wider">
                    Most Popular
                  </Badge>
                </div>
              )}

              <div className="mb-6">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground mb-2">
                  {tier.label}
                </p>
                <div className="flex items-baseline gap-1 mb-1">
                  <span className="font-serif text-4xl font-bold">{tier.price}</span>
                  <span className="text-muted-foreground text-sm">{tier.subtext}</span>
                </div>
                <p className="text-sm text-muted-foreground mt-3">{tier.description}</p>
                {tier.anchor && (
                  <p className="text-xs italic text-muted-foreground/70 mt-2">"{tier.anchor}"</p>
                )}
              </div>

              <div className="space-y-2.5 flex-1 mb-8">
                {FEATURES.map(feature => {
                  const included = tier.name === 'Free' ? feature.free
                    : tier.name === 'Pro' ? feature.pro
                    : feature.max;
                  return (
                    <div key={feature.name} className="flex items-center gap-2.5 text-sm">
                      {included ? (
                        <Check className="w-4 h-4 text-primary flex-shrink-0" />
                      ) : (
                        <X className="w-4 h-4 text-muted-foreground/40 flex-shrink-0" />
                      )}
                      <span className={included ? 'text-foreground' : 'text-muted-foreground/50'}>
                        {feature.name}
                      </span>
                    </div>
                  );
                })}
              </div>

              <Button
                onClick={() => handleTierClick(tier)}
                disabled={loadingTier === tier.name}
                variant={tier.ctaVariant}
                className="w-full h-12 font-semibold"
              >
                {loadingTier === tier.name ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>{tier.cta} <ArrowRight className="w-4 h-4 ml-1.5" /></>
                )}
              </Button>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Guarantee Strip */}
      <section className="bg-card border-y border-border py-8 px-6 mb-16">
        <div className="max-w-3xl mx-auto flex items-center justify-center gap-4 text-center">
          <Shield className="w-6 h-6 text-primary flex-shrink-0" />
          <p className="text-base font-medium">
            30-day no-questions refund. If you don't find one idea worth building, we'll give you your money back.
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-3xl mx-auto px-6 pb-24">
        <h2 className="font-serif text-2xl mb-8">Frequently asked</h2>
        <Accordion type="single" collapsible className="space-y-2">
          {FAQ.map((item, i) => (
            <AccordionItem key={i} value={`faq-${i}`} className="border border-border rounded-xl px-6">
              <AccordionTrigger className="text-left font-medium hover:no-underline py-5">
                {item.q}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground pb-5">
                {item.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>

      <Footer />
    </div>
  );
}
