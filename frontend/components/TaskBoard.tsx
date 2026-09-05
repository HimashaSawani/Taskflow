'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import TaskColumn from './TaskColumn';
import TaskCard from './TaskCard';
import CreateTaskModal from './CreateTaskModal';
import TaskDetailModal from './TaskDetailModal';
import { Task, TaskStatus, TaskPriority } from '../types/task';
import { User } from '../types/user';
import api from '../lib/api';
import { 
  Plus, 
  Search, 
  CheckCircle2, 
  Calendar,
  Layers,
  Clock,
  Briefcase,
  AlertTriangle,
  Flame,
  User as UserIcon,
  Filter
} from 'lucide-react';

interface TaskBoardProps {
  currentUser: User | null;
}

export default function TaskBoard({ currentUser }: TaskBoardProps) {
  const searchParams = useSearchParams();
  const filterParam = searchParams.get('filter');

  const [tasks, setTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<'ALL' | TaskPriority>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | TaskStatus>('ALL');
  const [assigneeFilter, setAssigneeFilter] = useState<'ALL' | 'ME' | 'UNASSIGNED' | string>('ALL');
  const [viewMode, setViewMode] = useState<'board' | 'table' | 'timeline'>('board');
  const [showCompletedOnly, setShowCompletedOnly] = useState(false);

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const fetchTasks = async () => {
    try {
      const res = await api.get('/tasks');
      setTasks(res.data.tasks || []);
    } catch (err: any) {
      console.error('Error fetching tasks:', err);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await api.get('/users');
      setUsers(res.data.users || []);
    } catch {
      // Normal users will receive 403, expected by RBAC
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchTasks(), fetchUsers()]);
      setLoading(false);
    };
    loadData();
  }, [currentUser]);

  // Drag and drop handlers
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const task = tasks.find((t) => t._id === active.id);
    if (task) {
      setActiveTask(task);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const activeTaskId = active.id as string;
    const overId = over.id as string;

    const currentTask = tasks.find((t) => t._id === activeTaskId);
    if (!currentTask) return;

    let newStatus: TaskStatus | null = null;
    if (overId === 'TODO' || overId === 'DOING' || overId === 'DONE') {
      newStatus = overId as TaskStatus;
    } else {
      const targetTask = tasks.find((t) => t._id === overId);
      if (targetTask) {
        newStatus = targetTask.status;
      }
    }

    if (!newStatus || currentTask.status === newStatus) {
      return;
    }

    const previousStatus = currentTask.status;
    setTasks((prev) =>
      prev.map((t) => (t._id === activeTaskId ? { ...t, status: newStatus! } : t))
    );

    try {
      await api.patch(`/tasks/${activeTaskId}/status`, { status: newStatus });
    } catch (err: any) {
      setTasks((prev) =>
        prev.map((t) => (t._id === activeTaskId ? { ...t, status: previousStatus } : t))
      );
      alert(err.response?.data?.message || 'Failed to update task status.');
    }
  };

  // Task Actions
  const handleCreateTask = async (data: {
    title: string;
    description: string;
    priority: TaskPriority;
    dueDate?: string | null;
    assignedUserId?: string | null;
  }) => {
    const res = await api.post('/tasks', data);
    setTasks((prev) => [res.data.task, ...prev]);
  };

  const handleUpdateTask = async (
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
    setTasks((prev) =>
      prev.map((t) => (t._id === taskId ? res.data.task : t))
    );
    if (selectedTask?._id === taskId) {
      setSelectedTask(res.data.task);
    }
  };

  const handleAssignTask = async (taskId: string, assignedUserId: string | null) => {
    const res = await api.patch(`/tasks/${taskId}/assign`, { assignedUserId });
    setTasks((prev) =>
      prev.map((t) => (t._id === taskId ? res.data.task : t))
    );
    if (selectedTask?._id === taskId) {
      setSelectedTask(res.data.task);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    await api.delete(`/tasks/${taskId}`);
    setTasks((prev) => prev.filter((t) => t._id !== taskId));
    setIsDetailOpen(false);
  };

  const handleClaimTask = async (taskId: string) => {
    if (!currentUser) return;
    const res = await api.patch(`/tasks/${taskId}/assign`, {
      assignedUserId: currentUser.id,
    });
    setTasks((prev) =>
      prev.map((t) => (t._id === taskId ? res.data.task : t))
    );
    if (selectedTask?._id === taskId) {
      setSelectedTask(res.data.task);
    }
  };

  const handleAddComment = async (taskId: string, text: string) => {
    const res = await api.post(`/tasks/${taskId}/comments`, { text });
    setTasks((prev) =>
      prev.map((t) => (t._id === taskId ? res.data.task : t))
    );
    if (selectedTask?._id === taskId) {
      setSelectedTask(res.data.task);
    }
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setPriorityFilter('ALL');
    setStatusFilter('ALL');
    setAssigneeFilter('ALL');
    setShowCompletedOnly(false);
  };

  // Check if overdue
  const isTaskOverdue = (task: Task) => {
    if (task.status === 'DONE' || !task.dueDate) return false;
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const due = new Date(task.dueDate);
    due.setHours(0, 0, 0, 0);
    return due.getTime() < now.getTime();
  };

  // Filter tasks
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      // Handle My Tasks sidebar shortcut
      if (filterParam === 'mine' && currentUser) {
        const isMine =
          (task.creator?._id || (task.creator as any)?.id) === currentUser.id ||
          (task.assignedUser?._id || (task.assignedUser as any)?.id) === currentUser.id;
        if (!isMine) return false;
      }

      // Search
      const matchesSearch =
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (task.assignedUser?.name || '').toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;

      // Priority Filter
      if (priorityFilter !== 'ALL' && task.priority !== priorityFilter) {
        return false;
      }

      // Status Filter
      if (statusFilter !== 'ALL' && task.status !== statusFilter) {
        return false;
      }

      // Assignee Filter
      if (assigneeFilter === 'ME' && currentUser) {
        const isAssignedToMe = (task.assignedUser?._id || (task.assignedUser as any)?.id) === currentUser.id;
        if (!isAssignedToMe) return false;
      } else if (assigneeFilter === 'UNASSIGNED') {
        if (task.assignedUser) return false;
      } else if (assigneeFilter !== 'ALL') {
        const assignedId = task.assignedUser?._id || (task.assignedUser as any)?.id;
        if (assignedId !== assigneeFilter) return false;
      }

      // Completed toggle
      if (showCompletedOnly && task.status !== 'DONE') {
        return false;
      }

      return true;
    });
  }, [tasks, searchQuery, priorityFilter, statusFilter, assigneeFilter, showCompletedOnly, filterParam, currentUser]);

  const todoTasks = filteredTasks.filter((t) => t.status === 'TODO');
  const doingTasks = filteredTasks.filter((t) => t.status === 'DOING');
  const doneTasks = filteredTasks.filter((t) => t.status === 'DONE');

  const highPriorityCount = tasks.filter((t) => t.priority === 'HIGH' && t.status !== 'DONE').length;
  const overdueCount = tasks.filter(isTaskOverdue).length;

  const isAdmin = currentUser?.role === 'admin';

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-1">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center space-x-2">
            <span>Welcome back, {currentUser?.name || 'Alex Rivera'} 👋</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {isAdmin
              ? 'Admin Command Center: Manage all team tasks, oversee deliverables, and configure assignments.'
              : filterParam === 'mine'
              ? 'Showing only tasks created by or assigned to you.'
              : 'Product Roadmap Q4: Track features, bugs, and milestones for the upcoming quarter launch.'}
          </p>
        </div>

        {/* Right Actions: Team stack, Completed toggle, + New Task */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center -space-x-2 mr-2">
            <div className="w-8 h-8 rounded-full bg-slate-800 dark:bg-indigo-600 text-white flex items-center justify-center text-xs font-bold ring-2 ring-white dark:ring-slate-900">
              S
            </div>
            <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-bold ring-2 ring-white dark:ring-slate-900">
              M
            </div>
            <div className="w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center text-xs font-bold ring-2 ring-white dark:ring-slate-900">
              E
            </div>
            <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center text-[10px] font-bold ring-2 ring-white dark:ring-slate-900">
              +12
            </div>
          </div>

          <button
            onClick={() => setShowCompletedOnly(!showCompletedOnly)}
            className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
              showCompletedOnly
                ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300'
                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Completed</span>
          </button>

          <button
            onClick={() => setIsCreateOpen(true)}
            className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 hover:scale-[1.02] transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>New Task</span>
          </button>
        </div>
      </div>

      {/* Extended 6-Card Dashboard Statistics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {/* Total Tasks */}
        <div className="saas-card p-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] font-semibold text-slate-400 block uppercase tracking-wider">
              Total Tasks
            </span>
            <span className="text-lg font-black text-slate-900 dark:text-white leading-tight">
              {tasks.length}
            </span>
          </div>
        </div>

        {/* To Do */}
        <div className="saas-card p-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center shrink-0">
            <Briefcase className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] font-semibold text-slate-400 block uppercase tracking-wider">
              To Do
            </span>
            <span className="text-lg font-black text-slate-900 dark:text-white leading-tight">
              {tasks.filter((t) => t.status === 'TODO').length}
            </span>
          </div>
        </div>

        {/* Doing */}
        <div className="saas-card p-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] font-semibold text-slate-400 block uppercase tracking-wider">
              Doing
            </span>
            <span className="text-lg font-black text-slate-900 dark:text-white leading-tight">
              {tasks.filter((t) => t.status === 'DOING').length}
            </span>
          </div>
        </div>

        {/* Done */}
        <div className="saas-card p-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] font-semibold text-slate-400 block uppercase tracking-wider">
              Done
            </span>
            <span className="text-lg font-black text-slate-900 dark:text-white leading-tight">
              {tasks.filter((t) => t.status === 'DONE').length}
            </span>
          </div>
        </div>

        {/* High Priority */}
        <div className="saas-card p-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
            <Flame className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] font-semibold text-slate-400 block uppercase tracking-wider">
              High Priority
            </span>
            <span className="text-lg font-black text-rose-600 dark:text-rose-400 leading-tight">
              {highPriorityCount}
            </span>
          </div>
        </div>

        {/* Overdue */}
        <div className="saas-card p-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-red-50 dark:bg-red-950/50 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] font-semibold text-slate-400 block uppercase tracking-wider">
              Overdue
            </span>
            <span className="text-lg font-black text-red-600 dark:text-red-400 leading-tight">
              {overdueCount}
            </span>
          </div>
        </div>
      </div>

      {/* Comprehensive Toolbar Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        <div className="flex flex-wrap items-center gap-2">
          {/* Search */}
          <div className="relative w-56">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tasks or assignees..."
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:border-indigo-500 shadow-sm"
            />
          </div>

          {/* Priority Filter */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value as any)}
            className="px-3 py-1.5 text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 focus:outline-none focus:border-indigo-500 shadow-sm cursor-pointer"
          >
            <option value="ALL">Priority: All</option>
            <option value="HIGH">Priority: High</option>
            <option value="MEDIUM">Priority: Medium</option>
            <option value="LOW">Priority: Low</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-3 py-1.5 text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 focus:outline-none focus:border-indigo-500 shadow-sm cursor-pointer"
          >
            <option value="ALL">Status: All</option>
            <option value="TODO">Status: To Do</option>
            <option value="DOING">Status: Doing</option>
            <option value="DONE">Status: Done</option>
          </select>

          {/* Assigned User Filter */}
          <select
            value={assigneeFilter}
            onChange={(e) => setAssigneeFilter(e.target.value)}
            className="px-3 py-1.5 text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 focus:outline-none focus:border-indigo-500 shadow-sm cursor-pointer"
          >
            <option value="ALL">Assignee: All</option>
            <option value="ME">Assigned to Me</option>
            <option value="UNASSIGNED">Unassigned</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name}
              </option>
            ))}
          </select>

          {/* Reset Filters */}
          {(searchQuery || priorityFilter !== 'ALL' || statusFilter !== 'ALL' || assigneeFilter !== 'ALL' || showCompletedOnly || filterParam) && (
            <button
              onClick={handleResetFilters}
              className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 font-semibold px-2 py-1"
            >
              Reset
            </button>
          )}
        </div>

        {/* View Switcher: Board, Table, Timeline */}
        <div className="flex items-center space-x-1 bg-slate-200/70 dark:bg-slate-800 p-1 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400">
          <button
            onClick={() => setViewMode('board')}
            className={`px-3 py-1 rounded-lg transition-colors ${
              viewMode === 'board' ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm' : 'hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Board
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`px-3 py-1 rounded-lg transition-colors ${
              viewMode === 'table' ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm' : 'hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Table
          </button>
          <button
            onClick={() => setViewMode('timeline')}
            className={`px-3 py-1 rounded-lg transition-colors ${
              viewMode === 'timeline' ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm' : 'hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Timeline
          </button>
        </div>
      </div>

      {/* View 1: Kanban Board View */}
      {viewMode === 'board' && (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
            <TaskColumn
              id="TODO"
              title="To Do"
              tasks={todoTasks}
              currentUser={currentUser}
              onEditTask={(t) => {
                setSelectedTask(t);
                setIsDetailOpen(true);
              }}
              onDeleteTask={handleDeleteTask}
              onClaimTask={handleClaimTask}
              onQuickAdd={() => setIsCreateOpen(true)}
            />

            <TaskColumn
              id="DOING"
              title="Doing"
              tasks={doingTasks}
              currentUser={currentUser}
              onEditTask={(t) => {
                setSelectedTask(t);
                setIsDetailOpen(true);
              }}
              onDeleteTask={handleDeleteTask}
              onClaimTask={handleClaimTask}
              onQuickAdd={() => setIsCreateOpen(true)}
            />

            <TaskColumn
              id="DONE"
              title="Done"
              tasks={doneTasks}
              currentUser={currentUser}
              onEditTask={(t) => {
                setSelectedTask(t);
                setIsDetailOpen(true);
              }}
              onDeleteTask={handleDeleteTask}
              onClaimTask={handleClaimTask}
              onQuickAdd={() => setIsCreateOpen(true)}
            />
          </div>

          <DragOverlay>
            {activeTask ? (
              <div className="rotate-2 scale-105 shadow-2xl">
                <TaskCard
                  task={activeTask}
                  currentUser={currentUser}
                  onEdit={() => {}}
                />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      )}

      {/* View 2: Table / Spreadsheet View */}
      {viewMode === 'table' && (
        <div className="saas-card bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm pt-1">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Task</th>
                  <th className="py-3.5 px-4">Priority</th>
                  <th className="py-3.5 px-4">Assignee</th>
                  <th className="py-3.5 px-4">Due Date</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredTasks.map((task) => {
                  const isMine =
                    (task.creator?._id || (task.creator as any)?.id) === currentUser?.id ||
                    (task.assignedUser?._id || (task.assignedUser as any)?.id) === currentUser?.id;
                  const canDelete = isAdmin || isMine;

                  return (
                    <tr
                      key={task._id}
                      onClick={() => {
                        setSelectedTask(task);
                        setIsDetailOpen(true);
                      }}
                      className="hover:bg-slate-50/70 dark:hover:bg-slate-800/50 cursor-pointer transition-colors"
                    >
                      <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
                        <select
                          value={task.status}
                          onChange={async (e) => {
                            const newStatus = e.target.value as TaskStatus;
                            setTasks((prev) =>
                              prev.map((t) => (t._id === task._id ? { ...t, status: newStatus } : t))
                            );
                            await api.patch(`/tasks/${task._id}/status`, { status: newStatus });
                          }}
                          className={`text-[10px] font-extrabold uppercase tracking-wider px-2 py-1 rounded-md border cursor-pointer focus:outline-none ${
                            task.status === 'DONE'
                              ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
                              : task.status === 'DOING'
                              ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                          }`}
                        >
                          <option value="TODO">To Do</option>
                          <option value="DOING">Doing</option>
                          <option value="DONE">Done</option>
                        </select>
                      </td>

                      <td className="py-3 px-4">
                        <p className="font-bold text-slate-900 dark:text-white leading-snug">
                          {task.title}
                        </p>
                        <p className="text-[11px] text-slate-400 line-clamp-1 max-w-xs">
                          {task.description}
                        </p>
                      </td>

                      <td className="py-3 px-4">
                        <span
                          className={`inline-block text-[9px] font-extrabold uppercase px-2 py-0.5 rounded border ${
                            task.priority === 'HIGH'
                              ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800'
                              : task.priority === 'MEDIUM'
                              ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800'
                              : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                          }`}
                        >
                          {task.priority || 'MEDIUM'}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        {task.assignedUser ? (
                          <div className="flex items-center space-x-2">
                            <div className="w-6 h-6 rounded-full bg-slate-800 dark:bg-indigo-600 text-white flex items-center justify-center font-bold text-[10px]">
                              {task.assignedUser.name.charAt(0).toUpperCase()}
                            </div>
                            <span className="font-medium text-slate-700 dark:text-slate-300">
                              {task.assignedUser.name}
                            </span>
                          </div>
                        ) : (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleClaimTask(task._id);
                            }}
                            className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                          >
                            + Claim Task
                          </button>
                        )}
                      </td>

                      <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                        {task.dueDate
                          ? new Date(task.dueDate).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                            })
                          : 'No date'}
                      </td>

                      <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => {
                              setSelectedTask(task);
                              setIsDetailOpen(true);
                            }}
                            className="px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 text-[11px] font-semibold"
                          >
                            Details
                          </button>
                          {canDelete && (
                            <button
                              onClick={() => {
                                if (confirm('Delete this task?')) handleDeleteTask(task._id);
                              }}
                              className="px-2 py-1 rounded-lg text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-[11px] font-semibold"
                            >
                              Delete
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {filteredTasks.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400">
                      No tasks found in Table view.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* View 3: Timeline / Gantt Roadmap View */}
      {viewMode === 'timeline' && (
        <div className="saas-card bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Sprint Roadmap & Gantt Schedule
              </h3>
              <p className="text-[11px] text-slate-400">
                Visualizing task completion windows across September – October sprints
              </p>
            </div>
            <div className="flex items-center space-x-2 text-[10px] font-semibold">
              <span className="flex items-center space-x-1 text-slate-500">
                <span className="w-2.5 h-2.5 rounded-sm bg-rose-500 inline-block"></span>
                <span>High</span>
              </span>
              <span className="flex items-center space-x-1 text-slate-500">
                <span className="w-2.5 h-2.5 rounded-sm bg-amber-500 inline-block"></span>
                <span>Medium</span>
              </span>
              <span className="flex items-center space-x-1 text-slate-500">
                <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500 inline-block"></span>
                <span>Done</span>
              </span>
            </div>
          </div>

          {/* Timeline Grid Header */}
          <div className="grid grid-cols-12 gap-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider py-2 border-b border-slate-100 dark:border-slate-800">
            <div className="col-span-4">Task Deliverable</div>
            <div className="col-span-2 text-center">Sep 1 – 7</div>
            <div className="col-span-2 text-center">Sep 8 – 14</div>
            <div className="col-span-2 text-center">Sep 15 – 21</div>
            <div className="col-span-2 text-center">Sep 22 – 30</div>
          </div>

          {/* Timeline Rows */}
          <div className="space-y-3 pt-2">
            {filteredTasks.map((task, index) => {
              // Calculate a visual Gantt offset and span
              const spanStart = (index % 3) * 2;
              const spanWidth = 4 + (index % 3);

              return (
                <div
                  key={task._id}
                  onClick={() => {
                    setSelectedTask(task);
                    setIsDetailOpen(true);
                  }}
                  className="grid grid-cols-12 gap-1 items-center hover:bg-slate-50 dark:hover:bg-slate-800/40 p-1.5 rounded-xl cursor-pointer transition-colors"
                >
                  <div className="col-span-4 pr-3 flex items-center space-x-2 truncate">
                    <span
                      className={`w-2 h-2 rounded-full shrink-0 ${
                        task.status === 'DONE'
                          ? 'bg-emerald-500'
                          : task.priority === 'HIGH'
                          ? 'bg-rose-500'
                          : 'bg-amber-500'
                      }`}
                    ></span>
                    <span className="font-semibold text-xs text-slate-800 dark:text-slate-200 truncate">
                      {task.title}
                    </span>
                  </div>

                  {/* Gantt Bar Area across remaining 8 cols */}
                  <div className="col-span-8 relative h-7 bg-slate-100 dark:bg-slate-800/60 rounded-lg overflow-hidden flex items-center px-1">
                    {/* Gantt Bar */}
                    <div
                      style={{
                        marginLeft: `${spanStart * 12}%`,
                        width: `${Math.min(spanWidth * 16, 85)}%`,
                      }}
                      className={`h-5 rounded-md px-2 flex items-center justify-between text-[10px] font-bold text-white shadow-sm transition-all hover:brightness-110 ${
                        task.status === 'DONE'
                          ? 'bg-gradient-to-r from-emerald-600 to-teal-500'
                          : task.priority === 'HIGH'
                          ? 'bg-gradient-to-r from-rose-600 to-pink-500'
                          : 'bg-gradient-to-r from-indigo-600 to-purple-500'
                      }`}
                    >
                      <span className="truncate">{task.status}</span>
                      <span className="opacity-80 text-[9px] hidden sm:inline">
                        {task.dueDate
                          ? new Date(task.dueDate).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                            })
                          : 'Sprint'}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}

            {filteredTasks.length === 0 && (
              <div className="py-8 text-center text-slate-400 text-xs">
                No tasks to display on the Timeline roadmap.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modals */}
      <CreateTaskModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSubmit={handleCreateTask}
        users={users}
        currentUser={currentUser}
      />

      <TaskDetailModal
        isOpen={isDetailOpen}
        onClose={() => {
          setIsDetailOpen(false);
          setSelectedTask(null);
        }}
        task={selectedTask}
        currentUser={currentUser}
        users={users}
        onUpdate={handleUpdateTask}
        onAssign={handleAssignTask}
        onDelete={handleDeleteTask}
        onClaim={handleClaimTask}
        onAddComment={handleAddComment}
      />
    </div>
  );
}
