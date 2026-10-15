#!/bin/bash

# Скрипт мониторинга состояния приложения
# Использование: ./monitor.sh [status|logs|restart|backup]

APP_USER="telegram_vk_publisher"
APP_DIR="/home/$APP_USER/telegram_to_vk_publisher"
LOG_DIR="$APP_DIR/logs"

# Цвета
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Функции
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Проверка статуса сервиса
check_status() {
    print_status "Проверка статуса сервиса..."
    
    if systemctl is-active --quiet telegram_vk_publisher; then
        print_success "Сервис активен"
        
        # Проверка здоровья
        if systemctl is-active --quiet healthcheck; then
            print_success "Health check пройден"
        else
            print_warning "Health check не пройден"
        fi
        
        # Проверка использования ресурсов
        echo ""
        print_status "Использование ресурсов:"
        echo "CPU: $(top -bn1 | grep "Cpu(s)" | sed "s/.*, *\([0-9.]*\)%* id.*/\1/" | awk '{print 100 - $0}')%"
        echo "Memory: $(free -h | grep Mem | awk '{print $3 "/" $2 " (" $3/$2*100 "%)"}')"
        echo "Disk: $(df -h / | tail -1 | awk '{print $3 "/" $2 " (" $5 "%)"}')"
        
        # Проверка логов
        echo ""
        print_status "Последние логи:"
        if [[ -f "$LOG_DIR/app_$(date +%Y%m%d).log" ]]; then
            tail -n 5 "$LOG_DIR/app_$(date +%Y%m%d).log"
        else
            print_warning "Логи за сегодня не найдены"
        fi
        
    else
        print_error "Сервис не активен"
        return 1
    fi
}

# Просмотр логов
show_logs() {
    print_status "Просмотр логов..."
    
    if [[ -n "$1" ]]; then
        # Показать последние N строк
        tail -n "$1" "$LOG_DIR/app_$(date +%Y%m%d).log"
    else
        # Показать последние 20 строк
        tail -n 20 "$LOG_DIR/app_$(date +%Y%m%d).log"
    fi
}

# Перезапуск сервиса
restart_service() {
    print_status "Перезапуск сервиса..."
    
    systemctl stop telegram_vk_publisher
    sleep 2
    systemctl start telegram_vk_publisher
    
    if systemctl is-active --quiet telegram_vk_publisher; then
        print_success "Сервис успешно перезапущен"
    else
        print_error "Ошибка при перезапуске сервиса"
        return 1
    fi
}

# Создание бэкапа
create_backup() {
    print_status "Создание бэкапа..."
    
    BACKUP_DIR="$APP_DIR/backups"
    TIMESTAMP=$(date +%Y%m%d_%H%M%S)
    
    mkdir -p "$BACKUP_DIR"
    
    # Бэкап базы данных
    if [[ -f "$APP_DIR/database/app.db" ]]; then
        cp "$APP_DIR/database/app.db" "$BACKUP_DIR/app_$TIMESTAMP.db"
        print_success "База данных сохранена"
    else
        print_warning "Файл базы данных не найден"
    fi
    
    # Бэкап конфигурации
    if [[ -f "$APP_DIR/.env" ]]; then
        cp "$APP_DIR/.env" "$BACKUP_DIR/.env_$TIMESTAMP"
        print_success "Конфигурация сохранена"
    else
        print_warning "Файл конфигурации не найден"
    fi
    
    # Очистка старых бэкапов
    find "$BACKUP_DIR" -name "*.db" -mtime +7 -delete
    find "$BACKUP_DIR" -name "*.env_*" -mtime +7 -delete
    
    print_success "Бэкап создан: $TIMESTAMP"
}

# Статистика
show_stats() {
    print_status "Статистика приложения..."
    
    if [[ -f "$APP_DIR/database/app.db" ]]; then
        # Подключение к базе данных
        sqlite3 "$APP_DIR/database/app.db" << EOF
-- Общая статистика
SELECT 
    'Всего постов: ' || COUNT(*) as total_posts,
    'Опубликовано: ' || SUM(CASE WHEN status = 'published' THEN 1 ELSE 0 END) as published,
    'Ожидают публикации: ' || SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
    'Ошибки: ' || SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as failed
FROM posts;

-- Статистика по дням
SELECT 
    DATE(published_at) as date,
    COUNT(*) as posts_count
FROM posts
WHERE published_at IS NOT NULL
GROUP BY DATE(published_at)
ORDER BY date DESC
LIMIT 7;
EOF
    else
        print_warning "База данных не найдена"
    fi
}

# Главное меню
show_menu() {
    echo ""
    echo "=========================================="
    echo "Мониторинг приложения Telegram to VK"
    echo "=========================================="
    echo "1. Проверить статус"
    echo "2. Просмотреть логи"
    echo "3. Перезапустить сервис"
    echo "4. Создать бэкап"
    echo "5. Показать статистику"
    echo "6. Выход"
    echo "=========================================="
    echo -n "Выберите опцию: "
}

# Основная логика
case "${1:-menu}" in
    "status")
        check_status
        ;;
    "logs")
        if [[ -n "$2" ]]; then
            show_logs "$2"
        else
            show_logs
        fi
        ;;
    "restart")
        restart_service
        ;;
    "backup")
        create_backup
        ;;
    "stats")
        show_stats
        ;;
    "menu")
        while true; do
            show_menu
            read -r choice
            
            case $choice in
                1)
                    check_status
                    ;;
                2)
                    show_logs
                    ;;
                3)
                    restart_service
                    ;;
                4)
                    create_backup
                    ;;
                5)
                    show_stats
                    ;;
                6)
                    echo "Выход..."
                    exit 0
                    ;;
                *)
                    print_error "Неверный выбор"
                    ;;
            esac
            
            echo ""
            read -p "Нажмите Enter для продолжения..."
        done
        ;;
    *)
        print_error "Использование: $0 [status|logs|restart|backup|stats|menu]"
        exit 1
        ;;
esac