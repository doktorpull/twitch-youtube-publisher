# Twitch to YouTube Publisher - Современное веб-приложение

## Описание

Twitch to YouTube Publisher - это современное веб-приложение на Next.js для автоматической публикации Twitch видео на YouTube каналы. Приложение включает React интерфейс, API роуты на Next.js, интеграцию с YouTube API и поддержку Telegram бота.

## 🚀 Быстрый старт

### Автоматическая установка на VPS

```bash
# Скачивание и запуск скрипта установки
wget https://raw.githubusercontent.com/doktorpull/twitch-youtube-publisher/main/install.sh
chmod +x install.sh
./install.sh your-domain.com
```

### Ручная установка

1. **Клонируйте репозиторий**
```bash
git clone https://github.com/doktorpull/twitch-youtube-publisher.git
cd twitch-youtube-publisher
```

2. **Установите зависимости**
```bash
npm install
```

3. **Настройте окружение**
```bash
cp .env.example .env
# Заполните .env файл своими данными
```

4. **Запустите разработку**
```bash
npm run dev
```

## 🏗️ Структура проекта

```
├── app/                    # Next.js App Router
│   ├── api/               # API роуты
│   │   ├── auth/          # Аутентификация
│   │   ├── channels/      # Управление каналами
│   │   ├── videos/        # Управление видео
│   │   └── telegram/      # Telegram интеграция
│   ├── components/        # React компоненты
│   │   ├── ui/           # Базовые UI компоненты
│   │   ├── dashboard/    # Компоненты дашборда
│   │   └── auth/         # Компоненты аутентификации
│   ├── lib/              # Утилиты и конфигурация
│   └── layout.tsx        # Корневой layout
├── public/               # Статические файлы
├── .env.example         # Пример файла окружения
├── package.json         # Зависимости
├── tailwind.config.ts   # Конфигурация Tailwind CSS
└── tsconfig.json        # TypeScript конфигурация
```

## 📋 Функциональность

### Веб-интерфейс
- 🎨 Современный UI на React + Tailwind CSS
- 🔐 Аутентификация пользователей
- 📊 Дашборд со статистикой
- 📺 Управление Twitch видео
- 📺 Управление YouTube каналами
- 📈 Отслеживание статуса обработки

### API функциональность
- 🔄 Автоматическая обработка видео
- 📤 Публикация на YouTube
- 🤖 Интеграция с Telegram
- 💾 Работа с MongoDB
- 🔐 JWT аутентификация

### Telegram бот
- 📥 Прием ссылок на Twitch видео
- 🎯 Выбор каналов для публикации
- 📊 Статус обработки видео
- ⚡ Уведомления о статусе

## 🔧 Технологии

### Frontend
- **Next.js 14** - React фреймворк
- **React 18** - UI библиотека
- **TypeScript** - Типизация
- **Tailwind CSS** - Стилизация
- **Radix UI** - Accessible компоненты
- **TanStack Query** - State management

### Backend
- **Next.js API Routes** - API endpoints
- **Node.js** - Runtime среда
- **MongoDB** - База данных
- **Mongoose** - ODM для MongoDB
- **JWT** - Аутентификация

### Интеграции
- **YouTube API** - Публикация видео
- **Telegram Bot API** - Telegram бот
- **FFmpeg** - Обработка видео

## 🚀 Деплой

### VPS установка

1. **Используйте автоматический скрипт**
```bash
./install.sh your-domain.com
```

2. **Или настройте вручную** (см. `INSTALL.md`)

### Docker

```bash
# Клонируйте репозиторий
git clone https://github.com/doktorpull/twitch-youtube-publisher.git
cd twitch-youtube-publisher

# Настройте .env файл
cp .env.example .env

# Запустите Docker Compose
docker-compose up -d
```

### GitHub Actions (CI/CD)

Настроена автоматическая деплой на VPS через GitHub Actions.

## 🔐 Настройка

### 1. YouTube API

1. Перейдите в [Google Cloud Console](https://console.cloud.google.com/)
2. Создайте новый проект
3. Включите YouTube Data API v3
4. Создайте OAuth 2.0 credentials
5. Добавьте домен в authorized redirect URIs

### 2. Telegram бот

1. Найдите @BotFather в Telegram
2. Используйте `/newbot` для создания бота
3. Сохраните токен в `.env` файле

### 3. MongoDB

```bash
# Для локальной установки
mongod

# Или использ Docker
docker run -d -p 27017:27017 --name mongodb mongo:6.0
```

## 📊 Мониторинг

### Логи приложения
```bash
# PM2 (для VPS)
pm2 logs twitch-youtube-publisher

# Docker
docker-compose logs -f app

# Локально
npm run dev
```

### Статус сервисов
```bash
# PM2
pm2 status

# Docker
docker-compose ps

# MongoDB
mongosh --eval "db.adminCommand('ping')"
```

## 🔧 Разработка

### Запуск разработки
```bash
npm run dev
```

### Сборка для продакшена
```bash
npm run build
npm start
```

### Линтинг и типизация
```bash
npm run lint
npm run type-check
```

## 📚 Документация

- [Полное руководство по установке](INSTALL.md)
- [API документация](docs/api.md)
- [Telegram бот документация](docs/telegram-bot.md)
- [Разработка](docs/development.md)

## 🤝 Contributing

1. Fork репозитория
2. Создайте новую ветку (`git checkout -b feature/amazing-feature`)
3. Сделайте коммит (`git commit -m 'Add amazing feature'`)
4. Запушите ветку (`git push origin feature/amazing-feature`)
5. Создайте Pull Request

## 📄 Лицензия

MIT License - см. [LICENSE](LICENSE) файл

## 🆘 Поддержка

Если у вас возникли вопросы:
- Создайте [issue](https://github.com/doktorpull/twitch-youtube-publisher/issues)
- Проверите [FAQ](docs/faq.md)
- Свяжитесь с разработчиком

## 🎯 Roadmap

- [ ] Видеоконвертер для Twitch видео
- [ ] Расширенная аналитика
- [ ] Пакетная обработка видео
- [ ] Интеграция с другими платформами
- [ ] Мобильное приложение

---

**Made with ❤️ by doktorpull**