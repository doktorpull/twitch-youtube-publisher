import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Code, BookOpen, Settings, Github } from 'lucide-react'

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <header className="bg-gray-800 border-b border-gray-700">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-2xl font-bold flex items-center gap-2">
              <Code className="h-8 w-8 text-purple-500" />
              <span>Документация</span>
            </Link>
            <div className="flex gap-4">
              <Link href="/">
                <Button variant="outline">На главную</Button>
              </Link>
              <Link href="https://github.com/your-repo" target="_blank">
                <Button variant="outline">
                  <Github className="h-4 w-4 mr-2" />
                  GitHub
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">Документация Twitch to YouTube Publisher</h1>
            <p className="text-xl text-gray-300">
              Полное руководство по использованию и настройке приложения
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <BookOpen className="h-8 w-8 text-purple-500 mb-2" />
                <CardTitle>Начало работы</CardTitle>
                <CardDescription>
                  Базовая настройка и первые шаги
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <Settings className="h-8 w-8 text-blue-500 mb-2" />
                <CardTitle>Настройки</CardTitle>
                <CardDescription>
                  Конфигурация каналов и параметров
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <Code className="h-8 w-8 text-green-500 mb-2" />
                <CardTitle>API</CardTitle>
                <CardDescription>
                  Техническая документация API
                </CardDescription>
              </CardHeader>
            </Card>
          </div>

          <div className="space-y-8">
            <section>
              <h2 className="text-2xl font-bold mb-4">1. Установка</h2>
              <div className="bg-gray-800 p-6 rounded-lg">
                <h3 className="text-lg font-semibold mb-3">Клонируйте репозиторий</h3>
                <pre className="bg-gray-900 p-4 rounded text-sm overflow-x-auto">
                  <code>git clone https://github.com/your-repo/twitch-youtube-publisher.git</code>
                </pre>

                <h3 className="text-lg font-semibold mb-3 mt-4">Установите зависимости</h3>
                <pre className="bg-gray-900 p-4 rounded text-sm overflow-x-auto">
                  <code>cd twitch-youtube-publisher<br/>npm install</code>
                </pre>

                <h3 className="text-lg font-semibold mb-3 mt-4">Настройте переменные окружения</h3>
                <pre className="bg-gray-900 p-4 rounded text-sm overflow-x-auto">
                  <code>cp .env.example .env<br/>
# Отредактируйте .env файл с вашими ключами API</code>
                </pre>

                <h3 className="text-lg font-semibold mb-3 mt-4">Запустите приложение</h3>
                <pre className="bg-gray-900 p-4 rounded text-sm overflow-x-auto">
                  <code>npm run dev</code>
                </pre>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">2. Настройка API ключей</h2>
              <div className="bg-gray-800 p-6 rounded-lg space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-2">YouTube Data API</h3>
                  <p className="text-gray-300 mb-2">
                    1. Перейдите в Google Cloud Console
                  </p>
                  <p className="text-gray-300 mb-2">
                    2. Создайте новый проект или выберите существующий
                  </p>
                  <p className="text-gray-300 mb-2">
                    3. Включите YouTube Data API v3
                  </p>
                  <p className="text-gray-300 mb-2">
                    4. Создайте OAuth 2.0 credentials
                  </p>
                  <p className="text-gray-300">
                    5. Добавьте ключи в .env файл
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2">Twitch API</h3>
                  <p className="text-gray-300 mb-2">
                    1. Зарегистрируйте приложение на Twitch Developer Portal
                  </p>
                  <p className="text-gray-300 mb-2">
                    2. Настройте OAuth redirect URI
                  </p>
                  <p className="text-gray-300 mb-2">
                    3. Получите Client ID и Client Secret
                  </p>
                  <p className="text-gray-300">
                    4. Добавьте ключи в .env файл
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">3. Использование</h2>
              <div className="bg-gray-800 p-6 rounded-lg space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-2">1. Регистрация и вход</h3>
                  <p className="text-gray-300">
                    Создайте аккаунт или войдите в существующий. После входа вы попадете на дашборд.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2">2. Добавление каналов</h3>
                  <p className="text-gray-300">
                    В дашборде нажмите "Добавить канал" и выберите платформу (Twitch или YouTube).
                    Введите ID канала и настройте параметры публикации.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2">3. Настройка публикации</h3>
                  <p className="text-gray-300">
                    Для каждого канала вы можете настроить:
                  </p>
                  <ul className="list-disc list-inside text-gray-300 ml-4">
                    <li>Автоматическую публикацию новых видео</li>
                    <li>Плейлист для публикации</li>
                    <li>Теги и категории</li>
                    <li>Приватность видео</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2">4. Мониторинг</h3>
                  <p className="text-gray-300">
                    Система автоматически отслеживает новые видео на Twitch каналах и публикует их на YouTube.
                    Вы можете отслеживать статус обработки каждого видео в дашборде.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">4. API endpoints</h2>
              <div className="bg-gray-800 p-6 rounded-lg">
                <h3 className="text-lg font-semibold mb-4">Аутентификация</h3>
                <div className="space-y-3">
                  <div className="bg-gray-900 p-4 rounded">
                    <code className="text-purple-400">POST /api/auth/register</code>
                    <p className="text-gray-300 text-sm mt-1">Регистрация нового пользователя</p>
                  </div>
                  <div className="bg-gray-900 p-4 rounded">
                    <code className="text-purple-400">POST /api/auth/login</code>
                    <p className="text-gray-300 text-sm mt-1">Вход в систему</p>
                  </div>
                </div>

                <h3 className="text-lg font-semibold mb-4 mt-6">Каналы</h3>
                <div className="space-y-3">
                  <div className="bg-gray-900 p-4 rounded">
                    <code className="text-purple-400">GET /api/channels</code>
                    <p className="text-gray-300 text-sm mt-1">Получить список каналов</p>
                  </div>
                  <div className="bg-gray-900 p-4 rounded">
                    <code className="text-purple-400">POST /api/channels</code>
                    <p className="text-gray-300 text-sm mt-1">Добавить новый канал</p>
                  </div>
                </div>

                <h3 className="text-lg font-semibold mb-4 mt-6">Видео</h3>
                <div className="space-y-3">
                  <div className="bg-gray-900 p-4 rounded">
                    <code className="text-purple-400">GET /api/videos</code>
                    <p className="text-gray-300 text-sm mt-1">Получить список видео</p>
                  </div>
                  <div className="bg-gray-900 p-4 rounded">
                    <code className="text-purple-400">POST /api/videos</code>
                    <p className="text-gray-300 text-sm mt-1">Создать новую запись видео</p>
                  </div>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">5. Развертывание</h2>
              <div className="bg-gray-800 p-6 rounded-lg">
                <h3 className="text-lg font-semibold mb-3">VPS сервер</h3>
                <p className="text-gray-300 mb-4">
                  Для развертывания на VPS сервере выполните следующие шаги:
                </p>
                <ol className="list-decimal list-inside text-gray-300 space-y-2">
                  <li>Установите Node.js и MongoDB на сервер</li>
                  <li>Скопируйте проект на сервер</li>
                  <li>Установите зависимости: npm install</li>
                  <li>Настройте переменные окружения</li>
                  <li>Соберите проект: npm run build</li>
                  <li>Запустите в продакшене: npm start</li>
                  <li>Настройте reverse proxy (Nginx)</li>
                  <li>Настройте SSL сертификат</li>
                </ol>
              </div>
            </section>
          </div>
        </div>
      </main>

      <footer className="bg-gray-800 border-t border-gray-700 mt-16">
        <div className="container mx-auto px-4 py-8 text-center text-gray-400">
          <p>&copy; 2024 Twitch to YouTube Publisher. Все права защищены.</p>
        </div>
      </footer>
    </div>
  )
}