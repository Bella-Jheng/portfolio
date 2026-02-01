'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ArrowRight } from '@/public/icon';
import { BlueFlower } from '@/public/img';
import { ProjectSlider } from '../components/Common/ProjectSlider';
import { FlowerBackground } from '../components/Common/FlowerBackground';
import { LoadingScreen } from '../components/Common/LoadingScreen';
import { useProjects } from '../api/project-list-api';
import { useLoadingStore } from '../store/loading.store';

export default function Index() {
  const [scrollY, setScrollY] = useState(0);
  const [isSliderVisible, setIsSliderVisible] = useState(false);
  const [hasSurged, setHasSurged] = useState(false);
  const sliderRef = useRef<HTMLDivElement>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [showLoadingScreen, setShowLoadingScreen] = useState(true);

  const { data: projects = [], isLoading: isDataLoading } = useProjects();

  const showLoading = useLoadingStore.use.showLoading();
  const closeLoading = useLoadingStore.use.closeLoading();

  useEffect(() => {
    showLoading();
    const timer = setTimeout(() => {
      setIsLoading(false);
      closeLoading();
      setTimeout(() => setShowLoadingScreen(false), 1000);
    }, 2000);
    return () => clearTimeout(timer);
  }, [showLoading, closeLoading]);

  // Track raw scrollY and trigger active surge
  useEffect(() => {
    const handleScroll = () => {
      const currentScroll = window.scrollY;
      setScrollY(currentScroll);

      // Active surge: Auto-scroll to slider if user starts scrolling down
      const surgeThreshold = 60;
      if (currentScroll > surgeThreshold && !hasSurged) {
        setHasSurged(true);
        sliderRef.current?.scrollIntoView({ behavior: 'smooth' });
      }

      // Reset surge if user returns to top
      if (currentScroll < 10 && hasSurged) {
        setHasSurged(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [hasSurged]);

  // Slider reveal intersection
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsSliderVisible(true);
        }
      },
      { threshold: 0.15 },
    );

    if (sliderRef.current) {
      observer.observe(sliderRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Interpolate background color from #F1F2CA to #FBFAF1
  const getBackgroundColor = () => {
    // #F1F2CA -> RGB(241, 242, 202)
    // #FBFAF1 -> RGB(251, 250, 241)

    // Threshold where transition completes (e.g. 600px scroll)
    const fadeDistance = 600;
    const progress = Math.min(1, Math.max(0, scrollY / fadeDistance));

    const r = Math.round(241 + (251 - 241) * progress);
    const g = Math.round(242 + (250 - 242) * progress);
    const b = Math.round(202 + (241 - 202) * progress);

    return `rgb(${r}, ${g}, ${b})`;
  };

  return (
    <div
      className="overflow-hidden flex flex-col relative min-h-screen overflow-x-hidden"
      style={{ backgroundColor: getBackgroundColor() }}
    >
      {showLoadingScreen && (
        <LoadingScreen
          className={`transition-opacity duration-1000 ease-out ${
            isLoading || isDataLoading
              ? 'opacity-100'
              : 'opacity-0 pointer-events-none'
          }`}
        />
      )}

      <div
        id="flowerContainer"
        className="absolute inset-0 z-0 pointer-events-none"
      >
        <FlowerBackground scrollY={scrollY} isLoaded={!isLoading} />
      </div>
      {/* Main Section */}
      <div
        id="mainSection"
        className="h-screen relative z-10 min-h-[calc(100vh-155px)] md:min-h-[calc(100vh-150px)] flex flex-col justify-center items-center px-10 py-10 md:py-20 overflow-hidden"
      >
        <div className="flex flex-col items-start translate-x-4 z-10 gap-6 lg:gap-12 max-w-4xl relative">
          {/* Quote Block with Braces */}
          <div className="relative">
            {/* Top Left Brace */}
            <span className="hidden md:block absolute -left-16 lg:-left-28 -top-12 text-[70px] lg:text-[80px] font-thin text-txt-brown leading-none select-none transform rotate-12 skew-x-12">
              {'{'}
            </span>

            <div className="flex flex-col text-left">
              <h2 className="text-[50px] md:text-[85px] font-semibold text-txt-brown tracking-tighter leading-[0.9] flex items-center">
                <span className="text-txt-red transition-all duration-300 hover:scale-110 cursor-default">
                  &ldquo;
                </span>
                <span className="text-txt-red">Code</span>&nbsp;with
              </h2>
              <h2 className="text-[50px] md:text-[85px] font-semibold text-txt-brown tracking-tighter leading-[0.9]">
                purpose.
              </h2>
              <h2 className="text-[50px] md:text-[85px] font-semibold text-txt-brown tracking-tighter leading-[0.9]">
                Design with
              </h2>
              <h2 className="text-[50px] md:text-[85px] font-semibold text-txt-brown tracking-tighter leading-[0.9] relative">
                <img
                  src={BlueFlower.src}
                  alt=""
                  className="absolute -left-10 md:-left-20 top-1/2 -translate-y-1/2 w-8 h-8 md:w-16 md:h-16"
                />
                users in mind.
                <span className="text-txt-red transition-all duration-300 hover:scale-110 cursor-default">
                  &rdquo;
                </span>
                {/* Bottom Right Brace */}
                <span className="hidden md:block absolute -right-16 lg:-right-32 -bottom-12 text-[70px] lg:text-[80px] font-thin text-txt-brown leading-none select-none transform rotate-12 skew-x-12">
                  {'}'}
                </span>
              </h2>
            </div>
          </div>

          <div className="mt-4">
            <button className="group flex items-center gap-2 border-2 border-[#2D1B1B] px-6 py-2 md:px-7 md:py-2.5 rounded-full font-semibold text-[#2D1B1B] text-sm md:text-base shadow-[4px_4px_0px_rgba(45,27,27,0.2)] md:shadow-[5px_5px_0px_rgba(45,27,27,0.2)] hover:shadow-none transition-all active:translate-x-[2px] active:translate-y-[2px]">
              More About Me
              <ArrowRight className="w-4 h-4 md:w-5 md:h-5 transition-transform group-hover:translate-x-1" />
            </button>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-60 hover:opacity-100 transition-opacity duration-300">
          <span className="text-[10px] md:text-xs font-bold tracking-[0.3em] text-[#2D1B1B] uppercase">
            scroll
          </span>
          <div className="animate-bounce-slow">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-[#2D1B1B] w-5 h-5 md:w-6 md:h-6"
            >
              <path d="M7 13l5 5 5-5M7 6l5 5 5-5" />
            </svg>
          </div>
        </div>

        <style jsx>{`
          @keyframes bounce-slow {
            0%,
            100% {
              transform: translateY(0);
            }
            50% {
              transform: translateY(10px);
            }
          }
          .animate-bounce-slow {
            animation: bounce-slow 2s infinite ease-in-out;
          }
        `}</style>
      </div>

      {/* Project Slider Section */}
      <div
        id="projectSliderSection"
        ref={sliderRef}
        className={`py-32 transition-all duration-1000 reveal-section relative z-10 w-full min-h-screen ${isSliderVisible ? 'is-revealed' : ''}`}
      >
        <ProjectSlider title="您可能會喜歡" projects={projects} />
      </div>
    </div>
  );
}
