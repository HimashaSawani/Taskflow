'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import api from '../../lib/api';
import { setAuthData } from '../../lib/auth';
import { 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  Loader2, 
  Info, 
  Sparkles, 
  ArrowRight,
  RefreshCw,
  Users2,
  Filter
} from 'lucide-react';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const expired = searchParams.get('expired');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(
    expired ? 'Your session expired. Please sign in again.' : null
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await api.post('/auth/login', {
        email: email.trim(),
        password,
      });

      setAuthData(res.data.token, res.data.user);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  const handleFillCredentials = (demoType: 'admin' | 'user') => {
    if (demoType === 'admin') {
      setEmail('admin@taskflow.com');
      setPassword('AdminPassword123!');
    } else {
      setEmail('alex@taskflow.com');
      setPassword('Password123!');
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-slate-50">
      {/* Left Column: Form */}
      <div className="w-full lg:w-[52%] flex flex-col justify-between p-8 sm:p-14 md:p-20 bg-white">
        <div>
          {/* Brand */}
          <div className="flex items-center space-x-2.5 mb-10">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-600/20">
              <div className="grid grid-cols-2 gap-0.5 w-3.5 h-3.5">
                <div className="bg-white rounded-[1px]"></div>
                <div className="bg-white rounded-[1px]"></div>
                <div className="bg-white rounded-[1px]"></div>
                <div className="bg-white rounded-[1px]"></div>
              </div>
            </div>
            <span className="font-bold text-lg text-slate-800 tracking-tight">
              TaskFlow Pro
            </span>
          </div>

          <div className="max-w-md">
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">
              Welcome back
            </h1>
            <p className="text-sm text-slate-500 mb-6">
              Enter your credentials to access your team's workspace.
            </p>

            {/* Information Notice Callout matching Image 5 */}
            <div className="mb-6 p-4 rounded-xl bg-indigo-50/70 border border-indigo-100 flex items-start space-x-3 text-xs text-indigo-900 leading-relaxed">
              <Info className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
              <span>
                New accounts are provisioned by system administrators. Contact your IT department for access.
              </span>
            </div>

            {/* Quick Demo Pre-fill */}
            <div className="mb-6 p-3 rounded-xl bg-slate-50 border border-slate-200/80">
              <div className="flex items-center justify-between mb-2 text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                <span className="flex items-center space-x-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>1-Click Demo Accounts</span>
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleFillCredentials('admin')}
                  className="py-1.5 px-3 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold transition-all shadow-sm text-center"
                >
                  Admin Account
                </button>
                <button
                  type="button"
                  onClick={() => handleFillCredentials('user')}
                  className="py-1.5 px-3 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold transition-all shadow-sm text-center"
                >
                  Member Account
                </button>
              </div>
            </div>

            {error && (
              <div className="mb-6 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 text-xs font-medium">
                {error}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Work Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@company.com"
                    required
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50/60 border border-slate-200 rounded-xl text-slate-800 text-sm placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:bg-white transition-colors"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-700">
                    Password
                  </label>
                  <a href="#" className="text-xs text-indigo-600 hover:text-indigo-700 font-medium">
                    Forgot password?
                  </a>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-50/60 border border-slate-200 rounded-xl text-slate-800 text-sm placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:bg-white transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="rememberMe"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"
                />
                <label htmlFor="rememberMe" className="ml-2 text-xs text-slate-600 select-none">
                  Remember this device for 30 days
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-600 text-white font-semibold text-sm shadow-md shadow-indigo-600/25 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In to TaskFlow</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* SSO Divider */}
            <div className="relative my-6 text-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200"></div>
              </div>
              <span className="relative bg-white px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Or continue with SSO
              </span>
            </div>

            {/* SSO Buttons */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <button
                type="button"
                className="flex items-center justify-center space-x-2 py-2.5 px-4 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors text-xs font-semibold text-slate-700 shadow-sm"
              >
                {/* Google G logo */}
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span>Google</span>
              </button>

              <button
                type="button"
                className="flex items-center justify-center space-x-2 py-2.5 px-4 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors text-xs font-semibold text-slate-700 shadow-sm"
              >
                {/* Microsoft logo */}
                <svg className="w-4 h-4" viewBox="0 0 21 21">
                  <rect x="1" y="1" width="9" height="9" fill="#f25022" />
                  <rect x="11" y="1" width="9" height="9" fill="#7fba00" />
                  <rect x="1" y="11" width="9" height="9" fill="#00a4ef" />
                  <rect x="11" y="11" width="9" height="9" fill="#ffb900" />
                </svg>
                <span>Microsoft</span>
              </button>
            </div>

            <p className="text-center text-xs text-slate-500">
              Don't have an account?{' '}
              <Link href="/register" className="text-indigo-600 hover:underline font-semibold">
                Request access
              </Link>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between text-xs text-slate-400 pt-8 border-t border-slate-100 max-w-md">
          <span>© 2026 TaskFlow Inc.</span>
          <div className="flex space-x-4">
            <a href="#" className="hover:text-slate-600">Privacy</a>
            <a href="#" className="hover:text-slate-600">Terms</a>
            <a href="#" className="hover:text-slate-600">Support</a>
          </div>
        </div>
      </div>

      {/* Right Column: 3D Illustration & Visuals (Image 5) */}
      <div className="hidden lg:flex lg:w-[48%] bg-gradient-to-br from-indigo-50 via-slate-100 to-purple-50 p-12 flex-col justify-center items-center text-center relative border-l border-slate-200">
        <div className="max-w-md w-full flex flex-col items-center">
          {/* 3D Illustration card */}
          <div className="w-full rounded-2xl overflow-hidden shadow-2xl shadow-indigo-500/10 border border-slate-200/80 mb-8 bg-white p-2">
            <img
              src="/project_flow_board.jpg"
              alt="TaskFlow Project Flow"
              className="w-full h-auto rounded-xl object-cover"
            />
          </div>

          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight mb-3">
            Organize Your Workflow Like a Pro
          </h2>
          <p className="text-xs text-slate-500 leading-relaxed mb-8 max-w-sm">
            Join thousands of teams who manage their product roadmaps, daily sprints, and marketing campaigns using TaskFlow's intuitive kanban interface.
          </p>

          {/* 3 Feature Pills */}
          <div className="flex items-center justify-center space-x-6 text-xs text-slate-600 font-medium">
            <div className="flex flex-col items-center space-y-1.5">
              <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                <RefreshCw className="w-4 h-4" />
              </div>
              <span className="text-[11px]">Real-time Sync</span>
            </div>

            <div className="flex flex-col items-center space-y-1.5">
              <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                <Users2 className="w-4 h-4" />
              </div>
              <span className="text-[11px]">Team Collab</span>
            </div>

            <div className="flex flex-col items-center space-y-1.5">
              <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                <Filter className="w-4 h-4" />
              </div>
              <span className="text-[11px]">Smart Filters</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="p-8 text-xs text-slate-400">Loading TaskFlow Pro...</div>}>
      <LoginForm />
    </Suspense>
  );
}
