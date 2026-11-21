import React, { useMemo, useState } from 'react';
import { useJarvisStore } from '../store/useJarvisStore';
import type { MemoryCategory } from '../types';
import { MemoryCard } from '../components/memory/MemoryCard';
import { MemoryStats } from '../components/memory/MemoryStats';
import { AddMemoryModal } from '../components/memory/AddMemoryModal';
import { Brain, Plus, Search } from 'lucide-react';
import { Button } from '../components/common/Button';

export const Memory: React.FC = () => {
  const { memories, addMemory, deleteMemory, showToast } = useJarvisStore();
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const categories = ['All', 'Education', 'Career', 'Projects', 'Preferences', 'Personal'];

  const filteredMemories = useMemo(() => {
    return memories.filter((mem) => {
      const matchesCategory =
        selectedCategory === 'All' || mem.category === selectedCategory;
      const matchesQuery =
        searchQuery === '' ||
        mem.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        mem.category.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesQuery;
    });
  }, [memories, selectedCategory, searchQuery]);

  const handleAddMemory = (category: MemoryCategory, content: string) => {
    addMemory(category, content);
    showToast('Memory successfully saved to persistent neural index.', 'success');
  };

  const handleDeleteMemory = (id: number) => {
    deleteMemory(id);
    showToast('Memory record deleted.', 'info');
  };

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto space-y-6">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-blue-500/20">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-600/20 text-cyan-400 border border-cyan-500/30">
            <Brain size={22} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-100 light:text-slate-900 tracking-wide">
              Persistent Neural Memory
            </h2>
            <p className="text-xs font-mono text-slate-400">
              SQLITE DATABASE // JARVIS_MEMORY.DB // CONTEXT INJECTION
            </p>
          </div>
        </div>

        <Button
          variant="glow"
          onClick={() => setIsAddModalOpen(true)}
          icon={<Plus size={16} />}
        >
          Add New Memory
        </Button>
      </div>

      {/* Memory Statistics */}
      <MemoryStats memories={memories} />

      {/* Search & Filter Controls */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 pt-2">
        {/* Category Filter Pills */}
        <div className="flex flex-wrap gap-1.5">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-all ${
                selectedCategory === cat
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 font-semibold'
                  : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-72">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search memories..."
            className="w-full py-2 pl-9 pr-3 rounded-xl glass-panel border border-slate-700/60 text-xs text-slate-100 placeholder-slate-400 focus:outline-none focus:border-cyan-400"
          />
          <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
        </div>
      </div>

      {/* Memories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredMemories.map((mem) => (
          <MemoryCard key={mem.id} memory={mem} onDelete={handleDeleteMemory} />
        ))}
      </div>

      {/* Empty State */}
      {filteredMemories.length === 0 && (
        <div className="p-12 text-center rounded-2xl glass-panel border border-slate-800 space-y-3">
          <Brain size={36} className="mx-auto text-cyan-400/40" />
          <h4 className="text-base font-semibold text-slate-300">No memories found</h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            No memory entries match your search query or category filter. Try clearing your search
            or adding a new memory record.
          </p>
        </div>
      )}

      {/* Add Memory Modal */}
      <AddMemoryModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddMemory}
      />
    </div>
  );
};
