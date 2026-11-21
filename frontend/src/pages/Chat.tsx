import React, { useEffect, useRef } from 'react';
import { useJarvisStore } from '../store/useJarvisStore';
import { useVoiceSession } from '../hooks/useVoiceSession';
import { MessageBubble } from '../components/chat/MessageBubble';
import { ChatInput } from '../components/chat/ChatInput';
import { Bot, MessageSquare } from 'lucide-react';

export const Chat: React.FC = () => {
  const { messages, clearMessages } = useJarvisStore();
  const {
    isListening,
    toggleMic,
    sendTextMessage,
    assistantState,
  } = useVoiceSession();

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, assistantState]);

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] max-w-5xl mx-auto w-full">
      {/* Top Header */}
      <div className="p-4 border-b border-blue-500/20 glass-panel flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-blue-600/20 text-cyan-400 border border-cyan-500/30">
            <MessageSquare size={18} />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-100 light:text-slate-900 tracking-wide">
              Neural Conversation Console
            </h2>
            <p className="text-xs font-mono text-slate-400">
              LIVE MULTI-TURN DIALOGUE // GEMMA-31B AGENT
            </p>
          </div>
        </div>

        <div className="text-xs font-mono text-slate-400">
          MESSAGES: <span className="text-cyan-400 font-semibold">{messages.length}</span>
        </div>
      </div>

      {/* Messages Scroll Viewport */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 custom-scroll">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center p-8 space-y-3">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-blue-600/20 text-cyan-400 border border-cyan-400/30">
              <Bot size={24} />
            </div>
            <h3 className="text-base font-semibold text-slate-200">Neural Conversation Ready</h3>
            <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
              Activate the microphone or send a command to start a dialogue with JARVIS.
              LiveKit audio transcription and assistant TTS speech will be rendered here.
            </p>
          </div>
        )}

        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}

        {/* Processing Indicator */}
        {assistantState === 'processing' && (
          <div className="flex items-center gap-3 text-sm p-4 rounded-2xl glass-panel border border-violet-500/30 max-w-xs animate-pulse">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-violet-600/30 text-violet-300">
              <Bot size={18} />
            </div>
            <div className="flex items-center gap-1.5 text-xs font-mono text-violet-300">
              <span>JARVIS is thinking</span>
              <span className="w-1 h-1 rounded-full bg-violet-400 animate-ping" />
              <span className="w-1 h-1 rounded-full bg-violet-400 animate-ping delay-100" />
              <span className="w-1 h-1 rounded-full bg-violet-400 animate-ping delay-200" />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Chat Input Console */}
      <ChatInput
        onSendMessage={sendTextMessage}
        onClearChat={clearMessages}
        isListening={isListening}
        onToggleMic={toggleMic}
        disabled={assistantState === 'processing'}
      />
    </div>
  );
};
