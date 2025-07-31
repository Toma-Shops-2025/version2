import React, { createContext, useContext, useEffect, useState } from 'react';

interface AudioContextType {
  isMusicPlaying: boolean;
  shouldPauseMusic: boolean;
  setIsMusicPlaying: (playing: boolean) => void;
  setShouldPauseMusic: (pause: boolean) => void;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export const AudioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [shouldPauseMusic, setShouldPauseMusic] = useState(false);

  useEffect(() => {
    const handlePlay = () => {
      setShouldPauseMusic(true);
    };

    const handlePause = () => {
      setShouldPauseMusic(false);
    };

    // Listen for video play/pause events
    document.addEventListener('play', handlePlay, true);
    document.addEventListener('pause', handlePause, true);

    return () => {
      document.removeEventListener('play', handlePlay, true);
      document.removeEventListener('pause', handlePause, true);
    };
  }, []);

  return (
    <AudioContext.Provider value={{
      isMusicPlaying,
      shouldPauseMusic,
      setIsMusicPlaying,
      setShouldPauseMusic,
    }}>
      {children}
    </AudioContext.Provider>
  );
};

export const useAudioContext = () => {
  const context = useContext(AudioContext);
  if (context === undefined) {
    throw new Error('useAudioContext must be used within an AudioProvider');
  }
  return context;
}; 