import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { errorHandler } from './middleware/errorHandler';
import { authRoutes } from './routes/auth';
import { channelRoutes } from './routes/channels';
import { videoRoutes } from './routes/videos';
import { videoProcessingRoutes } from './routes/videoProcessing';
import { telegramRoutes } from './routes/telegram';
import { startTelegramBot } from './telegramBot';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/channels', channelRoutes);
app.use('/api/videos', videoRoutes);
app.use('/api/video-processing', videoProcessingRoutes);
app.use('/api/telegram', telegramRoutes);

// Serve static files
app.use(express.static('public'));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Serve frontend pages
app.get('/', (req, res) => {
  res.sendFile('index.html', { root: 'public' });
});

app.get('/login', (req, res) => {
  res.sendFile('login.html', { root: 'public' });
});

app.get('/register', (req, res) => {
  res.sendFile('register.html', { root: 'public' });
});

// Error handling
app.use(errorHandler);

// Database connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/twitch-yt')
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
    
    // Start Telegram bot
    startTelegramBot();
  })
  .catch((error) => {
    console.error('Database connection error:', error);
    process.exit(1);
  });