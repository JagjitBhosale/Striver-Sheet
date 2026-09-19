import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Bookmark, ChevronRight, BookmarkCheck } from 'lucide-react';
import api from '../lib/api';

const BookmarksPage: React.FC = () => {
  const navigate = useNavigate();

  const { data, isLoading } = useQuery({
    queryKey: ['bookmarks'],
    queryFn: async () => (await api.get('/progress/bookmarks')).data.data,
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
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="glass-card h-24 skeleton rounded-2xl" />
        ))}
      </div>
    );
  }

  const bookmarks = data || [];

  return (
    <div className="page-container space-y-8">
      <div className="page-header">
        <h1>
          <Bookmark className="text-amber-400" />
          Bookmarked Problems
        </h1>
        <p>{bookmarks.length} high-yield problems flagged for interview preparation and fast review.</p>
      </div>

      {bookmarks.length === 0 ? (
        <div className="empty-state">
          <BookmarkCheck size={36} className="empty-state-icon text-amber-400" />
          <h3>No Bookmarks Saved</h3>
          <p>
            Click the bookmark icon on any problem in the A2Z Sheet to save it here for targeted revision.
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {bookmarks.map((item: any) => (
            <div
              key={item._id}
              onClick={() => navigate(`/problem/${item.problemId?._id}`)}
              className="glass-card rounded-2xl cursor-pointer transition-all flex items-center justify-between gap-4 group"
              style={{ padding: '22px 28px' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'rgba(245, 158, 11, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
              }}
            >
              <div className="flex items-center gap-4 min-w-0">
                <div
                  className="p-2.5 rounded-xl text-amber-400 shrink-0"
                  style={{
                    background: 'rgba(245, 158, 11, 0.1)',
                    border: '1px solid rgba(245, 158, 11, 0.15)',
                  }}
                >
                  <Bookmark size={17} fill="#f59e0b" />
                </div>
                <div className="min-w-0">
                  <span className="text-sm font-bold text-white group-hover:text-amber-400 transition-colors block truncate">
                    {item.problemId?.title || 'Untitled Problem'}
                  </span>
                  {item.problemId?.topicId?.name && (
                    <span className="text-xs text-slate-500 mt-1 block">
                      {item.problemId.topicId.name}
                    </span>
                  )}
                </div>
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
  );
};

export default BookmarksPage;
