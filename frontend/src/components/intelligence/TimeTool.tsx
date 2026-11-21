import React, { useEffect, useState } from 'react';
import { POPULAR_TIMEZONES } from '../../utils/constants';
import { Clock } from 'lucide-react';

export const TimeTool: React.FC = () => {
  const [selectedTz, setSelectedTz] = useState('Asia/Kolkata');
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const getTimeForZone = (timeZone: string) => {
    try {
      const timeFormatter = new Intl.DateTimeFormat('en-US', {
        timeZone,
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
      const dateFormatter = new Intl.DateTimeFormat('en-GB', {
        timeZone,
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });

      return {
        time: timeFormatter.format(now),
        date: dateFormatter.format(now).toUpperCase(),
      };
    } catch {
      return { time: '--:--:--', date: '--' };
    }
  };

  const selectedData = getTimeForZone(selectedTz);

  return (
    <div className="space-y-4">
      {/* Timezone Selector */}
      <div>
        <label className="block text-xs font-mono text-slate-400 mb-1.5 uppercase">
          CHRONOMETER TIMEZONE
        </label>
        <select
          value={selectedTz}
          onChange={(e) => setSelectedTz(e.target.value)}
          className="w-full py-2.5 px-3 rounded-xl glass-panel border border-cyan-500/30 text-sm font-mono text-slate-100 bg-slate-900 focus:outline-none"
        >
          {POPULAR_TIMEZONES.map((tz) => (
            <option key={tz.id} value={tz.id}>
              {tz.name} ({tz.offset})
            </option>
          ))}
        </select>
      </div>

      {/* Main Clock Card */}
      <div className="p-6 rounded-2xl glass-panel border border-cyan-500/30 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-cyan-500/20 text-cyan-400 border border-cyan-400/40 shadow-[0_0_15px_rgba(34,211,238,0.3)]">
            <Clock size={24} className="animate-spin-slow" />
          </div>
          <div>
            <h4 className="text-base font-bold text-slate-100 light:text-slate-900">
              {POPULAR_TIMEZONES.find((t) => t.id === selectedTz)?.name || selectedTz}
            </h4>
            <p className="text-xs font-mono text-cyan-300">{selectedData.date}</p>
          </div>
        </div>

        <div className="text-right">
          <span className="text-3xl md:text-4xl font-extrabold font-mono text-cyan-300 tracking-wider">
            {selectedData.time}
          </span>
          <p className="text-[10px] font-mono text-slate-400">ATOMIC SYNC // 24-HR FORMAT</p>
        </div>
      </div>

      {/* World Clock Matrix Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
        {POPULAR_TIMEZONES.slice(0, 6).map((tz) => {
          const data = getTimeForZone(tz.id);
          const isSelected = tz.id === selectedTz;
          return (
            <div
              key={tz.id}
              onClick={() => setSelectedTz(tz.id)}
              className={`p-3 rounded-xl cursor-pointer transition-all ${
                isSelected
                  ? 'bg-blue-600/20 border border-cyan-400/50 shadow-md shadow-cyan-500/10'
                  : 'glass-panel border border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                <span className="truncate">{tz.name.split('(')[0]}</span>
                <span className="text-cyan-400">{tz.offset}</span>
              </div>
              <p className="text-lg font-bold font-mono text-slate-100 light:text-slate-900 mt-1">
                {data.time}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
