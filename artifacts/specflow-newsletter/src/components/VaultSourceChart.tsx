import React, { useMemo } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import type { Vault, Signal } from '@/hooks/useVaultData';

interface VaultSourceChartProps {
  vaults: Vault[];
}

// HSL chart colors from the design system
const CHART_COLORS = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
];

export default function VaultSourceChart({ vaults }: VaultSourceChartProps) {
  const data = useMemo(() => {
    const counts: Record<string, number> = {};
    vaults.forEach((vault: Vault) => {
      vault.signals.forEach((signal: Signal) => {
        counts[signal.source_type] = (counts[signal.source_type] || 0) + 1;
      });
      // Also count source_types on the vault itself if signals is empty
      if (vault.signals.length === 0) {
        vault.source_types.forEach((src: string) => {
          counts[src] = (counts[src] || 0) + 1;
        });
      }
    });

    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [vaults]);

  const total = data.reduce((s, d) => s + d.value, 0);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const { name, value } = payload[0].payload;
      const pct = total > 0 ? Math.round((value / total) * 100) : 0;
      return (
        <div className="bg-card border border-border rounded-lg px-3 py-2 shadow-lg text-sm">
          <p className="font-semibold text-foreground capitalize">{name}</p>
          <p className="text-muted-foreground">
            <span className="font-medium text-foreground">{value}</span> signals ({pct}%)
          </p>
        </div>
      );
    }
    return null;
  };

  const CustomLegend = ({ payload }: any) => (
    <ul className="flex flex-col gap-1.5 mt-2">
      {(payload || []).map((entry: any, i: number) => {
        const pct = total > 0 ? Math.round((entry.payload.value / total) * 100) : 0;
        return (
          <li key={i} className="flex items-center justify-between gap-3 text-xs">
            <span className="flex items-center gap-1.5">
              <span
                className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }}
              />
              <span className="text-muted-foreground capitalize">{entry.value}</span>
            </span>
            <span className="font-semibold text-foreground">{pct}%</span>
          </li>
        );
      })}
    </ul>
  );

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-muted-foreground text-sm">
        No source data available.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div>
        <h3 className="text-sm font-semibold text-foreground">Signal Sources</h3>
        <p className="text-xs text-muted-foreground mt-0.5">Breakdown by source type</p>
      </div>

      <div className="flex items-center gap-4">
        {/* Donut chart */}
        <div className="flex-shrink-0" style={{ width: 160, height: 160 }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={48}
                outerRadius={72}
                paddingAngle={2}
                dataKey="value"
                strokeWidth={0}
              >
                {data.map((_, i) => (
                  <Cell
                    key={i}
                    fill={CHART_COLORS[i % CHART_COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Legend */}
        <div className="flex-1 min-w-0">
          <CustomLegend
            payload={data.map((d, i) => ({
              value: d.name,
              payload: d,
              color: CHART_COLORS[i % CHART_COLORS.length],
            }))}
          />
          <div className="mt-3 pt-3 border-t border-border">
            <p className="text-xs text-muted-foreground">
              Total: <span className="font-semibold text-foreground">{total} signals</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
