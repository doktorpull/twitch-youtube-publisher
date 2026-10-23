#!/bin/bash

# Скрипт публикации проекта на GitHub

set -e

# Конфигурация
REPO_URL="https://github.com/doktorpull/dokcode.git"
BRANCH_NAME="main"
PROJECT_NAME="twitch-youtube-publisher"

echo "🚀 Начинаю публикацию проекта $PROJECT_NAME..."

# Проверка наличия git
if ! command -v git &> /dev/null; then
    echo "❌ Git не установлен. Устанавливаем..."
    # Здесь нужно добавить установку git для вашей системы
    exit 1
fi

# Проверка на наличие изменений
if ! git diff-index --quiet HEAD --; then
    echo "📝 Обнаружены изменения, добавляем их в коммит..."
    
    # Добавляем все изменения
    git add .
    
    # Создаем коммит с автоматическим сообщением
    COMMIT_MESSAGE=$(git diff --cached --name-only | head -5 | sed ':a;N;$!ba;s/\n/, /g')
    COMMIT_MESSAGE="Update: $COMMIT_MESSAGE"
    
    git commit -m "$COMMIT_MESSAGE"
    echo "✅ Коммит создан: $COMMIT_MESSAGE"
else
    echo "ℹ️  Нет изменений для коммита"
fi

# Проверка связи с удаленным репозиторием
echo "🔗 Проверка связи с удаленным репозиторием..."
if ! git remote -v | grep -q "$REPO_URL"; then
    echo "🌐 Добавление удаленного репозитория..."
    git remote add origin "$REPO_URL"
fi

# Пуш в удаленный репозиторий
echo "📤 Отправка изменений в GitHub..."
git push -u origin "$BRANCH_NAME"

echo "✅ Публикация завершена успешно!"
echo "🔗 Ссылка на репозиторий: $REPO_URL"