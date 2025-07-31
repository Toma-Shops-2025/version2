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
  const [showPlayer, setShowPlayer] = useState(false);
  const [currentTrack, setCurrentTrack] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);

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

  const initializeAudioContext = async () => {
    try {
      if (!audioContextRef.current) {
        console.log('🎵 Creating new audio context...');
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        gainNodeRef.current = audioContextRef.current.createGain();
        gainNodeRef.current.connect(audioContextRef.current.destination);
        console.log('🎵 Audio context created successfully');
      }

      if (audioContextRef.current.state === 'suspended') {
        console.log('🎵 Audio context suspended, resuming...');
        await audioContextRef.current.resume();
        console.log('🎵 Audio context resumed successfully');
      }

      console.log('🎵 Audio context state:', audioContextRef.current.state);
      return audioContextRef.current.state === 'running';
    } catch (error) {
      console.error('🎵 Error initializing audio context:', error);
      return false;
    }
  };

  const playMusic = async () => {
    if (!currentGenre || isLoading) {
      console.log('🎵 Cannot play: no genre selected or currently loading');
      return;
    }

    try {
      console.log('🎵 Attempting to play music:', currentGenre);
      
      // Initialize audio context
      const audioReady = await initializeAudioContext();
      if (!audioReady) {
        console.error('🎵 Audio context not ready');
        return;
      }
      
      // Stop any existing oscillator
      if (oscillatorRef.current) {
        oscillatorRef.current.stop();
        oscillatorRef.current.disconnect();
        oscillatorRef.current = null;
      }
      
      // Create new oscillator
      const oscillator = audioContextRef.current!.createOscillator();
      oscillator.type = 'sine'; // Use sine wave for better sound
      
      // Connect oscillator to gain node
      oscillator.connect(gainNodeRef.current!);
      
      // Set frequency based on current track
      if (currentTrack && currentTrack.frequency) {
        oscillator.frequency.setValueAtTime(currentTrack.frequency, audioContextRef.current!.currentTime);
        console.log('🎵 Playing frequency:', currentTrack.frequency, 'Hz');
      } else {
        // Fallback frequency if no track
        oscillator.frequency.setValueAtTime(440, audioContextRef.current!.currentTime);
        console.log('🎵 Playing fallback frequency: 440 Hz');
      }
      
      // Set volume - make it louder and ensure it's not muted
      const volumeLevel = isMuted ? 0 : Math.max(volume * 1.0, 0.1); // Minimum volume of 0.1
      gainNodeRef.current!.gain.setValueAtTime(volumeLevel, audioContextRef.current!.currentTime);
      console.log('🎵 Volume level:', volumeLevel);
      
      // Store reference
      oscillatorRef.current = oscillator;
      
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
    try {
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
      console.log('🎵 Music paused successfully');
    } catch (error) {
      console.error('🎵 Error pausing music:', error);
    }
  };

  const selectGenre = async (genreId: string) => {
    console.log('🎵 Genre selected:', genreId);
    
    // Get the selected genre and its tracks from sampleTracks
    const selectedGenre = genres.find(g => g.id === genreId);
    const genreTracks = sampleTracks[genreId as keyof typeof sampleTracks];
    
    if (!selectedGenre || !genreTracks || genreTracks.length === 0) {
      console.error('🎵 No tracks found for genre:', genreId);
      return;
    }
    
    // Set the current track to the first track of the selected genre
    const firstTrack = genreTracks[0];
    setCurrentTrack(firstTrack);
    console.log('🎵 Set current track:', firstTrack);
    
    // If same genre is selected, just toggle play/pause
    if (currentGenre === genreId) {
      if (isPlaying) {
        pauseMusic();
      } else {
        await playMusic();
      }
    } else {
      // If a new genre is selected, pause current, set new genre, and play
      pauseMusic(); // Pause current track immediately
      setCurrentGenre(genreId);
      setIsLoading(true);
      
      // Initialize audio context on user interaction
      await initializeAudioContext();
      
      // Give a small delay before playing the new track to ensure state updates
      setTimeout(async () => {
        setIsLoading(false);
        await playMusic();
      }, 200); // Short delay
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (gainNodeRef.current && audioContextRef.current) {
      gainNodeRef.current.gain.setValueAtTime(isMuted ? 0 : volume * 0.5, audioContextRef.current.currentTime);
    }
  };

  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume);
    if (gainNodeRef.current && audioContextRef.current && !isMuted) {
      gainNodeRef.current.gain.setValueAtTime(newVolume * 0.5, audioContextRef.current.currentTime);
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
      console.log('🎵 Next track loaded:', nextTrack.title);
      
      // If currently playing, restart with new track
      if (isPlaying) {
        playMusic();
      }
    }
  };

  const testAudio = async () => {
    try {
      console.log('🎵 Testing audio...');
      
      // Create a simple test oscillator
      const testContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      if (testContext.state === 'suspended') {
        console.log('🎵 Test context suspended, resuming...');
        await testContext.resume();
      }
      
      console.log('🎵 Test context state:', testContext.state);
      
      const testOscillator = testContext.createOscillator();
      const testGain = testContext.createGain();
      
      testOscillator.connect(testGain);
      testGain.connect(testContext.destination);
      
      testOscillator.frequency.setValueAtTime(440, testContext.currentTime); // A4 note
      testGain.gain.setValueAtTime(0.5, testContext.currentTime); // Louder test volume
      
      console.log('🎵 Starting test oscillator...');
      testOscillator.start();
      testOscillator.stop(testContext.currentTime + 1.0); // Play for 1 second
      
      console.log('🎵 Test audio played successfully');
      
      // Clean up test context after a delay
      setTimeout(() => {
        if (testContext.state !== 'closed') {
          testContext.close();
        }
      }, 2000);
    } catch (error) {
      console.error('🎵 Test audio failed:', error);
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
      <Card className="w-80 bg-gray-900/95 backdrop-blur-sm shadow-xl border border-gray-700">
        <CardContent className="p-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Music className="h-5 w-5 text-cyan-500" />
              <h3 className="font-semibold text-white">Background Music</h3>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowPlayer(false)}
              className="text-gray-400 hover:text-white hover:bg-gray-700 rounded-md transition-all duration-200 hover:scale-105"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Current Track Info */}
          {currentTrack && (
            <div className="mb-4 p-3 bg-gradient-to-r from-gray-800 to-gray-900 rounded-lg border border-gray-700">
              <div className="text-sm font-medium text-white">{currentTrack.title}</div>
              <div className="text-xs text-gray-300">{currentTrack.artist}</div>
            </div>
          )}

          {/* Genre Selection */}
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-300 mb-2">Select Genre:</h4>
            <div className="grid grid-cols-2 gap-2">
              {genres.map((genre) => (
                <Button
                  key={genre.id}
                  onClick={() => selectGenre(genre.id)}
                  variant={currentGenre === genre.id ? "default" : "outline"}
                  className={`text-xs h-8 transition-all duration-200 ${
                    currentGenre === genre.id 
                      ? genre.color + ' text-white shadow-lg scale-105' 
                      : 'bg-gray-800 text-gray-200 border-gray-600 hover:bg-gray-700 hover:border-gray-500 hover:scale-105 hover:shadow-md'
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
                className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
                size="sm"
              >
                {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              </Button>
              
              <Button
                onClick={nextTrack}
                disabled={!currentGenre}
                variant="outline"
                size="sm"
                className="bg-gray-800 text-gray-200 border-gray-600 hover:bg-gray-700 hover:border-gray-500 hover:text-white transition-all duration-200 hover:scale-105 hover:shadow-md"
              >
                <SkipForward className="h-4 w-4" />
              </Button>
              
              <Button
                onClick={testAudio}
                variant="outline"
                size="sm"
                className="bg-green-600 text-white border-green-600 hover:bg-green-700 hover:border-green-700 transition-all duration-200 hover:scale-105 hover:shadow-md"
              >
                Test
              </Button>
            </div>

            <Button
              onClick={toggleMute}
              variant="ghost"
              size="sm"
              className="text-gray-400 hover:text-white hover:bg-gray-700 rounded-md transition-all duration-200 hover:scale-105"
            >
              {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </Button>
          </div>

          {/* Volume Slider */}
          <div className="flex items-center space-x-2">
            <Volume2 className="h-4 w-4 text-cyan-400" />
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={isMuted ? 0 : volume}
              onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
              className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider hover:bg-gray-600 transition-colors duration-200"
            />
          </div>

          {/* Status */}
          <div className="mt-3 text-xs text-gray-300">
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