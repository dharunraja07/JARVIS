import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  Activity,
  Bot,
  Brain,
  Cpu,
  Layers,
  MessageSquare,
  Settings,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import { useJarvisStore } from '../../store/useJarvisStore';

interface SidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isCollapsed,
  onToggleCollapse,
  isMobileOpen,
  onCloseMobile,
}) => {
  const { systemMetrics } = useJarvisStore();

  const navItems = [
    { to: '/', label: 'Assistant', icon: <Bot size={20} /> },
    { to: '/chat', label: 'Conversations', icon: <MessageSquare size={20} /> },
    { to: '/memory', label: 'Neural Memory', icon: <Brain size={20} /> },
    { to: '/intelligence', label: 'Intelligence', icon: <Layers size={20} /> },
    { to: '/pc-control', label: 'PC Diagnostics', icon: <Cpu size={20} /> },
    { to: '/settings', label: 'Settings', icon: <Settings size={20} /> },
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full justify-between">
      {/* Navigation Links */}
      <div className="space-y-6">
        <div className="px-3 pt-3 flex items-center justify-between">
          {!isCollapsed && (
            <span className="text-[11px] font-mono tracking-wider uppercase text-slate-400">
              Command Modules
            </span>
          )}
          <button
            onClick={onToggleCollapse}
            className="hidden md:flex p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 light:hover:bg-slate-200 transition-colors ml-auto"
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>

        <nav className="space-y-1.5 px-2">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onCloseMobile}
              className={({ isActive }) =>
                `flex items-center gap-3.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group relative ${
                  isActive
                    ? 'bg-blue-600/20 text-cyan-300 border border-cyan-500/40 shadow-[0_0_15px_rgba(34,211,238,0.2)]'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 light:text-slate-600 light:hover:text-slate-900 light:hover:bg-slate-200/60'
                } ${isCollapsed ? 'justify-center px-2' : ''}`
              }
              title={isCollapsed ? item.label : undefined}
            >
              {({ isActive }) => (
                <>
                  <span
                    className={`transition-colors flex-shrink-0 ${
                      isActive ? 'text-cyan-400' : 'group-hover:text-cyan-300'
                    }`}
                  >
                    {item.icon}
                  </span>
                  {!isCollapsed && <span className="truncate">{item.label}</span>}
                  {isActive && !isCollapsed && (
                    <span className="ml-auto w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_6px_#22d3ee]" />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Footer System Summary */}
      <div className="p-3 border-t border-slate-800/60 light:border-slate-300/60 space-y-3">
        {!isCollapsed ? (
          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-2 text-xs">
            {systemMetrics ? (
              <>
                <div className="flex items-center justify-between text-slate-400">
                  <span className="flex items-center gap-1.5 font-mono text-[11px]">
                    <Activity size={13} className="text-cyan-400" /> CPU LOAD
                  </span>
                  <span className="font-mono text-cyan-300">{systemMetrics.cpu.usage}%</span>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-cyan-400 h-full transition-all duration-500"
                    style={{ width: `${Math.min(100, systemMetrics.cpu.usage)}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-slate-400 pt-1">
                  <span className="flex items-center gap-1.5 font-mono text-[11px]">
                    <ShieldCheck size={13} className="text-emerald-400" /> RAM
                  </span>
                  <span className="font-mono text-emerald-300">
                    {systemMetrics.memory.used_gb} / {systemMetrics.memory.total_gb} GB
                  </span>
                </div>
              </>
            ) : (
              <div className="text-[11px] font-mono text-slate-500 text-center py-1">
                HOST TELEMETRY STANDBY
              </div>
            )}
          </div>
        ) : (
          <div className="flex justify-center py-2" title={systemMetrics ? `CPU: ${systemMetrics.cpu.usage}%` : 'Companion Offline'}>
            <Activity size={18} className={systemMetrics ? 'text-cyan-400 animate-pulse' : 'text-slate-600'} />
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={`hidden md:flex flex-col border-r border-blue-500/20 glass-panel transition-all duration-300 z-20 ${
          isCollapsed ? 'w-18' : 'w-64'
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Backdrop */}
      {isMobileOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/70 backdrop-blur-sm z-40"
          onClick={onCloseMobile}
        />
      )}

      {/* Mobile Drawer */}
      <aside
        className={`md:hidden fixed top-0 bottom-0 left-0 w-72 glass-panel border-r border-cyan-500/30 z-50 transform transition-transform duration-300 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <span className="font-bold text-base bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
            J.A.R.V.I.S.
          </span>
          <button
            onClick={onCloseMobile}
            className="p-1 rounded-lg text-slate-400 hover:text-white"
          >
            ✕
          </button>
        </div>
        {sidebarContent}
      </aside>
    </>
  );
};
