import React from 'react';
import { useVoiceSession } from '../hooks/useVoiceSession';
import { useJarvisStore } from '../store/useJarvisStore';
import { HolographicCore } from '../components/hologram/HolographicCore';
import { WaveformVisualizer } from '../components/hologram/WaveformVisualizer';
import { VoiceControls } from '../components/assistant/VoiceControls';
import { TranscriptFeed } from '../components/assistant/TranscriptFeed';
import { Activity, Cpu } from 'lucide-react';
import { Badge } from '../components/common/Badge';

export const Home: React.FC = () => {
  const {
    assistantState,
    audioLevel,
    currentTranscript,
    isListening,
    toggleMic,
    sendTextMessage,
  } = useVoiceSession();

  const { messages, systemMetrics } = useJarvisStore();

  return (
    <div className="min-h-full py-6 md:py-8 flex flex-col justify-between items-center relative space-y-8">
      {/* Background Subtle Tech Grid & Radial Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-20 pointer-events-none" />

      {/* Top Floating Telemetry Pills */}
      <div className="w-full max-w-4xl mx-auto px-4 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
        <div className="flex items-center gap-2">
          <Badge variant="cyan" pulse size="sm">
            AI CORE ACTIVE
          </Badge>
          <span className="text-slate-400 hidden sm:inline">
            // RUNNING GEMMA-31B + GEMINI-TTS
          </span>
        </div>

        <div className="flex items-center gap-4 text-slate-400">
          <span className="flex items-center gap-1.5">
            <Cpu size={13} className={systemMetrics ? 'text-cyan-400' : 'text-slate-600'} />{' '}
            CPU: {systemMetrics ? `${systemMetrics.cpu.usage}%` : 'OFFLINE'}
          </span>
          <span className="flex items-center gap-1.5">
            <Activity size={13} className={systemMetrics ? 'text-emerald-400' : 'text-slate-600'} />{' '}
            MEM: {systemMetrics ? `${systemMetrics.memory.used_gb} GB` : 'OFFLINE'}
          </span>
        </div>
      </div>

      {/* Holographic Centerpiece */}
      <div className="flex flex-col items-center justify-center my-2 relative z-10">
        <HolographicCore state={assistantState} audioLevel={audioLevel} size={280} />

        {/* Dynamic Waveform Visualizer */}
        <div className="mt-4 w-full max-w-md">
          <WaveformVisualizer state={assistantState} audioLevel={audioLevel} barsCount={32} />
        </div>
      </div>

      {/* Live Transcript Stream */}
      <div className="w-full relative z-10">
        <TranscriptFeed messages={messages} currentTranscript={currentTranscript} />
      </div>

      {/* Futuristic Interaction Console */}
      <div className="w-full relative z-10 pt-2">
        <VoiceControls
          state={assistantState}
          isListening={isListening}
          onToggleMic={toggleMic}
          onSendMessage={sendTextMessage}
        />
      </div>
    </div>
  );
};
