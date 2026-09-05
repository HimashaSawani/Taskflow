'use client';

import React, { useState, useEffect } from 'react';
import { Task, TaskStatus, TaskPriority } from '../types/task';
import { User } from '../types/user';
import { 
  X, 
  Loader2, 
  LayoutGrid, 
  UserCheck, 
  Tag, 
  CheckSquare, 
  Calendar, 
  Paperclip, 
  ArrowRight, 
  Copy, 
  Archive, 
  Send, 
  Clock, 
  Edit3,
  UserPlus
} from 'lucide-react';

interface TaskDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task | null;
  currentUser: User | null;
  users: User[];
  onUpdate: (
    taskId: string,
    data: {
      title: string;
      description: string;
      status: TaskStatus;
      priority: TaskPriority;
      dueDate?: string | null;
    }
  ) => Promise<void>;
  onAssign: (taskId: string, assignedUserId: string | null) => Promise<void>;
  onDelete: (taskId: string) => Promise<void>;
  onClaim: (taskId: string) => Promise<void>;
  onAddComment?: (taskId: string, text: string) => Promise<void>;
}

export default function TaskDetailModal({
  isOpen,
  onClose,
  task,
  currentUser,
  users,
  onUpdate,
  onAssign,
  onDelete,
  onClaim,
  onAddComment,
}: TaskDetailModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<TaskStatus>('TODO');
  const [priority, setPriority] = useState<TaskPriority>('MEDIUM');
  const [dueDate, setDueDate] = useState('');
  const [isEditingDesc, setIsEditingDesc] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [assignDropdownOpen, setAssignDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description);
      setStatus(task.status);
      setPriority(task.priority || 'MEDIUM');
      if (task.dueDate) {
        try {
          const d = new Date(task.dueDate);
          setDueDate(d.toISOString().split('T')[0]);
        } catch {
          setDueDate('');
        }
      } else {
        setDueDate('');
      }
    }
  }, [task]);

  if (!isOpen || !task) return null;

  const isAdmin = currentUser?.role === 'admin';
  const isCreator = (task.creator?._id || (task.creator as any)?.id) === currentUser?.id;
  const isAssignedToMe = (task.assignedUser?._id || (task.assignedUser as any)?.id) === currentUser?.id;
  const isUnassigned = !task.assignedUser;

  const handleSave = async () => {
    if (!title.trim() || !description.trim()) {
      setError('Title and description are required.');
      return;
    }

    try {
      setLoading(true);
      await onUpdate(task._id, {
        title,
        description,
        status,
        priority,
        dueDate: dueDate || null,
      });
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save changes.');
    } finally {
      setLoading(false);
    }
  };

  const handleAssignMember = async (userId: string | null) => {
    try {
      setLoading(true);
      await onAssign(task._id, userId);
      setAssignDropdownOpen(false);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to reassign task.');
    } finally {
      setLoading(false);
    }
  };

  const handleArchive = async () => {
    if (!confirm('Are you sure you want to archive (delete) this task?')) return;
    try {
      setLoading(true);
      await onDelete(task._id);
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete task.');
    } finally {
      setLoading(false);
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || submittingComment) return;

    try {
      setSubmittingComment(true);
      if (onAddComment) {
        await onAddComment(task._id, commentText.trim());
      }
      setCommentText('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to post comment.');
    } finally {
      setSubmittingComment(false);
    }
  };

  const statusLabelMap: Record<TaskStatus, string> = {
    TODO: 'To Do',
    DOING: 'In Progress',
    DONE: 'Completed',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white w-full max-w-3xl rounded-2xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header Breadcrumb matching Image 2 */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center space-x-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            <LayoutGrid className="w-4 h-4 text-indigo-600" />
            <span>In Board: Product Roadmap</span>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 text-xs">
            {error}
          </div>
        )}

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Editable Large Title matching Image 2 */}
          <div>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full text-xl font-bold text-slate-900 tracking-tight border border-transparent hover:border-slate-200 focus:border-indigo-500 focus:bg-slate-50/50 rounded-xl px-2 py-1 transition-all focus:outline-none"
              placeholder="Task Title..."
            />
          </div>

          {/* Main 2-Column Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Left Column (2 Cols) */}
            <div className="md:col-span-2 space-y-6">
              {/* Metadata Row: Assignees & Status */}
              <div className="flex items-center space-x-8">
                {/* Assignees */}
                <div>
                  <span className="text-xs font-medium text-slate-400 block mb-1.5">
                    Assignees
                  </span>
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-full bg-slate-800 text-white flex items-center justify-center text-xs font-bold">
                      {task.assignedUser ? task.assignedUser.name.charAt(0).toUpperCase() : '?'}
                    </div>
                    <span className="text-xs font-semibold text-slate-700">
                      {task.assignedUser ? task.assignedUser.name : 'Viewing only'}
                    </span>
                  </div>
                </div>

                {/* Status Dropdown */}
                <div>
                  <span className="text-xs font-medium text-slate-400 block mb-1.5">
                    Status
                  </span>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as TaskStatus)}
                    className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="TODO">To Do</option>
                    <option value="DOING">In Progress</option>
                    <option value="DONE">Completed</option>
                  </select>
                </div>
              </div>

              {/* Description Block */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-800 flex items-center space-x-1.5">
                    <span>Description</span>
                  </span>
                  <button
                    onClick={() => setIsEditingDesc(!isEditingDesc)}
                    className="text-xs text-indigo-600 hover:text-indigo-700 font-semibold px-2 py-0.5 rounded hover:bg-indigo-50"
                  >
                    {isEditingDesc ? 'Done' : 'Edit'}
                  </button>
                </div>

                {isEditingDesc ? (
                  <textarea
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full text-xs text-slate-700 p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                ) : (
                  <div className="p-3.5 bg-slate-50/70 border border-slate-100 rounded-xl text-xs text-slate-600 leading-relaxed min-h-[80px]">
                    {description || 'No description provided.'}
                  </div>
                )}
              </div>

              {/* Activity Timeline Section matching Image 2 */}
              <div className="pt-4 border-t border-slate-100 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">Activity</span>
                  <span className="text-[11px] font-semibold text-slate-400 hover:text-slate-600 cursor-pointer">
                    Show Details
                  </span>
                </div>

                {/* Comment Box */}
                <form onSubmit={handleCommentSubmit} className="flex items-center space-x-2.5">
                  <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold shrink-0">
                    {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      placeholder="Write a comment... (Press Enter to post)"
                      disabled={submittingComment}
                      className="w-full text-xs pl-3 pr-8 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-800"
                    />
                    <button
                      type="submit"
                      disabled={!commentText.trim() || submittingComment}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600 disabled:opacity-40"
                    >
                      {submittingComment ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-600" />
                      ) : (
                        <Send className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </form>

                {/* Real Comments Feed */}
                {task.comments && task.comments.length > 0 && (
                  <div className="space-y-2 pt-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Comments ({task.comments.length})
                    </span>
                    {task.comments.map((comment, cIdx) => (
                      <div
                        key={comment._id || cIdx}
                        className="p-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-xl space-y-1"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <div className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[9px] font-bold">
                              {comment.user?.name ? comment.user.name.charAt(0).toUpperCase() : 'U'}
                            </div>
                            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                              {comment.user?.name || 'Team Member'}
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-400">
                            {new Date(comment.createdAt).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-300 pl-7 leading-relaxed">
                          {comment.text}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Activity Events */}
                <div className="space-y-2 pt-2 text-xs text-slate-500">
                  <div className="flex items-start space-x-2.5">
                    <div className="w-6 h-6 rounded-full bg-slate-800 text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                      {task.creator?.name ? task.creator.name.charAt(0).toUpperCase() : 'C'}
                    </div>
                    <div>
                      <p className="text-slate-700 dark:text-slate-300">
                        <strong className="text-slate-900 dark:text-white">{task.creator?.name || 'Creator'}</strong> created this task
                      </p>
                      <span className="text-[10px] text-slate-400">
                        {new Date(task.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                  </div>

                  {task.assignedUser && (
                    <div className="flex items-start space-x-2.5">
                      <div className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                        {task.assignedUser.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-slate-700 dark:text-slate-300">
                          Assigned to <strong className="text-slate-900 dark:text-white">{task.assignedUser.name}</strong>
                        </p>
                        <span className="text-[10px] text-slate-400">Current Assignee</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Sidebar ("ADD TO CARD" & "ACTIONS") */}
            <div className="space-y-5">
              {/* ADD TO CARD */}
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                  Add To Card
                </span>
                <div className="space-y-1.5">
                  {/* Normal User Claim Button */}
                  {!isAdmin && isUnassigned && (
                    <button
                      onClick={() => onClaim(task._id)}
                      className="w-full flex items-center space-x-2 px-3 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-600 text-xs font-semibold transition-colors"
                    >
                      <UserCheck className="w-3.5 h-3.5" />
                      <span>Join Task</span>
                    </button>
                  )}

                  {/* Admin Assignment Trigger */}
                  {isAdmin && (
                    <div className="relative">
                      <button
                        onClick={() => setAssignDropdownOpen(!assignDropdownOpen)}
                        className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-600 text-xs font-semibold transition-colors"
                      >
                        <div className="flex items-center space-x-2">
                          <UserPlus className="w-3.5 h-3.5" />
                          <span>Members</span>
                        </div>
                        <span className="text-[9px] bg-indigo-200/60 px-1.5 py-0.5 rounded text-indigo-800">
                          Admin Only
                        </span>
                      </button>

                      {assignDropdownOpen && (
                        <div className="absolute right-0 mt-1 w-52 bg-white rounded-xl shadow-xl border border-slate-200 p-2 z-40 space-y-1">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 block py-1">
                            Assign Member:
                          </span>
                          <button
                            onClick={() => handleAssignMember(null)}
                            className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium text-amber-600 hover:bg-amber-50"
                          >
                            ○ Unassigned
                          </button>
                          {users.map((u) => (
                            <button
                              key={u.id}
                              onClick={() => handleAssignMember(u.id)}
                              className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center justify-between"
                            >
                              <span>{u.name}</span>
                              <span className="text-[10px] text-slate-400 uppercase">{u.role}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  <button className="w-full flex items-center space-x-2 px-3 py-2 rounded-xl bg-indigo-50/70 hover:bg-indigo-100 text-indigo-600 text-xs font-semibold transition-colors">
                    <Tag className="w-3.5 h-3.5" />
                    <span>Labels</span>
                  </button>

                  <button className="w-full flex items-center space-x-2 px-3 py-2 rounded-xl bg-indigo-50/70 hover:bg-indigo-100 text-indigo-600 text-xs font-semibold transition-colors">
                    <CheckSquare className="w-3.5 h-3.5" />
                    <span>Checklist</span>
                  </button>

                  <div className="p-2 rounded-xl bg-indigo-50/40 border border-indigo-100">
                    <div className="flex items-center space-x-1.5 mb-1.5">
                      <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                      <span className="text-[11px] font-semibold text-slate-700">Due Date</span>
                    </div>
                    <input
                      type="date"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      className="w-full text-xs p-1.5 bg-white border border-slate-200 rounded-lg text-slate-700"
                    />
                  </div>

                  <button className="w-full flex items-center space-x-2 px-3 py-2 rounded-xl bg-indigo-50/70 hover:bg-indigo-100 text-indigo-600 text-xs font-semibold transition-colors">
                    <Paperclip className="w-3.5 h-3.5" />
                    <span>Attachment</span>
                  </button>
                </div>
              </div>

              {/* ACTIONS */}
              <div className="pt-2 border-t border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                  Actions
                </span>
                <div className="space-y-1.5">
                  <button className="w-full flex items-center space-x-2 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium transition-colors">
                    <ArrowRight className="w-3.5 h-3.5" />
                    <span>Move</span>
                  </button>

                  <button className="w-full flex items-center space-x-2 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium transition-colors">
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy</span>
                  </button>

                  <button
                    onClick={handleArchive}
                    className="w-full flex items-center space-x-2 px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-semibold transition-colors"
                  >
                    <Archive className="w-3.5 h-3.5" />
                    <span>Archive</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Buttons matching Image 2 */}
        <div className="flex items-center justify-end space-x-3 px-6 py-4 border-t border-slate-100 bg-slate-50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={loading}
            className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-md shadow-indigo-600/20 transition-all disabled:opacity-50 flex items-center space-x-1.5"
          >
            {loading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <span>Save Changes</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
