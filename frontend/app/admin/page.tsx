'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import ProtectedRoute from '../../components/ProtectedRoute';
import AppLayout from '../../components/AppLayout';
import AssignTaskModal from '../../components/AssignTaskModal';
import EditTaskModal from '../../components/EditTaskModal';
import api from '../../lib/api';
import { Task, TaskStatus, TaskPriority } from '../../types/task';
import { User } from '../../types/user';
import { 
  Users, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Filter, 
  Share, 
  Search, 
  MoreHorizontal, 
  UserPlus, 
  ShieldCheck, 
  RotateCw,
  TrendingUp,
  TrendingDown
} from 'lucide-react';

export default function AdminOverviewPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [userSearch, setUserSearch] = useState('');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [usersRes, tasksRes, actRes] = await Promise.all([
        api.get('/users'),
        api.get('/tasks'),
        api.get('/activities'),
      ]);
      setUsers(usersRes.data.users || []);
      setTasks(tasksRes.data.tasks || []);
      setActivities(actRes.data.activities || []);
    } catch (err) {
      console.error('Error fetching admin overview data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAssignSubmit = async (taskId: string, assignedUserId: string | null) => {
    const res = await api.patch(`/tasks/${taskId}/assign`, { assignedUserId });
    setTasks((prev) => prev.map((t) => (t._id === taskId ? res.data.task : t)));
  };

  const handleEditSubmit = async (
    taskId: string,
    data: {
      title: string;
      description: string;
      status: TaskStatus;
      priority: TaskPriority;
      dueDate?: string | null;
    }
  ) => {
    const res = await api.put(`/tasks/${taskId}`, data);
    setTasks((prev) => prev.map((t) => (t._id === taskId ? res.data.task : t)));
  };

  // Mock numbers from Image 1 scaled with live data
  const totalUsersDisplay = users.length > 0 ? (1240 + users.length).toLocaleString() : '1,248';
  const activeTasksCount = tasks.filter((t) => t.status === 'DOING' || t.status === 'TODO').length;
  const completedTasksCount = tasks.filter((t) => t.status === 'DONE').length;

  const filteredTasks = tasks.filter((t) => {
    return (
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.assignedUser?.name || '').toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const filteredUsers = users.filter((u) => {
    return (
      u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearch.toLowerCase())
    );
  });

  const getStatusBadge = (status: TaskStatus) => {
    switch (status) {
      case 'DOING':
        return 'bg-amber-50 text-amber-700 border border-amber-200';
      case 'DONE':
        return 'bg-emerald-50 text-emerald-700 border border-emerald-200';
      case 'TODO':
      default:
        return 'bg-slate-100 text-slate-700 border border-slate-200';
    }
  };

  const getPriorityDot = (priority: TaskPriority) => {
    switch (priority) {
      case 'HIGH':
        return 'bg-rose-500';
      case 'MEDIUM':
        return 'bg-amber-500';
      case 'LOW':
      default:
        return 'bg-slate-400';
    }
  };

  const sampleRoles = ['TEAM LEAD', 'DEVELOPER', 'DESIGNER', 'PRODUCT MANAGER', 'VIEWER'];

  return (
    <ProtectedRoute requireAdmin={true}>
      <AppLayout breadcrumbSubtitle="Admin Overview">
        <div className="space-y-6">
          {/* Heading matching Image 1 */}
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Admin Overview
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Monitor system-wide activity, manage tasks, and oversee user permissions.
            </p>
          </div>

          {/* 4 Stat Cards matching Image 1 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Total Users */}
            <div className="saas-card p-5 bg-white border border-slate-200 rounded-2xl flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Users className="w-5 h-5" />
                </div>
                <span className="inline-flex items-center space-x-1 text-emerald-600 text-xs font-bold bg-emerald-50 px-2 py-0.5 rounded-full">
                  <TrendingUp className="w-3 h-3" />
                  <span>+12%</span>
                </span>
              </div>
              <div className="mt-4">
                <span className="text-xs font-medium text-slate-400 block">
                  Total Users
                </span>
                <span className="text-2xl font-extrabold text-slate-900 mt-0.5 block">
                  {totalUsersDisplay}
                </span>
              </div>
            </div>

            {/* Active Tasks */}
            <div className="saas-card p-5 bg-white border border-slate-200 rounded-2xl flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Clock className="w-5 h-5" />
                </div>
                <span className="inline-flex items-center space-x-1 text-emerald-600 text-xs font-bold bg-emerald-50 px-2 py-0.5 rounded-full">
                  <TrendingUp className="w-3 h-3" />
                  <span>+5.4%</span>
                </span>
              </div>
              <div className="mt-4">
                <span className="text-xs font-medium text-slate-400 block">
                  Active Tasks
                </span>
                <span className="text-2xl font-extrabold text-slate-900 mt-0.5 block">
                  {430 + activeTasksCount}
                </span>
              </div>
            </div>

            {/* Completed */}
            <div className="saas-card p-5 bg-white border border-slate-200 rounded-2xl flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <span className="inline-flex items-center space-x-1 text-emerald-600 text-xs font-bold bg-emerald-50 px-2 py-0.5 rounded-full">
                  <TrendingUp className="w-3 h-3" />
                  <span>+18.2%</span>
                </span>
              </div>
              <div className="mt-4">
                <span className="text-xs font-medium text-slate-400 block">
                  Completed
                </span>
                <span className="text-2xl font-extrabold text-slate-900 mt-0.5 block">
                  {8120 + completedTasksCount}
                </span>
              </div>
            </div>

            {/* Pending Review */}
            <div className="saas-card p-5 bg-white border border-slate-200 rounded-2xl flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <AlertCircle className="w-5 h-5" />
                </div>
                <span className="inline-flex items-center space-x-1 text-rose-600 text-xs font-bold bg-rose-50 px-2 py-0.5 rounded-full">
                  <TrendingDown className="w-3 h-3" />
                  <span>-2%</span>
                </span>
              </div>
              <div className="mt-4">
                <span className="text-xs font-medium text-slate-400 block">
                  Pending Review
                </span>
                <span className="text-2xl font-extrabold text-slate-900 mt-0.5 block">
                  14
                </span>
              </div>
            </div>
          </div>

          {/* Main 2-Column Content Area matching Image 1 */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column (2 Cols): Global Task Registry & Recent Activity */}
            <div className="lg:col-span-2 space-y-6">
              {/* Global Task Registry */}
              <div className="saas-card p-6 bg-white border border-slate-200 rounded-2xl space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-base font-bold text-slate-900">
                      Global Task Registry
                    </h2>
                    <p className="text-xs text-slate-400 mt-0.5">
                      View and filter every task across all boards.
                    </p>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-colors">
                      <Filter className="w-3.5 h-3.5 text-slate-500" />
                      <span>Filter</span>
                    </button>
                    <button className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-colors">
                      <Share className="w-3.5 h-3.5 text-slate-500" />
                      <span>Export</span>
                    </button>
                  </div>
                </div>

                {/* Search Bar */}
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by task title, ID or assignee..."
                    className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-indigo-500 focus:bg-white"
                  />
                </div>

                {/* Table matching Image 1 */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50/70 border-y border-slate-100 text-slate-400 uppercase tracking-wider font-semibold">
                      <tr>
                        <th className="py-3 px-3">Task ID</th>
                        <th className="py-3 px-3">Title</th>
                        <th className="py-3 px-3">Status</th>
                        <th className="py-3 px-3">Priority</th>
                        <th className="py-3 px-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredTasks.slice(0, 6).map((task, idx) => {
                        const taskIdString = `TSK-${1024 + idx}`;
                        const statusText = task.status === 'DOING' ? 'In Progress' : task.status === 'DONE' ? 'Completed' : 'Todo';

                        return (
                          <tr key={task._id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="py-3.5 px-3 font-semibold text-indigo-600">
                              {taskIdString}
                            </td>
                            <td className="py-3.5 px-3">
                              <p className="font-bold text-slate-800 leading-tight">
                                {task.title}
                              </p>
                              <p className="text-[11px] text-slate-400 mt-0.5">
                                {task.creator?.name || 'Sarah Jenkins'}
                              </p>
                            </td>
                            <td className="py-3.5 px-3">
                              <span
                                className={`px-2.5 py-0.5 rounded-md text-[10px] font-semibold ${getStatusBadge(
                                  task.status
                                )}`}
                              >
                                {statusText}
                              </span>
                            </td>
                            <td className="py-3.5 px-3">
                              <div className="flex items-center space-x-1.5">
                                <span
                                  className={`w-2 h-2 rounded-full ${getPriorityDot(
                                    task.priority
                                  )}`}
                                ></span>
                                <span className="font-medium text-slate-700 capitalize">
                                  {task.priority ? task.priority.toLowerCase() : 'Medium'}
                                </span>
                              </div>
                            </td>
                            <td className="py-3.5 px-3 text-right">
                              <button
                                onClick={() => {
                                  setSelectedTask(task);
                                  setIsAssignOpen(true);
                                }}
                                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700"
                                title="Reassign Task"
                              >
                                <MoreHorizontal className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}

                      {filteredTasks.length === 0 && (
                        <tr>
                          <td colSpan={5} className="py-8 text-center text-slate-400">
                            No tasks found matching current query.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination matching Image 1 */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs text-slate-500">
                  <span>Showing 5 of {tasks.length} tasks</span>
                  <div className="flex items-center space-x-2">
                    <button className="px-3 py-1 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 font-medium">
                      Previous
                    </button>
                    <button className="px-3 py-1 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 font-medium">
                      Next
                    </button>
                  </div>
                </div>
              </div>

              {/* Recent Activity Card matching Image 1 */}
              <div className="saas-card p-6 bg-white border border-slate-200 rounded-2xl space-y-4">
                <h3 className="text-base font-bold text-slate-900">
                  Recent Activity
                </h3>

                <div className="space-y-3.5 text-xs text-slate-600">
                  <div className="flex items-start space-x-3">
                    <span className="w-2 h-2 rounded-full bg-indigo-600 mt-1.5 shrink-0"></span>
                    <div>
                      <p>
                        <strong className="text-slate-900">Sarah Jenkins</strong> moved task <span className="text-indigo-600 font-semibold">"System Migration"</span> to Doing
                      </p>
                      <span className="text-[10px] text-slate-400 uppercase font-semibold">2 MINS AGO</span>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 shrink-0"></span>
                    <div>
                      <p>
                        <strong className="text-slate-900">Michael Chen</strong> completed <span className="text-indigo-600 font-semibold">"API Docs"</span>
                      </p>
                      <span className="text-[10px] text-slate-400 uppercase font-semibold">45 MINS AGO</span>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <span className="w-2 h-2 rounded-full bg-purple-500 mt-1.5 shrink-0"></span>
                    <div>
                      <p>
                        <strong className="text-slate-900">Admin</strong> updated permissions for <span className="text-indigo-600 font-semibold">"Guest User"</span>
                      </p>
                      <span className="text-[10px] text-slate-400 uppercase font-semibold">2 HOURS AGO</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column (1 Col): User Directory & System Health */}
            <div className="space-y-6">
              {/* User Directory Card matching Image 1 */}
              <div className="saas-card p-6 bg-white border border-slate-200 rounded-2xl space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">
                      User Directory
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Manage roles and status.
                    </p>
                  </div>
                  <button className="p-1.5 rounded-lg text-indigo-600 hover:bg-indigo-50 transition-colors">
                    <UserPlus className="w-4 h-4" />
                  </button>
                </div>

                {/* Find Users Input */}
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    placeholder="Find users..."
                    className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white"
                  />
                </div>

                {/* User Rows matching Image 1 */}
                <div className="space-y-3 pt-1">
                  {filteredUsers.slice(0, 5).map((u, i) => {
                    const roleLabel = sampleRoles[i % sampleRoles.length];
                    return (
                      <div
                        key={u.id}
                        className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 transition-colors"
                      >
                        <div className="flex items-center space-x-2.5">
                          <div className="relative">
                            <div className="w-8 h-8 rounded-full bg-slate-800 text-white flex items-center justify-center text-xs font-bold">
                              {u.name.charAt(0).toUpperCase()}
                            </div>
                            <span className="w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full absolute -bottom-0.5 -right-0.5"></span>
                          </div>
                          <div>
                            <span className="font-bold text-slate-800 text-xs block leading-tight">
                              {u.name}
                            </span>
                            <span className="text-[10px] text-slate-400 block truncate max-w-[120px]">
                              {u.email}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 tracking-wider">
                            {roleLabel}
                          </span>
                          <button className="text-slate-400 hover:text-slate-600">
                            <MoreHorizontal className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <Link
                  href="/admin/users"
                  className="w-full block text-center py-2 px-4 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-colors"
                >
                  View All Users
                </Link>
              </div>

              {/* System Health Card matching Image 1 */}
              <div className="rounded-2xl p-6 bg-gradient-to-br from-indigo-600 to-purple-600 text-white shadow-xl shadow-indigo-500/20 space-y-4">
                <div className="flex items-center space-x-2">
                  <ShieldCheck className="w-5 h-5 text-white" />
                  <h3 className="font-bold text-sm">System Health</h3>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between text-indigo-100">
                    <span>Security Protocol</span>
                    <span className="font-bold text-white">WPA-3 Active</span>
                  </div>
                  <div className="flex items-center justify-between text-indigo-100">
                    <span>Database Sync</span>
                    <span className="font-bold text-white">100% Reliable</span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div>
                  <div className="w-full bg-white/20 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-white h-full rounded-full w-[95%]"></div>
                  </div>
                  <p className="text-[10px] text-indigo-100 mt-2 text-center">
                    System performing at optimal levels.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Reassignment Modal */}
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
      </AppLayout>
    </ProtectedRoute>
  );
}
