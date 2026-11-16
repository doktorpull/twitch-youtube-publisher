import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Home, Search, AlertCircle } from 'lucide-react'

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center px-4">
      <Card className="w-full max-w-md bg-gray-800 border-gray-700">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            <AlertCircle className="h-16 w-16 text-red-500" />
          </div>
          <CardTitle className="text-2xl">404 - Страница не найдена</CardTitle>
          <CardDescription>
            Извините, но запрашиваемая страница не существует.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-gray-400">
            Возможно, вы перешли по неверной ссылке или страница была перемещена.
          </p>
          <div className="flex gap-2 justify-center">
            <Link href="/">
              <Button variant="outline" className="flex items-center gap-2">
                <Home className="h-4 w-4" />
                На главную
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button variant="outline" className="flex items-center gap-2">
                <Search className="h-4 w-4" />
                Дашборд
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}