# Руководство по установке на VPS сервер

## Подготовка VPS

### 1. Выбор VPS провайдера
- Рекомендуемые: DigitalOcean, Vultr, Linode, AWS Lightsail
- Минимальные требования: 1 CPU, 1GB RAM, 25GB SSD

### 2. Подключение к VPS
```bash
ssh root@your_server_ip
```

### 3. Обновление системы
```bash
apt update && apt upgrade -y
```

## Установка Node.js

### Способ 1: Через NodeSource (рекомендуется)
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### Проверка установки
```bash
node --version  # Должен быть v18.x или выше
npm --version
```

## Установка MongoDB

### 1. Добавление репозитория MongoDB
```bash
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
```

### 2. Установка MongoDB
```bash
sudo apt update
sudo apt install -y mongodb-org
```

### 3. Запуск и автозапуск MongoDB
```bash
sudo systemctl start mongod
sudo systemctl enable mongod
sudo systemctl status mongod
```

## Клонирование проекта

### 1. Установка Git
```bash
sudo apt install -y git
```

### 2. Клонирование репозитория
```bash
cd /var/www
git clone https://github.com/your-username/twitch-yt.git
cd twitch-yt
```

### 3. Установка зависимостей
```bash
npm install --production
```

## Настройка приложения

### 1. Создание .env файла
```bash
cp .env.example .env
nano .env
```

### 2. Настройка переменных окружения
```env
NODE_ENV=production
PORT=3000
MONGODB_URI=mongodb://localhost:27017/twitch-yt
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
YOUTUBE_API_KEY=your-youtube-api-key-here
TELEGRAM_BOT_TOKEN=your-telegram-bot-token-here
```

### 3. Сборка приложения
```bash
npm run build
```

## Настройка PM2 (Process Manager)

### 1. Установка PM2
```bash
sudo npm install -g pm2
```

### 2. Создание конфигурационного файла ecosystem.config.js
```bash
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'twitch-yt',
    script: 'dist/index.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: '/var/www/twitch-yt/logs/err.log',
    out_file: '/var/www/twitch-yt/logs/out.log',
    log_file: '/var/www/twitch-yt/logs/combined.log',
    time: true
  }]
};
EOF
```

### 3. Создание директории для логов
```bash
mkdir -p /var/www/twitch-yt/logs
```

### 4. Запуск приложения
```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

## Настройка Nginx (веб-сервер)

### 1. Установка Nginx
```bash
sudo apt install -y nginx
```

### 2. Создание конфигурационного файла
```bash
sudo nano /etc/nginx/sites-available/twitch-yt
```

### 3. Конфигурация Nginx
```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    root /var/www/twitch-yt/public;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Static files caching
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

### 4. Активация сайта
```bash
sudo ln -s /etc/nginx/sites-available/twitch-yt /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## Настройка SSL (HTTPS)

### 1. Установка Certbot
```bash
sudo apt install -y certbot python3-certbot-nginx
```

### 2. Получение SSL сертификата
```bash
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```

### 3. Автопродление сертификата
```bash
sudo crontab -e
```
Добавить строку:
```bash
0 12 * * * /usr/bin/certbot renew --quiet
```

## Настройка Firewall

### 1. Разрешение трафика
```bash
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw enable
```

## Мониторинг и логирование

### 1. Проверка статуса PM2
```bash
pm2 status
pm2 logs twitch-yt
```

### 2. Настройка логов Nginx
```bash
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### 3. Настройка ротации логов
```bash
sudo nano /etc/logrotate.d/twitch-yt
```
```bash
/var/www/twitch-yt/logs/*.log {
    daily
    missingok
    rotate 7
    compress
    delaycompress
    notifempty
    create 644 nodejs nodejs
}
```

## Резервное копирование

### 1. Скрипт резервного копирования
```bash
sudo nano /usr/local/bin/backup-twitch-yt.sh
```

```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/var/backups/twitch-yt"
APP_DIR="/var/www/twitch-yt"

mkdir -p $BACKUP_DIR

# База данных
mongodump --db twitch-yt --out $BACKUP_DIR/mongo_$DATE

# Приложение
tar -czf $BACKUP_DIR/app_$DATE.tar.gz -C $APP_DIR .

# Удаление старых бэкапов (7 дней)
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete
find $BACKUP_DIR -name "mongo_*" -mtime +7 -exec rm -rf {} \;

echo "Backup completed: $DATE"
```

### 2. Права на выполнение
```bash
sudo chmod +x /usr/local/bin/backup-twitch-yt.sh
```

### 3. Настройка cron
```bash
sudo crontab -e
```
Добавить строку:
```bash
0 2 * * * /usr/local/bin/backup-twitch-yt.sh
```

## Обновление приложения

### 1. Остановка приложения
```bash
pm2 stop twitch-yt
```

### 2. Обновление кода
```bash
cd /var/www/twitch-yt
git pull origin main
npm install --production
npm run build
```

### 3. Запуск приложения
```bash
pm2 start twitch-yt
```

## Настройка системы мониторинга

### 1. Установка monitoring инструментов
```bash
sudo apt install -y htop iotop nethogs
```

### 2. Проверка ресурсов
```bash
htop
df -h
free -h
```

### 3. Проверка логов приложения
```bash
pm2 logs twitch-yt --lines 100
```

## Тестирование после установки

1. Проверьте доступность сайта: `curl -I http://your-domain.com`
2. Проверьте API: `curl http://your-domain.com/health`
3. Проверьте работу Telegram бота
4. Проверьте работу с базой данных

## Частые проблемы и решения

### 1. Порт уже занят
```bash
sudo lsof -i :3000
sudo kill -9 <PID>
```

### 2. MongoDB не запускается
```bash
sudo systemctl status mongod
sudo journalctl -u mongod
```

### 3. PM2 не запускается
```bash
pm2 delete twitch-yt
pm2 start ecosystem.config.js
```

### 4. Nginx ошибки
```bash
sudo nginx -t
sudo systemctl restart nginx
```

Ваше приложение готово к работе! Для доступа используйте ваш домен или IP адрес сервера.