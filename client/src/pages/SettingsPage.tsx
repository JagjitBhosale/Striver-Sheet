import React, { useState } from 'react';
import { Settings, User, Code, Shield, Save, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const SettingsPage: React.FC = () => {
  const { user } = useAuth();
  const [preferredLanguage, setPreferredLanguage] = useState('cpp');
  const [autoSaveInterval, setAutoSaveInterval] = useState('2000');
  const [editorFontSize, setEditorFontSize] = useState('14');
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem(
      'dsa_tracker_settings',
      JSON.stringify({
        preferredLanguage,
        autoSaveInterval,
        editorFontSize,
      })
    );
    setSaved(true);
    toast.success('Preferences updated successfully!');
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="page-container space-y-8" style={{ maxWidth: '900px' }}>
      <div className="page-header">
        <h1>
          <Settings className="text-indigo-400" />
          Settings & Preferences
        </h1>
        <p>Configure your code editor preferences, default languages, and personal tracking environment.</p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Profile Details */}
        <div className="glass-card rounded-2xl space-y-6" style={{ padding: '32px 36px' }}>
          <h2 className="text-base font-bold text-white flex items-center gap-2.5">
            <User size={18} className="text-indigo-400" />
            Profile Account
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                Full Name
              </label>
              <input
                type="text"
                disabled
                value={user?.name || ''}
                className="input-field w-full px-4 py-3 text-sm opacity-75 cursor-not-allowed"
                style={{ background: 'rgba(0, 0, 0, 0.15)' }}
              />
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                Email Address
              </label>
              <input
                type="email"
                disabled
                value={user?.email || ''}
                className="input-field w-full px-4 py-3 text-sm opacity-75 cursor-not-allowed"
                style={{ background: 'rgba(0, 0, 0, 0.15)' }}
              />
            </div>
          </div>
        </div>

        {/* Code & Editor Settings */}
        <div className="glass-card rounded-2xl space-y-6" style={{ padding: '32px 36px' }}>
          <h2 className="text-base font-bold text-white flex items-center gap-2.5">
            <Code size={18} className="text-indigo-400" />
            Code Editor & Solutions
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                Default Language
              </label>
              <select
                value={preferredLanguage}
                onChange={(e) => setPreferredLanguage(e.target.value)}
                className="input-field w-full px-4 py-3 text-sm cursor-pointer"
              >
                <option value="cpp">C++ (Default)</option>
                <option value="java">Java</option>
                <option value="python">Python</option>
                <option value="javascript">JavaScript</option>
                <option value="typescript">TypeScript</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                Auto-save Delay
              </label>
              <select
                value={autoSaveInterval}
                onChange={(e) => setAutoSaveInterval(e.target.value)}
                className="input-field w-full px-4 py-3 text-sm cursor-pointer"
              >
                <option value="1000">1.0 second</option>
                <option value="2000">2.0 seconds</option>
                <option value="3000">3.0 seconds</option>
                <option value="5000">5.0 seconds</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                Editor Font Size
              </label>
              <select
                value={editorFontSize}
                onChange={(e) => setEditorFontSize(e.target.value)}
                className="input-field w-full px-4 py-3 text-sm cursor-pointer"
              >
                <option value="12">12px (Compact)</option>
                <option value="14">14px (Standard)</option>
                <option value="16">16px (Spacious)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Security & Data */}
        <div className="glass-card rounded-2xl space-y-4" style={{ padding: '32px 36px' }}>
          <h2 className="text-base font-bold text-white flex items-center gap-2.5">
            <Shield size={18} className="text-indigo-400" />
            Security & Media Hosting
          </h2>

          <p className="text-xs text-slate-400 leading-relaxed max-w-2xl">
            All your code solutions, complexity benchmarks, and personal notes are scoped to your user account.
            Visual diagrams and whiteboard screenshots are uploaded directly to your Cloudinary storage account.
          </p>
        </div>

        {/* Save button */}
        <div className="flex justify-end pt-3">
          <button
            type="submit"
            className="btn-primary px-8 py-3.5 text-sm font-bold flex items-center gap-2.5"
          >
            {saved ? <Check size={16} /> : <Save size={16} />}
            {saved ? 'Saved Successfully!' : 'Save Preferences'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SettingsPage;
