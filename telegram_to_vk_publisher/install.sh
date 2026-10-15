#!/bin/bash

# Скрипт автоматической установки приложения на Ubuntu 24.04
# Требуются права root

set -e

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Функции
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Проверка прав root
if [[ $EUID -ne 0 ]]; then
   log_error "Этот скрипт должен быть запущен с правами root"
   exit 1
fi

# Проверка версии Ubuntu
if [[ ! -f /etc/os-release ]]; then
    log_error "Не удалось определить версию ОС"
    exit 1
fi

. /etc/os-release
if [[ "$VERSION_ID" != "24.04" ]]; then
    log_warn "Скрипт предназначен для Ubuntu 24.04, текущая версия: $VERSION_ID"
    read -p "Продолжить установку? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Запрос данных пользователя
read -p "Введите имя пользователя для приложения: " APP_USER
read -p "Введите доменное имя или IP сервера: " SERVER_HOST
read -p "Введите email для SSL сертификата: " SSL_EMAIL

# Основная установка
log_info "Начало установки..."

# Обновление системы
log_info "Обновление системы..."
apt update && apt upgrade -y

# Установка необходимых пакетов
log_info "Установка необходимых пакетов..."
apt install -y python3-pip python3-venv git supervisor nginx curl wget unzip

# Создание пользователя
if ! id "$APP_USER" &>/dev/null; then
    log_info "Создание пользователя $APP_USER..."
    useradd -m -s /bin/bash $APP_USER
else
    log_warn "Пользователь $APP_USER уже существует"
fi

# Настройка SSH
log_info "Настройка SSH..."
mkdir -p /home/$APP_USER/.ssh
chmod 700 /home/$APP_USER/.ssh
touch /home/$APP_USER/.ssh/authorized_keys
chmod 600 /home/$APP_USER/.ssh/authorized_keys
chown -R $APP_USER:$APP_USER /home/$APP_USER/.ssh

# Копирование SSH ключа (опционально)
read -p "Хотите добавить SSH ключ? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    read -p "Введите ваш SSH публичный ключ: " SSH_KEY
    if [[ -n "$SSH_KEY" ]]; then
        echo "$SSH_KEY" >> /home/$APP_USER/.ssh/authorized_keys
        log_info "SSH ключ добавлен"
    fi
fi

# Установка Python зависимостей
log_info "Установка Python зависимостей..."
su - $APP_USER -c "python3 -m venv ~/telegram_to_vk_publisher/venv"
su - $APP_USER -c "source ~/telegram_to_vk_publisher/venv/bin/activate && pip install --upgrade pip"
su - $APP_USER -c "source ~/telegram_to_vk_publisher/venv/bin/activate && pip install -r ~/telegram_to_vk_publisher/requirements.txt"

# Установка недостающих зависимостей
su - $APP_USER -c "source ~/telegram_to_vk_publisher/venv/bin/activate && pip install pydantic-settings uvloop"

# Настройка приложения
log_info "Настройка приложения..."
cd /home/$APP_USER/telegram_to_vk_publisher

# Создание .env файла
cat > /home/$APP_USER/.env << EOF
# Telegram API Configuration
TELEGRAM_API_ID=ваш_api_id
TELEGRAM_API_HASH=ваш_api_hash
TELEGRAM_CHANNEL_USERNAME=NightGameCity

# VK API Configuration
VK_ACCESS_TOKEN=ваш_vk_access_token
VK_GROUP_ID=ваш_id_группы

# Database Configuration
DATABASE_URL=sqlite:///~/telegram_to_vk_publisher/database/app.db

# Application Configuration
CHECK_INTERVAL=300
LOG_LEVEL=INFO
DOWNLOAD_DIR=~/telegram_to_vk_publisher/downloads
EOF

# Настройка прав
chown -R $APP_USER:$APP_USER /home/$APP_user/telegram_to_vk_publisher

# Настройка Systemd сервиса
log_info "Настройка Systemd сервиса..."
cat > /etc/systemd/system/telegram_vk_publisher.service << EOF
[Unit]
Description=Telegram to VK Publisher
After=network.target

[Service]
Type=simple
User=$APP_USER
WorkingDirectory=/home/$APP_USER/telegram_to_vk_publisher
Environment=PATH=/home/$APP_USER/telegram_to_vk_publisher/venv/bin
ExecStart=/home/$APP_USER/telegram_to_vk_publisher/venv/bin/python main.py
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal

# Ограничения ресурсов для слабых серверов
LimitNOFILE=65536
MemoryMax=1G
CPUSchedulingPolicy=idle

[Install]
WantedBy=multi-user.target
EOF

# Настройка Supervisor
log_info "Настройка Supervisor..."
cat > /etc/supervisor/conf.d/telegram_vk_publisher.conf << EOF
[program:telegram_vk_publisher]
command=/home/$APP_USER/telegram_to_vk_publisher/venv/bin/python main.py
directory=/home/$APP_USER/telegram_to_vk_publisher
user=$APP_USER
autostart=true
autorestart=true
redirect_stderr=true
stdout_logfile=/home/$APP_USER/telegram_to_vk_publisher/logs/supervisor.log
stdout_logfile_maxbytes=50MB
stdout_logfile_backups=5

# Ограничения ресурсов
numprocs=1
environment=PYTHONPATH="/home/$APP_USER/telegram_to_vk_publisher"
EOF

# Настройка logrotate
log_info "Настройка logrotate..."
cat > /etc/logrotate.d/telegram_vk_publisher << EOF
/home/$APP_USER/telegram_to_vk_publisher/logs/*.log {
    daily
    missingok
    rotate 7
    compress
    delaycompress
    notifempty
    create 644 $APP_USER $APP_USER
}
EOF

# Настройка брандмауэра
log_info "Настройка брандмауэра..."
ufw --force enable
ufw allow ssh
ufw allow 80/tcp
ufw allow 443/tcp

# Настройка SSL (опционально)
if [[ -n "$SSL_EMAIL" ]]; then
    log_info "Настройка SSL сертификата..."
    apt install -y certbot python3-certbot-nginx
    certbot --nginx --agree-tos --non-interactive --email $SSL_EMAIL
fi

# Настройка Nginx (опционально)
log_info "Настройка Nginx..."
cat > /etc/nginx/sites-available/telegram_vk_publisher << EOF
server {
    listen 80;
    server_name $SERVER_HOST;
    
    location / {
        proxy_pass http://127.0.0.1:8080;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF

ln -sf /etc/nginx/sites-available/telegram_vk_publisher /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

systemctl restart nginx

# Создание скрипта резервного копирования
log_info "Создание скрипта резервного копирования..."
cat > /home/$APP_USER/backup.sh << EOF
#!/bin/bash
DATE=\$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/home/$APP_USER/backups"
APP_DIR="/home/$APP_USER/telegram_to_vk_publisher"

# Создаем бэкап базы данных
mkdir -p \$BACKUP_DIR
cp \$APP_DIR/database/app.db \$BACKUP_DIR/app_\$DATE.db

# Создаем бэкап конфигурации
cp \$APP_DIR/.env \$BACKUP_DIR/.env_\$DATE

# Удаляем старые бэкапы
find \$BACKUP_DIR -name "*.db" -mtime +7 -delete
find \$BACKUP_DIR -name "*.env_*" -mtime +7 -delete

echo "Backup completed: \$DATE"
EOF

chmod +x /home/$APP_USER/backup.sh

# Добавление в cron
cat > /tmp/cron_job << EOF
# Ежедневное резервное копирование
0 2 * * * /home/$APP_USER/backup.sh
EOF

crontab -u $APP_USER /tmp/cron_job
rm /tmp/cron_job

# Запуск сервиса
log_info "Запуск сервиса..."
systemctl daemon-reload
systemctl enable telegram_vk_publisher
systemctl start telegram_vk_publisher

# Проверка статуса
if systemctl is-active --quiet telegram_vk_publisher; then
    log_info "Сервис успешно запущен"
else
    log_error "Ошибка при запуске сервиса"
    journalctl -u telegram_vk_publisher --no-pager -n 20
    exit 1
fi

# Финальные инструкции
echo ""
echo "=========================================="
echo "Установка завершена!"
echo "=========================================="
echo ""
echo "1. Настройте API ключи:"
echo "   nano /home/$APP_USER/.env"
echo ""
echo "2. Проверьте статус сервиса:"
echo "   systemctl status telegram_vk_publisher"
echo ""
echo "3. Просматривайте логи:"
echo "   journalctl -u telegram_vk_publisher -f"
echo ""
echo "4. Для ручного запуска тестов:"
echo "   cd /home/$APP_USER/telegram_to_vk_publisher"
echo "   source venv/bin/activate"
echo "   python setup.py"
echo ""
echo "5. Веб-интерфейс доступен по адресу: http://$SERVER_HOST"
echo ""
echo "=========================================="