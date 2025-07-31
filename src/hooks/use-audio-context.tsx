import React, { createContext, useContext, useEffect, useState } from 'react';

interface AudioContextType {
  isMusicPlaying: boolean;
  shouldPauseMusic: boolean;
  isUploading: boolean;
  setIsMusicPlaying: (playing: boolean) => void;
  setShouldPauseMusic: (pause: boolean) => void;
  setIsUploading: (uploading: boolean) => void;
  pauseMusicForVideo: () => void;
  resumeMusicAfterVideo: () => void;
  pauseMusicForUpload: () => void;
  resumeMusicAfterUpload: () => void;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export const AudioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [shouldPauseMusic, setShouldPauseMusic] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [videoPlaying, setVideoPlaying] = useState(false);

  useEffect(() => {
    const handlePlay = (event: Event) => {
      const target = event.target as HTMLVideoElement;
      if (target && target.tagName === 'VIDEO') {
        console.log('🎵 Video started playing, pausing music');
        setVideoPlaying(true);
        setShouldPauseMusic(true);
      }
    };

    const handlePause = (event: Event) => {
      const target = event.target as HTMLVideoElement;
      if (target && target.tagName === 'VIDEO') {
        console.log('🎵 Video paused, resuming music');
        setVideoPlaying(false);
        setShouldPauseMusic(false);
      }
    };

    const handleEnded = (event: Event) => {
      const target = event.target as HTMLVideoElement;
      if (target && target.tagName === 'VIDEO') {
        console.log('🎵 Video ended, resuming music');
        setVideoPlaying(false);
        setShouldPauseMusic(false);
      }
    };

    // Listen for video play/pause/ended events
    document.addEventListener('play', handlePlay, true);
    document.addEventListener('pause', handlePause, true);
    document.addEventListener('ended', handleEnded, true);

    return () => {
      document.removeEventListener('play', handlePlay, true);
      document.removeEventListener('pause', handlePause, true);
      document.removeEventListener('ended', handleEnded, true);
    };
  }, []);

  const pauseMusicForVideo = () => {
    console.log('🎵 Manually pausing music for video');
    setShouldPauseMusic(true);
  };

  const resumeMusicAfterVideo = () => {
    console.log('🎵 Manually resuming music after video');
    setShouldPauseMusic(false);
  };

  const pauseMusicForUpload = () => {
    console.log('🎵 Pausing music for upload');
    setIsUploading(true);
    setShouldPauseMusic(true);
  };

  const resumeMusicAfterUpload = () => {
    console.log('🎵 Resuming music after upload');
    setIsUploading(false);
    setShouldPauseMusic(false);
  };

  return (
    <AudioContext.Provider value={{
      isMusicPlaying,
      shouldPauseMusic,
      isUploading,
      setIsMusicPlaying,
      setShouldPauseMusic,
      setIsUploading,
      pauseMusicForVideo,
      resumeMusicAfterVideo,
      pauseMusicForUpload,
      resumeMusicAfterUpload,
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