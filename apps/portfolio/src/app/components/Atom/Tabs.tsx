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
    // 手機版：吸附在頂部 App bar 下方、可左右滑動的分類列
    <div className="w-auto md:w-full mb-6 md:mb-8 sticky md:static top-[calc(var(--appbar-h)+env(safe-area-inset-top))] z-25 -mx-4 px-4 md:mx-0 md:px-0 bg-[#F1F2CA]">
      <div className="flex md:flex-wrap gap-2 md:gap-3 py-3 md:pt-0 md:pb-6 border-b border-gray-700/30 overflow-x-auto md:overflow-visible [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {categories.map((category) => {
          const isActive = activeCategory === category;
          return (
            <button
              key={category}
              onClick={() => onCategoryChange(category)}
              className={`shrink-0 whitespace-nowrap px-4 py-1.5 rounded-full md:rounded-md text-sm transition-all duration-300 border active:scale-95 ${
                isActive
                  ? 'bg-[#8B9467] text-white border-[#8B9467] shadow-sm hover:border-txt-brown'
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
