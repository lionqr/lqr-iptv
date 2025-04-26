
import React, { useEffect } from 'react';
import { playSoundEffect } from '@/lib/sound-utils';
import type { Tables } from '@/integrations/supabase/types';
import LoadingOverlay from './video-player/LoadingOverlay';
import VideoControls from './video-player/VideoControls';
import { useVideoPlayer } from './video-player/useVideoPlayer';

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
  const {
    showControls,
    setShowControls,
    volume,
    isMuted,
    isPlaying,
    isLoading,
    videoRef,
    controlsTimerRef,
    handlePlayVideo,
    handlePlayPause,
    handleVolumeChange,
    setIsMuted,
  } = useVideoPlayer(channel);

  useEffect(() => {
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement && isFullScreen) {
        onExitFullScreen();
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, [isFullScreen, onExitFullScreen]);

  useEffect(() => {
    if (!isPlaying) return;

    const showControlsTemporarily = () => {
      setShowControls(true);
      
      if (controlsTimerRef.current) {
        clearTimeout(controlsTimerRef.current);
      }
      
      controlsTimerRef.current = window.setTimeout(() => {
        setShowControls(false);
      }, 3000);
    };
    
    const handleMouseMove = () => showControlsTemporarily();
    
    if (isFullScreen) {
      document.addEventListener('mousemove', handleMouseMove);
      showControlsTemporarily();
    } else {
      setShowControls(true);
    }
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      if (controlsTimerRef.current) {
        clearTimeout(controlsTimerRef.current);
      }
    };
  }, [isFullScreen, isPlaying, controlsTimerRef, setShowControls]);

  const handleVideoClick = () => {
    if (!isPlaying) {
      handlePlayVideo();
    } else {
      playSoundEffect('select');
      onToggleFullScreen();
    }
  };

  const enterFullScreen = async () => {
    if (videoRef.current?.parentElement) {
      try {
        await videoRef.current.parentElement.requestFullscreen();
      } catch (error) {
        console.error('Failed to enter fullscreen:', error);
      }
    }
  };

  const exitFullScreen = async () => {
    if (document.fullscreenElement) {
      try {
        await document.exitFullscreen();
      } catch (error) {
        console.error('Failed to exit fullscreen:', error);
      }
    }
  };

  if (!channel) {
    return (
      <div className="bg-firetv-dark rounded-lg aspect-video flex items-center justify-center">
        <p className="text-firetv-text-secondary">Select a channel to watch</p>
      </div>
    );
  }

  return (
    <div className={`relative ${isFullScreen ? 'fixed inset-0 z-50 bg-black' : 'aspect-video'}`}>
      <div className="relative h-full w-full">
        <div className="absolute inset-0 bg-firetv-dark flex items-center justify-center overflow-hidden">
          <video
            ref={videoRef}
            onClick={handleVideoClick}
            className="w-full h-full object-contain cursor-pointer"
            playsInline
            poster={channel.logo || undefined}
          />
          
          {isLoading && <LoadingOverlay />}
          
          {showControls && (
            <VideoControls
              isPlaying={isPlaying}
              isMuted={isMuted}
              volume={volume}
              channelName={channel.name}
              isFullScreen={isFullScreen}
              onPlayPause={handlePlayPause}
              onMuteToggle={() => setIsMuted(!isMuted)}
              onVolumeChange={handleVolumeChange}
              onFullScreenToggle={isFullScreen ? exitFullScreen : enterFullScreen}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;
