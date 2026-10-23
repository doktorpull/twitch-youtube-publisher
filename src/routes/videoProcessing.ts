import { Router } from 'express';
import { uploadVideo, getVideoStatus } from '../controllers/videoController';
import { VideoProcessingService } from '../services/videoProcessingService';
import { authenticate } from '../middleware/auth';

const router = Router();

router.post('/upload', authenticate, uploadVideo);

router.get('/:videoId/process', authenticate, async (req, res) => {
  try {
    const { videoId } = req.params;
    await VideoProcessingService.processVideo(videoId);
    res.json({ message: 'Video processing started' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/:videoId/status', authenticate, getVideoStatus);

export default router;