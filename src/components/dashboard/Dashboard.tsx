'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Video, Users, TrendingUp, Clock } from 'lucide-react';

interface DashboardStats {
  totalVideos: number;
  totalChannels: number;
  processingVideos: number;
  completedVideos: number;
}

interface RecentVideo {
  _id: string;
  title: string;
  status: string;
  createdAt: string;
  channel: {
    name: string;
  };
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalVideos: 0,
    totalChannels: 0,
    processingVideos: 0,
    completedVideos: 0,
  });
  
  const [recentVideos, setRecentVideos] = useState<RecentVideo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
    fetchRecentVideos();
  }, []);

  const fetchStats = async () => {
    try {
      const [videosRes, channelsRes] = await Promise.all([
        fetch('/api/videos'),
        fetch('/api/channels')
      ]);
      
      const videos = await videosRes.json();
      const channels = await channelsRes.json();
      
      const processingVideos = videos.filter((v: any) => v.status === 'processing').length;
      const completedVideos = videos.filter((v: any) => v.status === 'completed').length;
      
      setStats({
        totalVideos: videos.length,
        totalChannels: channels.length,
        processingVideos,
        completedVideos,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentVideos = async () => {
    try {
      const response = await fetch('/api/videos?limit=5');
      const videos = await response.json();
      setRecentVideos(videos.slice(0, 5));
    } catch (error) {
      console.error('Error fetching recent videos:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600';
      case 'processing':
        return 'text-blue-600';
      case 'pending':
        return 'text-yellow-600';
      default:
        return 'text-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <Button onClick={fetchStats} variant="outline">
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Videos</CardTitle>
            <Video className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalVideos}</div>
            <p className="text-xs text-muted-foreground">
              Across all channels
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Channels</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalChannels}</div>
            <p className="text-xs text-muted-foreground">
              Connected to Twitch
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Processing</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.processingVideos}</div>
            <p className="text-xs text-muted-foreground">
              Videos in progress
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completedVideos}</div>
            <p className="text-xs text-muted-foreground">
              Successfully published
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Videos */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Videos</CardTitle>
          <CardDescription>
            Latest videos being processed
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentVideos.length === 0 ? (
              <p className="text-sm text-muted-foreground">No videos found</p>
            ) : (
              recentVideos.map((video) => (
                <div key={video._id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-1">
                    <p className="font-medium">{video.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {video.channel.name} • {new Date(video.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`text-sm font-medium ${getStatusColor(video.status)}`}>
                      {video.status}
                    </span>
                    <Progress value={video.status === 'completed' ? 100 : video.status === 'processing' ? 50 : 0} className="w-24" />
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}