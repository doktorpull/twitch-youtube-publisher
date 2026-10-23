#!/usr/bin/env python3
"""
Скрипт для первоначальной настройки и тестирования компонентов
"""

import asyncio
import logging
from pathlib import Path

from config import load_config
from database import Database
from services.telegram_parser import TelegramParser
from services.vk_publisher import VKPublisher
from utils.logger import setup_logging

async def test_database():
    """Тестирование подключения к базе данных"""
    print("Testing database connection...")
    
    config = load_config()
    db = Database(config['database'].url)
    
    try:
        # Тестовое сохранение поста
        test_post = {
            'telegram_post_id': 999999,
            'telegram_channel': 'NightGameCity',
            'post_date': '2023-01-01 12:00:00',
            'text': 'Test post',
            'media_type': None,
            'media_path': None,
            'status': 'pending'
        }
        
        post = db.save_post(test_post)
        print(f"✓ Test post saved with ID: {post.id}")
        
        # Получение постов
        posts = db.get_unpublished_posts(limit=5)
        print(f"✓ Retrieved {len(posts)} posts")
        
        # Очистка
        db.update_post_status(post.id, 'published')
        print("✓ Test post updated")
        
    except Exception as e:
        print(f"✗ Database test failed: {e}")
        return False
    finally:
        db.get_session().close()
        
    return True

async def test_telegram():
    """Тестирование подключения к Telegram"""
    print("\nTesting Telegram connection...")
    
    config = load_config()
    telegram_parser = TelegramParser(
        config['telegram'].api_id,
        config['telegram'].api_hash,
        config['telegram'].channel_username
    )
    
    try:
        await telegram_parser.start()
        print("✓ Telegram client started")
        
        # Получение сущности канала
        channel = await telegram_parser.get_channel_entity()
        print(f"✓ Channel found: {channel.title} (ID: {channel.id})")
        
        # Получение последних постов
        posts = await telegram_parser.get_posts(limit=3)
        print(f"✓ Retrieved {len(posts)} posts")
        
        for post in posts:
            print(f"  - Post ID: {post['telegram_post_id']}")
            print(f"    Date: {post['post_date']}")
            print(f"    Text: {post['text'][:50]}...")
            if post['media_type']:
                print(f"    Media: {post['media_type']}")
        
        await telegram_parser.stop()
        print("✓ Telegram client stopped")
        
    except Exception as e:
        print(f"✗ Telegram test failed: {e}")
        return False
        
    return True

async def test_vk():
    """Тестирование подключения к VK"""
    print("\nTesting VK connection...")
    
    config = load_config()
    vk_publisher = VKPublisher(
        config['vk'].access_token,
        config['vk'].group_id
    )
    
    try:
        # Тестовая публикация
        test_message = "Test message from Telegram to VK Publisher"
        post_id = vk_publisher.post_to_wall(test_message)
        print(f"✓ Test post published with ID: {post_id}")
        
        # Удаление тестового поста
        # vk_publisher.delete_post(post_id)
        print("✓ Test post deleted")
        
    except Exception as e:
        print(f"✗ VK test failed: {e}")
        return False
        
    return True

async def main():
    """Основная функция"""
    # Настройка логирования
    setup_logging("INFO")
    
    # Проверка наличия .env файла
    if not Path(".env").exists():
        print("Error: .env file not found!")
        print("Please copy .env.example to .env and fill in your API credentials")
        return 1
        
    # Загрузка конфигурации
    try:
        config = load_config()
        print("Configuration loaded successfully")
    except Exception as e:
        print(f"Error loading configuration: {e}")
        print("Please check your .env file")
        return 1
        
    # Тестирование компонентов
    tests = [
        ("Database", test_database),
        ("Telegram", test_telegram),
        ("VK", test_vk)
    ]
    
    results = {}
    
    for test_name, test_func in tests:
        try:
            result = await test_func()
            results[test_name] = result
        except Exception as e:
            print(f"✗ {test_name} test crashed: {e}")
            results[test_name] = False
            
    # Вывод результатов
    print("\n" + "="*50)
    print("Test Results:")
    print("="*50)
    
    all_passed = True
    for test_name, result in results.items():
        status = "PASS" if result else "FAIL"
        print(f"{test_name}: {status}")
        if not result:
            all_passed = False
            
    print("="*50)
    
    if all_passed:
        print("✓ All tests passed! Application is ready to run.")
        print("Run 'python main.py' to start the application.")
    else:
        print("✗ Some tests failed. Please check the configuration and try again.")
        
    return 0 if all_passed else 1

if __name__ == "__main__":
    exit_code = asyncio.run(main())
    exit(exit_code)