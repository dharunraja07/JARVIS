import React, { useState } from 'react';
import { WeatherTool } from '../components/intelligence/WeatherTool';
import { CurrencyTool } from '../components/intelligence/CurrencyTool';
import { NewsTool } from '../components/intelligence/NewsTool';
import { TimeTool } from '../components/intelligence/TimeTool';
import { WebSearchTool } from '../components/intelligence/WebSearchTool';
import { Layers, CloudSun, Coins, Newspaper, Clock, Globe } from 'lucide-react';

export const Intelligence: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'weather' | 'currency' | 'news' | 'time' | 'search'>(
    'weather'
  );

  const tabs = [
    { id: 'weather', label: 'Atmospheric Weather', icon: <CloudSun size={16} /> },
    { id: 'currency', label: 'Currency Converter', icon: <Coins size={16} /> },
    { id: 'news', label: 'Intelligence News', icon: <Newspaper size={16} /> },
    { id: 'time', label: 'World Chronometer', icon: <Clock size={16} /> },
    { id: 'search', label: 'Global Web Search', icon: <Globe size={16} /> },
  ];

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 pb-2 border-b border-blue-500/20">
        <div className="p-2.5 rounded-xl bg-blue-600/20 text-cyan-400 border border-cyan-500/30">
          <Layers size={22} />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-100 light:text-slate-900 tracking-wide">
            Autonomous Intelligence Tools
          </h2>
          <p className="text-xs font-mono text-slate-400">
            DISPATCH MODULES // REAL-TIME EXTERNAL INTEGRATIONS
          </p>
        </div>
      </div>

      {/* Futuristic Tabs Navigation */}
      <div className="flex flex-wrap gap-2 p-1.5 rounded-2xl glass-panel border border-slate-800">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs md:text-sm font-medium transition-all ${
              activeTab === tab.id
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30 border border-cyan-400/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <span className={activeTab === tab.id ? 'text-cyan-300' : 'text-slate-400'}>
              {tab.icon}
            </span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Active Tool Viewport */}
      <div className="p-6 rounded-2xl glass-panel border border-cyan-500/20 shadow-xl">
        {activeTab === 'weather' && <WeatherTool />}
        {activeTab === 'currency' && <CurrencyTool />}
        {activeTab === 'news' && <NewsTool />}
        {activeTab === 'time' && <TimeTool />}
        {activeTab === 'search' && <WebSearchTool />}
      </div>
    </div>
  );
};
