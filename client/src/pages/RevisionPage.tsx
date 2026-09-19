import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { RotateCcw, AlertTriangle, Clock, CalendarDays, ChevronRight, CheckCircle2 } from 'lucide-react';
import api from '../lib/api';

const RevisionPage: React.FC = () => {
  const navigate = useNavigate();

  const { data, isLoading } = useQuery({
    queryKey: ['revision'],
    queryFn: async () => (await api.get('/progress/revision')).data.data,
  });

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

  const Section: React.FC<{
    title: string;
    subtitle: string;
    icon: React.ReactNode;
    items: any[];
    badgeClass: string;
    borderAccent: string;
  }> = ({ title, subtitle, icon, items, badgeClass, borderAccent }) => (
    <div className={`glass-card rounded-2xl border ${borderAccent}`} style={{ padding: '28px 32px' }}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="p-2.5 rounded-xl bg-white/4 border border-white/8">
              {icon}
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-base font-bold text-white">{title}</h2>
                <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${badgeClass}`}>
                  {items.length}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">{subtitle}</p>
            </div>
          </div>
        </div>

        {items.length === 0 ? (
          <div
            className="text-center rounded-xl space-y-2"
            style={{
              padding: '40px 24px',
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid rgba(255, 255, 255, 0.05)',
            }}
          >
            <CheckCircle2 size={24} className="mx-auto text-emerald-400 opacity-50" />
            <p className="text-sm font-medium text-slate-300">All caught up here!</p>
            <p className="text-xs text-slate-500">No problems scheduled in this revision window.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((item: any) => (
              <div
                key={item._id}
                onClick={() => navigate(`/problem/${item.problemId?._id}`)}
                className="flex items-center justify-between gap-4 rounded-xl cursor-pointer group transition-all"
                style={{
                  padding: '18px 20px',
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid rgba(255, 255, 255, 0.05)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.25)';
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.035)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.05)';
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)';
                }}
              >
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-semibold text-slate-200 group-hover:text-indigo-400 transition-colors block truncate">
                    {item.problemId?.title || 'Problem'}
                  </span>
                  <span className="text-xs text-slate-500 mt-1 block">
                    Scheduled: {item.nextRevision ? new Date(item.nextRevision).toLocaleDateString() : 'Today'}
                  </span>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className={`badge ${getDiffBadgeClass(item.problemId?.difficulty)}`}>
                    {item.problemId?.difficulty || 'Medium'}
                  </span>
                  <ChevronRight size={16} className="text-slate-600 group-hover:text-white transition-colors" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="page-container space-y-6">
        <div className="h-10 w-48 skeleton" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="glass-card h-40 skeleton rounded-2xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="page-container space-y-8">
      <div className="page-header">
        <h1>
          <RotateCcw className="text-indigo-400" />
          Revision Matrix
        </h1>
        <p>Automated spaced repetition review pipeline to cement DSA concepts into long-term memory.</p>
      </div>

      <div className="space-y-6">
        <Section
          title="Overdue Revisions"
          subtitle="Problems past their target revision date"
          icon={<AlertTriangle size={20} className="text-rose-400" />}
          items={data?.overdue || []}
          badgeClass="bg-rose-500/12 text-rose-400 border-rose-500/25"
          borderAccent="border-rose-500/15"
        />

        <Section
          title="Due Today"
          subtitle="Scheduled for reinforcement today"
          icon={<Clock size={20} className="text-amber-400" />}
          items={data?.today || []}
          badgeClass="bg-amber-500/12 text-amber-400 border-amber-500/25"
          borderAccent="border-amber-500/15"
        />

        <Section
          title="Upcoming (Next 7 Days)"
          subtitle="Scheduled revisions coming up this week"
          icon={<CalendarDays size={20} className="text-indigo-400" />}
          items={data?.upcoming || []}
          badgeClass="bg-indigo-500/12 text-indigo-400 border-indigo-500/25"
          borderAccent="border-white/8"
        />
      </div>
    </div>
  );
};

export default RevisionPage;
