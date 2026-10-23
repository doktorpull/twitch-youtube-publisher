import { Router } from 'express';

const router = Router();

router.post('/webhook', (req, res) => {
  res.json({ message: 'Telegram webhook received' });
});

export default router;