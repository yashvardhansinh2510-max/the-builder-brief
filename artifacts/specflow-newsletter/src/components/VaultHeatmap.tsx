import React, { useMemo, useState } from 'react';
import type { Vault } from '@/hooks/useVaultData';

interface VaultHeatmapProps {
  vaults: Vault[];
}

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const HOURS = Array.from({ length: 24 }, (_, i) => i);

function formatHour(h: number): string {
  if (h === 0) return '12am';
  if (h === 12) return '12pm';
  return h < 12 ? `${h}am` : `${h - 12}pm`;
}

export default function VaultHeatmap({ vaults }: VaultHeatmapProps) {
  const [tooltip, setTooltip] = useState<{
    day: string;
    hour: number;
    count: number;
    x: number;
    y: number;
  } | null>(null);

  // Build 7×24 grid: grid[dayIndex (0=Mon)][hour] = count
  const grid = useMemo(() => {
    const g: number[][] = Array.from({ length: 7 }, () => Array(24).fill(0));
    const signals = vaults.flatMap(v => v.signals);
    signals.forEach(signal => {
      const d = new Date(signal.timestamp);
      // getDay: 0=Sun, 1=Mon … 6=Sat → remap to Mon=0
      const rawDay = d.getDay();
      const dayIdx = rawDay === 0 ? 6 : rawDay - 1;
      const hour = d.getHours();
      g[dayIdx][hour]++;
    });
    return g;
  }, [vaults]);

  const maxCount = Math.max(...grid.flat(), 1);

  function getCellColor(count: number): string {
    if (count === 0) return 'hsl(var(--muted))';
    const intensity = Math.round((count / maxCount) * 100);
    // Use primary hue, vary lightness
    // Lighter at low count, darker (more saturated) at high count
    const lightness = 80 - Math.round((intensity / 100) * 45);
    return `hsl(18 79% ${lightness}%)`;
  }

  function handleMouseEnter(
    e: React.MouseEvent<HTMLDivElement>,
    dayIdx: number,
    hour: number,
    count: number
  ) {
    const rect = e.currentTarget.getBoundingClientRect();
    const containerRect = e.currentTarget.closest('.heatmap-container')?.getBoundingClientRect();
    setTooltip({
      day: DAYS[dayIdx],
      hour,
      count,
      x: rect.left - (containerRect?.left ?? 0) + rect.width / 2,
      y: rect.top - (containerRect?.top ?? 0) - 8,
    });
  }

  return (
    <div className="space-y-3">
      <div>
        <h3 className="text-sm font-semibold text-foreground">Signal Heatmap</h3>
        <p className="text-xs text-muted-foreground mt-0.5">Signal activity by day × hour (local time)</p>
      </div>

      <div className="heatmap-container relative overflow-x-auto">
        {/* Tooltip */}
        {tooltip && (
          <div
            className="absolute z-10 pointer-events-none px-2.5 py-1.5 bg-card border border-border rounded-lg shadow-lg text-xs whitespace-nowrap"
            style={{
              left: tooltip.x,
              top: tooltip.y,
              transform: 'translate(-50%, -100%)',
            }}
          >
            <span className="font-semibold text-foreground">{tooltip.day} {formatHour(tooltip.hour)}</span>
            <span className="text-muted-foreground ml-1.5">— {tooltip.count} signal{tooltip.count !== 1 ? 's' : ''}</span>
          </div>
        )}

        <div className="flex gap-2 min-w-max">
          {/* Day labels */}
          <div className="flex flex-col justify-around pr-1">
            {DAYS.map(day => (
              <span key={day} className="text-xs text-muted-foreground w-8 text-right leading-none">
                {day}
              </span>
            ))}
          </div>

          {/* Grid */}
          <div
            className="flex flex-col gap-[3px]"
            onMouseLeave={() => setTooltip(null)}
          >
            {/* Hour labels */}
            <div className="flex gap-[3px] mb-0.5">
              {HOURS.map(h => (
                <div key={h} className="w-[18px] text-center">
                  {h % 6 === 0 && (
                    <span className="text-[9px] text-muted-foreground">{formatHour(h)}</span>
                  )}
                </div>
              ))}
            </div>

            {/* Day rows */}
            {DAYS.map((day, dayIdx) => (
              <div key={day} className="flex gap-[3px]">
                {HOURS.map(hour => {
                  const count = grid[dayIdx][hour];
                  return (
                    <div
                      key={hour}
                      className="heatmap-cell"
                      style={{
                        width: 18,
                        height: 18,
                        borderRadius: 3,
                        backgroundColor: getCellColor(count),
                        cursor: count > 0 ? 'pointer' : 'default',
                        flexShrink: 0,
                      }}
                      onMouseEnter={e => handleMouseEnter(e, dayIdx, hour, count)}
                      data-testid={`heatmap-cell-${dayIdx}-${hour}`}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-2 mt-3">
          <span className="text-xs text-muted-foreground">Less</span>
          {[0, 0.2, 0.4, 0.65, 1].map((intensity, i) => {
            const count = Math.round(intensity * maxCount);
            return (
              <div
                key={i}
                style={{
                  width: 14,
                  height: 14,
                  borderRadius: 2,
                  backgroundColor: getCellColor(count),
                }}
              />
            );
          })}
          <span className="text-xs text-muted-foreground">More</span>
        </div>
      </div>
    </div>
  );
}
