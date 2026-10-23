# GitHub Actions Secrets

Для автоматической публикации и работы CI/CD вам нужно добавить следующие секреты в репозиторий:

1. Перейдите в настройки репозитория: https://github.com/doktorpull/dokcode/settings/secrets/actions
2. Добавьте следующие секреты:

## Обязательные секреты:
- `YOUTUBE_API_KEY` - Ваш YouTube API ключ
- `TELEGRAM_BOT_TOKEN` - Токен Telegram бота
- `MONGODB_URI` - Строка подключения к MongoDB
- `JWT_SECRET` - Секретный ключ для JWT

## Опциональные секреты:
- `TWITCH_CLIENT_ID` - ID Twitch приложения (если понадобится)
- `TWITCH_CLIENT_SECRET` - Секрет Twitch приложения (если понадобится)

## Как добавить секрет:
1. Нажмите "New repository secret"
2. Введите имя секрета
3. Введите значение секрета
4. Нажмите "Add secret"

Эти секреты будут автоматически использоваться в GitHub Actions для сборки и тестирования проекта.