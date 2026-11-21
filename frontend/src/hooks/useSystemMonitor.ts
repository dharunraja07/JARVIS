import { useEffect, useState } from 'react';
import { useJarvisStore } from '../store/useJarvisStore';
import { systemService } from '../services/api/systemService';

export function useSystemMonitor(intervalMs: number = 4000) {
  const { systemMetrics, setSystemMetrics, isSystemMonitoring } = useJarvisStore();
  const [isLiveCompanion, setIsLiveCompanion] = useState(false);

  useEffect(() => {
    if (!isSystemMonitoring) return;

    let isMounted = true;

    const poll = async () => {
      const res = await systemService.fetchSystemMetrics();
      if (isMounted) {
        setSystemMetrics(res.metrics);
        setIsLiveCompanion(res.isLiveBackend);
      }
    };

    poll();
    const interval = setInterval(poll, intervalMs);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [isSystemMonitoring, intervalMs, setSystemMetrics]);

  return {
    metrics: systemMetrics,
    isLiveCompanion,
  };
}
