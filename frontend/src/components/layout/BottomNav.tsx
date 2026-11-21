import React from 'react';
import { NavLink } from 'react-router-dom';
import { Bot, MessageSquare, Brain, Layers, Cpu, Settings } from 'lucide-react';

export const BottomNav: React.FC = () => {
  const navItems = [
    { to: '/', label: 'Assistant', icon: <Bot size={20} /> },
    { to: '/chat', label: 'Chat', icon: <MessageSquare size={20} /> },
    { to: '/memory', label: 'Memory', icon: <Brain size={20} /> },
    { to: '/intelligence', label: 'Tools', icon: <Layers size={20} /> },
    { to: '/pc-control', label: 'PC', icon: <Cpu size={20} /> },
    { to: '/settings', label: 'Settings', icon: <Settings size={20} /> },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 glass-panel border-t border-blue-500/20 z-30 flex items-center justify-around px-2 pb-safe">
      {navItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          className={({ isActive }) =>
            `flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all relative ${
              isActive
                ? 'text-cyan-400 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <div
                className={`p-1 rounded-lg transition-transform ${
                  isActive ? 'scale-110' : ''
                }`}
              >
                {item.icon}
              </div>
              <span className="text-[10px] tracking-tight">{item.label}</span>
              {isActive && (
                <span className="absolute -bottom-1 w-4 h-1 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee]" />
              )}
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
};
