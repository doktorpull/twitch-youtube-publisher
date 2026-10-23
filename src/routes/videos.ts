import { Router } from 'express';
import { uploadVideo, getVideos, getVideoStatus, cancelVideo } from '../controllers/videoController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.post('/upload', authenticate, uploadVideo);
router.get('/', authenticate, getVideos);
router.get('/:videoId/status', authenticate, getVideoStatus);
router.put('/:videoId/cancel', authenticate, cancelVideo);

export default router;