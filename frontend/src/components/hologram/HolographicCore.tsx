import React, { useMemo } from 'react';
import type { AssistantState } from '../../types';

interface HolographicCoreProps {
  state: AssistantState;
  audioLevel?: number;
  size?: number;
}

export const HolographicCore: React.FC<HolographicCoreProps> = ({
  state,
  audioLevel = 0,
  size = 320,
}) => {
  // Compute reactive dynamic parameters based on state and live audio level
  const audioFactor = Math.min(1.4, 1 + audioLevel * 0.8);

  const stateColors = useMemo(() => {
    switch (state) {
      case 'listening':
        return {
          primary: '#22D3EE', // Cyan
          secondary: '#3B82F6', // Blue
          glow: 'rgba(34, 211, 238, 0.65)',
          spinSpeed: '12s',
          reverseSpeed: '8s',
          label: 'LISTENING // AUDIO DETECTED',
        };
      case 'processing':
        return {
          primary: '#A855F7', // Violet
          secondary: '#22D3EE', // Cyan
          glow: 'rgba(168, 85, 247, 0.65)',
          spinSpeed: '4s',
          reverseSpeed: '3s',
          label: 'NEURAL COMPUTE // GEMMA-31B',
        };
      case 'speaking':
        return {
          primary: '#38BDF8', // Light Sky Blue
          secondary: '#60A5FA', // Blue
          glow: 'rgba(56, 189, 248, 0.8)',
          spinSpeed: '10s',
          reverseSpeed: '7s',
          label: 'VOCALIZING // GEMINI-TTS',
        };
      case 'connecting':
        return {
          primary: '#F59E0B', // Amber
          secondary: '#3B82F6',
          glow: 'rgba(245, 158, 11, 0.6)',
          spinSpeed: '6s',
          reverseSpeed: '4s',
          label: 'ESTABLISHING WEBRTC MESH',
        };
      case 'error':
        return {
          primary: '#F43F5E', // Rose
          secondary: '#FB7185',
          glow: 'rgba(244, 63, 94, 0.7)',
          spinSpeed: '30s',
          reverseSpeed: '25s',
          label: 'SUBSYSTEM EXCEPTION',
        };
      case 'disconnected':
        return {
          primary: '#64748B', // Slate
          secondary: '#475569',
          glow: 'rgba(100, 116, 139, 0.3)',
          spinSpeed: '40s',
          reverseSpeed: '35s',
          label: 'STANDBY // OFFLINE',
        };
      case 'idle':
      default:
        return {
          primary: '#22D3EE', // Cyan
          secondary: '#3B82F6', // Electric Blue
          glow: 'rgba(34, 211, 238, 0.35)',
          spinSpeed: '20s',
          reverseSpeed: '16s',
          label: 'JARVIS ONLINE // READY',
        };
    }
  }, [state]);

  return (
    <div className="relative flex flex-col items-center justify-center select-none">
      {/* Outer Glow Halo */}
      <div
        className="absolute rounded-full transition-all duration-700 pointer-events-none"
        style={{
          width: size * 1.35 * audioFactor,
          height: size * 1.35 * audioFactor,
          background: `radial-gradient(circle, ${stateColors.glow} 0%, rgba(7, 11, 20, 0) 70%)`,
          filter: 'blur(30px)',
        }}
      />

      {/* Futuristic SVG Holographic Rings */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 320 320"
        className="relative transition-transform duration-300"
        style={{
          transform: `scale(${audioFactor})`,
        }}
      >
        <defs>
          <radialGradient id="holoCoreGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.9" />
            <stop offset="35%" stopColor={stateColors.primary} stopOpacity="0.8" />
            <stop offset="70%" stopColor={stateColors.secondary} stopOpacity="0.4" />
            <stop offset="100%" stopColor="#070B14" stopOpacity="0" />
          </radialGradient>

          <filter id="holoGlow">
            <feGaussianBlur stdDeviation="3.5" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Outer Ring 1: Arc segments (Spin clockwise) */}
        <g
          className="origin-center"
          style={{
            animation: `spin-slow ${stateColors.spinSpeed} linear infinite`,
          }}
        >
          <circle
            cx="160"
            cy="160"
            r="150"
            fill="none"
            stroke={stateColors.primary}
            strokeWidth="1.5"
            strokeDasharray="4 8 20 8 60 12"
            strokeOpacity="0.5"
          />
          {/* Outer tech brackets */}
          <path
            d="M 160 8 A 152 152 0 0 1 267 53"
            fill="none"
            stroke={stateColors.primary}
            strokeWidth="3"
            filter="url(#holoGlow)"
          />
          <path
            d="M 160 312 A 152 152 0 0 1 53 267"
            fill="none"
            stroke={stateColors.secondary}
            strokeWidth="3"
            filter="url(#holoGlow)"
          />
        </g>

        {/* Outer Ring 2: Ticks and Compass Marks (Spin counter-clockwise) */}
        <g
          className="origin-center"
          style={{
            animation: `spin-reverse ${stateColors.reverseSpeed} linear infinite`,
          }}
        >
          <circle
            cx="160"
            cy="160"
            r="134"
            fill="none"
            stroke={stateColors.secondary}
            strokeWidth="1.2"
            strokeDasharray="2 6"
            strokeOpacity="0.6"
          />
          <circle
            cx="160"
            cy="160"
            r="120"
            fill="none"
            stroke={stateColors.primary}
            strokeWidth="1"
            strokeDasharray="40 20 10 20"
            strokeOpacity="0.4"
          />
          {/* Diagonal cross ticks */}
          <line x1="75" y1="75" x2="85" y2="85" stroke={stateColors.primary} strokeWidth="2" />
          <line x1="245" y1="75" x2="235" y2="85" stroke={stateColors.primary} strokeWidth="2" />
          <line x1="75" y1="245" x2="85" y2="235" stroke={stateColors.primary} strokeWidth="2" />
          <line x1="245" y1="245" x2="235" y2="235" stroke={stateColors.primary} strokeWidth="2" />
        </g>

        {/* Mid Gyro Ring 3: Segmented Tech Ring */}
        <g
          className="origin-center"
          style={{
            animation: `spin-slow ${stateColors.spinSpeed} linear infinite`,
          }}
        >
          <circle
            cx="160"
            cy="160"
            r="96"
            fill="none"
            stroke={stateColors.primary}
            strokeWidth="2"
            strokeDasharray="16 12 4 12"
            filter="url(#holoGlow)"
            strokeOpacity="0.75"
          />
          <circle
            cx="160"
            cy="160"
            r="82"
            fill="none"
            stroke={stateColors.secondary}
            strokeWidth="1.2"
            strokeDasharray="6 6"
            strokeOpacity="0.5"
          />
        </g>

        {/* Inner Reactor Ring 4 (Reverses) */}
        <g
          className="origin-center"
          style={{
            animation: `spin-reverse ${stateColors.reverseSpeed} linear infinite`,
          }}
        >
          <circle
            cx="160"
            cy="160"
            r="64"
            fill="none"
            stroke={stateColors.primary}
            strokeWidth="2"
            strokeDasharray="28 8"
            strokeOpacity="0.8"
            filter="url(#holoGlow)"
          />
        </g>

        {/* Central Luminous Hologram Core */}
        <circle
          cx="160"
          cy="160"
          r="48"
          fill="url(#holoCoreGrad)"
          className="animate-pulse-glow"
        />

        {/* Inner Focal Point */}
        <circle
          cx="160"
          cy="160"
          r={12 + audioLevel * 14}
          fill="#FFFFFF"
          filter="url(#holoGlow)"
          className="transition-all duration-100"
        />

        {/* Center reticle crosshair */}
        <line x1="160" y1="145" x2="160" y2="152" stroke="#FFFFFF" strokeWidth="1.5" />
        <line x1="160" y1="168" x2="160" y2="175" stroke="#FFFFFF" strokeWidth="1.5" />
        <line x1="145" y1="160" x2="152" y2="160" stroke="#FFFFFF" strokeWidth="1.5" />
        <line x1="168" y1="160" x2="175" y2="160" stroke="#FFFFFF" strokeWidth="1.5" />
      </svg>

      {/* Sci-Fi Status Subtitle */}
      <div className="mt-4 flex flex-col items-center">
        <span className="font-mono text-[11px] tracking-widest text-cyan-300 font-semibold uppercase flex items-center gap-2">
          <span
            className="w-1.5 h-1.5 rounded-full animate-ping"
            style={{ backgroundColor: stateColors.primary }}
          />
          {stateColors.label}
        </span>
      </div>
    </div>
  );
};
