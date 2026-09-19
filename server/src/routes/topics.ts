import { Router } from 'express';
import { getTopics, getTopicById, getTopicProblems } from '../controllers/topicController';
import { protect } from '../middleware/auth';

const router = Router();

router.use(protect);
router.get('/', getTopics);
router.get('/:id', getTopicById);
router.get('/:id/problems', getTopicProblems);

export default router;
