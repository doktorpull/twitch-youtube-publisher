@echo off
REM Скрипт для безопасного ввода и настройки Personal Access Token для Windows

echo 🔐 Настройка Personal Access Token для GitHub
echo ============================================

REM Запрос токена
set /p "TOKEN=Введите ваш Personal Access Token: "

REM Валидация токена
if "%TOKEN%"=="" (
    echo ❌ Токен не может быть пустым.
    pause
    exit /b 1
)

REM Проверка длины токена
set TOKEN_LEN=0
for /L %%i in (1,1,100) do (
    if "!TOKEN:~%%i,1!"=="" set TOKEN_LEN=%%i
)

if %TOKEN_LEN% LSS 20 (
    echo ❌ Токен слишком короткий. Пожалуйста, проверьте и попробуйте снова.
    pause
    exit /b 1
)

REM Настройка удаленного репозитория
echo 🌐 Настройка удаленного репозитория...
git remote set-url origin "https://doktorpull:%TOKEN%@github.com/doktorpull/dokcode.git"

REM Проверка подключения
echo 🔍 Проверка подключения к GitHub...
git ls-remote origin >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Подключение к GitHub успешно!
    echo 📤 Теперь вы можете публиковать изменения:
    echo    git add .
    echo    git commit -m "Ваше сообщение"
    echo    git push origin main
) else (
    echo ❌ Ошибка подключения. Проверьте токен и попробуйте снова.
    pause
    exit /b 1
)

pause