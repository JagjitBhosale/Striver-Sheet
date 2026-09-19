import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, BookOpen, RotateCcw, FileText, Bookmark, AlertTriangle,
  ImageIcon, BarChart3, Search, Settings, LogOut, ChevronLeft, ChevronRight, Zap
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface SidebarProps {
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

const navItems = [
  { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/sheet', icon: BookOpen, label: 'A2Z Sheet' },
  { path: '/revision', icon: RotateCcw, label: 'Revision' },
  { path: '/notes', icon: FileText, label: 'Notes' },
  { path: '/bookmarks', icon: Bookmark, label: 'Bookmarks' },
  { path: '/mistakes', icon: AlertTriangle, label: 'Mistakes' },
  { path: '/images', icon: ImageIcon, label: 'Images' },
  { path: '/statistics', icon: BarChart3, label: 'Statistics' },
  { path: '/search', icon: Search, label: 'Search' },
  { path: '/settings', icon: Settings, label: 'Settings' },
];

const Sidebar: React.FC<SidebarProps> = ({ collapsed = false, onToggleCollapse }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <aside
      className="fixed left-0 top-0 h-screen flex flex-col z-40 transition-all duration-300 select-none"
      style={{
        width: collapsed ? 'var(--sidebar-collapsed-width)' : 'var(--sidebar-width)',
        backgroundColor: 'var(--bg-secondary)',
        borderRight: '1px solid var(--border)',
      }}
    >
      {/* Brand Header */}
      <div
        className="flex items-center gap-3 shrink-0"
        style={{
          height: 'var(--header-height)',
          padding: collapsed ? '0 16px' : '0 20px',
          borderBottom: '1px solid var(--border)',
        }}
      >
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
          style={{
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            boxShadow: '0 4px 16px -2px rgba(99, 102, 241, 0.4)',
          }}
        >
          <Zap size={20} color="white" />
        </div>
        {!collapsed && (
          <div className="flex flex-col min-w-0">
            <span className="font-bold text-[15px] tracking-tight text-white leading-tight">DSA Tracker</span>
            <span className="text-[11px] font-medium text-slate-500 leading-tight">Striver A2Z Mastery</span>
          </div>
        )}
      </div>

      {/* Nav Items */}
      <nav className="flex-1 py-5 px-3 space-y-1 overflow-y-auto">
        {navItems.map(({ path, icon: Icon, label }) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) =>
              `flex items-center gap-3.5 py-3 rounded-xl text-sm font-medium transition-all duration-150 border ${
                collapsed ? 'px-3 justify-center' : 'px-4'
              } ${
                isActive
                  ? 'bg-indigo-500/12 text-indigo-400 border-indigo-500/25 shadow-sm'
                  : 'text-slate-400 border-transparent hover:bg-white/4 hover:text-slate-200'
              }`
            }
            title={collapsed ? label : undefined}
          >
            <Icon size={19} className="shrink-0" />
            {!collapsed && <span>{label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Footer / User Profile */}
      <div className="p-3 space-y-2" style={{ borderTop: '1px solid var(--border)' }}>
        {/* Admin Import Link */}
        <NavLink
          to="/admin/import"
          className={({ isActive }) =>
            `flex items-center gap-3.5 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all border ${
              collapsed ? 'px-3 justify-center' : 'px-4'
            } ${
              isActive
                ? 'bg-indigo-500/12 text-indigo-400 border-indigo-500/25'
                : 'text-slate-500 border-transparent hover:bg-white/4 hover:text-slate-300'
            }`
          }
          title={collapsed ? 'Import Data' : undefined}
        >
          <BookOpen size={16} className="shrink-0" />
          {!collapsed && <span>Import Data</span>}
        </NavLink>

        {/* User Card */}
        {!collapsed && user && (
          <div
            className="flex items-center gap-3 p-3 rounded-xl"
            style={{
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid rgba(255, 255, 255, 0.06)',
            }}
          >
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
              style={{
                background: 'linear-gradient(135deg, #6366f1, #a855f7)',
                boxShadow: '0 2px 8px rgba(99, 102, 241, 0.3)',
              }}
            >
              {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-semibold truncate text-white leading-tight">{user.name}</p>
              <p className="text-[11px] truncate text-slate-500 leading-tight mt-0.5">{user.email}</p>
            </div>
          </div>
        )}

        <div className="flex items-center gap-1.5 pt-1">
          <button
            onClick={handleLogout}
            className="btn-ghost flex-1 justify-start text-xs font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-500/8"
            title={collapsed ? 'Logout' : undefined}
          >
            <LogOut size={16} />
            {!collapsed && <span>Logout</span>}
          </button>

          {onToggleCollapse && (
            <button
              onClick={onToggleCollapse}
              className="p-2.5 rounded-lg text-slate-500 hover:text-white hover:bg-white/5 transition-colors border border-transparent hover:border-white/8"
              title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            >
              {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
            </button>
          )}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
