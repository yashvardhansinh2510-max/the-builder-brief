import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Clock } from 'lucide-react';
import { TierGate } from '@/components/TierGate';
import PortalNav from '@/components/PortalNav';
import Footer from '@/components/Footer';
import { usePageTracking } from '@/hooks/useAnalytics';
import ArchitectureDiagram from '@/components/blueprints/ArchitectureDiagram';
import ComplianceTimeline from '@/components/blueprints/ComplianceTimeline';
import ExitDashboard from '@/components/blueprints/ExitDashboard';
import GlobalArbitrageMap from '@/components/blueprints/GlobalArbitrageMap';
import HiringRoadmap from '@/components/blueprints/HiringRoadmap';
import PLGSequence from '@/components/blueprints/PLGSequence';
import TractionProofSection from '@/components/blueprints/TractionProofSection';
import UnitEconomicsCalculator from '@/components/blueprints/UnitEconomicsCalculator';

type Stage = 'All' | 'Validate' | 'Build' | 'Scale' | 'Exit';

interface Blueprint {
  slug: string;
  title: string;
  stage: Exclude<Stage, 'All'>;
  description: string;
  hours: number;
  component: React.ReactNode;
}

const BLUEPRINTS: Blueprint[] = [
  {
    slug: 'architecture-diagram',
    title: 'Architecture Diagram',
    stage: 'Build',
    description: 'System design for your MVP',
    hours: 2,
    component: (
      <ArchitectureDiagram
        mermaidCode={`graph TD
  A[Client] --> B[API Gateway]
  B --> C[Auth Service]
  B --> D[Core Service]
  D --> E[(Database)]
  D --> F[Cache]`}
        description="A reference MVP architecture covering client, API gateway, auth, core service, database, and cache layers."
      />
    ),
  },
  {
    slug: 'compliance-timeline',
    title: 'Compliance Timeline',
    stage: 'Build',
    description: 'Legal and compliance milestones',
    hours: 3,
    component: (
      <ComplianceTimeline
        data={{
          items: [
            {
              requirement: 'Terms of Service & Privacy Policy',
              timeline: 'Week 1 (before launch)',
              effortLevel: 'Low',
              whyMatters: 'Legal baseline required for any SaaS product accepting users.',
            },
            {
              requirement: 'GDPR / Data Processing Agreement',
              timeline: 'Week 2–3',
              effortLevel: 'Medium',
              whyMatters: 'Mandatory if you process EU user data. Fines can exceed €20M.',
            },
            {
              requirement: 'SOC 2 Type I',
              timeline: 'Month 4–6',
              effortLevel: 'High',
              whyMatters: 'Required by enterprise buyers. Unblocks six-figure contracts.',
            },
          ],
        }}
      />
    ),
  },
  {
    slug: 'exit-dashboard',
    title: 'Exit Dashboard',
    stage: 'Exit',
    description: 'Metrics and readiness for exit',
    hours: 4,
    component: (
      <ExitDashboard
        data={{
          acquirers: ['Salesforce', 'HubSpot', 'Zendesk', 'Private Equity Rollup'],
          metricsNeeded: [
            '$3M ARR with 120%+ NRR',
            'Gross margin > 75%',
            'CAC payback < 12 months',
            'Documented processes & runbooks',
          ],
          timeline: '24–36 months from $1M ARR to acquisition close',
          valuationTarget: '$30M–$60M (10–20× ARR)',
        }}
      />
    ),
  },
  {
    slug: 'global-arbitrage-map',
    title: 'Global Arbitrage Map',
    stage: 'Validate',
    description: 'Geographic market opportunity',
    hours: 1,
    component: (
      <GlobalArbitrageMap
        data={{
          regions: [
            {
              region: 'Southeast Asia',
              demandScore: 8,
              regulatoryEase: 7,
              entryStrategy: 'Partner with local distributor, launch in Singapore first, expand to Indonesia within 6 months.',
            },
            {
              region: 'LATAM (Brazil / Mexico)',
              demandScore: 7,
              regulatoryEase: 5,
              entryStrategy: 'Launch in English, add PT-BR localisation after $50K MRR. Use existing US Stripe account.',
            },
            {
              region: 'MENA',
              demandScore: 6,
              regulatoryEase: 6,
              entryStrategy: 'Target UAE and Saudi Arabia. Register a local entity only after $100K ARR.',
            },
          ],
        }}
      />
    ),
  },
  {
    slug: 'hiring-roadmap',
    title: 'Hiring Roadmap',
    stage: 'Scale',
    description: 'First 10 hires, sequenced',
    hours: 2,
    component: <HiringRoadmap />,
  },
  {
    slug: 'plg-sequence',
    title: 'PLG Sequence',
    stage: 'Build',
    description: 'Product-led growth motion',
    hours: 3,
    component: (
      <PLGSequence
        data={{
          loops: [
            {
              trigger: 'User shares a generated output (report, link, export)',
              ahaMoment: 'Recipient opens the share link and sees value without signing up',
              viralMechanic: 'Recipient prompted to create their own — powered-by branding on every share',
            },
            {
              trigger: 'User hits a usage limit on the free tier',
              ahaMoment: 'Upgrade modal shows exactly what they unlock — not a price wall',
              viralMechanic: 'Upgraded users invite teammates; each invite counts toward usage credit',
            },
          ],
        }}
      />
    ),
  },
  {
    slug: 'traction-proof',
    title: 'Traction Proof',
    stage: 'Validate',
    description: 'Evidence framework for investors',
    hours: 2,
    component: (
      <TractionProofSection
        traction={{
          status: 'added',
          mrr: 12500,
          users: 340,
          growthRate: 18,
          monthsSinceLaunch: 4,
          addedAt: '2026-01-01T00:00:00Z',
          lastUpdated: '2026-05-01T00:00:00Z',
          notes: 'Sample traction snapshot. Replace with your live metrics before sharing with investors.',
        }}
      />
    ),
  },
  {
    slug: 'unit-economics-calculator',
    title: 'Unit Economics Calculator',
    stage: 'Validate',
    description: 'LTV/CAC/payback period model',
    hours: 1,
    component: (
      <UnitEconomicsCalculator
        data={{
          unitPrice: 99,
          cogs: 12,
          cac: 350,
          assumptions: 'Monthly subscription. CAC assumes paid acquisition mix. No churn factored into 12-month LTV.',
        }}
      />
    ),
  },
];

const STAGE_COLORS: Record<Exclude<Stage, 'All'>, string> = {
  Validate: 'bg-blue-100 text-blue-700',
  Build: 'bg-violet-100 text-violet-700',
  Scale: 'bg-green-100 text-green-700',
  Exit: 'bg-orange-100 text-orange-700',
};

const STAGES: Stage[] = ['All', 'Validate', 'Build', 'Scale', 'Exit'];

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.4, delay: i * 0.06 } }),
};

export default function BlueprintsPage() {
  usePageTracking('blueprints');
  const [activeStage, setActiveStage] = useState<Stage>('All');

  const visible = activeStage === 'All'
    ? BLUEPRINTS
    : BLUEPRINTS.filter(b => b.stage === activeStage);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <PortalNav activePage="blueprints" />

      {/* Header */}
      <section className="max-w-5xl mx-auto px-6 pt-20 pb-12">
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-serif text-4xl md:text-5xl tracking-tight mb-4"
        >
          Execution Blueprints
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-muted-foreground text-lg mb-8 max-w-2xl"
        >
          Not theory. Not inspiration. Execution-ready playbooks for specific startup stages.
        </motion.p>

        {/* Stage filter */}
        <div className="flex gap-2 flex-wrap">
          {STAGES.map(stage => (
            <button
              key={stage}
              onClick={() => setActiveStage(stage)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all ${
                activeStage === stage
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'border-border text-muted-foreground hover:border-foreground/30 hover:text-foreground'
              }`}
            >
              {stage}
            </button>
          ))}
        </div>
      </section>

      {/* Blueprint Card Grid */}
      <section className="max-w-5xl mx-auto px-6 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {visible.map((bp, i) => (
            <motion.div
              key={bp.slug}
              custom={i}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
            >
              <div className="bg-card border border-border rounded-2xl p-6 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 flex flex-col h-full">
                <div className="flex items-center justify-between mb-3">
                  <span className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${STAGE_COLORS[bp.stage]}`}>
                    {bp.stage}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="w-3.5 h-3.5" />
                    {bp.hours}h
                  </span>
                </div>
                <h3 className="font-serif font-bold text-xl mb-2">{bp.title}</h3>
                <p className="text-sm text-muted-foreground flex-1 mb-5">{bp.description}</p>
                <a
                  href={`#blueprint-${bp.slug}`}
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:gap-2.5 transition-all"
                >
                  Open Blueprint <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Blueprint Detail Sections */}
      {BLUEPRINTS.map((bp, i) => (
        <section
          key={bp.slug}
          id={`blueprint-${bp.slug}`}
          className="max-w-5xl mx-auto px-6 pb-24 scroll-mt-24"
        >
          <div className="border-t border-border/50 pt-12">
            <span className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${STAGE_COLORS[bp.stage]} inline-block mb-4`}>
              {bp.stage}
            </span>
            <h2 className="font-serif text-3xl mb-2">{bp.title}</h2>
            <p className="text-muted-foreground mb-8">{bp.description}</p>

            <TierGate
              requiredTier="pro"
              fallback={
                <div className="relative rounded-2xl overflow-hidden border border-border">
                  <div className="blur-sm pointer-events-none select-none opacity-40 p-6">
                    {bp.component}
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center bg-background/60">
                    <div className="text-center">
                      <p className="font-semibold mb-3">Pro or Max required</p>
                      <a
                        href="/pricing"
                        className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors"
                      >
                        Upgrade to unlock <ArrowRight className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                </div>
              }
            >
              {bp.component}
            </TierGate>

            {i < BLUEPRINTS.length - 1 && (
              <div className="mt-10 flex justify-end">
                <a
                  href={`#blueprint-${BLUEPRINTS[i + 1].slug}`}
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
                >
                  Next Blueprint: {BLUEPRINTS[i + 1].title} <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            )}
          </div>
        </section>
      ))}

      <Footer />
    </div>
  );
}
