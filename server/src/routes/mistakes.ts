import { Router } from 'express';
import { getMistakes, getMistakeByProblem, upsertMistake, deleteMistake } from '../controllers/mistakeController';
import { protect } from '../middleware/auth';

const router = Router();

router.use(protect);
router.get('/', getMistakes);
router.get('/:problemId', getMistakeByProblem);
router.put('/:problemId', upsertMistake);
router.delete('/:id', deleteMistake);

export default router;
