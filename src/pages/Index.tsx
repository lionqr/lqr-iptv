import React, { useState, useEffect, useCallback } from 'react';
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

  const filteredChannels = channels?.filter(channel => {
    const matchesCategory = activeCategory === 'all' || channel.category_id === activeCategory;
    const matchesSearch = !searchTerm || 
      channel.name.toLowerCase().includes(searchTerm.toLowerCase());
    const isVisible = channel.is_visible !== false;
    return matchesCategory && matchesSearch && isVisible;
  }) || [];

  const handleCategorySelect = useCallback((categoryId: string) => {
    setActiveCategory(categoryId);
    setIsLoading(true);
    playSoundEffect('select');
    setTimeout(() => setIsLoading(false), 400);
  }, []);

  const handleChannelSelect = useCallback((channel: Channel, forceFullscreen = false) => {
    setSelectedChannel(channel);
    if (forceFullscreen) {
      setIsFullScreen(true);
    }
    playSoundEffect('select');
  }, []);

  const handleToggleFullScreen = useCallback(() => {
    playSoundEffect('select');
    setIsFullScreen(!isFullScreen);
  }, [isFullScreen]);

  const handleSearch = useCallback((term: string) => {
    setSearchTerm(term);
    if (term) {
      playSoundEffect('navigate');
    }
  }, []);

  useEffect(() => {
    const intervalId = setInterval(() => {
      refetch();
    }, 24 * 60 * 60 * 1000);
    return () => clearInterval(intervalId);
  }, [refetch]);

  useEffect(() => {
    if (categories?.length && channels?.length) {
      const firstCategory = categories[0];
      setActiveCategory(firstCategory.id);
      
      const firstVisibleChannel = channels.find(channel => 
        (channel.category_id === firstCategory.id || firstCategory.id === 'all') && 
        channel.is_visible !== false
      );
      
      if (firstVisibleChannel) {
        setSelectedChannel(firstVisibleChannel);
      }
    }
  }, [categories, channels]);

  useEffect(() => {
    const handleKeyboardNavigation = (e: KeyboardEvent) => {
      if (isFullScreen && e.key === 'Escape') {
        playSoundEffect('back');
        setIsFullScreen(false);
        return;
      }

      const visibleChannels = filteredChannels.filter(c => c.is_visible !== false);
      const visibleCategories = categories?.filter(c => c.is_visible !== false) || [];
      const currentChannelIndex = visibleChannels.findIndex(c => c.id === selectedChannel?.id);
      const currentCategoryIndex = visibleCategories.findIndex(c => c.id === activeCategory);

      switch (e.key) {
        case 'ArrowUp':
          if (currentChannelIndex > 0) {
            setSelectedChannel(visibleChannels[currentChannelIndex - 1]);
            playSoundEffect('navigate');
          }
          break;
        case 'ArrowDown':
          if (currentChannelIndex < visibleChannels.length - 1) {
            setSelectedChannel(visibleChannels[currentChannelIndex + 1]);
            playSoundEffect('navigate');
          }
          break;
        case 'ArrowLeft':
          if (currentCategoryIndex > 0) {
            const newCategory = visibleCategories[currentCategoryIndex - 1];
            setActiveCategory(newCategory.id);
            playSoundEffect('navigate');
          }
          break;
        case 'ArrowRight':
          if (currentCategoryIndex < visibleCategories.length - 1) {
            const newCategory = visibleCategories[currentCategoryIndex + 1];
            setActiveCategory(newCategory.id);
            playSoundEffect('navigate');
          }
          break;
        case 'Enter':
          if (selectedChannel) {
            setIsFullScreen(true);
            playSoundEffect('select');
          }
          break;
      }
    };
    
    window.addEventListener('keydown', handleKeyboardNavigation);
    return () => window.removeEventListener('keydown', handleKeyboardNavigation);
  }, [isFullScreen, selectedChannel, categories, filteredChannels, activeCategory]);

  return (
    <div className="h-screen overflow-hidden bg-gradient-to-br from-blue-700 to-purple-700 text-white">
      {!isFullScreen && (
        <Header onSearch={handleSearch} />
      )}
      <div className={`${isFullScreen ? 'hidden' : 'grid'} grid-cols-12 gap-0 h-[calc(100vh-64px)]`}>
        <div className="col-span-3 border-r border-white/10">
          <CategorySidebar 
            categories={categories?.filter(cat => cat.is_visible !== false) || []}
            activeCategory={activeCategory} 
            onCategorySelect={handleCategorySelect}
            isLoading={dataLoading}
            allChannels={channels || []}
          />
        </div>
        <div className="col-span-5 border-r border-white/10">
          <ChannelGrid 
            channels={filteredChannels} 
            onChannelSelect={handleChannelSelect} 
            activeChannelId={selectedChannel?.id || null}
            isLoading={isLoading || dataLoading}
            searchTerm={searchTerm}
          />
        </div>
        <div className="col-span-4">
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
