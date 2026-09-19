import React, { useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import { useAuth } from '../../context/AuthContext';

const MainLayout: React.FC = () => {
  const { user, loading } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen" style={{ backgroundColor: 'var(--bg-primary)' }}>
        <div className="flex flex-col items-center gap-5">
          <div className="w-11 h-11 border-3 border-t-transparent rounded-full animate-spin border-indigo-500" />
          <p className="text-sm font-medium text-slate-400 tracking-wide">Loading your tracker...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <Sidebar collapsed={collapsed} onToggleCollapse={() => setCollapsed(!collapsed)} />
      <Header collapsed={collapsed} />
      <main
        className="min-h-screen transition-all duration-300"
        style={{
          marginLeft: collapsed ? 'var(--sidebar-collapsed-width)' : 'var(--sidebar-width)',
          paddingTop: 'calc(var(--header-height) + 8px)',
        }}
      >
        <div
          className="mx-auto animate-pageEnter"
          style={{
            padding: 'var(--page-padding)',
            paddingTop: '24px',
            maxWidth: '1280px',
          }}
        >
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default MainLayout;
