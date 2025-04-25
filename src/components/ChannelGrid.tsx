import React from 'react';
import { playSoundEffect } from '@/lib/sound-utils';
import { Skeleton } from './ui/skeleton';

interface Channel {
  id: string;
  name: string;
  logo: string;
  url: string;
}

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

  if (channels.length === 0) {
    return (
      <div className="flex-1 h-full bg-gradient-to-br from-blue-600/50 to-purple-500/50 flex items-center justify-center">
        <div className="text-white/60 text-center">
          No channels available. Admin needs to add default channels.
        </div>
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
              {channel.logo ? (
                <img src={channel.logo} alt={channel.name} className="w-10 h-10 object-contain" />
              ) : (
                channel.name.charAt(0)
              )}
            </div>
            <div className="flex-1 text-left">
              <div className="font-medium">{channel.name}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default ChannelGrid;
