import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Image as ImageIcon, ExternalLink, Calendar } from 'lucide-react';
import api from '../lib/api';

const ImagesPage: React.FC = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['images'],
    queryFn: async () => (await api.get('/uploads/images')).data,
  });

  if (isLoading) {
    return (
      <div className="page-container space-y-6">
        <div className="h-10 w-48 skeleton" />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="glass-card h-52 skeleton rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  const images = data?.data || [];

  return (
    <div className="page-container space-y-8">
      <div className="page-header">
        <h1>
          <ImageIcon className="text-indigo-400" />
          Visual Diagram Gallery
        </h1>
        <p>{images.length} recursion trees, graph illustrations, and diagrams pasted into your problem notes.</p>
      </div>

      {images.length === 0 ? (
        <div className="empty-state">
          <ImageIcon size={36} className="empty-state-icon text-indigo-400" />
          <h3>No Visual Assets Yet</h3>
          <p>
            You can paste images (CTRL+V) directly into the TipTap note editor on any problem page. They will automatically upload and show up here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {images.map((img: any) => (
            <div
              key={img._id}
              className="glass-card overflow-hidden rounded-2xl transition-all group flex flex-col justify-between"
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
              }}
            >
              <div
                className="relative aspect-video overflow-hidden"
                style={{
                  background: 'rgba(0, 0, 0, 0.3)',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
                }}
              >
                <img
                  src={img.secureUrl}
                  alt={img.problemId?.title || 'Diagram'}
                  className="w-full h-full object-contain p-2.5 group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
                <a
                  href={img.secureUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute top-3 right-3 p-2 rounded-lg bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/80"
                  title="Open full size"
                >
                  <ExternalLink size={14} />
                </a>
              </div>

              <div style={{ padding: '16px 20px' }} className="space-y-1.5">
                <p className="text-xs font-bold text-white truncate">
                  {img.problemId?.title || 'General Diagram'}
                </p>
                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span className="flex items-center gap-1.5">
                    <Calendar size={11} />
                    {new Date(img.createdAt).toLocaleDateString()}
                  </span>
                  <span>{img.format?.toUpperCase()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ImagesPage;
