# Инструкция по установке и настройке приложения на VPS сервер

## Требования сервера

### Минимальные характеристики:
- **ОС**: Ubuntu 24.04 LTS
- **Процессор**: 1 ядро (достаточно для приложения)
- **Оперативная память**: 2 ГБ (рекомендуется 2+ ГБ)
- **Накопитель**: 30 ГБ NVMe (достаточно для хранения)
- **Сеть**: 500 Мбит/с (оптимально для работы API)
- **Python**: 3.10+ (входит в состав Ubuntu 24.04)

## Пошаговая инструкция

### 1. Подключение к серверу

```bash
# Подключитесь к вашему VPS через SSH
ssh root@ваш_IP_адрес
```

### 2. Обновление системы

```bash
# Обновляем списки пакетов
apt update && apt upgrade -y

# Устанавливаем необходимые пакеты
apt install -y python3-pip python3-venv git supervisor nginx
```

### 3. Создание пользователя и директорий

```bash
# Создаем пользователя для приложения
adduser telegram_vk_publisher

# Переключаемся на пользователя
su - telegram_vk_publisher

# Создаем директорию для приложения
mkdir -p ~/telegram_to_vk_publisher
cd ~/telegram_to_vk_publisher
```

### 4. Клонирование репозитория

```bash
# Если ваш код в Git репозитории
git clone https://github.com/ваш_пользователь/telegram_to_vk_publisher.git .

# Если нужно загрузить файлы другим способом
# Используйте scp или другой способ передачи файлов
```

### 5. Установка зависимостей

```bash
# Создаем виртуальное окружение
python3 -m venv venv

# Активируем виртуальное окружение
source venv/bin/activate

# Устанавливаем Python зависимости
pip install --upgrade pip
pip install -r requirements.txt

# Устанавливаем недостающие зависимости
pip install pydantic-settings
```

### 6. Настройка API ключей

```bash
# Создаем директорию для конфигурации
mkdir -p ~/.config/telegram_to_vk_publisher

# Копируем шаблон конфигурации
cp ~/telegram_to_vk_publisher/.env.example ~/.config/telegram_to_vk_publisher/.env

# Редактируем конфигурационный файл
nano ~/.config/telegram_to_vk_publisher/.env
```

**Содержимое .env файла:**

```bash
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
```

### 7. Настройка базы данных

```bash
# Создаем директорию для базы данных
mkdir -p ~/telegram_to_vk_publisher/database

# Запускаем тестирование базы данных
cd ~/telegram_to_vk_publisher
source venv/bin/activate
python setup.py
```

### 8. Настройка Systemd сервиса

```bash
# Возвращаемся в root
exit

# Создаем systemd сервис файл
nano /etc/systemd/system/telegram_vk_publisher.service
```

**Содержимое сервиса:**

```ini
[Unit]
Description=Telegram to VK Publisher
After=network.target

[Service]
Type=simple
User=telegram_vk_publisher
WorkingDirectory=/home/telegram_vk_publisher/telegram_to_vk_publisher
Environment=PATH=/home/telegram_vk_publisher/telegram_to_vk_publisher/venv/bin
ExecStart=/home/telegram_vk_publisher/telegram_to_vk_publisher/venv/bin/python main.py
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
```

### 9. Настройка Supervisor (альтернатива Systemd)

```bash
# Создаем конфигурационный файл supervisor
nano /etc/supervisor/conf.d/telegram_vk_publisher.conf
```

**Содержимое конфига:**

```ini
[program:telegram_vk_publisher]
command=/home/telegram_vk_publisher/telegram_to_vk_publisher/venv/bin/python main.py
directory=/home/telegram_vk_publisher/telegram_to_vk_publisher
user=telegram_vk_publisher
autostart=true
autorestart=true
redirect_stderr=true
stdout_logfile=/home/telegram_vk_publisher/telegram_to_vk_publisher/logs/supervisor.log
stdout_logfile_maxbytes=50MB
stdout_logfile_backups=5

# Ограничения ресурсов
numprocs=1
process_name=%(program_name)s
numprocs=1
environment=PYTHONPATH="/home/telegram_vk_publisher/telegram_to_vk_publisher"
```

### 10. Настройка лог-ротации

```bash
# Создаем конфиг для logrotate
nano /etc/logrotate.d/telegram_vk_publisher
```

**Содержимое:**

```
/home/telegram_vk_publisher/telegram_to_vk_publisher/logs/*.log {
    daily
    missingok
    rotate 7
    compress
    delaycompress
    notifempty
    create 644 telegram_vk_publisher telegram_vk_publisher
}
```

### 11. Настройка брандмауэра

```bash
# Разрешаем SSH (если нужно)
ufw allow ssh

# Разрешаем HTTP (если нужен веб-интерфейс)
ufw allow 80/tcp
ufw allow 443/tcp

# Включаем брандмауэр
ufw enable
```

### 12. Оптимизация производительности

```bash
# Устанавливаем uvloop для лучшей производительности
source ~/telegram_to_vk_publisher/venv/bin/activate
pip install uvloop

# Создаем оптимизированный запуск
nano ~/telegram_to_vk_publisher/run.py
```

**Содержимое run.py:**

```python
#!/usr/bin/env python3
import uvloop
uvloop.install()

import asyncio
from main import main

if __name__ == "__main__":
    asyncio.run(main())
```

### 13. Автозапуск приложения

```bash
# Включаем и запускаем сервис
systemctl daemon-reload
systemctl enable telegram_vk_publisher
systemctl start telegram_vk_publisher

# Проверяем статус
systemctl status telegram_vk_publisher

# Просматриваем логи
journalctl -u telegram_vk_publisher -f
```

### 14. Мониторинг и обслуживание

```bash
# Проверка статуса
systemctl status telegram_vk_publisher

# Перезапуск сервиса
systemctl restart telegram_vk_publisher

# Просмотр логов
journalctl -u telegram_vk_publisher --since today

# Проверка использования ресурсов
htop
df -h
free -h
```

## Дополнительные настройки

### 1. Настройка резервного копирования

```bash
# Создаем скрипт резервного копирования
nano /home/telegram_vk_publisher/backup.sh
```

**Содержимое скрипта:**

```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/home/telegram_vk_publisher/backups"
APP_DIR="/home/telegram_vk_publisher/telegram_to_vk_publisher"

# Создаем бэкап базы данных
mkdir -p $BACKUP_DIR
cp $APP_DIR/database/app.db $BACKUP_DIR/app_$DATE.db

# Создаем бэкап конфигурации
cp $APP_DIR/.env $BACKUP_DIR/.env_$DATE

# Удаляем старые бэкапы (более 7 дней)
find $BACKUP_DIR -name "*.db" -mtime +7 -delete
find $BACKUP_DIR -name "*.env_*" -mtime +7 -delete

echo "Backup completed: $DATE"
```

```bash
# Делаем скрипт исполняемым
chmod +x /home/telegram_vk_publisher/backup.sh

# Добавляем в cron
crontab -e
```

**Добавить строку:**

```bash
# Ежедневное резервное копирование в 2 ночи
0 2 * * * /home/telegram_vk_publisher/backup.sh
```

### 2. Настройка мониторинга

```bash
# Устанавливаем мониторинг
apt install -y htop iotop

# Проверка логов в реальном времени
tail -f ~/telegram_to_vk_publisher/logs/app_$(date +%Y%m%d).log
```

### 3. Обновление приложения

```bash
# Остановка сервиса
systemctl stop telegram_vk_publisher

# Обновление кода
cd ~/telegram_to_vk_publisher
git pull origin main

# Обновление зависимостей
source venv/bin/activate
pip install -r requirements.txt

# Запуск сервиса
systemctl start telegram_vk_publisher
```

## Решение возможных проблем

### 1. Недостаточно памяти

```bash
# Проверка использования памяти
free -h

# Если не хватает, можно увеличить swap
fallocate -l 2G /swapfile
chmod 600 /swapfile
mkswap /swapfile
swapon /swapfile

# Добавить в /etc/fstab для постоянного использования
echo '/swapfile none swap sw 0 0' >> /etc/fstab
```

### 2. Проблемы с API лимитами

```bash
# Увеличьте интервал проверки в .env файле
CHECK_INTERVAL=600  # 10 минут вместо 5
```

### 3. Ошибки подключения

```bash
# Проверка подключения к Telegram
telgram --api-id ваш_api_id --api-hash ваш_api_hash

# Проверка подключения к VK
curl -I "https://api.vk.com/method/wall.post?access_token=ваш_токен&v=5.131"
```

## Оптимизация для слабых серверов

1. **Уменьшите интервал проверки** в .env файле:
   ```bash
   CHECK_INTERVAL=600  # 10 минут
   ```

2. **Ограничьте количество постов за раз**:
   В коде можно изменить лимит получения постов

3. **Используйте легкий веб-сервер** для мониторинга (опционально)

4. **Отключите ненужные логи**:
   ```bash
   LOG_LEVEL=WARNING
   ```

## Безопасность

1. **Регулярно обновляйте систему**:
   ```bash
   apt update && apt upgrade -y
   ```

2. **Используйте SSH ключи** вместо паролей

3. **Ограничьте доступ к серверу**:
   ```bash
   uw allow from your_ip_address to any port 22
   ```

4. **Храните API ключи безопасно**:
   - Используйте переменные окружения
   - Не коммитьте ключи в репозиторий

## Заключение

После выполнения всех шагов приложение будет работать в фоновом режиме и автоматически публиковать посты из Telegram канала в VK группу. Для мониторинга статуса используйте:

```bash
systemctl status telegram_vk_publisher
journalctl -u telegram_vk_publisher -f
```