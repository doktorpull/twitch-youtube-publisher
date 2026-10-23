# Twitch to YouTube Publisher

Веб-приложение для автоматической публикации Twitch видео на YouTube канал.

## Функциональность

- Веб-интерфейс для вставки ссылок на Twitch видео
- Автоматическая загрузка и обработка Twitch видео
- Публикация на YouTube канал с указанным названием
- Поддержка Telegram бота
- Система управления настройками каналов

## Технологии

- **Backend**: Node.js, Express, TypeScript
- **Database**: MongoDB с Mongoose
- **Authentication**: JWT
- **Video Processing**: FFmpeg
- **APIs**: Twitch API, YouTube API
- **Frontend**: React (для веб-интерфейса)
- **Bot**: Node Telegram Bot API

## Структура проекта

```
src/
├── config/          # Конфигурация приложения
├── controllers/     # Контроллеры API
├── models/         # Модели данных
├── routes/         # Маршруты API
├── services/       # Сервисы для работы с API
├── middleware/     # Middleware для аутентификации и валидации
├── utils/          # Утилиты и вспомогательные функции
├── types/          # TypeScript типы
└── index.ts        # Главный файл приложения
```

## API Эндпоинты

- `POST /api/auth/login` - Логин пользователя
- `POST /api/auth/register` - Регистрация пользователя
- `GET /api/channels` - Получение списка каналов пользователя
- `POST /api/channels` - Добавление YouTube канала
- `POST /api/videos/upload` - Загрузка Twitch видео
- `GET /api/videos/status` - Статус обработки видео
- `POST /api/telegram/webhook` - Webhook для Telegram бота

## Настройка

1. Установите зависимости: `npm install`
2. Настройте переменные окружения в `.env`
3. Запустите разработку: `npm run dev`

## Переменные окружения

```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/twitch-yt
JWT_SECRET=your-secret-key
YOUTUBE_API_KEY=your-youtube-api-key
TELEGRAM_BOT_TOKEN=your-telegram-bot-token

```