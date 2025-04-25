
import React, { useState, useEffect } from 'react';
import CategorySidebar from '@/components/CategorySidebar';
import ChannelGrid from '@/components/ChannelGrid';
import VideoPlayer from '@/components/VideoPlayer';
import { categories, channels, getChannelsByCategory, Channel } from '@/data/channels';

const Index = () => {
  const [activeCategory, setActiveCategory] = useState<string>(categories[0].id);
  const [filteredChannels, setFilteredChannels] = useState<Channel[]>([]);
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  const [isFullScreen, setIsFullScreen] = useState<boolean>(false);

  // Update filtered channels when category changes
  useEffect(() => {
    const channelsInCategory = getChannelsByCategory(activeCategory);
    setFilteredChannels(channelsInCategory);
  }, [activeCategory]);

  const handleCategorySelect = (categoryId: string) => {
    setActiveCategory(categoryId);
  };

  const handleChannelSelect = (channel: Channel) => {
    setSelectedChannel(channel);
    // When a channel is selected, toggle fullscreen
    setIsFullScreen(true);
  };

  const handleExitFullScreen = () => {
    setIsFullScreen(false);
  };

  return (
    <div className="min-h-screen bg-firetv-background">
      {/* Main Layout */}
      <div className={`${isFullScreen ? 'hidden' : 'grid'} grid-cols-1 lg:grid-cols-12 h-screen`}>
        {/* Left Sidebar - Categories */}
        <div className="lg:col-span-2 h-full">
          <CategorySidebar 
            activeCategory={activeCategory} 
            onCategorySelect={handleCategorySelect} 
          />
        </div>
        
        {/* Center - Channel Grid */}
        <div className="lg:col-span-6 h-full">
          <ChannelGrid 
            channels={filteredChannels} 
            onChannelSelect={handleChannelSelect} 
            activeChannelId={selectedChannel?.id || null}
          />
        </div>
        
        {/* Right - Video Player */}
        <div className="lg:col-span-4 p-4 h-full">
          <VideoPlayer 
            channel={selectedChannel} 
            isFullScreen={isFullScreen} 
            onExitFullScreen={handleExitFullScreen} 
          />
        </div>
      </div>
      
      {/* Fullscreen Mode */}
      {isFullScreen && (
        <VideoPlayer 
          channel={selectedChannel} 
          isFullScreen={true} 
          onExitFullScreen={handleExitFullScreen} 
        />
      )}
    </div>
  );
};

export default Index;
