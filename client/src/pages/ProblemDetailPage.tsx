import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ExternalLink, Video, FileText, Bookmark, BookmarkCheck,
  CheckCircle2, Circle, Clock, RotateCcw, ChevronLeft, Loader2,
  Code2, Copy, Check, Trash2, Upload, ZoomIn, X, Lightbulb, ImageIcon,
  RotateCcw as ResetIcon, Download
} from 'lucide-react';
import api from '../lib/api';
import { Problem, Progress, ProblemNote, Topic } from '../types';
import RichTextEditor from '../components/editor/RichTextEditor';
import toast from 'react-hot-toast';

const STATUSES = [
  { value: 'not_started', label: 'Not Started', icon: Circle, color: '#94a3b8' },
  { value: 'attempted', label: 'Attempted', icon: Clock, color: '#f59e0b' },
  { value: 'solved', label: 'Solved', icon: CheckCircle2, color: '#10b981' },
  { value: 'revision_required', label: 'Revision Due', icon: RotateCcw, color: '#f43f5e' },
];

const LANGUAGES = [
  { id: 'cpp', label: 'C++' },
  { id: 'java', label: 'Java' },
  { id: 'python', label: 'Python' },
  { id: 'javascript', label: 'JavaScript' },
  { id: 'typescript', label: 'TypeScript' },
  { id: 'go', label: 'Go' },
];

const ProblemDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const qc = useQueryClient();

  // State
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [code, setCode] = useState<string>('');
  const [language, setLanguage] = useState<string>('cpp');
  const [noteContent, setNoteContent] = useState<string>('');
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [uploadingImage, setUploadingImage] = useState<boolean>(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const saveTimeoutRef = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lineNumbersRef = useRef<HTMLDivElement>(null);

  // 1. Fetch problem details
  const { data: problem } = useQuery({
    queryKey: ['problem', id],
    queryFn: async () => (await api.get(`/problems/${id}`)).data.data as Problem,
    enabled: !!id,
  });

  // 2. Fetch progress
  const { data: progress } = useQuery({
    queryKey: ['progress', id],
    queryFn: async () => {
      const res = await api.get('/progress');
      const found = res.data.data.find((p: Progress) => p.problemId === id);
      return found as Progress | undefined;
    },
    enabled: !!id,
  });

  // 3. Fetch existing notes
  const { data: noteData } = useQuery({
    queryKey: ['notes', id],
    queryFn: async () => (await api.get(`/notes/${id}`)).data.data as ProblemNote,
    enabled: !!id,
  });

  // 4. Fetch uploaded images for this problem
  const { data: imagesData, refetch: refetchImages } = useQuery({
    queryKey: ['images', id],
    queryFn: async () => (await api.get('/uploads/images', { params: { problemId: id } })).data.data as any[],
    enabled: !!id,
  });

  // Sync initial note and code from backend
  useEffect(() => {
    if (noteData) {
      const existingCode =
        noteData.optimal?.code ||
        noteData.better?.code ||
        noteData.brute?.code ||
        '';
      const existingLang =
        noteData.optimal?.language ||
        noteData.better?.language ||
        noteData.brute?.language ||
        'cpp';
      const existingContent =
        noteData.optimal?.content ||
        noteData.keyIdea ||
        noteData.better?.content ||
        noteData.brute?.content ||
        '';

      setCode(existingCode);
      setLanguage(existingLang);
      setNoteContent(existingContent);
    }
  }, [noteData]);

  // Mutations
  const statusMutation = useMutation({
    mutationFn: async (status: string) => {
      await api.put(`/progress/${id}`, { status });
    },
    onSuccess: (_, status) => {
      qc.invalidateQueries({ queryKey: ['progress'] });
      qc.invalidateQueries({ queryKey: ['statistics'] });
      toast.success(`Status updated to ${status.replace('_', ' ')}`);
    },
  });

  const bookmarkMutation = useMutation({
    mutationFn: async (bookmarked: boolean) => {
      await api.put(`/progress/${id}`, { bookmarked });
    },
    onSuccess: (_, bookmarked) => {
      qc.invalidateQueries({ queryKey: ['progress'] });
      toast.success(bookmarked ? 'Added to bookmarks' : 'Removed from bookmarks');
    },
  });

  // Debounced Autosave to backend
  const persistNote = useCallback(
    async (codeToSave: string, langToSave: string, contentToSave: string) => {
      if (!id) return;
      setSaveStatus('saving');
      try {
        await api.put(`/notes/${id}`, {
          keyIdea: contentToSave,
          optimal: {
            content: contentToSave,
            code: codeToSave,
            language: langToSave,
          },
          brute: {
            content: '',
            code: codeToSave,
            language: langToSave,
          },
        });
        setSaveStatus('saved');
        qc.invalidateQueries({ queryKey: ['notes', id] });
        qc.invalidateQueries({ queryKey: ['statistics'] });
        setTimeout(() => setSaveStatus('idle'), 2500);
      } catch (err) {
        setSaveStatus('error');
        toast.error('Failed to autosave');
      }
    },
    [id, qc]
  );

  const scheduleAutosave = useCallback(
    (newCode: string, newLang: string, newContent: string) => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = setTimeout(() => {
        persistNote(newCode, newLang, newContent);
      }, 1200);
    },
    [persistNote]
  );

  const handleCodeChange = (val: string) => {
    setCode(val);
    scheduleAutosave(val, language, noteContent);
  };

  const handleLanguageChange = (lang: string) => {
    setLanguage(lang);
    scheduleAutosave(code, lang, noteContent);
  };

  const handleContentChange = (html: string) => {
    setNoteContent(html);
    scheduleAutosave(code, language, html);
  };

  // Code editor actions
  const handleCopyCode = () => {
    if (!code) {
      toast('No code to copy', { icon: 'ℹ️' });
      return;
    }
    navigator.clipboard.writeText(code);
    setIsCopied(true);
    toast.success('Code copied to clipboard!');
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleClearCode = () => {
    if (!code) return;
    if (window.confirm('Are you sure you want to clear the code editor?')) {
      setCode('');
      scheduleAutosave('', language, noteContent);
      toast.success('Code cleared');
    }
  };

  // Keyboard enhancements for code editor (Tab key indent, Enter auto-indent)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const target = e.currentTarget;
      const start = target.selectionStart;
      const end = target.selectionEnd;
      const newText = code.substring(0, start) + '  ' + code.substring(end);
      setCode(newText);
      scheduleAutosave(newText, language, noteContent);

      setTimeout(() => {
        target.selectionStart = target.selectionEnd = start + 2;
      }, 0);
    } else if (e.key === 'Enter') {
      const target = e.currentTarget;
      const start = target.selectionStart;
      const lines = code.substring(0, start).split('\n');
      const currentLine = lines[lines.length - 1];
      const match = currentLine.match(/^(\s+)/);
      if (match) {
        e.preventDefault();
        const indent = match[1];
        const newText = code.substring(0, start) + '\n' + indent + code.substring(target.selectionEnd);
        setCode(newText);
        scheduleAutosave(newText, language, noteContent);

        setTimeout(() => {
          target.selectionStart = target.selectionEnd = start + 1 + indent.length;
        }, 0);
      }
    }
  };

  // Sync line numbers scrolling with code textarea
  const handleScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
    if (lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = e.currentTarget.scrollTop;
    }
  };

  // Image Upload handler
  const handleUploadFiles = async (files: FileList | File[]) => {
    const imageFiles = Array.from(files).filter((f) => f.type.startsWith('image/'));
    if (imageFiles.length === 0) {
      toast.error('Please select valid image files (PNG, JPG, WEBP, etc.)');
      return;
    }

    setUploadingImage(true);
    let successCount = 0;

    for (const file of imageFiles) {
      try {
        const formData = new FormData();
        formData.append('image', file);
        if (id) formData.append('problemId', id);
        formData.append('noteSection', 'general');

        const { data } = await api.post('/uploads/image', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });

        if (data.success) {
          successCount++;
        }
      } catch (err) {
        console.error('Upload error:', err);
      }
    }

    setUploadingImage(false);
    if (successCount > 0) {
      toast.success(`${successCount} image${successCount > 1 ? 's' : ''} uploaded successfully!`);
      refetchImages();
      qc.invalidateQueries({ queryKey: ['images', id] });
    } else {
      toast.error('Failed to upload image. Please check file size.');
    }
  };

  // Global paste handler for pasting screenshots anywhere on the page
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      const imageFiles: File[] = [];
      for (const item of Array.from(items)) {
        if (item.type.startsWith('image/')) {
          const file = item.getAsFile();
          if (file) imageFiles.push(file);
        }
      }

      if (imageFiles.length > 0) {
        toast('Pasted image detected, uploading...', { icon: '📸' });
        handleUploadFiles(imageFiles);
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [id]);

  const handleDeleteImage = async (imageId: string) => {
    if (!window.confirm('Delete this image permanently?')) return;
    try {
      await api.delete(`/uploads/image/${imageId}`);
      toast.success('Image deleted');
      refetchImages();
      qc.invalidateQueries({ queryKey: ['images', id] });
    } catch (err) {
      toast.error('Failed to delete image');
    }
  };

  const handleCopyImageUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    toast.success('Image link copied to clipboard!');
  };

  // Skeleton loading
  if (!problem) {
    return (
      <div className="page-container space-y-8">
        <div className="h-9 w-36 skeleton rounded-xl" />
        <div className="h-48 w-full skeleton rounded-2xl" />
        <div className="h-32 w-full skeleton rounded-2xl" />
        <div className="h-72 w-full skeleton rounded-2xl" />
        <div className="h-[480px] w-full skeleton rounded-2xl" />
      </div>
    );
  }

  const topic = problem.topicId as Topic | undefined;
  const isBookmarked = progress?.bookmarked;
  const lineCount = Math.max(code.split('\n').length, 16);
  const images = imagesData || [];

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

  return (
    <div className="page-container space-y-8" style={{ maxWidth: '1080px' }}>
      {/* 1. TOP BAR: Back navigation + Cloud Save status */}
      <div className="flex items-center justify-between">
        <Link
          to="/sheet"
          className="inline-flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-400 hover:text-white transition-all"
          style={{
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
          }}
        >
          <ChevronLeft size={18} />
          <span>Back to Sheet</span>
        </Link>

        {/* Autosave Status */}
        <div
          className="flex items-center gap-2 text-xs font-medium rounded-xl"
          style={{
            padding: '8px 16px',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            background: 'rgba(255, 255, 255, 0.02)',
          }}
        >
          {saveStatus === 'idle' && (
            <span className="flex items-center gap-2 text-slate-500">
              <span className="w-2 h-2 rounded-full bg-slate-600" /> All changes synced
            </span>
          )}
          {saveStatus === 'saving' && (
            <span className="flex items-center gap-2 text-amber-400 font-semibold">
              <Loader2 size={13} className="animate-spin" /> Saving...
            </span>
          )}
          {saveStatus === 'saved' && (
            <span className="flex items-center gap-2 text-emerald-400 font-semibold">
              <Check size={14} /> Autosaved to cloud
            </span>
          )}
          {saveStatus === 'error' && (
            <span className="flex items-center gap-2 text-rose-400 font-semibold">
              Save failed
            </span>
          )}
        </div>
      </div>

      {/* 2. PROBLEM HEADER CARD */}
      <div className="glass-card rounded-2xl space-y-5" style={{ padding: '32px 36px' }}>
        {/* Topic + Difficulty + Bookmark */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-wrap">
            {topic && (
              <span
                className="text-xs font-semibold px-3 py-1.5 rounded-lg text-indigo-400"
                style={{
                  background: 'rgba(99, 102, 241, 0.12)',
                  border: '1px solid rgba(99, 102, 241, 0.25)',
                }}
              >
                {topic.name}
              </span>
            )}
            <span className={`badge px-3 py-1 ${getDiffBadgeClass(problem.difficulty)}`}>
              {problem.difficulty}
            </span>
          </div>

          <button
            onClick={() => bookmarkMutation.mutate(!isBookmarked)}
            className={`p-3 rounded-xl border transition-all ${
              isBookmarked
                ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                : 'bg-white/4 text-slate-500 border-white/8 hover:text-white hover:bg-white/8'
            }`}
            title={isBookmarked ? 'Bookmarked' : 'Add to bookmarks'}
          >
            {isBookmarked ? <BookmarkCheck size={20} /> : <Bookmark size={20} />}
          </button>
        </div>

        {/* Problem Title */}
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-snug">
          {problem.title}
        </h1>

        {/* Action Links */}
        <div className="flex flex-wrap items-center gap-3 pt-1">
          {problem.externalUrls?.leetcode && (
            <a
              href={problem.externalUrls.leetcode}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-amber-400 transition-all"
              style={{
                background: 'rgba(245, 158, 11, 0.08)',
                border: '1px solid rgba(245, 158, 11, 0.2)',
              }}
            >
              <ExternalLink size={14} />
              LeetCode
            </a>
          )}
          {problem.externalUrls?.youtube && (
            <a
              href={problem.externalUrls.youtube}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-rose-400 transition-all"
              style={{
                background: 'rgba(244, 63, 94, 0.08)',
                border: '1px solid rgba(244, 63, 94, 0.2)',
              }}
            >
              <Video size={14} />
              Video Editorial
            </a>
          )}
          {problem.externalUrls?.article && (
            <a
              href={problem.externalUrls.article}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-indigo-400 transition-all"
              style={{
                background: 'rgba(99, 102, 241, 0.08)',
                border: '1px solid rgba(99, 102, 241, 0.2)',
              }}
            >
              <FileText size={14} />
              Article Notes
            </a>
          )}
        </div>
      </div>

      {/* 3. STATUS CARD */}
      <div className="glass-card rounded-2xl space-y-5" style={{ padding: '32px 36px' }}>
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Progress Status
          </h3>
          <span className="text-xs text-slate-600 hidden sm:inline">
            Click to update your completion state
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {STATUSES.map(({ value, label, icon: Icon, color }) => {
            const active = (progress?.status || 'not_started') === value;
            return (
              <button
                key={value}
                onClick={() => statusMutation.mutate(value)}
                className={`flex items-center justify-center gap-3 rounded-xl text-xs font-bold transition-all border ${
                  active
                    ? 'border-indigo-400 bg-indigo-600/20 text-white shadow-lg ring-1 ring-indigo-400'
                    : 'border-white/8 bg-white/[0.02] text-slate-400 hover:bg-white/[0.05] hover:text-slate-200'
                }`}
                style={{ padding: '16px 20px' }}
              >
                <Icon size={16} style={{ color: active ? '#818cf8' : color }} />
                <span>{label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. IMAGES & VISUAL DIAGRAMS CARD */}
      <div className="glass-card rounded-2xl space-y-6" style={{ padding: '32px 36px' }}>
        {/* Heading */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ImageIcon size={20} className="text-indigo-400" />
            <h2 className="text-base font-bold text-white">Images & Visual Diagrams</h2>
            <span
              className="text-xs px-2.5 py-1 rounded-full text-slate-300 font-semibold"
              style={{
                background: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
              }}
            >
              {images.length}
            </span>
          </div>
          <span className="text-xs text-slate-500 hidden sm:inline">
            Paste anytime with <kbd className="px-2 py-0.5 rounded-md bg-white/8 text-slate-300 border border-white/8 text-[11px]">Ctrl+V</kbd>
          </span>
        </div>

        {/* Helper text */}
        <p className="text-xs text-slate-500 -mt-3">
          Upload whiteboard diagrams, recursion trees, or problem screenshots for quick visual revision.
        </p>

        {/* Upload Box */}
        <div
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            if (e.dataTransfer?.files) handleUploadFiles(e.dataTransfer.files);
          }}
          className="border-2 border-dashed border-white/12 hover:border-indigo-500/40 hover:bg-indigo-500/[0.02] rounded-2xl text-center cursor-pointer transition-all space-y-3 group"
          style={{ padding: '36px 28px' }}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => {
              if (e.target.files) handleUploadFiles(e.target.files);
              e.target.value = '';
            }}
          />

          <div
            className="w-14 h-14 rounded-2xl text-indigo-400 flex items-center justify-center mx-auto group-hover:scale-110 transition-transform"
            style={{
              background: 'rgba(99, 102, 241, 0.08)',
              border: '1px solid rgba(99, 102, 241, 0.15)',
            }}
          >
            {uploadingImage ? <Loader2 size={24} className="animate-spin" /> : <Upload size={24} />}
          </div>

          <div>
            <p className="text-sm font-semibold text-white">
              {uploadingImage ? 'Uploading image to cloud...' : 'Click to upload or drag & drop screenshots'}
            </p>
            <p className="text-xs text-slate-500 mt-1.5">
              Supports PNG, JPG, WEBP, GIF • High-resolution cloud storage
            </p>
          </div>
        </div>

        {/* Uploaded Screenshots Grid */}
        {images.length > 0 && (
          <div className="space-y-4 pt-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Uploaded Screenshots ({images.length})
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {images.map((img: any) => (
                <div
                  key={img._id}
                  className="group relative rounded-xl overflow-hidden aspect-video flex items-center justify-center shadow-md cursor-pointer transition-all"
                  style={{
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    background: 'rgba(0, 0, 0, 0.35)',
                  }}
                  onClick={() => setPreviewImage(img.secureUrl)}
                >
                  <img
                    src={img.secureUrl}
                    alt="Problem diagram"
                    className="w-full h-full object-contain p-1.5 group-hover:scale-105 transition-transform duration-300"
                  />

                  {/* Overlay actions */}
                  <div className="absolute inset-0 bg-black/65 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2.5 p-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setPreviewImage(img.secureUrl);
                      }}
                      className="p-2.5 rounded-lg bg-white/15 hover:bg-white/25 text-white transition-colors"
                      title="Zoom in"
                    >
                      <ZoomIn size={16} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCopyImageUrl(img.secureUrl);
                      }}
                      className="p-2.5 rounded-lg bg-white/15 hover:bg-white/25 text-white transition-colors"
                      title="Copy URL"
                    >
                      <Copy size={16} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteImage(img._id);
                      }}
                      className="p-2.5 rounded-lg bg-rose-500/70 hover:bg-rose-600 text-white transition-colors"
                      title="Delete image"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 5. SOLUTION CODE CARD */}
      <div className="glass-card rounded-2xl space-y-5" style={{ padding: '32px 36px' }}>
        {/* Code Card Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Code2 size={20} className="text-indigo-400" />
            <h2 className="text-base font-bold text-white">Solution Code</h2>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {/* Language Selector */}
            <div
              className="flex items-center gap-1.5 flex-wrap"
              style={{
                padding: '4px 6px',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(0, 0, 0, 0.3)',
                border: '1px solid rgba(255, 255, 255, 0.06)',
              }}
            >
              {LANGUAGES.map((l) => {
                const isActive = language === l.id;
                return (
                  <button
                    key={l.id}
                    onClick={() => handleLanguageChange(l.id)}
                    className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-indigo-600 text-white shadow-md'
                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {l.label}
                  </button>
                );
              })}
            </div>

            {/* Copy Button */}
            <button
              onClick={handleCopyCode}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold border transition-all ${
                isCopied
                  ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                  : 'bg-white/4 text-slate-300 border-white/8 hover:bg-white/8 hover:text-white'
              }`}
            >
              {isCopied ? <Check size={14} /> : <Copy size={14} />}
              <span>{isCopied ? 'Copied' : 'Copy'}</span>
            </button>

            {/* Clear Button */}
            <button
              onClick={handleClearCode}
              className="p-2.5 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-rose-500/8 border border-transparent hover:border-rose-500/15 transition-all"
              title="Clear code"
            >
              <ResetIcon size={16} />
            </button>
          </div>
        </div>

        {/* Code Editor Container */}
        <div
          className="relative flex font-mono text-xs sm:text-sm h-[480px] overflow-hidden"
          style={{
            background: '#090d16',
            border: '1px solid rgba(255, 255, 255, 0.06)',
            borderRadius: 'var(--radius-md)',
          }}
        >
          {/* Line Numbers Gutter */}
          <div
            ref={lineNumbersRef}
            className="select-none text-right text-slate-700 font-mono overflow-hidden shrink-0"
            style={{
              width: '56px',
              padding: '20px 12px 20px 16px',
              background: '#070a10',
              borderRight: '1px solid rgba(255, 255, 255, 0.04)',
            }}
          >
            {Array.from({ length: lineCount }, (_, i) => (
              <div key={i + 1} className="leading-[1.6rem] h-[1.6rem]">
                {i + 1}
              </div>
            ))}
          </div>

          {/* Textarea */}
          <textarea
            ref={textareaRef}
            value={code}
            onChange={(e) => handleCodeChange(e.target.value)}
            onKeyDown={handleKeyDown}
            onScroll={handleScroll}
            className="flex-1 bg-transparent font-mono text-slate-200 placeholder-slate-700 focus:outline-none resize-none overflow-y-auto leading-[1.6rem] transition-colors"
            style={{ padding: '20px' }}
            placeholder={`// Write or paste your ${LANGUAGES.find((l) => l.id === language)?.label || 'solution'} code here...`}
            spellCheck={false}
            autoCapitalize="none"
            autoComplete="off"
            autoCorrect="off"
          />
        </div>

        {/* Editor Footer */}
        <div
          className="flex items-center justify-between text-xs text-slate-500 font-mono"
          style={{
            padding: '12px 20px',
            background: 'rgba(0, 0, 0, 0.2)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid rgba(255, 255, 255, 0.04)',
          }}
        >
          <div className="flex items-center gap-5">
            <span>{code.split('\n').length} lines</span>
            <span>{code.length} chars</span>
          </div>
          <div className="flex items-center gap-2.5 uppercase tracking-wider text-[11px] text-slate-500 font-semibold">
            <span>Tab: 2 spaces</span>
            <span>•</span>
            <span className="text-indigo-400">{language}</span>
          </div>
        </div>
      </div>

      {/* 6. INTUITION & NOTES CARD */}
      <div className="glass-card rounded-2xl space-y-5" style={{ padding: '32px 36px' }}>
        <div className="flex items-center gap-3">
          <Lightbulb size={20} className="text-amber-400" />
          <h2 className="text-base font-bold text-white">Intuition & Notes</h2>
        </div>
        <p className="text-xs text-slate-500 -mt-2">
          Document your core insight, approach walkthrough, or edge cases. You can paste screenshots or formatted text directly here.
        </p>

        <div
          className="overflow-hidden"
          style={{
            borderRadius: 'var(--radius-xl)',
            border: '1px solid rgba(255, 255, 255, 0.06)',
            background: 'rgba(0, 0, 0, 0.12)',
          }}
        >
          <RichTextEditor
            content={noteContent}
            onChange={handleContentChange}
            placeholder="Write your explanation or notes here (supports formatting, lists, code snippets, and Ctrl+V image pasting)..."
            problemId={id}
            noteSection="general"
          />
        </div>
      </div>

      {/* 7. LIGHTBOX MODAL FOR IMAGE ZOOM */}
      {previewImage && (
        <div
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center animate-fadeIn"
          style={{ padding: '24px 32px' }}
          onClick={() => setPreviewImage(null)}
        >
          <div
            className="relative max-w-4xl max-h-[90vh] overflow-hidden"
            style={{
              background: '#111624',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: 'var(--radius-xl)',
              padding: '8px',
              boxShadow: '0 24px 64px -12px rgba(0, 0, 0, 0.7)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="absolute top-4 right-4 flex items-center gap-2.5 z-10">
              <a
                href={previewImage}
                target="_blank"
                rel="noopener noreferrer"
                download
                className="p-2.5 rounded-xl bg-black/60 hover:bg-black/80 text-white border border-white/15 transition-all"
                title="Open original"
              >
                <Download size={18} />
              </a>
              <button
                onClick={() => setPreviewImage(null)}
                className="p-2.5 rounded-xl bg-black/60 hover:bg-black/80 text-white border border-white/15 transition-all"
                title="Close"
              >
                <X size={18} />
              </button>
            </div>

            <img
              src={previewImage}
              alt="Enlarged diagram"
              className="max-w-full max-h-[82vh] object-contain mx-auto"
              style={{ borderRadius: 'var(--radius-md)' }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ProblemDetailPage;
