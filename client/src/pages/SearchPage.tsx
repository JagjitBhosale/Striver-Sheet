import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Search, FileText, AlertTriangle, BookOpen, ChevronRight } from 'lucide-react';
import api from '../lib/api';

interface SearchResultData {
  problems: any[];
  notes: any[];
  mistakes: any[];
}

const SearchPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const queryParam = searchParams.get('q') || '';
  const [searchTerm, setSearchTerm] = useState(queryParam);
  const [difficulty, setDifficulty] = useState(searchParams.get('difficulty') || '');
  const [activeTab, setActiveTab] = useState<'all' | 'problems' | 'notes' | 'mistakes'>('all');

  useEffect(() => {
    setSearchTerm(queryParam);
  }, [queryParam]);

  const { data, isLoading } = useQuery<{ success: boolean; data: SearchResultData }>({
    queryKey: ['search', searchTerm, difficulty],
    queryFn: async () => {
      if (!searchTerm.trim()) return { success: true, data: { problems: [], notes: [], mistakes: [] } };
      const res = await api.get('/search', {
        params: {
          q: searchTerm,
          difficulty: difficulty || undefined,
        },
      });
      return res.data;
    },
    enabled: searchTerm.trim().length >= 2,
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchParams({ q: searchTerm, ...(difficulty ? { difficulty } : {}) });
  };

  const getDiffBadgeClass = (d: string) => {
    switch (d?.toLowerCase()) {
      case 'easy':
        return 'badge-easy';
      case 'medium':
        return 'badge-medium';
      case 'hard':
        return 'badge-hard';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  const results = data?.data;
  const problemCount = results?.problems?.length || 0;
  const noteCount = results?.notes?.length || 0;
  const mistakeCount = results?.mistakes?.length || 0;

  return (
    <div className="page-container space-y-8">
      <div className="page-header">
        <h1>
          <Search className="text-indigo-400" />
          Global Search
        </h1>
        <p>Search seamlessly across problems, custom notes, algorithm patterns, and recorded mistakes.</p>
      </div>

      {/* Search Input and Filters */}
      <form onSubmit={handleSearch} className="glass-card rounded-2xl space-y-5" style={{ padding: '28px 32px' }}>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search problems, patterns, concepts, tags..."
              className="input-field pl-11 pr-4 py-3 text-sm w-full"
            />
          </div>

          <div className="flex gap-3">
            <select
              value={difficulty}
              onChange={(e) => {
                setDifficulty(e.target.value);
                setSearchParams({ q: searchTerm, ...(e.target.value ? { difficulty: e.target.value } : {}) });
              }}
              className="input-field px-4 py-3 text-sm cursor-pointer w-40"
            >
              <option value="">All Difficulties</option>
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>

            <button type="submit" className="btn-primary px-7 py-3 text-sm font-semibold whitespace-nowrap">
              Search
            </button>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex gap-2.5 pt-3 flex-wrap" style={{ borderTop: '1px solid var(--border)' }}>
          {[
            { key: 'all', label: `All Matches (${problemCount + noteCount + mistakeCount})` },
            { key: 'problems', label: `Problems (${problemCount})` },
            { key: 'notes', label: `Notes (${noteCount})` },
            { key: 'mistakes', label: `Mistakes (${mistakeCount})` },
          ].map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key as any)}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all border ${
                activeTab === tab.key
                  ? 'bg-indigo-600 text-white border-indigo-500'
                  : 'bg-white/4 text-slate-400 border-white/8 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </form>

      {isLoading && (
        <div className="flex justify-center py-16">
          <div className="w-10 h-10 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* Results */}
      {!isLoading && searchTerm.trim().length >= 2 && (
        <div className="space-y-7">
          {/* Problems */}
          {(activeTab === 'all' || activeTab === 'problems') && results?.problems && results.problems.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                <BookOpen size={16} className="text-indigo-400" /> Problems ({results.problems.length})
              </h2>
              <div className="grid gap-4">
                {results.problems.map((p) => (
                  <div
                    key={p._id}
                    onClick={() => navigate(`/problem/${p._id}`)}
                    className="glass-card rounded-2xl cursor-pointer transition-all flex items-center justify-between gap-4 group"
                    style={{ padding: '22px 28px' }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.3)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                    }}
                  >
                    <div className="space-y-1.5 min-w-0">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <span className="font-bold text-sm text-white group-hover:text-indigo-400 transition-colors truncate">
                          {p.title}
                        </span>
                        <span className={`badge ${getDiffBadgeClass(p.difficulty)}`}>
                          {p.difficulty}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500">
                        {p.topicId?.name || 'Topic'} {p.tags?.length ? `• ${p.tags.join(', ')}` : ''}
                      </p>
                    </div>
                    <ChevronRight size={16} className="text-slate-600 group-hover:text-white transition-colors shrink-0" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          {(activeTab === 'all' || activeTab === 'notes') && results?.notes && results.notes.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                <FileText size={16} className="text-indigo-400" /> Notes ({results.notes.length})
              </h2>
              <div className="grid gap-4">
                {results.notes.map((n) => (
                  <div
                    key={n._id}
                    onClick={() => navigate(`/problem/${n.problemId?._id || n.problemId}`)}
                    className="glass-card rounded-2xl cursor-pointer transition-all space-y-3 group"
                    style={{ padding: '22px 28px' }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.3)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-indigo-400 group-hover:text-indigo-300 transition-colors">
                        {n.problemId?.title || 'Problem Note'}
                      </span>
                      {n.patternUsed && (
                        <span className="text-xs px-2.5 py-1 rounded-lg bg-purple-500/8 border border-purple-500/15 text-purple-400">
                          {n.patternUsed}
                        </span>
                      )}
                    </div>
                    {n.keyIdea && (
                      <p
                        className="text-xs text-slate-300 line-clamp-2 rounded-xl"
                        style={{
                          padding: '12px 16px',
                          background: 'rgba(0, 0, 0, 0.15)',
                          border: '1px solid rgba(255, 255, 255, 0.04)',
                        }}
                      >
                        <strong className="text-slate-400">Key Idea:</strong> {n.keyIdea.replace(/<[^>]*>?/gm, '')}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Mistakes */}
          {(activeTab === 'all' || activeTab === 'mistakes') && results?.mistakes && results.mistakes.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                <AlertTriangle size={16} className="text-rose-400" /> Mistakes ({results.mistakes.length})
              </h2>
              <div className="grid gap-4">
                {results.mistakes.map((m) => (
                  <div
                    key={m._id}
                    onClick={() => navigate(`/problem/${m.problemId?._id || m.problemId}`)}
                    className="glass-card rounded-2xl cursor-pointer transition-all space-y-3"
                    style={{
                      padding: '22px 28px',
                      borderColor: 'rgba(244, 63, 94, 0.15)',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(244, 63, 94, 0.35)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(244, 63, 94, 0.15)';
                    }}
                  >
                    <span className="font-bold text-sm text-rose-400">
                      {m.problemId?.title || 'Mistake Log'}
                    </span>
                    <p className="text-xs text-slate-300">{m.mistake}</p>
                    {m.lesson && (
                      <p
                        className="text-xs text-emerald-400 rounded-lg"
                        style={{
                          padding: '10px 14px',
                          background: 'rgba(16, 185, 129, 0.04)',
                          border: '1px solid rgba(16, 185, 129, 0.12)',
                        }}
                      >
                        Lesson: {m.lesson}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {problemCount === 0 && noteCount === 0 && mistakeCount === 0 && (
            <div className="glass-card text-center rounded-2xl text-slate-500 text-sm" style={{ padding: '56px 32px' }}>
              No matches found for "{searchTerm}". Try a different topic, algorithm name, or tag.
            </div>
          )}
        </div>
      )}

      {!isLoading && searchTerm.trim().length < 2 && (
        <div className="glass-card text-center rounded-2xl text-slate-500 text-sm" style={{ padding: '72px 32px' }}>
          Type at least 2 characters to search across your DSA tracker...
        </div>
      )}
    </div>
  );
};

export default SearchPage;
