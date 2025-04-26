import React, { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX, Maximize, Minimize, PlayCircle, LoaderCircle, AlertTriangle } from 'lucide-react';
import { playSoundEffect } from '@/lib/sound-utils';
import Hls from 'hls.js';
import type { Tables } from '@/integrations/supabase/types';
import { toast } from 'sonner';

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
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const hlsRef = useRef<Hls | null>(null);
  const controlsTimerRef = useRef<number | null>(null);
  
  useEffect(() => {
    if (!channel?.url || !videoRef.current) return;

    setIsLoading(true);
    setIsPlaying(false);
    const video = videoRef.current;
    
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    if (Hls.isSupported() && channel.url.includes('.m3u8')) {
      console.log('Loading HLS stream:', channel.url);
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
      });
      
      hls.attachMedia(video);
      
      hls.on(Hls.Events.MEDIA_ATTACHED, () => {
        console.log('HLS media attached, loading source');
        hls.loadSource(channel.url);
      });
      
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        console.log('HLS manifest parsed, playing video');
        video.play()
          .then(() => {
            setIsPlaying(true);
            setIsLoading(false);
          })
          .catch(error => {
            console.error('Error playing video:', error);
            toast.error('Unable to play video. Try again or select another channel.');
            setIsLoading(false);
          });
      });
      
      hls.on(Hls.Events.ERROR, (_, data) => {
        if (data.fatal) {
          console.error('HLS error:', data.type, data.details);
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              toast.error('Network error. Attempting to reconnect...');
              hls.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              toast.error('Media error. Attempting to recover...');
              hls.recoverMediaError();
              break;
            default:
              toast.error('Playback error. Please try another channel.');
              hls.destroy();
              setIsLoading(false);
              break;
          }
        }
      });
      
      hlsRef.current = hls;
    } else {
      console.log('Loading direct stream:', channel.url);
      video.src = channel.url;
      video.play()
        .then(() => {
          setIsPlaying(true);
          setIsLoading(false);
        })
        .catch(error => {
          console.error('Error playing video:', error);
          toast.error('Unable to play video. Try again or select another channel.');
          setIsLoading(false);
        });
    }

    return () => {
      if (hlsRef.current) {
        console.log('Cleaning up HLS instance');
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [channel]);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.volume = isMuted ? 0 : volume / 100;
    }
  }, [volume, isMuted]);

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
  }, [isFullScreen, isPlaying]);

  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume);
    setIsMuted(false);
  };

  const handleVideoClick = async () => {
    if (isPlaying) {
      playSoundEffect('select');
      onToggleFullScreen();
    }
  };

  const handlePlayPause = () => {
    if (!videoRef.current) return;
    
    if (videoRef.current.paused) {
      videoRef.current.play()
        .then(() => setIsPlaying(true))
        .catch(console.error);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
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
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center z-10 bg-black/60">
              <LoaderCircle className="w-16 h-16 text-blue-600 animate-spin" />
            </div>
          )}
          
          <video
            ref={videoRef}
            onClick={handleVideoClick}
            className="w-full h-full object-contain cursor-pointer"
            playsInline
            poster={channel.logo || undefined}
          />
          
          {showControls && (
            <div className={`absolute bottom-0 left-0 right-0 p-4 
              ${isFullScreen ? 'bg-gradient-to-t from-black to-transparent' : 'bg-gradient-to-t from-black/70 to-transparent'}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <button 
                    onClick={handlePlayPause}
                    className="text-white p-2 rounded-full hover:bg-white/20"
                  >
                    <PlayCircle size={24} />
                  </button>
                  
                  <button 
                    onClick={() => setIsMuted(!isMuted)}
                    className="text-white p-2 rounded-full hover:bg-white/20"
                  >
                    {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                  </button>
                  
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={volume}
                    onChange={(e) => handleVolumeChange(Number(e.target.value))}
                    className="w-24"
                  />
                  
                  <div className="text-white text-sm ml-2">
                    {channel.name}
                  </div>
                </div>
                
                <button
                  onClick={isFullScreen ? exitFullScreen : enterFullScreen}
                  className="text-white p-2 rounded-full hover:bg-white/20"
                >
                  {isFullScreen ? <Minimize size={20} /> : <Maximize size={20} />}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;
