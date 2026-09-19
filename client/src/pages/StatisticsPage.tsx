import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { BarChart3, Target, Flame, Calendar, BookOpen, Layers, Award, TrendingUp } from 'lucide-react';
import api from '../lib/api';
import { Statistics } from '../types';

const StatisticsPage: React.FC = () => {
  const { data, isLoading } = useQuery<{ success: boolean; data: Statistics }>({
    queryKey: ['statistics'],
    queryFn: async () => {
      const res = await api.get('/statistics');
      return res.data;
    },
  });

  const stats = data?.data;

  if (isLoading) {
    return (
      <div className="page-container space-y-6">
        <div className="h-10 w-48 skeleton" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="glass-card h-32 skeleton rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  const easyTotal = stats?.difficulty?.total?.Easy || 1;
  const easySolved = stats?.difficulty?.solved?.Easy || 0;
  const medTotal = stats?.difficulty?.total?.Medium || 1;
  const medSolved = stats?.difficulty?.solved?.Medium || 0;
  const hardTotal = stats?.difficulty?.total?.Hard || 1;
  const hardSolved = stats?.difficulty?.solved?.Hard || 0;

  return (
    <div className="page-container space-y-8">
      {/* Header */}
      <div className="page-header">
        <h1>
          <BarChart3 className="text-indigo-400" />
          Analytics & Performance
        </h1>
        <p>Detailed telemetry on problem-solving velocity, topics mastered, and daily learning trends.</p>
      </div>

      {/* Top metric row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass-card rounded-2xl space-y-2.5" style={{ padding: '28px' }}>
          <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-slate-500">
            <span>Completion Rate</span>
            <Target size={18} className="text-indigo-400" />
          </div>
          <p className="text-3xl font-extrabold text-indigo-400">
            {stats?.completionPercentage ? stats.completionPercentage.toFixed(1) : 0}%
          </p>
          <p className="text-xs text-slate-500">
            {stats?.totalSolved || 0} of {stats?.totalProblems || 0} completed
          </p>
        </div>

        <div className="glass-card rounded-2xl space-y-2.5" style={{ padding: '28px' }}>
          <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-slate-500">
            <span>Current Streak</span>
            <Flame size={18} className="text-amber-500" />
          </div>
          <p className="text-3xl font-extrabold text-amber-400">
            {stats?.currentStreak || 0} <span className="text-sm font-normal text-slate-500">days</span>
          </p>
          <p className="text-xs text-slate-500">
            Best streak: {stats?.longestStreak || 0} days
          </p>
        </div>

        <div className="glass-card rounded-2xl space-y-2.5" style={{ padding: '28px' }}>
          <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-slate-500">
            <span>Active Study Days</span>
            <Calendar size={18} className="text-emerald-400" />
          </div>
          <p className="text-3xl font-extrabold text-emerald-400">
            {stats?.totalActiveDays || 0}
          </p>
          <p className="text-xs text-slate-500">
            Total active sessions logged
          </p>
        </div>

        <div className="glass-card rounded-2xl space-y-2.5" style={{ padding: '28px' }}>
          <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-slate-500">
            <span>Knowledge Base</span>
            <BookOpen size={18} className="text-purple-400" />
          </div>
          <p className="text-3xl font-extrabold text-purple-400">
            {stats?.notesCount || 0}
          </p>
          <p className="text-xs text-slate-500">
            Problem notes & {stats?.imagesCount || 0} diagrams
          </p>
        </div>
      </div>

      {/* Difficulty breakdown */}
      <div className="glass-card rounded-2xl space-y-7" style={{ padding: '32px 36px' }}>
        <h2 className="text-lg font-bold text-white flex items-center gap-3">
          <Award size={20} className="text-indigo-400" />
          Difficulty Distribution
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Easy */}
          <div
            className="rounded-2xl space-y-3"
            style={{
              padding: '24px',
              background: 'rgba(16, 185, 129, 0.08)',
              border: '1px solid rgba(16, 185, 129, 0.15)',
            }}
          >
            <div className="flex justify-between items-center text-sm font-bold text-emerald-400">
              <span>Easy Problems</span>
              <span>{easySolved} / {easyTotal}</span>
            </div>
            <div className="w-full h-2.5 rounded-full bg-slate-800 overflow-hidden border border-white/8">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, (easySolved / easyTotal) * 100)}%` }}
              />
            </div>
            <p className="text-xs text-slate-400">
              {((easySolved / easyTotal) * 100).toFixed(0)}% completed
            </p>
          </div>

          {/* Medium */}
          <div
            className="rounded-2xl space-y-3"
            style={{
              padding: '24px',
              background: 'rgba(245, 158, 11, 0.08)',
              border: '1px solid rgba(245, 158, 11, 0.15)',
            }}
          >
            <div className="flex justify-between items-center text-sm font-bold text-amber-400">
              <span>Medium Problems</span>
              <span>{medSolved} / {medTotal}</span>
            </div>
            <div className="w-full h-2.5 rounded-full bg-slate-800 overflow-hidden border border-white/8">
              <div
                className="h-full bg-amber-500 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, (medSolved / medTotal) * 100)}%` }}
              />
            </div>
            <p className="text-xs text-slate-400">
              {((medSolved / medTotal) * 100).toFixed(0)}% completed
            </p>
          </div>

          {/* Hard */}
          <div
            className="rounded-2xl space-y-3"
            style={{
              padding: '24px',
              background: 'rgba(244, 63, 94, 0.08)',
              border: '1px solid rgba(244, 63, 94, 0.15)',
            }}
          >
            <div className="flex justify-between items-center text-sm font-bold text-rose-400">
              <span>Hard Problems</span>
              <span>{hardSolved} / {hardTotal}</span>
            </div>
            <div className="w-full h-2.5 rounded-full bg-slate-800 overflow-hidden border border-white/8">
              <div
                className="h-full bg-rose-500 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, (hardSolved / hardTotal) * 100)}%` }}
              />
            </div>
            <p className="text-xs text-slate-400">
              {((hardSolved / hardTotal) * 100).toFixed(0)}% completed
            </p>
          </div>
        </div>
      </div>

      {/* Topic Mastery Progress Grid */}
      <div className="glass-card rounded-2xl space-y-7" style={{ padding: '32px 36px' }}>
        <h2 className="text-lg font-bold text-white flex items-center gap-3">
          <Layers size={20} className="text-indigo-400" />
          Curriculum Topic Breakdown
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {stats?.topicProgress && stats.topicProgress.length > 0 ? (
            stats.topicProgress.map((tp) => (
              <div
                key={tp.topicId}
                className="rounded-xl space-y-2.5"
                style={{
                  padding: '20px',
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid rgba(255, 255, 255, 0.05)',
                }}
              >
                <div className="flex justify-between items-center text-sm">
                  <span className="font-semibold text-slate-200 truncate">{tp.name}</span>
                  <div className="flex items-center gap-3 text-xs text-slate-400 shrink-0 ml-3">
                    <span>{tp.solved} / {tp.total}</span>
                    <span className="font-mono text-indigo-400 font-bold">{tp.percentage.toFixed(0)}%</span>
                  </div>
                </div>
                <div className="w-full h-2 rounded-full overflow-hidden bg-slate-800 border border-white/5">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${tp.percentage}%`,
                      background: tp.percentage === 100 ? '#10b981' : 'linear-gradient(90deg, #6366f1, #a78bfa)',
                    }}
                  />
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm py-6 text-center text-slate-500 col-span-2">
              No topic progress recorded yet. Start solving problems!
            </p>
          )}
        </div>
      </div>

      {/* Activity Heatmap Grid */}
      <div className="glass-card rounded-2xl space-y-5" style={{ padding: '32px 36px' }}>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white flex items-center gap-3">
            <TrendingUp size={20} className="text-emerald-400" />
            Recent Activity Heatmap
          </h2>
          <span className="text-xs text-slate-500">Last 30 days</span>
        </div>

        <div className="flex flex-wrap gap-2.5 pt-2">
          {stats?.dailyActivity && stats.dailyActivity.length > 0 ? (
            stats.dailyActivity.map((act, idx) => {
              const count = act.problemsSolved || 0;
              let bg = 'rgba(255, 255, 255, 0.04)';
              let border = 'rgba(255, 255, 255, 0.06)';
              if (count >= 5) { bg = '#10b981'; border = '#059669'; }
              else if (count >= 3) { bg = '#059669'; border = '#047857'; }
              else if (count >= 1) { bg = '#047857'; border = '#065f46'; }

              return (
                <div
                  key={idx}
                  title={`${act.date}: ${count} problems solved`}
                  className="w-7 h-7 rounded-md transition-transform hover:scale-125 cursor-pointer"
                  style={{ backgroundColor: bg, border: `1px solid ${border}` }}
                />
              );
            })
          ) : (
            Array.from({ length: 30 }).map((_, i) => (
              <div
                key={i}
                className="w-7 h-7 rounded-md"
                style={{
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                }}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default StatisticsPage;
