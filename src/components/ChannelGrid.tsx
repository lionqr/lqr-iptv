
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
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-4">
        {Array(6).fill(0).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full rounded-lg" />
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
    <ScrollArea className="h-full w-full px-2 py-4">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-2">
        {channels.map((channel) => (
          <button
            key={channel.id}
            onClick={() => handleChannelClick(channel)}
            className={`w-full aspect-video flex flex-col items-center justify-center p-4 rounded-lg transition-all
              ${activeChannelId === channel.id 
                ? 'bg-firetv-accent ring-4 ring-firetv-highlight animate-pulse-soft' 
                : 'bg-firetv-dark hover:bg-firetv-accent/40'}`}
          >
            <div className="w-full h-full flex items-center justify-center">
              {channel.logo ? (
                <img src={channel.logo} alt={channel.name} className="max-w-full max-h-full object-contain" />
              ) : (
                <div className="w-10 h-10 flex items-center justify-center text-lg font-bold">
                  {channel.name.charAt(0)}
                </div>
              )}
            </div>
            <div className="mt-2 font-medium truncate w-full text-center">{channel.name}</div>
          </button>
        ))}
      </div>
    </ScrollArea>
  );
};

export default ChannelGrid;
