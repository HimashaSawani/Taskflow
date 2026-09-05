import mongoose from 'mongoose';
import { Task, ITask, TaskStatus, TaskPriority } from '../models/Task';
import { User, IUser } from '../models/User';
import { ActivityService } from './activity.service';
import { AppError } from '../middleware/error.middleware';

export interface CreateTaskDto {
  title: string;
  description: string;
  priority?: TaskPriority;
  dueDate?: string | null;
  assignedUserId?: string | null;
}

export interface UpdateTaskDto {
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueDate?: string | null;
}

export class TaskService {
  /**
   * List tasks based on role:
   * - Admin: sees all tasks
   * - Normal User: sees tasks they created, tasks assigned to them, or unassigned tasks (available to claim)
   */
  static async getTasks(user: IUser) {
    let query: any = {};

    if (user.role !== 'admin') {
      query = {
        $or: [
          { creator: user._id },
          { assignedUser: user._id },
          { assignedUser: null },
        ],
      };
    }

    return Task.find(query)
      .populate('creator', 'name email role')
      .populate('assignedUser', 'name email role')
      .populate('comments.user', 'name email role')
      .sort({ createdAt: -1 });
  }

  /**
   * Get single task with permission check
   */
  static async getTaskById(taskId: string, user: IUser) {
    if (!mongoose.Types.ObjectId.isValid(taskId)) {
      throw new AppError('Invalid task ID format', 400);
    }

    const task = await Task.findById(taskId)
      .populate('creator', 'name email role')
      .populate('assignedUser', 'name email role')
      .populate('comments.user', 'name email role');

    if (!task) {
      throw new AppError('Task not found', 404);
    }

    if (user.role !== 'admin') {
      const isCreator = (task.creator as any)?._id?.toString() === user._id.toString();
      const isAssigned = (task.assignedUser as any)?._id?.toString() === user._id.toString();
      const isUnassigned = !task.assignedUser;

      if (!isCreator && !isAssigned && !isUnassigned) {
        throw new AppError('Forbidden: You do not have permission to view this task', 403);
      }
    }

    return task;
  }

  /**
   * Create task:
   * - Normal user: creator = current user, assignedUser = null (any submitted assignedUser is rejected/ignored)
   * - Admin: creator = current user, can optionally assign to any valid user or leave null
   */
  static async createTask(dto: CreateTaskDto, user: IUser) {
    let assignedUserId: mongoose.Types.ObjectId | null = null;

    if (user.role === 'admin') {
      if (dto.assignedUserId && mongoose.Types.ObjectId.isValid(dto.assignedUserId)) {
        assignedUserId = new mongoose.Types.ObjectId(dto.assignedUserId);
      }
    } else {
      assignedUserId = null;
    }

    const task = await Task.create({
      title: dto.title.trim(),
      description: dto.description.trim(),
      status: 'TODO',
      priority: dto.priority || 'MEDIUM',
      dueDate: dto.dueDate ? new Date(dto.dueDate) : null,
      creator: user._id,
      assignedUser: assignedUserId,
    });

    const populatedTask = await Task.findById(task._id)
      .populate('creator', 'name email role')
      .populate('assignedUser', 'name email role');

    // Log activity
    await ActivityService.log(
      user._id,
      'CREATED',
      `${user.name} created task '${task.title}'`,
      task._id
    );

    return populatedTask;
  }

  /**
   * Update task details (title, description, priority, dueDate):
   */
  static async updateTask(taskId: string, dto: UpdateTaskDto, user: IUser) {
    const task = await this.getTaskById(taskId, user);

    if (user.role !== 'admin') {
      const isCreator = (task.creator as any)?._id?.toString() === user._id.toString();
      const isAssigned = (task.assignedUser as any)?._id?.toString() === user._id.toString();

      if (!isCreator && !isAssigned) {
        throw new AppError('Forbidden: You can only edit your own tasks', 403);
      }
    }

    if (dto.title !== undefined) task.title = dto.title.trim();
    if (dto.description !== undefined) task.description = dto.description.trim();
    if (dto.status !== undefined) task.status = dto.status;
    if (dto.priority !== undefined) task.priority = dto.priority;
    if (dto.dueDate !== undefined) {
      task.dueDate = dto.dueDate ? new Date(dto.dueDate) : null;
    }

    await task.save();

    await ActivityService.log(
      user._id,
      'UPDATED',
      `${user.name} updated task details for '${task.title}'`,
      task._id
    );

    return Task.findById(task._id)
      .populate('creator', 'name email role')
      .populate('assignedUser', 'name email role');
  }

  /**
   * Delete task
   */
  static async deleteTask(taskId: string, user: IUser) {
    const task = await this.getTaskById(taskId, user);

    if (user.role !== 'admin') {
      const isCreator = (task.creator as any)?._id?.toString() === user._id.toString();
      if (!isCreator) {
        throw new AppError('Forbidden: You can only delete tasks that you created', 403);
      }
    }

    const title = task.title;
    await Task.findByIdAndDelete(taskId);

    await ActivityService.log(
      user._id,
      'DELETED',
      `${user.name} deleted task '${title}'`,
      null
    );

    return { message: 'Task deleted successfully' };
  }

  /**
   * Update task status (Kanban drag & drop):
   */
  static async updateStatus(taskId: string, status: TaskStatus, user: IUser) {
    const validStatuses: TaskStatus[] = ['TODO', 'DOING', 'DONE'];
    if (!validStatuses.includes(status)) {
      throw new AppError(`Invalid status: ${status}. Must be TODO, DOING, or DONE`, 400);
    }

    const task = await this.getTaskById(taskId, user);

    if (user.role !== 'admin') {
      const isCreator = (task.creator as any)?._id?.toString() === user._id.toString();
      const isAssigned = (task.assignedUser as any)?._id?.toString() === user._id.toString();

      if (!isCreator && !isAssigned) {
        throw new AppError('Forbidden: You can only change the status of tasks assigned to or created by you', 403);
      }
    }

    const oldStatus = task.status;
    task.status = status;
    await task.save();

    await ActivityService.log(
      user._id,
      'STATUS_CHANGED',
      `${user.name} moved task '${task.title}' from ${oldStatus} → ${status}`,
      task._id
    );

    return Task.findById(task._id)
      .populate('creator', 'name email role')
      .populate('assignedUser', 'name email role');
  }

  /**
   * Assign or Reassign task
   */
  static async assignTask(taskId: string, targetUserId: string | null, user: IUser) {
    const task = await this.getTaskById(taskId, user);
    let targetUserName = 'Unassigned';

    if (user.role === 'admin') {
      if (!targetUserId || targetUserId.trim() === '' || targetUserId === 'unassigned') {
        task.assignedUser = null;
      } else {
        if (!mongoose.Types.ObjectId.isValid(targetUserId)) {
          throw new AppError('Invalid target user ID format', 400);
        }
        const targetUser = await User.findById(targetUserId);
        if (!targetUser) {
          throw new AppError('Target assignee user not found', 404);
        }
        task.assignedUser = new mongoose.Types.ObjectId(targetUserId);
        targetUserName = targetUser.name;
      }
    } else {
      // Normal user rules:
      if (task.assignedUser !== null) {
        throw new AppError(
          'Forbidden: Normal users cannot reassign tasks that are already assigned to someone.',
          403
        );
      }

      if (targetUserId && targetUserId !== user._id.toString()) {
        throw new AppError(
          'Forbidden: Normal users can only claim an unassigned task for themselves.',
          403
        );
      }

      task.assignedUser = user._id;
      targetUserName = user.name;
    }

    await task.save();

    const actionText = task.assignedUser
      ? `${user.name} assigned task '${task.title}' to ${targetUserName}`
      : `${user.name} unassigned task '${task.title}'`;

    await ActivityService.log(user._id, 'ASSIGNED', actionText, task._id);

    return Task.findById(task._id)
      .populate('creator', 'name email role')
      .populate('assignedUser', 'name email role')
      .populate('comments.user', 'name email role');
  }

  /**
   * Add a comment to a task
   */
  static async addComment(taskId: string, text: string, user: IUser) {
    if (!mongoose.Types.ObjectId.isValid(taskId)) {
      throw new AppError('Invalid task ID format', 400);
    }

    const task = await Task.findById(taskId);
    if (!task) {
      throw new AppError('Task not found', 404);
    }

    // Normal users can only comment on tasks relevant to them
    if (user.role !== 'admin') {
      const isCreator = (task.creator as any)?.toString() === user._id.toString();
      const isAssigned = (task.assignedUser as any)?.toString() === user._id.toString();
      const isUnassigned = !task.assignedUser;

      if (!isCreator && !isAssigned && !isUnassigned) {
        throw new AppError('Forbidden: You cannot comment on this task', 403);
      }
    }

    task.comments.push({
      user: user._id,
      text: text.trim(),
      createdAt: new Date(),
    });

    await task.save();

    await ActivityService.log(
      user._id,
      'UPDATED',
      `${user.name} commented on task '${task.title}': "${text.trim().substring(0, 45)}${text.trim().length > 45 ? '...' : ''}"`,
      task._id
    );

    return Task.findById(taskId)
      .populate('creator', 'name email role')
      .populate('assignedUser', 'name email role')
      .populate('comments.user', 'name email role');
  }
}
