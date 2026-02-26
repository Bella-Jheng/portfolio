'use client';

import React, { useState } from 'react';

interface Tab {
  label: string;
  content: string;
}

interface CodeTabsProps {
  tabs: Tab[];
  className?: string;
}

export const CodeTabs: React.FC<CodeTabsProps> = ({ tabs, className = '' }) => {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <div
      className={`rounded-xl overflow-hidden border border-gray-200 bg-white shadow-sm ${className}`}
    >
      {/* Window Controls & Tabs Header */}
      <div className="flex flex-col md:flex-row md:items-center bg-gray-50 border-b border-gray-100">
        {/* Fake Window Controls (Mac style) */}
        <div className="hidden md:flex gap-2 px-4 py-3 border-r border-gray-100">
          <div className="w-3 h-3 rounded-full bg-[#FF5F56]" />
          <div className="w-3 h-3 rounded-full bg-[#FFBD2E]" />
          <div className="w-3 h-3 rounded-full bg-[#27C93F]" />
        </div>

        {/* Scrollable Tabs Container */}
        <div className="flex overflow-x-auto scrollbar-hide">
          {tabs.map((tab, index) => (
            <button
              key={index}
              onClick={() => setActiveTab(index)}
              className={`
                relative px-6 py-3 text-sm font-medium whitespace-nowrap transition-colors duration-200
                ${
                  activeTab === index
                    ? 'bg-white text-gray-900 border-t-2 border-t-txt-darkBrown'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100/50'
                }
              `}
            >
              {/* Optional: Add a file icon here if needed */}
              <span className="mr-2 opacity-60">{index + 1}.</span>
              {tab.label.replace(/[【】]/g, '')}{' '}
              {/* Clean up brackets for cleaner tab look */}
            </button>
          ))}
        </div>
      </div>

      {/* Content Area */}
      <div className="p-6 md:p-8 bg-white min-h-[200px]">
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
          <p className="text-gray-700 leading-relaxed text-sm md:text-base whitespace-pre-wrap">
            {tabs[activeTab].content}
          </p>
        </div>
      </div>
    </div>
  );
};
