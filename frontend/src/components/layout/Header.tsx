import React, { useEffect, useState } from 'react';
import { useJarvisStore } from '../../store/useJarvisStore';
import { formatDate, formatTime } from '../../utils/formatters';
import { Sun, Moon, Radio, Shield, Menu } from 'lucide-react';
import { Badge } from '../common/Badge';

interface HeaderProps {
  onToggleSidebar?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleSidebar }) => {
  const { theme, toggleTheme, assistantState } = useJarvisStore();
  const [timeStr, setTimeStr] = useState(formatTime());
  const [dateStr, setDateStr] = useState(formatDate());

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setTimeStr(formatTime(now));
      setDateStr(formatDate(now));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const getStatusBadgeVariant = () => {
    switch (assistantState) {
      case 'listening':
        return 'emerald';
      case 'processing':
        return 'violet';
      case 'speaking':
        return 'cyan';
      case 'error':
        return 'rose';
      case 'connecting':
        return 'amber';
      case 'idle':
      default:
        return 'blue';
    }
  };

  return (
    <header className="h-16 px-4 md:px-6 flex items-center justify-between border-b border-blue-500/20 glass-panel z-30 sticky top-0">
      {/* Left: Mobile Menu Toggle & Brand */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="md:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/60 light:hover:bg-slate-200 transition-colors"
          aria-label="Toggle Navigation"
        >
          <Menu size={20} />
        </button>

        <div className="flex items-center gap-2.5">
          <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-blue-600/20 border border-cyan-400/50 shadow-[0_0_12px_rgba(34,211,238,0.3)]">
            <Radio size={18} className="text-cyan-400 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold tracking-wider text-base md:text-lg bg-gradient-to-r from-blue-400 via-cyan-300 to-indigo-300 bg-clip-text text-transparent">
                J.A.R.V.I.S.
              </span>
              <span className="hidden sm:inline-block text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-blue-500/15 border border-blue-500/30 text-cyan-300">
                CORE V4.2
              </span>
            </div>
            <p className="text-[10px] text-slate-400 hidden sm:block tracking-wide">
              AUTONOMOUS INTELLIGENCE INTERFACE
            </p>
          </div>
        </div>
      </div>

      {/* Middle: Sci-Fi Status & Clock */}
      <div className="hidden lg:flex items-center gap-6">
        <div className="flex items-center gap-2 text-xs font-mono text-slate-300 light:text-slate-600 px-3 py-1.5 rounded-lg bg-slate-900/40 border border-slate-700/40">
          <span className="text-cyan-400">{dateStr}</span>
          <span className="text-slate-500">//</span>
          <span className="text-blue-400 font-semibold">{timeStr} IST</span>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant={getStatusBadgeVariant()} pulse={assistantState !== 'disconnected'}>
            SYS: {assistantState.toUpperCase()}
          </Badge>
          <span className="text-xs text-slate-400 font-mono flex items-center gap-1">
            <Shield size={13} className="text-blue-400" /> GEMMA-31B
          </span>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2.5">
        <div className="lg:hidden">
          <Badge variant={getStatusBadgeVariant()} pulse size="sm">
            {assistantState}
          </Badge>
        </div>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2.5 rounded-xl text-slate-300 hover:text-white bg-slate-800/40 hover:bg-slate-800 border border-slate-700/50 light:bg-slate-200 light:text-slate-700 light:hover:bg-slate-300 light:border-slate-300 transition-all shadow-sm"
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
          aria-label="Toggle Theme"
        >
          {theme === 'dark' ? (
            <Sun size={18} className="text-amber-400" />
          ) : (
            <Moon size={18} className="text-indigo-600" />
          )}
        </button>
      </div>
    </header>
  );
};
