'use client';

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import type { Reading } from '../../../types/bazi';
import { useAuth } from '../../../lib/auth-context';
import { STEM_ELEMENT, ELEMENT_THEME, DEFAULT_THEME } from './theme';
import { CardSlide } from './CardSlide';
import { BaziTableSlide } from './BaziTableSlide';
import { MajorFortuneSlide } from './MajorFortuneSlide';
import { TabSection } from './TabSection';
import { QASection } from './QASection';
import { AdminQASection } from './AdminQASection';

interface ResultDisplayProps {
  reading: Reading;
  onUpdate: (updated: Reading) => void;
}

// Carousel: 3 slides — 天生卡 (0), 基本排盤 (1), 大運流年 (2)
const SLIDE_TITLES = ['精美天生卡', '排盤', '大運 / 流年'];

// Infinite carousel for 3 slides: prepend last (2), real slides (0,1,2), append first (0)
const TRACK_ITEMS = [2, 0, 1, 2, 0];

const MOBILE_SECTIONS = (reading: Reading, theme: ReturnType<typeof deriveTheme>, onTabSelect: (idx: number) => void) => [
  <CardSlide key="card" reading={reading} theme={theme} mobile onTabSelect={onTabSelect} />,
  <BaziTableSlide key="bazi" reading={reading} theme={theme} mobile />,
  <MajorFortuneSlide key="fortune" reading={reading} theme={theme} mobile />,
];

function deriveTheme(reading: Reading) {
  const dayElement = STEM_ELEMENT[reading.pillars?.day?.stem ?? ''] ?? '';
  return ELEMENT_THEME[dayElement] ?? DEFAULT_THEME;
}

function renderSlide(
  contentIdx: number,
  reading: Reading,
  theme: ReturnType<typeof deriveTheme>,
  onTabSelect: (idx: number) => void,
) {
  switch (contentIdx) {
    case 0: return <CardSlide reading={reading} theme={theme} onTabSelect={onTabSelect} />;
    case 1: return <BaziTableSlide reading={reading} theme={theme} />;
    case 2: return <MajorFortuneSlide reading={reading} theme={theme} />;
    default: return null;
  }
}

export function ResultDisplay({ reading, onUpdate }: ResultDisplayProps) {
  const { isAdmin, getToken } = useAuth();
  const [recalculating, setRecalculating] = useState(false);
  const [showTopBtn, setShowTopBtn] = useState(false);
  const [trackIndex, setTrackIndex] = useState(1);
  const [transitionConfig, setTransitionConfig] = useState<React.ComponentProps<typeof motion.div>['transition']>({
    type: 'spring', stiffness: 260, damping: 26,
  });
  const [containerWidth, setContainerWidth] = useState(0);
  const [activeTabIdx, setActiveTabIdx] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const tabSectionRef = useRef<HTMLDivElement>(null);
  const theme = deriveTheme(reading);

  const handleTabSelect = (idx: number) => {
    setActiveTabIdx(idx);
    setTimeout(() => {
      tabSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
  };

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const update = () => setContainerWidth(el.offsetWidth);
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  useEffect(() => {
    const onScroll = () => setShowTopBtn(window.scrollY > 400);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((document.activeElement?.tagName ?? ''))) return;
      if (event.key === 'ArrowRight') setTrackIndex((prevIndex) => prevIndex + 1);
      if (event.key === 'ArrowLeft') setTrackIndex((prevIndex) => prevIndex - 1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const spring = () => setTransitionConfig({ type: 'spring', stiffness: 260, damping: 26 });

  const handleRecalculate = async () => {
    setRecalculating(true);
    try {
      const token = await getToken();
      const res = await fetch(`/api/result/${reading.id}/recalculate`, {
        method: 'PUT',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await res.json();
      if (!res.ok) { if (data.aiStatusText) console.error('後端api失敗訊息', data.aiStatusText); alert(data.error || '重新計算失敗'); return; }
      onUpdate({ ...reading, pillars: data.pillars, fortune: data.fortune, questions: data.questions });
    } catch {
      alert('網路錯誤，請稍後再試');
    } finally {
      setRecalculating(false);
    }
  };

  const cardWidth = containerWidth ? Math.min(containerWidth * 0.85, 760) : 320;
  const gap = 24;
  const offset = containerWidth ? (containerWidth - cardWidth) / 2 - trackIndex * (cardWidth + gap) : 0;
  const arrowInset = containerWidth ? Math.max(4, Math.round((containerWidth - cardWidth) / 4 - 20)) : 4;
  const slideIndex = trackIndex === 0 ? 2 : trackIndex === 4 ? 0 : trackIndex - 1;

  return (
    <motion.div
      className="w-full space-y-10 text-[#4A4A4A]"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      {/* Mobile: vertical sections */}
      <div className="md:hidden space-y-4">
        {MOBILE_SECTIONS(reading, theme, handleTabSelect).map((section) => (
          <div key={section.key} className="bg-white border border-[#EAE5DF] rounded-3xl shadow-sm p-5">
            {section}
          </div>
        ))}
      </div>

      {/* Desktop: horizontal carousel */}
      <div className="hidden md:block relative">
        <button
          onClick={() => { spring(); setTrackIndex((prevIndex) => prevIndex - 1); }}
          className="absolute top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full border border-[#EAE5DF] bg-white flex items-center justify-center text-[#4A4A4A] hover:bg-[#FAF7F4] active:scale-95 transition-all shadow-sm"
          style={{ left: arrowInset }}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <div ref={containerRef} className="relative w-full overflow-hidden py-4">
          <motion.div
            drag="x"
            dragConstraints={{ left: offset, right: offset }}
            dragElastic={0.4}
            onDragStart={spring}
            onDragEnd={(_, info) => {
              spring();
              if (info.offset.x < -70) setTrackIndex((prevIndex) => prevIndex + 1);
              else if (info.offset.x > 70) setTrackIndex((prevIndex) => prevIndex - 1);
            }}
            animate={{ x: offset }}
            transition={transitionConfig}
            onAnimationComplete={() => {
              if (trackIndex === 0) { setTransitionConfig({ duration: 0 }); setTrackIndex(3); }
              else if (trackIndex === 4) { setTransitionConfig({ duration: 0 }); setTrackIndex(1); }
            }}
            className="flex items-stretch cursor-grab active:cursor-grabbing"
          >
            {TRACK_ITEMS.map((contentIdx, trackIdx) => (
              <div
                key={trackIdx}
                style={{ width: cardWidth }}
                className={`mx-3 shrink-0 transition-all duration-300 origin-center flex items-stretch ${
                  trackIdx === trackIndex ? 'opacity-100 scale-100' : 'opacity-40 scale-95 pointer-events-none'
                }`}
              >
                <div className="w-full bg-white border border-[#EAE5DF] rounded-3xl shadow-md p-6 md:p-8 flex flex-col h-[580px] overflow-hidden">
                  <div className="flex-1 flex items-stretch w-full min-h-0">
                    {renderSlide(contentIdx, reading, theme, handleTabSelect)}
                  </div>
                </div>
              </div>
            ))}
          </motion.div>
        </div>

        <button
          onClick={() => { spring(); setTrackIndex((prevIndex) => prevIndex + 1); }}
          className="absolute top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full border border-[#EAE5DF] bg-white flex items-center justify-center text-[#4A4A4A] hover:bg-[#FAF7F4] active:scale-95 transition-all shadow-sm"
          style={{ right: arrowInset }}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>

        <div className="flex flex-col items-center gap-1.5 mt-2">
          <span className="text-xs font-bold tracking-widest text-[#636363] uppercase">{SLIDE_TITLES[slideIndex]}</span>
          <div className="flex items-center gap-3 w-full max-w-[240px]">
            <span className="text-[10px] font-mono text-[#6B6159] tracking-widest shrink-0">{slideIndex + 1} / 3</span>
            <div className="h-1 flex-1 bg-black/5 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#4A4A4A] transition-all duration-300 ease-out"
                style={{ width: `${((slideIndex + 1) / 3) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {isAdmin && (
        <div className="flex justify-center -mt-4">
          <motion.button
            onClick={handleRecalculate}
            disabled={recalculating}
            className="text-xs text-[#6B6159] border border-[#EAE5DF] bg-white px-5 py-2 rounded-full hover:border-[#E87878] hover:text-[#E87878] transition-all disabled:opacity-40 shadow-sm"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {recalculating ? '重新計算中…' : '↺ 重新排盤（Admin）'}
          </motion.button>
        </div>
      )}

      {/* Tab section: all other slides */}
      <div ref={tabSectionRef}>
        <TabSection reading={reading} theme={theme} activeTabIdx={activeTabIdx} onActiveTabChange={setActiveTabIdx} />
      </div>

      <QASection reading={reading} theme={theme} onUpdate={onUpdate} />

      {isAdmin && (
        <AdminQASection reading={reading} onUpdate={onUpdate} />
      )}

      {showTopBtn && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-6 right-6 z-50 w-11 h-11 rounded-full bg-[#4A4A4A]/80 hover:bg-[#2D2420] text-white shadow-lg backdrop-blur-sm transition-all flex items-center justify-center"
          aria-label="回到頂端"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
          </svg>
        </button>
      )}
    </motion.div>
  );
}
