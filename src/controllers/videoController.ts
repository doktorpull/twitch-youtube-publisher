import { Request, Response } from 'express';
import { Video } from '../models/Video';
import { authenticate } from '../middleware/auth';
import { createError } from '../middleware/errorHandler';

export const uploadVideo = async (req: Request, res: Response) => {
  try {
    const { twitchUrl, title, description, channelId } = req.body;

    if (!twitchUrl || !title || !description || !channelId) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const channelExists = await Video.findOne({ _id: channelId, userId: req.user!.id });
    if (!channelExists) {
      return res.status(404).json({ message: 'Channel not found' });
    }

    const video = new Video({
      userId: req.user!.id,
      twitchUrl,
      title,
      description,
      channelId
    });

    await video.save();
    res.status(201).json({ message: 'Video uploaded successfully', video });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const getVideos = async (req: Request, res: Response) => {
  try {
    const videos = await Video.find({ userId: req.user!.id })
      .sort({ createdAt: -1 });
    res.json(videos);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const getVideoStatus = async (req: Request, res: Response) => {
  try {
    const { videoId } = req.params;
    
    const video = await Video.findOne({ 
      _id: videoId, 
      userId: req.user!.id 
    });

    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }

    res.json(video);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const cancelVideo = async (req: Request, res: Response) => {
  try {
    const { videoId } = req.params;
    
    const video = await Video.findOneAndUpdate(
      { _id: videoId, userId: req.user!.id },
      { status: 'failed', errorMessage: 'Cancelled by user' },
      { new: true }
    );

    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }

    res.json({ message: 'Video cancelled successfully', video });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};