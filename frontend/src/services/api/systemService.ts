import type { SystemMetrics } from '../../types';
import { getApiBaseUrl } from './apiConfig';

class SystemService {
  public getCompanionUrl(): string {
    return getApiBaseUrl();
  }

  public async fetchSystemMetrics(): Promise<{
    metrics: SystemMetrics | null;
    isLiveBackend: boolean;
    error?: string;
  }> {
    try {
      const response = await fetch(`${this.getCompanionUrl()}/api/system`, {
        signal: AbortSignal.timeout(3000),
      });
      if (response.ok) {
        const data = await response.json();
        // Check if the paired Windows device is online
        if (data.online === false) {
          return {
            metrics: null,
            isLiveBackend: false,
            error: data.message || 'Paired Windows workstation is offline or sleeping.',
          };
        }
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
