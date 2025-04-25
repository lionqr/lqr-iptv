
import React, { useState, useEffect, useRef } from 'react';
import { Volume2, X, Maximize, Settings, VolumeX, PlayIcon, PauseIcon } from 'lucide-react';
import { playSoundEffect } from '@/lib/sound-utils';
import type { Tables } from '@/integrations/supabase/types';

type Channel = Tables<'channels'>;

interface VideoPlayerProps {
  channel: Channel | null;
  isFullScreen: boolean;
  onExitFullScreen: () => void;
  onToggleFullScreen: () => void;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ 
  channel, 
  isFullScreen, 
  onExitFullScreen,
  onToggleFullScreen 
}) => {
  const [showControls, setShowControls] = useState(true);
  const [volume, setVolume] = useState(50);
  const [isMuted, setIsMuted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const progressRef = useRef<HTMLDivElement | null>(null);
  const [progress, setProgress] = useState(0);
  
  // EPG Data display
  const currentProgram = channel?.current_program || 'No program information';
  const nextProgram = channel?.next_program || 'No upcoming program';
  const programStartTime = channel?.program_start_time || '00:00';
  const programEndTime = channel?.program_end_time || '00:00';

  // Hide controls after 3 seconds of inactivity in fullscreen mode
  useEffect(() => {
    if (!isFullScreen) return;
    
    const timer = setTimeout(() => {
      setShowControls(false);
    }, 3000);

    const handleMouseMove = () => {
      setShowControls(true);
      clearTimeout(timer);
    };

    window.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      clearTimeout(timer);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [isFullScreen]);

  // Keyboard navigation with sound effects
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch(e.key) {
        case 'Escape':
          if (isFullScreen) {
            playSoundEffect('back');
            onExitFullScreen();
          }
          break;
        case 'Enter':
          playSoundEffect('select');
          onToggleFullScreen();
          break;
        case 'ArrowUp':
          playSoundEffect('navigate');
          setVolume(prev => Math.min(100, prev + 10));
          break;
        case 'ArrowDown':
          playSoundEffect('navigate');
          setVolume(prev => Math.max(0, prev - 10));
          break;
        case 'm':
          playSoundEffect('select');
          setIsMuted(prev => !prev);
          break;
        case ' ':
          playSoundEffect('select');
          setIsPlaying(prev => !prev);
          break;
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullScreen, onExitFullScreen, onToggleFullScreen]);

  // Update video volume
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.volume = isMuted ? 0 : volume / 100;
    }
  }, [volume, isMuted]);

  // Play/pause video
  useEffect(() => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.play().catch(() => {
          // Handle autoplay restrictions
          setIsPlaying(false);
        });
      } else {
        videoRef.current.pause();
      }
    }
  }, [isPlaying, channel]);

  // Update progress bar
  useEffect(() => {
    const updateProgress = () => {
      if (videoRef.current) {
        const currentTime = videoRef.current.currentTime;
        const duration = videoRef.current.duration || 0;
        const calculatedProgress = duration > 0 ? (currentTime / duration) * 100 : 0;
        setProgress(calculatedProgress);
      }
    };

    const videoElement = videoRef.current;
    if (videoElement) {
      videoElement.addEventListener('timeupdate', updateProgress);
    }

    return () => {
      if (videoElement) {
        videoElement.removeEventListener('timeupdate', updateProgress);
      }
    };
  }, []);

  const handleExit = () => {
    playSoundEffect('back');
    onExitFullScreen();
  };

  const handleToggleFullScreen = () => {
    playSoundEffect('select');
    onToggleFullScreen();
  };

  if (!channel) {
    return (
      <div className={`bg-firetv-dark flex items-center justify-center 
        ${isFullScreen ? 'fixed inset-0 z-50' : 'h-full w-full aspect-square'}`}>
        <p className="text-firetv-text-secondary">Select a channel to watch</p>
      </div>
    );
  }

  return (
    <div className={`relative ${isFullScreen ? 'fixed inset-0 z-50 bg-firetv-black' : 'h-full w-full'}`}>
      <div className={`relative ${isFullScreen ? 'w-full h-full' : 'h-full w-full'}`}>
        <div className="absolute inset-0 bg-firetv-dark flex items-center justify-center overflow-hidden">
          {channel.url ? (
            <video
              ref={videoRef}
              key={channel.url}
              controls={false}
              autoPlay
              className="w-full h-full object-contain"
              src={channel.url}
              onClick={handleToggleFullScreen}
            />
          ) : (
            <div className="text-center text-white">
              <p>Channel URL not available</p>
            </div>
          )}
          
          {/* Controls overlay */}
          {(showControls || !isFullScreen) && (
            <>
              {/* Top bar - Only in fullscreen */}
              {isFullScreen && (
                <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-firetv-black to-transparent">
                  <div className="flex items-center justify-between">
                    <div className="text-white font-bold">{channel.name}</div>
                    <div className="flex items-center space-x-2">
                      <button 
                        onClick={() => setIsMuted(prev => !prev)} 
                        className="text-white p-2 rounded-full hover:bg-white hover:bg-opacity-20"
                      >
                        {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                      </button>
                      <button 
                        onClick={handleExit}
                        className="text-white p-2 rounded-full hover:bg-white hover:bg-opacity-20"
                      >
                        <X size={20} />
                      </button>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Bottom bar with EPG data */}
              <div className={`absolute bottom-0 left-0 right-0 p-4 
                ${isFullScreen ? 'bg-gradient-to-t from-firetv-black to-transparent' : 'bg-gradient-to-t from-firetv-black/70 to-transparent'}`}>
                
                {/* Progress bar */}
                <div className="w-full bg-gray-600 h-1 mb-2 rounded-full overflow-hidden">
                  <div 
                    ref={progressRef}
                    className="bg-firetv-accent h-full rounded-full"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
                
                <div className="flex items-start justify-between flex-col">
                  {/* Channel info and controls */}
                  <div className="flex justify-between w-full items-center mb-2">
                    {!isFullScreen && (
                      <div className="text-white font-bold truncate">{channel.name}</div>
                    )}
                    <div className="flex items-center space-x-2 ml-auto">
                      {!isFullScreen && (
                        <button 
                          onClick={handleToggleFullScreen}
                          className="text-white p-2 rounded-full hover:bg-white hover:bg-opacity-20"
                        >
                          <Maximize size={20} />
                        </button>
                      )}
                    </div>
                  </div>
                  
                  {/* EPG data */}
                  {isFullScreen && (
                    <div className="text-white space-y-1 w-full">
                      <div className="flex justify-between items-center">
                        <span className="font-bold">{currentProgram}</span>
                        <span className="text-sm text-gray-300">{programStartTime} - {programEndTime}</span>
                      </div>
                      <div className="text-sm text-gray-300">
                        <span>Next: {nextProgram}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;
