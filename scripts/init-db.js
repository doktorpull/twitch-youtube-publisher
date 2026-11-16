import { connectDB } from '@/lib/mongodb'
import User from '@/models/User'
import Channel from '@/models/Channel'
import Video from '@/models/Video'

async function initializeDatabase() {
  try {
    await connectDB()
    console.log('Connected to MongoDB')

    // Check if admin user exists
    const adminUser = await User.findOne({ email: 'admin@example.com' })
    if (!adminUser) {
      const admin = new User({
        username: 'admin',
        email: 'admin@example.com',
        password: 'admin123' // In production, use a proper hashed password
      })
      await admin.save()
      console.log('Admin user created')
    } else {
      console.log('Admin user already exists')
    }

    // Create sample channels
    const sampleChannels = [
      {
        userId: 'admin@example.com', // This should be the actual user ID
        platform: 'twitch',
        platformId: 'samplechannel',
        title: 'Sample Twitch Channel',
        isActive: true,
        settings: {
          autoPublish: true,
          tags: ['gaming', 'streaming'],
          category: 'Gaming'
        }
      },
      {
        userId: 'admin@example.com',
        platform: 'youtube',
        platformId: 'UC_sample_id',
        title: 'Sample YouTube Channel',
        isActive: true,
        settings: {
          autoPublish: false,
          privacy: 'public'
        }
      }
    ]

    for (const channelData of sampleChannels) {
      const existingChannel = await Channel.findOne({
        userId: channelData.userId,
        platform: channelData.platform,
        platformId: channelData.platformId
      })

      if (!existingChannel) {
        const channel = new Channel(channelData)
        await channel.save()
        console.log(`Created ${channel.platform} channel: ${channel.title}`)
      }
    }

    // Create sample videos
    const sampleVideos = [
      {
        userId: 'admin@example.com',
        channelId: 'sample_channel_id', // This should be the actual channel ID
        platform: 'twitch',
        platformId: 'video123',
        title: 'Sample Twitch Stream',
        description: 'This is a sample Twitch stream',
        url: 'https://www.twitch.tv/videos/123456789',
        status: 'published',
        metadata: {
          game: 'Just Chatting',
          tags: ['stream', 'chat']
        }
      },
      {
        userId: 'admin@example.com',
        channelId: 'sample_channel_id',
        platform: 'twitch',
        platformId: 'video456',
        title: 'Gaming Stream - Fortnite',
        description: 'Playing Fortnite with friends',
        url: 'https://www.twitch.tv/videos/987654321',
        status: 'processing',
        processingProgress: 50,
        metadata: {
          game: 'Fortnite',
          tags: ['gaming', 'fortnite']
        }
      }
    ]

    for (const videoData of sampleVideos) {
      const existingVideo = await Video.findOne({
        userId: videoData.userId,
        platformId: videoData.platformId
      })

      if (!existingVideo) {
        const video = new Video(videoData)
        await video.save()
        console.log(`Created ${video.platform} video: ${video.title}`)
      }
    }

    console.log('Database initialization completed!')
  } catch (error) {
    console.error('Database initialization error:', error)
  } finally {
    process.exit()
  }
}

initializeDatabase()