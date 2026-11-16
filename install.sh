#!/bin/bash

# Автоматический скрипт установки Twitch to YouTube Publisher на VPS
# Версия 2.0 - Обновленная для Next.js

set -e

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Конфигурация
PROJECT_NAME="twitch-youtube-publisher"
PROJECT_DIR="/var/www/${PROJECT_NAME}"
SERVICE_NAME="twitch-youtube-publisher"
DOMAIN=${1:-""} # Передайте домен как первый аргумент

echo -e "${GREEN}🚀 Начинаю установку Twitch to YouTube Publisher v2.0 на VPS${NC}"
echo "=============================================================="

# Проверка root прав
if [[ $EUID -ne 0 ]]; then
   echo -e "${RED}❌ Этот скрипт должен быть запущен от root пользователя${NC}"
   exit 1
fi

# Функции
log_info() {
    echo -e "${YELLOW}📋 $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

log_step() {
    echo -e "${BLUE}🔧 $1${NC}"
}

# Шаг 1: Обновление системы
log_info "Шаг 1: Обновление системы"
apt update && apt upgrade -y
log_success "Система обновлена"

# Шаг 2: Установка зависимостей
log_info "Шаг 2: Установка зависимостей"

# Установка Node.js
log_step "Установка Node.js 18"
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
apt-get install -y nodejs

# Установка Nginx
log_step "Установка Nginx"
apt-get install -y nginx

# Установка MongoDB
log_step "Установка MongoDB"
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
apt update
apt-get install -y mongodb-org

# Установка Certbot
log_step "Установка Certbot"
apt-get install -y certbot python3-certbot-nginx

# Установка Git и PM2
log_step "Установка Git и PM2"
apt-get install -y git curl
npm install -g pm2

log_success "Зависимости установлены"

# Шаг 3: Настройка MongoDB
log_info "Шаг 3: Настройка MongoDB"
systemctl start mongod
systemctl enable mongod
log_success "MongoDB настроен"

# Шаг 4: Клонирование проекта
log_info "Шаг 4: Клонирование проекта"
mkdir -p $PROJECT_DIR
cd $PROJECT_DIR
git clone https://github.com/doktorpull/twitch-youtube-publisher.git . || echo "Репозиторий уже существует"
git checkout main

# Установка зависимостей
log_step "Установка npm зависимостей"
npm install

# Сборка проекта
log_step "Сборка проекта"
npm run build

log_success "Проект скопирован и собран"

# Шаг 5: Настройка окружения
log_info "Шаг 5: Настройка окружения"

# Создание .env файла
cat > $PROJECT_DIR/.env << EOF
NODE_ENV=production
NEXTAUTH_URL=https://$DOMAIN
NEXTAUTH_SECRET=$(openssl rand -base64 32)
MONGODB_URI=mongodb://localhost:27017/twitch-yt
YOUTUBE_API_KEY=your-youtube-api-key-here
TELEGRAM_BOT_TOKEN=your-telegram-bot-token-here
JWT_SECRET=$(openssl rand -base64 32)
PORT=3000
EOF

# Создание next.config.js
cat > $PROJECT_DIR/next.config.js << EOF
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['lodash', 'axios']
  },
  images: {
    domains: ['img.youtube.com'],
    formats: ['image/webp']
  },
  compress: true,
  poweredByHeader: false
}

module.exports = nextConfig
EOF

# Права на файлы
chmod 600 $PROJECT_DIR/.env
chown -R $USER:$USER $PROJECT_DIR

log_success "Окружение настроено"

# Шаг 6: Настройка PM2
log_info "Шаг 6: Настройка PM2"

# Создание конфигурации PM2
cat > $PROJECT_DIR/ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: '$SERVICE_NAME',
    script: 'npm',
    args: 'start',
    cwd: '$PROJECT_DIR',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: '$PROJECT_DIR/logs/err.log',
    out_file: '$PROJECT_DIR/logs/out.log',
    log_file: '$PROJECT_DIR/logs/combined.log',
    time: true,
    node_args: '--max-old-space-size=2048'
  }]
};
EOF

# Создание директорий для логов
mkdir -p $PROJECT_DIR/logs
chown -R $USER:$USER $PROJECT_DIR/logs

# Запуск приложения
pm2 start $PROJECT_DIR/ecosystem.config.js
pm2 save
pm2 startup

log_success "PM2 настроен"

# Шаг 7: Настройка Nginx
log_info "Шаг 7: Настройка Nginx"

# Создание конфигурации Nginx
cat > /etc/nginx/sites-available/$PROJECT_NAME << EOF
server {
    listen 80;
    server_name ${DOMAIN:-_};

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
        alias $PROJECT_DIR/.next/static/;
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
ln -sf /etc/nginx/sites-available/$PROJECT_NAME /etc/nginx/sites-enabled/
nginx -t
systemctl reload nginx

log_success "Nginx настроен"

# Шаг 8: Настройка SSL
log_info "Шаг 8: Настройка SSL"

if [ -n "$DOMAIN" ]; then
    certbot --nginx -d $DOMAIN -d www.$DOMAIN --non-interactive --agree-tos
    
    # Автопродление
    echo "0 12 * * * /usr/bin/certbot renew --quiet" | crontab -
    log_success "SSL сертификат настроен"
else
    log_info "Пропуск SSL - домен не указан"
fi

# Шаг 9: Настройка Firewall
log_info "Шаг 9: Настройка Firewall"
ufw allow ssh
ufw allow 'Nginx Full'
ufw --force enable
log_success "Firewall настроен"

# Шаг 10: Настройка резервного копирования
log_info "Шаг 10: Настройка резервного копирования"

# Создание скрипта резервного копирования
cat > /usr/local/bin/backup-$PROJECT_NAME.sh << EOF
#!/bin/bash
DATE=\$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/var/backups/$PROJECT_NAME"
APP_DIR="$PROJECT_DIR"

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

chmod +x /usr/local/bin/backup-$PROJECT_NAME.sh

# Настройка cron
echo "0 2 * * * /usr/local/bin/backup-$PROJECT_NAME.sh" | crontab -

log_success "Резервное копирование настроено"

# Шаг 11: Настройка оптимизации
log_info "Шаг 11: Оптимизация системы"

# Оптимизация MongoDB
cat > /etc/mongod.conf << EOF
storage:
  engine: "wiredTiger"
  wiredTiger:
    engineConfig:
      cacheSizeGB: 1

systemLog:
  destination: file
  path: /var/log/mongodb/mongod.log
  logAppend: true

processManagement:
  fork: true

net:
  port: 27017
  bindIp: 127.0.0.1
EOF

systemctl restart mongod

# Оптимизация Nginx
cat > /etc/nginx/nginx.conf << EOF
user www-data;
worker_processes auto;
worker_rlimit_nofile 100000;

events {
    worker_connections 4000;
    multi_accept on;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    # Оптимизация производительности
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;

    # Gzip сжатие
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/javascript
        application/xml+rss
        application/json;

    # Кеширование
    proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=api_cache:10m inactive=60m;

    include /etc/nginx/conf.d/*.conf;
    include /etc/nginx/sites-enabled/*;
}
EOF

systemctl restart nginx

log_success "Оптимизация настроена"

# Завершение
echo ""
echo -e "${GREEN}🎉 Установка Twitch to YouTube Publisher v2.0 завершена успешно!${NC}"
echo "================================================================"
echo ""
echo -e "${YELLOW}📝 Следующие шаги:${NC}"
echo ""
if [ -n "$DOMAIN" ]; then
    echo "1. Настройте доменное имя: $DOMAIN"
    echo "2. Установите SSL сертификат (если не настроен автоматически)"
    echo "3. Заполните .env файл реальными данными:"
else
    echo "1. Установите доменное имя и укажите его при перезапуске скрипта"
    echo "2. Заполните .env файл реальными данными:"
fi
echo "   - YOUTUBE_API_KEY"
echo "   - TELEGRAM_BOT_TOKEN"
echo "   - MONGODB_URI (если используется внешний MongoDB)"
echo ""
echo "4. Перезапустите приложение:"
echo "   pm2 restart $SERVICE_NAME"
echo ""
echo -e "${GREEN}🔗 Доступ к приложению:${NC}"
if [ -n "$DOMAIN" ]; then
    echo "   https://$DOMAIN"
else
    echo "   http://$(curl -s ifconfig.me)"
fi
echo ""
echo -e "${GREEN}📊 Статус PM2:${NC}"
echo "   pm2 status"
echo ""
echo -e "${BLUE}📚 Документация:${NC}"
echo "   INSTALL.md - Полное руководство по установке"
echo "   README.md - Описание проекта"
echo ""
echo -e "${YELLOW}🔧 Полезные команды:${NC}"
echo "   pm2 logs $SERVICE_NAME     - Логи приложения"
echo "   pm2 monit                  - Мониторинг PM2"
echo "   systemctl status nginx     - Статус Nginx"
echo "   systemctl status mongod    - Статус MongoDB"
echo "   tail -f /var/log/nginx/access.log - Логи Nginx"
echo ""
echo -e "${GREEN}✨ Новые возможности v2.0:${NC}"
echo "   - Next.js 14 с App Router"
echo "   - React 18 с TypeScript"
echo "   - Tailwind CSS для стилизации"
echo "   - Улучшенная безопасность"
echo "   - Оптимизированная производительность"
echo "   - Docker поддержка"
echo ""