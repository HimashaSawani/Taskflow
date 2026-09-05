import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { TaskService } from '../services/task.service';

export const createTaskSchema = z.object({
  title: z.string().min(2, 'Title must be at least 2 characters').max(120, 'Title cannot exceed 120 characters'),
  description: z.string().min(2, 'Description must be at least 2 characters').max(2000, 'Description cannot exceed 2000 characters'),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).optional(),
  dueDate: z.string().nullable().optional(),
  assignedUserId: z.string().optional().nullable(),
});

export const updateTaskSchema = z.object({
  title: z.string().min(2, 'Title must be at least 2 characters').max(120, 'Title cannot exceed 120 characters').optional(),
  description: z.string().min(2, 'Description must be at least 2 characters').max(2000, 'Description cannot exceed 2000 characters').optional(),
  status: z.enum(['TODO', 'DOING', 'DONE']).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).optional(),
  dueDate: z.string().nullable().optional(),
});

export const updateStatusSchema = z.object({
  status: z.enum(['TODO', 'DOING', 'DONE'], {
    errorMap: () => ({ message: 'Status must be one of: TODO, DOING, DONE' }),
  }),
});

export const assignTaskSchema = z.object({
  assignedUserId: z.string().nullable().optional(),
});

export const addCommentSchema = z.object({
  text: z.string().min(1, 'Comment text is required').max(1000, 'Comment cannot exceed 1000 characters'),
});

const getParamId = (req: Request): string => {
  return Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
};

export class TaskController {
  static async getTasks(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const tasks = await TaskService.getTasks(req.user!);
      res.status(200).json({ tasks });
    } catch (error) {
      next(error);
    }
  }

  static async getTaskById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const task = await TaskService.getTaskById(getParamId(req), req.user!);
      res.status(200).json({ task });
    } catch (error) {
      next(error);
    }
  }

  static async createTask(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const task = await TaskService.createTask(req.body, req.user!);
      res.status(201).json({ message: 'Task created successfully', task });
    } catch (error) {
      next(error);
    }
  }

  static async updateTask(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const task = await TaskService.updateTask(getParamId(req), req.body, req.user!);
      res.status(200).json({ message: 'Task updated successfully', task });
    } catch (error) {
      next(error);
    }
  }

  static async deleteTask(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await TaskService.deleteTask(getParamId(req), req.user!);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  static async updateStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const task = await TaskService.updateStatus(getParamId(req), req.body.status, req.user!);
      res.status(200).json({ message: 'Task status updated successfully', task });
    } catch (error) {
      next(error);
    }
  }

  static async assignTask(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const task = await TaskService.assignTask(
        getParamId(req),
        req.body.assignedUserId ?? null,
        req.user!
      );
      res.status(200).json({ message: 'Task assignment updated successfully', task });
    } catch (error) {
      next(error);
    }
  }

  static async addComment(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const task = await TaskService.addComment(getParamId(req), req.body.text, req.user!);
      res.status(201).json({ message: 'Comment added successfully', task });
    } catch (error) {
      next(error);
    }
  }
}
