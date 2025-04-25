import React, { useState } from 'react';
import { Channel, Program } from '@/data/channels';
import { playSoundEffect } from '@/lib/sound-utils';
import { Settings, Volume2, ChevronsUp, X } from 'lucide-react';

interface VideoPlayerProps {
  channel: Channel | null;
  isFullScreen: boolean;
  onExitFullScreen: () => void;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ channel, isFullScreen, onExitFullScreen }) => {
  const [showSettings, setShowSettings] = useState(false);

  if (!channel) {
    return (
      <div className={`bg-firetv-black rounded-lg flex items-center justify-center ${isFullScreen ? 'fixed inset-0 z-50' : 'aspect-square'}`}>
        <p className="text-firetv-text-secondary">Select a channel to watch</p>
      </div>
    );
  }

  const toggleSettings = () => {
    playSoundEffect('navigate');
    setShowSettings(!showSettings);
  };

  const handleExit = () => {
    playSoundEffect('back');
    onExitFullScreen();
  };

  return (
    <div className={`relative ${isFullScreen ? 'fixed inset-0 z-50 bg-firetv-black' : ''}`}>
      <div className={`relative ${isFullScreen ? 'w-full h-full' : 'aspect-square'}`}>
        <div className="absolute inset-0 bg-firetv-dark flex items-center justify-center rounded-lg overflow-hidden">
          <video
            key={channel.url}
            controls
            autoPlay
            className="w-full h-full object-contain"
            src={channel.url}
          />
          
          {/* Controls overlay - only visible in fullscreen */}
          {isFullScreen && (
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-firetv-black to-transparent">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <button className="text-white p-2 rounded-full hover:bg-white hover:bg-opacity-20">
                    <Volume2 size={24} />
                  </button>
                </div>
                <button 
                  onClick={handleExit}
                  className="text-white p-2 rounded-full hover:bg-white hover:bg-opacity-20"
                >
                  <X size={24} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Channel info - Only shown when not in fullscreen */}
      {!isFullScreen && (
        <div className="mt-4 bg-firetv-dark p-4 rounded-lg">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-lg text-firetv-text">{channel.name}</h3>
            <button 
              onClick={toggleSettings}
              className="p-2 rounded-full hover:bg-firetv-accent transition-colors"
            >
              <Settings size={20} />
            </button>
          </div>
          
          {showSettings && (
            <div className="bg-firetv-black p-3 rounded-lg space-y-3 animate-fade-in">
              <h4 className="font-semibold mb-2">Settings</h4>
              <div className="flex justify-between items-center">
                <span>Volume</span>
                <div className="flex items-center gap-1">
                  <button className="w-8 h-8 rounded-full bg-firetv-accent flex items-center justify-center">-</button>
                  <span>80%</span>
                  <button className="w-8 h-8 rounded-full bg-firetv-accent flex items-center justify-center">+</button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default VideoPlayer;
