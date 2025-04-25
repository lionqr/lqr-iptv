
import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import CategorySidebar from '@/components/CategorySidebar';
import ChannelGrid from '@/components/ChannelGrid';
import VideoPlayer from '@/components/VideoPlayer';
import { categories, channels, getChannelsByCategory, Channel } from '@/data/channels';

const Index = () => {
  const [activeCategory, setActiveCategory] = useState<string>(categories[0].id);
  const [filteredChannels, setFilteredChannels] = useState<Channel[]>([]);
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  const [isFullScreen, setIsFullScreen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    const loadChannels = async () => {
      setIsLoading(true);
      // Simulate loading delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      const channelsInCategory = getChannelsByCategory(activeCategory);
      setFilteredChannels(channelsInCategory);
      setIsLoading(false);
    };

    loadChannels();
  }, [activeCategory]);

  const handleCategorySelect = (categoryId: string) => {
    setActiveCategory(categoryId);
  };

  const handleChannelSelect = (channel: Channel) => {
    setSelectedChannel(channel);
    setIsFullScreen(true);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Header />
      <div className={`${isFullScreen ? 'hidden' : 'grid'} grid-cols-12 h-[calc(100vh-64px)]`}>
        <div className="col-span-2 border-r border-white/10">
          <CategorySidebar 
            activeCategory={activeCategory} 
            onCategorySelect={handleCategorySelect}
            isLoading={isLoading}
          />
        </div>
        <div className="col-span-6 border-r border-white/10">
          <ChannelGrid 
            channels={filteredChannels} 
            onChannelSelect={handleChannelSelect} 
            activeChannelId={selectedChannel?.id || null}
            isLoading={isLoading}
          />
        </div>
        <div className="col-span-4">
          <VideoPlayer 
            channel={selectedChannel}
            isFullScreen={isFullScreen}
            onExitFullScreen={() => setIsFullScreen(false)}
          />
        </div>
      </div>
      {isFullScreen && (
        <VideoPlayer 
          channel={selectedChannel}
          isFullScreen={true}
          onExitFullScreen={() => setIsFullScreen(false)}
        />
      )}
    </div>
  );
};

export default Index;
