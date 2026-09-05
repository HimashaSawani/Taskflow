import { User } from './user';

export type TaskStatus = 'TODO' | 'DOING' | 'DONE';
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH';

export interface TaskUserRef {
  _id: string;
  id?: string;
  name: string;
  email: string;
  role: string;
}

export interface TaskComment {
  _id?: string;
  user: TaskUserRef;
  text: string;
  createdAt: string;
}

export interface Task {
  _id: string;
  id?: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: string | null;
  creator: TaskUserRef;
  assignedUser: TaskUserRef | null;
  comments?: TaskComment[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaskInput {
  title: string;
  description: string;
  priority?: TaskPriority;
  dueDate?: string | null;
  assignedUserId?: string | null;
}

export interface UpdateTaskInput {
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueDate?: string | null;
}

export interface Activity {
  _id: string;
  user: TaskUserRef;
  task?: {
    _id: string;
    title: string;
    status: TaskStatus;
    priority: TaskPriority;
  } | null;
  action: 'CREATED' | 'STATUS_CHANGED' | 'ASSIGNED' | 'UPDATED' | 'DELETED';
  message: string;
  createdAt: string;
}
