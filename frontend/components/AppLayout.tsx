'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { 
  LayoutGrid, 
  Users, 
  Settings, 
  LogOut, 
  Search, 
  Bell, 
  ChevronDown,
  LayoutDashboard,
  CheckSquare,
  Layers,
  History
} from 'lucide-react';
import { clearAuthData, getStoredUser } from '../lib/auth';
import { User } from '../types/user';
import ActivityDrawer from './ActivityDrawer';
import NotificationDropdown from './NotificationDropdown';
import ThemeToggle from './ThemeToggle';

interface AppLayoutProps {
  children: React.ReactNode;
  breadcrumbSubtitle?: string;
}

export default function AppLayout({ children, breadcrumbSubtitle = 'Product Roadmap' }: AppLayoutProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const filterParam = searchParams.get('filter');
  const router = useRouter();

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [activityDrawerOpen, setActivityDrawerOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  useEffect(() => {
    setCurrentUser(getStoredUser());
  }, [pathname]);

  const handleLogout = () => {
    clearAuthData();
    router.push('/login');
  };

  const isAdmin = currentUser?.role === 'admin';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex transition-colors duration-200">
      {/* Left Sidebar */}
      <aside className="w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col justify-between shrink-0 fixed inset-y-0 z-30 transition-colors">
        <div>
          {/* Brand Logo */}
          <div className="h-16 flex items-center px-6 border-b border-slate-100 dark:border-slate-800">
            <Link href="/dashboard" className="flex items-center space-x-3 group">
              <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-600/20">
                <div className="grid grid-cols-2 gap-1 w-4 h-4">
                  <div className="bg-white rounded-sm"></div>
                  <div className="bg-white rounded-sm"></div>
                  <div className="bg-white rounded-sm"></div>
                  <div className="bg-white rounded-sm"></div>
                </div>
              </div>
              <span className="font-bold text-base text-slate-800 dark:text-white tracking-tight">
                TaskFlow Pro
              </span>
            </Link>
          </div>

          {/* Navigation Links — Strictly Separated by Role */}
          <nav className="p-4 space-y-1.5 text-sm font-medium">
            {isAdmin ? (
              // ================= ADMIN NAVIGATION =================
              <>
                <Link
                  href="/admin"
                  className={`flex items-center space-x-3 px-3.5 py-2.5 rounded-xl transition-colors ${
                    pathname === '/admin'
                      ? 'bg-indigo-50/80 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 font-semibold'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4 text-slate-500" />
                  <span>Overview</span>
                </Link>

                <Link
                  href="/dashboard"
                  className={`flex items-center space-x-3 px-3.5 py-2.5 rounded-xl transition-colors ${
                    pathname === '/dashboard' && !filterParam
                      ? 'bg-indigo-50/80 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 font-semibold'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Layers className="w-4 h-4 text-slate-500" />
                  <span>All Tasks</span>
                </Link>

                <Link
                  href="/admin/users"
                  className={`flex items-center space-x-3 px-3.5 py-2.5 rounded-xl transition-colors ${
                    pathname === '/admin/users'
                      ? 'bg-indigo-50/80 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 font-semibold'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Users className="w-4 h-4 text-slate-500" />
                  <span>Users</span>
                </Link>

                <button
                  onClick={() => setActivityDrawerOpen(true)}
                  className="w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white transition-colors text-left"
                >
                  <History className="w-4 h-4 text-slate-500" />
                  <span>Activity Logs</span>
                </button>
              </>
            ) : (
              // ================= USER NAVIGATION =================
              <>
                <Link
                  href="/dashboard"
                  className={`flex items-center space-x-3 px-3.5 py-2.5 rounded-xl transition-colors ${
                    pathname === '/dashboard' && !filterParam
                      ? 'bg-indigo-50/80 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 font-semibold'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <LayoutGrid className="w-4 h-4 text-slate-500" />
                  <span>Dashboard</span>
                </Link>

                <Link
                  href="/dashboard?filter=mine"
                  className={`flex items-center space-x-3 px-3.5 py-2.5 rounded-xl transition-colors ${
                    pathname === '/dashboard' && filterParam === 'mine'
                      ? 'bg-indigo-50/80 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 font-semibold'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <CheckSquare className="w-4 h-4 text-slate-500" />
                  <span>My Tasks</span>
                </Link>

                <button
                  onClick={() => setActivityDrawerOpen(true)}
                  className="w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white transition-colors text-left"
                >
                  <History className="w-4 h-4 text-slate-500" />
                  <span>Activity</span>
                </button>
              </>
            )}
          </nav>
        </div>

        {/* Bottom Section: Profile summary & Sign Out */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
          <div className="flex items-center space-x-3 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
            <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
              {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate leading-tight">
                {currentUser?.name || 'User'}
              </p>
              <p className="text-[10px] text-slate-400 capitalize font-medium">
                {currentUser?.role === 'admin' ? 'Administrator' : 'Team Member'}
              </p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-3.5 py-2 rounded-xl text-xs font-medium text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col pl-64 min-w-0">
        {/* Top Navigation Bar */}
        <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-8 sticky top-0 z-20 transition-colors">
          {/* Breadcrumbs */}
          <div className="flex items-center space-x-2 text-xs font-medium text-slate-400">
            <Link href="/dashboard" className="hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
              Projects
            </Link>
            <span>/</span>
            <span className="text-slate-700 dark:text-slate-300 font-semibold">{breadcrumbSubtitle}</span>
          </div>

          {/* Right section: Search, Theme Toggle, Notification Bell, User Profile */}
          <div className="flex items-center space-x-3">
            <div className="relative w-60 hidden sm:block">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search tasks..."
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-800 transition-colors"
              />
            </div>

            {/* Dark/Light Mode Switcher */}
            <ThemeToggle />

            {/* Notification Bell with interactive dropdown */}
            <div className="relative">
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="relative p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                title="Notifications"
              >
                <Bell className="w-4 h-4" />
                <span className="w-2 h-2 bg-indigo-600 rounded-full absolute top-1.5 right-1.5 ring-2 ring-white dark:ring-slate-900"></span>
              </button>

              <NotificationDropdown
                isOpen={notificationsOpen}
                onClose={() => setNotificationsOpen(false)}
              />
            </div>

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center space-x-2.5 p-1 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-left"
              >
                <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center text-xs font-bold text-indigo-700 dark:text-indigo-300">
                  {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div className="hidden md:flex flex-col text-left">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-tight">
                    {currentUser?.name || 'Alex Rivera'}
                  </span>
                  <span className="text-[10px] text-slate-400 capitalize">
                    {currentUser?.role === 'admin' ? 'Admin' : 'Member'}
                  </span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-52 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800 py-1.5 z-40 text-xs font-medium animate-fadeIn">
                  <div className="px-3.5 py-2.5 border-b border-slate-100 dark:border-slate-800">
                    <p className="font-semibold text-slate-800 dark:text-slate-200">{currentUser?.name}</p>
                    <p className="text-slate-400 text-[11px] truncate">{currentUser?.email}</p>
                    <span className="inline-block mt-1 text-[9px] font-extrabold uppercase px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300">
                      {currentUser?.role === 'admin' ? 'Administrator' : 'Normal User'}
                    </span>
                  </div>

                  <Link
                    href="/dashboard"
                    onClick={() => setUserDropdownOpen(false)}
                    className="block px-3.5 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
                  >
                    Dashboard
                  </Link>

                  <button
                    onClick={() => {
                      setUserDropdownOpen(false);
                      setActivityDrawerOpen(true);
                    }}
                    className="w-full text-left px-3.5 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
                  >
                    Activity Log
                  </button>

                  {isAdmin && (
                    <Link
                      href="/admin"
                      onClick={() => setUserDropdownOpen(false)}
                      className="block px-3.5 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
                    >
                      Admin Overview
                    </Link>
                  )}

                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-3.5 py-2 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 border-t border-slate-100 dark:border-slate-800 mt-1"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Child Pages */}
        <main className="flex-1 p-8">
          {children}
        </main>
      </div>

      {/* Global Slide-over Activity Drawer */}
      <ActivityDrawer
        isOpen={activityDrawerOpen}
        onClose={() => setActivityDrawerOpen(false)}
      />
    </div>
  );
}
