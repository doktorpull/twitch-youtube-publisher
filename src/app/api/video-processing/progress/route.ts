import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import connectDB from '@/lib/mongodb'
import Video from '@/models/Video'

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    const { videoId, progress } = await request.json()
    
    if (!token || !videoId || progress === undefined) {
      return NextResponse.json({ error: 'Токен, ID видео и прогресс обязательны' }, { status: 400 })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default-secret') as any
    
    const video = await Video.findOne({ _id: videoId, userId: decoded.userId })
    if (!video) {
      return NextResponse.json({ error: 'Видео не найдено' }, { status: 404 })
    }

    video.processingProgress = progress
    if (progress >= 100) {
      video.status = 'published'
      video.publishedAt = new Date()
    }
    
    await video.save()

    return NextResponse.json({ message: 'Прогресс обновлен', video })

  } catch (error) {
    console.error('Update progress error:', error)
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 })
  }
}