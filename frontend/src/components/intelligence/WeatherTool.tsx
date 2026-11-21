import React, { useState } from 'react';
import { fetchWeather } from '../../services/api/intelligenceService';
import type { WeatherData } from '../../types';
import { CloudSun, Search, Droplets, Wind, ArrowDown, ArrowUp, Compass } from 'lucide-react';
import { Button } from '../common/Button';

export const WeatherTool: React.FC = () => {
  const [city, setCity] = useState('Chennai');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [weather, setWeather] = useState<WeatherData | null>(null);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!city.trim()) return;

    setLoading(true);
    setError(null);
    try {
      const data = await fetchWeather(city);
      setWeather(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to retrieve weather data.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Search Input Bar */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="Enter city (e.g. Chennai, London, New York, Tokyo)..."
            className="w-full py-2.5 pl-4 pr-10 rounded-xl glass-panel border border-cyan-500/30 text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:border-cyan-400"
          />
        </div>
        <Button type="submit" variant="glow" disabled={loading} icon={<Search size={16} />}>
          {loading ? 'Scanning...' : 'Scan'}
        </Button>
      </form>

      {error && (
        <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs font-mono">
          {error}
        </div>
      )}

      {/* Result Display */}
      {weather && (
        <div className="p-5 rounded-2xl glass-panel border border-cyan-500/30 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Compass size={16} className="text-cyan-400" />
                <h4 className="text-lg font-bold text-slate-100 light:text-slate-900 tracking-wide">
                  {weather.city}
                </h4>
              </div>
              <p className="text-xs font-mono text-cyan-300 uppercase tracking-wider mt-0.5">
                {weather.condition}
              </p>
            </div>
            <div className="text-right">
              <span className="text-3xl md:text-4xl font-extrabold font-mono text-slate-100 light:text-slate-900">
                {weather.temperature}°C
              </span>
              <p className="text-[10px] font-mono text-slate-400">ATMOSPHERIC SENSOR</p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-800/80 light:border-slate-300/80">
            <div className="p-3 rounded-xl bg-slate-900/40 border border-slate-800 text-xs">
              <span className="text-slate-400 flex items-center gap-1 font-mono">
                <Droplets size={13} className="text-blue-400" /> Humidity
              </span>
              <p className="text-sm font-bold font-mono text-cyan-300 mt-1">
                {weather.humidity}%
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/40 border border-slate-800 text-xs">
              <span className="text-slate-400 flex items-center gap-1 font-mono">
                <Wind size={13} className="text-teal-400" /> Wind Velocity
              </span>
              <p className="text-sm font-bold font-mono text-cyan-300 mt-1">
                {weather.wind_speed} km/h
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/40 border border-slate-800 text-xs">
              <span className="text-slate-400 flex items-center gap-1 font-mono">
                <ArrowDown size={13} className="text-emerald-400" /> Min Temp
              </span>
              <p className="text-sm font-bold font-mono text-emerald-400 mt-1">
                {weather.min_temp}°C
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/40 border border-slate-800 text-xs">
              <span className="text-slate-400 flex items-center gap-1 font-mono">
                <ArrowUp size={13} className="text-amber-400" /> Max Temp
              </span>
              <p className="text-sm font-bold font-mono text-amber-400 mt-1">
                {weather.max_temp}°C
              </p>
            </div>
          </div>

          <div className="text-[10px] font-mono text-slate-500 text-right">
            Verified via Open-Meteo Satellite Feed // {weather.timestamp}
          </div>
        </div>
      )}

      {!weather && !error && !loading && (
        <div className="p-8 text-center rounded-2xl glass-panel-subtle border border-slate-800 space-y-2">
          <CloudSun size={32} className="mx-auto text-cyan-400/60" />
          <p className="text-sm text-slate-400">
            Query atmospheric meteorology for any terrestrial coordinate or city.
          </p>
        </div>
      )}
    </div>
  );
};
