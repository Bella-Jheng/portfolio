'use client';

import React, { useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { FreeMode, Navigation, Thumbs } from 'swiper/modules';
import type { Swiper as SwiperType } from 'swiper';
import { Lightbox } from './lightbox/Lightbox';
import { Play, VideoIndicator } from '@/public/icon';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/free-mode';
import 'swiper/css/navigation';
import 'swiper/css/thumbs';

export interface MediaItem {
  type: 'image' | 'video';
  url: string;
  thumbnailUrl?: string;
}

interface ProjectGalleryProps {
  media: MediaItem[];
}

export const ProjectGallery: React.FC<ProjectGalleryProps> = ({ media }) => {
  const [thumbsSwiper, setThumbsSwiper] = useState<SwiperType | null>(null);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [activeMediaIndex, setActiveMediaIndex] = useState(0);

  const openLightbox = (index: number) => {
    setActiveMediaIndex(index);
    setIsLightboxOpen(true);
  };

  return (
    <div className="w-full flex flex-col md:flex-row gap-4 items-start overflow-hidden">
      {/* Main Swiper */}
      <div className="flex-1 min-w-0 w-full order-1 overflow-hidden">
        <Swiper
          style={
            {
              '--swiper-navigation-color': '#2D1B1B',
              '--swiper-pagination-color': '#2D1B1B',
              '--swiper-navigation-size': '30px',
            } as React.CSSProperties
          }
          spaceBetween={10}
          navigation={true}
          thumbs={{
            swiper:
              thumbsSwiper && !thumbsSwiper.destroyed ? thumbsSwiper : null,
          }}
          modules={[Navigation, Thumbs]}
          className="w-full aspect-[4/3] rounded-sm overflow-hidden bg-gray-100"
        >
          {media.map((item, index) => (
            <SwiperSlide key={index}>
              <div
                className="relative w-full h-full flex items-center justify-center cursor-zoom-in"
                onClick={() => openLightbox(index)}
              >
                {item.type === 'image' ? (
                  <img
                    src={item.url}
                    alt={`Project media ${index}`}
                    className="w-full h-full object-contain object-center bg-gray-200"
                  />
                ) : (
                  <div className="relative w-full h-full group">
                    <img
                      src={item.thumbnailUrl || item.url}
                      alt={`Project media ${index} thumbnail`}
                      className="w-full h-full object-contain object-center bg-gray-200"
                    />
                    {/* Video Mask / Play Button */}
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 group-hover:bg-black/50 transition-all duration-300">
                      <div className="w-20 h-20 flex items-center justify-center rounded-full bg-white/20 backdrop-blur-sm border border-white/30 text-white transform group-hover:scale-110 transition-transform duration-300">
                        <Play className="w-10 h-10 ml-1" />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {/* Thumbnails Swiper - Vertical on Desktop, Horizontal on Mobile */}
      <div className="w-full md:w-[40px] flex-shrink-0 md:h-full order-2 overflow-hidden">
        <Swiper
          onSwiper={setThumbsSwiper}
          spaceBetween={10}
          slidesPerView={'auto'}
          freeMode={true}
          watchSlidesProgress={true}
          direction={'horizontal'}
          breakpoints={{
            768: {
              direction: 'vertical',
            },
          }}
          modules={[Navigation, FreeMode, Thumbs]}
          className="w-full h-20 md:h-[300px] lg:h-[400px]"
        >
          {media.map((item, index) => (
            <SwiperSlide
              key={index}
              className="!w-[40px] !h-[40px] cursor-pointer opacity-40 transition-opacity duration-300 [&.swiper-slide-thumb-active]:opacity-100 border-2 border-transparent [&.swiper-slide-thumb-active]:border-txt-darkBrown rounded-sm overflow-hidden"
            >
              <div className="relative w-full h-full bg-gray-200">
                <img
                  src={item.thumbnailUrl || item.url}
                  alt={`Thumbnail ${index}`}
                  className="object-cover"
                />
                {item.type === 'video' && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                    <VideoIndicator className="w-6 h-6 text-white" />
                  </div>
                )}
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {/* Lightbox */}
      <Lightbox
        isOpen={isLightboxOpen}
        onClose={() => setIsLightboxOpen(false)}
        media={media}
        initialIndex={activeMediaIndex}
      />
    </div>
  );
};
