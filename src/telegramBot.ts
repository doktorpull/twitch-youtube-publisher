import TelegramBot from 'node-telegram-bot-api';
import { Channel } from './models/Channel';
import { Video } from './models/Video';
import { TwitchService } from './services/twitchService';
import { YouTubeService } from './services/youtubeService';
import { VideoProcessingService } from './services/videoProcessingService';

const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: true });

const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: true });

// Commands
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, 
    '🎥 Twitch to YouTube Publisher\n\n' +
    'Я помогу вам публиковать Twitch видео на YouTube!\n\n' +
    'Доступные команды:\n' +
    '/channels - показать ваши каналы\n' +
    '/addchannel - добавить YouTube канал\n' +
    '/upload - загрузить Twitch видео\n' +
    '/help - помощь'
  );
});

bot.onText(/\/help/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId,
    '📖 Помощь:\n\n' +
    '1. Добавьте YouTube канал командой /addchannel\n' +
    '2. Загрузите Twitch видео командой /upload\n' +
    '3. Следите за статусом обработки видео\n\n' +
    'Формат ссылки на Twitch: https://www.twitch.tv/videos/VIDEO_ID'
  );
});

bot.onText(/\/channels/, async (msg) => {
  const chatId = msg.chat.id;
  
  try {
    const channels = await Channel.find({ userId: String(chatId) });
    
    if (channels.length === 0) {
      bot.sendMessage(chatId, 'У вас нет добавленных каналов. Используйте /addchannel чтобы добавить канал.');
      return;
    }
    
    const channelList = channels.map(channel => 
      `• ${channel.youtubeChannelName} (${channel.youtubeChannelId})`
    ).join('\n');
    
    bot.sendMessage(chatId, `Ваши YouTube каналы:\n\n${channelList}`);
  } catch (error) {
    bot.sendMessage(chatId, 'Ошибка при загрузке каналов.');
  }
});

bot.onText(/\/addchannel/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, 
    'Пожалуйста, отправьте информацию о канале в формате:\n\n' +
    'Название канала\n' +
    'ID канала\n' +
    'Access Token\n\n' +
    'Пример:\n' +
    'Мой канал\n' +
    'UC123456789\n' +
    'ya29.AHES6ZTJ...'
  );
});

bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;
  
  if (!text || text.startsWith('/')) return;
  
  // Check if user is adding a channel
  if (msg.text.includes('\n')) {
    const lines = text.split('\n');
    if (lines.length >= 3) {
      const channelName = lines[0].trim();
      const channelId = lines[1].trim();
      const accessToken = lines[2].trim();
      
      try {
        const channel = new Channel({
          userId: String(chatId),
          youtubeChannelId: channelId,
          youtubeChannelName: channelName,
          accessToken: accessToken
        });
        
        await channel.save();
        bot.sendMessage(chatId, `Канал "${channelName}" успешно добавлен!`);
      } catch (error) {
        bot.sendMessage(chatId, 'Ошибка при добавлении канала.');
      }
      return;
    }
  }
  
  // Check if user wants to upload video
  if (text.includes('twitch.tv/videos/')) {
    const twitchUrl = text;
    const videoId = TwitchService.extractVideoId(twitchUrl);
    
    if (!videoId) {
      bot.sendMessage(chatId, 'Неверная ссылка на Twitch видео.');
      return;
    }
    
    try {
      const twitchVideo = await TwitchService.getVideoInfo(videoId);
      
      bot.sendMessage(chatId, 
        '🎥 Найдено Twitch видео:\n\n' +
        `Название: ${twitchVideo.title}\n` +
        `Описание: ${twitchVideo.description}\n\n` +
        'Пожалуйста, выберите YouTube канал для публикации:'
      );
      
      const channels = await Channel.find({ userId: String(chatId), isActive: true });
      
      if (channels.length === 0) {
        bot.sendMessage(chatId, 'У вас нет активных каналов. Сначала добавьте канал.');
        return;
      }
      
      // Send channel selection buttons
      const keyboard = channels.map(channel => 
        [{ text: channel.youtubeChannelName, callback_data: `channel_${channel._id}` }]
      );
      
      bot.sendMessage(chatId, 'Выберите канал:', {
        reply_markup: {
          inline_keyboard: keyboard
        }
      });
      
      // Save video data for later processing
      global.pendingVideos = global.pendingVideos || {};
      global.pendingVideos[chatId] = {
        twitchUrl,
        title: twitchVideo.title,
        description: twitchVideo.description
      };
      
    } catch (error) {
      bot.sendMessage(chatId, 'Ошибка при получении информации о видео.');
    }
  }
});

// Handle channel selection
bot.on('callback_query', async (callbackQuery) => {
  const chatId = callbackQuery.message.chat.id;
  const callbackData = callbackQuery.data;
  
  if (callbackData.startsWith('channel_')) {
    const channelId = callbackData.split('_')[1];
    
    if (!global.pendingVideos || !global.pendingVideos[chatId]) {
      bot.answerCallbackQuery(callbackQuery.id, { text: 'Нет видео для загрузки.' });
      return;
    }
    
    const videoData = global.pendingVideos[chatId];
    
    try {
      const video = new Video({
        userId: String(chatId),
        twitchUrl: videoData.twitchUrl,
        title: videoData.title,
        description: videoData.description,
        channelId: channelId,
        status: 'pending'
      });
      
      await video.save();
      
      bot.answerCallbackQuery(callbackQuery.id, { text: 'Видео добавлено!' });
      bot.sendMessage(chatId, 
        '✅ Видео успешно добавлено!\n\n' +
        `Название: ${videoData.title}\n` +
        'Статус: Ожидает обработки\n\n' +
        'Используйте /videos чтобы посмотреть статус.'
      );
      
      // Clean up pending video
      delete global.pendingVideos[chatId];
      
    } catch (error) {
      bot.answerCallbackQuery(callbackQuery.id, { text: 'Ошибка при добавлении видео.' });
    }
  }
});

bot.onText(/\/upload/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, 
    '📤 Чтобы загрузить Twitch видео, просто отправьте мне ссылку в формате:\n\n' +
    'https://www.twitch.tv/videos/2903109542\n\n' +
    'Я автоматически найду видео и предложу выбрать канал для публикации.'
  );
});

bot.onText(/\/videos/, async (msg) => {
  const chatId = msg.chat.id;
  
  try {
    const videos = await Video.find({ userId: String(chatId) })
      .sort({ createdAt: -1 })
      .limit(10);
    
    if (videos.length === 0) {
      bot.sendMessage(chatId, 'У вас нет загруженных видео.');
      return;
    }
    
    const videoList = videos.map(video => 
      `🎥 ${video.title}\n` +
      `Статус: ${video.status}\n` +
      `Создано: ${new Date(video.createdAt).toLocaleDateString()}\n` +
      `${video.youtubeUrl ? `YouTube: ${video.youtubeUrl}` : ''}\n\n`
    ).join('');
    
    bot.sendMessage(chatId, `Последние видео:\n\n${videoList}`);
  } catch (error) {
    bot.sendMessage(chatId, 'Ошибка при загрузке видео.');
  }
});

export function startTelegramBot() {
  console.log('Telegram bot started');
}