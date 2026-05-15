import React from 'react';
import { Card } from '@/components/ui/card';
import type { BlueprintTraction } from '@/lib/data';

interface TractionProofSectionProps {
  traction: BlueprintTraction;
}

export default function TractionProofSection({ traction }: TractionProofSectionProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <section className="mb-12">
      <h2 className="text-3xl font-serif mb-8 flex items-center gap-3">
        🚀 Traction Proof
      </h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {traction.mrr !== undefined && (
          <Card className="bg-card border border-border p-6 rounded-xl">
            <span className="text-xs uppercase font-bold text-muted-foreground block mb-2">MRR</span>
            <span className="text-2xl font-bold text-primary">${traction.mrr.toLocaleString()}</span>
          </Card>
        )}

        {traction.users !== undefined && (
          <Card className="bg-card border border-border p-6 rounded-xl">
            <span className="text-xs uppercase font-bold text-muted-foreground block mb-2">Active Users</span>
            <span className="text-2xl font-bold text-foreground">{traction.users.toLocaleString()}</span>
          </Card>
        )}

        {traction.growthRate !== undefined && (
          <Card className="bg-card border border-border p-6 rounded-xl">
            <span className="text-xs uppercase font-bold text-muted-foreground block mb-2">Growth Rate</span>
            <span className="text-2xl font-bold text-primary">{traction.growthRate}% MoM</span>
          </Card>
        )}

        <Card className="bg-card border border-border p-6 rounded-xl">
          <span className="text-xs uppercase font-bold text-muted-foreground block mb-2">Live Since</span>
          <span className="text-2xl font-bold text-foreground">{traction.monthsSinceLaunch}mo</span>
        </Card>
      </div>

      <div className="text-xs text-muted-foreground mb-4">
        Last updated: {formatDate(traction.lastUpdated)}
      </div>

      {traction.notes && (
        <div className="text-sm text-muted-foreground bg-muted/30 p-4 rounded-lg border border-border">
          {traction.notes}
        </div>
      )}
    </section>
  );
}
