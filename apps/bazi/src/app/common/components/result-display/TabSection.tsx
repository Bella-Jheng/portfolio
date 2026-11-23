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
import { useLocale } from '../../../lib/i18n/locale-context';
import { localizeError, MONTH_NAMES_EN, type MessageKey, type MessageVars } from '../../../lib/i18n/messages';
import { isMonthlyFortuneStale } from '../../../lib/month-key';

type Translate = (key: MessageKey, vars?: MessageVars) => string;

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

const buildTabs = (accent: string, currentYear: number, currentMonth: number, t: Translate): TabDef[] => [
  { id: 'cycle',    num: '01', label: t('tab.cycle', { year: currentYear }), subtitle: t('tab.cycleSub'), emoji: '🌊', accentColor: null },
  { id: 'monthly',  num: '02', label: t('tab.monthly', { month: currentMonth, monthName: MONTH_NAMES_EN[currentMonth - 1] }), subtitle: t('tab.monthlySub'), emoji: '🌙', accentColor: accent },
  { id: 'tengods',  num: '03', label: t('tab.tengods'), subtitle: t('tab.tengodsSub'), emoji: '🔮', accentColor: accent },
  { id: 'wealth',   num: '04', label: t('tab.wealth'),  subtitle: t('tab.wealthSub'),  emoji: '💰', accentColor: '#D4A017' },
  { id: 'career',   num: '05', label: t('tab.career'),  subtitle: t('tab.careerSub'),  emoji: '💼', accentColor: '#60A8D0' },
  { id: 'romance',  num: '06', label: t('tab.romance'), subtitle: t('tab.romanceSub'), emoji: '🌸', accentColor: '#E87878' },
  { id: 'health',   num: '07', label: t('tab.health'),  subtitle: t('tab.healthSub'),  emoji: '🌿', accentColor: '#7AC97A' },
  { id: 'remedy',   num: '08', label: t('tab.remedy'),  subtitle: t('tab.remedySub'),  emoji: '✨', accentColor: accent },
  { id: 'actions',  num: '09', label: t('tab.actions'), subtitle: t('tab.actionsSub'), emoji: '🎯', accentColor: accent },
];

interface TabSectionProps {
  reading: Reading;
  theme: MagazineTheme;
  activeTabIdx: number;
  onActiveTabChange: (idx: number) => void;
  onUpdate: (updated: Reading) => void;
  /** 英文介面、這個頁籤的內容還沒翻好時顯示的提示 */
  notice?: React.ReactNode;
}

export function TabSection({ reading, theme, activeTabIdx, onActiveTabChange, onUpdate, notice }: TabSectionProps) {
  const { isAdmin, getToken } = useAuth();
  const { locale, t } = useLocale();
  const activeIdx = activeTabIdx;
  const setActiveIdx = onActiveTabChange;
  const tabBarRef = useRef<HTMLDivElement>(null);
  const sectionTopRef = useRef<HTMLDivElement>(null);
  const fortune = reading.fortune;
  const now = new Date();
  const tabs = buildTabs(theme.accent, now.getFullYear(), now.getMonth() + 1, t);
  const activeSection = TAB_TO_SECTION[tabs[activeIdx].id];
  const missingContent = !!activeSection && !fortune[activeSection] && !fortune[DETAIL_FIELD[activeSection]];
  const [generating, setGenerating] = useState(false);
  // 本月運勢跨月過期：使用者真的打開「本月運勢」（例如點了每月 1 號的推播）才用 AI 重新產生
  const monthlyStale = isMonthlyFortuneStale(reading);
  const autoMonthlyRef = useRef(false);

  // 暫時的測試按鈕邏輯：正式版要換成訂閱/選項解鎖後才觸發，這裡先不做配額檢查
  const handleGenerateDetail = async (section: DetailSection) => {
    setGenerating(true);
    try {
      const token = await getToken();
      if (!token) { alert(t('tab.loginToGenerate')); return; }
      const res = await fetch(`/api/result/${reading.id}/generate-detail`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ section }),
      });
      const data = await res.json();
      if (!res.ok) { alert(data.error ? localizeError(data.error, locale) : t('tab.generateFailed')); return; }
      onUpdate({
        ...reading,
        fortune: data.fortune,
        fortuneEn: data.fortuneEn ?? reading.fortuneEn,
        monthlyFortuneFor: data.monthlyFortuneFor ?? reading.monthlyFortuneFor,
      });
    } catch {
      alert(t('tab.networkError'));
    } finally {
      setGenerating(false);
    }
  };

  // 要讓頁面真正往回捲，必須以非 sticky 的區塊根節點為目標
  const scrollToTabBar = () =>
    sectionTopRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  useEffect(() => {
    if (tabs[activeIdx].id !== 'monthly' || !monthlyStale || generating || autoMonthlyRef.current) return;
    autoMonthlyRef.current = true;
    void handleGenerateDetail('monthlyFortune');
    // 只在切到本月運勢且過期時觸發一次
  }, [activeIdx, monthlyStale]);

  // 把目前頁籤捲到頁籤列中間。只捲頁籤列本身（水平），不能用 scrollIntoView：
  // 它會連整個頁面一起往下捲到頁籤列，進結果頁時畫面就會停在天生卡下面
  const isFirstTabScroll = useRef(true);
  useEffect(() => {
    const bar = tabBarRef.current;
    if (!bar) return;
    const activeEl = bar.querySelector(`[data-tab="${activeIdx}"]`) as HTMLElement | null;
    if (!activeEl) return;
    const left = activeEl.offsetLeft - (bar.clientWidth - activeEl.offsetWidth) / 2;
    bar.scrollTo({ left: Math.max(0, left), behavior: isFirstTabScroll.current ? 'auto' : 'smooth' });
    isFirstTabScroll.current = false;
    // 切換語言後頁籤名稱長度不同，整列寬度會變，要把目前頁籤重新捲回中間
  }, [activeIdx, locale]);
  
  const renderContent = () => {
    const tab = tabs[activeIdx];
    const accent = tab.accentColor ?? theme.accent;
    switch (tab.id) {
      case 'cycle':    return <CycleAnalysisSlide reading={reading} theme={theme} mobile />;
      case 'monthly':  return <MonthlyFortuneSlide reading={reading} theme={theme} mobile stale={monthlyStale} />;
      case 'tengods':
        return (
          <div className="flex flex-col gap-6">
            {/* Deep dive：十神分析 */}
            <div className="flex flex-col gap-5">
              <TenGodsSlide reading={reading} theme={theme} mobile />
            </div>
          </div>
        );
      case 'wealth':   return <StandardSlide title={t('tab.wealth')}    emoji="💰" content={fortune.wealth}   detail={fortune.wealthDetail}   accentColor={accent} mobile tabNum={tab.num} subtitle={tab.subtitle} />;
      case 'career':   return <StandardSlide title={t('tab.career')}    emoji="💼" content={fortune.career}   detail={fortune.careerDetail}   accentColor={accent} mobile tabNum={tab.num} subtitle={tab.subtitle} />;
      case 'romance':  return <StandardSlide title={t('tab.romance')}    emoji="🌸" content={fortune.romance}  detail={fortune.romanceDetail}  accentColor={accent} mobile tabNum={tab.num} subtitle={tab.subtitle} />;
      case 'health':   return <StandardSlide title={t('tab.health')}    emoji="🌿" content={fortune.health}   detail={fortune.healthDetail}   accentColor={accent} mobile tabNum={tab.num} subtitle={tab.subtitle} />;
      case 'remedy':   return <StandardSlide title={t('tab.remedy')}    emoji="✨" content={fortune.remedy}   detail={fortune.remedyDetail}   accentColor={accent} mobile tabNum={tab.num} subtitle={tab.subtitle} />;
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
          className="relative flex gap-2 overflow-x-auto px-4 py-3"
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
        {notice && <div className="-mx-2 md:-mx-6 mb-3">{notice}</div>}
        <div className="bg-white border border-[#EAE5DF] rounded-3xl shadow-sm p-6 md:p-8 min-h-[300px]">
          {renderContent()}
        </div>
        {activeSection && missingContent && !(activeSection === 'monthlyFortune' && monthlyStale) && (
          <div className="flex justify-center mt-4">
            <button
              onClick={() => handleGenerateDetail(activeSection)}
              disabled={generating}
              style={{ backgroundColor: theme.accent }}
              className="text-sm font-medium text-white px-6 py-2.5 rounded-full hover:opacity-90 transition-all disabled:opacity-40 shadow-sm"
            >
              {generating ? t('tab.generating') : t('tab.updateNow')}
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
              {generating ? t('tab.generating') : t('tab.adminGenerate')}
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
