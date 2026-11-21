import React, { useState } from 'react';
import type { ChatMessage } from '../../types';
import { Bot, User, Copy, Check, Terminal } from 'lucide-react';

interface MessageBubbleProps {
  message: ChatMessage;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const [copied, setCopied] = useState(false);
  const isJarvis = message.sender === 'jarvis';

  const handleCopy = () => {
    navigator.clipboard.writeText(message.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Detect code blocks (wrapped in ```)
  const renderMessageContent = (content: string) => {
    const parts = content.split(/(```[\s\S]*?```)/g);

    return parts.map((part, index) => {
      if (part.startsWith('```') && part.endsWith('```')) {
        const code = part.slice(3, -3).replace(/^[a-z]+\n/, '');
        return (
          <div
            key={index}
            className="my-3 rounded-xl overflow-hidden border border-slate-700 bg-slate-950 font-mono text-xs"
          >
            <div className="flex items-center justify-between px-3 py-1.5 bg-slate-900 border-b border-slate-800 text-slate-400">
              <span className="flex items-center gap-1.5">
                <Terminal size={12} className="text-cyan-400" /> CODE SNIPPET
              </span>
              <button
                onClick={() => navigator.clipboard.writeText(code)}
                className="hover:text-cyan-400 transition-colors"
                title="Copy code"
              >
                Copy
              </button>
            </div>
            <pre className="p-3 text-cyan-200 overflow-x-auto leading-relaxed">
              <code>{code}</code>
            </pre>
          </div>
        );
      }
      return (
        <span key={index} className="whitespace-pre-wrap leading-relaxed">
          {part}
        </span>
      );
    });
  };

  return (
    <div
      className={`flex gap-3 text-sm group ${
        isJarvis ? 'justify-start' : 'justify-end'
      }`}
    >
      {isJarvis && (
        <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 bg-blue-600/20 text-cyan-400 border border-cyan-400/30 shadow-[0_0_10px_rgba(34,211,238,0.2)]">
          <Bot size={18} />
        </div>
      )}

      <div
        className={`relative max-w-2xl rounded-2xl p-4 transition-all shadow-sm ${
          isJarvis
            ? 'glass-panel border-cyan-500/20 text-slate-200 light:text-slate-800 rounded-tl-sm'
            : 'bg-blue-600 text-white rounded-tr-sm shadow-md shadow-blue-600/20'
        }`}
      >
        <div className="flex items-center justify-between gap-4 pb-1 text-[11px] font-mono opacity-60">
          <span>{isJarvis ? 'J.A.R.V.I.S.' : 'YOU'}</span>
          <span>{message.timestamp}</span>
        </div>

        <div className="text-sm font-normal">
          {renderMessageContent(message.text)}
        </div>

        {/* Copy button on hover */}
        <button
          onClick={handleCopy}
          className="absolute top-2 right-2 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800/80 hover:bg-slate-700 text-slate-300"
          title="Copy message text"
        >
          {copied ? (
            <Check size={13} className="text-emerald-400" />
          ) : (
            <Copy size={13} />
          )}
        </button>
      </div>

      {!isJarvis && (
        <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 bg-slate-800 text-slate-300 border border-slate-700">
          <User size={18} />
        </div>
      )}
    </div>
  );
};
