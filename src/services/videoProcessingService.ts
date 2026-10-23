import { spawn } from 'child_process';
import { promisify } from 'util';
import { Video } from '../models/Video';
import { Channel } from '../models/Channel';
import { TwitchService } from './twitchService';
import { YouTubeService } from './youtubeService';
import { createError } from '../middleware/errorHandler';

const exec = promisify(require('child_process').exec);

export class VideoProcessingService {
  static async processVideo(videoId: string) {
    try {
      const video = await Video.findById(videoId);
      if (!video) {
        throw createError('Video not found', 404);
      }

      video.status = 'processing';
      await video.save();

      const channel = await Channel.findById(video.channelId);
      if (!channel) {
        throw createError('Channel not found', 404);
      }

      const twitchVideoId = TwitchService.extractVideoId(video.twitchUrl);
      if (!twitchVideoId) {
        throw createError('Invalid Twitch URL', 400);
      }

      const twitchVideo = await TwitchService.getVideoInfo(twitchVideoId);
      
      const processedVideoPath = await this.processVideoFile(twitchVideo);
      
      const youtubeVideo = await YouTubeService.uploadVideo(
        processedVideoPath,
        video.title,
        video.description,
        channel.youtubeChannelId,
        channel.accessToken
      );

      video.youtubeVideoId = youtubeVideo.id;
      video.youtubeUrl = `https://www.youtube.com/watch?v=${youtubeVideo.id}`;
      video.status = 'uploaded';
      await video.save();

      return video;
    } catch (error) {
      video.status = 'failed';
      video.errorMessage = error.message;
      await video.save();
      throw error;
    }
  }

  private static async processVideoFile(twitchVideo: any): Promise<string> {
    const outputFileName = `processed_${twitchVideo.id}.mp4`;
    const outputPath = `./temp/${outputFileName}`;

    try {
      await exec(`mkdir -p ./temp`);

      const ffmpegCommand = `ffmpeg -i "${twitchVideo.url}" -c:v libx264 -preset fast -c:a aac -b:a 192k -movflags +faststart "${outputPath}"`;
      
      await exec(ffmpegCommand);

      return outputPath;
    } catch (error) {
      throw new Error(`Failed to process video: ${error.message}`);
    }
  }

  static async getProcessingProgress(videoId: string) {
    const video = await Video.findById(videoId);
    return video;
  }
}