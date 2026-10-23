import asyncio
import logging
from telethon import TelegramClient
from telethon.tl.types import InputChannel
from typing import List, Dict, Optional
from datetime import datetime

class TelegramParser:
    def __init__(self, api_id: int, api_hash: str, channel_username: str):
        self.api_id = api_id
        self.api_hash = api_hash
        self.channel_username = channel_username
        self.client = TelegramClient('session_name', api_id, api_hash)
        self.logger = logging.getLogger(__name__)
        
    async def start(self):
        await self.client.start()
        
    async def stop(self):
        await self.client.disconnect()
        
    async def get_channel_entity(self):
        try:
            channel = await self.client.get_entity(self.channel_username)
            return channel
        except Exception as e:
            self.logger.error(f"Error getting channel entity: {e}")
            raise
            
    async def get_posts(self, limit: int = 10) -> List[Dict]:
        try:
            channel = await self.get_channel_entity()
            posts = await self.client.get_messages(channel, limit=limit)
            
            result = []
            for post in posts:
                post_data = {
                    'telegram_post_id': post.id,
                    'telegram_channel': self.channel_username,
                    'post_date': post.date,
                    'text': post.text,
                    'media_type': None,
                    'media_path': None
                }
                
                if post.media:
                    if hasattr(post.media, 'photo'):
                        post_data['media_type'] = 'photo'
                        # Сохраняем фото
                        file_path = await self._download_media(post)
                        post_data['media_path'] = file_path
                    elif hasattr(post.media, 'document'):
                        post_data['media_type'] = 'document'
                        file_path = await self._download_media(post)
                        post_data['media_path'] = file_path
                    elif hasattr(post.media, 'video'):
                        post_data['media_type'] = 'video'
                        file_path = await self._download_media(post)
                        post_data['media_path'] = file_path
                
                result.append(post_data)
                
            return result
            
        except Exception as e:
            self.logger.error(f"Error getting posts: {e}")
            raise
            
    async def _download_media(self, post) -> Optional[str]:
        try:
            if not post.media:
                return None
                
            # Определяем путь для сохранения
            media_type = 'unknown'
            if hasattr(post.media, 'photo'):
                media_type = 'photo'
            elif hasattr(post.media, 'document'):
                media_type = 'document'
            elif hasattr(post.media, 'video'):
                media_type = 'video'
                
            file_path = f"./downloads/{media_type}_{post.id}"
            
            # Скачиваем файл
            await self.client.download_media(post.media, file=file_path)
            
            self.logger.info(f"Downloaded media to {file_path}")
            return file_path
            
        except Exception as e:
            self.logger.error(f"Error downloading media: {e}")
            return None
            
    async def get_latest_post_id(self) -> int:
        try:
            channel = await self.get_channel_entity()
            posts = await self.client.get_messages(channel, limit=1)
            return posts[0].id if posts else 0
        except Exception as e:
            self.logger.error(f"Error getting latest post ID: {e}")
            return 0