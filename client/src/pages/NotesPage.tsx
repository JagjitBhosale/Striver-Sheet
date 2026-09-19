import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { FileText, Clock, ChevronRight, BookOpen } from 'lucide-react';
import api from '../lib/api';

const NotesPage: React.FC = () => {
  const navigate = useNavigate();

  const { data, isLoading } = useQuery({
    queryKey: ['notes'],
    queryFn: async () => (await api.get('/notes')).data,
  });

  if (isLoading) {
    return (
      <div className="page-container space-y-6">
        <div className="h-10 w-48 skeleton" />
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="glass-card h-32 skeleton rounded-2xl" />
        ))}
      </div>
    );
  }

  const notes = data?.data || [];

  return (
    <div className="page-container space-y-8">
      <div className="page-header">
        <h1>
          <FileText className="text-indigo-400" />
          Personal Notes & Solutions
        </h1>
        <p>{notes.length} problems with customized solution walkthroughs, intuition, and complexity analyses.</p>
      </div>

      {notes.length === 0 ? (
        <div className="empty-state">
          <BookOpen size={36} className="empty-state-icon text-indigo-400" />
          <h3>No Notes Recorded Yet</h3>
          <p>
            Open any problem in the A2Z Sheet to document your thought process, Brute/Better/Optimal code, and interview tricks.
          </p>
        </div>
      ) : (
        <div className="grid gap-5">
          {notes.map((note: any) => (
            <div
              key={note._id}
              onClick={() => navigate(`/problem/${note.problemId?._id}`)}
              className="glass-card rounded-2xl cursor-pointer transition-all group"
              style={{ padding: '24px 28px' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
              }}
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-2 min-w-0">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      {note.problemId?.topicId?.name && (
                        <span className="text-xs font-semibold px-3 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/15 text-indigo-400">
                          {note.problemId.topicId.name}
                        </span>
                      )}
                      {note.patternUsed && (
                        <span className="text-xs px-3 py-1 rounded-lg bg-purple-500/10 border border-purple-500/15 text-purple-400">
                          {note.patternUsed}
                        </span>
                      )}
                    </div>
                    <h3 className="text-base font-bold text-white group-hover:text-indigo-400 transition-colors truncate">
                      {note.problemId?.title || 'Untitled Problem'}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2.5 shrink-0">
                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                      <Clock size={13} />
                      <span>{new Date(note.updatedAt).toLocaleDateString()}</span>
                    </div>
                    <ChevronRight size={16} className="text-slate-600 group-hover:text-white transition-colors" />
                  </div>
                </div>

                {note.keyIdea && (
                  <p
                    className="text-xs text-slate-300 line-clamp-2 rounded-xl"
                    style={{
                      padding: '12px 16px',
                      background: 'rgba(0, 0, 0, 0.15)',
                      border: '1px solid rgba(255, 255, 255, 0.04)',
                    }}
                  >
                    <strong className="text-slate-400">Key Idea: </strong>
                    {note.keyIdea.replace(/<[^>]*>?/gm, '')}
                  </p>
                )}

                <div className="flex items-center gap-2.5 pt-1">
                  {note.brute?.content && (
                    <span className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-white/4 border border-white/5 text-slate-300">
                      🔨 Brute
                    </span>
                  )}
                  {note.better?.content && (
                    <span className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-white/4 border border-white/5 text-slate-300">
                      ⚡ Better
                    </span>
                  )}
                  {note.optimal?.content && (
                    <span className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-indigo-500/8 border border-indigo-500/15 text-indigo-400">
                      🚀 Optimal
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NotesPage;
