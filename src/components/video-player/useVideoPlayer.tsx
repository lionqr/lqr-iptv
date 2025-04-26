
import { useState, useRef, useEffect } from 'react';
import Hls from 'hls.js';
import { toast } from 'sonner';
import type { Tables } from '@/integrations/supabase/types';

type Channel = Tables<'channels'>;

export const useVideoPlayer = (channel: Channel | null) => {
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

    const handlePlaybackError = (message: string) => {
      setIsLoading(false);
      setIsPlaying(false);
      
      toast.dismiss();
      toast.error(message, {
        duration: 3000
      });
    };

    if (Hls.isSupported() && channel.url.includes('.m3u8')) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
      });
      
      hls.attachMedia(video);
      
      hls.on(Hls.Events.MEDIA_ATTACHED, () => {
        hls.loadSource(channel.url);
      });
      
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        handlePlayVideo();
      });
      
      hls.on(Hls.Events.ERROR, (_, data) => {
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              handlePlaybackError('Playback error. Reconnecting...');
              hls.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              handlePlaybackError('Playback error. Attempting to recover...');
              hls.recoverMediaError();
              break;
            default:
              handlePlaybackError('Playback error. Please try another channel.');
              hls.destroy();
              break;
          }
        }
      });
      
      hlsRef.current = hls;
    } else {
      video.src = channel.url;
      handlePlayVideo();
    }

    return () => {
      if (hlsRef.current) {
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

  const handlePlayVideo = () => {
    if (!videoRef.current) return;
    
    videoRef.current.play()
      .then(() => {
        setIsPlaying(true);
        setIsLoading(false);
      })
      .catch(error => {
        console.error('Error playing video:', error);
        toast.error('Playback error. Please try another channel.', {
          duration: 3000
        });
        setIsPlaying(false);
        setIsLoading(false);
      });
  };

  const handlePlayPause = () => {
    if (!videoRef.current) return;
    
    if (videoRef.current.paused) {
      handlePlayVideo();
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume);
    setIsMuted(false);
  };

  return {
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
  };
};
