import React, { useState } from 'react';
import { Link } from 'wouter';
import { X, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';
import type { Vault, Signal } from '@/hooks/useVaultData';

interface VaultDetailViewProps {
  vault: Vault;
  onClose: () => void;
}

function SignalRow({ signal }: { signal: Signal }) {
  const [expanded, setExpanded] = useState(false);
  const pct = Math.round(signal.confidence_score * 100);
  const barColor =
    signal.confidence_score >= 0.7
      ? 'bg-emerald-500'
      : signal.confidence_score >= 0.5
      ? 'bg-amber-500'
      : 'bg-red-500';

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <div
        className="flex items-start gap-3 p-3 cursor-pointer hover:bg-muted/30 transition-colors"
        onClick={() => setExpanded(e => !e)}
      >
        {/* Source badge */}
        <span className="flex-shrink-0 mt-0.5 px-2 py-0.5 text-xs font-semibold rounded-full bg-primary/10 text-primary uppercase tracking-wide">
          {signal.source_type}
        </span>

        {/* Content preview */}
        <div className="flex-1 min-w-0">
          <p className="text-sm text-foreground line-clamp-2">{signal.content}</p>
          <p className="text-xs text-muted-foreground mt-1">
            {new Date(signal.timestamp).toLocaleString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
        </div>

        {/* Confidence bar */}
        <div className="flex-shrink-0 flex flex-col items-end gap-1 w-16">
          <span className="text-xs font-semibold text-foreground">{pct}%</span>
          <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden">
            <div
              className={`h-full rounded-full ${barColor} transition-all`}
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>

        {/* Expand toggle */}
        <button className="flex-shrink-0 text-muted-foreground hover:text-foreground transition-colors mt-0.5">
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {/* Expanded reasoning */}
      {expanded && signal.reasoning && (
        <div className="px-3 pb-3 border-t border-border/60 bg-muted/20">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mt-2 mb-1">
            Reasoning
          </p>
          <p className="text-sm text-foreground/80 leading-relaxed">{signal.reasoning}</p>
        </div>
      )}
    </div>
  );
}

export default function VaultDetailView({ vault, onClose }: VaultDetailViewProps) {
  return (
    <div className="p-4 space-y-4" data-testid={`vault-detail-${vault.id}`}>
      {/* Header row */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-base text-foreground">{vault.title}</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            {vault.signals.length} signal{vault.signals.length !== 1 ? 's' : ''} recorded
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={`/vault/${vault.id}`}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            data-testid={`vault-detail-link-${vault.id}`}
          >
            Full vault <ExternalLink className="w-3 h-3" />
          </Link>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            data-testid={`vault-detail-close-${vault.id}`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Signals list */}
      {vault.signals.length === 0 ? (
        <p className="text-sm text-muted-foreground py-4 text-center">
          No signals available for this vault.
        </p>
      ) : (
        <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
          {vault.signals.map((signal: Signal) => (
            <SignalRow key={signal.id} signal={signal} />
          ))}
        </div>
      )}
    </div>
  );
}
