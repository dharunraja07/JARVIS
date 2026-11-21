import React, { useState } from 'react';
import type { MemoryCategory } from '../../types';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';

interface AddMemoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (category: MemoryCategory, content: string) => void;
}

export const AddMemoryModal: React.FC<AddMemoryModalProps> = ({
  isOpen,
  onClose,
  onAdd,
}) => {
  const [category, setCategory] = useState<MemoryCategory>('Education');
  const [content, setContent] = useState('');

  const categories: MemoryCategory[] = [
    'Education',
    'Career',
    'Projects',
    'Preferences',
    'Personal',
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (content.trim()) {
      onAdd(category, content.trim());
      setContent('');
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Save to JARVIS Memory Bank">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-mono text-slate-400 mb-1.5 uppercase">
            Classification Category
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as MemoryCategory)}
            className="w-full py-2.5 px-3 rounded-xl glass-panel border border-cyan-500/30 text-sm text-slate-100 focus:outline-none focus:border-cyan-400 bg-slate-900"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-mono text-slate-400 mb-1.5 uppercase">
            Memory Content / Fact
          </label>
          <textarea
            rows={3}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="e.g. I am preparing for software engineering placement interviews in December..."
            className="w-full py-2.5 px-3 rounded-xl glass-panel border border-cyan-500/30 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400 resize-none"
            required
          />
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="glow" disabled={!content.trim()}>
            Index Memory
          </Button>
        </div>
      </form>
    </Modal>
  );
};
