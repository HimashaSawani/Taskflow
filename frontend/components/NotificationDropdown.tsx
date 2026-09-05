'use client';

import React, { useState } from 'react';
import { 
  Bell, 
  Check, 
  CheckCircle2, 
  Clock, 
  UserCheck, 
  AlertTriangle,
  X,
  Sparkles
} from 'lucide-react';

export interface AppNotification {
  id: string;
  type: 'ASSIGNMENT' | 'DEADLINE' | 'COMPLETED' | 'PRIORITY';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}

interface NotificationDropdownProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function NotificationDropdown({ isOpen, onClose }: NotificationDropdownProps) {
  const [notifications, setNotifications] = useState<AppNotification[]>([
    {
      id: '1',
      type: 'ASSIGNMENT',
      title: 'Task Assigned',
      message: 'Alex Rivera assigned you to "Implement Security Auditing".',
      timestamp: '10 mins ago',
      read: false,
    },
    {
      id: '2',
      type: 'DEADLINE',
      title: 'Deadline Approaching',
      message: '"Design Drag-and-Drop Task Board" is due in 2 days.',
      timestamp: '1 hour ago',
      read: false,
    },
    {
      id: '3',
      type: 'COMPLETED',
      title: 'Task Completed',
      message: '"Implement Authentication System" was moved to Done.',
      timestamp: '3 hours ago',
      read: false,
    },
    {
      id: '4',
      type: 'PRIORITY',
      title: 'High Priority Alert',
      message: 'System Administrator raised priority on "Security Audit" to HIGH.',
      timestamp: 'Yesterday',
      read: true,
    },
  ]);

  if (!isOpen) return null;

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleMarkAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleMarkSingleAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const getIcon = (type: AppNotification['type']) => {
    switch (type) {
      case 'ASSIGNMENT':
        return <UserCheck className="w-4 h-4 text-indigo-600" />;
      case 'DEADLINE':
        return <AlertTriangle className="w-4 h-4 text-amber-600" />;
      case 'COMPLETED':
        return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
      case 'PRIORITY':
        return <Sparkles className="w-4 h-4 text-rose-600" />;
    }
  };

  return (
    <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 py-3 z-50 animate-fadeIn text-xs">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pb-2.5 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center space-x-2">
          <Bell className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm">
            Notifications
          </h4>
          {unreadCount > 0 && (
            <span className="px-1.5 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 text-[10px] font-extrabold">
              {unreadCount} new
            </span>
          )}
        </div>

        <div className="flex items-center space-x-2">
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline font-semibold"
            >
              Mark all read
            </button>
          )}
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Notifications List */}
      <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
        {notifications.map((n) => (
          <div
            key={n.id}
            onClick={() => handleMarkSingleAsRead(n.id)}
            className={`p-3.5 flex items-start space-x-3 transition-colors cursor-pointer ${
              n.read
                ? 'bg-transparent hover:bg-slate-50 dark:hover:bg-slate-800/40 opacity-75'
                : 'bg-indigo-50/40 dark:bg-indigo-950/20 hover:bg-indigo-50/70 dark:hover:bg-indigo-950/30'
            }`}
          >
            <div className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm shrink-0">
              {getIcon(n.type)}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-0.5">
                <span className="font-bold text-slate-800 dark:text-slate-200 truncate">
                  {n.title}
                </span>
                <span className="text-[10px] text-slate-400 whitespace-nowrap ml-2">
                  {n.timestamp}
                </span>
              </div>
              <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">
                {n.message}
              </p>
            </div>

            {!n.read && (
              <span className="w-2 h-2 rounded-full bg-indigo-600 shrink-0 mt-1.5"></span>
            )}
          </div>
        ))}

        {notifications.length === 0 && (
          <div className="p-8 text-center text-slate-400">
            No notifications at this time.
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-4 pt-2.5 border-t border-slate-100 dark:border-slate-800 text-center">
        <span className="text-[11px] text-slate-400">
          Automated real-time task alerts
        </span>
      </div>
    </div>
  );
}
