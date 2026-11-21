import React, { useEffect, useState } from 'react';
import { fetchNews } from '../../services/api/intelligenceService';
import type { NewsArticle } from '../../types';
import { NEWS_CATEGORIES } from '../../utils/constants';
import { Newspaper, ExternalLink, RefreshCw } from 'lucide-react';

export const NewsTool: React.FC = () => {
  const [category, setCategory] = useState('technology');
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let active = true;
    const fetchArticles = async () => {
      setLoading(true);
      try {
        const data = await fetchNews(category);
        if (active) setArticles(data);
      } catch {
        // ignore
      } finally {
        if (active) setLoading(false);
      }
    };
    fetchArticles();
    return () => {
      active = false;
    };
  }, [category]);

  const handleRefresh = async () => {
    setLoading(true);
    try {
      const data = await fetchNews(category);
      setArticles(data);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Category Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
        <div className="flex flex-wrap gap-1.5">
          {NEWS_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-all ${
                category === cat.id
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 font-semibold'
                  : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <button
          onClick={handleRefresh}
          disabled={loading}
          className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-400 transition-colors"
          title="Refresh intelligence wire"
        >
          <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Articles List */}
      <div className="space-y-3">
        {articles.map((item, i) => (
          <div
            key={i}
            className="p-4 rounded-2xl glass-panel border border-blue-500/20 hover:border-cyan-400/30 transition-all space-y-2 group"
          >
            <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
              <span className="text-cyan-400 font-semibold flex items-center gap-1.5">
                <Newspaper size={12} /> {item.source}
              </span>
              <span>{item.published}</span>
            </div>

            <h4 className="text-sm font-semibold text-slate-100 light:text-slate-900 group-hover:text-cyan-300 transition-colors">
              {item.title}
            </h4>

            {item.snippet && (
              <p className="text-xs text-slate-400 leading-relaxed">{item.snippet}</p>
            )}

            <div className="pt-1 flex justify-end">
              <a
                href={item.link}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-[11px] font-mono text-blue-400 hover:text-cyan-300 transition-colors"
              >
                Read Source <ExternalLink size={11} />
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
