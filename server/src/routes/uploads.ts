import { Router } from 'express';
import { uploadImage, deleteImage, getImages } from '../controllers/uploadController';
import { protect } from '../middleware/auth';
import { upload } from '../middleware/upload';

const router = Router();

router.use(protect);
router.post('/image', upload.single('image'), uploadImage);
router.delete('/image/:id', deleteImage);
router.get('/images', getImages);

export default router;
