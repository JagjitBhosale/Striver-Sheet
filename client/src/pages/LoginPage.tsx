import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Zap, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast.success('Welcome back!');
      navigate('/');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <div className="w-full max-w-md animate-fadeIn">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3.5 mb-10">
          <div
            className="w-13 h-13 rounded-xl flex items-center justify-center"
            style={{
              width: '52px',
              height: '52px',
              background: 'linear-gradient(135deg, #6366f1, #a78bfa)',
              boxShadow: '0 4px 20px rgba(99, 102, 241, 0.35)',
            }}
          >
            <Zap size={26} color="white" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">DSA Tracker</h1>
        </div>

        <div className="glass-card" style={{ padding: '40px 36px' }}>
          <h2 className="text-xl font-semibold mb-2 text-white">Welcome back</h2>
          <p className="text-sm mb-8 text-slate-500">Sign in to continue your DSA journey</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-400">Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input-field py-3" placeholder="your@email.com" required />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-400">Password</label>
              <div className="relative">
                <input type={showPass ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} className="input-field pr-12 py-3" placeholder="••••••••" required />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors">
                  {showPass ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3 text-sm font-semibold" style={{ opacity: loading ? 0.7 : 1, marginTop: '8px' }}>
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p className="text-sm text-center mt-8 text-slate-500">
            Don't have an account? <Link to="/register" className="font-semibold text-indigo-400 hover:text-indigo-300 transition-colors">Sign up</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
