'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'react-hot-toast'
import { Loader2, Twitch, YouTube } from 'lucide-react'

export default function AddChannelPage() {
  const [formData, setFormData] = useState({
    platform: 'twitch',
    platformId: '',
    title: '',
    autoPublish: false
  })
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.name === 'autoPublish' ? 
        (e.target as HTMLInputElement).checked : 
        e.target.value
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/channels', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (response.ok) {
        toast.success('Канал успешно добавлен!')
        router.push('/dashboard')
      } else {
        toast.error(data.error || 'Ошибка добавления канала')
      }
    } catch (error) {
      toast.error('Ошибка сети')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center px-4">
      <Card className="w-full max-w-2xl bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            {formData.platform === 'twitch' ? 
              <Twitch className="h-8 w-8 text-purple-500" /> : 
              <YouTube className="h-8 w-8 text-red-500" />
            }
            Добавить канал
          </CardTitle>
          <CardDescription>
            Подключите ваш {formData.platform === 'twitch' ? 'Twitch' : 'YouTube'} канал для автоматической публикации
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="platform">Платформа</Label>
              <select
                id="platform"
                name="platform"
                value={formData.platform}
                onChange={handleChange}
                className="w-full bg-gray-700 border-gray-600 text-white rounded-md px-3 py-2"
                disabled
              >
                <option value="twitch">Twitch</option>
                <option value="youtube">YouTube</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="platformId">ID канала</Label>
              <Input
                id="platformId"
                name="platformId"
                type="text"
                placeholder="channel-name или channel_id"
                value={formData.platformId}
                onChange={handleChange}
                required
                className="bg-gray-700 border-gray-600 text-white"
              />
              <p className="text-sm text-gray-400">
                {formData.platform === 'twitch' ? 
                  'Введите имя вашего Twitch канала' : 
                  'Введите ID вашего YouTube канала'
                }
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Название канала</Label>
              <Input
                id="title"
                name="title"
                type="text"
                placeholder="Название канала"
                value={formData.title}
                onChange={handleChange}
                required
                className="bg-gray-700 border-gray-600 text-white"
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                id="autoPublish"
                name="autoPublish"
                type="checkbox"
                checked={formData.autoPublish}
                onChange={handleChange}
                className="w-4 h-4 bg-gray-700 border-gray-600 rounded"
              />
              <Label htmlFor="autoPublish">Автоматическая публикация новых видео</Label>
            </div>

            <Button 
              type="submit" 
              className="w-full bg-purple-600 hover:bg-purple-700"
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Подключить канал
            </Button>
          </form>

          <div className="mt-6 p-4 bg-gray-700 rounded-lg">
            <h3 className="font-semibold mb-2">Как подключить канал:</h3>
            <ol className="list-decimal list-inside space-y-1 text-sm text-gray-300">
              <li>Убедитесь, что у вас есть доступ к каналу</li>
              <li>Введите правильный ID канала</li>
              <li>Разрешите доступ для публикации видео</li>
              <li>Настройте параметры публикации при необходимости</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}