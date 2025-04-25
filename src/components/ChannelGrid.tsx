
import React from 'react';
import { Channel } from '@/data/channels';
import { playSoundEffect } from '@/lib/sound-utils';
import { Skeleton } from './ui/skeleton';

interface ChannelGridProps {
  channels: Channel[];
  onChannelSelect: (channel: Channel) => void;
  activeChannelId: string | null;
  isLoading?: boolean;
}

const ChannelGrid: React.FC<ChannelGridProps> = ({ 
  channels, 
  onChannelSelect, 
  activeChannelId,
  isLoading = false
}) => {
  const handleChannelClick = (channel: Channel) => {
    playSoundEffect('select');
    onChannelSelect(channel);
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-2 p-4 bg-gradient-to-br from-blue-600/50 to-purple-500/50">
        {Array(6).fill(0).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="flex-1 h-full bg-gradient-to-br from-blue-600/50 to-purple-500/50 overflow-y-auto">
      <div className="space-y-1 p-2">
        {channels.map((channel) => (
          <button
            key={channel.id}
            onClick={() => handleChannelClick(channel)}
            className={`w-full flex items-center gap-4 p-2 rounded
              ${activeChannelId === channel.id ? 'bg-white/20' : 'hover:bg-white/10'}
              text-white transition-colors`}
          >
            <div className="w-12 h-12 rounded bg-blue-700 flex items-center justify-center">
              {channel.logo}
            </div>
            <div className="flex-1 text-left">
              <div className="font-medium">{channel.name}</div>
              <div className="text-sm opacity-80">{channel.currentProgram.title}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default ChannelGrid;
