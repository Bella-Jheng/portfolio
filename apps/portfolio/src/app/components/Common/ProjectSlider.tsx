'use client';

import React, { useRef } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { FreeMode, Navigation, Pagination } from 'swiper/modules';
import { ProjectCard } from './ProjectCard';
import { Swiper as SwiperType } from 'swiper';
import { ChevronLeft, ChevronRight } from '@/public/icon';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/free-mode';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import './ProjectSlider.scss';

import { Project } from '../../api/project-list-api.type';

interface ProjectSliderProps {
  title?: string;
  projects: Project[];
}

export const ProjectSlider: React.FC<ProjectSliderProps> = ({
  title,
  projects,
}) => {
  const swiperRef = useRef<SwiperType>(null);

  return (
    <div className="w-full py-12 group relative overflow-hidden slider-root">
      {title && (
        <div className="max-w-7xl mx-auto px-4 md:px-10 mb-8">
          <h2 className="text-2xl md:text-3xl font-black text-txt-darkBrown section-title">
            {title}
          </h2>
        </div>
      )}

      {/* Immersive Container: Calculated padding-left to match max-w-7xl mx-auto */}
      <div className="immersive-slider-container relative">
        <Swiper
          onBeforeInit={(swiper) => {
            swiperRef.current = swiper;
          }}
          slidesPerView={1.5}
          spaceBetween={16}
          freeMode={true}
          breakpoints={{
            640: {
              slidesPerView: 2.2,
              spaceBetween: 24,
            },
            1024: {
              slidesPerView: 3.2,
              spaceBetween: 30,
              freeMode: false,
            },
            1280: {
              slidesPerView: 4,
              spaceBetween: 30,
              freeMode: false,
            },
            1536: {
              slidesPerView: 4.5,
              spaceBetween: 30,
              freeMode: false,
            },
          }}
          modules={[FreeMode, Pagination, Navigation]}
          className="pb-14 project-slider !overflow-visible"
        >
          {projects.map((project, index) => (
            <SwiperSlide key={index}>
              <ProjectCard {...project} />
            </SwiperSlide>
          ))}
        </Swiper>

        {/* Custom Navigation Arrows (Visible on Hover over cards) */}
        <button
          onClick={() => swiperRef.current?.slidePrev()}
          className="absolute left-[calc(var(--page-gutter)+1rem)] top-[40%] -translate-y-1/2 z-50 w-12 h-12 bg-white/90 border border-gray-100 rounded-full shadow-lg flex items-center justify-center text-txt-darkBrown opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-white hover:scale-110 -translate-x-4 group-hover:translate-x-0"
          aria-label="Previous"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        <button
          onClick={() => swiperRef.current?.slideNext()}
          className="absolute right-6 top-[40%] -translate-y-1/2 z-50 w-12 h-12 bg-white/90 border border-gray-100 rounded-full shadow-lg flex items-center justify-center text-txt-darkBrown opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-white hover:scale-110 translate-x-4 group-hover:translate-x-0"
          aria-label="Next"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
};
