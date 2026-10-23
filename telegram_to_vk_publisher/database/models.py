from sqlalchemy import create_engine, Column, Integer, String, DateTime, Text, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from datetime import datetime

Base = declarative_base()

class Post(Base):
    __tablename__ = 'posts'
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    telegram_post_id = Column(Integer, unique=True, nullable=False)
    telegram_channel = Column(String, nullable=False)
    post_date = Column(DateTime, nullable=False)
    text = Column(Text)
    media_type = Column(String)
    media_path = Column(String)
    vk_post_id = Column(Integer)
    published_at = Column(DateTime)
    status = Column(String, default='pending')
    
    def to_dict(self):
        return {
            'id': self.id,
            'telegram_post_id': self.telegram_post_id,
            'telegram_channel': self.telegram_channel,
            'post_date': self.post_date.isoformat() if self.post_date else None,
            'text': self.text,
            'media_type': self.media_type,
            'media_path': self.media_path,
            'vk_post_id': self.vk_post_id,
            'published_at': self.published_at.isoformat() if self.published_at else None,
            'status': self.status
        }

class Log(Base):
    __tablename__ = 'logs'
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
    level = Column(String, nullable=False)
    message = Column(Text, nullable=False)
    details = Column(Text)

class Database:
    def __init__(self, database_url: str):
        self.engine = create_engine(database_url)
        self.SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=self.engine)
        Base.metadata.create_all(bind=self.engine)
    
    def get_session(self):
        return self.SessionLocal()
    
    def save_post(self, post_data: dict) -> Post:
        session = self.get_session()
        try:
            post = Post(**post_data)
            session.add(post)
            session.commit()
            session.refresh(post)
            return post
        except Exception as e:
            session.rollback()
            raise e
        finally:
            session.close()
    
    def get_unpublished_posts(self, limit: int = 10) -> list[Post]:
        session = self.get_session()
        try:
            posts = session.query(Post).filter(
                Post.status == 'pending'
            ).order_by(Post.post_date).limit(limit).all()
            return posts
        finally:
            session.close()
    
    def update_post_status(self, post_id: int, status: str, vk_post_id: int = None):
        session = self.get_session()
        try:
            post = session.query(Post).filter(Post.id == post_id).first()
            if post:
                post.status = status
                if vk_post_id:
                    post.vk_post_id = vk_post_id
                if status == 'published':
                    post.published_at = datetime.utcnow()
                session.commit()
        finally:
            session.close()
    
    def log(self, level: str, message: str, details: str = None):
        session = self.get_session()
        try:
            log_entry = Log(
                level=level,
                message=message,
                details=details
            )
            session.add(log_entry)
            session.commit()
        finally:
            session.close()