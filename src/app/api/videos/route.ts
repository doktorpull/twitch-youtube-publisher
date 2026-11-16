import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Video } from '@/models/Video';

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const channelId = searchParams.get('channelId');
    
    const query = channelId ? { channelId } : {};
    const videos = await Video.find(query).sort({ createdAt: -1 });
    
    return NextResponse.json(videos);
  } catch (error) {
    console.error('Error fetching videos:', error);
    return NextResponse.json({ error: 'Failed to fetch videos' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { title, description, url, duration, thumbnailUrl, channelId, status } = await request.json();
    
    if (!title || !url || !channelId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    await connectToDatabase();
    const video = new Video({
      title,
      description: description || '',
      url,
      duration: duration || 0,
      thumbnailUrl: thumbnailUrl || '',
      channelId,
      status: status || 'pending',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await video.save();
    return NextResponse.json(video, { status: 201 });
  } catch (error) {
    console.error('Error creating video:', error);
    return NextResponse.json({ error: 'Failed to create video' }, { status: 500 });
  }
}