import { Request, Response } from 'express';
import { Channel } from '../models/Channel';
import { authenticate } from '../middleware/auth';
import { createError } from '../middleware/errorHandler';

export const getChannels = async (req: Request, res: Response) => {
  try {
    const channels = await Channel.find({ userId: req.user!.id });
    res.json(channels);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const addChannel = async (req: Request, res: Response) => {
  try {
    const { youtubeChannelId, youtubeChannelName, accessToken, refreshToken } = req.body;

    if (!youtubeChannelId || !youtubeChannelName || !accessToken) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const existingChannel = await Channel.findOne({ 
      userId: req.user!.id, 
      youtubeChannelId 
    });
    
    if (existingChannel) {
      return res.status(400).json({ message: 'Channel already exists' });
    }

    const channel = new Channel({
      userId: req.user!.id,
      youtubeChannelId,
      youtubeChannelName,
      accessToken,
      refreshToken
    });

    await channel.save();
    res.status(201).json({ message: 'Channel added successfully', channel });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateChannel = async (req: Request, res: Response) => {
  try {
    const { channelId } = req.params;
    const { accessToken, refreshToken, isActive } = req.body;

    const channel = await Channel.findOneAndUpdate(
      { _id: channelId, userId: req.user!.id },
      { accessToken, refreshToken, isActive },
      { new: true }
    );

    if (!channel) {
      return res.status(404).json({ message: 'Channel not found' });
    }

    res.json({ message: 'Channel updated successfully', channel });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const deleteChannel = async (req: Request, res: Response) => {
  try {
    const { channelId } = req.params;

    const channel = await Channel.findOneAndDelete({ 
      _id: channelId, 
      userId: req.user!.id 
    });

    if (!channel) {
      return res.status(404).json({ message: 'Channel not found' });
    }

    res.json({ message: 'Channel deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};