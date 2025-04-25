
import React, { useState } from 'react';
import { categories, Category } from '@/data/channels';
import { playSoundEffect } from '@/lib/sound-utils';

interface CategorySidebarProps {
  activeCategory: string;
  onCategorySelect: (categoryId: string) => void;
}

const CategorySidebar: React.FC<CategorySidebarProps> = ({ activeCategory, onCategorySelect }) => {
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
  
  const handleCategoryClick = (category: Category) => {
    playSoundEffect('select');
    onCategorySelect(category.id);
  };

  const handleCategoryHover = (categoryId: string) => {
    if (hoveredCategory !== categoryId) {
      playSoundEffect('navigate');
      setHoveredCategory(categoryId);
    }
  };

  return (
    <div className="bg-firetv-dark h-full w-full overflow-y-auto p-4">
      <h2 className="text-2xl font-bold mb-6 text-firetv-text">Categories</h2>
      <div className="space-y-2">
        {categories.map((category) => (
          <div
            key={category.id}
            className={`category-item text-lg flex items-center space-x-3 ${
              activeCategory === category.id ? 'active animate-glow' : ''
            }`}
            onClick={() => handleCategoryClick(category)}
            onMouseEnter={() => handleCategoryHover(category.id)}
            tabIndex={0}
            role="button"
            aria-pressed={activeCategory === category.id}
          >
            <span className="text-2xl">{category.icon}</span>
            <span>{category.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CategorySidebar;
