import React, { useMemo } from 'react';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts';
import type { Vault } from '@/hooks/useVaultData';

interface VaultTrendGraphProps {
  vaults: Vault[];
}

function getDayLabel(date: Date): string {
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function VaultTrendGraph({ vaults }: VaultTrendGraphProps) {
  const data = useMemo(() => {
    const now = new Date();
    const days: { date: Date; label: string; count: number }[] = [];

    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      d.setHours(0, 0, 0, 0);
      days.push({ date: d, label: getDayLabel(d), count: 0 });
    }

    const signals = vaults.flatMap(v => v.signals);
    signals.forEach(signal => {
      const ts = new Date(signal.timestamp);
      ts.setHours(0, 0, 0, 0);
      const dayEntry = days.find(d => d.date.getTime() === ts.getTime());
      if (dayEntry) dayEntry.count++;
    });

    return days.map(d => ({ label: d.label, signals: d.count }));
  }, [vaults]);

  const maxVal = Math.max(...data.map(d => d.signals), 1);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border rounded-lg px-3 py-2 shadow-lg text-sm">
          <p className="font-semibold text-foreground">{label}</p>
          <p className="text-muted-foreground">
            <span className="font-medium text-primary">{payload[0].value}</span> signals
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Signal Volume</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Last 7 days</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-foreground">
            {data.reduce((s, d) => s + d.signals, 0)}
          </p>
          <p className="text-xs text-muted-foreground">total signals</p>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={data} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
          <defs>
            <linearGradient id="signalGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.25} />
              <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="hsl(var(--border))"
            vertical={false}
          />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
            axisLine={false}
            tickLine={false}
            allowDecimals={false}
            domain={[0, maxVal + 1]}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="signals"
            stroke="hsl(var(--primary))"
            strokeWidth={2.5}
            fill="url(#signalGradient)"
            dot={{ r: 3.5, fill: 'hsl(var(--primary))', strokeWidth: 0 }}
            activeDot={{ r: 5, fill: 'hsl(var(--primary))', strokeWidth: 2, stroke: 'hsl(var(--background))' }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
