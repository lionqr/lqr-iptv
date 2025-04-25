
import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import CategorySidebar from '@/components/CategorySidebar';
import ChannelGrid from '@/components/ChannelGrid';
import VideoPlayer from '@/components/VideoPlayer';
import { useChannelData } from '@/hooks/useChannelData';
import { playSoundEffect } from '@/lib/sound-utils';
import type { Channel } from '@/hooks/useChannelData';

const Index = () => {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  const [isFullScreen, setIsFullScreen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const { categories, channels, isLoading: dataLoading, refetch } = useChannelData();

  // Filter channels based on active category and search term
  const filteredChannels = channels?.filter(channel => {
    const matchesCategory = activeCategory === 'all' || channel.category_id === activeCategory;
    const matchesSearch = !searchTerm || 
      channel.name.toLowerCase().includes(searchTerm.toLowerCase());
    const isVisible = channel.is_visible !== false;
    return matchesCategory && matchesSearch && isVisible;
  }) || [];

  const handleCategorySelect = (categoryId: string) => {
    setActiveCategory(categoryId);
    setIsLoading(true);
    playSoundEffect('select');
    // Simulate loading delay for category change
    setTimeout(() => setIsLoading(false), 800);
  };

  const handleChannelSelect = (channel: Channel) => {
    setSelectedChannel(channel);
    setIsFullScreen(true);
    playSoundEffect('select');
  };

  const handleToggleFullScreen = () => {
    playSoundEffect('select');
    setIsFullScreen(!isFullScreen);
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    if (term) {
      playSoundEffect('navigate');
    }
  };

  // Auto-refresh data every 24 hours when the app is active
  useEffect(() => {
    const intervalId = setInterval(() => {
      refetch();
    }, 24 * 60 * 60 * 1000); // 24 hours
    
    return () => clearInterval(intervalId);
  }, [refetch]);

  // Handle escape key to exit fullscreen
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullScreen) {
        playSoundEffect('back');
        setIsFullScreen(false);
      }
    };
    
    // Handle keyboard navigation
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle keyboard navigation when not in fullscreen
      if (isFullScreen) return;
      
      switch (e.key) {
        case 'ArrowUp':
        case 'ArrowDown':
        case 'ArrowLeft':
        case 'ArrowRight':
          playSoundEffect('navigate');
          break;
        default:
          break;
      }
    };
    
    window.addEventListener('keydown', handleEscape);
    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleEscape);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isFullScreen]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-700 to-purple-700 text-white overflow-hidden">
      {!isFullScreen && (
        <Header onSearch={handleSearch} />
      )}
      <div className={`${isFullScreen ? 'hidden' : 'grid'} grid-cols-12 h-[calc(100vh-64px)]`}>
        <div className="col-span-3 border-r border-white/10">
          <CategorySidebar 
            categories={categories?.filter(cat => cat.is_visible !== false) || []}
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
            searchTerm={searchTerm}
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
