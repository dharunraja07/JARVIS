import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useJarvisStore } from '../store/useJarvisStore';
import type { MemoryCategory } from '../types';
import { MemoryCard } from '../components/memory/MemoryCard';
import { MemoryStats } from '../components/memory/MemoryStats';
import { AddMemoryModal } from '../components/memory/AddMemoryModal';
import { memoryService } from '../services/api/memoryService';
import { Brain, Plus, Search, RefreshCw, AlertCircle } from 'lucide-react';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';

export const Memory: React.FC = () => {
  const {
    memories,
    setMemories,
    addMemoryRecord,
    deleteMemoryRecord,
    isLoadingMemories,
    setIsLoadingMemories,
    showToast,
  } = useJarvisStore();

  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isBackendConnected, setIsBackendConnected] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const categories = ['All', 'Education', 'Career', 'Projects', 'Preferences', 'Personal'];

  const loadMemories = useCallback(async () => {
    setIsLoadingMemories(true);
    setErrorMessage(null);
    try {
      const res = await memoryService.fetchMemories();
      setMemories(res.memories);
      setIsBackendConnected(res.isLiveBackend);
      if (!res.isLiveBackend) {
        setErrorMessage(
          'Companion server is not running on http://127.0.0.1:8000. Start the backend companion to access real SQLite memory.'
        );
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to query memory store.';
      setErrorMessage(msg);
      setIsBackendConnected(false);
    } finally {
      setIsLoadingMemories(false);
    }
  }, [setIsLoadingMemories, setMemories]);

  useEffect(() => {
    let active = true;
    (async () => {
      setIsLoadingMemories(true);
      setErrorMessage(null);
      try {
        const res = await memoryService.fetchMemories();
        if (active) {
          setMemories(res.memories);
          setIsBackendConnected(res.isLiveBackend);
          if (!res.isLiveBackend) {
            setErrorMessage(
              'Companion server is not running on http://127.0.0.1:8000. Start the backend companion to access real SQLite memory.'
            );
          }
        }
      } catch (err: unknown) {
        if (active) {
          const msg = err instanceof Error ? err.message : 'Failed to query memory store.';
          setErrorMessage(msg);
          setIsBackendConnected(false);
        }
      } finally {
        if (active) setIsLoadingMemories(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [setIsLoadingMemories, setMemories]);

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

  const handleAddMemory = async (category: MemoryCategory, content: string) => {
    try {
      const res = await memoryService.createMemory(category, content);
      if (res.success && res.memory) {
        addMemoryRecord(res.memory);
        showToast('Memory successfully indexed into SQLite database.', 'success');
      } else {
        showToast(res.error || 'Failed to save memory to backend database.', 'error');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Database error.';
      showToast(msg, 'error');
    }
  };

  const handleDeleteMemory = async (id: number) => {
    try {
      const res = await memoryService.deleteMemory(id);
      if (res.success) {
        deleteMemoryRecord(id);
        showToast('Memory record deleted from SQLite database.', 'info');
      } else {
        showToast(res.error || 'Failed to delete memory record.', 'error');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Database error.';
      showToast(msg, 'error');
    }
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
              REAL SQLITE DATABASE // JARVIS_MEMORY.DB // PERSISTENT RETRIEVAL
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Badge variant={isBackendConnected ? 'emerald' : 'amber'} pulse={isBackendConnected}>
            {isBackendConnected ? 'SQLITE LIVE BACKEND' : 'BACKEND OFFLINE'}
          </Badge>

          <button
            onClick={loadMemories}
            disabled={isLoadingMemories}
            className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
            title="Refresh memory store"
          >
            <RefreshCw size={16} className={isLoadingMemories ? 'animate-spin' : ''} />
          </button>

          <Button
            variant="glow"
            onClick={() => setIsAddModalOpen(true)}
            icon={<Plus size={16} />}
          >
            Add New Memory
          </Button>
        </div>
      </div>

      {/* Backend Status Warning if offline */}
      {errorMessage && (
        <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-500/40 text-amber-300 text-xs font-mono flex items-center gap-2.5">
          <AlertCircle size={16} className="flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

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
      {isLoadingMemories ? (
        <div className="p-12 text-center rounded-2xl glass-panel border border-slate-800">
          <RefreshCw size={24} className="mx-auto text-cyan-400 animate-spin" />
          <p className="text-xs font-mono text-slate-400 mt-2">
            QUERYING SQLITE MEMORY STORE...
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMemories.map((mem) => (
            <MemoryCard key={mem.id} memory={mem} onDelete={handleDeleteMemory} />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoadingMemories && filteredMemories.length === 0 && (
        <div className="p-12 text-center rounded-2xl glass-panel border border-slate-800 space-y-3">
          <Brain size={36} className="mx-auto text-cyan-400/40" />
          <h4 className="text-base font-semibold text-slate-300">
            {isBackendConnected ? 'No memories found' : 'Database Offline'}
          </h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {isBackendConnected
              ? 'No memory records match your filter. Click "Add New Memory" to record a fact or instruction for JARVIS.'
              : 'Launch the companion server (uv run python src/companion_server.py) to access and manage your SQLite memories.'}
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
