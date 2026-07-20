'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import { ArrowRight, Play } from '@/public/icon';
import { ProjectSlider } from '../components/Common/project-slider';
import { FlowerBackground } from '../components/Common/flower-background';
import { Lightbox } from '../components/Common/light-box';
import { useProjects } from '../api/project-list-api';
import Link from 'next/link';
import { useLoadingStore } from '../store/loading.store';
import { useLanguage } from '../hooks/use-language';

const CARD_SIZE = 'w-[220px] h-[300px] md:w-[240px] md:h-[320px]';

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center bg-white/70 border border-txt-brown/15 text-txt-brown font-bold text-xs md:text-sm px-2.5 py-1 rounded-full shadow-sm align-middle">
      {children}
    </span>
  );
}

interface HeroCardProps {
  bg: string;
  rotate: string;
  title: string;
  desc: string;
  cta: string;
  href?: string;
  onClick?: () => void;
}

function HeroCard({
  bg,
  rotate,
  title,
  desc,
  cta,
  href,
  onClick,
}: HeroCardProps) {
  const ctaChip = (
    <span className="inline-flex items-center gap-1.5 bg-txt-darkBrown text-[#FBFAF1] text-xs md:text-sm font-bold px-4 py-2 rounded-full transition-opacity group-hover:opacity-90">
      {cta}
      <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
    </span>
  );

  const content = (
    <>
      <h3 className="text-xl md:text-2xl font-bold text-txt-brown mb-2.5">
        {title}
      </h3>
      <p className="text-xs md:text-sm text-txt-darkBrown/80 leading-relaxed flex-1">
        {desc}
      </p>
      {ctaChip}
    </>
  );

  const cardClassName = `group relative ${CARD_SIZE} shrink-0 flex flex-col rounded-[28px] p-6 shadow-[8px_8px_0px_rgba(45,27,27,0.12)] md:z-10 transition-transform duration-300 hover:-translate-y-1 hover:rotate-0 cursor-pointer ${rotate}`;

  if (href?.startsWith('mailto:')) {
    return (
      <a href={href} className={cardClassName} style={{ backgroundColor: bg }}>
        {content}
      </a>
    );
  }

  if (href) {
    return (
      <Link href={href} className={cardClassName} style={{ backgroundColor: bg }}>
        {content}
      </Link>
    );
  }

  return (
    <div
      onClick={onClick}
      className={cardClassName}
      style={{ backgroundColor: bg }}
    >
      {content}
    </div>
  );
}

const VIDEO_RESUME_URL = '/resume/yiting-video-resume.mp4';

function PhotoCard() {
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsLightboxOpen(true)}
        aria-label="Play video resume"
        className={`group relative ${CARD_SIZE} shrink-0 rounded-[28px] bg-white shadow-[8px_8px_0px_rgba(45,27,27,0.12)] p-3 md:p-4 cursor-pointer`}
      >
        <div className="relative rounded-[18px] overflow-hidden w-full h-full">
          {!isLightboxOpen && (
            <video
              src={VIDEO_RESUME_URL}
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-full object-cover"
            />
          )}
          <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/30 transition-all duration-300">
            <div className="w-12 h-12 flex items-center justify-center rounded-full bg-white/20 backdrop-blur-sm border border-white/30 text-white opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100 transition-all duration-300">
              <Play className="w-6 h-6 ml-0.5" />
            </div>
          </div>
        </div>
      </button>

      <Lightbox
        isOpen={isLightboxOpen}
        onClose={() => setIsLightboxOpen(false)}
        media={[{ type: 'video', url: VIDEO_RESUME_URL }]}
      />
    </>
  );
}

export default function Index() {
  const { isEn } = useLanguage();
  const [scrollY, setScrollY] = useState(0);
  const [isSliderVisible, setIsSliderVisible] = useState(false);
  const sliderRef = useRef<HTMLDivElement>(null);

  const { data: projects = [] } = useProjects();

  const hasShownInitialLoading = useLoadingStore.use.hasShownInitialLoading();
  const setInitialLoadingShown = useLoadingStore.use.setInitialLoadingShown();
  const showLoading = useLoadingStore.use.showLoading();
  const closeLoading = useLoadingStore.use.closeLoading();

  const [flowersLoaded, setFlowersLoaded] = useState(false);

  // Show 3-second loading on first visit only
  useEffect(() => {
    if (hasShownInitialLoading) return;

    showLoading();
    const timer = setTimeout(() => {
      closeLoading();
      setInitialLoadingShown();
    }, 2000);

    return () => {
      clearTimeout(timer);
      closeLoading();
    };
  }, [
    hasShownInitialLoading,
    showLoading,
    closeLoading,
    setInitialLoadingShown,
  ]);

  // Trigger flower entrance after initial loading is done
  useEffect(() => {
    if (hasShownInitialLoading && !flowersLoaded) {
      setFlowersLoaded(true);
    }
  }, [hasShownInitialLoading, flowersLoaded]);

  // Track raw scrollY for background fade and flower parallax
  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSlider = () =>
    sliderRef.current?.scrollIntoView({ behavior: 'smooth' });

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

    const red = Math.round(241 + (251 - 241) * progress);
    const green = Math.round(242 + (250 - 242) * progress);
    const blue = Math.round(202 + (241 - 202) * progress);

    return `rgb(${red}, ${green}, ${blue})`;
  };

  const heroCards = [
    <HeroCard
      key="work"
      bg="#F6E4B8"
      rotate="md:-rotate-3"
      title={isEn ? 'Recent Work' : '近期作品'}
      desc={
        isEn
          ? 'See how I turn messy problems into shipped, working products.'
          : '看我如何把複雜的需求，變成上線可用的產品。'
      }
      cta={isEn ? 'See Projects' : '查看作品'}
      href="/projects"
    />,
    <PhotoCard key="photo" />,
    <HeroCard
      key="journey"
      bg="#DCE9C4"
      rotate="md:rotate-3"
      title={isEn ? 'My Journey' : '我的歷程'}
      desc={
        isEn
          ? 'From backend, to product, to front-end. Here is how I got here.'
          : '從後端、產品到前端，這是我一路走來的故事。'
      }
      cta={isEn ? 'View Resume' : '查看履歷'}
      href="/resume"
    />,
    <HeroCard
      key="sayhi"
      bg="#F3D3C9"
      rotate="md:-rotate-3"
      title={isEn ? 'Say Hi' : '打聲招呼'}
      desc={
        isEn
          ? 'Have a project in mind or just want to chat? I would love to hear from you.'
          : '有專案想聊聊，或單純想打個招呼？歡迎與我聯繫。'
      }
      cta={isEn ? 'Email Me' : '寄信給我'}
      href="mailto:bz850308@gmail.com"
    />,
  ];

  return (
    <div
      className="overflow-hidden flex flex-col relative min-h-screen overflow-x-hidden"
      style={{ backgroundColor: getBackgroundColor() }}
    >
      {/* Main Section */}
      <div
        id="mainSection"
        className="relative z-10 min-h-screen flex flex-col justify-center items-center px-6 md:px-10 pt-32 pb-8 md:pt-40 md:pb-12"
      >
        <div
          id="flowerContainer"
          className="absolute inset-0 z-0 pointer-events-none"
        >
          <FlowerBackground scrollY={scrollY} isLoaded={flowersLoaded} />
        </div>

        <div className="flex flex-col items-center text-center z-10 gap-5 md:gap-6 max-w-4xl relative">
          <h1 className="text-[28px] sm:text-[36px] md:text-[42px] font-bold text-txt-brown tracking-tight leading-[1.2]">
            {isEn ? (
              <>
                Hi, I&apos;m Yiting.
                <br />
                Front-End Engineer &amp; Communicator.
              </>
            ) : (
              <>
                嗨，我是伊婷。
                <br />
                擅長溝通的前端工程師。
              </>
            )}
          </h1>

          <p className="text-sm md:text-lg text-txt-darkBrown/80 leading-relaxed max-w-xl">
            {isEn ? (
              <>
                Front-End Software Engineer who has also worked in backend and
                product management. Previously built e-commerce experiences
                at <Badge>Testrite · HOLA</Badge>, after leading product at{' '}
                <Badge>104 Job Bank</Badge>. Currently looking for my next
                front-end role.
              </>
            ) : (
              <>
                前端軟體工程師，曾走過後端與產品經理的路。曾在{' '}
                <Badge>特力屋・HOLA</Badge> 打磨電商前端體驗，先前在{' '}
                <Badge>104 人力銀行</Badge> 主導產品開發，目前正在尋找下一個挑戰。
              </>
            )}
          </p>
        </div>

        {/* Card stack: swiper on mobile, fanned row on desktop */}
        <div className="md:hidden w-full mt-6 relative z-10">
          <Swiper
            slidesPerView="auto"
            centeredSlides
            initialSlide={1}
            spaceBetween={16}
            className="!px-6 !pb-2"
          >
            {heroCards.map((card, i) => (
              <SwiperSlide key={i} className="!w-auto">
                {card}
              </SwiperSlide>
            ))}
          </Swiper>
        </div>

        <div className="hidden md:flex mt-10 w-full max-w-5xl items-stretch justify-center gap-6 relative z-10">
          {heroCards}
        </div>

        {/* Scroll Indicator */}
        <button
          onClick={scrollToSlider}
          className="mt-7 md:mt-10 flex flex-col items-center gap-2 opacity-60 hover:opacity-100 transition-opacity duration-300"
          aria-label={isEn ? 'Scroll to projects' : '滾動到作品區'}
        >
          <span className="text-[10px] md:text-xs font-bold tracking-[0.3em] text-txt-darkBrown uppercase">
            {isEn ? 'scroll' : '向下滾動'}
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
              className="text-txt-darkBrown w-5 h-5 md:w-6 md:h-6"
            >
              <path d="M7 13l5 5 5-5M7 6l5 5 5-5" />
            </svg>
          </div>
        </button>

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
        className={`py-16 transition-all duration-1000 reveal-section relative z-10 w-full ${isSliderVisible ? 'is-revealed' : ''}`}
      >
        <ProjectSlider title={isEn ? 'Featured Projects' : '精選作品'} projects={projects} />
      </div>
    </div>
  );
}
