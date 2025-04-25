
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

  // Filter channels based on active category and search term
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
    // Simulate loading delay for category change
    setTimeout(() => setIsLoading(false), 400);
  }, []);

  const handleChannelSelect = useCallback((channel: Channel) => {
    setSelectedChannel(channel);
    setIsFullScreen(true);
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

  // Auto-refresh data every 24 hours when the app is active
  useEffect(() => {
    const intervalId = setInterval(() => {
      refetch();
    }, 24 * 60 * 60 * 1000); // 24 hours
    
    return () => clearInterval(intervalId);
  }, [refetch]);

  // Handle keyboard navigation for TV-style interface
  useEffect(() => {
    const handleKeyboardNavigation = (e: KeyboardEvent) => {
      if (isFullScreen && e.key === 'Escape') {
        playSoundEffect('back');
        setIsFullScreen(false);
        return;
      }

      // Only handle keyboard navigation when not in fullscreen
      if (isFullScreen) return;
      
      switch (e.key) {
        case 'ArrowUp':
        case 'ArrowDown':
        case 'ArrowLeft':
        case 'ArrowRight':
          playSoundEffect('navigate');
          break;
        case 'Enter':
          if (selectedChannel) {
            setIsFullScreen(true);
            playSoundEffect('select');
          }
          break;
        default:
          break;
      }
    };
    
    window.addEventListener('keydown', handleKeyboardNavigation);
    return () => window.removeEventListener('keydown', handleKeyboardNavigation);
  }, [isFullScreen, selectedChannel]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-700 to-purple-700 text-white overflow-hidden flex flex-col">
      {!isFullScreen && (
        <Header onSearch={handleSearch} />
      )}
      <div className={`${isFullScreen ? 'hidden' : 'grid'} grid-cols-12 flex-1 overflow-hidden`}>
        <div className="col-span-3 border-r border-white/10 overflow-hidden">
          <CategorySidebar 
            categories={categories?.filter(cat => cat.is_visible !== false) || []}
            activeCategory={activeCategory} 
            onCategorySelect={handleCategorySelect}
            isLoading={dataLoading}
            allChannels={channels || []}
          />
        </div>
        <div className="col-span-6 border-r border-white/10 overflow-hidden">
          <ChannelGrid 
            channels={filteredChannels} 
            onChannelSelect={handleChannelSelect} 
            activeChannelId={selectedChannel?.id || null}
            isLoading={isLoading || dataLoading}
            searchTerm={searchTerm}
          />
        </div>
        <div className="col-span-3">
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
