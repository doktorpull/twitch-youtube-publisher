# Twitch to YouTube Publisher - Руководство по установке и использованию

## Требования

- Node.js 16+ 
- MongoDB
- npm или yarn

## Установка

1. Клонируйте репозиторий:
```bash
git clone <repository-url>
cd twitch_yt
```

2. Установите зависимости:
```bash
npm install
```

3. Настройте переменные окружения:
```bash
cp .env.example .env
```

4. Отредактируйте `.env` файл:
```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/twitch-yt
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
YOUTUBE_API_KEY=your-youtube-api-key
TELEGRAM_BOT_TOKEN=your-telegram-bot-token
NODE_ENV=development
```

5. Запустите MongoDB:
```bash
mongod
```

6. Запустите приложение:
```bash
npm run dev
```

## Настройка YouTube API

1. Перейдите в [Google Cloud Console](https://console.cloud.google.com/)
2. Создайте новый проект
3. Включите YouTube Data API v3
4. Создайте OAuth 2.0 credentials
5. Добавьте домен приложения в authorized redirect URIs

## Настройка Telegram бота

1. Найдите @BotFather в Telegram
2. Используйте команду `/newbot` 
3. Следуйте инструкциям для создания бота
4. Сохраните полученный токен в `.env` файле

## Использование

### Веб-интерфейс

1. Откройте `http://localhost:3000`
2. Зарегистрируйтесь или войдите
3. Добавьте YouTube канал (нужен access token)
4. Загрузите Twitch видео, вставив ссылку
5. Нажмите "Обработать" для публикации на YouTube

### Telegram бот

1. Найдите вашего бота в Telegram
2. Используйте команду `/start` для получения списка команд
3. Добавьте YouTube канал командой `/addchannel`
4. Отправьте ссылку на Twitch видео боту
5. Выберите канал для публикации
6. Следите за статусом обработки

## API эндпоинты

### Аутентификация
- `POST /api/auth/register` - Регистрация
- `POST /api/auth/login` - Вход

### Каналы
- `GET /api/channels` - Получить каналы пользователя
- `POST /api/channels` - Добавить канал
- `PUT /api/channels/:id` - Обновить канал
- `DELETE /api/channels/:id` - Удалить канал

### Видео
- `POST /api/videos/upload` - Загрузить видео
- `GET /api/videos` - Получить видео пользователя
- `GET /api/videos/:id/status` - Статус видео
- `POST /api/video-processing/:id/process` - Обработать видео

## Статус обработки видео

- `pending` - Ожидает обработки
- `processing` - В процессе обработки
- `uploaded` - Успешно загружено на YouTube
- `failed` - Ошибка обработки

## Тестирование

```bash
npm test
```

## Линтинг и типизация

```bash
npm run lint
npm run type-check
```

## Деплой

1. Соберите приложение:
```bash
npm run build
```

2. Запустите в продакшене:
```bash
npm start
```

## Лицензия

MIT