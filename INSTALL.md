# Twitch to YouTube Publisher - Руководство по установке на VPS

## О проекте

Современное веб-приложение на Next.js для автоматической публикации Twitch видео на YouTube каналы. Приложение включает:
- React интерфейс с современным UI
- API роуты на Next.js
- Интеграцию с YouTube API
- Поддержку Telegram бота
- Систему управления каналами и видео

## Технологии

- **Frontend**: Next.js 14, React 18, TypeScript
- **Backend**: Next.js API Routes, Node.js
- **Database**: MongoDB с Mongoose
- **Authentication**: NextAuth.js
- **Styling**: Tailwind CSS
- **State Management**: TanStack Query
- **UI Components**: Radix UI

## Требования к серверу

### Минимальные требования:
- 2 CPU ядра
- 2GB RAM
- 25GB SSD пространства
- Ubuntu 20.04+ / Debian 11+

### Рекомендуемые требования:
- 4 CPU ядра
- 4GB RAM
- 50GB SSD пространства
- Docker (опционально)

## Быстрая установка

### Автоматическая установка (рекомендуется)

```bash
# Подключение к серверу
ssh root@your_server_ip

# Скачивание и запуск скрипта установки
wget https://raw.githubusercontent.com/doktorpull/dokcode/main/twitch-youtube-publisher/install.sh
chmod +x install.sh
./install.sh
```

### Ручная установка

#### 1. Подготовка системы

```bash
# Обновление системы
apt update && apt upgrade -y

# Установка зависимостей
apt install -y curl wget git nginx

# Установка Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
apt-get install -y nodejs

# Установка MongoDB
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
apt update
apt-get install -y mongodb-org

# Установка PM2
npm install -g pm2
```

#### 2. Клонирование проекта

```bash
# Создание директории
mkdir -p /var/www/twitch-youtube-publisher
cd /var/www/twitch-youtube-publisher

# Клонирование репозитория
git clone https://github.com/doktorpull/dokcode.git .

# Установка зависимостей
npm install --production

# Сборка проекта
npm run build
```

#### 3. Настройка окружения

```bash
# Создание .env файла
cat > .env << EOF
NODE_ENV=production
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=$(openssl rand -base64 32)
MONGODB_URI=mongodb://localhost:27017/twitch-yt
YOUTUBE_API_KEY=your-youtube-api-key
TELEGRAM_BOT_TOKEN=your-telegram-bot-token
JWT_SECRET=$(openssl rand -base64 32)
PORT=3000
EOF
```

#### 4. Настройка PM2

```bash
# Создание конфигурации PM2
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'twitch-youtube-publisher',
    script: 'npm',
    args: 'start',
    cwd: '/var/www/twitch-youtube-publisher',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: '/var/www/twitch-youtube-publisher/logs/err.log',
    out_file: '/var/www/twitch-youtube-publisher/logs/out.log',
    log_file: '/var/www/twitch-youtube-publisher/logs/combined.log',
    time: true
  }]
};
EOF

# Запуск приложения
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

#### 5. Настройка Nginx

```bash
# Создание конфигурации Nginx
cat > /etc/nginx/sites-available/twitch-youtube-publisher << EOF
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # Static files
    location /_next/static/ {
        alias /var/www/twitch-youtube-publisher/.next/static/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # API routes
    location /api/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }

    # All other requests
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF

# Активация сайта
ln -sf /etc/nginx/sites-available/twitch-youtube-publisher /etc/nginx/sites-enabled/
nginx -t
systemctl reload nginx
```

#### 6. Настройка SSL (HTTPS)

```bash
# Установка Certbot
apt install -y certbot python3-certbot-nginx

# Получение сертификата
certbot --nginx -d your-domain.com -d www.your-domain.com

# Автопродление
echo "0 12 * * * /usr/bin/certbot renew --quiet" | crontab -
```

#### 7. Настройка MongoDB

```bash
# Запуск MongoDB
systemctl start mongod
systemctl enable mongod

# Проверка работы
systemctl status mongod
```

#### 8. Настройка Firewall

```bash
# Разрешение трафика
ufw allow ssh
ufw allow 'Nginx Full'
ufw --force enable
```

## Docker установка (опционально)

### Использование Docker Compose

```bash
# Создание docker-compose.yml
cat > docker-compose.yml << EOF
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - MONGODB_URI=mongodb://mongodb:27017/twitch-yt
      - YOUTUBE_API_KEY=${YOUTUBE_API_KEY}
      - TELEGRAM_BOT_TOKEN=${TELEGRAM_BOT_TOKEN}
    depends_on:
      - mongodb

  mongodb:
    image: mongo:6.0
    volumes:
      - mongodb_data:/data/db
    ports:
      - "27017:27017"

volumes:
  mongodb_data:
EOF

# Запуск
docker-compose up -d
```

### Dockerfile

```dockerfile
FROM node:18-alpine

WORKDIR /app

# Копирование package.json и package-lock.json
COPY package*.json ./

# Установка зависимостей
RUN npm ci --only=production

# Копирование исходного кода
COPY . .

# Сборка приложения
RUN npm run build

# Экспорт порта
EXPOSE 3000

# Запуск приложения
CMD ["npm", "start"]
```

## Настройка после установки

### 1. Настройка YouTube API

1. Перейдите в [Google Cloud Console](https://console.cloud.google.com/)
2. Создайте новый проект
3. Включите YouTube Data API v3
4. Создайте OAuth 2.0 credentials
5. Добавьте домен приложения в authorized redirect URIs

### 2. Настройка Telegram бота

1. Найдите @BotFather в Telegram
2. Используйте команду `/newbot`
3. Следуйте инструкциям для создания бота
4. Сохраните токен в `.env` файле

### 3. Проверка работы

```bash
# Проверка статуса PM2
pm2 status

# Проверка логов
pm2 logs twitch-youtube-publisher

# Проверка Nginx
systemctl status nginx

# Проверка MongoDB
systemctl status mongod
```

### 4. Доступ к приложению

Откройте в браузере: `https://your-domain.com`

## Мониторинг и обслуживание

### 1. Проверка ресурсов

```bash
# Проверка нагрузки
htop

# Проверка диска
df -h

# Проверка памяти
free -h
```

### 2. Логирование

```bash
# Логи приложения
pm2 logs twitch-youtube-publisher

# Логи Nginx
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log

# Логи MongoDB
tail -f /var/log/mongodb/mongod.log
```

### 3. Обновление приложения

```bash
# Остановка приложения
pm2 stop twitch-youtube-publisher

# Обновление кода
cd /var/www/twitch-youtube-publisher
git pull origin main

# Установка зависимостей
npm install --production

# Сборка
npm run build

# Запуск
pm2 start twitch-youtube-publisher
```

### 4. Резервное копирование

```bash
# Создание скрипта резервного копирования
cat > /usr/local/bin/backup.sh << EOF
#!/bin/bash
DATE=\$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/var/backups/twitch-youtube-publisher"
APP_DIR="/var/www/twitch-youtube-publisher"

mkdir -p \$BACKUP_DIR

# База данных
mongodump --db twitch-yt --out \$BACKUP_DIR/mongo_\$DATE

# Приложение
tar -czf \$BACKUP_DIR/app_\$DATE.tar.gz -C \$APP_DIR .

# Удаление старых бэкапов (7 дней)
find \$BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete
find \$BACKUP_DIR -name "mongo_*" -mtime +7 -exec rm -rf {} \\;

echo "Backup completed: \$DATE"
EOF

chmod +x /usr/local/bin/backup.sh

# Настройка cron
echo "0 2 * * * /usr/local/bin/backup.sh" | crontab -
```

## Оптимизация производительности

### 1. Оптимизация Next.js

```bash
# В next.config.js
module.exports = {
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['lodash', 'axios']
  },
  images: {
    domains: ['img.youtube.com'],
    formats: ['image/webp']
  }
}
```

### 2. Оптимизация MongoDB

```bash
# /etc/mongod.conf
storage:
  engine: "wiredTiger"
  wiredTiger:
    engineConfig:
      cacheSizeGB: 1
```

### 3. Оптимизация Nginx

```bash
# /etc/nginx/nginx.conf
worker_processes auto;
worker_rlimit_nofile 100000;

events {
    worker_connections 4000;
    multi_accept on;
}

http {
    # Включение кеширования
    proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=api_cache:10m inactive=60m;
    
    server {
        location /api/ {
            proxy_cache api_cache;
            proxy_cache_valid 200 60m;
            proxy_cache_key "$scheme$request_method$host$request_uri";
        }
    }
}
```

## Безопасность

### 1. Настройка Fail2ban

```bash
# Установка
apt install -y fail2ban

# Конфигурация
cat > /etc/fail2ban/jail.local << EOF
[sshd]
enabled = true
port = ssh
filter = sshd
logpath = /var/log/auth.log
maxretry = 3
bantime = 1h

[nginx-http-auth]
enabled = true
filter = nginx-http-auth
port = http,https
logpath = /var/log/nginx/error.log

[nginx-limit-req]
enabled = true
filter = nginx-limit-req
port = http,https
logpath = /var/log/nginx/error.log
EOF

# Перезапуск
systemctl restart fail2ban
```

### 2. Регулярные обновления

```bash
# Автоматическое обновление безопасности
apt install -y unattended-upgrades
dpkg-reconfigure unattended-upgrades
```

## Решение проблем

### 1. Порт 3000 занят

```bash
# Проверка
lsof -i :3000
# Остановка
kill -9 <PID>
```

### 2. Next.js не стартует

```bash
# Проверка логов
pm2 logs twitch-youtube-publisher

# Проверка памяти
node --max-old-space-size=4096 dist/index.js
```

### 3. MongoDB не подключается

```bash
# Проверка статуса
systemctl status mongod

# Проверка подключения
mongosh --eval "db.adminCommand('ping')"
```

### 4. Nginx ошибки

```bash
# Проверка конфигурации
nginx -t

# Перезапуск
systemctl reload nginx
```

## Контрольный список после установки

- [ ] Сервер обновлен
- [ ] Node.js установлен
- [ ] MongoDB работает
- [ ] Nginx настроен
- [ ] PM2 запущен
- [ ] SSL сертификат установлен
- [ ] Firewall настроен
- [ ] .env файл заполнен
- [ ] Резервное копирование работает
- [ ] Мониторинг настроен

После выполнения всех шагов ваше приложение будет готово к работе!