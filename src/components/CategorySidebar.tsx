
import React, { useEffect, useRef } from 'react';
import { playSoundEffect } from '@/lib/sound-utils';
import { Skeleton } from './ui/skeleton';
import { ScrollArea } from './ui/scroll-area';
import { Search } from 'lucide-react';
import { Input } from './ui/input';
import type { Channel } from '@/hooks/useChannelData';

interface Category {
  id: string;
  name: string;
  is_visible?: boolean;
}

interface CategorySidebarProps {
  categories: Category[];
  activeCategory: string;
  onCategorySelect: (categoryId: string) => void;
  isLoading?: boolean;
  allChannels?: Channel[];
}

const CategorySidebar: React.FC<CategorySidebarProps> = ({ 
  categories, 
  activeCategory, 
  onCategorySelect,
  isLoading = false,
  allChannels = []
}) => {
  const [searchTerm, setSearchTerm] = React.useState('');
  const activeCategoryRef = useRef<HTMLButtonElement>(null);
  
  // Auto-scroll to active category
  useEffect(() => {
    if (activeCategoryRef.current) {
      activeCategoryRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    }
  }, [activeCategory]);

  const handleCategoryClick = (categoryId: string) => {
    playSoundEffect('select');
    onCategorySelect(categoryId);
  };

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) && 
    (category.is_visible !== false) // Only show visible categories
  );

  // Calculate channel count for each category
  const getChannelCount = (categoryId: string) => {
    if (categoryId === 'all') {
      return allChannels.filter(channel => channel.is_visible !== false).length;
    }
    return allChannels.filter(channel => 
      channel.category_id === categoryId && channel.is_visible !== false
    ).length;
  };

  return (
    <div className="bg-gradient-to-b from-blue-700 to-purple-700 h-[calc(100vh-64px)] w-full flex flex-col">
      <div className="p-4 border-b border-white/10">
        <div className="relative">
          <Input
            type="text"
            placeholder="Search Category"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-white/10 border-none text-white placeholder:text-white/60"
          />
          <Search className="absolute right-3 top-2.5 text-white/60" size={18} />
        </div>
      </div>
      <ScrollArea className="flex-1">
        <div className="space-y-0 p-2">
          {isLoading ? (
            Array(8).fill(0).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full bg-white/10 my-1" />
            ))
          ) : filteredCategories.length > 0 ? (
            <div className="space-y-0">
              <CategoryItem
                name="ALL CHANNELS"
                count={getChannelCount('all')}
                isActive={activeCategory === 'all'}
                onClick={() => handleCategoryClick('all')}
                ref={activeCategory === 'all' ? activeCategoryRef : null}
              />
              {filteredCategories.map((category) => (
                <CategoryItem
                  key={category.id}
                  name={category.name}
                  count={getChannelCount(category.id)}
                  isActive={activeCategory === category.id}
                  onClick={() => handleCategoryClick(category.id)}
                  ref={activeCategory === category.id ? activeCategoryRef : null}
                />
              ))}
            </div>
          ) : (
            <div className="text-white/60 text-center py-4">
              No categories found for "{searchTerm}"
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

const CategoryItem = React.forwardRef<
  HTMLButtonElement,
  {
    name: string;
    count?: number;
    isActive: boolean;
    onClick: () => void;
  }
>(({ name, count, isActive, onClick }, ref) => (
  <button
    ref={ref}
    onClick={onClick}
    className={`w-full text-left p-3 flex items-center justify-between transition-colors duration-200
      ${isActive 
        ? 'bg-blue-600 text-white animate-pulse' 
        : 'hover:bg-blue-600/30 text-white/90'} 
      border-b border-white/10`}
  >
    <span>{name}</span>
    {count !== undefined && (
      <span className="text-sm bg-white/20 px-2 py-1 rounded-full">{count}</span>
    )}
  </button>
));

CategoryItem.displayName = 'CategoryItem';

export default CategorySidebar;
