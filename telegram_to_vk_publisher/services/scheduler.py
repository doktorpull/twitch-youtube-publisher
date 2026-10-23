import asyncio
import logging
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.interval import IntervalTrigger
from datetime import datetime
from typing import Dict, List

from .telegram_parser import TelegramParser
from .vk_publisher import VKPublisher
from ..database import Database
from ..config import load_config

class Scheduler:
    def __init__(self):
        self.scheduler = AsyncIOScheduler()
        self.logger = logging.getLogger(__name__)
        self.config = load_config()
        self.db = Database(self.config['database'].url)
        self.telegram_parser = TelegramParser(
            self.config['telegram'].api_id,
            self.config['telegram'].api_hash,
            self.config['telegram'].channel_username
        )
        self.vk_publisher = VKPublisher(
            self.config['vk'].access_token,
            self.config['vk'].group_id
        )
        self.last_post_id = 0
        
    async def start(self):
        """Запуск планировщика"""
        await self.telegram_parser.start()
        
        # Получаем ID последнего поста при старте
        self.last_post_id = await self.telegram_parser.get_latest_post_id()
        self.logger.info(f"Latest post ID: {self.last_post_id}")
        
        # Добавляем задачу проверки новых постов
        self.scheduler.add_job(
            self.check_new_posts,
            trigger=IntervalTrigger(seconds=self.config['app'].check_interval),
            id='check_posts',
            name='Check new posts',
            replace_existing=True
        )
        
        # Запускаем планировщик
        self.scheduler.start()
        self.logger.info("Scheduler started")
        
    async def stop(self):
        """Остановка планировщика"""
        self.scheduler.shutdown()
        await self.telegram_parser.stop()
        self.logger.info("Scheduler stopped")
        
    async def check_new_posts(self):
        """Проверка новых постов в Telegram канале"""
        try:
            self.logger.info("Checking for new posts...")
            
            # Получаем посты
            posts = await self.telegram_parser.get_posts(limit=20)
            
            new_posts = []
            for post in posts:
                if post['telegram_post_id'] > self.last_post_id:
                    new_posts.append(post)
                    self.last_post_id = post['telegram_post_id']
                    
            # Сортируем по дате (новые в начале)
            new_posts.sort(key=lambda x: x['post_date'], reverse=True)
            
            self.logger.info(f"Found {len(new_posts)} new posts")
            
            # Публикуем новые посты
            for post in new_posts:
                await self.publish_post(post)
                
        except Exception as e:
            self.logger.error(f"Error checking new posts: {e}")
            self.db.log('ERROR', f"Error checking new posts: {str(e)}")
            
    async def publish_post(self, post_data: Dict):
        """Публикация поста в VK"""
        try:
            # Сохраняем пост в базу данных
            post = self.db.save_post(post_data)
            
            self.logger.info(f"Saving post {post.telegram_post_id} to database")
            
            # Публикуем в VK
            vk_post_id = self.vk_publisher.publish_post(post_data)
            
            # Обновляем статус в базе
            self.db.update_post_status(post.id, 'published', vk_post_id)
            
            self.logger.info(f"Post {post.telegram_post_id} published to VK as {vk_post_id}")
            
        except Exception as e:
            self.logger.error(f"Error publishing post {post_data.get('telegram_post_id')}: {e}")
            self.db.log('ERROR', f"Error publishing post: {str(e)}")
            
    async def publish_all_pending(self):
        """Публикация всех отложенных постов"""
        try:
            posts = self.db.get_unpublished_posts(limit=50)
            
            if not posts:
                self.logger.info("No pending posts found")
                return
                
            self.logger.info(f"Found {len(posts)} pending posts")
            
            for post in posts:
                try:
                    post_data = post.to_dict()
                    await self.publish_post(post_data)
                except Exception as e:
                    self.logger.error(f"Error publishing post {post.telegram_post_id}: {e}")
                    self.db.update_post_status(post.id, 'failed')
                    
        except Exception as e:
            self.logger.error(f"Error publishing pending posts: {e}")
            self.db.log('ERROR', f"Error publishing pending posts: {str(e)}")