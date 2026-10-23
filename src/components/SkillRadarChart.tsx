import React from 'react';

interface SkillRadarProps {
  skills: Record<string, number>;
  size?: number;
}

// ponytail: Pure SVG polygon math. Zero Chart.js / Recharts dependencies.
export const SkillRadarChart: React.FC<SkillRadarProps> = ({ skills, size = 260 }) => {
  const entries = Object.entries(skills);
  const count = entries.length;
  const center = size / 2;
  const radius = size * 0.38;

  // Compute vertices for polygon
  const polygonPoints = entries
    .map(([_, val], i) => {
      const angle = ((Math.PI * 2) / count) * i - Math.PI / 2;
      const r = (Math.max(10, Math.min(val, 100)) / 100) * radius;
      const x = center + r * Math.cos(angle);
      const y = center + r * Math.sin(angle);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');

  const gridLevels = [0.25, 0.5, 0.75, 1];

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <svg width={size} height={size} className="overflow-visible">
        {/* Background Radial Webs */}
        {gridLevels.map((lvl) => (
          <circle
            key={lvl}
            cx={center}
            cy={center}
            r={radius * lvl}
            fill="none"
            stroke="rgba(255, 71, 153, 0.12)"
            strokeWidth="1"
            strokeDasharray={lvl === 1 ? 'none' : '3 3'}
          />
        ))}

        {/* Axes Lines */}
        {entries.map(([_, __], i) => {
          const angle = ((Math.PI * 2) / count) * i - Math.PI / 2;
          const x = center + radius * Math.cos(angle);
          const y = center + radius * Math.sin(angle);
          return (
            <line
              key={i}
              x1={center}
              y1={center}
              x2={x}
              y2={y}
              stroke="rgba(255, 71, 153, 0.2)"
              strokeWidth="1"
            />
          );
        })}

        {/* Dynamic Skill Shape */}
        <polygon
          points={polygonPoints}
          fill="rgba(254, 183, 0, 0.22)"
          stroke="#feb700"
          strokeWidth="2"
          className="transition-all duration-300 drop-shadow-[0_0_8px_rgba(254,183,0,0.5)]"
        />

        {/* Points Markers & Labels */}
        {entries.map(([label, val], i) => {
          const angle = ((Math.PI * 2) / count) * i - Math.PI / 2;
          const r = (Math.max(10, Math.min(val, 100)) / 100) * radius;
          const px = center + r * Math.cos(angle);
          const py = center + r * Math.sin(angle);

          const lx = center + (radius + 22) * Math.cos(angle);
          const ly = center + (radius + 22) * Math.sin(angle);

          return (
            <g key={label}>
              <circle cx={px} cy={py} r="3.5" fill="#feb700" stroke="#090414" strokeWidth="1.5" />
              <text
                x={lx}
                y={ly}
                fill="#e2bdc7"
                fontSize="10"
                textAnchor="middle"
                dominantBaseline="middle"
                className="font-mono uppercase font-bold"
              >
                {label} ({val}%)
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};
