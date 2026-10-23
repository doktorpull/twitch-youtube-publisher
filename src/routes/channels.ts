import { Router } from 'express';
import { getChannels, addChannel, updateChannel, deleteChannel } from '../controllers/channelController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/', authenticate, getChannels);
router.post('/', authenticate, addChannel);
router.put('/:channelId', authenticate, updateChannel);
router.delete('/:channelId', authenticate, deleteChannel);

export default router;