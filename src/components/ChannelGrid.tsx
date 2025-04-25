
import React from 'react';
import { playSoundEffect } from '@/lib/sound-utils';
import { Skeleton } from './ui/skeleton';
import { ScrollArea } from './ui/scroll-area';

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
      <div className="grid grid-cols-1 gap-1 p-1">
        {Array(6).fill(0).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  if (channels.length === 0) {
    return (
      <div className="flex-1 h-full flex items-center justify-center">
        <div className="text-white/60 text-center">
          No channels available. Admin needs to add channels.
        </div>
      </div>
    );
  }

  return (
    <ScrollArea className="h-full w-full scrollbar-none">
      <div className="grid grid-cols-1 gap-1 p-1">
        {channels.map((channel) => (
          <button
            key={channel.id}
            onClick={() => handleChannelClick(channel)}
            className={`w-full flex items-center p-4 transition-colors
              ${activeChannelId === channel.id 
                ? 'bg-blue-600/50' 
                : 'hover:bg-blue-600/30'}`}
          >
            <div className="h-10 w-10 rounded-full overflow-hidden mr-4">
              {channel.logo ? (
                <img src={channel.logo} alt={channel.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-blue-500 flex items-center justify-center">
                  {channel.name.charAt(0)}
                </div>
              )}
            </div>
            <span className="font-medium">{channel.name}</span>
          </button>
        ))}
      </div>
    </ScrollArea>
  );
};

export default ChannelGrid;
