'use client';

import React, { useState, useEffect } from 'react';
import { Task } from '../types/task';
import { User } from '../types/user';
import { X, Loader2, UserCheck, ShieldCheck } from 'lucide-react';

interface AssignTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (taskId: string, assignedUserId: string | null) => Promise<void>;
  task: Task | null;
  users: User[];
}

export default function AssignTaskModal({
  isOpen,
  onClose,
  onSubmit,
  task,
  users,
}: AssignTaskModalProps) {
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (task) {
      const currentId = (task.assignedUser?._id || (task.assignedUser as any)?.id) || '';
      setSelectedUserId(currentId);
    }
  }, [task]);

  if (!isOpen || !task) return null;

  const currentAssignedName = task.assignedUser?.name || 'Unassigned';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      setLoading(true);
      await onSubmit(task._id, selectedUserId ? selectedUserId : null);
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to reassign task');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div className="glass-panel w-full max-w-md rounded-2xl p-6 bg-slate-900 border border-slate-700/80 shadow-2xl relative">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <UserCheck className="w-5 h-5 text-indigo-400" />
            <h3 className="text-lg font-bold text-slate-100">Assign Task</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
            {error}
          </div>
        )}

        {/* Task & Current User Details */}
        <div className="space-y-2.5 mb-5 p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 text-xs">
          <div>
            <span className="text-slate-400 font-medium block">Task:</span>
            <span className="text-slate-200 font-semibold text-sm">
              {task.title}
            </span>
          </div>
          <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between">
            <span className="text-slate-400 font-medium">Current User:</span>
            <span className="text-indigo-300 font-semibold bg-indigo-500/10 border border-indigo-500/30 px-2 py-0.5 rounded">
              {currentAssignedName}
            </span>
          </div>
        </div>

        {/* Assign To Form (Radio Options per Wireframe) */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2 uppercase tracking-wider">
              Assign to:
            </label>

            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {users.map((u) => {
                const isSelected = selectedUserId === u.id;
                return (
                  <label
                    key={u.id}
                    className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-indigo-600/15 border-indigo-500 text-slate-100 ring-1 ring-indigo-500/40'
                        : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <input
                        type="radio"
                        name="assignedUser"
                        value={u.id}
                        checked={isSelected}
                        onChange={() => setSelectedUserId(u.id)}
                        className="w-4 h-4 text-indigo-600 bg-slate-900 border-slate-700 focus:ring-indigo-500"
                      />
                      <span className="text-xs font-semibold">{u.name}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 uppercase font-medium bg-slate-800/60 px-2 py-0.5 rounded">
                      {u.role}
                    </span>
                  </label>
                );
              })}

              {/* Unassigned option */}
              <label
                className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                  selectedUserId === ''
                    ? 'bg-amber-600/15 border-amber-500 text-slate-100 ring-1 ring-amber-500/40'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <input
                    type="radio"
                    name="assignedUser"
                    value=""
                    checked={selectedUserId === ''}
                    onChange={() => setSelectedUserId('')}
                    className="w-4 h-4 text-amber-500 bg-slate-900 border-slate-700 focus:ring-amber-500"
                  />
                  <span className="text-xs font-semibold text-amber-400">
                    Unassigned
                  </span>
                </div>
                <span className="text-[10px] text-amber-300/80 bg-amber-500/10 px-2 py-0.5 rounded">
                  Open Item
                </span>
              </label>
            </div>
          </div>

          {/* Modal Actions matching [Cancel] [Save] */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center space-x-1.5 px-5 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 shadow-md shadow-indigo-600/30 transition-all hover:scale-105"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <span>Save</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
