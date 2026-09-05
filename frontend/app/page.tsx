import Link from 'next/link';
import { 
  ArrowRight, 
  CheckCircle2, 
  LayoutGrid, 
  ShieldCheck, 
  Users2, 
  Sparkles,
  RefreshCw,
  Filter
} from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      {/* Navbar */}
      <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-30">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-600/20">
            <div className="grid grid-cols-2 gap-0.5 w-3.5 h-3.5">
              <div className="bg-white rounded-[1px]"></div>
              <div className="bg-white rounded-[1px]"></div>
              <div className="bg-white rounded-[1px]"></div>
              <div className="bg-white rounded-[1px]"></div>
            </div>
          </div>
          <span className="font-bold text-lg text-slate-900 tracking-tight">
            TaskFlow Pro
          </span>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            href="/login"
            className="px-4 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-colors"
          >
            Sign In
          </Link>
          <Link
            href="/register"
            className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-md shadow-indigo-600/20 transition-all hover:scale-105"
          >
            Start Free Trial
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-6xl mx-auto px-6 py-16 flex flex-col items-center text-center">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200/60 text-indigo-700 text-xs font-semibold mb-6">
          <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
          <span>Next-Generation Agile Kanban SaaS</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-black text-slate-900 tracking-tight max-w-3xl leading-tight">
          Organize Your Workflow{' '}
          <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Like a Pro
          </span>
        </h1>

        <p className="mt-6 text-base text-slate-500 max-w-xl leading-relaxed">
          Join thousands of teams who manage their product roadmaps, daily sprints, and marketing campaigns using TaskFlow's intuitive kanban interface.
        </p>

        <div className="mt-8 flex items-center space-x-4">
          <Link
            href="/login"
            className="flex items-center space-x-2 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-600 text-white font-semibold text-sm shadow-xl shadow-indigo-600/25 hover:scale-105 transition-all"
          >
            <span>Open Task Board</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/login"
            className="px-6 py-3 rounded-xl bg-white hover:bg-slate-100 text-slate-700 font-semibold text-sm border border-slate-200 shadow-sm transition-all"
          >
            Explore Demo
          </Link>
        </div>

        {/* 3D Illustration Showcase */}
        <div className="mt-14 w-full max-w-4xl rounded-2xl overflow-hidden shadow-2xl shadow-indigo-500/10 border border-slate-200 bg-white p-3">
          <img
            src="/project_flow_board.jpg"
            alt="TaskFlow Pro Board"
            className="w-full h-auto rounded-xl object-cover"
          />
        </div>

        {/* 3 Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 text-left w-full">
          <div className="saas-card p-6 bg-white border border-slate-200 rounded-2xl">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
              <RefreshCw className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm mb-1">Real-Time Sync</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Instantaneous @dnd-kit drag-and-drop state persistence with MongoDB backing and optimistic UI updates.
            </p>
          </div>

          <div className="saas-card p-6 bg-white border border-slate-200 rounded-2xl">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
              <Users2 className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm mb-1">Strict Role Governance</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Server-side RBAC safeguards: normal users cannot view other users or reassign unauthorized items.
            </p>
          </div>

          <div className="saas-card p-6 bg-white border border-slate-200 rounded-2xl">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
              <Filter className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm mb-1">Smart Filters & Priorities</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Filter by title, sprint priority (High, Medium, Low), or due date to keep engineering delivery on track.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 py-8 bg-white text-center text-xs text-slate-400">
        <p>© 2026 TaskFlow Pro Inc. All rights reserved.</p>
      </footer>
    </div>
  );
}
