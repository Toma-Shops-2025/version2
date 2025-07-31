import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, SkipForward, Volume2, VolumeX, X, Music } from 'lucide-react';
import { useAudioContext } from '../hooks/use-audio-context';

interface Track {
  id: string;
  name: string;
  url: string;
}

interface Genre {
  id: string;
  name: string;
  color: string;
}

const MusicPlayer: React.FC = () => {
  const [showPlayer, setShowPlayer] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentGenre, setCurrentGenre] = useState<string>('');
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [volume, setVolume] = useState(0.5);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  const { shouldPauseMusic } = useAudioContext();

  const genres: Genre[] = [
    { id: 'country', name: 'COUNTRY', color: 'from-green-500 to-green-600' },
    { id: 'rock', name: 'ROCK', color: 'from-red-500 to-red-600' },
    { id: 'hiphop', name: 'HIPHOP', color: 'from-purple-500 to-purple-600' },
    { id: 'rnb', name: 'R&B', color: 'from-blue-500 to-blue-600' },
    { id: 'countryrap', name: 'COUNTRY RAP', color: 'from-yellow-500 to-yellow-600' },
    { id: 'classicrock', name: 'CLASSIC ROCK', color: 'from-orange-500 to-orange-600' },
  ];

  // Sample music URLs (royalty-free music)
  const sampleTracks: Record<string, Track[]> = {
    country: [
      { id: 'c1', name: 'Country Road', url: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav' },
      { id: 'c2', name: 'Blue Skies', url: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav' },
      { id: 'c3', name: 'Prairie Wind', url: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav' },
    ],
    rock: [
      { id: 'r1', name: 'Rock Anthem', url: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav' },
      { id: 'r2', name: 'Electric Storm', url: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav' },
      { id: 'r3', name: 'Thunder Road', url: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav' },
    ],
    hiphop: [
      { id: 'h1', name: 'Urban Beat', url: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav' },
      { id: 'h2', name: 'Street Flow', url: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav' },
      { id: 'h3', name: 'City Rhythm', url: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav' },
    ],
    rnb: [
      { id: 'rb1', name: 'Smooth Groove', url: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav' },
      { id: 'rb2', name: 'Midnight Soul', url: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav' },
      { id: 'rb3', name: 'Velvet Voice', url: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav' },
    ],
    countryrap: [
      { id: 'cr1', name: 'Country Rap Beat', url: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav' },
      { id: 'cr2', name: 'Southern Flow', url: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav' },
      { id: 'cr3', name: 'Rural Rhythm', url: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav' },
    ],
    classicrock: [
      { id: 'cl1', name: 'Classic Riff', url: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav' },
      { id: 'cl2', name: 'Vintage Rock', url: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav' },
      { id: 'cl3', name: 'Timeless Tune', url: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav' },
    ],
  };

  // Initialize audio element
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.volume = volume;
    }
  }, []);

  // Test audio function
  const testAudio = async () => {
    try {
      if (!audioRef.current) {
        audioRef.current = new Audio();
      }
      
      console.log('🎵 Testing audio...');
      audioRef.current.src = 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav';
      audioRef.current.volume = 0.5;
      
      // Wait for audio to load
      audioRef.current.addEventListener('canplaythrough', async () => {
        try {
          await audioRef.current!.play();
          console.log('🎵 Test audio played successfully');
        } catch (playError) {
          console.error('🎵 Test play failed:', playError);
        }
      }, { once: true });

      audioRef.current.addEventListener('error', (error) => {
        console.error('🎵 Test audio failed:', error);
      }, { once: true });

      audioRef.current.load();
      
    } catch (error) {
      console.error('🎵 Test audio failed:', error);
    }
  };

  // Play music function
  const playMusic = async () => {
    if (!currentTrack || !currentGenre) {
      console.log('🎵 Cannot play: no track or genre selected');
      return;
    }

    try {
      if (!audioRef.current) {
        audioRef.current = new Audio();
      }

      console.log('🎵 Loading audio from:', currentTrack.url);
      audioRef.current.src = currentTrack.url;
      audioRef.current.volume = isMuted ? 0 : volume;
      
      // Wait for audio to load before playing
      audioRef.current.addEventListener('canplaythrough', async () => {
        try {
          await audioRef.current!.play();
          setIsPlaying(true);
          console.log('🎵 Music playing:', currentTrack.name);
        } catch (playError) {
          console.error('🎵 Play failed:', playError);
          setIsPlaying(false);
        }
      }, { once: true });

      // Handle loading errors
      audioRef.current.addEventListener('error', (error) => {
        console.error('🎵 Audio loading failed:', error);
        setIsPlaying(false);
        setIsLoading(false);
      }, { once: true });

      // Start loading
      audioRef.current.load();
      
    } catch (error) {
      console.error('🎵 Audio playback failed:', error);
      setIsPlaying(false);
    }
  };

  // Pause music function
  const pauseMusic = () => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    setIsPlaying(false);
    console.log('🎵 Music paused');
  };

  // Toggle play/pause
  const togglePlayPause = async () => {
    console.log('🎵 Toggle play/pause clicked. Current state:', { isPlaying, currentTrack, currentGenre });
    
    if (isPlaying) {
      pauseMusic();
    } else {
      if (!currentTrack) {
        console.log('🎵 No track selected, cannot play');
        return;
      }
      await playMusic();
    }
  };

  // Select genre
  const selectGenre = async (genreId: string) => {
    console.log('🎵 Genre selected:', genreId);
    
    const selectedGenre = genres.find(g => g.id === genreId);
    const tracks = sampleTracks[genreId];
    
    if (!selectedGenre || !tracks || tracks.length === 0) {
      console.error('🎵 No tracks found for genre:', genreId);
      return;
    }
    
    // Set the first track of the selected genre
    const firstTrack = tracks[0];
    setCurrentTrack(firstTrack);
    setCurrentTrackIndex(0);
    console.log('🎵 Set current track:', firstTrack);
    
    // If same genre is selected, just toggle play/pause
    if (currentGenre === genreId) {
      if (isPlaying) {
        pauseMusic();
      } else {
        await playMusic();
      }
    } else {
      // New genre selected, load and play first track
      pauseMusic(); // Pause current track immediately
      setCurrentGenre(genreId);
      setIsLoading(true);
      
      // Give a small delay for state to update
      setTimeout(async () => {
        await playMusic();
        setIsLoading(false);
      }, 100);
    }
  };

  // Next track function
  const nextTrack = async () => {
    if (!currentGenre || !currentTrack) return;
    
    const tracks = sampleTracks[currentGenre];
    if (!tracks) return;
    
    const nextIndex = (currentTrackIndex + 1) % tracks.length;
    const nextTrack = tracks[nextIndex];
    
    setCurrentTrack(nextTrack);
    setCurrentTrackIndex(nextIndex);
    
    if (isPlaying) {
      await playMusic();
    }
  };

  // Toggle mute
  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (audioRef.current) {
      audioRef.current.volume = !isMuted ? 0 : volume;
    }
  };

  // Handle volume change
  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume);
    if (audioRef.current && !isMuted) {
      audioRef.current.volume = newVolume;
    }
  };

  // Effect to pause music when videos play
  useEffect(() => {
    if (shouldPauseMusic && isPlaying) {
      pauseMusic();
    }
  }, [shouldPauseMusic, isPlaying]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  return (
    <div className="fixed bottom-4 right-4 z-[10000]">
      {!showPlayer ? (
        <button
          onClick={() => setShowPlayer(true)}
          className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110 flex items-center justify-center"
        >
          <Music className="h-6 w-6 text-white" />
        </button>
      ) : (
        <div className="bg-gray-900/95 backdrop-blur-sm border border-gray-700 rounded-lg shadow-xl p-4 w-80 max-w-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-semibold">Background Music</h3>
            <button
              onClick={() => setShowPlayer(false)}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Genre Buttons */}
          <div className="grid grid-cols-2 gap-2 mb-4">
            {genres.map((genre) => (
              <button
                key={genre.id}
                onClick={() => selectGenre(genre.id)}
                className={`px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 hover:scale-105 shadow-md bg-gradient-to-r ${genre.color} text-white`}
              >
                {genre.name}
              </button>
            ))}
          </div>

          {/* Current Track Info */}
          {currentTrack && (
            <div className="mb-4 p-3 bg-gray-800/50 rounded-lg">
              <p className="text-white text-sm font-medium">{currentTrack.name}</p>
              <p className="text-gray-400 text-xs">{genres.find(g => g.id === currentGenre)?.name}</p>
            </div>
          )}

          {/* Controls */}
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={togglePlayPause}
              disabled={!currentTrack || isLoading}
              className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : isPlaying ? (
                <Pause className="h-5 w-5 text-white" />
              ) : (
                <Play className="h-5 w-5 text-white" />
              )}
            </button>

            <button
              onClick={nextTrack}
              disabled={!currentTrack}
              className="w-8 h-8 bg-gradient-to-r from-green-500 to-green-600 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <SkipForward className="h-4 w-4 text-white" />
            </button>

            <button
              onClick={toggleMute}
              className="w-8 h-8 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110 flex items-center justify-center"
            >
              {isMuted ? (
                <VolumeX className="h-4 w-4 text-white" />
              ) : (
                <Volume2 className="h-4 w-4 text-white" />
              )}
            </button>

            <button
              onClick={testAudio}
              className="px-3 py-1 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg text-xs font-medium text-white shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105"
            >
              Test
            </button>
          </div>

          {/* Volume Slider */}
          <div className="flex items-center space-x-2">
            <Volume2 className="h-4 w-4 text-gray-400" />
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={volume}
              onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
              className="slider flex-1"
            />
            <span className="text-gray-400 text-xs w-8">{Math.round(volume * 100)}%</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default MusicPlayer; 