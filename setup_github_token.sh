#!/bin/bash

# Скрипт для безопасного ввода и настройки Personal Access Token

echo "🔐 Настройка Personal Access Token для GitHub"
echo "============================================"

# Запрос токена
read -s -p "Введите ваш Personal Access Token: " TOKEN
echo ""

# Валидация токена
if [[ ${#TOKEN} -lt 20 ]]; then
    echo "❌ Токен слишком короткий. Пожалуйста, проверьте и попробуйте снова."
    exit 1
fi

# Настройка удаленного репозитория
echo "🌐 Настройка удаленного репозитория..."
git remote set-url origin "https://doktorpull:$TOKEN@github.com/doktorpull/dokcode.git"

# Проверка подключения
echo "🔍 Проверка подключения к GitHub..."
if git ls-remote origin &>/dev/null; then
    echo "✅ Подключение к GitHub успешно!"
    echo "📤 Теперь вы можете публиковать изменения:"
    echo "   git add ."
    echo "   git commit -m 'Ваше сообщение'"
    echo "   git push origin main"
else
    echo "❌ Ошибка подключения. Проверьте токен и попробуйте снова."
    # Удаляем неверный URL
    git remote remove origin
    echo "❌ Токен отклонен GitHub. Пожалуйста, проверьте токен и попробуйте снова."
fi