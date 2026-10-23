import os
import json
from datetime import datetime, timedelta
from typing import Dict, Any, Optional

def load_env_file(file_path: str = ".env") -> Dict[str, str]:
    """Загрузка переменных из .env файла"""
    env_vars = {}
    
    if os.path.exists(file_path):
        with open(file_path, 'r', encoding='utf-8') as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith('#'):
                    if '=' in line:
                        key, value = line.split('=', 1)
                        env_vars[key.strip()] = value.strip()
                        
    return env_vars

def save_env_file(data: Dict[str, str], file_path: str = ".env"):
    """Сохранение переменных в .env файл"""
    with open(file_path, 'w', encoding='utf-8') as f:
        for key, value in data.items():
            f.write(f"{key}={value}\n")

def format_datetime(dt: datetime) -> str:
    """Форматирование даты и времени"""
    return dt.strftime("%Y-%m-%d %H:%M:%S")

def parse_datetime(date_str: str) -> Optional[datetime]:
    """Парсинг строки с датой"""
    try:
        return datetime.strptime(date_str, "%Y-%m-%d %H:%M:%S")
    except ValueError:
        try:
            return datetime.strptime(date_str, "%Y-%m-%d")
        except ValueError:
            return None

def truncate_text(text: str, max_length: int = 100) -> str:
    """Обрезка текста с добавлением многоточия"""
    if len(text) <= max_length:
        return text
    return text[:max_length-3] + "..."

def is_valid_url(url: str) -> bool:
    """Проверка является ли строка валидным URL"""
    if not url or not isinstance(url, str):
        return False
        
    # Простая проверка на наличие протокола
    return url.startswith(('http://', 'https://'))

def get_file_size(file_path: str) -> int:
    """Получение размера файла в байтах"""
    try:
        return os.path.getsize(file_path)
    except OSError:
        return 0

def format_file_size(size_bytes: int) -> str:
    """Форматирование размера файла"""
    if size_bytes == 0:
        return "0 B"
    
    size_names = ["B", "KB", "MB", "GB", "TB"]
    i = 0
    while size_bytes >= 1024 and i < len(size_names) - 1:
        size_bytes /= 1024
        i += 1
        
    return f"{size_bytes:.1f} {size_names[i]}"

def create_backup(file_path: str, backup_dir: str = "./backups"):
    """Создание бэкапа файла"""
    if not os.path.exists(file_path):
        return False
        
    os.makedirs(backup_dir, exist_ok=True)
    
    file_name = os.path.basename(file_path)
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    backup_path = os.path.join(backup_dir, f"{timestamp}_{file_name}")
    
    try:
        shutil.copy2(file_path, backup_path)
        return True
    except Exception as e:
        print(f"Error creating backup: {e}")
        return False

import shutil