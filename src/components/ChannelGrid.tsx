
import React, { useState } from 'react';
import { Channel } from '@/data/channels';
import { playSoundEffect } from '@/lib/sound-utils';

interface ChannelGridProps {
  channels: Channel[];
  onChannelSelect: (channel: Channel) => void;
  activeChannelId: string | null;
}

const ChannelGrid: React.FC<ChannelGridProps> = ({ channels, onChannelSelect, activeChannelId }) => {
  const [hoveredChannelId, setHoveredChannelId] = useState<string | null>(null);

  const handleChannelClick = (channel: Channel) => {
    playSoundEffect('select');
    onChannelSelect(channel);
  };

  const handleChannelHover = (channelId: string) => {
    if (hoveredChannelId !== channelId) {
      playSoundEffect('navigate');
      setHoveredChannelId(channelId);
    }
  };

  return (
    <div className="bg-firetv-background p-6 h-full overflow-y-auto">
      <h2 className="text-2xl font-bold mb-6 text-firetv-text">Channels</h2>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4">
        {channels.map((channel) => (
          <div
            key={channel.id}
            className={`channel-item ${activeChannelId === channel.id ? 'active' : ''} ${
              hoveredChannelId === channel.id ? 'animate-pulse-soft' : ''
            }`}
            onClick={() => handleChannelClick(channel)}
            onMouseEnter={() => handleChannelHover(channel.id)}
            tabIndex={0}
            role="button"
            aria-pressed={activeChannelId === channel.id}
          >
            <div className="aspect-video relative">
              <img 
                src={channel.thumbnail} 
                alt={channel.name} 
                className="w-full h-full object-cover rounded-lg"
              />
              <div className="channel-info">
                <div className="flex items-center space-x-2">
                  <span className="text-2xl">{channel.logo}</span>
                  <h3 className="font-bold text-white">{channel.name}</h3>
                </div>
                <p className="text-sm text-firetv-text-secondary mt-1 truncate">{channel.currentProgram.title}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChannelGrid;
