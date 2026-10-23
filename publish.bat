@echo off
REM Скрипт публикации проекта на GitHub для Windows

set REPO_URL=https://github.com/doktorpull/dokcode.git
set BRANCH_NAME=main
set PROJECT_NAME=twitch-youtube-publisher

echo 🚀 Начинаю публикацию проекта %PROJECT_NAME%...

REM Проверка наличия git
where git >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Git не установлен. Пожалуйста, установите Git.
    pause
    exit /b 1
)

REM Проверка на наличие изменений
git diff --quiet
if %errorlevel% neq 0 (
    echo 📝 Обнаружены изменения, добавляем их в коммит...
    
    REM Добавляем все изменения
    git add .
    
    REM Создаем коммит
    for /f "tokens=*" %%a in ('git diff --cached --name-only ^| head -5') do set FILES=!FILES!, %%a
    set FILES=%FILES:~2%
    
    git commit -m "Update: %FILES%"
    echo ✅ Коммит создан: Update %FILES%
) else (
    echo ℹ️  Нет изменений для коммита
)

REM Проверка связи с удаленным репозиторием
echo 🔗 Проверка связи с удаленным репозиторием...
git remote -v | findstr "%REPO_URL%" >nul
if %errorlevel% neq 0 (
    echo 🌐 Добавление удаленного репозитория...
    git remote add origin "%REPO_URL%"
)

REM Пуш в удаленный репозиторий
echo 📤 Отправка изменений в GitHub...
git push -u origin "%BRANCH_NAME%"

echo ✅ Публикация завершена успешно!
echo 🔗 Ссылка на репозиторий: %REPO_URL%
pause