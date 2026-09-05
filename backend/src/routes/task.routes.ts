import { Router } from 'express';
import {
  TaskController,
  createTaskSchema,
  updateTaskSchema,
  updateStatusSchema,
  assignTaskSchema,
  addCommentSchema,
} from '../controllers/task.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validateBody } from '../middleware/validate.middleware';

const router = Router();

// All task routes require authentication
router.use(authenticate);

router.get('/', TaskController.getTasks);
router.post('/', validateBody(createTaskSchema), TaskController.createTask);
router.get('/:id', TaskController.getTaskById);
router.put('/:id', validateBody(updateTaskSchema), TaskController.updateTask);
router.delete('/:id', TaskController.deleteTask);

router.patch('/:id/status', validateBody(updateStatusSchema), TaskController.updateStatus);
router.patch('/:id/assign', validateBody(assignTaskSchema), TaskController.assignTask);
router.post('/:id/comments', validateBody(addCommentSchema), TaskController.addComment);

export default router;
