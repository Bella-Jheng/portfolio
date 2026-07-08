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
      <div className="flex justify-center gap-8 overflow-x-auto border-b border-gray-200">
        {sections.map((section, index) => {
          const isActive = index === activeIndex;
          return (
            <button
              key={index}
              onClick={() => setActiveIndex(index)}
              className={`relative shrink-0 pb-4 text-sm md:text-base font-bold transition-colors whitespace-nowrap ${
                isActive ? 'text-txt-darkBrown' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tabLabelFor(section)}
              {isActive && (
                <span className="absolute left-0 right-0 -bottom-px h-0.5 bg-txt-red" />
              )}
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
