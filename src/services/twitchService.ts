import axios from 'axios'

const TWITCH_CLIENT_ID = process.env.TWITCH_CLIENT_ID
const TWITCH_CLIENT_SECRET = process.env.TWITCH_CLIENT_SECRET

let twitchAccessToken: string | null = null
let tokenExpiry: number = 0

export const getTwitchAccessToken = async () => {
  if (twitchAccessToken && Date.now() < tokenExpiry) {
    return twitchAccessToken
  }

  try {
    const response = await axios.post('https://id.twitch.tv/oauth2/token', null, {
      params: {
        client_id: TWITCH_CLIENT_ID,
        client_secret: TWITCH_CLIENT_SECRET,
        grant_type: 'client_credentials'
      }
    })

    twitchAccessToken = response.data.access_token
    tokenExpiry = Date.now() + (response.data.expires_in * 1000)
    return twitchAccessToken
  } catch (error) {
    console.error('Error getting Twitch access token:', error)
    throw error
  }
}

export const getTwitchChannelVideos = async (channelId: string, cursor?: string) => {
  try {
    const token = await getTwitchAccessToken()
    
    const params: any = {
      broadcaster_id: channelId,
      first: 100
    }
    
    if (cursor) {
      params.after = cursor
    }

    const response = await axios.get('https://api.twitch.tv/helix/videos', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Client-ID': TWITCH_CLIENT_ID
      },
      params
    })

    return response.data
  } catch (error) {
    console.error('Error getting Twitch channel videos:', error)
    throw error
  }
}

export const getTwitchChannelInfo = async (channelId: string) => {
  try {
    const token = await getTwitchAccessToken()
    
    const response = await axios.get('https://api.twitch.tv/helix/channels', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Client-ID': TWITCH_CLIENT_ID
      },
      params: {
        broadcaster_id: channelId
      }
    })

    return response.data.data[0]
  } catch (error) {
    console.error('Error getting Twitch channel info:', error)
    throw error
  }
}