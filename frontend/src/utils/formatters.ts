export function formatBytes(bytes: number, decimals: number = 2): string {
  if (bytes === 0) return '0 GB';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

export function formatTime(date: Date = new Date()): string {
  return date.toLocaleTimeString('en-US', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

export function formatDate(date: Date = new Date()): string {
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).toUpperCase();
}

export function formatRelativeTime(dateString: string): string {
  try {
    const date = new Date(dateString.replace(' ', 'T'));
    const now = new Date();
    const diffSec = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (isNaN(diffSec)) return dateString;
    if (diffSec < 60) return 'Just now';
    if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
    if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
    return `${Math.floor(diffSec / 86400)}d ago`;
  } catch {
    return dateString;
  }
}

export function getStatusColor(status: string): string {
  switch (status.toLowerCase()) {
    case 'online':
    case 'connected':
    case 'listening':
      return 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10';
    case 'processing':
    case 'thinking':
      return 'text-violet-400 border-violet-500/30 bg-violet-500/10';
    case 'speaking':
      return 'text-cyan-400 border-cyan-500/30 bg-cyan-500/10';
    case 'error':
      return 'text-rose-400 border-rose-500/30 bg-rose-500/10';
    case 'disconnected':
    case 'offline':
    default:
      return 'text-slate-400 border-slate-500/30 bg-slate-500/10';
  }
}
