import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Sparkles } from 'lucide-react';

interface HeaderProps {
  collapsed?: boolean;
}

const Header: React.FC<HeaderProps> = ({ collapsed = false }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header
      className="fixed top-0 right-0 flex items-center justify-between px-8 z-30 transition-all duration-300 backdrop-blur-lg"
      style={{
        left: collapsed ? 'var(--sidebar-collapsed-width)' : 'var(--sidebar-width)',
        height: 'var(--header-height)',
        backgroundColor: 'rgba(11, 13, 20, 0.82)',
        borderBottom: '1px solid var(--border)',
        boxShadow: '0 1px 12px -2px rgba(0, 0, 0, 0.3)',
      }}
    >
      <form onSubmit={handleSearch} className="flex items-center gap-3 flex-1 max-w-xl">
        <div className="relative flex-1">
          <Search size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search problems, patterns, notes, mistakes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-field pl-11 pr-4 py-2.5 text-sm w-full"
            style={{ borderRadius: 'var(--radius-md)' }}
          />
        </div>
      </form>

      <div className="flex items-center gap-4">
        <div className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-500/8 border border-indigo-500/15 text-indigo-400 text-xs font-semibold tracking-wide">
          <Sparkles size={14} />
          <span>A2Z Sheet Sync Active</span>
        </div>

        <kbd className="hidden md:inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-mono text-slate-500 bg-white/4 border border-white/8">
          Ctrl+K
        </kbd>
      </div>
    </header>
  );
};

export default Header;
