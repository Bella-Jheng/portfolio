'use client';

import React, { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Overlay } from '../Atom/Overlay';
import {
  Play,
  VideoIndicator,
  VolumeMute,
  VolumeUp,
  Close,
} from '@/public/icon';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Thumbs, FreeMode, Zoom } from 'swiper/modules';

import type { Swiper as SwiperType } from 'swiper';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/thumbs';
import 'swiper/css/free-mode';
import 'swiper/css/zoom';

export interface MediaItem {
  type: 'image' | 'video';
  url: string;
  thumbnailUrl?: string;
}

interface LightboxProps {
  isOpen: boolean;
  onClose: () => void;
  media: MediaItem[];
  initialIndex?: number;
}

const getYouTubeId = (url: string) => {
  const regExp =
    /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
};

const VideoSlide: React.FC<{ url: string; isActive: boolean }> = ({
  url,
  isActive,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const youtubeId = getYouTubeId(url);

  useEffect(() => {
    if (!isActive && videoRef.current) {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  }, [isActive]);

  const togglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  if (youtubeId) {
    return (
      <div className="relative w-full h-full flex items-center justify-center">
        {isActive && (
          <iframe
            src={`https://www.youtube.com/embed/${youtubeId}?autoplay=0&mute=${
              isMuted ? 1 : 0
            }`}
            className="w-full h-full max-w-5xl aspect-video"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        )}
      </div>
    );
  }

  return (
    <div className="relative w-full h-full flex items-center justify-center group/video">
      <video
        ref={videoRef}
        src={url}
        className="max-w-full max-h-full object-contain"
        playsInline
        muted={isMuted}
        onClick={togglePlay}
      />

      {/* Play Button Overlay */}
      {!isPlaying && (
        <button
          onClick={togglePlay}
          className="absolute inset-0 flex items-center justify-center bg-black/20 transition-all duration-300"
        >
          <div className="w-20 h-20 flex items-center justify-center rounded-full bg-black/40 backdrop-blur-sm border border-white/30 text-white transform hover:scale-110 transition-transform duration-300">
            <Play className="w-10 h-10 ml-1" />
          </div>
        </button>
      )}

      {/* Mute/Unmute Toggle */}
      <button
        onClick={toggleMute}
        className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/40 backdrop-blur-sm text-white hover:bg-black/60 transition-colors w-10 h-10 flex items-center justify-center"
      >
        {isMuted ? (
          <VolumeMute className="w-6 h-6" />
        ) : (
          <VolumeUp className="w-6 h-6" />
        )}
      </button>
    </div>
  );
};

export const Lightbox: React.FC<LightboxProps> = ({
  isOpen,
  onClose,
  media,
  initialIndex = 0,
}) => {
  const [thumbsSwiper, setThumbsSwiper] = useState<SwiperType | null>(null);

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleEsc);
    }
    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[1000] flex flex-col items-center justify-center">
      <Overlay className="absolute inset-0" onClick={onClose} zIndex={-1} />

      {/* Close button - Top Right of screen */}

      <button
        onClick={onClose}
        className="absolute top-6 right-6 z-[110] p-2 bg-black/20 hover:bg-black/40 rounded-full text-white/70 hover:text-white transition-all w-12 h-12 flex items-center justify-center text-3xl font-light"
        aria-label="Close"
      >
        <Close className="w-8 h-8" />
      </button>

      <div
        className="w-full max-w-6xl max-h-[85vh] flex flex-col items-center justify-center p-4 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Main Swiper */}
        <div className="w-full h-[60vh] min-w-0 overflow-hidden">
          <Swiper
            initialSlide={initialIndex}
            modules={[Navigation, Thumbs, Zoom]}
            navigation
            thumbs={{
              swiper:
                thumbsSwiper && !thumbsSwiper.destroyed ? thumbsSwiper : null,
            }}
            zoom={true}
            spaceBetween={30}
            style={
              {
                '--swiper-navigation-size': '30px',
              } as React.CSSProperties
            }
            className="w-full h-full [&>.swiper-button-next]:text-white [&>.swiper-button-prev]:text-white"
          >
            {media.map((item, index) => (
              <SwiperSlide
                key={index}
                zoom={item.type === 'image'}
                className="flex items-center justify-center h-full"
              >
                {({ isActive }) => (
                  <div className="relative w-full h-full flex items-center justify-center">
                    {item.type === 'image' ? (
                      <div className="swiper-zoom-container relative w-full h-full">
                        <img
                          src={item.url}
                          alt={`Gallery item ${index}`}
                          className="object-contain"
                          sizes="100vw"
                        />
                      </div>
                    ) : (
                      <VideoSlide url={item.url} isActive={isActive} />
                    )}
                  </div>
                )}
              </SwiperSlide>
            ))}
          </Swiper>
        </div>

        {/* Thumbnails Swiper */}
        <div className="w-full mt-12 flex justify-center">
          <div className="w-full max-w-2xl">
            <Swiper
              onSwiper={setThumbsSwiper}
              initialSlide={initialIndex}
              spaceBetween={10}
              slidesPerView={'auto'}
              centerInsufficientSlides={true}
              freeMode={true}
              watchSlidesProgress={true}
              modules={[FreeMode, Navigation, Thumbs]}
              className="w-full h-[60px]"
            >
              {media.map((item, index) => (
                <SwiperSlide
                  key={index}
                  className="!w-[60px] !h-[60px] aspect-square cursor-pointer opacity-40 transition-opacity duration-300 [&.swiper-slide-thumb-active]:opacity-100 border-2 border-transparent [&.swiper-slide-thumb-active]:border-white rounded-[0.5rem] overflow-hidden"
                >
                  <div className="relative w-full h-full bg-gray-800">
                    <img
                      src={item.thumbnailUrl || item.url}
                      alt={`Lightbox thumbnail ${index}`}
                      className="w-full h-full object-cover object-center"
                    />
                    {item.type === 'video' && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                        <span className="text-xl">📹</span>
                      </div>
                    )}
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
};
