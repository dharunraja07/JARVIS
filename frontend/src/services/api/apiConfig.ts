export function getApiBaseUrl(): string {
  // 1. Check user preference from storage (manual override)
  try {
    const prefs = localStorage.getItem('jarvis-preferences');
    if (prefs) {
      const parsed = JSON.parse(prefs);
      if (parsed.companionApiUrl && parsed.companionApiUrl.trim()) {
        return parsed.companionApiUrl.trim();
      }
    }
  } catch {
    // ignore
  }

  // 2. Check Vite build-time environment variable (e.g. Vercel deployment)
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl && envUrl.trim()) {
    return envUrl.trim().replace(/\/+$/, '');
  }

  // 3. Dynamic origin detection for LAN mobile testing (e.g. http://192.168.x.x:5173 -> http://192.168.x.x:8000)
  if (typeof window !== 'undefined' && window.location) {
    const hostname = window.location.hostname;
    const protocol = window.location.protocol;
    if (hostname && hostname !== 'localhost' && hostname !== '127.0.0.1') {
      return `${protocol}//${hostname}:8000`;
    }
  }

  return 'http://127.0.0.1:8000';
}

export function getClientDeviceType(): 'windows' | 'android' | 'ios' | 'web' {
  if (typeof navigator === 'undefined') return 'web';
  const ua = navigator.userAgent.toLowerCase();
  if (ua.includes('android')) return 'android';
  if (ua.includes('iphone') || ua.includes('ipad')) return 'ios';
  if (ua.includes('windows') || ua.includes('win32') || ua.includes('win64')) return 'windows';
  return 'web';
}
