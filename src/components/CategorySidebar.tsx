
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
    <div className="bg-gradient-to-b from-blue-700 to-purple-700 h-full w-full">
      <div className="p-4 border-b border-white/10">
        <div className="text-white text-lg">Search Category</div>
      </div>
      <ScrollArea className="h-[calc(100%-60px)] scrollbar-none">
        <div className="space-y-0 p-2">
          {isLoading ? (
            Array(8).fill(0).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full bg-white/10 my-1" />
            ))
          ) : categories.length > 0 ? (
            <div className="space-y-0">
              <CategoryItem
                name="ALL CHANNELS"
                count={345}
                isActive={activeCategory === 'all'}
                onClick={() => handleCategoryClick('all')}
              />
              {categories.map((category) => (
                <CategoryItem
                  key={category.id}
                  name={category.name}
                  count={56}
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
  count?: number;
  isActive: boolean;
  onClick: () => void;
}

const CategoryItem: React.FC<CategoryItemProps> = ({ name, count, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full text-left p-3 flex items-center justify-between
      ${isActive 
        ? 'bg-blue-600/50 text-white' 
        : 'hover:bg-blue-600/30 text-white/90'} 
      border-b border-white/10`}
  >
    <span>{name}</span>
    {count !== undefined && (
      <span className="text-sm opacity-75">{count}</span>
    )}
  </button>
);

export default CategorySidebar;
