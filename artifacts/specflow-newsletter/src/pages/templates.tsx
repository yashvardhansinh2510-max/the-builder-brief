import React from 'react';
import { useAuth } from '@clerk/react';
import { Redirect } from 'wouter';
import { FileText, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { TierGate } from '@/components/TierGate';
import PublicNav from '@/components/PublicNav';

const TEMPLATES = [
  {
    name: 'Landing Page Framework',
    description: 'Proven structure for high-converting SaaS landing pages',
    icon: '📄',
  },
  {
    name: 'Cold Email Sequences',
    description: '10 templates for B2B cold outreach with 40%+ open rates',
    icon: '📧',
  },
  {
    name: 'Product Requirements Doc (PRD)',
    description: 'Template for defining features, success metrics, and timelines',
    icon: '📋',
  },
  {
    name: 'Go-to-Market Strategy',
    description: 'Step-by-step GTM playbook for first 100 customers',
    icon: '🚀',
  },
  {
    name: 'Pitch Deck (Investor Ready)',
    description: '10-slide template for raising funding rounds',
    icon: '💰',
  },
  {
    name: 'Customer Development Script',
    description: 'Interview framework to validate ideas and find product-market fit',
    icon: '🎤',
  },
];

export default function TemplatesPage() {
  const { isLoaded, userId } = useAuth();

  if (!isLoaded) return null;
  if (!userId) return <Redirect to="/sign-in" />;

  return (
    <div className="min-h-screen bg-background">
      <PublicNav activePage="templates" />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-20">
        <TierGate requiredTier="pro">
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <FileText className="w-8 h-8 text-primary" />
              <h1 className="font-serif text-4xl">Ready-Made Templates</h1>
            </div>
            <p className="text-xl text-muted-foreground max-w-2xl">
              Copy-paste templates for landing pages, cold emails, PRDs, pitch decks, and GTM strategies. Proven frameworks used by YC founders.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {TEMPLATES.map((template, idx) => (
              <Card key={idx} className="p-8 hover:shadow-lg transition-shadow">
                <div className="text-4xl mb-4">{template.icon}</div>
                <h3 className="font-serif text-2xl mb-2">{template.name}</h3>
                <p className="text-muted-foreground mb-6">{template.description}</p>
                <Button className="w-full rounded-lg flex items-center justify-center gap-2">
                  <Download className="w-4 h-4" />
                  Download Template
                </Button>
              </Card>
            ))}
          </div>
        </TierGate>
      </main>
    </div>
  );
}
