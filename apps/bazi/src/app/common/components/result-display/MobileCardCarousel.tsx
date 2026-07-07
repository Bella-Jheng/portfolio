'use client';

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import type { Reading } from '../../../types/bazi';
import type { MagazineTheme } from './theme';
import { CardSlide } from './CardSlide';
import { BaziTableSlide } from './BaziTableSlide';
import { MajorFortuneSlide } from './MajorFortuneSlide';
import { PersonalitySummaryCard } from './PersonalitySummaryCard';

interface MobileCardCarouselProps {
  reading: Reading;
  theme: MagazineTheme;
}

const AUTOPLAY_MS = 4500;
const SPRING = { type: 'spring', stiffness: 260, damping: 26 } as const;
const SLIDE_COUNT = 2; // 基本排盤、大運分析

export function MobileCardCarousel({ reading, theme }: MobileCardCarouselProps) {
  const [index, setIndex] = useState(0);
  const [transitionConfig, setTransitionConfig] = useState<React.ComponentProps<typeof motion.div>['transition']>(SPRING);
  const [containerWidth, setContainerWidth] = useState(0);
  const [paused, setPaused] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const update = () => setContainerWidth(el.offsetWidth);
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  // 自動輪播：暫停中（拖曳時）不會排程，每次 index 改變都重新倒數
  useEffect(() => {
    if (paused) return;
    const timer = setTimeout(() => {
      setTransitionConfig(SPRING);
      setIndex((prev) => (prev + 1) % SLIDE_COUNT);
    }, AUTOPLAY_MS);
    return () => clearTimeout(timer);
  }, [index, paused]);

  const slideWidth = containerWidth || 320;
  const offset = -index * slideWidth;

  return (
    <div className="md:hidden flex flex-col gap-4">
      {/* 天生卡：固定顯示，不參與滑動（跟另外兩張表格高度差太多，放同一個 swiper 會很怪） */}
      <div className="bg-white border border-[#EAE5DF] rounded-3xl shadow-sm p-5">
        <CardSlide reading={reading} theme={theme} mobile />
      </div>

      {/* 基本排盤 / 大運分析：使用者通常看不懂，收成小 swiper */}
      <div>
        <div ref={containerRef} className="relative w-full overflow-hidden">
          <motion.div
            drag="x"
            dragConstraints={{ left: offset, right: offset }}
            dragElastic={0.3}
            onDragStart={() => { setPaused(true); setTransitionConfig(SPRING); }}
            onDragEnd={(_, info) => {
              setTransitionConfig(SPRING);
              if (info.offset.x < -50 && index < SLIDE_COUNT - 1) setIndex((prev) => prev + 1);
              else if (info.offset.x > 50 && index > 0) setIndex((prev) => prev - 1);
              setPaused(false);
            }}
            animate={{ x: offset }}
            transition={transitionConfig}
            className="flex items-stretch cursor-grab active:cursor-grabbing"
          >
            <div style={{ width: slideWidth }} className="shrink-0 px-1">
              <div className="bg-white border border-[#EAE5DF] rounded-3xl shadow-sm p-5">
                <BaziTableSlide reading={reading} theme={theme} mobile />
              </div>
            </div>
            <div style={{ width: slideWidth }} className="shrink-0 px-1">
              <div className="bg-white border border-[#EAE5DF] rounded-3xl shadow-sm p-5">
                <MajorFortuneSlide reading={reading} theme={theme} mobile />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Dots */}
        <div className="flex justify-center items-center gap-2 mt-3">
          {Array.from({ length: SLIDE_COUNT }, (_, i) => (
            <button
              key={i}
              onClick={() => { setTransitionConfig(SPRING); setIndex(i); }}
              aria-label={`第 ${i + 1} 張`}
              className={`h-2 rounded-full transition-all ${
                i === index ? 'w-5 bg-[#4A4A4A]' : 'w-2 bg-[#D8D2C8]'
              }`}
            />
          ))}
        </div>
      </div>

      {/* 命主特質速覽：固定在下方 */}
      <PersonalitySummaryCard reading={reading} theme={theme} />
    </div>
  );
}
