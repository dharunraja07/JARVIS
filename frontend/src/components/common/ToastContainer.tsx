import React from 'react';
import { useJarvisStore } from '../../store/useJarvisStore';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useJarvisStore();

  if (toasts.length === 0) return null;

  const icons = {
    info: <Info size={18} className="text-cyan-400" />,
    success: <CheckCircle2 size={18} className="text-emerald-400" />,
    warning: <AlertTriangle size={18} className="text-amber-400" />,
    error: <AlertCircle size={18} className="text-rose-400" />,
  };

  const borders = {
    info: 'border-cyan-500/40 shadow-cyan-500/10',
    success: 'border-emerald-500/40 shadow-emerald-500/10',
    warning: 'border-amber-500/40 shadow-amber-500/10',
    error: 'border-rose-500/40 shadow-rose-500/10',
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto flex items-center justify-between gap-3 p-3.5 rounded-xl glass-panel border ${borders[toast.type]} shadow-lg transition-all animate-in slide-in-from-bottom-3 duration-300`}
        >
          <div className="flex items-center gap-2.5 text-sm text-slate-200 light:text-slate-800">
            {icons[toast.type]}
            <span className="font-medium">{toast.message}</span>
          </div>
          <button
            onClick={() => removeToast(toast.id)}
            className="text-slate-400 hover:text-white p-1 rounded transition-colors"
          >
            <X size={15} />
          </button>
        </div>
      ))}
    </div>
  );
};
