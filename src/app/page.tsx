import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dashboard } from '@/components/dashboard/Dashboard';
import { ChannelManager } from '@/components/channels/ChannelManager';
import { VideoManager } from '@/components/videos/VideoManager';
import { Settings, BarChart3, Video, Users } from 'lucide-react';

export default function HomePage() {
  const [activeTab, setActiveTab] = useState('dashboard');

  const tabs = [
    { id: 'dashboard', name: 'Dashboard', icon: BarChart3 },
    { id: 'videos', name: 'Videos', icon: Video },
    { id: 'channels', name: 'Channels', icon: Users },
    { id: 'settings', name: 'Settings', icon: Settings },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'videos':
        return <VideoManager />;
      case 'channels':
        return <ChannelManager />;
      case 'settings':
        return (
          <Card>
            <CardHeader>
              <CardTitle>Settings</CardTitle>
              <CardDescription>
                Configure your application settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">API Configuration</label>
                  <div className="mt-2 space-y-2">
                    <Input placeholder="YouTube API Key" />
                    <Input placeholder="Twitch Client ID" />
                    <Input placeholder="Twitch Client Secret" />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">Database Configuration</label>
                  <Input placeholder="MongoDB URI" className="mt-2" />
                </div>
                <Button>Save Settings</Button>
              </div>
            </CardContent>
          </Card>
        );
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Twitch to YouTube Publisher</h1>
            <div className="flex items-center space-x-4">
              <Input placeholder="Search..." className="w-64" />
              <Button variant="outline">Profile</Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <div className="flex space-x-6">
          {/* Sidebar */}
          <nav className="w-64 space-y-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 text-left rounded-lg transition-colors ${
                    activeTab === tab.id
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-muted'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{tab.name}</span>
                </button>
              );
            })}
          </nav>

          {/* Main Content */}
          <main className="flex-1">
            {renderContent()}
          </main>
        </div>
      </div>
    </div>
  );
}