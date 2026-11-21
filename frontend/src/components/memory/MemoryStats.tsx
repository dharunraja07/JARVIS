import React from 'react';
import type { MemoryItem } from '../../types';
import { Brain, Database, BookOpen, Briefcase, Rocket, Heart } from 'lucide-react';

interface MemoryStatsProps {
  memories: MemoryItem[];
}

export const MemoryStats: React.FC<MemoryStatsProps> = ({ memories }) => {
  const categories = {
    Education: memories.filter((m) => m.category === 'Education').length,
    Career: memories.filter((m) => m.category === 'Career').length,
    Projects: memories.filter((m) => m.category === 'Projects').length,
    Preferences: memories.filter((m) => m.category === 'Preferences').length,
    Personal: memories.filter((m) => m.category === 'Personal').length,
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {/* Total Memory Count Card */}
      <div className="p-4 rounded-2xl glass-panel border border-cyan-500/30 flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-cyan-500/20 text-cyan-400 border border-cyan-400/40 shadow-[0_0_15px_rgba(34,211,238,0.3)]">
          <Brain size={24} />
        </div>
        <div>
          <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
            Total Neural Memories
          </span>
          <p className="text-2xl font-bold text-slate-100 light:text-slate-900 font-mono">
            {memories.length}
          </p>
        </div>
      </div>

      {/* Persistence Architecture */}
      <div className="p-4 rounded-2xl glass-panel border border-blue-500/20 flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-blue-500/20 text-blue-400 border border-blue-400/40">
          <Database size={24} />
        </div>
        <div>
          <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
            Storage Engine
          </span>
          <p className="text-sm font-semibold text-slate-200 light:text-slate-800">
            SQLite / jarvis_memory.db
          </p>
          <span className="text-[10px] text-cyan-400 font-mono">Vector / Token Indexing</span>
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="md:col-span-2 p-4 rounded-2xl glass-panel border border-slate-700/50 flex flex-col justify-center gap-2">
        <div className="flex items-center justify-between text-xs font-mono text-slate-400">
          <span>CATEGORY DISTRIBUTION</span>
          <span className="text-cyan-400">5 ACTIVE SCHEMAS</span>
        </div>
        <div className="flex flex-wrap gap-2 pt-1">
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono bg-cyan-950/40 border border-cyan-500/30 text-cyan-300">
            <BookOpen size={12} /> Education ({categories.Education})
          </span>
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono bg-emerald-950/40 border border-emerald-500/30 text-emerald-300">
            <Briefcase size={12} /> Career ({categories.Career})
          </span>
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono bg-blue-950/40 border border-blue-500/30 text-blue-300">
            <Rocket size={12} /> Projects ({categories.Projects})
          </span>
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono bg-violet-950/40 border border-violet-500/30 text-violet-300">
            <Heart size={12} /> Preferences ({categories.Preferences})
          </span>
        </div>
      </div>
    </div>
  );
};
