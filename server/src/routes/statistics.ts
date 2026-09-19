import { Router } from 'express';
import { getStatistics } from '../controllers/statisticsController';
import { protect } from '../middleware/auth';

const router = Router();

router.use(protect);
router.get('/', getStatistics);

export default router;
