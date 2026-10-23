import os
import shutil
from typing import Optional
from pathlib import Path

class MediaHandler:
    """Обработка медиа файлов"""
    
    def __init__(self, download_dir: str = "./downloads"):
        self.download_dir = Path(download_dir)
        self.download_dir.mkdir(exist_ok=True)
        
    def get_file_extension(self, file_path: str) -> str:
        """Получение расширения файла"""
        return Path(file_path).suffix.lower()
        
    def is_image_file(self, file_path: str) -> bool:
        """Проверка является ли файл изображением"""
        image_extensions = {'.jpg', '.jpeg', '.png', '.gif', '.webp'}
        return self.get_file_extension(file_path) in image_extensions
        
    def is_video_file(self, file_path: str) -> bool:
        """Проверка является ли файл видео"""
        video_extensions = {'.mp4', '.avi', '.mov', '.wmv', '.flv', '.webm'}
        return self.get_file_extension(file_path) in video_extensions
        
    def optimize_image(self, file_path: str, max_size: int = 50 * 1024 * 1024) -> Optional[str]:
        """Оптимизация изображения"""
        try:
            file_size = os.path.getsize(file_path)
            
            if file_size <= max_size:
                return file_path
                
            # Здесь можно добавить логику оптимизации
            # Например, использование библиотеки Pillow для уменьшения размера
            
            return file_path
            
        except Exception as e:
            print(f"Error optimizing image: {e}")
            return None
            
    def move_file_to_vk_dir(self, file_path: str, post_id: int) -> Optional[str]:
        """Перемещение файла в директорию для VK"""
        try:
            vk_dir = self.download_dir / "vk_uploads"
            vk_dir.mkdir(exist_ok=True)
            
            file_name = f"post_{post_id}_{Path(file_path).name}"
            new_path = vk_dir / file_name
            
            shutil.move(file_path, new_path)
            return str(new_path)
            
        except Exception as e:
            print(f"Error moving file: {e}")
            return None
            
    def cleanup_old_files(self, days: int = 7):
        """Очистка старых файлов"""
        try:
            cutoff_time = datetime.now().timestamp() - (days * 24 * 60 * 60)
            
            for file_path in self.download_dir.rglob("*"):
                if file_path.is_file() and file_path.stat().st_mtime < cutoff_time:
                    file_path.unlink()
                    print(f"Deleted old file: {file_path}")
                    
        except Exception as e:
            print(f"Error cleaning up files: {e}")

from datetime import datetime