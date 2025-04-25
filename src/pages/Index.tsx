
import React, { useState, useEffect } from 'react';
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
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { categories, channels, isLoading: dataLoading } = useChannelData();

  const filteredChannels = channels?.filter(channel => 
    activeCategory === 'all' || channel.category_id === activeCategory
  ) || [];

  const handleCategorySelect = (categoryId: string) => {
    setActiveCategory(categoryId);
    setIsLoading(true);
    // Simulate loading delay for category change
    setTimeout(() => setIsLoading(false), 800);
  };

  const handleChannelSelect = (channel: Channel) => {
    setSelectedChannel(channel);
    setIsFullScreen(true);
  };

  const handleToggleFullScreen = () => {
    setIsFullScreen(!isFullScreen);
  };

  // Handle escape key to exit fullscreen
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullScreen) {
        setIsFullScreen(false);
      }
    };
    
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isFullScreen]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-700 to-purple-700 text-white">
      {!isFullScreen && (
        <Header />
      )}
      <div className={`${isFullScreen ? 'hidden' : 'grid'} grid-cols-12 h-[calc(100vh-64px)]`}>
        <div className="col-span-3 border-r border-white/10">
          <CategorySidebar 
            categories={categories || []}
            activeCategory={activeCategory} 
            onCategorySelect={handleCategorySelect}
            isLoading={dataLoading}
          />
        </div>
        <div className="col-span-6 border-r border-white/10">
          <ChannelGrid 
            channels={filteredChannels} 
            onChannelSelect={handleChannelSelect} 
            activeChannelId={selectedChannel?.id || null}
            isLoading={isLoading || dataLoading}
          />
        </div>
        <div className="col-span-3 aspect-square">
          <VideoPlayer 
            channel={selectedChannel}
            isFullScreen={isFullScreen}
            onExitFullScreen={() => setIsFullScreen(false)}
            onToggleFullScreen={handleToggleFullScreen}
          />
        </div>
      </div>
      {isFullScreen && (
        <VideoPlayer 
          channel={selectedChannel}
          isFullScreen={true}
          onExitFullScreen={() => setIsFullScreen(false)}
          onToggleFullScreen={handleToggleFullScreen}
        />
      )}
    </div>
  );
};

export default Index;
