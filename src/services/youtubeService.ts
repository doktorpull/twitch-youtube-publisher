import axios from 'axios'

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY

export const getYouTubeAccessToken = async (refreshToken: string) => {
  try {
    const response = await axios.post('https://oauth2.googleapis.com/token', {
      client_id: process.env.YOUTUBE_CLIENT_ID,
      client_secret: process.env.YOUTUBE_CLIENT_SECRET,
      refresh_token: refreshToken,
      grant_type: 'refresh_token'
    })

    return response.data.access_token
  } catch (error) {
    console.error('Error getting YouTube access token:', error)
    throw error
  }
}

export const uploadYouTubeVideo = async (accessToken: string, videoData: {
  title: string
  description: string
  tags: string[]
  categoryId: string
  privacyStatus: string
  filePath: string
}) => {
  try {
    // First, create video snippet
    const snippetResponse = await axios.post(
      'https://www.googleapis.com/upload/youtube/v3/videos?part=snippet,status',
      {
        snippet: {
          title: videoData.title,
          description: videoData.description,
          tags: videoData.tags,
          categoryId: videoData.categoryId,
          defaultLanguage: 'ru',
          defaultAudioLanguage: 'ru'
        },
        status: {
          privacyStatus: videoData.privacyStatus,
          selfDeclaredMadeForKids: false
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    )

    const videoId = snippetResponse.data.id

    // Then upload the video file
    const formData = new FormData()
    formData.append('file', videoData.filePath)

    await axios.post(
      `https://www.googleapis.com/upload/youtube/v3/videos?part=snippet,status&uploadType=resumable`,
      formData,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'multipart/form-data'
        }
      }
    )

    return videoId
  } catch (error) {
    console.error('Error uploading YouTube video:', error)
    throw error
  }
}

export const getYouTubePlaylists = async (accessToken: string, channelId: string) => {
  try {
    const response = await axios.get('https://www.googleapis.com/youtube/v3/playlists', {
      params: {
        part: 'snippet',
        channelId: channelId,
        maxResults: 50,
        mine: true
      },
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    })

    return response.data.items
  } catch (error) {
    console.error('Error getting YouTube playlists:', error)
    throw error
  }
}