import { Router } from 'express';
import { getNoteByProblem, updateNote, getAllNotes } from '../controllers/noteController';
import { protect } from '../middleware/auth';

const router = Router();

router.use(protect);
router.get('/', getAllNotes);
router.get('/:problemId', getNoteByProblem);
router.put('/:problemId', updateNote);

export default router;
