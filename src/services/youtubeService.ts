import axios from 'axios';

export interface YouTubeVideo {
  id: string;
  snippet: {
    title: string;
    description: string;
    channelId: string;
    channelTitle: string;
    publishedAt: string;
    tags?: string[];
    categoryId: string;
    liveBroadcastContent: string;
    defaultLanguage?: string;
    defaultAudioLanguage?: string;
  };
  status: {
    uploadStatus: string;
    privacyStatus: string;
    license: string;
    embeddable: boolean;
    publicStatsViewable: boolean;
  };
}

export interface YouTubeChannel {
  id: string;
  snippet: {
    title: string;
    description: string;
    customUrl?: string;
    publishedAt: string;
    thumbnails: {
      default: { url: string };
      medium: { url: string };
      high: { url: string };
    };
  };
}

export class YouTubeService {
  private static readonly YOUTUBE_API_BASE = 'https://www.googleapis.com/youtube/v3';
  private static readonly API_KEY = process.env.YOUTUBE_API_KEY;

  static async searchChannel(query: string): Promise<YouTubeChannel[]> {
    try {
      const response = await axios.get(`${this.YOUTUBE_API_BASE}/search`, {
        params: {
          part: 'snippet',
          q: query,
          type: 'channel',
          maxResults: 10,
          key: this.API_KEY
        }
      });

      return response.data.items.map((item: any) => ({
        id: item.id.channelId,
        snippet: item.snippet
      }));
    } catch (error) {
      throw new Error(`Failed to search YouTube channels: ${error.message}`);
    }
  }

  static async getChannelInfo(channelId: string): Promise<YouTubeChannel> {
    try {
      const response = await axios.get(`${this.YOUTUBE_API_BASE}/channels`, {
        params: {
          part: 'snippet',
          id: channelId,
          key: this.API_KEY
        }
      });

      if (response.data.items.length === 0) {
        throw new Error('Channel not found');
      }

      return {
        id: response.data.items[0].id,
        snippet: response.data.items[0].snippet
      };
    } catch (error) {
      throw new Error(`Failed to get channel info: ${error.message}`);
    }
  }

  static async uploadVideo(
    videoPath: string,
    title: string,
    description: string,
    channelId: string,
    accessToken: string
  ): Promise<YouTubeVideo> {
    try {
      const response = await axios.post(
        `${this.YOUTUBE_API_BASE}/videos?uploadType=resumable&part=snippet,status`,
        {
          snippet: {
            title,
            description,
            channelId,
            categoryId: '22',
            defaultLanguage: 'en',
            defaultAudioLanguage: 'en'
          },
          status: {
            privacyStatus: 'public',
            embeddable: true,
            publicStatsViewable: true
          }
        },
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
            'X-Upload-Content-Type': 'video/mp4',
            'X-Upload-Content-Length': '0'
          }
        }
      );

      const uploadUrl = response.data.uploadUrl;
      
      const uploadResponse = await axios.put(
        uploadUrl,
        videoPath,
        {
          headers: {
            'Content-Type': 'video/mp4',
            'Content-Length': '0'
          }
        }
      );

      return uploadResponse.data;
    } catch (error) {
      throw new Error(`Failed to upload video to YouTube: ${error.message}`);
    }
  }

  static async getVideoStatus(videoId: string, accessToken: string): Promise<YouTubeVideo> {
    try {
      const response = await axios.get(`${this.YOUTUBE_API_BASE}/videos`, {
        params: {
          part: 'snippet,status',
          id: videoId,
          key: this.API_KEY
        },
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      if (response.data.items.length === 0) {
        throw new Error('Video not found');
      }

      return response.data.items[0];
    } catch (error) {
      throw new Error(`Failed to get video status: ${error.message}`);
    }
  }
}