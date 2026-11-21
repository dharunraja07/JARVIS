import React, { useState } from 'react';
import { Mic, MicOff, Send, CloudSun, Cpu, Newspaper, BookmarkPlus } from 'lucide-react';
import type { AssistantState } from '../../types';

interface VoiceControlsProps {
  state: AssistantState;
  isListening: boolean;
  onToggleMic: () => void;
  onSendMessage: (text: string) => void;
}

export const VoiceControls: React.FC<VoiceControlsProps> = ({
  state,
  isListening,
  onToggleMic,
  onSendMessage,
}) => {
  const [inputText, setInputText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputText.trim()) {
      onSendMessage(inputText);
      setInputText('');
    }
  };

  const quickPrompts = [
    { text: "What's the weather like?", icon: <CloudSun size={13} />, label: 'Weather Scan' },
    { text: 'Run system diagnostic', icon: <Cpu size={13} />, label: 'PC Diagnostics' },
    { text: 'Give me the latest technology news', icon: <Newspaper size={13} />, label: 'Tech News' },
    { text: 'Remember that I am learning LiveKit Agents', icon: <BookmarkPlus size={13} />, label: 'Log Memory' },
  ];

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col items-center gap-5 px-4">
      {/* Central Holographic Mic Button */}
      <div className="relative flex items-center justify-center">
        {/* Pulsing ring waves when listening */}
        {isListening && (
          <>
            <span className="absolute w-24 h-24 rounded-full border border-cyan-400 animate-ping opacity-60 pointer-events-none" />
            <span className="absolute w-32 h-32 rounded-full border border-blue-500 animate-pulse opacity-40 pointer-events-none" />
          </>
        )}

        <button
          onClick={onToggleMic}
          className={`relative z-10 w-18 h-18 rounded-full flex items-center justify-center transition-all duration-300 transform active:scale-95 shadow-xl ${
            isListening
              ? 'bg-gradient-to-tr from-cyan-400 to-blue-500 text-white shadow-[0_0_30px_rgba(34,211,238,0.7)] border-2 border-white'
              : 'bg-slate-800/90 text-slate-300 hover:text-white hover:bg-slate-700/90 border border-cyan-500/30 shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:shadow-[0_0_25px_rgba(34,211,238,0.5)]'
          }`}
          title={isListening ? 'Stop listening' : 'Start voice conversation'}
          aria-label={isListening ? 'Mute Microphone' : 'Activate Voice'}
        >
          {isListening ? (
            <Mic size={30} className="animate-pulse" />
          ) : (
            <MicOff size={28} className="text-slate-400 group-hover:text-cyan-400" />
          )}
        </button>
      </div>

      <div className="text-center">
        <p className="text-xs font-mono tracking-wider text-slate-400 uppercase">
          {isListening
            ? 'LISTENING... SPEAK YOUR QUERY'
            : state === 'speaking'
            ? 'JARVIS IS RESPONDING...'
            : state === 'processing'
            ? 'PROCESSING NEURAL INFERENCE...'
            : 'CLICK MICROPHONE OR TYPE TO INTERACT'}
        </p>
      </div>

      {/* Text Command Input Bar */}
      <form onSubmit={handleSubmit} className="w-full relative flex items-center">
        <div className="relative w-full flex items-center">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Direct command / query for J.A.R.V.I.S..."
            className="w-full pl-5 pr-14 py-3.5 rounded-2xl glass-panel border border-cyan-500/30 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/30 text-sm text-slate-100 placeholder-slate-400 transition-all shadow-lg"
          />
          <button
            type="submit"
            disabled={!inputText.trim()}
            className="absolute right-2 p-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white disabled:opacity-40 disabled:hover:bg-blue-600 transition-all shadow-md shadow-blue-600/30"
            title="Send command"
          >
            <Send size={16} />
          </button>
        </div>
      </form>

      {/* Sci-Fi Quick Chips */}
      <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
        {quickPrompts.map((chip, idx) => (
          <button
            key={idx}
            onClick={() => onSendMessage(chip.text)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono text-slate-300 hover:text-cyan-300 bg-slate-900/50 hover:bg-blue-900/30 border border-slate-700/50 hover:border-cyan-500/40 transition-all cursor-pointer shadow-sm"
          >
            <span className="text-cyan-400">{chip.icon}</span>
            <span>{chip.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
