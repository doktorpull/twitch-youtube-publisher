import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import connectDB from '@/lib/mongodb'
import Video from '@/models/Video'

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    const { videoId } = await request.json()
    
    if (!token || !videoId) {
      return NextResponse.json({ error: 'Токен и ID видео обязательны' }, { status: 400 })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default-secret') as any
    
    const video = await Video.findOne({ _id: videoId, userId: decoded.userId })
    if (!video) {
      return NextResponse.json({ error: 'Видео не найдено' }, { status: 404 })
    }

    video.status = 'processing'
    video.processingProgress = 0
    await video.save()

    return NextResponse.json({ message: 'Обработка начата', video })

  } catch (error) {
    console.error('Start processing error:', error)
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 })
  }
}