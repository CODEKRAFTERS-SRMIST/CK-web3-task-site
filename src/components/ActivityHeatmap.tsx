import React from 'react';

// ponytail: Native CSS grid heatmap. 20 weeks x 7 days micro-grid. No heavy calendar packages.
export const ActivityHeatmap: React.FC = () => {
  // Deterministic mock seed for builder activity
  const weeks = 24;
  const days = 7;
  const dayLabels = ['Mon', '', 'Wed', '', 'Fri', '', 'Sun'];

  const getIntensity = (w: number, d: number) => {
    const val = (w * 3 + d * 7 + 5) % 11;
    if (val > 8) return 'bg-[#feb700]';
    if (val > 5) return 'bg-[#ff4799]';
    if (val > 3) return 'bg-[#ff4799]/40';
    return 'bg-[#231c2f]';
  };

  return (
    <div className="p-4 rounded-2xl bg-[#1b122b]/80 border border-white/10 font-mono">
      <div className="flex items-center justify-between mb-3 text-xs">
        <span className="text-[#a98891] uppercase tracking-wider font-semibold">
          Builder Activity Telemetry (Past 24 Weeks)
        </span>
        <div className="flex items-center gap-1.5 text-[10px] text-[#e2bdc7]">
          <span>Less</span>
          <span className="w-2.5 h-2.5 rounded-sm bg-[#231c2f]" />
          <span className="w-2.5 h-2.5 rounded-sm bg-[#ff4799]/40" />
          <span className="w-2.5 h-2.5 rounded-sm bg-[#ff4799]" />
          <span className="w-2.5 h-2.5 rounded-sm bg-[#feb700]" />
          <span>More</span>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        <div className="flex flex-col justify-between text-[9px] text-[#a98891] pr-1 select-none">
          {dayLabels.map((l, i) => (
            <span key={i} className="h-2.5 leading-none">{l}</span>
          ))}
        </div>

        <div className="grid grid-rows-7 grid-flow-col gap-1">
          {Array.from({ length: weeks * days }).map((_, idx) => {
            const w = Math.floor(idx / 7);
            const d = idx % 7;
            const colorClass = getIntensity(w, d);
            return (
              <div
                key={idx}
                title={`Week ${w + 1}, Day ${d + 1}`}
                className={`w-2.5 h-2.5 rounded-sm ${colorClass} hover:ring-1 hover:ring-white transition-all`}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};
