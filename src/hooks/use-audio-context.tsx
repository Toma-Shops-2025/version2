import { createContext, useContext, useState, useEffect } from 'react';

interface AudioContextType {
  isMusicPlaying: boolean;
  setMusicPlaying: (playing: boolean) => void;
  shouldPauseMusic: boolean;
  setShouldPauseMusic: (pause: boolean) => void;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export const useAudioContext = () => {
  const context = useContext(AudioContext);
  if (context === undefined) {
    throw new Error('useAudioContext must be used within an AudioProvider');
  }
  return context;
};

export const AudioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [shouldPauseMusic, setShouldPauseMusic] = useState(false);

  // Auto-pause music when videos are playing
  useEffect(() => {
    const handleVideoPlay = () => {
      setShouldPauseMusic(true);
    };

    const handleVideoPause = () => {
      setShouldPauseMusic(false);
    };

    // Listen for video events
    document.addEventListener('play', handleVideoPlay);
    document.addEventListener('pause', handleVideoPause);

    return () => {
      document.removeEventListener('play', handleVideoPlay);
      document.removeEventListener('pause', handleVideoPause);
    };
  }, []);

  const value = {
    isMusicPlaying,
    setMusicPlaying: setIsMusicPlaying,
    shouldPauseMusic,
    setShouldPauseMusic
  };

  return (
    <AudioContext.Provider value={value}>
      {children}
    </AudioContext.Provider>
  );
}; 