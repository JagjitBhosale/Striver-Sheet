import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, ChevronRight, ShieldAlert } from 'lucide-react';
import api from '../lib/api';

const MistakesPage: React.FC = () => {
  const navigate = useNavigate();

  const { data, isLoading } = useQuery({
    queryKey: ['mistakes'],
    queryFn: async () => (await api.get('/mistakes')).data,
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

  if (isLoading) {
    return (
      <div className="page-container space-y-6">
        <div className="h-10 w-48 skeleton" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="glass-card h-32 skeleton rounded-2xl" />
        ))}
      </div>
    );
  }

  const mistakes = data?.data || [];

  return (
    <div className="page-container space-y-8">
      <div className="page-header">
        <h1>
          <AlertTriangle className="text-rose-400" />
          Mistake Log & Pitfalls
        </h1>
        <p>Catalog of common pitfalls, misconceptions, and lessons learned to prevent repeating bugs.</p>
      </div>

      {mistakes.length === 0 ? (
        <div className="empty-state">
          <ShieldAlert size={36} className="empty-state-icon text-rose-400" />
          <h3>No Mistakes Recorded</h3>
          <p>
            Log wrong assumptions or bugs in problem details to track your growth and reinforce error patterns.
          </p>
        </div>
      ) : (
        <div className="grid gap-5">
          {mistakes.map((m: any) => (
            <div
              key={m._id}
              onClick={() => navigate(`/problem/${m.problemId?._id}`)}
              className="glass-card rounded-2xl cursor-pointer transition-all group"
              style={{
                padding: '28px 32px',
                borderColor: 'rgba(244, 63, 94, 0.15)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'rgba(244, 63, 94, 0.35)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(244, 63, 94, 0.15)';
              }}
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3 flex-wrap">
                    <div
                      className="p-2 rounded-lg text-rose-400"
                      style={{
                        background: 'rgba(244, 63, 94, 0.1)',
                        border: '1px solid rgba(244, 63, 94, 0.15)',
                      }}
                    >
                      <AlertTriangle size={15} />
                    </div>
                    <h3 className="text-base font-bold text-white group-hover:text-rose-400 transition-colors">
                      {m.problemId?.title || 'Problem Mistake'}
                    </h3>
                    <span className={`badge ${getDiffBadgeClass(m.problemId?.difficulty)}`}>
                      {m.problemId?.difficulty || 'Medium'}
                    </span>
                  </div>

                  <ChevronRight size={16} className="text-slate-600 group-hover:text-white transition-colors shrink-0 mt-1" />
                </div>

                {m.mistake && (
                  <div
                    className="rounded-xl space-y-1.5"
                    style={{
                      padding: '16px 20px',
                      background: 'rgba(0, 0, 0, 0.15)',
                      border: '1px solid rgba(255, 255, 255, 0.04)',
                    }}
                  >
                    <span className="text-[11px] font-bold uppercase tracking-wider text-rose-400 block">
                      What went wrong
                    </span>
                    <p className="text-xs text-slate-300 leading-relaxed">{m.mistake}</p>
                  </div>
                )}

                {m.lesson && (
                  <div
                    className="rounded-xl space-y-1.5"
                    style={{
                      padding: '16px 20px',
                      background: 'rgba(16, 185, 129, 0.04)',
                      border: '1px solid rgba(16, 185, 129, 0.12)',
                    }}
                  >
                    <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 block">
                      Lesson & Rule of Thumb
                    </span>
                    <p className="text-xs text-emerald-200 leading-relaxed">{m.lesson}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MistakesPage;
