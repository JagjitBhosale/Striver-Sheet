import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DownloadCloud, CheckCircle2, Database, RefreshCw, BookOpen, Layers } from 'lucide-react';
import api from '../lib/api';
import toast from 'react-hot-toast';

const AdminImportPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [importResult, setImportResult] = useState<any>(null);

  const { data: statsData, isLoading: loadingStats, refetch } = useQuery({
    queryKey: ['import-stats'],
    queryFn: async () => {
      const res = await api.get('/import/stats');
      return res.data;
    },
  });

  const importMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post('/import/a2z');
      return res.data;
    },
    onSuccess: (data) => {
      setImportResult(data);
      toast.success('A2Z Sheet data synchronized successfully!');
      queryClient.invalidateQueries({ queryKey: ['topics'] });
      queryClient.invalidateQueries({ queryKey: ['problems'] });
      queryClient.invalidateQueries({ queryKey: ['statistics'] });
      refetch();
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to import curriculum data');
    },
  });

  const stats = statsData?.data;

  return (
    <div className="page-container space-y-8" style={{ maxWidth: '900px' }}>
      <div className="page-header">
        <h1>
          <Database className="text-indigo-400" />
          Data Synchronization & Importer
        </h1>
        <p>Synchronize curriculum topics, subcategories, and questions from the Striver A2Z dataset.</p>
      </div>

      {/* Current DB State */}
      <div className="glass-card rounded-2xl space-y-6" style={{ padding: '32px 36px' }}>
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-white flex items-center gap-2.5">
            <Layers size={18} className="text-indigo-400" />
            Active Database Inventory
          </h2>
          <button
            onClick={() => refetch()}
            className="btn-secondary text-xs flex items-center gap-2 px-4 py-2"
          >
            <RefreshCw size={13} className={loadingStats ? 'animate-spin' : ''} />
            Check Counts
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div
            className="rounded-2xl space-y-2"
            style={{
              padding: '28px',
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid rgba(255, 255, 255, 0.06)',
            }}
          >
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Total Curriculum Topics</span>
            <p className="text-3xl font-extrabold text-indigo-400">{stats?.topicsCount ?? '...'}</p>
            <span className="text-xs text-slate-500">Categories from Step 1 to Step 18</span>
          </div>

          <div
            className="rounded-2xl space-y-2"
            style={{
              padding: '28px',
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid rgba(255, 255, 255, 0.06)',
            }}
          >
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Total Seeded Problems</span>
            <p className="text-3xl font-extrabold text-indigo-400">{stats?.problemsCount ?? '...'}</p>
            <span className="text-xs text-slate-500">Curated LeetCode & tutorial references</span>
          </div>
        </div>
      </div>

      {/* Import Action Card */}
      <div className="glass-card rounded-2xl space-y-6" style={{ padding: '32px 36px' }}>
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
          <div className="space-y-2">
            <h2 className="text-base font-bold text-white flex items-center gap-2.5">
              <BookOpen size={18} className="text-indigo-400" />
              Re-run Idempotent Seed Import
            </h2>
            <p className="text-xs text-slate-400 max-w-lg leading-relaxed">
              Executes a non-destructive upsert of all 18 topics and 431 questions. Existing progress markers,
              personal solution notes, bookmarks, and mistake logs will remain 100% untouched.
            </p>
          </div>

          <button
            disabled={importMutation.isPending}
            onClick={() => importMutation.mutate()}
            className="btn-primary px-7 py-3.5 font-bold text-sm flex items-center gap-2.5 whitespace-nowrap self-start sm:self-auto"
          >
            {importMutation.isPending ? (
              <>
                <RefreshCw size={16} className="animate-spin" />
                Importing...
              </>
            ) : (
              <>
                <DownloadCloud size={16} />
                Run Seed Import
              </>
            )}
          </button>
        </div>

        {importResult && (
          <div
            className="rounded-2xl text-emerald-300 space-y-4 mt-2"
            style={{
              padding: '28px',
              background: 'rgba(16, 185, 129, 0.08)',
              border: '1px solid rgba(16, 185, 129, 0.2)',
            }}
          >
            <div className="flex items-center gap-2.5 font-bold text-emerald-400">
              <CheckCircle2 size={20} />
              <span>Import Completed Successfully</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              {[
                { label: 'Topics Created', value: importResult.stats?.topicsImported ?? 0 },
                { label: 'Topics Updated', value: importResult.stats?.topicsUpdated ?? 0 },
                { label: 'Problems Created', value: importResult.stats?.problemsImported ?? 0 },
                { label: 'Problems Updated', value: importResult.stats?.problemsUpdated ?? 0 },
              ].map((item, i) => (
                <div
                  key={i}
                  className="rounded-xl"
                  style={{
                    padding: '14px 16px',
                    background: 'rgba(0, 0, 0, 0.15)',
                    border: '1px solid rgba(255, 255, 255, 0.04)',
                  }}
                >
                  {item.label}: <strong className="text-white block text-sm mt-1">{item.value}</strong>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminImportPage;
