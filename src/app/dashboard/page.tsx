'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Twitch, YouTube, Plus, Settings, BarChart3, Upload } from 'lucide-react'
import { toast } from 'react-hot-toast'

interface User {
  id: string
  username: string
  email: string
}

interface Channel {
  _id: string
  platform: string
  title: string
  isActive: boolean
  settings: {
    autoPublish: boolean
  }
}

interface Video {
  _id: string
  title: string
  status: string
  platform: string
  createdAt: string
}

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null)
  const [channels, setChannels] = useState<Channel[]>([])
  const [videos, setVideos] = useState<Video[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
      return
    }

    const fetchData = async () => {
      try {
        const userRes = await fetch('/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` }
        })
        const userData = await userRes.json()
        setUser(userData)

        const channelsRes = await fetch('/api/channels', {
          headers: { Authorization: `Bearer ${token}` }
        })
        const channelsData = await channelsRes.json()
        setChannels(channelsData)

        const videosRes = await fetch('/api/videos', {
          headers: { Authorization: `Bearer ${token}` }
        })
        const videosData = await videosRes.json()
        setVideos(videosData)
      } catch (error) {
        toast.error('Ошибка загрузки данных')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [router])

  const handleAddChannel = () => {
    router.push('/channels/add')
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'text-green-400'
      case 'processing': return 'text-yellow-400'
      case 'failed': return 'text-red-400'
      default: return 'text-gray-400'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white">Загрузка...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <header className="bg-gray-800 border-b border-gray-700">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Дашборд</h1>
            <div className="flex items-center gap-4">
              <span>Добро пожаловать, {user?.username}</span>
              <Button variant="outline" onClick={() => {
                localStorage.removeItem('token')
                router.push('/')
              }}>
                Выйти
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Каналы</CardTitle>
              <Twitch className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{channels.length}</div>
              <p className="text-xs text-gray-400">Активных каналов</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Видео</CardTitle>
              <Upload className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{videos.length}</div>
              <p className="text-xs text-gray-400">Всего видео</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Опубликовано</CardTitle>
              <YouTube className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {videos.filter(v => v.status === 'published').length}
              </div>
              <p className="text-xs text-gray-400">Успешно опубликовано</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Мои каналы</CardTitle>
                <Button onClick={handleAddChannel} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Добавить
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {channels.length === 0 ? (
                <p className="text-gray-400 text-center py-4">Нет подключенных каналов</p>
              ) : (
                <div className="space-y-4">
                  {channels.map((channel) => (
                    <div key={channel._id} className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
                      <div className="flex items-center gap-3">
                        {channel.platform === 'twitch' ? (
                          <Twitch className="h-6 w-6 text-purple-500" />
                        ) : (
                          <YouTube className="h-6 w-6 text-red-500" />
                        )}
                        <div>
                          <p className="font-medium">{channel.title}</p>
                          <p className="text-sm text-gray-400">
                            {channel.platform === 'twitch' ? 'Twitch' : 'YouTube'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${channel.isActive ? 'bg-green-500' : 'bg-red-500'}`}></span>
                        <span className="text-sm text-gray-400">
                          {channel.isActive ? 'Активен' : 'Неактивен'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle>Последние видео</CardTitle>
            </CardHeader>
            <CardContent>
              {videos.length === 0 ? (
                <p className="text-gray-400 text-center py-4">Нет видео</p>
              ) : (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {videos.slice(0, 5).map((video) => (
                    <div key={video._id} className="p-4 bg-gray-700 rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <p className="font-medium truncate">{video.title}</p>
                        <span className={`text-xs px-2 py-1 rounded ${getStatusColor(video.status)}`}>
                          {video.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-400">
                        <span>{video.platform === 'twitch' ? 'Twitch' : 'YouTube'}</span>
                        <span>{new Date(video.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Настройки
              </CardTitle>
              <CardDescription>
                Управление настройками приложения
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Button className="w-full" variant="outline">
                  Настройки публикации
                </Button>
                <Button className="w-full" variant="outline">
                  Уведомления
                </Button>
                <Button className="w-full" variant="outline">
                  Безопасность
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Статистика
              </CardTitle>
              <CardDescription>
                Аналитика и статистика публикаций
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span>Просмотры за месяц</span>
                  <span className="font-medium">12,345</span>
                </div>
                <div className="flex justify-between">
                  <span>Новых подписчиков</span>
                  <span className="font-medium">234</span>
                </div>
                <div className="flex justify-between">
                  <span>Опубликовано видео</span>
                  <span className="font-medium">15</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}