'use client';

import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Task, TaskPriority } from '../types/task';
import { User } from '../types/user';
import { 
  Clock, 
  MessageSquare, 
  Paperclip, 
  UserCheck, 
  Trash2,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  GripVertical
} from 'lucide-react';

interface TaskCardProps {
  task: Task;
  currentUser: User | null;
  onEdit: (task: Task) => void;
  onDelete?: (taskId: string) => void;
  onClaim?: (taskId: string) => void;
  onOpenAssign?: (task: Task) => void;
}

export default function TaskCard({
  task,
  currentUser,
  onEdit,
  onDelete,
  onClaim,
  onOpenAssign,
}: TaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const isAdmin = currentUser?.role === 'admin';
  const isCreator = (task.creator?._id || (task.creator as any)?.id) === currentUser?.id;
  const isAssignedToMe = (task.assignedUser?._id || (task.assignedUser as any)?.id) === currentUser?.id;
  const isUnassigned = !task.assignedUser;

  const canDrag = isAdmin || isCreator || isAssignedToMe || isUnassigned;
  const canDelete = isAdmin || isCreator;

  // Priority badge styling
  const priorityBadgeStyle: Record<TaskPriority, string> = {
    HIGH: 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border-rose-200/80 dark:border-rose-800/60',
    MEDIUM: 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border-amber-200/80 dark:border-amber-800/60',
    LOW: 'bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700',
  };

  const currentPriority = task.priority || 'MEDIUM';

  // Enhanced Due Date Calculation (Overdue & Remaining Days)
  const getDueDateInfo = (dateStr?: string | null) => {
    if (task.status === 'DONE') {
      return {
        label: 'Completed',
        isOverdue: false,
        badgeClass: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/60',
        icon: <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />,
      };
    }

    if (!dateStr) {
      return {
        label: 'No deadline',
        isOverdue: false,
        badgeClass: 'text-slate-400',
        icon: <Clock className="w-3 h-3 text-slate-400" />,
      };
    }

    try {
      const now = new Date();
      now.setHours(0, 0, 0, 0);
      const due = new Date(dateStr);
      due.setHours(0, 0, 0, 0);

      const diffTime = due.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      const formattedDate = due.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

      if (diffDays < 0) {
        return {
          label: `Overdue (${Math.abs(diffDays)}d)`,
          isOverdue: true,
          badgeClass: 'bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800/60 font-bold',
          icon: <AlertTriangle className="w-3 h-3 text-rose-600 dark:text-rose-400" />,
        };
      } else if (diffDays === 0) {
        return {
          label: 'Due Today',
          isOverdue: false,
          badgeClass: 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800/60 font-bold',
          icon: <Clock className="w-3 h-3 text-amber-600 dark:text-amber-400" />,
        };
      } else if (diffDays <= 3) {
        return {
          label: `${formattedDate} (${diffDays}d left)`,
          isOverdue: false,
          badgeClass: 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800/60 font-semibold',
          icon: <Clock className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />,
        };
      } else {
        return {
          label: `Due ${formattedDate}`,
          isOverdue: false,
          badgeClass: 'text-slate-500 dark:text-slate-400',
          icon: <Clock className="w-3 h-3 text-slate-400" />,
        };
      }
    } catch {
      return {
        label: 'Oct 12',
        isOverdue: false,
        badgeClass: 'text-slate-400',
        icon: <Clock className="w-3 h-3 text-slate-400" />,
      };
    }
  };

  const dueInfo = getDueDateInfo(task.dueDate);

  const formatCreatedDate = (dateStr?: string) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } catch {
      return '';
    }
  };

  const getTags = () => {
    const titleLower = task.title.toLowerCase();
    if (titleLower.includes('design') || titleLower.includes('ui')) return ['Design', 'UI/UX'];
    if (titleLower.includes('api') || titleLower.includes('auth')) return ['Engineering', 'API'];
    if (titleLower.includes('database') || titleLower.includes('migration')) return ['Backend', 'Infra'];
    if (titleLower.includes('security') || titleLower.includes('audit')) return ['Security'];
    if (titleLower.includes('interview') || titleLower.includes('feedback')) return ['Research'];
    return ['Product'];
  };

  const tags = getTags();

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={() => onEdit(task)}
      className={`saas-card group relative p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl cursor-pointer select-none transition-all duration-150 ${
        isDragging
          ? 'opacity-40 scale-105 shadow-2xl ring-2 ring-indigo-500 z-50'
          : 'hover:border-indigo-200 dark:hover:border-indigo-800 hover:shadow-md'
      }`}
    >
      {/* Top Header: Priority Badge, Created Date, and Quick Actions */}
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center space-x-2">
          <span
            className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-md border tracking-wider ${
              priorityBadgeStyle[currentPriority]
            }`}
          >
            {currentPriority}
          </span>
          {task.createdAt && (
            <span className="text-[10px] text-slate-400 font-medium">
              Created {formatCreatedDate(task.createdAt)}
            </span>
          )}
        </div>

        <div className="flex items-center space-x-1">
          {/* Claim Button */}
          {isUnassigned && onClaim && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onClaim(task._id);
              }}
              className="px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900 text-indigo-600 dark:text-indigo-400 text-[10px] font-bold flex items-center space-x-1 transition-colors border border-indigo-200 dark:border-indigo-800"
              title="Assign to Myself"
            >
              <UserCheck className="w-3 h-3" />
              <span>Claim</span>
            </button>
          )}

          {/* Delete own task */}
          {canDelete && onDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (confirm('Delete this task?')) {
                  onDelete(task._id);
                }
              }}
              className="opacity-0 group-hover:opacity-100 p-1 rounded-md text-slate-300 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-all"
              title="Delete Task"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Drag Handle */}
          {canDrag && (
            <div
              {...attributes}
              {...listeners}
              onClick={(e) => e.stopPropagation()}
              className="cursor-grab active:cursor-grabbing p-1 text-slate-300 dark:text-slate-600 hover:text-slate-600 dark:hover:text-slate-300 rounded transition-colors"
              title="Drag task"
            >
              <GripVertical className="w-3.5 h-3.5" />
            </div>
          )}
        </div>
      </div>

      {/* Title */}
      <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm leading-snug line-clamp-2 mb-1.5">
        {task.title}
      </h4>

      {/* Description */}
      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-3 leading-relaxed">
        {task.description}
      </p>

      {/* Tags */}
      <div className="flex flex-wrap gap-1.5 mb-3.5">
        {tags.map((tag) => (
          <span
            key={tag}
            className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px] font-medium"
          >
            {tag}
          </span>
        ))}
      </div>

      {/* Bottom Row: Enhanced Due Date with Overdue Indicator, Counters, Assignee */}
      <div className="flex items-center justify-between pt-2.5 border-t border-slate-100 dark:border-slate-800 text-slate-400 text-[11px]">
        <div className="flex items-center space-x-3">
          {/* Enhanced Due Date Pill */}
          <div
            className={`flex items-center space-x-1 text-[10px] px-1.5 py-0.5 rounded-md border ${dueInfo.badgeClass}`}
          >
            {dueInfo.icon}
            <span>{dueInfo.label}</span>
          </div>

          {/* Comments count */}
          <div className="flex items-center space-x-0.5">
            <MessageSquare className="w-3 h-3 text-slate-400" />
            <span>{task.comments?.length ?? 0}</span>
          </div>

          {/* Attachments count */}
          <div className="flex items-center space-x-0.5">
            <Paperclip className="w-3 h-3 text-slate-400" />
            <span>1</span>
          </div>
        </div>

        {/* Assignee Avatar */}
        <div className="flex items-center space-x-1.5">
          {task.assignedUser ? (
            <div className="flex items-center space-x-1.5">
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium hidden sm:inline">
                {task.assignedUser.name.split(' ')[0]}
              </span>
              <div
                className="w-6 h-6 rounded-full bg-slate-800 dark:bg-indigo-600 text-white flex items-center justify-center text-[10px] font-bold ring-2 ring-white dark:ring-slate-900"
                title={`Assigned to ${task.assignedUser.name}`}
              >
                {task.assignedUser.name.charAt(0).toUpperCase()}
              </div>
            </div>
          ) : (
            <div
              className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 border border-dashed border-slate-300 dark:border-slate-700 text-slate-400 flex items-center justify-center text-[10px]"
              title="Unassigned"
            >
              ?
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
