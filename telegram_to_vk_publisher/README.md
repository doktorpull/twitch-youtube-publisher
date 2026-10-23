# Telegram to VK Publisher

Приложение для автоматического парсинга постов из Telegram канала и публикации в VK группу.

## Функционал

- Парсинг постов из Telegram канала @NightGameCity
- Автоматическая публикация в VK группу
- Обработка текстовых постов и медиа файлов
- Сохранение истории постов в базе данных
- Планировщик для регулярной проверки новых постов

## Установка

1. Клонируйте репозиторий
2. Создайте виртуальное окружение:
   ```bash
   python -m venv venv
   source venv/bin/activate  # Linux/Mac
   venv\Scripts\activate     # Windows
   ```
3. Установите зависимости:
   ```bash
   pip install -r requirements.txt
   ```
4. Создайте файл `.env` на основе `.env.example` и заполните ваши API ключи

## Настройка

### Telegram API
1. Перейдите на https://my.telegram.org
2. Создайте приложение и получите api_id и api_hash
3. Добавьте канал @NightGameCity в контакты бота (если требуется)

### VK API
1. Перейдите в раздел "Разработчики" на сайте VK
2. Создайте Standalone-приложение
3. Получите access_token с правами wall, groups, photos
4. Укажите ID вашей группы

## Запуск

```bash
python main.py
```

## Структура проекта

```
telegram_to_vk_publisher/
├── config/          # Конфигурация
├── database/        # База данных
├── services/        # Основные сервисы
├── utils/           # Утилиты
├── downloads/       # Загруженные медиа
├── logs/           # Логи
└── main.py         # Основной файл
```

## Лицензия

MIT