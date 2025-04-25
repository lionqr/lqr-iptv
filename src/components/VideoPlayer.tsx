
import React, { useState, useEffect } from 'react';
import { Volume2, X, Maximize } from 'lucide-react';
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

  if (!channel) {
    return (
      <div className={`bg-firetv-dark rounded-lg flex items-center justify-center 
        ${isFullScreen ? 'fixed inset-0 z-50' : 'h-full'}`}>
        <p className="text-firetv-text-secondary">Select a channel to watch</p>
      </div>
    );
  }

  const handleExit = () => {
    playSoundEffect('back');
    onExitFullScreen();
  };

  const handleToggleFullScreen = () => {
    playSoundEffect('select');
    onToggleFullScreen();
  };

  return (
    <div className={`relative ${isFullScreen ? 'fixed inset-0 z-50 bg-firetv-black' : 'h-full'}`}>
      <div className={`relative ${isFullScreen ? 'w-full h-full' : 'h-full'}`}>
        <div className="absolute inset-0 bg-firetv-dark flex items-center justify-center rounded-lg overflow-hidden">
          {channel.url ? (
            <video
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
            <div className={`absolute ${isFullScreen ? 'bottom-0' : 'top-0'} left-0 right-0 p-4 
              ${isFullScreen ? 'bg-gradient-to-t from-firetv-black to-transparent' : 'bg-gradient-to-b from-firetv-black/70 to-transparent'}`}>
              <div className="flex items-center justify-between">
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
                  {isFullScreen && (
                    <>
                      <button className="text-white p-2 rounded-full hover:bg-white hover:bg-opacity-20">
                        <Volume2 size={20} />
                      </button>
                      <button 
                        onClick={handleExit}
                        className="text-white p-2 rounded-full hover:bg-white hover:bg-opacity-20"
                      >
                        <X size={20} />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;
