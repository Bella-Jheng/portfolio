'use client';

import React, { useRef } from 'react';
import { ProjectCard } from '../project-card';
import { ChevronLeft, ChevronRight } from '@/public/icon';
import './ProjectSlider.scss';

import { Project } from '../../../api/project-list-api.type';

interface ProjectSliderProps {
  title?: string;
  projects: Project[];
}

/**
 * 首頁精選作品：用瀏覽器原生的橫向捲動 + scroll-snap，不用 Swiper。
 * Swiper 會自己判斷「滑動還是點擊」，在 iPhone 上常把點擊吃掉導致卡片點不進去；
 * 原生捲動由 iOS 自己分辨，點卡片一定會觸發連結。
 */
export const ProjectSlider: React.FC<ProjectSliderProps> = ({
  title,
  projects,
}) => {
  const scrollerRef = useRef<HTMLDivElement>(null);

  // 桌機箭頭：一次捲一張卡片的寬度；到底了再按下一張就回到第一張
  const scrollByCard = (direction: 1 | -1) => {
    const el = scrollerRef.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>('[data-slide]');
    const gap = parseFloat(getComputedStyle(el).columnGap) || 0;
    const step = (card?.offsetWidth ?? el.clientWidth * 0.8) + gap;
    const atEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 4;
    if (direction === 1 && atEnd) el.scrollTo({ left: 0, behavior: 'smooth' });
    else el.scrollBy({ left: step * direction, behavior: 'smooth' });
  };

  const arrowClass =
    'absolute top-[40%] -translate-y-1/2 z-50 w-12 h-12 bg-white/90 border border-gray-100 rounded-full shadow-lg hidden [@media(hover:hover)]:flex items-center justify-center text-txt-darkBrown opacity-0 group-hover/slider:opacity-100 transition-all duration-300 hover:bg-white hover:scale-110';

  return (
    <div className="w-full py-6 group/slider relative slider-root">
      {title && (
        <div className="max-w-7xl mx-auto px-4 md:px-10 mb-4">
          <h2 className="text-2xl md:text-3xl font-black text-txt-darkBrown section-title">
            {title}
          </h2>
        </div>
      )}

      <div className="relative">
        <div
          ref={scrollerRef}
          className="project-scroller flex gap-4 sm:gap-6 lg:gap-[30px] overflow-x-auto snap-x snap-mandatory overscroll-x-contain pb-8 pt-2"
        >
          {projects.map((project, index) => (
            <div
              key={index}
              data-slide
              className="snap-start shrink-0 w-[64%] sm:w-[42%] lg:w-[29%] xl:w-[23%] 2xl:w-[20%]"
            >
              <ProjectCard {...project} />
            </div>
          ))}
        </div>

        <button
          onClick={() => scrollByCard(-1)}
          className={`${arrowClass} left-[calc(var(--page-gutter)+1rem)] -translate-x-4 group-hover/slider:translate-x-0`}
          aria-label="Previous"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <button
          onClick={() => scrollByCard(1)}
          className={`${arrowClass} right-6 translate-x-4 group-hover/slider:translate-x-0`}
          aria-label="Next"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
};
