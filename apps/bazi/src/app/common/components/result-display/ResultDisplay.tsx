'use client';

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import type { Reading } from '../../../types/bazi';
import { useAuth } from '../../../lib/auth-context';
import { STEM_ELEMENT, ELEMENT_THEME, DEFAULT_THEME } from './theme';
import { CardSlide } from './CardSlide';
import { BaziTableSlide } from './BaziTableSlide';
import { TenGodsSlide } from './TenGodsSlide';
import { MajorFortuneSlide } from './MajorFortuneSlide';
import { CycleAnalysisSlide } from './CycleAnalysisSlide';
import { StandardSlide } from './StandardSlide';
import { ActionSlide } from './ActionSlide';
import { QASection } from './QASection';

interface ResultDisplayProps {
  reading: Reading;
  onUpdate: (updated: Reading) => void;
}

const SLIDE_TITLES = [
  '精美天生卡', '排盤', '十神 · 命格', '大運 / 流年', '大運 × 流年解析', '命盤總覽', '性格特質',
  '整體運勢', '財運狀況', '工作事業', '感情桃花', '健康狀況', '補運建議', '年度重點行動建議',
];

// Infinite carousel: 14 slides (0–13), prepend last (13), append first (0)
const TRACK_ITEMS = [13, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 0];

const MOBILE_SECTIONS = (reading: Reading, theme: ReturnType<typeof deriveTheme>) => [
  <CardSlide key="card" reading={reading} theme={theme} mobile />,
  <BaziTableSlide key="bazi" reading={reading} theme={theme} mobile />,
  <TenGodsSlide key="tengods" reading={reading} theme={theme} mobile />,
  <MajorFortuneSlide key="fortune" reading={reading} theme={theme} mobile />,
  <CycleAnalysisSlide key="cycle" reading={reading} theme={theme} mobile />,
  <StandardSlide key="overview" title="命盤總覽" emoji="📋" content={reading.fortune.overview} accentColor={theme.accent} mobile />,
  <StandardSlide key="personality" title="性格特質" emoji="🔮" content={reading.fortune.personality} accentColor={theme.accent} mobile />,
  <StandardSlide key="fortune" title="整體運勢" emoji="🌟" content={reading.fortune.fortune} accentColor="#FCD060" mobile />,
  <StandardSlide key="wealth" title="財運狀況" emoji="💰" content={reading.fortune.wealth} accentColor="#D4A017" mobile />,
  <StandardSlide key="career" title="工作事業" emoji="💼" content={reading.fortune.career} accentColor="#60A8D0" mobile />,
  <StandardSlide key="romance" title="感情桃花" emoji="🌸" content={reading.fortune.romance} accentColor="#E87878" mobile />,
  <StandardSlide key="health" title="健康狀況" emoji="🌿" content={reading.fortune.health} accentColor="#7AC97A" mobile />,
  <StandardSlide key="remedy" title="補運建議" emoji="✨" content={reading.fortune.remedy} accentColor={theme.accent} mobile />,
  <ActionSlide key="actions" actionsText={reading.fortune.actions} accentColor={theme.accent} mobile />,
];

function deriveTheme(reading: Reading) {
  const dayElement = STEM_ELEMENT[reading.pillars?.day?.stem ?? ''] ?? '';
  return ELEMENT_THEME[dayElement] ?? DEFAULT_THEME;
}

function renderSlide(
  contentIdx: number,
  reading: Reading,
  theme: ReturnType<typeof deriveTheme>,
) {
  const f = reading.fortune;
  switch (contentIdx) {
    case 0:  return <CardSlide reading={reading} theme={theme} />;
    case 1:  return <BaziTableSlide reading={reading} theme={theme} />;
    case 2:  return <TenGodsSlide reading={reading} theme={theme} />;
    case 3:  return <MajorFortuneSlide reading={reading} theme={theme} />;
    case 4:  return <CycleAnalysisSlide reading={reading} theme={theme} />;
    case 5:  return <StandardSlide title="命盤總覽" emoji="📋" content={f.overview} accentColor={theme.accent} />;
    case 6:  return <StandardSlide title="性格特質" emoji="🔮" content={f.personality} accentColor={theme.accent} />;
    case 7:  return <StandardSlide title="整體運勢" emoji="🌟" content={f.fortune} accentColor="#FCD060" />;
    case 8:  return <StandardSlide title="財運狀況" emoji="💰" content={f.wealth} accentColor="#D4A017" />;
    case 9:  return <StandardSlide title="工作事業" emoji="💼" content={f.career} accentColor="#60A8D0" />;
    case 10: return <StandardSlide title="感情桃花" emoji="🌸" content={f.romance} accentColor="#E87878" />;
    case 11: return <StandardSlide title="健康狀況" emoji="🌿" content={f.health} accentColor="#7AC97A" />;
    case 12: return <StandardSlide title="補運建議" emoji="✨" content={f.remedy} accentColor={theme.accent} />;
    case 13: return <ActionSlide actionsText={f.actions} accentColor={theme.accent} />;
    default: return null;
  }
}

export function ResultDisplay({ reading, onUpdate }: ResultDisplayProps) {
  const { isAdmin, getToken } = useAuth();
  const [recalculating, setRecalculating] = useState(false);
  const [trackIndex, setTrackIndex] = useState(1);
  const [transitionConfig, setTransitionConfig] = useState<React.ComponentProps<typeof motion.div>['transition']>({
    type: 'spring', stiffness: 260, damping: 26,
  });
  const [containerWidth, setContainerWidth] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const theme = deriveTheme(reading);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const update = () => setContainerWidth(el.offsetWidth);
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
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
      if (!res.ok) { alert(data.error || '重新計算失敗'); return; }
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
  const slideIndex = trackIndex === 0 ? 13 : trackIndex === 15 ? 0 : trackIndex - 1;

  return (
    <motion.div
      className="w-full space-y-10 text-[#4A4A4A]"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      {/* Mobile: vertical sections */}
      <div className="md:hidden space-y-4">
        {MOBILE_SECTIONS(reading, theme).map((section) => (
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
              if (trackIndex === 0) { setTransitionConfig({ duration: 0 }); setTrackIndex(14); }
              else if (trackIndex === 15) { setTransitionConfig({ duration: 0 }); setTrackIndex(1); }
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
                    {renderSlide(contentIdx, reading, theme)}
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
            <span className="text-[10px] font-mono text-[#6B6159] tracking-widest shrink-0">{slideIndex + 1} / 14</span>
            <div className="h-1 flex-1 bg-black/5 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#4A4A4A] transition-all duration-300 ease-out"
                style={{ width: `${((slideIndex + 1) / 14) * 100}%` }}
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

      <QASection reading={reading} theme={theme} onUpdate={onUpdate} />
    </motion.div>
  );
}
