'use client';

import React, { useEffect, useState } from 'react';
import api from '../lib/api';
import { Activity } from '../types/task';
import { X, History, RotateCw, Clock, User as UserIcon } from 'lucide-react';

interface ActivityDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ActivityDrawer({ isOpen, onClose }: ActivityDrawerProps) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      const res = await api.get('/activities');
      setActivities(res.data.activities || []);
    } catch (err) {
      console.error('Error fetching activities:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchActivities();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const getActionBadge = (action: string) => {
    switch (action) {
      case 'CREATED':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'STATUS_CHANGED':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'ASSIGNED':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'DELETED':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/40 backdrop-blur-sm animate-fadeIn">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white border-l border-slate-200 p-6 flex flex-col justify-between shadow-2xl">
          {/* Header */}
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
                  <History className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Activity History
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Audit log of task movements and assignments
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-1">
                <button
                  onClick={fetchActivities}
                  disabled={loading}
                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-50 transition-colors"
                  title="Refresh"
                >
                  <RotateCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                </button>
                <button
                  onClick={onClose}
                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Timeline List */}
            <div className="mt-6 space-y-3.5 overflow-y-auto max-h-[calc(100vh-170px)] pr-1">
              {activities.map((item) => {
                const timeStr = new Date(item.createdAt).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                });
                const dateStr = new Date(item.createdAt).toLocaleDateString([], {
                  month: 'short',
                  day: 'numeric',
                });

                return (
                  <div
                    key={item._id}
                    className="p-4 rounded-xl bg-slate-50/80 border border-slate-200 hover:border-indigo-200 transition-colors space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded border ${getActionBadge(
                          item.action
                        )}`}
                      >
                        {item.action.replace('_', ' ')}
                      </span>
                      <span className="text-[11px] text-slate-400 flex items-center space-x-1">
                        <Clock className="w-3 h-3" />
                        <span>
                          {dateStr} at {timeStr}
                        </span>
                      </span>
                    </div>

                    <p className="text-xs text-slate-800 font-semibold leading-relaxed">
                      {item.message}
                    </p>

                    <div className="flex items-center space-x-1.5 text-[11px] text-slate-400 pt-1.5 border-t border-slate-200/60">
                      <UserIcon className="w-3 h-3 text-slate-400" />
                      <span>{item.user?.name || 'System'}</span>
                    </div>
                  </div>
                );
              })}

              {activities.length === 0 && !loading && (
                <div className="py-12 text-center text-slate-400 text-xs">
                  No recorded activities yet.
                </div>
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 text-center">
            <button
              onClick={onClose}
              className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
            >
              Close Activity Feed
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
