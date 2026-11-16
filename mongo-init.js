// Инициализация MongoDB
db = db.getSiblingDB('twitch-yt');

// Создание коллекций
db.createCollection('users');
db.createCollection('channels');
db.createCollection('videos');

// Создание индексов
db.users.createIndex({ email: 1 }, { unique: true });
db.channels.createIndex({ userId: 1 });
db.channels.createIndex({ youtubeChannelId: 1 });
db.videos.createIndex({ userId: 1 });
db.videos.createIndex({ channelId: 1 });
db.videos.createIndex({ status: 1 });

// Создание администратора (опционально)
db.users.insertOne({
  email: 'admin@example.com',
  password: '$2b$12$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', // пароль: admin123
  createdAt: new Date()
});

print('Database initialized successfully');