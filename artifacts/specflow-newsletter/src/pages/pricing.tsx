import React from 'react';
import { Link } from 'wouter';
import { motion } from 'framer-motion';
import { Check, X, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import PublicNav from '@/components/PublicNav';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.5, delay: i * 0.1 } }),
};

const FEATURES = [
  { name: 'Idea Search & Browse', free: true, pro: true, max: true },
  { name: 'Limited Blueprints (50)', free: true, pro: false, max: false },
  { name: 'Full Blueprints (200+)', free: false, pro: true, max: true },
  { name: 'Complete Vault (500+)', free: false, pro: false, max: true },
  { name: 'AI Idea Agent', free: false, pro: true, max: true },
  { name: 'Revenue Modeling Calculator', free: false, pro: true, max: true },
  { name: 'Sales Scripts Library', free: false, pro: true, max: true },
  { name: 'Founder Checklists', free: false, pro: true, max: true },
  { name: 'Template Generator (Landing Page, Ads, PRD, GTM)', free: false, pro: true, max: true },
  { name: 'PDF Export', free: false, pro: true, max: true },
  { name: 'Investor Database (500+ VCs)', free: false, pro: false, max: true },
  { name: 'Investor Matching Engine', free: false, pro: false, max: true },
  { name: 'Co-founder Marketplace', free: false, pro: false, max: true },
  { name: 'Cap Table & SAFE Templates', free: false, pro: false, max: true },
  { name: 'Equity Calculator', free: false, pro: false, max: true },
  { name: 'Exit Roadmaps (Bootstrap → IPO)', free: false, pro: false, max: true },
  { name: 'Private Slack Community', free: false, pro: false, max: true },
  { name: 'Monthly Live Q&A with Founders', free: false, pro: false, max: true },
  { name: '1:1 Founder Coaching (Monthly)', free: false, pro: false, max: true },
  { name: 'API Access', free: false, pro: false, max: true },
];

const TIERS = [
  {
    name: 'Free',
    price: 'Free',
    subtext: 'Forever',
    description: 'Explore 50 curated startup blueprints',
    cta: 'Get Started',
    href: '/sign-up',
    highlight: false,
  },
  {
    name: 'Pro',
    price: '$29',
    subtext: '/month',
    description: '200+ blueprints with full execution playbooks',
    cta: 'Start Pro Trial',
    href: '/pro-portal',
    highlight: true,
  },
  {
    name: 'Max',
    price: '$99',
    subtext: '/month',
    description: 'Complete toolkit: 500+ ideas, AI agent, investor matching, community',
    cta: 'Upgrade to Max',
    href: '/max-portal',
    highlight: false,
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-background">
      <PublicNav activePage="pricing" />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-20">
        {/* Header */}
        <motion.div
          initial="hidden"
          animate="visible"
          custom={0}
          variants={fadeUp}
          className="text-center mb-16"
        >
          <h1 className="font-serif text-5xl md:text-6xl mb-6">Simple, transparent pricing</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Start free. Upgrade when you're ready. No credit card required.
          </p>
        </motion.div>

        {/* Tier Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">
          {TIERS.map((tier, idx) => (
            <motion.div
              key={tier.name}
              initial="hidden"
              animate="visible"
              custom={idx + 1}
              variants={fadeUp}
            >
              <div
                className={`relative rounded-2xl p-8 h-full flex flex-col ${
                  tier.highlight
                    ? 'bg-primary text-primary-foreground border-2 border-primary shadow-2xl shadow-primary/20'
                    : 'bg-card border border-border'
                }`}
              >
                {tier.highlight && (
                  <Badge className="w-fit mb-4 bg-primary-foreground text-primary">
                    Most Popular
                  </Badge>
                )}

                <h3 className="font-serif text-3xl mb-2">{tier.name}</h3>
                <div className="mb-4">
                  <span className="font-mono text-4xl font-bold">{tier.price}</span>
                  <span className={`text-sm ml-2 ${tier.highlight ? 'opacity-90' : 'text-muted-foreground'}`}>
                    {tier.subtext}
                  </span>
                </div>

                <p className={`text-sm mb-8 ${tier.highlight ? 'opacity-90' : 'text-muted-foreground'}`}>
                  {tier.description}
                </p>

                <Button
                  asChild
                  className={`w-full mb-8 rounded-lg h-12 font-bold ${
                    tier.highlight
                      ? 'bg-primary-foreground text-primary hover:bg-primary-foreground/90'
                      : ''
                  }`}
                >
                  <Link href={tier.href} className="flex items-center justify-center gap-2">
                    {tier.cta}
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </Button>

                <div className="border-t border-current border-opacity-20 pt-8">
                  <div className="space-y-3">
                    {FEATURES.slice(0, 6).map((feature, fidx) => {
                      const hasFeature =
                        (tier.name === 'Free' && feature.free) ||
                        (tier.name === 'Pro' && feature.pro) ||
                        (tier.name === 'Max' && feature.max);

                      return (
                        <div key={fidx} className="flex items-start gap-3 text-sm">
                          {hasFeature ? (
                            <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                          ) : (
                            <X className="w-5 h-5 opacity-30 flex-shrink-0 mt-0.5" />
                          )}
                          <span className={hasFeature ? '' : 'opacity-50'}>{feature.name}</span>
                        </div>
                      );
                    })}
                    <button className="text-primary font-bold text-sm mt-4 hover:underline">
                      View all features →
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Full Feature Comparison */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          className="mt-20"
        >
          <h2 className="font-serif text-4xl mb-12 text-center">Complete Feature Breakdown</h2>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-4 font-serif text-lg">Feature</th>
                  <th className="text-center p-4 font-semibold">Free</th>
                  <th className="text-center p-4 font-semibold">Pro</th>
                  <th className="text-center p-4 font-semibold">Max</th>
                </tr>
              </thead>
              <tbody>
                {FEATURES.map((feature, idx) => (
                  <tr
                    key={idx}
                    className={`border-b border-border ${idx % 2 === 0 ? 'bg-muted/30' : ''}`}
                  >
                    <td className="p-4 text-sm font-medium">{feature.name}</td>
                    <td className="text-center p-4">
                      {feature.free ? (
                        <Check className="w-5 h-5 text-primary mx-auto" />
                      ) : (
                        <X className="w-5 h-5 opacity-30 mx-auto" />
                      )}
                    </td>
                    <td className="text-center p-4">
                      {feature.pro ? (
                        <Check className="w-5 h-5 text-primary mx-auto" />
                      ) : (
                        <X className="w-5 h-5 opacity-30 mx-auto" />
                      )}
                    </td>
                    <td className="text-center p-4">
                      {feature.max ? (
                        <Check className="w-5 h-5 text-primary mx-auto" />
                      ) : (
                        <X className="w-5 h-5 opacity-30 mx-auto" />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* FAQ */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          className="mt-24"
        >
          <h2 className="font-serif text-4xl mb-12 text-center">Frequently Asked Questions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {[
              {
                q: 'Can I downgrade my plan?',
                a: 'Yes. You can downgrade at any time, and your plan will end at the next billing cycle. No questions asked.',
              },
              {
                q: 'Do you offer annual discounts?',
                a: 'Yes! Pay annually and get 20% off. Contact support or upgrade to see annual pricing options.',
              },
              {
                q: 'Is there a free trial for Pro?',
                a: '7-day free trial for Pro and Max. No credit card required. If you love it, stay. If not, no charge.',
              },
              {
                q: 'What payment methods do you accept?',
                a: 'Credit card (Visa, Mastercard, Amex), and we support Razorpay for India-based users.',
              },
              {
                q: 'Can I cancel anytime?',
                a: 'Absolutely. Cancel in 30 seconds from your account settings. Your access continues until the end of the billing period.',
              },
              {
                q: 'Do startups get special pricing?',
                a: 'Reach out to hello@thebuildbrief.com. We love supporting early-stage founders—let's talk.',
              },
            ].map((faq, idx) => (
              <div key={idx} className="bg-card border border-border rounded-xl p-6">
                <h4 className="font-bold mb-3 text-foreground">{faq.q}</h4>
                <p className="text-muted-foreground text-sm leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </main>
    </div>
  );
}
