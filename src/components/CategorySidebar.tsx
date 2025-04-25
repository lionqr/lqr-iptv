
import React from 'react';
import { playSoundEffect } from '@/lib/sound-utils';
import { Skeleton } from './ui/skeleton';
import { ScrollArea } from './ui/scroll-area';

interface Category {
  id: string;
  name: string;
}

interface CategorySidebarProps {
  categories: Category[];
  activeCategory: string;
  onCategorySelect: (categoryId: string) => void;
  isLoading?: boolean;
}

const CategorySidebar: React.FC<CategorySidebarProps> = ({ 
  categories, 
  activeCategory, 
  onCategorySelect,
  isLoading = false
}) => {
  const handleCategoryClick = (categoryId: string) => {
    playSoundEffect('select');
    onCategorySelect(categoryId);
  };

  return (
    <div className="bg-gradient-to-b from-blue-700/80 to-purple-700/80 h-full w-full">
      <div className="p-4 border-b border-white/10">
        <div className="text-white text-lg font-bold">Categories</div>
      </div>
      <ScrollArea className="h-[calc(100%-60px)]">
        <div className="space-y-1 p-2">
          {isLoading ? (
            Array(8).fill(0).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full bg-white/10 rounded-md my-2" />
            ))
          ) : categories.length > 0 ? (
            <div className="space-y-1">
              <CategoryItem
                name="ALL CHANNELS"
                isActive={activeCategory === 'all'}
                onClick={() => handleCategoryClick('all')}
              />
              {categories.map((category) => (
                <CategoryItem
                  key={category.id}
                  name={category.name}
                  isActive={activeCategory === category.id}
                  onClick={() => handleCategoryClick(category.id)}
                />
              ))}
            </div>
          ) : (
            <div className="text-white/60 text-center py-4">
              No categories available. Admin needs to add categories.
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

interface CategoryItemProps {
  name: string;
  isActive: boolean;
  onClick: () => void;
}

const CategoryItem: React.FC<CategoryItemProps> = ({ name, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full text-left p-3 rounded-md flex items-center
      ${isActive 
        ? 'bg-firetv-accent text-white font-medium animate-pulse-soft' 
        : 'hover:bg-white/10 text-white/90'} 
      transition-colors`}
  >
    <span>{name}</span>
  </button>
);

export default CategorySidebar;
