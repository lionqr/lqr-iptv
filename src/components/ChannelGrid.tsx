
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
  
  // Auto-scroll to the active channel when it changes
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

  // Filter out channels marked as not visible
  const visibleChannels = channels.filter(channel => channel.is_visible !== false);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-1 p-1">
        {Array(6).fill(0).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  if (visibleChannels.length === 0) {
    return (
      <div className="flex-1 h-full flex items-center justify-center">
        <div className="text-white/60 text-center">
          {searchTerm ? `No channels found for "${searchTerm}"` : 'No channels available. Admin needs to add channels.'}
        </div>
      </div>
    );
  }

  return (
    <ScrollArea className="h-full w-full scrollbar-none">
      <div className="grid grid-cols-1 gap-1 p-1">
        {visibleChannels.map((channel) => (
          <button
            key={channel.id}
            ref={activeChannelId === channel.id ? activeChannelRef : null}
            onClick={() => handleChannelClick(channel)}
            className={`w-full flex items-center p-4 transition-colors duration-200
              ${activeChannelId === channel.id 
                ? 'bg-blue-600 animate-pulse' 
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
