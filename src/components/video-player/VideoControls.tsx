
import React from 'react';
import { PlayCircle, Volume2, VolumeX, Maximize, Minimize } from 'lucide-react';

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
        <div className="flex items-center space-x-4">
          <button 
            onClick={onPlayPause}
            className="text-white p-2 rounded-full hover:bg-white/20"
          >
            <PlayCircle size={24} />
          </button>
          
          <button 
            onClick={onMuteToggle}
            className="text-white p-2 rounded-full hover:bg-white/20"
          >
            {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
          </button>
          
          <input
            type="range"
            min="0"
            max="100"
            value={volume}
            onChange={(e) => onVolumeChange(Number(e.target.value))}
            className="w-24"
          />
          
          <div className="text-white text-sm ml-2">
            {channelName}
          </div>
        </div>
        
        <button
          onClick={onFullScreenToggle}
          className="text-white p-2 rounded-full hover:bg-white/20"
        >
          {isFullScreen ? <Minimize size={20} /> : <Maximize size={20} />}
        </button>
      </div>
    </div>
  );
};

export default VideoControls;
