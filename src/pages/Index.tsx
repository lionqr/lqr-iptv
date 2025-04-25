
import React, { useState } from 'react';
import Header from '@/components/Header';
import CategorySidebar from '@/components/CategorySidebar';
import ChannelGrid from '@/components/ChannelGrid';
import VideoPlayer from '@/components/VideoPlayer';
import { useChannelData } from '@/hooks/useChannelData';
import type { Channel } from '@/hooks/useChannelData';

const Index = () => {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  const [isFullScreen, setIsFullScreen] = useState<boolean>(false);
  const { categories, channels, isLoading } = useChannelData();

  const filteredChannels = channels?.filter(channel => 
    activeCategory === 'all' || channel.category_id === activeCategory
  ) || [];

  const handleCategorySelect = (categoryId: string) => {
    setActiveCategory(categoryId);
  };

  const handleChannelSelect = (channel: any) => {
    setSelectedChannel(channel);
    setIsFullScreen(true);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Header />
      <div className={`${isFullScreen ? 'hidden' : 'grid'} grid-cols-12 h-[calc(100vh-64px)]`}>
        <div className="col-span-2 border-r border-white/10">
          <CategorySidebar 
            categories={categories || []}
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
