import React from 'react';

interface GaugeChartProps {
  value: number; // 0 to 100
  title: string;
  subtitle?: string;
  color?: 'cyan' | 'blue' | 'emerald' | 'amber' | 'rose' | 'violet';
  size?: number;
}

export const GaugeChart: React.FC<GaugeChartProps> = ({
  value,
  title,
  subtitle,
  color = 'cyan',
  size = 140,
}) => {
  const strokeWidth = 10;
  const radius = (size - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  // Use a 270 degree arc
  const arcLength = circumference * 0.75;
  const clampedValue = Math.min(100, Math.max(0, value));
  const strokeDashoffset = arcLength - (clampedValue / 100) * arcLength;

  const colorMap = {
    cyan: { stroke: '#22D3EE', glow: 'rgba(34, 211, 238, 0.4)' },
    blue: { stroke: '#3B82F6', glow: 'rgba(59, 130, 246, 0.4)' },
    emerald: { stroke: '#10B981', glow: 'rgba(16, 185, 129, 0.4)' },
    amber: { stroke: '#F59E0B', glow: 'rgba(245, 158, 11, 0.4)' },
    rose: { stroke: '#F43F5E', glow: 'rgba(244, 63, 94, 0.4)' },
    violet: { stroke: '#8B5CF6', glow: 'rgba(139, 92, 246, 0.4)' },
  };

  const selectedColor = colorMap[color];

  return (
    <div className="flex flex-col items-center justify-center p-3 select-none">
      <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-135">
          {/* Background Track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="rgba(255, 255, 255, 0.08)"
            strokeWidth={strokeWidth}
            strokeDasharray={`${arcLength} ${circumference}`}
            strokeLinecap="round"
          />

          {/* Value Progress Arc */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={selectedColor.stroke}
            strokeWidth={strokeWidth}
            strokeDasharray={`${arcLength} ${circumference}`}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-700 ease-out"
            style={{
              filter: `drop-shadow(0 0 6px ${selectedColor.glow})`,
            }}
          />
        </svg>

        {/* Center Readout */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-2xl font-bold font-mono tracking-tight text-slate-100 light:text-slate-900">
            {Math.round(value)}%
          </span>
          <span className="text-[10px] font-mono tracking-wider uppercase text-slate-400">
            {title}
          </span>
        </div>
      </div>

      {subtitle && (
        <span className="text-xs text-slate-400 font-mono mt-1 text-center">
          {subtitle}
        </span>
      )}
    </div>
  );
};
