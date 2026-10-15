import logging
import os
from datetime import datetime

def setup_logging(log_level: str = "INFO", log_dir: str = "./logs"):
    """Настройка логирования"""
    # Создаем директорию для логов если нет
    os.makedirs(log_dir, exist_ok=True)
    
    # Настраиваем форматтер
    formatter = logging.Formatter(
        '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )
    
    # Настраиваем корневой логгер
    logger = logging.getLogger()
    logger.setLevel(getattr(logging, log_level.upper()))
    
    # Удаляем существующие обработчики
    logger.handlers.clear()
    
    # Консольный обработчик
    console_handler = logging.StreamHandler()
    console_handler.setFormatter(formatter)
    logger.addHandler(console_handler)
    
    # Файловый обработчик
    log_file = os.path.join(log_dir, f"app_{datetime.now().strftime('%Y%m%d')}.log")
    file_handler = logging.FileHandler(log_file, encoding='utf-8')
    file_handler.setFormatter(formatter)
    logger.addHandler(file_handler)
    
    return logger