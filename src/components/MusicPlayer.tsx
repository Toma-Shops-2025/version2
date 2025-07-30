import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Play, 
  Pause, 
  SkipForward, 
  Volume2, 
  VolumeX,
  Music,
  X
} from 'lucide-react';
import { useAppContext } from '@/contexts/AppContext';
import { useAudioContext } from '@/hooks/use-audio-context';

interface MusicPlayerProps {
  onAudioStateChange?: (isPlaying: boolean) => void;
}

const MusicPlayer: React.FC<MusicPlayerProps> = ({ onAudioStateChange }) => {
  const { user } = useAppContext();
  const { setMusicPlaying, shouldPauseMusic } = useAudioContext();
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentGenre, setCurrentGenre] = useState<string>('');
  const [volume, setVolume] = useState(0.3);
  const [isMuted, setIsMuted] = useState(false);
  const [showPlayer, setShowPlayer] = useState(false);
  const [currentTrack, setCurrentTrack] = useState<any>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const genres = [
    { id: 'country', name: 'COUNTRY', color: 'bg-green-500' },
    { id: 'rock', name: 'ROCK', color: 'bg-red-500' },
    { id: 'hiphop', name: 'HIP HOP', color: 'bg-purple-500' },
    { id: 'rnb', name: 'R&B', color: 'bg-blue-500' },
    { id: 'countryrap', name: 'COUNTRY RAP', color: 'bg-orange-500' }
  ];

  // Sample music tracks for each genre (in production, you'd use a real music API)
  const sampleTracks = {
    country: [
      { title: 'Country Roads', artist: 'Country Vibes', url: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav' },
      { title: 'Southern Nights', artist: 'Country Vibes', url: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav' }
    ],
    rock: [
      { title: 'Rock Anthem', artist: 'Rock Vibes', url: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav' },
      { title: 'Electric Dreams', artist: 'Rock Vibes', url: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav' }
    ],
    hiphop: [
      { title: 'Urban Flow', artist: 'Hip Hop Vibes', url: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav' },
      { title: 'Street Beats', artist: 'Hip Hop Vibes', url: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav' }
    ],
    rnb: [
      { title: 'Smooth R&B', artist: 'R&B Vibes', url: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav' },
      { title: 'Soulful Nights', artist: 'R&B Vibes', url: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav' }
    ],
    countryrap: [
      { title: 'Country Rap Fusion', artist: 'Country Rap Vibes', url: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav' },
      { title: 'Southern Hip Hop', artist: 'Country Rap Vibes', url: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav' }
    ]
  };

  useEffect(() => {
    // Initialize audio element
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.loop = true;
      audioRef.current.volume = volume;
    }

    // Auto-pause music when videos are playing
    if (shouldPauseMusic && isPlaying) {
      pauseMusic();
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [isPlaying, currentGenre, shouldPauseMusic]);

  const playMusic = () => {
    if (audioRef.current && currentGenre) {
      audioRef.current.play().then(() => {
        setIsPlaying(true);
        setMusicPlaying(true);
        onAudioStateChange?.(true);
      }).catch(error => {
        console.log('Audio playback failed:', error);
        // Fallback: show a message that music is not available
        setIsPlaying(false);
        setMusicPlaying(false);
      });
    }
  };

  const pauseMusic = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
      setMusicPlaying(false);
      onAudioStateChange?.(false);
    }
  };

  const selectGenre = (genreId: string) => {
    if (currentGenre === genreId) {
      // If same genre, toggle play/pause
      if (isPlaying) {
        pauseMusic();
      } else {
        playMusic();
      }
      return;
    }

    setCurrentGenre(genreId);
    
    // Select a random track from the genre
    const tracks = sampleTracks[genreId as keyof typeof sampleTracks];
    const randomTrack = tracks[Math.floor(Math.random() * tracks.length)];
    setCurrentTrack(randomTrack);

    if (audioRef.current) {
      audioRef.current.src = randomTrack.url;
      audioRef.current.volume = isMuted ? 0 : volume;
      
      // Auto-play the new genre
      playMusic();
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      if (isMuted) {
        audioRef.current.volume = volume;
        setIsMuted(false);
      } else {
        audioRef.current.volume = 0;
        setIsMuted(true);
      }
    }
  };

  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume);
    if (audioRef.current && !isMuted) {
      audioRef.current.volume = newVolume;
    }
  };

  const nextTrack = () => {
    if (currentGenre) {
      const tracks = sampleTracks[currentGenre as keyof typeof sampleTracks];
      const currentIndex = tracks.findIndex(track => track.title === currentTrack?.title);
      const nextIndex = (currentIndex + 1) % tracks.length;
      const nextTrack = tracks[nextIndex];
      
      setCurrentTrack(nextTrack);
      if (audioRef.current) {
        audioRef.current.src = nextTrack.url;
        if (isPlaying) {
          audioRef.current.play();
        }
      }
    }
  };

  if (!showPlayer) {
    return (
      <div className="fixed bottom-24 right-4 z-50">
        <Button
          onClick={() => setShowPlayer(true)}
          className="bg-cyan-500 hover:bg-cyan-600 text-white rounded-full p-3 shadow-lg"
          size="sm"
        >
          <Music className="h-5 w-5" />
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-24 right-4 z-50">
      <Card className="w-80 bg-white/95 backdrop-blur-sm shadow-xl border-0">
        <CardContent className="p-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Music className="h-5 w-5 text-cyan-500" />
              <h3 className="font-semibold text-gray-900">Background Music</h3>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowPlayer(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Current Track Info */}
          {currentTrack && (
            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              <div className="text-sm font-medium text-gray-900">{currentTrack.title}</div>
              <div className="text-xs text-gray-600">{currentTrack.artist}</div>
            </div>
          )}

          {/* Genre Selection */}
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Select Genre:</h4>
            <div className="grid grid-cols-2 gap-2">
              {genres.map((genre) => (
                <Button
                  key={genre.id}
                  onClick={() => selectGenre(genre.id)}
                  variant={currentGenre === genre.id ? "default" : "outline"}
                  className={`text-xs h-8 ${
                    currentGenre === genre.id 
                      ? genre.color + ' text-white' 
                      : 'hover:bg-gray-50'
                  }`}
                  size="sm"
                >
                  {genre.name}
                </Button>
              ))}
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Button
                onClick={isPlaying ? pauseMusic : playMusic}
                disabled={!currentGenre}
                className="bg-cyan-500 hover:bg-cyan-600 text-white"
                size="sm"
              >
                {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              </Button>
              
              <Button
                onClick={nextTrack}
                disabled={!currentGenre}
                variant="outline"
                size="sm"
              >
                <SkipForward className="h-4 w-4" />
              </Button>
            </div>

            <Button
              onClick={toggleMute}
              variant="ghost"
              size="sm"
              className="text-gray-500 hover:text-gray-700"
            >
              {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </Button>
          </div>

          {/* Volume Slider */}
          <div className="flex items-center space-x-2">
            <Volume2 className="h-4 w-4 text-gray-500" />
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={isMuted ? 0 : volume}
              onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
              className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
            />
          </div>

          {/* Status */}
          <div className="mt-3 text-xs text-gray-500">
            {currentGenre ? (
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${isPlaying ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                <span>
                  {isPlaying ? 'Playing' : 'Paused'} • {currentGenre.toUpperCase()}
                </span>
              </div>
            ) : (
              <span>Select a genre to start</span>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MusicPlayer; 