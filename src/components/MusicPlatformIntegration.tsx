import React, { useState, useEffect } from 'react';
import { Music, ExternalLink, Settings, Play, Pause, VolumeX, Volume2 } from 'lucide-react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { useToast } from '../hooks/use-toast';
import { useAudioContext } from '../hooks/use-audio-context';

interface MusicPlatform {
  id: string;
  name: string;
  icon: string;
  url: string;
  description: string;
}

const MusicPlatformIntegration: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<MusicPlatform | null>(null);
  const { shouldPauseMusic, isUploading, videoPlaying } = useAudioContext();
  const { toast } = useToast();

  // Show toast notifications when music state changes
  useEffect(() => {
    if (videoPlaying) {
      toast({
        title: "🎵 Music Paused",
        description: "Music automatically paused while video is playing",
        duration: 3000,
      });
    }
  }, [videoPlaying, toast]);

  useEffect(() => {
    if (isUploading) {
      toast({
        title: "🎵 Music Paused",
        description: "Music automatically paused during upload",
        duration: 3000,
      });
    }
  }, [isUploading, toast]);

  useEffect(() => {
    if (!shouldPauseMusic && !videoPlaying && !isUploading) {
      toast({
        title: "🎵 Music Resumed",
        description: "Music automatically resumed",
        duration: 2000,
      });
    }
  }, [shouldPauseMusic, videoPlaying, isUploading, toast]);

  const musicPlatforms: MusicPlatform[] = [
    {
      id: 'spotify',
      name: 'Spotify',
      icon: '🎵',
      url: 'https://open.spotify.com',
      description: 'Connect your Spotify account to listen while browsing'
    },
    {
      id: 'pandora',
      name: 'Pandora',
      icon: '🎵',
      url: 'https://www.pandora.com',
      description: 'Stream your favorite stations while shopping'
    },
    {
      id: 'applemusic',
      name: 'Apple Music',
      icon: '🎵',
      url: 'https://music.apple.com',
      description: 'Listen to your Apple Music library'
    },
    {
      id: 'youtube',
      name: 'YouTube Music',
      icon: '🎵',
      url: 'https://music.youtube.com',
      description: 'Stream music from YouTube Music'
    },
    {
      id: 'amazon',
      name: 'Amazon Music',
      icon: '🎵',
      url: 'https://music.amazon.com',
      description: 'Access your Amazon Music collection'
    },
    {
      id: 'tidal',
      name: 'Tidal',
      icon: '🎵',
      url: 'https://tidal.com',
      description: 'High-quality music streaming'
    }
  ];

  const handlePlatformSelect = (platform: MusicPlatform) => {
    setSelectedPlatform(platform);
    // Open the music platform in a new tab
    window.open(platform.url, '_blank');
  };

  const handleQuickPlay = () => {
    if (selectedPlatform) {
      window.open(selectedPlatform.url, '_blank');
    }
  };

  // Determine the icon and status based on current state
  const getStatusInfo = () => {
    if (videoPlaying) {
      return {
        icon: <VolumeX className="h-6 w-6 text-orange-400" />,
        status: "Music paused - Video playing",
        color: "from-orange-500 to-orange-600"
      };
    }
    if (isUploading) {
      return {
        icon: <VolumeX className="h-6 w-6 text-red-400" />,
        status: "Music paused - Uploading",
        color: "from-red-500 to-red-600"
      };
    }
    if (shouldPauseMusic) {
      return {
        icon: <VolumeX className="h-6 w-6 text-yellow-400" />,
        status: "Music paused",
        color: "from-yellow-500 to-yellow-600"
      };
    }
    return {
      icon: <Music className="h-6 w-6 text-green-400" />,
      status: "Music ready",
      color: "from-purple-500 to-purple-600"
    };
  };

  const statusInfo = getStatusInfo();

  return (
    <div className="fixed bottom-4 right-4 z-[10000]">
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className={`w-12 h-12 bg-gradient-to-r ${statusInfo.color} hover:from-purple-600 hover:to-purple-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110 relative`}
            title={statusInfo.status}
          >
            {statusInfo.icon}
            {/* Status indicator dot */}
            {(videoPlaying || isUploading || shouldPauseMusic) && (
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
            )}
          </Button>
        </DialogTrigger>
        
        <DialogContent className="bg-gray-900 border-gray-700 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-white flex items-center gap-2">
              <Music className="h-6 w-6" />
              Music While You Browse
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Status Display */}
            <div className="p-3 bg-gray-800 rounded-lg border border-gray-600">
              <div className="flex items-center gap-2">
                {statusInfo.icon}
                <span className="text-sm font-medium">{statusInfo.status}</span>
              </div>
              {(videoPlaying || isUploading) && (
                <p className="text-xs text-gray-400 mt-1">
                  {videoPlaying ? "Music will resume when video ends" : "Music will resume when upload completes"}
                </p>
              )}
            </div>

            <p className="text-gray-300 text-sm">
              Connect your favorite music platform to enjoy music while browsing TomaShops, just like Google Maps!
            </p>
            
            <div className="grid grid-cols-1 gap-3">
              {musicPlatforms.map((platform) => (
                <Button
                  key={platform.id}
                  variant="outline"
                  className="w-full justify-start bg-gray-800 border-gray-600 hover:bg-gray-700 hover:border-gray-500 text-white p-4 h-auto"
                  onClick={() => handlePlatformSelect(platform)}
                >
                  <div className="flex items-center gap-3 w-full">
                    <span className="text-2xl">{platform.icon}</span>
                    <div className="flex-1 text-left">
                      <div className="font-semibold">{platform.name}</div>
                      <div className="text-xs text-gray-400">{platform.description}</div>
                    </div>
                    <ExternalLink className="h-4 w-4 text-gray-400" />
                  </div>
                </Button>
              ))}
            </div>
            
            {selectedPlatform && (
              <div className="mt-4 p-3 bg-gray-800 rounded-lg border border-gray-600">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Quick Access</p>
                    <p className="text-xs text-gray-400">Open {selectedPlatform.name} in new tab</p>
                  </div>
                  <Button
                    size="sm"
                    onClick={handleQuickPlay}
                    className="bg-purple-600 hover:bg-purple-700 text-white"
                  >
                    <Play className="h-4 w-4 mr-1" />
                    Open
                  </Button>
                </div>
              </div>
            )}
            
            <div className="text-xs text-gray-500 text-center mt-4">
              💡 Tip: Music automatically pauses when videos play or during uploads!
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MusicPlatformIntegration; 