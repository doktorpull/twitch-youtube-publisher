'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { VideoProcessing } from '@/components/VideoProcessing'
import { toast } from 'react-hot-toast'
import { Twitch, YouTube, Search, Filter, Plus } from 'lucide-react'

interface Video {
  _id: string
  title: string
  status: string
  platform: string
  url: string
  createdAt: string
  channelId: {
    title: string
    platform: string
  }
}

interface FilterState {
  platform: string
  status: string
  search: string
}

export default function VideosPage() {
  const [videos, setVideos] = useState<Video[]>([])
  const [filteredVideos, setFilteredVideos] = useState<Video[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState<FilterState>({
    platform: '',
    status: '',
    search: ''
  })
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
      return
    }

    fetchVideos()
  }, [router])

  useEffect(() => {
    applyFilters()
  }, [videos, filters])

  const fetchVideos = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/videos', {
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await response.json()
      setVideos(data.videos || [])
    } catch (error) {
      toast.error('Ошибка загрузки видео')
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = () => {
    let filtered = [...videos]

    if (filters.platform) {
      filtered = filtered.filter(video => video.platform === filters.platform)
    }

    if (filters.status) {
      filtered = filtered.filter(video => video.status === filters.status)
    }

    if (filters.search) {
      filtered = filtered.filter(video => 
        video.title.toLowerCase().includes(filters.search.toLowerCase())
      )
    }

    setFilteredVideos(filtered)
  }

  const handleFilterChange = (key: keyof FilterState, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'text-green-400'
      case 'processing': return 'text-yellow-400'
      case 'failed': return 'text-red-400'
      default: return 'text-gray-400'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Ожидает'
      case 'processing': return 'Обрабатывается'
      case 'published': return 'Опубликовано'
      case 'failed': return 'Ошибка'
      default: return status
    }
  }

  const getPlatformIcon = (platform: string) => {
    return platform === 'twitch' ? 
      <Twitch className="h-5 w-5 text-purple-500" /> : 
      <YouTube className="h-5 w-5 text-red-500" />
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white">Загрузка видео...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <header className="bg-gray-800 border-b border-gray-700">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Управление видео</h1>
            <div className="flex gap-4">
              <Button onClick={() => router.push('/dashboard')}>
                Назад
              </Button>
              <Button onClick={() => router.push('/videos/upload')}>
                <Plus className="h-4 w-4 mr-2" />
                Загрузить видео
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Фильтры */}
        <Card className="bg-gray-800 border-gray-700 mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Фильтры
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Платформа</label>
                <select
                  value={filters.platform}
                  onChange={(e) => handleFilterChange('platform', e.target.value)}
                  className="w-full bg-gray-700 border-gray-600 text-white rounded-md px-3 py-2"
                >
                  <option value="">Все платформы</option>
                  <option value="twitch">Twitch</option>
                  <option value="youtube">YouTube</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Статус</label>
                <select
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="w-full bg-gray-700 border-gray-600 text-white rounded-md px-3 py-2"
                >
                  <option value="">Все статусы</option>
                  <option value="pending">Ожидает</option>
                  <option value="processing">Обрабатывается</option>
                  <option value="published">Опубликовано</option>
                  <option value="failed">Ошибка</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Поиск</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Поиск по названию..."
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                    className="pl-10 bg-gray-700 border-gray-600 text-white"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Статистика */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-4">
              <div className="text-2xl font-bold">{videos.length}</div>
              <p className="text-sm text-gray-400">Всего видео</p>
            </CardContent>
          </Card>
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-400">
                {videos.filter(v => v.status === 'published').length}
              </div>
              <p className="text-sm text-gray-400">Опубликовано</p>
            </CardContent>
          </Card>
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-yellow-400">
                {videos.filter(v => v.status === 'processing').length}
              </div>
              <p className="text-sm text-gray-400">В обработке</p>
            </CardContent>
          </Card>
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-red-400">
                {videos.filter(v => v.status === 'failed').length}
              </div>
              <p className="text-sm text-gray-400">Ошибки</p>
            </CardContent>
          </Card>
        </div>

        {/* Список видео */}
        <div className="space-y-4">
          {filteredVideos.length === 0 ? (
            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-8 text-center">
                <p className="text-gray-400">Видео не найдены</p>
              </CardContent>
            </Card>
          ) : (
            filteredVideos.map((video) => (
              <Card key={video._id} className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      {getPlatformIcon(video.platform)}
                      <div>
                        <CardTitle className="text-lg">{video.title}</CardTitle>
                        <CardDescription>
                          Канал: {video.channelId.title} • {new Date(video.createdAt).toLocaleDateString()}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded text-sm ${getStatusColor(video.status)}`}>
                        {getStatusText(video.status)}
                      </span>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => window.open(video.url, '_blank')}
                      >
                        Открыть
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {video.status === 'processing' || video.status === 'pending' ? (
                    <VideoProcessing
                      videoId={video._id}
                      title={video.title}
                      initialProgress={video.status === 'processing' ? 50 : 0}
                      status={video.status as any}
                    />
                  ) : (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-400">
                        {video.status === 'published' ? 'Опубликовано' : 'Ошибка обработки'}
                      </span>
                      {video.status === 'published' && (
                        <Button variant="outline" size="sm">
                          Просмотреть на YouTube
                        </Button>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </main>
    </div>
  )
}