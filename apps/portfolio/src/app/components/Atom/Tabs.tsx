'use client';
import React from 'react';

interface ProjectTabsProps {
  categories: readonly string[];
  activeCategory: string;
  onCategoryChange: (category: string) => void;
}

export const ProjectTabs: React.FC<ProjectTabsProps> = ({
  categories,
  activeCategory,
  onCategoryChange,
}) => {
  return (
    <div className="w-full mb-8">
      <div className="flex flex-wrap gap-3 pb-6 border-b border-gray-700/30">
        {categories.map((category) => {
          const isActive = activeCategory === category;
          return (
            <button
              key={category}
              onClick={() => onCategoryChange(category)}
              className={`px-4 py-1.5 rounded-md text-sm transition-all duration-300 border ${
                isActive
                  ? 'bg-[#8B9467] text-white border-[#8B9467]shadow-sm hover:border-txt-brown'
                  : 'bg-white border-[#DEDDB8] text-txt-brown hover:border-txt-brown'
              }`}
            >
              {category}
            </button>
          );
        })}
      </div>
    </div>
  );
};
