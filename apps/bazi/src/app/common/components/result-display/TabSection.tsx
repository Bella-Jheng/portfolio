'use client';

import { useRef, useEffect } from 'react';
import type { Reading } from '../../../types/bazi';
import type { MagazineTheme } from './theme';
import { TenGodsSlide } from './TenGodsSlide';
import { CycleAnalysisSlide } from './CycleAnalysisSlide';
import { StandardSlide } from './StandardSlide';
import { ActionSlide } from './ActionSlide';

interface TabDef {
  id: string;
  num: string;
  label: string;
  subtitle: string;
  emoji: string;
  accentColor: string | null;
}

const buildTabs = (accent: string): TabDef[] => [
  { id: 'cycle',    num: '01', label: '大運×流年解析', subtitle: '當前大運流年交互影響分析',              emoji: '🌊', accentColor: null },
  { id: 'tengods',  num: '02', label: '個性特質',      subtitle: '命格解讀、十神分析與內外在性格全觀',    emoji: '🔮', accentColor: accent },
  { id: 'wealth',   num: '03', label: '財運狀況',      subtitle: '財富能量與正偏財運解析',               emoji: '💰', accentColor: '#D4A017' },
  { id: 'career',   num: '04', label: '工作事業',      subtitle: '職場發展方向與機遇分析',               emoji: '💼', accentColor: '#60A8D0' },
  { id: 'romance',  num: '05', label: '感情桃花',      subtitle: '感情模式與姻緣時機解析',               emoji: '🌸', accentColor: '#E87878' },
  { id: 'health',   num: '06', label: '健康狀況',      subtitle: '身體能量強弱與注意事項',               emoji: '🌿', accentColor: '#7AC97A' },
  { id: 'remedy',   num: '07', label: '補運建議',      subtitle: '強化五行與改善運勢的方法',             emoji: '✨', accentColor: accent },
  { id: 'actions',  num: '08', label: '年度行動建議',  subtitle: '重點方向與具體行動計畫',               emoji: '🎯', accentColor: accent },
];

interface TabSectionProps {
  reading: Reading;
  theme: MagazineTheme;
  activeTabIdx: number;
  onActiveTabChange: (idx: number) => void;
}

export function TabSection({ reading, theme, activeTabIdx, onActiveTabChange }: TabSectionProps) {
  const activeIdx = activeTabIdx;
  const setActiveIdx = onActiveTabChange;
  const tabBarRef = useRef<HTMLDivElement>(null);
  const fortune = reading.fortune;
  const tabs = buildTabs(theme.accent);

  useEffect(() => {
    const bar = tabBarRef.current;
    if (!bar) return;
    const activeEl = bar.querySelector(`[data-tab="${activeIdx}"]`) as HTMLElement | null;
    if (activeEl) activeEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  }, [activeIdx]);

  const scrollToTabBar = () =>
    tabBarRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  const renderContent = () => {
    const tab = tabs[activeIdx];
    const accent = tab.accentColor ?? theme.accent;
    switch (tab.id) {
      case 'cycle':    return <CycleAnalysisSlide reading={reading} theme={theme} mobile />;
      case 'tengods':
        return (
          <div className="flex flex-col gap-6">
            {/* Intro：personality 摘要卡 */}
            {fortune.personality && (
              <div
                className="rounded-2xl p-4 flex flex-col gap-2"
                style={{ backgroundColor: `${accent}12`, borderLeft: `3px solid ${accent}` }}
              >
                <p className="text-[11px] font-black tracking-widest uppercase" style={{ color: accent }}>
                  命主特質速覽
                </p>
                <p className="text-sm leading-relaxed text-[#4A4A4A]">{fortune.personality}</p>
              </div>
            )}
            {/* Deep dive：十神分析 */}
            <div className="flex flex-col gap-5">
              <div className="flex items-center gap-3">
                <div className="flex-1 border-t border-[#EAE5DF]" />
                <span className="text-[10px] font-mono tracking-widest text-[#B0A898] uppercase shrink-0">
                  十神命格深度解析
                </span>
                <div className="flex-1 border-t border-[#EAE5DF]" />
              </div>
              <TenGodsSlide reading={reading} theme={theme} mobile />
            </div>
          </div>
        );
      case 'wealth':   return <StandardSlide title="財運狀況"    emoji="💰" content={fortune.wealth}   accentColor={accent} mobile tabNum={tab.num} subtitle={tab.subtitle} renderAsHtml />;
      case 'career':   return <StandardSlide title="工作事業"    emoji="💼" content={fortune.career}   accentColor={accent} mobile tabNum={tab.num} subtitle={tab.subtitle} renderAsHtml />;
      case 'romance':  return <StandardSlide title="感情桃花"    emoji="🌸" content={fortune.romance}  accentColor={accent} mobile tabNum={tab.num} subtitle={tab.subtitle} renderAsHtml />;
      case 'health':   return <StandardSlide title="健康狀況"    emoji="🌿" content={fortune.health}   accentColor={accent} mobile tabNum={tab.num} subtitle={tab.subtitle} renderAsHtml />;
      case 'remedy':   return <StandardSlide title="補運建議"    emoji="✨" content={fortune.remedy}   accentColor={accent} mobile tabNum={tab.num} subtitle={tab.subtitle} renderAsHtml />;
      case 'actions':  return <ActionSlide actionsText={fortune.actions} accentColor={accent} mobile />;
      default:         return null;
    }
  };

  return (
    <div className="w-full">
      {/* Tab bar */}
      <div className="sticky top-0 z-30 bg-[#F5F1EB] border-b border-[#EAE5DF]">
        <div
          ref={tabBarRef}
          className="flex gap-2 overflow-x-auto px-4 py-3"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {tabs.map((tab, idx) => (
            <button
              key={tab.id}
              data-tab={idx}
              onClick={() => setActiveIdx(idx)}
              className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                activeIdx === idx
                  ? 'bg-[#1A1A1A] text-white'
                  : 'bg-white/70 text-[#4A4A4A] hover:bg-white border border-[#EAE5DF]'
              }`}
            >
              <span className={`text-xs font-mono ${activeIdx === idx ? 'text-white/50' : 'text-[#AAA]'}`}>{tab.num}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content card */}
      <div className="px-4 md:px-6 pt-5 pb-2">
        <div className="bg-white border border-[#EAE5DF] rounded-3xl shadow-sm p-6 md:p-8 min-h-[300px]">
          {renderContent()}
        </div>
      </div>

      {/* Prev / Next navigation */}
      <div className="flex items-center justify-between px-4 md:px-6 py-4">
        {activeIdx > 0 ? (
          <button
            onClick={() => { setActiveIdx(activeIdx - 1); scrollToTabBar(); }}
            className="flex items-center gap-2 text-sm font-medium text-[#4A4A4A] border border-[#EAE5DF] bg-white px-5 py-2.5 rounded-full hover:bg-[#FAF7F4] transition-all shadow-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            {tabs[activeIdx - 1].label}
          </button>
        ) : <div />}
        {activeIdx < tabs.length - 1 ? (
          <button
            onClick={() => { setActiveIdx(activeIdx + 1); scrollToTabBar(); }}
            className="flex items-center gap-2 text-sm font-medium text-[#4A4A4A] border border-[#EAE5DF] bg-white px-5 py-2.5 rounded-full hover:bg-[#FAF7F4] transition-all shadow-sm"
          >
            {tabs[activeIdx + 1].label}
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        ) : <div />}
      </div>
    </div>
  );
}
