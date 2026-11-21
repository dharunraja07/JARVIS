import React, { useState } from 'react';
import { Send, Trash2, Mic, MicOff } from 'lucide-react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';

interface ChatInputProps {
  onSendMessage: (text: string) => void;
  onClearChat: () => void;
  isListening: boolean;
  onToggleMic: () => void;
  disabled?: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  onClearChat,
  isListening,
  onToggleMic,
  disabled = false,
}) => {
  const [text, setText] = useState('');
  const [isConfirmClearOpen, setIsConfirmClearOpen] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim() && !disabled) {
      onSendMessage(text);
      setText('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <>
      <div className="p-4 border-t border-blue-500/20 glass-panel">
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto flex items-end gap-3">
          {/* Clear conversation trigger */}
          <button
            type="button"
            onClick={() => setIsConfirmClearOpen(true)}
            className="p-3 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-slate-800/60 light:hover:bg-slate-200 transition-colors flex-shrink-0"
            title="Clear conversation history"
          >
            <Trash2 size={18} />
          </button>

          {/* Voice Input Toggle */}
          <button
            type="button"
            onClick={onToggleMic}
            className={`p-3 rounded-xl transition-all flex-shrink-0 ${
              isListening
                ? 'bg-gradient-to-r from-cyan-400 to-blue-500 text-white shadow-[0_0_15px_rgba(34,211,238,0.5)]'
                : 'text-slate-400 hover:text-cyan-400 hover:bg-slate-800/60 light:hover:bg-slate-200'
            }`}
            title={isListening ? 'Stop listening' : 'Start voice input'}
          >
            {isListening ? <Mic size={18} className="animate-pulse" /> : <MicOff size={18} />}
          </button>

          {/* Text input area */}
          <div className="relative flex-1">
            <textarea
              rows={1}
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask JARVIS anything (e.g. explain transformers, check weather, debug code)..."
              disabled={disabled}
              className="w-full resize-none py-3 px-4 rounded-xl glass-panel border border-cyan-500/30 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/30 text-sm text-slate-100 placeholder-slate-400 max-h-32"
            />
          </div>

          {/* Send button */}
          <button
            type="submit"
            disabled={!text.trim() || disabled}
            className="p-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white disabled:opacity-40 disabled:hover:bg-blue-600 transition-all shadow-md shadow-blue-600/30 flex-shrink-0"
            title="Send Message"
          >
            <Send size={18} />
          </button>
        </form>
      </div>

      {/* Confirmation Modal */}
      <Modal
        isOpen={isConfirmClearOpen}
        onClose={() => setIsConfirmClearOpen(false)}
        title="Clear Conversation Transcript"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-300 light:text-slate-600">
            Are you sure you want to purge the current active conversation transcript? This action
            cannot be undone.
          </p>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => setIsConfirmClearOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                onClearChat();
                setIsConfirmClearOpen(false);
              }}
            >
              Clear Conversation
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};
