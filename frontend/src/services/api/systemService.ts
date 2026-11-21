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
    metrics: SystemMetrics | null;
    isLiveBackend: boolean;
    error?: string;
  }> {
    try {
      const response = await fetch(`${this.companionUrl}/api/system`, {
        signal: AbortSignal.timeout(3000),
      });
      if (response.ok) {
        const data = await response.json();
        return { metrics: data, isLiveBackend: true };
      }
    } catch {
      // Backend companion is not active
    }

    return {
      metrics: null,
      isLiveBackend: false,
      error: 'Host hardware monitor offline. Start JARVIS companion backend to stream telemetry.',
    };
  }
}

export const systemService = new SystemService();
