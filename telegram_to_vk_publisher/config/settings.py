import os
from pydantic_settings import BaseSettings

class TelegramConfig(BaseSettings):
    api_id: int
    api_hash: str
    channel_username: str = "NightGameCity"
    
    class Config:
        env_prefix = "TELEGRAM_"

class VKConfig(BaseSettings):
    access_token: str
    group_id: int
    
    class Config:
        env_prefix = "VK_"

class DatabaseConfig(BaseSettings):
    url: str = "sqlite:///./database/app.db"
    
    class Config:
        env_prefix = "DATABASE_"

class AppConfig(BaseSettings):
    check_interval: int = 300  # 5 minutes
    log_level: str = "INFO"
    download_dir: str = "./downloads"
    
    class Config:
        env_prefix = "APP_"

def load_config():
    return {
        'telegram': TelegramConfig(),
        'vk': VKConfig(),
        'database': DatabaseConfig(),
        'app': AppConfig()
    }