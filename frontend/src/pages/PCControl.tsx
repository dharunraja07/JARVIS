import React from 'react';
import { useSystemMonitor } from '../hooks/useSystemMonitor';
import { GaugeChart } from '../components/dashboard/GaugeChart';
import { MetricCard } from '../components/dashboard/MetricCard';
import { Badge } from '../components/common/Badge';
import {
  Cpu,
  Activity,
  HardDrive,
  BatteryCharging,
  Battery,
  ShieldCheck,
  Laptop,
  AlertCircle,
  Terminal,
} from 'lucide-react';

export const PCControl: React.FC = () => {
  const { metrics, isLiveCompanion } = useSystemMonitor(3000);

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-blue-500/20">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-600/20 text-cyan-400 border border-cyan-500/30">
            <Cpu size={22} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-100 light:text-slate-900 tracking-wide">
              Workstation Hardware Diagnostics
            </h2>
            <p className="text-xs font-mono text-slate-400">
              REAL-TIME HOST TELEMETRY // SYSTEM_MONITOR.PY // PSUTIL STREAM
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Badge
            variant={isLiveCompanion ? 'emerald' : 'amber'}
            pulse={isLiveCompanion}
          >
            {isLiveCompanion ? 'LIVE WINDOWS TELEMETRY' : 'COMPANION DISCONNECTED'}
          </Badge>
        </div>
      </div>

      {/* When companion is offline */}
      {!isLiveCompanion && (
        <div className="p-6 rounded-2xl glass-panel border border-amber-500/30 bg-amber-950/20 space-y-3">
          <div className="flex items-center gap-2.5 text-amber-300 font-semibold text-sm">
            <AlertCircle size={18} />
            <span>Host Companion Telemetry Offline</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed max-w-3xl">
            In compliance with security standards, web browsers cannot directly probe the host computer's
            hardware (CPU clock cycles, NVMe disk sectors, physical RAM pages, or battery sensors).
            Hardware telemetry requires the authenticated local Python companion server.
          </p>
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-cyan-300 flex items-center gap-2">
            <Terminal size={14} className="text-slate-400" />
            <span>uv run python src/companion_server.py</span>
          </div>
        </div>
      )}

      {/* Main Gauges Grid (shown when real metrics are active) */}
      {metrics && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="rounded-2xl glass-panel border border-cyan-500/30 flex flex-col items-center justify-center p-2">
              <GaugeChart
                value={metrics.cpu.usage}
                title="CPU Usage"
                subtitle={`${metrics.cpu.logical_processors} Logical Processors`}
                color="cyan"
              />
            </div>

            <div className="rounded-2xl glass-panel border border-blue-500/30 flex flex-col items-center justify-center p-2">
              <GaugeChart
                value={metrics.memory.usage_percent}
                title="RAM Consumption"
                subtitle={`${metrics.memory.used_gb} / ${metrics.memory.total_gb} GB Used`}
                color="blue"
              />
            </div>

            <div className="rounded-2xl glass-panel border border-violet-500/30 flex flex-col items-center justify-center p-2">
              <GaugeChart
                value={metrics.disk.usage_percent}
                title="Drive (C:) Disk"
                subtitle={`${metrics.disk.free_gb} GB Free`}
                color="violet"
              />
            </div>

            <div className="rounded-2xl glass-panel border border-emerald-500/30 flex flex-col items-center justify-center p-2">
              <GaugeChart
                value={metrics.battery.percentage ?? 100}
                title="Power Cell"
                subtitle={metrics.battery.status}
                color={metrics.battery.percentage && metrics.battery.percentage < 25 ? 'amber' : 'emerald'}
              />
            </div>
          </div>

          {/* Detailed Diagnostic Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <MetricCard
              title="Host Processor Architecture"
              value={metrics.cpu.processor}
              subtitle={`Hardware Threads: ${metrics.cpu.logical_processors} // Physical Cores: ${metrics.cpu.cores}`}
              icon={<Cpu size={20} />}
              color="cyan"
            />

            <MetricCard
              title="Physical Memory Bank"
              value={`${metrics.memory.available_gb} GB Available`}
              subtitle={`Total Capacity: ${metrics.memory.total_gb} GB DDR5`}
              percent={metrics.memory.usage_percent}
              icon={<Activity size={20} />}
              color="blue"
            />

            <MetricCard
              title="Solid State Storage (C:)"
              value={`${metrics.disk.used_gb} GB / ${metrics.disk.total_gb} GB`}
              subtitle={`NVMe Storage (${metrics.disk.free_gb} GB Free)`}
              percent={metrics.disk.usage_percent}
              icon={<HardDrive size={20} />}
              color="violet"
            />
          </div>

          {/* Operating System & Power Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* System & OS Info */}
            <div className="p-5 rounded-2xl glass-panel border border-slate-700/60 space-y-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-100 light:text-slate-900">
                <Laptop size={18} className="text-cyan-400" /> Host Machine Profile
              </div>
              <div className="grid grid-cols-2 gap-3 text-xs font-mono pt-1">
                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                  <span className="text-slate-400">OPERATING SYSTEM</span>
                  <p className="text-sm font-bold text-slate-200 mt-1">
                    {metrics.os.platform} {metrics.os.release}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                  <span className="text-slate-400">ARCHITECTURE</span>
                  <p className="text-sm font-bold text-slate-200 mt-1">{metrics.os.arch}</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                  <span className="text-slate-400">HOST IDENTIFIER</span>
                  <p className="text-sm font-bold text-cyan-300 mt-1">{metrics.os.hostname}</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                  <span className="text-slate-400">TELEMETRY SYNC</span>
                  <p className="text-sm font-bold text-emerald-400 mt-1">STREAMING (3s)</p>
                </div>
              </div>
            </div>

            {/* Battery & Power Status */}
            <div className="p-5 rounded-2xl glass-panel border border-slate-700/60 space-y-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-100 light:text-slate-900">
                {metrics.battery.plugged_in ? (
                  <BatteryCharging size={18} className="text-emerald-400" />
                ) : (
                  <Battery size={18} className="text-cyan-400" />
                )}
                Energy & Power Management
              </div>

              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-400">BATTERY CHARGE</span>
                  <span className="text-emerald-400 font-bold text-base">
                    {metrics.battery.percentage ?? 'N/A'}%
                  </span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-teal-500 to-emerald-400 transition-all duration-500"
                    style={{ width: `${metrics.battery.percentage ?? 100}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-xs font-mono text-slate-400 pt-1">
                  <span>STATUS: {metrics.battery.status}</span>
                  <span className="text-cyan-400">
                    {metrics.battery.plugged_in ? 'AC ADAPTER CONNECTED' : 'BATTERY DISCHARGING'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Safety Notice Card */}
      <div className="p-4 rounded-2xl glass-panel border border-blue-500/30 flex items-start gap-3 text-xs text-slate-300">
        <ShieldCheck size={20} className="text-cyan-400 flex-shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-slate-200">
            Protected Diagnostic Mode:
          </span>{' '}
          In accordance with security requirements, J.A.R.V.I.S. operates in read-only telemetry
          monitoring mode. No arbitrary OS process modification or destructive system privileges
          are exposed to the web client.
        </div>
      </div>
    </div>
  );
};
