'use client'

import { useEffect, useState } from 'react'
import { Progress } from '@/components/ui/progress'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Play, Pause, RotateCcw } from 'lucide-react'

interface VideoProcessingProps {
  videoId: string
  title: string
  initialProgress?: number
  status?: 'pending' | 'processing' | 'published' | 'failed'
}

export default function VideoProcessing({ 
  videoId, 
  title, 
  initialProgress = 0,
  status = 'pending'
}: VideoProcessingProps) {
  const [progress, setProgress] = useState(initialProgress)
  const [currentStatus, setCurrentStatus] = useState(status)
  const [isProcessing, setIsProcessing] = useState(false)
  const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null)

  const startProcessing = async () => {
    setIsProcessing(true)
    setCurrentStatus('processing')
    
    const id = setInterval(async () => {
      try {
        const response = await fetch(`/api/video-processing/start`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({ videoId })
        })

        if (response.ok) {
          // Simulate progress
          setProgress(prev => {
            const newProgress = Math.min(prev + Math.random() * 15, 100)
            if (newProgress >= 100) {
              clearInterval(id)
              setIsProcessing(false)
              setCurrentStatus('published')
            }
            return Math.round(newProgress)
          })
        }
      } catch (error) {
        console.error('Error processing video:', error)
        clearInterval(id)
        setIsProcessing(false)
        setCurrentStatus('failed')
      }
    }, 2000)

    setIntervalId(id)
  }

  const pauseProcessing = () => {
    if (intervalId) {
      clearInterval(intervalId)
      setIntervalId(null)
      setIsProcessing(false)
    }
  }

  const resetProcessing = () => {
    if (intervalId) {
      clearInterval(intervalId)
    }
    setProgress(0)
    setCurrentStatus('pending')
    setIsProcessing(false)
    setIntervalId(null)
  }

  useEffect(() => {
    return () => {
      if (intervalId) {
        clearInterval(intervalId)
      }
    }
  }, [intervalId])

  const getStatusColor = () => {
    switch (currentStatus) {
      case 'published': return 'text-green-400'
      case 'processing': return 'text-yellow-400'
      case 'failed': return 'text-red-400'
      default: return 'text-gray-400'
    }
  }

  const getStatusText = () => {
    switch (currentStatus) {
      case 'pending': return 'Ожидает обработки'
      case 'processing': return 'Обрабатывается'
      case 'published': return 'Опубликовано'
      case 'failed': return 'Ошибка обработки'
      default: return 'Неизвестно'
    }
  }

  return (
    <Card className="w-full bg-gray-800 border-gray-700">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">{title}</CardTitle>
            <CardDescription className={`flex items-center gap-2 mt-1`}>
              <span className={getStatusColor()}>{getStatusText()}</span>
              {currentStatus === 'processing' && (
                <span className="text-yellow-400">• {progress}%</span>
              )}
            </CardDescription>
          </div>
          <div className="flex gap-2">
            {currentStatus === 'pending' && (
              <Button 
                onClick={startProcessing}
                disabled={isProcessing}
                size="sm"
              >
                <Play className="h-4 w-4 mr-2" />
                Начать
              </Button>
            )}
            
            {currentStatus === 'processing' && (
              <Button 
                onClick={pauseProcessing}
                variant="outline"
                size="sm"
              >
                <Pause className="h-4 w-4 mr-2" />
                Пауза
              </Button>
            )}
            
            {(currentStatus === 'processing' || currentStatus === 'failed') && (
              <Button 
                onClick={resetProcessing}
                variant="outline"
                size="sm"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Сброс
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {currentStatus === 'processing' && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Прогресс обработки</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        )}
        
        {currentStatus === 'failed' && (
          <div className="text-red-400 text-sm">
            Произошла ошибка при обработке видео. Попробуйте снова.
          </div>
        )}
        
        {currentStatus === 'published' && (
          <div className="text-green-400 text-sm flex items-center gap-2">
            <span>✓</span>
            <span>Видео успешно опубликовано!</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}