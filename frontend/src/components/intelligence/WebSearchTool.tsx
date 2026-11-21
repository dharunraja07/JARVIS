import React, { useState } from 'react';
import { performWebSearch } from '../../services/api/intelligenceService';
import type { SearchResult } from '../../types';
import { Search, Globe, ExternalLink } from 'lucide-react';
import { Button } from '../common/Button';

export const WebSearchTool: React.FC = () => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    try {
      const data = await performWebSearch(query);
      setResults(data);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Search Input */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search web via DDGS / multi-engine query (e.g. quantum neural networks)..."
            className="w-full py-2.5 pl-4 pr-10 rounded-xl glass-panel border border-cyan-500/30 text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:border-cyan-400"
          />
        </div>
        <Button type="submit" variant="glow" disabled={loading} icon={<Search size={16} />}>
          {loading ? 'Querying...' : 'Search'}
        </Button>
      </form>

      {/* Results List */}
      <div className="space-y-3">
        {results.map((res, i) => (
          <div
            key={i}
            className="p-4 rounded-2xl glass-panel border border-blue-500/20 hover:border-cyan-400/30 transition-all space-y-1.5"
          >
            <div className="flex items-center gap-1.5 text-[11px] font-mono text-cyan-400">
              <Globe size={12} />
              <span>{res.domain}</span>
            </div>
            <a
              href={res.url}
              target="_blank"
              rel="noreferrer"
              className="text-sm font-semibold text-blue-400 hover:text-cyan-300 transition-colors flex items-center gap-1.5"
            >
              {res.title} <ExternalLink size={12} />
            </a>
            <p className="text-xs text-slate-300 light:text-slate-600 leading-relaxed">
              {res.snippet}
            </p>
          </div>
        ))}

        {results.length === 0 && !loading && (
          <div className="p-8 text-center rounded-2xl glass-panel-subtle border border-slate-800 space-y-2">
            <Globe size={32} className="mx-auto text-cyan-400/60" />
            <p className="text-sm text-slate-400">
              Query the global internet network using JARVIS multi-backend search.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
