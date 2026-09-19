import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  TrendingUp, Target, BookOpen, Flame, CheckCircle2,
  Clock, AlertCircle, ChevronRight, Layers, Award
} from 'lucide-react';
import api from '../lib/api';
import { Statistics } from '../types';

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();

  const { data: stats, isLoading } = useQuery({
    queryKey: ['statistics'],
    queryFn: async () => {
      const { data } = await api.get('/statistics');
      return data.data as Statistics;
    },
  });

  if (isLoading || !stats) {
    return (
      <div className="page-container space-y-8">
        <div className="h-12 w-64 skeleton" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="glass-card h-40 skeleton" style={{ borderRadius: 'var(--radius-xl)' }} />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="glass-card h-52 skeleton" style={{ borderRadius: 'var(--radius-xl)' }} />
          ))}
        </div>
      </div>
    );
  }

  const easyTotal = stats.difficulty?.total?.Easy || 1;
  const easySolved = stats.difficulty?.solved?.Easy || 0;
  const medTotal = stats.difficulty?.total?.Medium || 1;
  const medSolved = stats.difficulty?.solved?.Medium || 0;
  const hardTotal = stats.difficulty?.total?.Hard || 1;
  const hardSolved = stats.difficulty?.solved?.Hard || 0;

  return (
    <div className="page-container space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
        <div className="page-header" style={{ marginBottom: 0 }}>
          <h1>Dashboard Overview</h1>
          <p>Real-time telemetry on your problem solving consistency and syllabus progress.</p>
        </div>

        <button
          onClick={() => navigate('/sheet')}
          className="btn-primary px-6 py-3 font-semibold text-sm self-start sm:self-auto"
        >
          <BookOpen size={16} />
          Go to A2Z Sheet
        </button>
      </div>

      {/* Top Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Overall Progress */}
        <div className="glass-card rounded-2xl space-y-4" style={{ padding: '28px' }}>
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Total Solved</span>
            <div className="p-2.5 rounded-xl bg-indigo-500/12 border border-indigo-500/25 text-indigo-400">
              <Target size={18} />
            </div>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-white">
              {stats.totalSolved}
              <span className="text-base font-normal text-slate-500 ml-2">/ {stats.totalProblems}</span>
            </div>
            <div className="progress-bar mt-4">
              <div className="progress-bar-fill" style={{ width: `${stats.completionPercentage}%` }} />
            </div>
            <div className="flex justify-between items-center text-xs text-slate-500 mt-2.5">
              <span>Completion Rate</span>
              <span className="font-bold text-indigo-400">{stats.completionPercentage.toFixed(1)}%</span>
            </div>
          </div>
        </div>

        {/* Easy */}
        <div className="glass-card rounded-2xl space-y-4" style={{ padding: '28px' }}>
          <div className="flex items-center justify-between">
            <span className="badge badge-easy">Easy Problems</span>
            <div className="p-2.5 rounded-xl bg-emerald-500/12 border border-emerald-500/25 text-emerald-400">
              <CheckCircle2 size={18} />
            </div>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-emerald-400">
              {easySolved}
              <span className="text-base font-normal text-slate-500 ml-2">/ {easyTotal}</span>
            </div>
            <div className="progress-bar mt-4">
              <div
                className="progress-bar-fill"
                style={{
                  width: `${(easySolved / easyTotal) * 100}%`,
                  background: 'linear-gradient(90deg, #10b981, #34d399)',
                }}
              />
            </div>
            <div className="flex justify-between items-center text-xs text-slate-500 mt-2.5">
              <span>Mastery</span>
              <span className="font-bold text-emerald-400">{((easySolved / easyTotal) * 100).toFixed(0)}%</span>
            </div>
          </div>
        </div>

        {/* Medium */}
        <div className="glass-card rounded-2xl space-y-4" style={{ padding: '28px' }}>
          <div className="flex items-center justify-between">
            <span className="badge badge-medium">Medium Problems</span>
            <div className="p-2.5 rounded-xl bg-amber-500/12 border border-amber-500/25 text-amber-400">
              <Clock size={18} />
            </div>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-amber-400">
              {medSolved}
              <span className="text-base font-normal text-slate-500 ml-2">/ {medTotal}</span>
            </div>
            <div className="progress-bar mt-4">
              <div
                className="progress-bar-fill"
                style={{
                  width: `${(medSolved / medTotal) * 100}%`,
                  background: 'linear-gradient(90deg, #f59e0b, #fbbf24)',
                }}
              />
            </div>
            <div className="flex justify-between items-center text-xs text-slate-500 mt-2.5">
              <span>Mastery</span>
              <span className="font-bold text-amber-400">{((medSolved / medTotal) * 100).toFixed(0)}%</span>
            </div>
          </div>
        </div>

        {/* Hard */}
        <div className="glass-card rounded-2xl space-y-4" style={{ padding: '28px' }}>
          <div className="flex items-center justify-between">
            <span className="badge badge-hard">Hard Problems</span>
            <div className="p-2.5 rounded-xl bg-rose-500/12 border border-rose-500/25 text-rose-400">
              <AlertCircle size={18} />
            </div>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-rose-400">
              {hardSolved}
              <span className="text-base font-normal text-slate-500 ml-2">/ {hardTotal}</span>
            </div>
            <div className="progress-bar mt-4">
              <div
                className="progress-bar-fill"
                style={{
                  width: `${(hardSolved / hardTotal) * 100}%`,
                  background: 'linear-gradient(90deg, #f43f5e, #fb7185)',
                }}
              />
            </div>
            <div className="flex justify-between items-center text-xs text-slate-500 mt-2.5">
              <span>Mastery</span>
              <span className="font-bold text-rose-400">{((hardSolved / hardTotal) * 100).toFixed(0)}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Streak, Metrics & Heatmap */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Streak card */}
        <div className="glass-card rounded-2xl space-y-5" style={{ padding: '28px' }}>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-orange-500/12 border border-orange-500/25 text-orange-400">
              <Flame size={18} />
            </div>
            <h2 className="text-base font-bold text-white">Daily Streak</h2>
          </div>

          <div
            className="grid grid-cols-2 gap-5 rounded-xl"
            style={{
              padding: '20px',
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid rgba(255, 255, 255, 0.05)',
            }}
          >
            <div>
              <div className="text-3xl font-extrabold text-orange-400">{stats.currentStreak}</div>
              <span className="text-xs font-semibold text-slate-500 mt-1.5 block">Current Streak</span>
            </div>
            <div>
              <div className="text-3xl font-extrabold text-white">{stats.longestStreak}</div>
              <span className="text-xs font-semibold text-slate-500 mt-1.5 block">Longest Record</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div
              className="rounded-xl"
              style={{
                padding: '16px',
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid rgba(255, 255, 255, 0.05)',
              }}
            >
              <span className="text-lg font-bold text-slate-200">{stats.weeklySolved}</span>
              <span className="text-xs text-slate-500 block mt-1">Solved this week</span>
            </div>
            <div
              className="rounded-xl"
              style={{
                padding: '16px',
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid rgba(255, 255, 255, 0.05)',
              }}
            >
              <span className="text-lg font-bold text-slate-200">{stats.monthlySolved}</span>
              <span className="text-xs text-slate-500 block mt-1">Solved this month</span>
            </div>
          </div>
        </div>

        {/* Activity & Knowledge Base */}
        <div className="glass-card rounded-2xl space-y-5" style={{ padding: '28px' }}>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-500/12 border border-indigo-500/25 text-indigo-400">
              <Award size={18} />
            </div>
            <h2 className="text-base font-bold text-white">Study Vault</h2>
          </div>

          <div className="space-y-4">
            {[
              { label: 'Detailed Notes', value: `${stats.notesCount} problems`, color: 'text-indigo-400' },
              { label: 'Diagrams & Images', value: `${stats.imagesCount} uploads`, color: 'text-indigo-400' },
              { label: 'Active Study Days', value: `${stats.totalActiveDays} days`, color: 'text-emerald-400' },
            ].map((item, i) => (
              <div
                key={i}
                className="flex justify-between items-center rounded-xl"
                style={{
                  padding: '14px 16px',
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid rgba(255, 255, 255, 0.05)',
                }}
              >
                <span className="text-sm font-medium text-slate-300">{item.label}</span>
                <span className={`text-sm font-bold ${item.color}`}>{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Mini Calendar Heatmap */}
        <div className="glass-card rounded-2xl space-y-5" style={{ padding: '28px' }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-500/12 border border-emerald-500/25 text-emerald-400">
                <TrendingUp size={18} />
              </div>
              <h2 className="text-base font-bold text-white">Activity Pulse</h2>
            </div>
            <span className="text-[11px] font-semibold text-slate-500">Last 90 Days</span>
          </div>

          <div className="flex flex-wrap gap-1.5 pt-1">
            {(() => {
              const days = [];
              const today = new Date();
              const activityMap = new Map(
                stats.dailyActivity.map((a) => [a.date, a.problemsSolved + a.revisionsCompleted])
              );
              for (let i = 70; i >= 0; i--) {
                const d = new Date(today);
                d.setDate(d.getDate() - i);
                const key = d.toISOString().split('T')[0];
                const count = activityMap.get(key) || 0;
                let bg = 'rgba(255, 255, 255, 0.04)';
                let border = 'rgba(255, 255, 255, 0.06)';
                if (count >= 5) {
                  bg = '#10b981';
                  border = '#059669';
                } else if (count >= 3) {
                  bg = '#059669';
                  border = '#047857';
                } else if (count >= 1) {
                  bg = '#047857';
                  border = '#065f46';
                }
                days.push(
                  <div
                    key={key}
                    title={`${key}: ${count} problems`}
                    className="w-3.5 h-3.5 rounded-sm transition-transform hover:scale-125 cursor-pointer"
                    style={{ backgroundColor: bg, border: `1px solid ${border}` }}
                  />
                );
              }
              return days;
            })()}
          </div>

          <div className="flex justify-between items-center pt-2 text-xs text-slate-500">
            <span>Less active</span>
            <div className="flex gap-1.5 items-center">
              <div className="w-3 h-3 rounded-sm" style={{ background: 'rgba(255, 255, 255, 0.04)', border: '1px solid rgba(255, 255, 255, 0.06)' }} />
              <div className="w-3 h-3 rounded-sm bg-emerald-800 border border-emerald-700" />
              <div className="w-3 h-3 rounded-sm bg-emerald-600 border border-emerald-500" />
              <div className="w-3 h-3 rounded-sm bg-emerald-400 border border-emerald-300" />
            </div>
            <span>More active</span>
          </div>
        </div>
      </div>

      {/* Topic Progress Grid */}
      <div className="glass-card rounded-2xl space-y-7" style={{ padding: '32px 36px' }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-500/12 border border-indigo-500/25 text-indigo-400">
              <Layers size={18} />
            </div>
            <h2 className="text-lg font-bold text-white">Curriculum Topic Progress</h2>
          </div>
          <button
            onClick={() => navigate('/sheet')}
            className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
          >
            <span>View all in Sheet</span>
            <ChevronRight size={14} />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {stats.topicProgress.map((topic) => (
            <div
              key={topic.topicId}
              onClick={() => navigate('/sheet')}
              className="rounded-xl hover:border-indigo-500/25 transition-all cursor-pointer flex flex-col justify-between gap-3 group"
              style={{
                padding: '20px',
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid rgba(255, 255, 255, 0.05)',
              }}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-200 group-hover:text-indigo-400 transition-colors truncate">
                  {topic.name}
                </span>
                <span className="text-xs font-bold font-mono text-slate-400 ml-3 shrink-0">
                  {topic.solved} / {topic.total}
                </span>
              </div>

              <div className="space-y-2">
                <div className="progress-bar h-2">
                  <div
                    className="progress-bar-fill"
                    style={{
                      width: `${topic.percentage}%`,
                      background:
                        topic.percentage === 100
                          ? '#10b981'
                          : 'linear-gradient(90deg, #6366f1, #a78bfa)',
                    }}
                  />
                </div>
                <div className="flex justify-between items-center text-[11px] text-slate-500 font-medium">
                  <span>Progress</span>
                  <span className={topic.percentage === 100 ? 'text-emerald-400 font-bold' : 'text-slate-300'}>
                    {topic.percentage.toFixed(0)}%
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
