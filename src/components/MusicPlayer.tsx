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
import { useAudioContext } from '@/hooks/use-audio-context.tsx';

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
  const [showPlayer, setShowPlayer] = useState(true);
  const [currentTrack, setCurrentTrack] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const [audioContextReady, setAudioContextReady] = useState(false);

  const genres = [
    { id: 'country', name: 'COUNTRY', color: 'bg-green-500' },
    { id: 'rock', name: 'ROCK', color: 'bg-red-500' },
    { id: 'classicrock', name: 'CLASSIC ROCK', color: 'bg-yellow-500' },
    { id: 'hiphop', name: 'HIP HOP', color: 'bg-purple-500' },
    { id: 'rnb', name: 'R&B', color: 'bg-blue-500' },
    { id: 'countryrap', name: 'COUNTRY RAP', color: 'bg-orange-500' }
  ];

  // Sample music tracks for each genre (in production, you'd use a real music API)
  const sampleTracks = {
    country: [
      { title: 'Country Roads', artist: 'Country Vibes', frequency: 440 }, // A4
      { title: 'Southern Nights', artist: 'Country Vibes', frequency: 523.25 } // C5
    ],
    rock: [
      { title: 'Rock Anthem', artist: 'Rock Vibes', frequency: 659.25 }, // E5
      { title: 'Electric Dreams', artist: 'Rock Vibes', frequency: 783.99 } // G5
    ],
    classicrock: [
      { title: 'Classic Rock Revival', artist: 'Classic Rock Vibes', frequency: 880 }, // A5
      { title: 'Timeless Rock', artist: 'Classic Rock Vibes', frequency: 1046.50 }, // C6
      { title: 'Golden Age Rock', artist: 'Classic Rock Vibes', frequency: 1174.66 } // D6
    ],
    hiphop: [
      { title: 'Urban Flow', artist: 'Hip Hop Vibes', frequency: 220 }, // A3
      { title: 'Street Beats', artist: 'Hip Hop Vibes', frequency: 277.18 } // C#4
    ],
    rnb: [
      { title: 'Smooth R&B', artist: 'R&B Vibes', frequency: 349.23 }, // F4
      { title: 'Soulful Nights', artist: 'R&B Vibes', frequency: 415.30 } // G#4
    ],
    countryrap: [
      { title: 'Country Rap Fusion', artist: 'Country Rap Vibes', frequency: 329.63 }, // E4
      { title: 'Southern Hip Hop', artist: 'Country Rap Vibes', frequency: 392.00 } // G4
    ]
  };

  useEffect(() => {
    console.log('🎵 MusicPlayer component mounted');
    
    // Initialize audio context
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      console.log('🎵 Audio context initialized');
    }

    // Auto-pause music when videos are playing
    if (shouldPauseMusic && isPlaying) {
      pauseMusic();
    }

    return () => {
      if (oscillatorRef.current) {
        oscillatorRef.current.stop();
        oscillatorRef.current = null;
      }
      if (gainNodeRef.current) {
        gainNodeRef.current.disconnect();
        gainNodeRef.current = null;
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }
    };
  }, [isPlaying, currentGenre, shouldPauseMusic]);

  // Function to initialize audio context on user interaction
  const initializeAudioContext = async () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      console.log('🎵 Audio context initialized');
    }
    
    if (audioContextRef.current.state === 'suspended') {
      await audioContextRef.current.resume();
      console.log('🎵 Audio context resumed');
    }
    
    setAudioContextReady(true);
  };

  const playMusic = async () => {
    if (!audioContextRef.current || !currentGenre || isLoading) {
      console.log('🎵 Cannot play: no audio context, genre selected, or currently loading');
      return;
    }

    try {
      console.log('🎵 Attempting to play music:', currentGenre);
      
      // Initialize audio context if not ready
      if (!audioContextReady) {
        await initializeAudioContext();
      }
      
      // Resume audio context if suspended
      if (audioContextRef.current.state === 'suspended') {
        await audioContextRef.current.resume();
        console.log('🎵 Audio context resumed from suspended state');
      }
      
      console.log('🎵 Audio context state:', audioContextRef.current.state);
      
      // Stop any existing oscillator
      if (oscillatorRef.current) {
        oscillatorRef.current.stop();
        oscillatorRef.current = null;
      }
      if (gainNodeRef.current) {
        gainNodeRef.current.disconnect();
        gainNodeRef.current = null;
      }
      
      // Create new oscillator and gain node
      const oscillator = audioContextRef.current.createOscillator();
      const gainNode = audioContextRef.current.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContextRef.current.destination);
      
      // Set frequency based on current track
      if (currentTrack && currentTrack.frequency) {
        oscillator.frequency.setValueAtTime(currentTrack.frequency, audioContextRef.current.currentTime);
        console.log('🎵 Playing frequency:', currentTrack.frequency, 'Hz');
      }
      
      // Set volume - much louder now
      const volumeLevel = isMuted ? 0 : volume * 0.8; // Increased from 0.3 to 0.8
      gainNode.gain.setValueAtTime(volumeLevel, audioContextRef.current.currentTime);
      console.log('🎵 Volume level:', volumeLevel);
      
      // Store references
      oscillatorRef.current = oscillator;
      gainNodeRef.current = gainNode;
      
      // Start oscillator
      oscillator.start();
      console.log('🎵 Oscillator started successfully');
      
      setIsPlaying(true);
      setMusicPlaying(true);
      onAudioStateChange?.(true);
      console.log('🎵 Music started playing successfully');
    } catch (error) {
      console.error('🎵 Audio playback failed:', error);
      setIsPlaying(false);
      setMusicPlaying(false);
      onAudioStateChange?.(false);
    }
  };

  const pauseMusic = () => {
    if (oscillatorRef.current) {
      oscillatorRef.current.stop();
      oscillatorRef.current = null;
    }
    if (gainNodeRef.current) {
      gainNodeRef.current.disconnect();
      gainNodeRef.current = null;
    }
    setIsPlaying(false);
    setMusicPlaying(false);
    onAudioStateChange?.(false);
    console.log('🎵 Music paused');
  };

  const selectGenre = async (genreId: string) => {
    console.log('🎵 Genre selected:', genreId);
    
    // If same genre is selected, just toggle play/pause
    if (currentGenre === genreId) {
      if (isPlaying) {
        pauseMusic();
      } else {
        // Initialize audio context on first user interaction
        if (!audioContextReady) {
          await initializeAudioContext();
        }
        playMusic();
      }
      return;
    }
    
    // Set loading state to prevent multiple operations
    setIsLoading(true);
    setIsPlaying(false);
    setMusicPlaying(false);
    
    setCurrentGenre(genreId);
    
    const tracks = sampleTracks[genreId as keyof typeof sampleTracks];
    if (tracks && tracks.length > 0) {
      const randomTrack = tracks[Math.floor(Math.random() * tracks.length)];
      setCurrentTrack(randomTrack);
      console.log('🎵 Track loaded:', randomTrack.title);
      
      // Initialize audio context on first user interaction
      if (!audioContextReady) {
        await initializeAudioContext();
      }
      
      // Auto-play the new genre after a short delay
      setTimeout(() => {
        playMusic();
        setIsLoading(false);
      }, 200);
    } else {
      setIsLoading(false);
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (gainNodeRef.current && audioContextRef.current) {
      gainNodeRef.current.gain.setValueAtTime(isMuted ? 0 : volume * 0.8, audioContextRef.current.currentTime);
    }
  };

  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume);
    if (gainNodeRef.current && audioContextRef.current && !isMuted) {
      gainNodeRef.current.gain.setValueAtTime(newVolume * 0.8, audioContextRef.current.currentTime);
    }
  };

  const nextTrack = () => {
    if (!currentGenre) return;
    
    const tracks = sampleTracks[currentGenre as keyof typeof sampleTracks];
    if (tracks && tracks.length > 1) {
      const currentIndex = tracks.findIndex(track => track.title === currentTrack?.title);
      const nextIndex = (currentIndex + 1) % tracks.length;
      const nextTrack = tracks[nextIndex];
      
      setCurrentTrack(nextTrack);
      if (audioRef.current) {
        audioRef.current.src = `data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT`; // Placeholder for actual audio data
        if (isPlaying) {
          audioRef.current.play();
        }
      }
    }
  };

  if (!showPlayer) {
    return (
      <div className="fixed bottom-24 right-4 z-[9998]">
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
    <div className="fixed bottom-24 right-4 z-[9998]">
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
            {isLoading ? (
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse"></div>
                <span>Loading • {currentGenre.toUpperCase()}</span>
              </div>
            ) : currentGenre ? (
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