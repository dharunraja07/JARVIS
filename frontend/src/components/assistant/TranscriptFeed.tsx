import React, { useEffect, useRef } from 'react';
import type { ChatMessage } from '../../types';
import { Bot, User } from 'lucide-react';

interface TranscriptFeedProps {
  messages: ChatMessage[];
  currentTranscript?: string;
}

export const TranscriptFeed: React.FC<TranscriptFeedProps> = ({
  messages,
  currentTranscript,
}) => {
  const feedEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    feedEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, currentTranscript]);

  if (messages.length === 0 && !currentTranscript) {
    return null;
  }

  // Show only the latest 4 turns on the home screen to keep the holographic core prominent
  const recentMessages = messages.slice(-4);

  return (
    <div className="w-full max-w-2xl mx-auto space-y-3 px-4">
      {recentMessages.map((msg) => (
        <div
          key={msg.id}
          className={`flex gap-3 text-sm p-3.5 rounded-2xl glass-panel border transition-all animate-in fade-in duration-300 ${
            msg.sender === 'user'
              ? 'border-blue-500/30 bg-blue-950/20 ml-6'
              : 'border-cyan-500/30 bg-slate-900/40 mr-6 shadow-sm'
          }`}
        >
          <div
            className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${
              msg.sender === 'user'
                ? 'bg-blue-600/30 text-blue-400 border border-blue-500/40'
                : 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 shadow-[0_0_8px_rgba(34,211,238,0.3)]'
            }`}
          >
            {msg.sender === 'user' ? <User size={15} /> : <Bot size={15} />}
          </div>

          <div className="flex-1 space-y-1">
            <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
              <span className="font-semibold text-slate-300">
                {msg.sender === 'user' ? 'USER' : 'J.A.R.V.I.S.'}
              </span>
              <span>{msg.timestamp}</span>
            </div>
            <p className="text-slate-200 light:text-slate-800 leading-relaxed text-sm">
              {msg.text}
            </p>
          </div>
        </div>
      ))}

      {/* Active in-flight speech transcription */}
      {currentTranscript && (
        <div className="flex gap-3 text-sm p-3.5 rounded-2xl glass-panel border border-emerald-500/40 bg-emerald-950/20 ml-6 animate-pulse">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 bg-emerald-500/30 text-emerald-300 border border-emerald-400/50">
            <User size={15} />
          </div>
          <div className="flex-1 space-y-1">
            <div className="text-[11px] font-mono text-emerald-400 font-semibold flex items-center gap-1.5">
              <span>LIVE AUDIO TRANSCRIPTION</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            </div>
            <p className="text-slate-200 italic">{currentTranscript} ...</p>
          </div>
        </div>
      )}

      <div ref={feedEndRef} />
    </div>
  );
};
