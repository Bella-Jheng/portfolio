'use client';

import React, { useState } from 'react';
import { ProjectSection } from '../../../api/project-detail-api.type';
import { ProjectSectionBlock } from './ProjectSectionBlock';

function tabLabelFor(section: ProjectSection): string {
  return section.tabLabel ?? section.title;
}

export function ProjectDetailTabs({ sections }: { sections: ProjectSection[] }) {
  const [activeIndex, setActiveIndex] = useState(0);

  if (sections.length === 0) return null;

  return (
    <div>
      <div className="flex flex-wrap justify-center gap-2 md:gap-3 overflow-x-auto">
        {sections.map((section, index) => {
          const isActive = index === activeIndex;
          return (
            <button
              key={index}
              onClick={() => setActiveIndex(index)}
              className={`shrink-0 px-4 py-2 rounded-full text-tiny md:text-sm font-bold whitespace-nowrap border transition-all duration-300 ${
                isActive
                  ? 'bg-[#8B9467] text-white border-[#8B9467] shadow-sm'
                  : 'bg-white text-txt-darkBrown border-gray-200 hover:border-txt-brown'
              }`}
            >
              {tabLabelFor(section)}
            </button>
          );
        })}
      </div>

      <div className="pt-8">
        <ProjectSectionBlock section={sections[activeIndex]} />
      </div>
    </div>
  );
}
