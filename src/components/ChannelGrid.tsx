
import React, { useEffect, useRef } from 'react';
import { playSoundEffect } from '@/lib/sound-utils';
import { Skeleton } from './ui/skeleton';
import { ScrollArea } from './ui/scroll-area';

interface Channel {
  id: string;
  name: string;
  logo: string;
  url: string;
  is_visible?: boolean;
}

interface ChannelGridProps {
  channels: Channel[];
  onChannelSelect: (channel: Channel) => void;
  activeChannelId: string | null;
  isLoading?: boolean;
  searchTerm?: string;
}

const ChannelGrid: React.FC<ChannelGridProps> = ({ 
  channels, 
  onChannelSelect, 
  activeChannelId,
  isLoading = false,
  searchTerm = ''
}) => {
  const activeChannelRef = useRef<HTMLButtonElement>(null);
  
  useEffect(() => {
    if (activeChannelId && activeChannelRef.current) {
      activeChannelRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    }
  }, [activeChannelId]);

  const handleChannelClick = (channel: Channel) => {
    playSoundEffect('select');
    onChannelSelect(channel);
  };

  const visibleChannels = channels.filter(channel => channel.is_visible !== false);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-2 p-4">
        {Array(6).fill(0).map((_, i) => (
          <Skeleton key={i} className="h-20 w-full" />
        ))}
      </div>
    );
  }

  if (visibleChannels.length === 0) {
    return (
      <div className="flex-1 h-full flex items-center justify-center">
        <div className="text-white/60 text-center text-xl">
          {searchTerm ? `No channels found for "${searchTerm}"` : 'No channels available'}
        </div>
      </div>
    );
  }

  return (
    <ScrollArea className="h-full w-full">
      <div className="grid grid-cols-1 gap-2 p-4">
        {visibleChannels.map((channel) => (
          <button
            key={channel.id}
            ref={activeChannelId === channel.id ? activeChannelRef : null}
            onClick={() => handleChannelClick(channel)}
            className={`w-full flex items-center p-6 rounded-lg transition-colors duration-200 text-lg
              ${activeChannelId === channel.id 
                ? 'bg-blue-600 scale-105 shadow-lg' 
                : 'hover:bg-blue-600/30'}`}
          >
            <div className="h-16 w-16 rounded-lg overflow-hidden mr-6">
              {channel.logo ? (
                <img src={channel.logo} alt={channel.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-blue-500 flex items-center justify-center text-2xl">
                  {channel.name.charAt(0)}
                </div>
              )}
            </div>
            <span className="font-medium text-xl">{channel.name}</span>
          </button>
        ))}
      </div>
    </ScrollArea>
  );
};

export default ChannelGrid;
