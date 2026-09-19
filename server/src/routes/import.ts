import { Router } from 'express';
import { importA2ZSheet, getImportStats } from '../controllers/importController';
import { protect } from '../middleware/auth';

const router = Router();

router.use(protect);
router.post('/a2z', importA2ZSheet);
router.get('/stats', getImportStats);

export default router;
