'use client';

import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import TaskCard from './TaskCard';
import { Task, TaskStatus } from '../types/task';
import { User } from '../types/user';
import { Plus, MoreHorizontal } from 'lucide-react';

interface TaskColumnProps {
  id: TaskStatus;
  title: string;
  tasks: Task[];
  currentUser: User | null;
  onEditTask: (task: Task) => void;
  onDeleteTask?: (taskId: string) => void;
  onClaimTask?: (taskId: string) => void;
  onOpenAssign?: (task: Task) => void;
  onQuickAdd?: (status: TaskStatus) => void;
}

export default function TaskColumn({
  id,
  title,
  tasks,
  currentUser,
  onEditTask,
  onDeleteTask,
  onClaimTask,
  onOpenAssign,
  onQuickAdd,
}: TaskColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id,
  });

  const taskIds = tasks.map((t) => t._id);

  return (
    <div
      ref={setNodeRef}
      className={`flex flex-col rounded-2xl bg-transparent transition-all duration-200 min-h-[550px] p-2 ${
        isOver ? 'bg-indigo-50/40 ring-2 ring-indigo-400/40 rounded-2xl' : ''
      }`}
    >
      {/* Column Header matching Screenshot 3 */}
      <div className="flex items-center justify-between px-2 mb-3.5">
        <div className="flex items-center space-x-2">
          <h3 className="font-bold text-slate-800 text-sm">
            {title}
          </h3>
          <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-600 text-[11px] font-bold flex items-center justify-center">
            {tasks.length}
          </span>
        </div>

        <div className="flex items-center space-x-1">
          {onQuickAdd && (
            <button
              onClick={() => onQuickAdd(id)}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              title={`Add task to ${title}`}
            >
              <Plus className="w-4 h-4" />
            </button>
          )}
          <button
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            title="Options"
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Task List */}
      <div className="flex-1 space-y-3 overflow-y-auto pr-0.5 flex flex-col justify-start">
        {tasks.length === 0 && (
          <div className="p-5 my-2 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-center bg-slate-50/50 dark:bg-slate-900/30">
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              No tasks in {title}
            </p>
            {onQuickAdd && (
              <button
                type="button"
                onClick={() => onQuickAdd(id)}
                className="mt-2 inline-flex items-center space-x-1 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 hover:underline"
              >
                <span>Create your first task</span>
                <span>→</span>
              </button>
            )}
          </div>
        )}

        <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <TaskCard
              key={task._id}
              task={task}
              currentUser={currentUser}
              onEdit={onEditTask}
              onDelete={onDeleteTask}
              onClaim={onClaimTask}
              onOpenAssign={onOpenAssign}
            />
          ))}
        </SortableContext>

        {/* Ghost Dashed Add Card Slot */}
        {onQuickAdd && tasks.length > 0 && (
          <button
            onClick={() => onQuickAdd(id)}
            className="w-full border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl h-16 flex items-center justify-center text-slate-300 dark:text-slate-600 hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-indigo-300 dark:hover:border-indigo-700 hover:bg-white/60 dark:hover:bg-slate-900/50 transition-all group"
          >
            <Plus className="w-4 h-4 group-hover:scale-110 transition-transform" />
          </button>
        )}
      </div>
    </div>
  );
}
