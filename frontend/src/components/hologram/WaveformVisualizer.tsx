import React, { useEffect, useState } from 'react';
import type { AssistantState } from '../../types';

interface WaveformVisualizerProps {
  state: AssistantState;
  audioLevel?: number;
  barsCount?: number;
}

export const WaveformVisualizer: React.FC<WaveformVisualizerProps> = ({
  state,
  audioLevel = 0,
  barsCount = 28,
}) => {
  const [randomFreqs, setRandomFreqs] = useState<number[]>(
    new Array(barsCount).fill(0.1)
  );

  useEffect(() => {
    const isActive = state === 'listening' || state === 'speaking';
    if (!isActive) {
      return;
    }

    const interval = setInterval(() => {
      setRandomFreqs(
        Array.from({ length: barsCount }, (_, i) => {
          // Bell curve multiplier so middle bars are taller
          const centerDist = Math.abs(i - barsCount / 2) / (barsCount / 2);
          const bell = Math.cos(centerDist * (Math.PI / 2.2));
          const noise = 0.2 + Math.random() * 0.8;
          const amp = Math.max(0.15, audioLevel > 0 ? audioLevel : 0.4);
          return Math.min(1, Math.max(0.08, bell * noise * amp));
        })
      );
    }, 80);

    return () => clearInterval(interval);
  }, [state, audioLevel, barsCount]);

  const getBarColor = () => {
    if (state === 'speaking') return 'from-cyan-400 via-sky-400 to-blue-500';
    if (state === 'listening') return 'from-emerald-400 via-cyan-400 to-blue-500';
    if (state === 'processing') return 'from-violet-500 via-fuchsia-400 to-cyan-400';
    if (state === 'error') return 'from-rose-500 to-amber-500';
    return 'from-blue-600/60 to-cyan-500/60';
  };

  return (
    <div className="flex items-center justify-center gap-1.5 h-12 px-4 py-2 select-none">
      {randomFreqs.map((height, i) => (
        <div
          key={i}
          className="w-1 md:w-1.5 rounded-full transition-all duration-100 bg-gradient-to-t"
          style={{
            height: `${Math.max(6, height * 42)}px`,
            opacity: state === 'idle' || state === 'disconnected' ? 0.35 : 0.9,
          }}
        >
          <div
            className={`w-full h-full rounded-full bg-gradient-to-t ${getBarColor()} shadow-[0_0_8px_rgba(34,211,238,0.3)]`}
          />
        </div>
      ))}
    </div>
  );
};
