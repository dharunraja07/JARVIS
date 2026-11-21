import React from 'react';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  percent?: number;
  color?: 'cyan' | 'blue' | 'emerald' | 'amber' | 'violet';
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  percent,
  color = 'cyan',
}) => {
  const colorBorders = {
    cyan: 'border-cyan-500/30 shadow-cyan-500/10',
    blue: 'border-blue-500/30 shadow-blue-500/10',
    emerald: 'border-emerald-500/30 shadow-emerald-500/10',
    amber: 'border-amber-500/30 shadow-amber-500/10',
    violet: 'border-violet-500/30 shadow-violet-500/10',
  };

  const progressColors = {
    cyan: 'bg-gradient-to-r from-blue-500 to-cyan-400',
    blue: 'bg-gradient-to-r from-indigo-500 to-blue-400',
    emerald: 'bg-gradient-to-r from-teal-500 to-emerald-400',
    amber: 'bg-gradient-to-r from-amber-600 to-amber-400',
    violet: 'bg-gradient-to-r from-purple-500 to-violet-400',
  };

  return (
    <div
      className={`p-4 rounded-2xl glass-panel border ${colorBorders[color]} shadow-lg flex flex-col justify-between`}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <span className="text-[11px] font-mono tracking-wider uppercase text-slate-400">
            {title}
          </span>
          <p className="text-xl md:text-2xl font-bold font-mono text-slate-100 light:text-slate-900 tracking-tight">
            {value}
          </p>
        </div>
        <div className="p-2.5 rounded-xl bg-slate-800/60 light:bg-slate-200 text-cyan-400 border border-slate-700/50">
          {icon}
        </div>
      </div>

      <div className="mt-4 space-y-1.5">
        {percent !== undefined && (
          <div className="w-full bg-slate-800 light:bg-slate-200 h-1.5 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${progressColors[color]}`}
              style={{ width: `${Math.min(100, Math.max(0, percent))}%` }}
            />
          </div>
        )}
        {subtitle && (
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
            <span>{subtitle}</span>
            {percent !== undefined && (
              <span className="text-cyan-300 font-semibold">{percent}%</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
