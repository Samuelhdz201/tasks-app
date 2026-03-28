import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware';
import {
  getTasks,
  createTask,
  getTaskById,
  updateTask,
  deleteTask,
} from '../controllers/tasks.controller';

const router = Router();

router.use(authMiddleware);

router.get('/', getTasks);
router.post('/', createTask);
router.get('/:id', getTaskById);
router.put('/:id', updateTask);
router.delete('/:id', deleteTask);

export default router;