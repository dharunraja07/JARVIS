import type { SystemMetrics } from '../../types';

class SystemService {
  private companionUrl: string;

  constructor() {
    this.companionUrl = 'http://127.0.0.1:8000';
  }

  public setCompanionUrl(url: string) {
    this.companionUrl = url;
  }

  public async fetchSystemMetrics(): Promise<{
    metrics: SystemMetrics;
    isLiveBackend: boolean;
  }> {
    try {
      const response = await fetch(`${this.companionUrl}/api/system`, {
        signal: AbortSignal.timeout(1500),
      });
      if (response.ok) {
        const data = await response.json();
        return { metrics: data, isLiveBackend: true };
      }
    } catch {
      // Backend companion is not active
    }

    // Inspect browser environment for real available hardware stats
    const logicalCores = navigator.hardwareConcurrency || 8;
    const deviceMemoryGb = (navigator as unknown as { deviceMemory?: number }).deviceMemory || 16;

    // Synthesize realistic system diagnostic values based on system specs
    const baseCpu = 15 + Math.sin(Date.now() / 4000) * 8 + Math.random() * 4;
    const baseRamUsed = 6.8 + Math.sin(Date.now() / 10000) * 0.6;

    const metrics: SystemMetrics = {
      cpu: {
        processor: 'Intel(R) Core(TM) Processor // Windows 11 Host',
        usage: Math.round(baseCpu * 10) / 10,
        cores: Math.max(4, Math.floor(logicalCores / 2)),
        logical_processors: logicalCores,
      },
      memory: {
        total_gb: deviceMemoryGb,
        used_gb: Math.round(baseRamUsed * 10) / 10,
        available_gb: Math.round((deviceMemoryGb - baseRamUsed) * 10) / 10,
        usage_percent: Math.round((baseRamUsed / deviceMemoryGb) * 1000) / 10,
      },
      disk: {
        total_gb: 512.0,
        used_gb: 218.4,
        free_gb: 293.6,
        usage_percent: 42.6,
      },
      battery: {
        available: true,
        percentage: 84,
        plugged_in: true,
        status: 'AC Connected (Charging)',
        time_left_seconds: 9600,
      },
      os: {
        platform: 'Windows',
        release: 'Windows 11 NT 10.0',
        arch: 'x64',
        hostname: 'JARVIS-HOST',
      },
      timestamp: new Date().toISOString(),
    };

    return { metrics, isLiveBackend: false };
  }
}

export const systemService = new SystemService();
