import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/role.middleware';

const router = Router();

// Only admin can access any user routes
router.use(authenticate, requireRole('admin'));

router.get('/', UserController.getAllUsers);
router.get('/:id', UserController.getUserById);

export default router;
