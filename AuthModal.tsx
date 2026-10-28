import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { X, Lock, Mail, User as UserIcon, CheckCircle2, ArrowRight } from 'lucide-react';

export const AuthModal: React.FC = () => {
  const { authModal, closeAuthModal, login, register } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>(authModal.mode);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Sync mode if parent opened with specific mode
  React.useEffect(() => {
    setMode(authModal.mode);
    setError(null);
  }, [authModal.mode, authModal.isOpen]);

  if (!authModal.isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      if (mode === 'login') {
        await login(email, password);
      } else {
        if (!name.trim()) {
          throw new Error('Please enter your full name or business owner name');
        }
        await register(name, email, password);
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDemoLogin = async () => {
    setError(null);
    setSubmitting(true);
    try {
      await login('owner@hublivo.com', 'password123');
    } catch (err: any) {
      setError(err.message || 'Demo login failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-md bg-[#0D1812] border border-[#1F3929] rounded-2xl shadow-2xl overflow-hidden p-6 sm:p-8"
        role="dialog"
        aria-modal="true"
      >
        {/* Close Button */}
        <button
          onClick={closeAuthModal}
          className="absolute top-5 right-5 p-2 text-[#82998B] hover:text-[#E8F2EC] hover:bg-[#162B1F] rounded-lg transition-colors"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <span className="text-xs uppercase tracking-wider font-semibold text-emerald-400">Business Owner Portal</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-[#F0F5F2]">
            {mode === 'login' ? 'Welcome back to Hublivo' : 'Create your business account'}
          </h2>
          <p className="text-sm text-[#8EA396] mt-1">
            {mode === 'login'
              ? 'Log in to manage and update your portfolio.'
              : 'Create and publish your business portfolio in under 5 minutes.'}
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex p-1 bg-[#09120D] rounded-xl border border-[#1A3323] mb-6">
          <button
            type="button"
            onClick={() => { setMode('login'); setError(null); }}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-colors ${
              mode === 'login'
                ? 'bg-[#183121] text-emerald-300 shadow-sm'
                : 'text-[#8EA396] hover:text-[#E8F2EC]'
            }`}
          >
            Log In
          </button>
          <button
            type="button"
            onClick={() => { setMode('register'); setError(null); }}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-colors ${
              mode === 'register'
                ? 'bg-[#183121] text-emerald-300 shadow-sm'
                : 'text-[#8EA396] hover:text-[#E8F2EC]'
            }`}
          >
            Sign Up
          </button>
        </div>

        {/* Quick Demo Button */}
        <button
          type="button"
          onClick={handleDemoLogin}
          disabled={submitting}
          className="w-full mb-5 py-2.5 px-4 bg-[#14291B] hover:bg-[#1A3523] border border-emerald-800/60 rounded-xl text-xs font-medium text-emerald-300 flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>One-Click Demo Owner Sign In (Elena Vance)</span>
        </button>

        <div className="relative flex py-2 items-center mb-5">
          <div className="flex-grow border-t border-[#1C3626]"></div>
          <span className="flex-shrink mx-3 text-xs text-[#5F7568]">or with email</span>
          <div className="flex-grow border-t border-[#1C3626]"></div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-950/60 border border-red-800/80 text-red-200 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <div>
              <label className="block text-xs font-medium text-[#B8CCC0] mb-1.5">
                Your Name or Business Name
              </label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-[#5F7568] absolute left-3 top-3.5" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Thomas Kavanagh"
                  className="w-full bg-[#0A140F] border border-[#1F3929] rounded-xl pl-9 pr-3.5 py-2.5 text-sm text-[#F0F5F2] placeholder-[#4F6357] focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-[#B8CCC0] mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#5F7568] absolute left-3 top-3.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@business.com"
                className="w-full bg-[#0A140F] border border-[#1F3929] rounded-xl pl-9 pr-3.5 py-2.5 text-sm text-[#F0F5F2] placeholder-[#4F6357] focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#B8CCC0] mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#5F7568] absolute left-3 top-3.5" />
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="w-full bg-[#0A140F] border border-[#1F3929] rounded-xl pl-9 pr-3.5 py-2.5 text-sm text-[#F0F5F2] placeholder-[#4F6357] focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full mt-2 py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-colors shadow-lg shadow-emerald-950/40 disabled:opacity-50"
          >
            <span>{submitting ? 'Please wait...' : mode === 'login' ? 'Log In' : 'Create Business Account'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <p className="mt-5 text-center text-xs text-[#738A7C]">
          No technical setup required. Build & publish your page today.
        </p>
      </div>
    </div>
  );
};
