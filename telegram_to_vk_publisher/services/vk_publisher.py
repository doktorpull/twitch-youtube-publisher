import requests
import json
import logging
from typing import List, Dict, Optional
from datetime import datetime

class VKPublisher:
    def __init__(self, access_token: str, group_id: int):
        self.access_token = access_token
        self.group_id = group_id
        self.base_url = "https://api.vk.com/method/"
        self.logger = logging.getLogger(__name__)
        
    def _make_request(self, method: str, params: dict) -> dict:
        try:
            url = f"{self.base_url}{method}"
            params['access_token'] = self.access_token
            params['v'] = '5.131'
            params['extended'] = '1'
            
            response = requests.get(url, params=params, timeout=30)
            response.raise_for_status()
            
            result = response.json()
            
            if 'error' in result:
                error = result['error']
                self.logger.error(f"VK API Error: {error['error_msg']} (code: {error['error_code']})")
                raise Exception(f"VK API Error: {error['error_msg']}")
                
            return result.get('response', {})
            
        except requests.RequestException as e:
            self.logger.error(f"Request failed: {e}")
            raise
        except json.JSONDecodeError as e:
            self.logger.error(f"JSON decode error: {e}")
            raise
            
    def upload_photo(self, file_path: str) -> str:
        """Загружает фото на сервер VK и возвращает attachment_id"""
        try:
            # Получаем URL для загрузки
            params = {
                'group_id': self.group_id
            }
            
            upload_server = self._make_request('photos.getWallUploadServer', params)
            upload_url = upload_server['upload_url']
            
            # Загружаем файл
            with open(file_path, 'rb') as file:
                files = {'file1': file}
                upload_response = requests.post(upload_url, files=files, timeout=60)
                upload_response.raise_for_status()
                
            upload_data = upload_response.json()
            
            # Сохраняем фото
            save_params = {
                'group_id': self.group_id,
                'photo': upload_data['photo'],
                'server': upload_data['server'],
                'hash': upload_data['hash']
            }
            
            save_result = self._make_request('photos.saveWallPhoto', save_params)
            
            # Возвращаем attachment_id
            photo_id = save_result[0]['id']
            owner_id = save_result[0]['owner_id']
            
            return f"photo{owner_id}_{photo_id}"
            
        except Exception as e:
            self.logger.error(f"Error uploading photo: {e}")
            raise
            
    def post_to_wall(self, message: str, attachments: List[str] = None) -> int:
        """Публикует пост на стене группы"""
        try:
            params = {
                'owner_id': -self.group_id,
                'from_group': 1,
                'message': message,
                'signed': 0
            }
            
            if attachments:
                params['attachments'] = ','.join(attachments)
                
            result = self._make_request('wall.post', params)
            
            post_id = result.get('post_id')
            if not post_id:
                raise Exception("No post_id in response")
                
            self.logger.info(f"Post published successfully with ID: {post_id}")
            return post_id
            
        except Exception as e:
            self.logger.error(f"Error posting to wall: {e}")
            raise
            
    def publish_post(self, post_data: Dict) -> int:
        """Публикует пост с обработкой медиа"""
        try:
            message = post_data.get('text', '')
            attachments = []
            
            # Обрабатываем медиа
            if post_data.get('media_path') and post_data.get('media_type'):
                media_path = post_data['media_path']
                media_type = post_data['media_type']
                
                if media_type == 'photo':
                    try:
                        attachment = self.upload_photo(media_path)
                        attachments.append(attachment)
                        self.logger.info(f"Photo uploaded: {attachment}")
                    except Exception as e:
                        self.logger.warning(f"Failed to upload photo {media_path}: {e}")
                        
            # Публикуем пост
            post_id = self.post_to_wall(message, attachments)
            
            return post_id
            
        except Exception as e:
            self.logger.error(f"Error publishing post: {e}")
            raise