
import React from 'react';
import { playSoundEffect } from '@/lib/sound-utils';
import { Skeleton } from './ui/skeleton';

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
    <div className="bg-gradient-to-b from-blue-700 to-purple-500 h-full w-full overflow-y-auto p-4">
      <div className="space-y-2">
        <div className="text-white text-lg border-b border-white/20 pb-2 mb-4">
          Search Category
        </div>
        {isLoading ? (
          Array(8).fill(0).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full bg-white/10" />
          ))
        ) : categories.length > 0 ? (
          <div className="space-y-1">
            <CategoryItem
              name="ALL"
              count={categories.length}
              isActive={activeCategory === 'all'}
              onClick={() => handleCategoryClick('all')}
            />
            {categories.map((category) => (
              <CategoryItem
                key={category.id}
                name={category.name}
                count={0}
                isActive={activeCategory === category.id}
                onClick={() => handleCategoryClick(category.id)}
              />
            ))}
          </div>
        ) : (
          <div className="text-white/60 text-center py-4">
            No categories available. Admin needs to add default categories.
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
