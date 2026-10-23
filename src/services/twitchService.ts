import axios from 'axios';

export interface TwitchVideo {
  id: string;
  title: string;
  description: string;
  url: string;
  duration: number;
  created_at: string;
  game_id: string;
  user_id: string;
  user_name: string;
  view_count: number;
  language: string;
  thumbnail_url: string;
}

export class TwitchService {
  private static readonly TWITCH_API_BASE = 'https://api.twitch.tv/helix';
  private static readonly CLIENT_ID = process.env.TWITCH_CLIENT_ID;
  private static readonly CLIENT_SECRET = process.env.TWITCH_CLIENT_SECRET;

  static async getAccessToken(): Promise<string> {
    try {
      const response = await axios.post(
        'https://id.twitch.tv/oauth2/token',
        null,
        {
          params: {
            client_id: this.CLIENT_ID,
            client_secret: this.CLIENT_SECRET,
            grant_type: 'client_credentials'
          }
        }
      );
      return response.data.access_token;
    } catch (error) {
      throw new Error('Failed to get Twitch access token');
    }
  }

  static async getVideoInfo(videoId: string): Promise<TwitchVideo> {
    try {
      const accessToken = await this.getAccessToken();
      
      const response = await axios.get(`${this.TWITCH_API_BASE}/videos`, {
        headers: {
          'Client-ID': this.CLIENT_ID,
          'Authorization': `Bearer ${accessToken}`
        },
        params: {
          id: videoId
        }
      });

      if (response.data.data.length === 0) {
        throw new Error('Video not found');
      }

      return response.data.data[0];
    } catch (error) {
      throw new Error(`Failed to get video info: ${error.message}`);
    }
  }

  static extractVideoId(url: string): string | null {
    const twitchRegex = /twitch\.tv\/videos\/(\d+)/;
    const match = url.match(twitchRegex);
    return match ? match[1] : null;
  }

  static async downloadVideo(videoId: string): Promise<string> {
    throw new Error('Video downloading not implemented - using placeholder');
  }
}