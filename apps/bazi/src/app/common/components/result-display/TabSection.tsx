'use client';

import { useRef, useEffect, useState } from 'react';
import type { Reading } from '../../../types/bazi';
import type { MagazineTheme } from './theme';
import { useAuth } from '../../../lib/auth-context';
import { TenGodsSlide } from './TenGodsSlide';
import { CycleAnalysisSlide } from './CycleAnalysisSlide';
import { MonthlyFortuneSlide } from './MonthlyFortuneSlide';
import { StandardSlide } from './StandardSlide';
import { ActionSlide } from './ActionSlide';

type DetailSection = 'wealth' | 'career' | 'romance' | 'health' | 'remedy' | 'cycleAnalysis' | 'monthlyFortune' | 'tenGodAnalysis';

const TAB_TO_SECTION: Record<string, DetailSection | undefined> = {
  cycle: 'cycleAnalysis',
  monthly: 'monthlyFortune',
  tengods: 'tenGodAnalysis',
  wealth: 'wealth',
  career: 'career',
  romance: 'romance',
  health: 'health',
  remedy: 'remedy',
};

// 每個 DetailSection 對應到 FortuneReading 上的「詳細版」欄位，用來判斷該分頁是否完全沒有內容（新欄位尚未補上）
const DETAIL_FIELD: Record<DetailSection, 'wealthDetail' | 'careerDetail' | 'romanceDetail' | 'healthDetail' | 'remedyDetail' | 'cycleAnalysisDetail' | 'monthlyFortuneDetail' | 'tenGodAnalysisDetail'> = {
  wealth: 'wealthDetail',
  career: 'careerDetail',
  romance: 'romanceDetail',
  health: 'healthDetail',
  remedy: 'remedyDetail',
  cycleAnalysis: 'cycleAnalysisDetail',
  monthlyFortune: 'monthlyFortuneDetail',
  tenGodAnalysis: 'tenGodAnalysisDetail',
};

interface TabDef {
  id: string;
  num: string;
  label: string;
  subtitle: string;
  emoji: string;
  accentColor: string | null;
}

const buildTabs = (accent: string, currentYear: number, currentMonth: number): TabDef[] => [
  { id: 'cycle',    num: '01', label: `${currentYear}年運勢`, subtitle: '當前大運流年交互影響分析',              emoji: '🌊', accentColor: null },
  { id: 'monthly',  num: '02', label: `${currentMonth}月運勢`, subtitle: '當月流月氣場與重點提醒',               emoji: '🌙', accentColor: accent },
  { id: 'tengods',  num: '03', label: '個性特質',      subtitle: '命格解讀、十神分析與內外在性格全觀',    emoji: '🔮', accentColor: accent },
  { id: 'wealth',   num: '04', label: '財運狀況',      subtitle: '財富能量與正偏財運解析',               emoji: '💰', accentColor: '#D4A017' },
  { id: 'career',   num: '05', label: '工作事業',      subtitle: '職場發展方向與機遇分析',               emoji: '💼', accentColor: '#60A8D0' },
  { id: 'romance',  num: '06', label: '感情桃花',      subtitle: '感情模式與姻緣時機解析',               emoji: '🌸', accentColor: '#E87878' },
  { id: 'health',   num: '07', label: '健康狀況',      subtitle: '身體能量強弱與注意事項',               emoji: '🌿', accentColor: '#7AC97A' },
  { id: 'remedy',   num: '08', label: '補運建議',      subtitle: '強化五行與改善運勢的方法',             emoji: '✨', accentColor: accent },
  { id: 'actions',  num: '09', label: '年度行動建議',  subtitle: '重點方向與具體行動計畫',               emoji: '🎯', accentColor: accent },
];

interface TabSectionProps {
  reading: Reading;
  theme: MagazineTheme;
  activeTabIdx: number;
  onActiveTabChange: (idx: number) => void;
  onUpdate: (updated: Reading) => void;
}

export function TabSection({ reading, theme, activeTabIdx, onActiveTabChange, onUpdate }: TabSectionProps) {
  const { isAdmin } = useAuth();
  const activeIdx = activeTabIdx;
  const setActiveIdx = onActiveTabChange;
  const tabBarRef = useRef<HTMLDivElement>(null);
  const sectionTopRef = useRef<HTMLDivElement>(null);
  const fortune = reading.fortune;
  const now = new Date();
  const tabs = buildTabs(theme.accent, now.getFullYear(), now.getMonth() + 1);
  const activeSection = TAB_TO_SECTION[tabs[activeIdx].id];
  const missingContent = !!activeSection && !fortune[activeSection] && !fortune[DETAIL_FIELD[activeSection]];
  const [generating, setGenerating] = useState(false);

  // 暫時的測試按鈕邏輯：正式版要換成訂閱/選項解鎖後才觸發，這裡先不做配額檢查
  const handleGenerateDetail = async (section: DetailSection) => {
    setGenerating(true);
    try {
      const res = await fetch(`/api/result/${reading.id}/generate-detail`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ section }),
      });
      const data = await res.json();
      if (!res.ok) { alert(data.error || '生成完整分析失敗'); return; }
      onUpdate({ ...reading, fortune: data.fortune });
    } catch {
      alert('網路錯誤，請稍後再試');
    } finally {
      setGenerating(false);
    }
  };

  // 要讓頁面真正往回捲，必須以非 sticky 的區塊根節點為目標
  const scrollToTabBar = () =>
    sectionTopRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  useEffect(() => {
    const bar = tabBarRef.current;
    if (!bar) return;
    const activeEl = bar.querySelector(`[data-tab="${activeIdx}"]`) as HTMLElement | null;
    if (activeEl) activeEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  }, [activeIdx]);
  
  const renderContent = () => {
    const tab = tabs[activeIdx];
    const accent = tab.accentColor ?? theme.accent;
    switch (tab.id) {
      case 'cycle':    return <CycleAnalysisSlide reading={reading} theme={theme} mobile />;
      case 'monthly':  return <MonthlyFortuneSlide reading={reading} theme={theme} mobile />;
      case 'tengods':
        return (
          <div className="flex flex-col gap-6">
            {/* Deep dive：十神分析 */}
            <div className="flex flex-col gap-5">
              <TenGodsSlide reading={reading} theme={theme} mobile />
            </div>
          </div>
        );
      case 'wealth':   return <StandardSlide title="財運狀況"    emoji="💰" content={fortune.wealth}   detail={fortune.wealthDetail}   accentColor={accent} mobile tabNum={tab.num} subtitle={tab.subtitle} />;
      case 'career':   return <StandardSlide title="工作事業"    emoji="💼" content={fortune.career}   detail={fortune.careerDetail}   accentColor={accent} mobile tabNum={tab.num} subtitle={tab.subtitle} />;
      case 'romance':  return <StandardSlide title="感情桃花"    emoji="🌸" content={fortune.romance}  detail={fortune.romanceDetail}  accentColor={accent} mobile tabNum={tab.num} subtitle={tab.subtitle} />;
      case 'health':   return <StandardSlide title="健康狀況"    emoji="🌿" content={fortune.health}   detail={fortune.healthDetail}   accentColor={accent} mobile tabNum={tab.num} subtitle={tab.subtitle} />;
      case 'remedy':   return <StandardSlide title="補運建議"    emoji="✨" content={fortune.remedy}   detail={fortune.remedyDetail}   accentColor={accent} mobile tabNum={tab.num} subtitle={tab.subtitle} />;
      case 'actions':  return <ActionSlide actionsText={fortune.actions} accentColor={accent} mobile />;
      default:         return null;
    }
  };

  return (
    <div className="w-full" ref={sectionTopRef}>
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
              onClick={() => { setActiveIdx(idx); scrollToTabBar(); }}
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
        {activeSection && missingContent && (
          <div className="flex justify-center mt-4">
            <button
              onClick={() => handleGenerateDetail(activeSection)}
              disabled={generating}
              style={{ backgroundColor: theme.accent }}
              className="text-sm font-medium text-white px-6 py-2.5 rounded-full hover:opacity-90 transition-all disabled:opacity-40 shadow-sm"
            >
              {generating ? '生成中…' : '🔄 立即更新此內容'}
            </button>
          </div>
        )}
        {activeSection && isAdmin && !missingContent && (
          <div className="flex justify-center mt-4">
            <button
              onClick={() => handleGenerateDetail(activeSection)}
              disabled={generating}
              className="text-xs text-[#6B6159] border border-[#EAE5DF] bg-white px-5 py-2 rounded-full hover:border-[#E87878] hover:text-[#E87878] transition-all disabled:opacity-40 shadow-sm"
            >
              {generating ? '生成中…' : '🔧 產生完整分析（測試）'}
            </button>
          </div>
        )}
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
