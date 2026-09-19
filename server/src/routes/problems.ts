import { Router } from 'express';
import { getProblems, getProblemById } from '../controllers/problemController';
import { protect } from '../middleware/auth';

const router = Router();

router.use(protect);
router.get('/', getProblems);
router.get('/:id', getProblemById);

export default router;
