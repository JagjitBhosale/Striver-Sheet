import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import MainLayout from './components/layout/MainLayout';

// Pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import A2ZSheetPage from './pages/A2ZSheetPage';
import ProblemDetailPage from './pages/ProblemDetailPage';
import RevisionPage from './pages/RevisionPage';
import NotesPage from './pages/NotesPage';
import BookmarksPage from './pages/BookmarksPage';
import MistakesPage from './pages/MistakesPage';
import ImagesPage from './pages/ImagesPage';
import StatisticsPage from './pages/StatisticsPage';
import SearchPage from './pages/SearchPage';
import SettingsPage from './pages/SettingsPage';
import AdminImportPage from './pages/AdminImportPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  },
});

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Protected dashboard / sheet / personal tracker routes */}
            <Route element={<MainLayout />}>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/sheet" element={<A2ZSheetPage />} />
              <Route path="/problem/:id" element={<ProblemDetailPage />} />
              <Route path="/revision" element={<RevisionPage />} />
              <Route path="/notes" element={<NotesPage />} />
              <Route path="/bookmarks" element={<BookmarksPage />} />
              <Route path="/mistakes" element={<MistakesPage />} />
              <Route path="/images" element={<ImagesPage />} />
              <Route path="/statistics" element={<StatisticsPage />} />
              <Route path="/search" element={<SearchPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/admin/import" element={<AdminImportPage />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
        <Toaster
          position="bottom-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#181825',
              color: '#cdd6f4',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '10px',
              fontSize: '13px',
            },
          }}
        />
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
