import React from 'react';
import { VaultScore } from '@/lib/vault-types';

interface VaultScorecardProps {
  scores: VaultScore;
  size?: 'sm' | 'md' | 'lg';
  layout?: 'horizontal' | 'vertical' | 'grid';
}

const ScoreAxis: React.FC<{
  label: string;
  value: number;
  description?: string;
}> = ({ label, value, description }) => {
  const percentage = value / 100;
  const color = value >= 75 ? 'bg-green-500' : value >= 50 ? 'bg-yellow-500' : 'bg-red-500';

  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-between items-center">
        <label className="text-sm font-semibold text-muted-foreground">{label}</label>
        <span className="text-sm font-bold text-foreground">{value}</span>
      </div>
      <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
        <div
          className={`h-full ${color} transition-all duration-300`}
          style={{ width: `${percentage * 100}%` }}
        />
      </div>
      {description && (
        <p className="text-xs text-muted-foreground">{description}</p>
      )}
    </div>
  );
};

export const VaultScorecard: React.FC<VaultScorecardProps> = ({
  scores,
  size = 'md',
  layout = 'vertical',
}) => {
  const containerClasses = {
    sm: 'gap-3',
    md: 'gap-4',
    lg: 'gap-6',
  }[size];

  const axes = [
    {
      label: 'Opportunity',
      value: scores.opportunity,
      description: 'Market size & growth potential',
    },
    {
      label: 'Problem',
      value: scores.problem,
      description: 'Problem severity & clarity',
    },
    {
      label: 'Feasibility',
      value: scores.feasibility,
      description: 'Technical & market viability',
    },
    {
      label: 'Why Now',
      value: scores.whyNow,
      description: 'Timing & market readiness',
    },
  ];

  const layoutClasses = {
    horizontal: 'flex flex-row flex-wrap',
    vertical: 'flex flex-col',
    grid: 'grid grid-cols-2 gap-4 md:gap-6',
  }[layout];

  return (
    <div className={`${layoutClasses} ${containerClasses}`}>
      {/* Overall Score Badge */}
      <div className="col-span-2 md:col-span-4 flex items-center gap-4 p-4 bg-primary/5 rounded-2xl border border-primary/20">
        <div className="flex flex-col">
          <span className="text-sm font-medium text-muted-foreground">Overall Confidence</span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-primary">{scores.overall}</span>
            <span className="text-xs text-muted-foreground">/ 100</span>
          </div>
        </div>
        <div className="ml-auto flex flex-col items-end">
          <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
            scores.overall >= 75
              ? 'bg-green-100 text-green-700'
              : scores.overall >= 50
              ? 'bg-yellow-100 text-yellow-700'
              : 'bg-red-100 text-red-700'
          }`}>
            {scores.overall >= 75 ? 'High Confidence' : scores.overall >= 50 ? 'Moderate' : 'Review Needed'}
          </span>
        </div>
      </div>

      {/* Score Axes */}
      {axes.map((axis) => (
        <div key={axis.label} className={layout === 'grid' ? 'col-span-1' : ''}>
          <ScoreAxis {...axis} />
        </div>
      ))}
    </div>
  );
};

export default VaultScorecard;
