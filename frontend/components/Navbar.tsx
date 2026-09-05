'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { clearAuthData, getStoredUser } from '../lib/auth';
import { User } from '../types/user';
import { 
  KanbanSquare, 
  ShieldCheck, 
  LogOut, 
  User as UserIcon, 
  Sparkles,
  LayoutDashboard,
  Users
} from 'lucide-react';

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    setUser(getStoredUser());
  }, [pathname]);

  const handleLogout = () => {
    clearAuthData();
    router.push('/login');
  };

  const isAdmin = user?.role === 'admin';

  return (
    <nav className="glass-panel sticky top-0 z-40 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand */}
          <div className="flex items-center space-x-3">
            <Link href={user ? '/dashboard' : '/'} className="flex items-center space-x-2 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform duration-200">
                <KanbanSquare className="w-5 h-5 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                  TaskFlow
                </span>
                <span className="text-[10px] uppercase font-semibold tracking-wider text-indigo-400 -mt-1">
                  Enterprise RBAC
                </span>
              </div>
            </Link>

            {/* Navigation links if authenticated */}
            {user && (
              <div className="hidden md:flex items-center space-x-1 ml-6 pl-6 border-l border-slate-800">
                <Link
                  href="/dashboard"
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    pathname === '/dashboard'
                      ? 'bg-indigo-600/15 text-indigo-400 border border-indigo-500/30'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Task Board</span>
                </Link>

                {isAdmin && (
                  <>
                    <Link
                      href="/admin"
                      className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                        pathname === '/admin'
                          ? 'bg-purple-600/15 text-purple-400 border border-purple-500/30'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                      }`}
                    >
                      <ShieldCheck className="w-4 h-4 text-purple-400" />
                      <span>Admin Hub</span>
                    </Link>
                    <Link
                      href="/admin/users"
                      className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                        pathname === '/admin/users'
                          ? 'bg-purple-600/15 text-purple-400 border border-purple-500/30'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                      }`}
                    >
                      <Users className="w-4 h-4" />
                      <span>User Directory</span>
                    </Link>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Right section: Auth & Profile */}
          <div className="flex items-center space-x-3">
            {user ? (
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2 bg-slate-900/90 border border-slate-800 rounded-full py-1 px-3">
                  <div className="w-6 h-6 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-semibold text-slate-300">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex items-center space-x-1.5 text-xs">
                    <span className="font-medium text-slate-200 hidden sm:inline-block">
                      {user.name}
                    </span>
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        isAdmin
                          ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                          : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40'
                      }`}
                    >
                      {user.role}
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleLogout}
                  title="Log out"
                  className="flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-all duration-150"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  href="/login"
                  className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white rounded-lg hover:bg-slate-800/60 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-md shadow-indigo-600/30 transition-all hover:scale-105"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
