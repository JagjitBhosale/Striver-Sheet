import { Router } from 'express';
import { getProgress, getProgressByProblem, updateProgress, getBookmarks, getRevisionQueue } from '../controllers/progressController';
import { protect } from '../middleware/auth';

const router = Router();

router.use(protect);
router.get('/', getProgress);
router.get('/bookmarks', getBookmarks);
router.get('/revision', getRevisionQueue);
router.get('/:problemId', getProgressByProblem);
router.put('/:problemId', updateProgress);

export default router;
