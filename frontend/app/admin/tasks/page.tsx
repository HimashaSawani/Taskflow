'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import ProtectedRoute from '../../../components/ProtectedRoute';
import Navbar from '../../../components/Navbar';
import AssignTaskModal from '../../../components/AssignTaskModal';
import EditTaskModal from '../../../components/EditTaskModal';
import api from '../../../lib/api';
import { Task, TaskStatus } from '../../../types/task';
import { User } from '../../../types/user';
import { 
  Layers, 
  ArrowLeft, 
  RotateCw, 
  UserPlus, 
  Trash2, 
  Edit3, 
  Circle, 
  Clock, 
  CheckCircle2, 
  Search,
  AlertCircle
} from 'lucide-react';

export default function AdminTasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | TaskStatus>('ALL');

  // Modals
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [banner, setBanner] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [tasksRes, usersRes] = await Promise.all([
        api.get('/tasks'),
        api.get('/users'),
      ]);
      setTasks(tasksRes.data.tasks || []);
      setUsers(usersRes.data.users || []);
    } catch (err) {
      console.error('Error fetching admin tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const showNotification = (msg: string) => {
    setBanner(msg);
    setTimeout(() => setBanner(null), 3500);
  };

  const handleAssignSubmit = async (taskId: string, assignedUserId: string | null) => {
    const res = await api.patch(`/tasks/${taskId}/assign`, { assignedUserId });
    setTasks((prev) => prev.map((t) => (t._id === taskId ? res.data.task : t)));
    showNotification('Task assignment updated successfully');
  };

  const handleEditSubmit = async (
    taskId: string,
    data: { title: string; description: string; status: TaskStatus }
  ) => {
    const res = await api.put(`/tasks/${taskId}`, data);
    setTasks((prev) => prev.map((t) => (t._id === taskId ? res.data.task : t)));
    showNotification('Task updated successfully');
  };

  const handleDelete = async (taskId: string) => {
    if (!confirm('Are you sure you want to delete this task as administrator?')) return;
    try {
      await api.delete(`/tasks/${taskId}`);
      setTasks((prev) => prev.filter((t) => t._id !== taskId));
      showNotification('Task deleted');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete task');
    }
  };

  const filteredTasks = tasks.filter((t) => {
    const matchesSearch =
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.assignedUser?.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.creator?.name || '').toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || t.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <ProtectedRoute requireAdmin={true}>
      <div className="min-h-screen flex flex-col bg-slate-950">
        <Navbar />

        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
            <div>
              <Link
                href="/admin"
                className="inline-flex items-center space-x-1.5 text-xs text-purple-400 hover:text-purple-300 font-medium mb-2"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Admin Hub</span>
              </Link>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-100 flex items-center space-x-2">
                <Layers className="w-7 h-7 text-indigo-400" />
                <span>System Task Allocation</span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                Exercise administrative authority to reassign, edit, or delete any task
              </p>
            </div>

            <button
              onClick={fetchData}
              disabled={loading}
              className="inline-flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 text-xs font-semibold transition-colors disabled:opacity-50"
            >
              <RotateCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh Tasks</span>
            </button>
          </div>

          {banner && (
            <div className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs font-semibold animate-fadeIn">
              {banner}
            </div>
          )}

          {/* Search and Filters */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="relative min-w-[280px]">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by title, description, or assignee..."
                className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-slate-900/90 border border-slate-800 text-slate-100 placeholder-slate-500 text-xs focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="flex items-center space-x-1 bg-slate-900/90 border border-slate-800 rounded-xl p-1">
              {(['ALL', 'TODO', 'DOING', 'DONE'] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    statusFilter === s
                      ? 'bg-indigo-600 text-white'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Tasks Table */}
          <div className="glass-panel rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
                  <tr>
                    <th className="py-3.5 px-4">Task Title & Details</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4">Creator</th>
                    <th className="py-3.5 px-4">Assigned User</th>
                    <th className="py-3.5 px-4 text-right">Admin Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredTasks.map((task) => {
                    const statusConfig = {
                      TODO: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30',
                      DOING: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
                      DONE: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
                    };

                    return (
                      <tr key={task._id} className="hover:bg-slate-800/30 transition-colors">
                        <td className="py-4 px-4 max-w-sm">
                          <div className="font-semibold text-slate-200 text-sm">
                            {task.title}
                          </div>
                          <div className="text-slate-400 text-[11px] line-clamp-1 mt-0.5">
                            {task.description}
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <span
                            className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                              statusConfig[task.status]
                            }`}
                          >
                            {task.status}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-slate-300">
                          {task.creator?.name || 'Unknown'}
                        </td>
                        <td className="py-4 px-4">
                          {task.assignedUser ? (
                            <span className="font-semibold text-purple-300 bg-purple-500/10 border border-purple-500/30 px-2.5 py-1 rounded-md">
                              {task.assignedUser.name}
                            </span>
                          ) : (
                            <span className="font-medium text-slate-400 bg-slate-800 px-2.5 py-1 rounded-md border border-slate-700">
                              Unassigned
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-4 text-right">
                          <div className="inline-flex items-center space-x-1.5">
                            <button
                              onClick={() => {
                                setSelectedTask(task);
                                setIsAssignOpen(true);
                              }}
                              className="px-2.5 py-1 rounded bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 text-purple-300 text-[11px] font-semibold transition-colors flex items-center space-x-1"
                              title="Reassign to another user or unassign"
                            >
                              <UserPlus className="w-3 h-3" />
                              <span>Reassign</span>
                            </button>
                            <button
                              onClick={() => {
                                setSelectedTask(task);
                                setIsEditOpen(true);
                              }}
                              className="p-1.5 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
                              title="Edit task"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDelete(task._id)}
                              className="p-1.5 rounded text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                              title="Delete task"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}

                  {filteredTasks.length === 0 && !loading && (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-500 text-xs">
                        No tasks found matching current filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <AssignTaskModal
            isOpen={isAssignOpen}
            onClose={() => {
              setIsAssignOpen(false);
              setSelectedTask(null);
            }}
            onSubmit={handleAssignSubmit}
            task={selectedTask}
            users={users}
          />

          <EditTaskModal
            isOpen={isEditOpen}
            onClose={() => {
              setIsEditOpen(false);
              setSelectedTask(null);
            }}
            onSubmit={handleEditSubmit}
            task={selectedTask}
          />
        </main>
      </div>
    </ProtectedRoute>
  );
}
