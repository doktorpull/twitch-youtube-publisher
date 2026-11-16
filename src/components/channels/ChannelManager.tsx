'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Trash2, Edit } from 'lucide-react';

interface Channel {
  _id: string;
  name: string;
  twitchChannelId: string;
  youtubeChannelId: string;
  isActive: boolean;
  createdAt: string;
}

interface ChannelManagerProps {
  onChannelAdded?: () => void;
}

export default function ChannelManager({ onChannelAdded }: ChannelManagerProps) {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newChannel, setNewChannel] = useState({
    name: '',
    twitchChannelId: '',
    youtubeChannelId: '',
  });

  useEffect(() => {
    fetchChannels();
  }, []);

  const fetchChannels = async () => {
    try {
      const response = await fetch('/api/channels');
      const data = await response.json();
      setChannels(data);
    } catch (error) {
      console.error('Error fetching channels:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddChannel = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/channels', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newChannel),
      });

      if (response.ok) {
        setNewChannel({ name: '', twitchChannelId: '', youtubeChannelId: '' });
        setShowAddForm(false);
        fetchChannels();
        onChannelAdded?.();
      }
    } catch (error) {
      console.error('Error adding channel:', error);
    }
  };

  const handleDeleteChannel = async (id: string) => {
    try {
      const response = await fetch(`/api/channels/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchChannels();
      }
    } catch (error) {
      console.error('Error deleting channel:', error);
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
        <h2 className="text-2xl font-bold tracking-tight">Channel Management</h2>
        <Button onClick={() => setShowAddForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Channel
        </Button>
      </div>

      {showAddForm && (
        <Card>
          <CardHeader>
            <CardTitle>Add New Channel</CardTitle>
            <CardDescription>
              Connect a Twitch channel to your YouTube channel
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddChannel} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium">Channel Name</label>
                  <Input
                    value={newChannel.name}
                    onChange={(e) => setNewChannel({ ...newChannel, name: e.target.value })}
                    placeholder="My Channel"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Twitch Channel ID</label>
                  <Input
                    value={newChannel.twitchChannelId}
                    onChange={(e) => setNewChannel({ ...newChannel, twitchChannelId: e.target.value })}
                    placeholder="123456789"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">YouTube Channel ID</label>
                  <Input
                    value={newChannel.youtubeChannelId}
                    onChange={(e) => setNewChannel({ ...newChannel, youtubeChannelId: e.target.value })}
                    placeholder="UC..."
                    required
                  />
                </div>
              </div>
              <div className="flex space-x-2">
                <Button type="submit">Add Channel</Button>
                <Button type="button" variant="outline" onClick={() => setShowAddForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {channels.map((channel) => (
          <Card key={channel._id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{channel.name}</CardTitle>
                <div className="flex space-x-1">
                  <Button variant="outline" size="sm">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleDeleteChannel(channel._id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <CardDescription>
                Connected to Twitch and YouTube
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-medium">Twitch:</span> {channel.twitchChannelId}
                </div>
                <div>
                  <span className="font-medium">YouTube:</span> {channel.youtubeChannelId}
                </div>
                <div>
                  <span className="font-medium">Status:</span>{' '}
                  <span className={channel.isActive ? 'text-green-600' : 'text-red-600'}>
                    {channel.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {channels.length === 0 && (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              No channels configured. Add your first channel to get started.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}