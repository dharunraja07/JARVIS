import React, { useState } from 'react';
import type { MemoryItem } from '../../types';
import { Badge } from '../common/Badge';
import { Trash2, Clock } from 'lucide-react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { formatRelativeTime } from '../../utils/formatters';

interface MemoryCardProps {
  memory: MemoryItem;
  onDelete: (id: number) => void;
}

export const MemoryCard: React.FC<MemoryCardProps> = ({ memory, onDelete }) => {
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const getCategoryColor = (cat: string) => {
    switch (cat.toLowerCase()) {
      case 'education':
        return 'cyan';
      case 'career':
        return 'emerald';
      case 'projects':
        return 'blue';
      case 'preferences':
        return 'violet';
      default:
        return 'slate';
    }
  };

  return (
    <>
      <div className="group relative p-4 rounded-2xl glass-panel border border-blue-500/20 hover:border-cyan-400/40 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/10 flex flex-col justify-between">
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <Badge variant={getCategoryColor(memory.category) as any} size="sm">
              {memory.category}
            </Badge>

            <button
              onClick={() => setIsConfirmOpen(true)}
              className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800/80 transition-all"
              title="Delete memory"
            >
              <Trash2 size={14} />
            </button>
          </div>

          <p className="text-sm text-slate-200 light:text-slate-800 leading-relaxed font-normal">
            {memory.content}
          </p>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-800/60 light:border-slate-300/60 flex items-center justify-between text-[11px] font-mono text-slate-400">
          <span className="flex items-center gap-1">
            <Clock size={11} /> {formatRelativeTime(memory.created_at)}
          </span>
          <span className="text-slate-500 font-mono">ID: #{memory.id}</span>
        </div>
      </div>

      <Modal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        title="Delete Memory Record"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-300 light:text-slate-600">
            Are you sure you want to permanently erase this memory from JARVIS's persistent neural index?
          </p>
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-cyan-300">
            "{memory.content}"
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => setIsConfirmOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                onDelete(memory.id);
                setIsConfirmOpen(false);
              }}
            >
              Erase Memory
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};
