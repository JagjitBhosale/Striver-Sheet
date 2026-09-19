import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  ChevronDown, ChevronRight, ExternalLink, Video, FileText,
  CheckCircle2, Circle, Filter, Search, BookOpen, Layers
} from 'lucide-react';
import api from '../lib/api';
import { Topic, Problem, Progress } from '../types';
import toast from 'react-hot-toast';

const A2ZSheetPage: React.FC = () => {
  const [expandedTopics, setExpandedTopics] = useState<Set<string>>(new Set());
  const [filter, setFilter] = useState<string>('all');
  const [diffFilter, setDiffFilter] = useState<string>('all');
  const [sheetSearch, setSheetSearch] = useState<string>('');
  const navigate = useNavigate();
  const qc = useQueryClient();

  const { data: topics, isLoading: loadingTopics } = useQuery({
    queryKey: ['topics'],
    queryFn: async () => (await api.get('/topics')).data.data as Topic[],
  });

  const { data: allProgress } = useQuery({
    queryKey: ['progress'],
    queryFn: async () => {
      const { data } = await api.get('/progress');
      const map = new Map<string, Progress>();
      data.data.forEach((p: Progress) => map.set(p.problemId, p));
      return map;
    },
  });

  const { data: allProblems, isLoading: loadingProblems } = useQuery({
    queryKey: ['problems'],
    queryFn: async () => (await api.get('/problems?limit=1000')).data.data as Problem[],
  });

  const toggleMutation = useMutation({
    mutationFn: async ({ problemId, status }: { problemId: string; status: string }) => {
      await api.put(`/progress/${problemId}`, { status });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['progress'] });
      qc.invalidateQueries({ queryKey: ['statistics'] });
    },
  });

  const toggleTopic = (id: string) => {
    setExpandedTopics(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const expandAll = () => {
    if (!topics) return;
    if (expandedTopics.size === topics.length) {
      setExpandedTopics(new Set());
    } else {
      setExpandedTopics(new Set(topics.map(t => t._id)));
    }
  };

  const handleToggle = (problemId: string) => {
    const current = allProgress?.get(problemId);
    const newStatus = current?.status === 'solved' ? 'not_started' : 'solved';
    toggleMutation.mutate({ problemId, status: newStatus });
    if (newStatus === 'solved') {
      toast.success('Problem marked as solved!');
    }
  };

  // Group problems by topic
  const problemsByTopic = useMemo(() => {
    if (!allProblems) return new Map<string, Problem[]>();
    const map = new Map<string, Problem[]>();
    allProblems.forEach(p => {
      const topicId = typeof p.topicId === 'string' ? p.topicId : p.topicId._id;
      if (!map.has(topicId)) map.set(topicId, []);
      map.get(topicId)!.push(p);
    });
    return map;
  }, [allProblems]);

  const filterProblem = (p: Problem): boolean => {
    const prog = allProgress?.get(p._id);
    if (diffFilter !== 'all' && p.difficulty.toLowerCase() !== diffFilter.toLowerCase()) return false;
    if (filter === 'solved' && prog?.status !== 'solved') return false;
    if (filter === 'unsolved' && prog?.status === 'solved') return false;
    if (filter === 'attempted' && prog?.status !== 'attempted') return false;
    if (filter === 'bookmarked' && !prog?.bookmarked) return false;
    if (sheetSearch.trim()) {
      const q = sheetSearch.toLowerCase();
      const matchTitle = p.title.toLowerCase().includes(q);
      const matchTag = p.tags?.some(t => t.toLowerCase().includes(q));
      if (!matchTitle && !matchTag) return false;
    }
    return true;
  };

  const getDiffBadgeClass = (d: string) => {
    switch (d.toLowerCase()) {
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

  if (loadingTopics || loadingProblems) {
    return (
      <div className="page-container space-y-8">
        <div className="h-10 w-64 skeleton" />
        <div className="h-24 w-full skeleton rounded-2xl" />
        <div className="space-y-5">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-20 w-full skeleton rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  const totalProblemsCount = allProblems?.length || 0;
  let totalSolvedCount = 0;
  allProgress?.forEach((p) => {
    if (p.status === 'solved') totalSolvedCount++;
  });
  const overallPercentage = totalProblemsCount > 0 ? Math.round((totalSolvedCount / totalProblemsCount) * 100) : 0;

  return (
    <div className="page-container space-y-8">
      {/* Top Banner & Title */}
      <div className="glass-card rounded-2xl" style={{ padding: '32px 36px' }}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="space-y-3">
            <div className="flex items-center gap-4">
              <div
                className="p-3 rounded-xl text-indigo-400 shrink-0"
                style={{
                  background: 'rgba(99, 102, 241, 0.12)',
                  border: '1px solid rgba(99, 102, 241, 0.25)',
                }}
              >
                <BookOpen size={26} />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white leading-tight">
                  Striver A2Z DSA Sheet
                </h1>
                <p className="text-sm text-slate-400 mt-1">
                  Structured curriculum from basics to advanced patterns
                </p>
              </div>
            </div>
          </div>

          {/* Global Progress Pill */}
          <div
            className="flex items-center gap-5 shrink-0 rounded-xl"
            style={{
              padding: '20px 24px',
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
            }}
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-400 gap-8">
                <span>Overall Completion</span>
                <span className="text-indigo-400 font-bold">{totalSolvedCount} / {totalProblemsCount}</span>
              </div>
              <div className="w-48 h-2.5 bg-slate-800 rounded-full overflow-hidden border border-white/8">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500"
                  style={{ width: `${overallPercentage}%` }}
                />
              </div>
            </div>
            <span className="text-2xl font-extrabold text-white">{overallPercentage}%</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-card rounded-2xl" style={{ padding: '20px 28px' }}>
        <div className="flex flex-col sm:flex-row items-center gap-5 justify-between">
          {/* Search */}
          <div className="relative w-full sm:w-80">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Filter problems in sheet..."
              value={sheetSearch}
              onChange={(e) => setSheetSearch(e.target.value)}
              className="input-field pl-11 pr-4 py-2.5 text-sm w-full"
            />
          </div>

          {/* Filter controls */}
          <div className="flex items-center gap-4 w-full sm:w-auto flex-wrap">
            <div className="flex items-center gap-2.5">
              <Filter size={15} className="text-slate-500 shrink-0" />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="input-field py-2.5 px-4 text-xs font-medium cursor-pointer"
              >
                <option value="all">All Status</option>
                <option value="solved">Solved</option>
                <option value="unsolved">Unsolved</option>
                <option value="attempted">Attempted</option>
                <option value="bookmarked">Bookmarked</option>
              </select>
            </div>

            <select
              value={diffFilter}
              onChange={(e) => setDiffFilter(e.target.value)}
              className="input-field py-2.5 px-4 text-xs font-medium cursor-pointer"
            >
              <option value="all">All Difficulties</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>

            <button
              onClick={expandAll}
              className="btn-secondary py-2.5 px-5 text-xs font-semibold whitespace-nowrap"
            >
              {expandedTopics.size === (topics?.length || 0) ? 'Collapse All' : 'Expand All'}
            </button>
          </div>
        </div>
      </div>

      {/* Topics Accordion List */}
      <div className="space-y-5">
        {topics?.map((topic, index) => {
          const problems = problemsByTopic.get(topic._id) || [];
          const filtered = problems.filter(filterProblem);
          const solvedCount = problems.filter((p) => allProgress?.get(p._id)?.status === 'solved').length;
          const isExpanded = expandedTopics.has(topic._id);
          const pct = problems.length > 0 ? Math.round((solvedCount / problems.length) * 100) : 0;

          // If searching or filtering and no problems match, optionally hide or show 0
          if (sheetSearch.trim() && filtered.length === 0) {
            return null;
          }

          return (
            <div
              key={topic._id}
              className={`glass-card overflow-hidden rounded-2xl transition-all duration-200 ${
                isExpanded ? 'shadow-lg' : ''
              }`}
              style={{
                borderColor: isExpanded ? 'rgba(99, 102, 241, 0.3)' : undefined,
              }}
            >
              {/* Topic Header Button */}
              <button
                onClick={() => toggleTopic(topic._id)}
                className="w-full flex items-center justify-between text-left transition-colors hover:bg-white/[0.02]"
                style={{ padding: '24px 32px' }}
              >
                <div className="flex items-center gap-5 min-w-0 pr-4">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border transition-all ${
                      isExpanded
                        ? 'bg-indigo-600 text-white border-indigo-400'
                        : 'bg-white/5 text-slate-400 border-white/8'
                    }`}
                  >
                    {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold font-mono text-indigo-400 shrink-0">Step {index + 1}</span>
                      <h2 className="text-base sm:text-lg font-bold text-white truncate">{topic.name}</h2>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      {problems.length} problems • {topic.subcategories?.length || 0} sub-topics
                    </p>
                  </div>
                </div>

                {/* Right Progress */}
                <div className="flex items-center gap-6 shrink-0">
                  <div className="hidden sm:flex flex-col items-end gap-2">
                    <span className="text-xs font-semibold text-slate-300">
                      {solvedCount} / {problems.length} Solved
                    </span>
                    <div className="w-32 h-2 bg-slate-800 rounded-full overflow-hidden border border-white/8">
                      <div
                        className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-300"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>

                  <span
                    className={`text-xs font-bold px-3 py-1.5 rounded-lg border ${
                      pct === 100
                        ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25'
                        : pct > 0
                        ? 'bg-indigo-500/12 text-indigo-400 border-indigo-500/25'
                        : 'bg-white/4 text-slate-500 border-white/8'
                    }`}
                  >
                    {pct}%
                  </span>
                </div>
              </button>

              {/* Expanded Problems Container */}
              {isExpanded && (
                <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.06)', background: 'rgba(0, 0, 0, 0.15)' }}>
                  {topic.subcategories.map((sub) => {
                    const subProblems = filtered.filter((p) => p.subcategorySlug === sub.slug);
                    if (subProblems.length === 0) return null;

                    const subTotal = (problemsByTopic.get(topic._id) || []).filter(
                      (p) => p.subcategorySlug === sub.slug
                    ).length;
                    const subSolved = (problemsByTopic.get(topic._id) || [])
                      .filter((p) => p.subcategorySlug === sub.slug)
                      .filter((p) => allProgress?.get(p._id)?.status === 'solved').length;

                    return (
                      <div key={sub._id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }} className="last:border-b-0">
                        {/* Subcategory Banner */}
                        <div
                          className="flex items-center justify-between"
                          style={{
                            padding: '14px 32px',
                            background: 'rgba(255, 255, 255, 0.015)',
                            borderTop: '1px solid rgba(255, 255, 255, 0.04)',
                            borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                          }}
                        >
                          <div className="flex items-center gap-2.5">
                            <Layers size={14} className="text-indigo-400" />
                            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                              {sub.name}
                            </h3>
                          </div>
                          <span
                            className="text-[11px] font-semibold text-slate-400 px-2.5 py-1 rounded-lg"
                            style={{
                              background: 'rgba(255, 255, 255, 0.04)',
                              border: '1px solid rgba(255, 255, 255, 0.06)',
                            }}
                          >
                            {subSolved}/{subTotal} Solved
                          </span>
                        </div>

                        {/* Problems Rows */}
                        <div>
                          {subProblems.map((problem) => {
                            const prog = allProgress?.get(problem._id);
                            const isSolved = prog?.status === 'solved';

                            return (
                              <div
                                key={problem._id}
                                className="flex items-center justify-between gap-4 transition-colors hover:bg-white/[0.025]"
                                style={{
                                  padding: '18px 32px',
                                  borderBottom: '1px solid rgba(255, 255, 255, 0.035)',
                                  background: isSolved ? 'rgba(16, 185, 129, 0.03)' : undefined,
                                }}
                              >
                                {/* Left: Toggle & Title */}
                                <div className="flex items-center gap-4 min-w-0 flex-1">
                                  <button
                                    onClick={() => handleToggle(problem._id)}
                                    className="shrink-0 transition-transform active:scale-90"
                                    title={isSolved ? 'Mark as unsolved' : 'Mark as solved'}
                                  >
                                    {isSolved ? (
                                      <CheckCircle2 size={20} className="text-emerald-400 drop-shadow-sm" />
                                    ) : (
                                      <Circle size={20} className="text-slate-600 hover:text-slate-400 transition-colors" />
                                    )}
                                  </button>

                                  <div className="min-w-0">
                                    <span
                                      onClick={() => navigate(`/problem/${problem._id}`)}
                                      className={`text-sm font-semibold cursor-pointer hover:text-indigo-400 transition-colors block truncate ${
                                        isSolved ? 'line-through text-slate-500' : 'text-slate-200'
                                      }`}
                                    >
                                      {problem.title}
                                    </span>
                                  </div>
                                </div>

                                {/* Right: Badges & Links & Workspace Button */}
                                <div className="flex items-center gap-3 shrink-0">
                                  {/* Difficulty Badge */}
                                  <span className={`badge ${getDiffBadgeClass(problem.difficulty)}`}>
                                    {problem.difficulty}
                                  </span>

                                  {/* External Links */}
                                  <div className="flex items-center gap-1.5">
                                    {problem.externalUrls?.leetcode && (
                                      <a
                                        href={problem.externalUrls.leetcode}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        title="Practice on LeetCode"
                                        className="p-2 rounded-lg text-slate-500 hover:text-amber-400 hover:bg-amber-400/8 transition-colors border border-transparent hover:border-amber-400/15"
                                      >
                                        <ExternalLink size={15} />
                                      </a>
                                    )}
                                    {problem.externalUrls?.youtube && (
                                      <a
                                        href={problem.externalUrls.youtube}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        title="Watch Video Tutorial"
                                        className="p-2 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-400/8 transition-colors border border-transparent hover:border-rose-400/15"
                                      >
                                        <Video size={15} />
                                      </a>
                                    )}
                                    {problem.externalUrls?.article && (
                                      <a
                                        href={problem.externalUrls.article}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        title="Read Editorial Article"
                                        className="p-2 rounded-lg text-slate-500 hover:text-indigo-400 hover:bg-indigo-400/8 transition-colors border border-transparent hover:border-indigo-400/15"
                                      >
                                        <FileText size={15} />
                                      </a>
                                    )}
                                  </div>

                                  {/* Notes & Workspace link */}
                                  <button
                                    onClick={() => navigate(`/problem/${problem._id}`)}
                                    className="btn-secondary px-4 py-1.5 text-xs font-semibold hidden sm:inline-flex"
                                  >
                                    Notes & Sol.
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}

                  {filtered.length === 0 && (
                    <div className="text-center text-sm text-slate-500" style={{ padding: '40px 32px' }}>
                      No problems match your current filters in this topic.
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default A2ZSheetPage;
