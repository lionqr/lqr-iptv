
import React, { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { playSoundEffect } from '@/lib/sound-utils';
import Hls from 'hls.js';
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
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const hlsRef = useRef<Hls | null>(null);
  
  // Initialize HLS when channel changes
  useEffect(() => {
    if (!channel?.url || !videoRef.current) return;

    const video = videoRef.current;
    
    // Cleanup previous HLS instance
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    if (Hls.isSupported() && channel.url.includes('.m3u8')) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
      });
      
      hls.attachMedia(video);
      hls.loadSource(channel.url);
      
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        video.play().catch(console.error);
      });
      
      hls.on(Hls.Events.ERROR, (_, data) => {
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              hls.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              hls.recoverMediaError();
              break;
            default:
              hls.destroy();
              break;
          }
        }
      });
      
      hlsRef.current = hls;
    } else {
      // Fallback for non-HLS streams
      video.src = channel.url;
      video.play().catch(console.error);
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [channel]);

  // Update video volume
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.volume = isMuted ? 0 : volume / 100;
    }
  }, [volume, isMuted]);

  // Handle fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement && isFullScreen) {
        onExitFullScreen();
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, [isFullScreen, onExitFullScreen]);

  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume);
    setIsMuted(false);
  };

  const handleVideoClick = async () => {
    playSoundEffect('select');
    onToggleFullScreen();
  };

  if (!channel) {
    return (
      <div className="bg-firetv-dark aspect-square flex items-center justify-center">
        <p className="text-firetv-text-secondary">Select a channel to watch</p>
      </div>
    );
  }

  return (
    <div className={`relative ${isFullScreen ? 'fixed inset-0 z-50 bg-black' : 'aspect-square'}`}>
      <div className="relative h-full w-full">
        <div className="absolute inset-0 bg-firetv-dark flex items-center justify-center overflow-hidden">
          <video
            ref={videoRef}
            onClick={handleVideoClick}
            className="w-full h-full object-contain cursor-pointer"
            playsInline
          />
          
          {/* Controls overlay */}
          {showControls && (
            <div className={`absolute bottom-0 left-0 right-0 p-4 
              ${isFullScreen ? 'bg-gradient-to-t from-black to-transparent' : 'bg-gradient-to-t from-black/70 to-transparent'}`}>
              <div className="flex items-center space-x-4">
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
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;
