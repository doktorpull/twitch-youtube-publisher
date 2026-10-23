# GitHub Publishing Instructions

## Настройка доступа к репозиторию

### 1. Создание Personal Access Token (PAT)
1. Перейдите в настройки GitHub: https://github.com/settings/tokens
2. Нажмите "Generate new token" → "Generate new token (classic)"
3. Выберите срок действия (90 дней рекомендуется)
4. Добавьте разрешения:
   - `repo` - Полный доступ к репозиториям
5. Сгенерируйте и скопируйте токен (он будет показан только один раз!)

### 2. Настройка аутентификации

#### Способ 1: Через HTTPS токен (рекомендуется)
```bash
git remote set-url origin https://doktorpull:YOUR_TOKEN@github.com/doktorpull/dokcode.git
```

#### Способ 2: Через SSH
```bash
ssh-keygen -t ed25519 -C "your_email@example.com"
# Добавьте публичный ключ в GitHub settings → SSH keys
```

### 3. Публикация кода

#### Ручная публикация:
```bash
# Windows
publish.bat

# Linux/Mac
chmod +x publish.sh
./publish.sh
```

#### Автоматическая публикация через GitHub Actions:
- Код будет автоматически публиковаться при каждом пуше в ветку `main`
- Также можно запустить вручную через GitHub Actions

### 4. Настройка CI/CD

В workflows уже настроена автоматическая сборка и тестирование проекта при каждом коммите.

### 5. Структура репозитория:
```
twitch-youtube-publisher/
├── src/                    # Исходный код
├── public/                 # Статические файлы
├── dist/                   # Скомпилированный код
├── .github/               # GitHub Actions
├── package.json           # Зависимости
├── tsconfig.json          # TypeScript конфигурация
├── README.md              # Документация
└── publish.sh/.bat        # Скрипты публикации
```

### 6. Частые команды

```bash
# Проверить статус
git status

# Посмотреть изменения
git diff

# Посмотреть историю коммитов
git log --oneline

# Создать новую ветку
git checkout -b feature/new-feature

# Обновить код с GitHub
git pull origin main
```

### 7. Безопасность

- Никогда не публикуйте токены доступа в код
- Используйте secrets GitHub Actions для чувствительных данных
- Регулярно обновляйте зависимости
- Делайте резервные копии важных данных

### 8. Мониторинг

- GitHub Actions покажет статус сборки
- Логи можно посмотреть во вкладке "Actions"
- Уведомления о статусе сборки будут приходить на email

После настройки токена доступа вы сможете публиковать код с помощью скриптов publish.sh или publish.bat.