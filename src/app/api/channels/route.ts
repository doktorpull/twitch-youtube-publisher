import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Channel } from '@/models/Channel';

export async function GET() {
  try {
    await connectToDatabase();
    const channels = await Channel.find({});
    return NextResponse.json(channels);
  } catch (error) {
    console.error('Error fetching channels:', error);
    return NextResponse.json({ error: 'Failed to fetch channels' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, twitchChannelId, youtubeChannelId } = await request.json();
    
    if (!name || !twitchChannelId || !youtubeChannelId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    await connectToDatabase();
    const channel = new Channel({
      name,
      twitchChannelId,
      youtubeChannelId,
      isActive: true,
      createdAt: new Date(),
    });

    await channel.save();
    return NextResponse.json(channel, { status: 201 });
  } catch (error) {
    console.error('Error creating channel:', error);
    return NextResponse.json({ error: 'Failed to create channel' }, { status: 500 });
  }
}