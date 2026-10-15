#!/usr/bin/env python3
"""
Основной файл приложения для парсинга Telegram и публикации в VK
"""

import asyncio
import logging
import signal
import sys
from pathlib import Path

from config import load_config
from database import Database
from services.telegram_parser import TelegramParser
from services.vk_publisher import VKPublisher
from services.scheduler import Scheduler
from utils.logger import setup_logging

# Импортируем pydantic_settings для работы с настройками
try:
    from pydantic_settings import BaseSettings
except ImportError:
    print("pydantic_settings not found. Installing...")
    import subprocess
    subprocess.check_call([sys.executable, "-m", "pip", "install", "pydantic-settings"])
    from pydantic_settings import BaseSettings

class Application:
    def __init__(self):
        self.config = load_config()
        self.logger = None
        self.db = None
        self.telegram_parser = None
        self.vk_publisher = None
        self.scheduler = None
        self.running = False
        
    async def start(self):
        """Запуск приложения"""
        try:
            # Настройка логирования
            self.logger = setup_logging(
                self.config['app'].log_level,
                "./logs"
            )
            
            self.logger.info("Starting Telegram to VK Publisher...")
            
            # Инициализация базы данных
            self.db = Database(self.config['database'].url)
            self.logger.info("Database initialized")
            
            # Инициализация Telegram клиента
            self.telegram_parser = TelegramParser(
                self.config['telegram'].api_id,
                self.config['telegram'].api_hash,
                self.config['telegram'].channel_username
            )
            await self.telegram_parser.start()
            self.logger.info("Telegram client started")
            
            # Инициализация VK клиента
            self.vk_publisher = VKPublisher(
                self.config['vk'].access_token,
                self.config['vk'].group_id
            )
            self.logger.info("VK client initialized")
            
            # Инициализация и запуск планировщика
            self.scheduler = Scheduler()
            await self.scheduler.start()
            self.logger.info("Scheduler started")
            
            self.running = True
            self.logger.info("Application started successfully")
            
            # Ожидание завершения
            await self.wait_for_shutdown()
            
        except KeyboardInterrupt:
            self.logger.info("Received interrupt signal")
        except Exception as e:
            self.logger.error(f"Error starting application: {e}")
            raise
        finally:
            await self.stop()
            
    async def stop(self):
        """Остановка приложения"""
        self.logger.info("Stopping application...")
        
        self.running = False
        
        if self.scheduler:
            await self.scheduler.stop()
            
        if self.telegram_parser:
            await self.telegram_parser.stop()
            
        self.logger.info("Application stopped")
        
    async def wait_for_shutdown(self):
        """Ожидание сигнала завершения"""
        try:
            while self.running:
                await asyncio.sleep(1)
        except KeyboardInterrupt:
            pass
            
    def setup_signal_handlers(self):
        """Настройка обработчиков сигналов"""
        def signal_handler(signum, frame):
            self.logger.info(f"Received signal {signum}")
            self.running = False
            
        signal.signal(signal.SIGINT, signal_handler)
        signal.signal(signal.SIGTERM, signal_handler)

async def main():
    """Главная функция"""
    app = Application()
    app.setup_signal_handlers()
    
    try:
        await app.start()
    except Exception as e:
        print(f"Fatal error: {e}")
        return 1
        
    return 0

if __name__ == "__main__":
    # Проверка наличия .env файла
    if not Path(".env").exists():
        print("Error: .env file not found!")
        print("Please copy .env.example to .env and fill in your API credentials")
        sys.exit(1)
        
    # Запуск приложения
    exit_code = asyncio.run(main())
    sys.exit(exit_code)