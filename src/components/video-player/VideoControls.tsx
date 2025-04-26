
import React from 'react';
import { PlayCircle, PauseCircle, Volume2, VolumeX, Maximize, Minimize } from 'lucide-react';

interface VideoControlsProps {
  isPlaying: boolean;
  isMuted: boolean;
  volume: number;
  channelName: string;
  isFullScreen: boolean;
  onPlayPause: () => void;
  onMuteToggle: () => void;
  onVolumeChange: (value: number) => void;
  onFullScreenToggle: () => void;
}

const VideoControls: React.FC<VideoControlsProps> = ({
  isPlaying,
  isMuted,
  volume,
  channelName,
  isFullScreen,
  onPlayPause,
  onMuteToggle,
  onVolumeChange,
  onFullScreenToggle,
}) => {
  return (
    <div className={`absolute bottom-0 left-0 right-0 p-4 
      ${isFullScreen ? 'bg-gradient-to-t from-black to-transparent' : 'bg-gradient-to-t from-black/70 to-transparent'}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-6">
          <button 
            onClick={onPlayPause}
            className="text-white p-3 rounded-full hover:bg-white/20 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-transform active:scale-95"
          >
            {isPlaying ? 
              <PauseCircle size={32} /> : 
              <PlayCircle size={32} />
            }
          </button>
          
          <button 
            onClick={onMuteToggle}
            className="text-white p-3 rounded-full hover:bg-white/20 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-transform active:scale-95"
          >
            {isMuted ? <VolumeX size={28} /> : <Volume2 size={28} />}
          </button>
          
          <div className="flex items-center space-x-2">
            <input
              type="range"
              min="0"
              max="100"
              value={volume}
              onChange={(e) => onVolumeChange(Number(e.target.value))}
              className="w-28 h-3 appearance-none bg-gray-400/50 rounded-full accent-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div className="text-white text-base md:text-lg ml-2 font-medium">
            {channelName}
          </div>
        </div>
        
        <button
          onClick={onFullScreenToggle}
          className="text-white p-3 rounded-full hover:bg-white/20 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-transform active:scale-95"
        >
          {isFullScreen ? <Minimize size={28} /> : <Maximize size={28} />}
        </button>
      </div>
    </div>
  );
};

export default VideoControls;
