
import React from 'react';
import { Category } from '@/data/channels';
import { playSoundEffect } from '@/lib/sound-utils';
import { Skeleton } from './ui/skeleton';

interface CategorySidebarProps {
  activeCategory: string;
  onCategorySelect: (categoryId: string) => void;
  isLoading?: boolean;
}

const CategorySidebar: React.FC<CategorySidebarProps> = ({ 
  activeCategory, 
  onCategorySelect,
  isLoading = false
}) => {
  const handleCategoryClick = (categoryId: string) => {
    playSoundEffect('select');
    onCategorySelect(categoryId);
  };

  return (
    <div className="bg-gradient-to-b from-blue-700 to-purple-500 h-full w-full overflow-y-auto p-4">
      <div className="space-y-2">
        <div className="text-white text-lg border-b border-white/20 pb-2 mb-4">
          Search Category
        </div>
        {isLoading ? (
          Array(8).fill(0).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full bg-white/10" />
          ))
        ) : (
          <div className="space-y-1">
            <CategoryItem
              name="ALL"
              count={345}
              isActive={activeCategory === 'all'}
              onClick={() => handleCategoryClick('all')}
            />
            <CategoryItem
              name="Category 1"
              count={56}
              isActive={activeCategory === 'cat1'}
              onClick={() => handleCategoryClick('cat1')}
            />
            {/* Add more categories as needed */}
          </div>
        )}
      </div>
    </div>
  );
};

interface CategoryItemProps {
  name: string;
  count: number;
  isActive: boolean;
  onClick: () => void;
}

const CategoryItem: React.FC<CategoryItemProps> = ({ name, count, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full text-left p-2 rounded flex justify-between items-center
      ${isActive ? 'bg-white/20' : 'hover:bg-white/10'} text-white transition-colors`}
  >
    <span>{name}</span>
    <span className="text-sm opacity-80">{count}</span>
  </button>
);

export default CategorySidebar;
