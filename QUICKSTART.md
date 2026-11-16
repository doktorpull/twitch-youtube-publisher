# Twitch to YouTube Publisher - Быстрый старт

## 🚀 Автоматическая установка за 1 минуту

### 1. Подключитесь к вашему VPS
```bash
ssh root@your_server_ip
```

### 2. Запустите автоматическую установку
```bash
# Скачайте и запустите скрипт
wget https://raw.githubusercontent.com/doktorpull/twitch-youtube-publisher/main/install.sh
chmod +x install.sh
./install.sh your-domain.com
```

### 3. Готово! 🎉
После установки ваше приложение будет доступно по адресу: `https://your-domain.com`

## 📋 Что делает скрипт установки:

✅ **Автоматическая настройка всего стека:**
- Node.js 18 + PM2
- MongoDB 6.0
- Nginx с SSL
- Firewall
- Резервное копирование

✅ **Оптимизация производительности:**
- Gzip сжатие
- Кеширование статических файлов
- Кластер PM2
- Оптимизация MongoDB

✅ **Безопасность:**
- SSL сертификат Let's Encrypt
- Fail2ban защита
- Security headers
- Firewall настройка

## 🔧 Альтернативные способы установки

### Docker (самый простой)
```bash
# Локально
git clone https://github.com/doktorpull/twitch-youtube-publisher.git
cd twitch-youtube-publisher
cp .env.example .env
# Заполните .env файл
docker-compose up -d
```

### Ручная установка
Смотрите полное руководство в `INSTALL.md`

## ⚡ После установки

1. **Настройте API ключи:**
   ```bash
   nano /var/www/twitch-youtube-publisher/.env
   # Заполните YOUTUBE_API_KEY и TELEGRAM_BOT_TOKEN
   ```

2. **Перезапустите приложение:**
   ```bash
   pm2 restart twitch-youtube-publisher
   ```

3. **Проверьте работу:**
   ```bash
   pm2 status
   pm2 logs twitch-youtube-publisher
   ```

## 🎯 Требования к серверу

- **ОС**: Ubuntu 20.04+ / Debian 11+
- **RAM**: 2GB+ (рекомендуется 4GB)
- **CPU**: 2 ядра+
- **Диск**: 25GB+

## 🆘 Помощь

Если возникли проблемы:
1. Проверьте логи: `pm2 logs twitch-youtube-publisher`
2. Проверьте статус: `pm2 status`
3. Смотрите полное руководство: `INSTALL.md`

---

**Made with ❤️ by doktorpull**