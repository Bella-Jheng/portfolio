'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import html2canvas from 'html2canvas';
import type { Reading } from '../../../types/bazi';
import { useAuth } from '../../../lib/auth-context';
import {
  STEMS,
  BRANCHES,
  getTenGod,
  getBranchHiddenStems,
  calculateMajorFortune,
  getAnnualPillar,
  type MajorFortune,
} from '../../../lib/bazi-calculator';

interface ResultDisplayProps {
  reading: Reading;
  onUpdate: (updated: Reading) => void;
}

const STEM_ELEMENT: Record<string, string> = {
  甲: '木',
  乙: '木',
  丙: '火',
  丁: '火',
  戊: '土',
  己: '土',
  庚: '金',
  辛: '金',
  壬: '水',
  癸: '水',
};

const ELEMENT_ENGLISH: Record<string, string> = {
  木: 'WOOD ELEMENT',
  火: 'FIRE ELEMENT',
  土: 'EARTH ELEMENT',
  金: 'METAL ELEMENT',
  水: 'WATER ELEMENT',
};

type MagazineTheme = {
  bg: string;
  accent: string;
  text: string;
  catSrc: string;
};

const ELEMENT_THEME: Record<string, MagazineTheme> = {
  木: {
    bg: '#F4FAF4',
    accent: '#7AC97A',
    text: '#2E4C2E',
    catSrc: '/cats/cat-wood.png',
  },
  火: {
    bg: '#FFF5F5',
    accent: '#E87878',
    text: '#5C2D2D',
    catSrc: '/cats/cat-fire.png',
  },
  土: {
    bg: '#FFFDF5',
    accent: '#FCD060',
    text: '#4A4A4A',
    catSrc: '/cats/cat-earth.png',
  },
  金: {
    bg: '#FFFBE0',
    accent: '#C8900A',
    text: '#4A3200',
    catSrc: '/cats/cat-gold.png',
  },
  水: {
    bg: '#F5EDFF',
    accent: '#9070C0',
    text: '#36274D',
    catSrc: '/cats/cat-water.png',
  },
};

const DEFAULT_THEME: MagazineTheme = {
  bg: '#FFFDF5',
  accent: '#FCD060',
  text: '#4A4A4A',
  catSrc: '/cats/cat-default.png',
};

const PILLAR_ORDER = [
  { type: 'hour' as const, label: '時柱' },
  { type: 'day' as const, label: '日柱' },
  { type: 'month' as const, label: '月柱' },
  { type: 'year' as const, label: '年柱' },
];

const SLIDE_TITLES = [
  '精美天生卡',
  '排盤',
  '大運 / 流年',
  '命盤總覽',
  '性格特質',
  '整體運勢',
  '財運狀況',
  '工作事業',
  '感情桃花',
  '健康狀況',
  '補運建議',
  '年度重點行動建議',
];

const TRACK_ITEMS = [11, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 0];

function splitIntoPoints(text: string): string[] {
  if (!text) return [];
  const sentences = text
    .split(/(?<=[。！？])/)
    .map((s) => s.trim())
    .filter((s) => s.length > 1);
  if (sentences.length > 1) return sentences;
  return text
    .split('，')
    .map((s) => s.trim())
    .filter((s) => s.length > 3)
    .slice(0, 6);
}

function splitIntoActions(text: string): string[] {
  if (!text) return [];
  const numbered = text
    .split(/\n?\d+[.、．]\s*/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
  if (numbered.length > 1) return numbered.slice(0, 5);
  return text
    .split(/[。\n]/)
    .map((s) => s.trim())
    .filter((s) => s.length > 3)
    .slice(0, 5);
}

export function ResultDisplay({ reading, onUpdate }: ResultDisplayProps) {
  const { user, login, isAdmin, getToken } = useAuth();
  const [question, setQuestion] = useState('');
  const [asking, setAsking] = useState(false);
  const [askError, setAskError] = useState('');
  const [downloading, setDownloading] = useState(false);
  const [recalculating, setRecalculating] = useState(false);
  const [remaining, setRemaining] = useState<number>(
    reading.remainingToday ?? 3,
  );
  const [trackIndex, setTrackIndex] = useState(1);
  const [transitionConfig, setTransitionConfig] = useState<any>({
    type: 'spring',
    stiffness: 260,
    damping: 26,
  });
  const [containerWidth, setContainerWidth] = useState(0);

  const printRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const dayMasterStem = reading.pillars?.day?.stem ?? '';
  const dayElement = STEM_ELEMENT[dayMasterStem] ?? '';
  const theme = ELEMENT_THEME[dayElement] ?? DEFAULT_THEME;
  const elementEn = ELEMENT_ENGLISH[dayElement] ?? 'BAZI READING';
  const limitReached = user ? remaining === 0 : false;

  const dotGridStyle = {
    backgroundImage: `radial-gradient(${theme.accent}40 2px, transparent 2px)`,
    backgroundSize: '12px 12px',
  };

  useEffect(() => {
    if (!containerRef.current) return;
    const handleResize = () => {
      setContainerWidth(containerRef.current?.offsetWidth || 0);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA'
      ) {
        return;
      }
      if (e.key === 'ArrowRight' || e.key === 'Right') nextSlide();
      if (e.key === 'ArrowLeft' || e.key === 'Left') prevSlide();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [trackIndex]);

  const nextSlide = () => {
    setTransitionConfig({ type: 'spring', stiffness: 260, damping: 26 });
    setTrackIndex((prev) => prev + 1);
  };

  const prevSlide = () => {
    setTransitionConfig({ type: 'spring', stiffness: 260, damping: 26 });
    setTrackIndex((prev) => prev - 1);
  };

  const handleAnimationComplete = () => {
    if (trackIndex === 0) {
      setTransitionConfig({ duration: 0 });
      setTrackIndex(12);
    } else if (trackIndex === 13) {
      setTransitionConfig({ duration: 0 });
      setTrackIndex(1);
    }
  };

  const handleDownloadImage = async () => {
    if (!printRef.current) return;
    setDownloading(true);
    try {
      const canvas = await html2canvas(printRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: theme.bg,
      });
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `bazi_${reading.name || 'card'}.png`;
      link.click();
    } catch (err) {
      console.error('Failed to generate image', err);
      alert('生成圖卡失敗，請稍後再試');
    } finally {
      setDownloading(false);
    }
  };

  const handleRecalculate = async () => {
    setRecalculating(true);
    try {
      const token = await getToken();
      const res = await fetch(`/api/result/${reading.id}/recalculate`, {
        method: 'PUT',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || '重新計算失敗');
        return;
      }
      onUpdate({
        ...reading,
        pillars: data.pillars,
        fortune: data.fortune,
        questions: data.questions,
      });
    } catch {
      alert('網路錯誤，請稍後再試');
    } finally {
      setRecalculating(false);
    }
  };

  const handleAskQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;
    setAskError('');
    setAsking(true);
    try {
      const token = await getToken();
      const res = await fetch(`/api/result/${reading.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ question }),
      });
      const data = await res.json();
      if (!res.ok) {
        setAskError(data.error || '提問失敗');
        return;
      }
      onUpdate({
        ...reading,
        questions: data.questions,
        remainingToday: data.remainingToday,
      });
      setRemaining(data.remainingToday ?? 0);
      setQuestion('');
    } catch {
      setAskError('網路錯誤，請稍後再試');
    } finally {
      setAsking(false);
    }
  };

  // Slide Renderers
  const renderCardSlide = (cardWidth: number, isRealCard: boolean) => {
    return (
      <div className="flex flex-col lg:flex-row gap-8 items-center lg:items-stretch w-full h-full text-left">
        {/* Left Column: Card + Download (50%) */}
        <div className="flex-1 flex flex-col items-center justify-between shrink-0 w-full lg:h-[454px]">
          <div
            ref={isRealCard ? printRef : null}
            className="relative w-full max-w-[280px] lg:max-w-[300px] h-[373px] lg:h-[400px] rounded-2xl border border-black/10 overflow-hidden bg-[#FFFDF5] shadow-md flex flex-col justify-between shrink-0"
          >
            <div
              className="absolute inset-0 opacity-[0.03] pointer-events-none"
              style={dotGridStyle}
            />

            <div className="h-10 bg-white/70 border-b border-black/5 px-4 flex items-center justify-between text-[10px] font-mono tracking-widest text-black/40 z-10">
              <span>The</span>
              <span>— • ——— • —</span>
              <span>
                {reading.birthYear % 10} ♦ {reading.birthMonth % 10}
              </span>
            </div>

            <div className="flex-1 relative p-5 flex flex-col">
              <div className="space-y-0.5 relative z-10">
                <h3 className="text-base font-bold tracking-widest text-black/80">
                  Hi{reading.name ? `, ${reading.name}` : ''}
                </h3>
                <h2 className="text-lg font-black tracking-[0.3em] text-black/80">
                  天生就屬
                </h2>
                <p className="font-serif italic text-[10px] tracking-widest text-black/60">
                  Your bazi element
                </p>
              </div>

              <div className="mt-auto flex items-end gap-2.5 z-10 relative">
                <div
                  className="text-[9px] tracking-[0.4em] font-mono whitespace-nowrap mb-1 opacity-50"
                  style={{
                    writingMode: 'vertical-rl',
                    transform: 'rotate(180deg)',
                  }}
                >
                  {elementEn}
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-3xl font-black leading-none text-black/80">
                    {dayElement || '命'}
                  </span>
                  <span className="text-3xl font-black leading-none text-black/80">
                    命
                  </span>
                  <span className="text-3xl font-black leading-none text-black/80">
                    人
                  </span>
                </div>
              </div>

              <div className="absolute right-[-12px] top-[16%] w-44 h-44 z-0 flex items-center justify-center">
                <div
                  className="absolute inset-0 opacity-80 mix-blend-multiply"
                  style={{
                    backgroundColor: theme.accent,
                    borderRadius: '40% 60% 70% 30% / 40% 50% 60% 50%',
                    transform: 'scale(1.2)',
                  }}
                />
                <Image
                  src={theme.catSrc}
                  alt="Result Cat"
                  width={155}
                  height={195}
                  priority
                  className="relative z-10 drop-shadow-lg -rotate-6"
                />
              </div>
            </div>

            <div className="h-24 bg-white/70 relative flex items-center justify-center border-t border-black/5 mt-auto">
              <div
                className="absolute left-0 top-0 bottom-0 w-12"
                style={dotGridStyle}
              />
              <div
                className="absolute right-0 top-0 bottom-0 w-12"
                style={dotGridStyle}
              />
              <div className="relative z-10 max-w-[200px] text-center space-y-1 bg-white/50 px-3 py-1.5 backdrop-blur-sm rounded-lg">
                <h4
                  className="font-bold tracking-widest text-[11px]"
                  style={{ color: theme.accent }}
                >
                  分析指南
                </h4>
                <p className="text-[10px] leading-relaxed text-black/70 font-medium line-clamp-2">
                  {reading.fortune.personality ||
                    '適度的挑戰讓人感到充實，內斂而有深度。'}
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={handleDownloadImage}
            disabled={downloading}
            className="flex items-center justify-center gap-2 bg-[#4A4A4A] text-white px-7 py-2.5 rounded-full text-xs font-semibold tracking-wider transition-all hover:bg-black shadow-sm shrink-0 w-full max-w-[280px] lg:max-w-[300px]"
          >
            {downloading ? '生成中...' : '下載天生卡'}
          </button>
        </div>

        {/* Right Column: Outline Table of Contents (50%) */}
        <div className="flex-1 flex flex-col justify-between bg-[#FAF7F4] border border-[#EAE5DF] rounded-2xl p-5 text-[#4A4A4A] w-full lg:h-[454px]">
          <div className="flex items-center gap-2 mb-3 border-b border-[#EAE5DF]/60 pb-2">
            <span className="text-base">📖</span>
            <h3 className="font-black text-sm tracking-wider text-[#4A4A4A]">
              章節內容
            </h3>
          </div>

          <div className="space-y-2 text-xs overflow-y-auto pr-1 flex-1">
            <div className="flex items-start gap-2">
              <span className="font-bold text-[#B0A898] shrink-0 w-4 text-left">
                一
              </span>
              <div>
                <p className="font-bold text-[#4A4A4A]">命盤總覽</p>
                <p className="text-[10px] text-[#8C8476] mt-0.5">
                  日主特質判定與四柱格局起伏大方向
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-bold text-[#B0A898] shrink-0 w-4 text-left">
                二
              </span>
              <div>
                <p className="font-bold text-[#4A4A4A]">性格特質</p>
                <p className="text-[10px] text-[#8C8476] mt-0.5">
                  內在性格、外在表現與潛在心理盲點
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-bold text-[#B0A898] shrink-0 w-4 text-left">
                三
              </span>
              <div>
                <p className="font-bold text-[#4A4A4A]">整體運勢</p>
                <p className="text-[10px] text-[#8C8476] mt-0.5">
                  一生大運階段起伏與流年總體能量解析
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-bold text-[#B0A898] shrink-0 w-4 text-left">
                四
              </span>
              <div>
                <p className="font-bold text-[#4A4A4A]">財運狀況</p>
                <p className="text-[10px] text-[#8C8476] mt-0.5">
                  天生財庫、求財機遇與守財防漏財指南
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-bold text-[#B0A898] shrink-0 w-4 text-left">
                五
              </span>
              <div>
                <p className="font-bold text-[#4A4A4A]">工作事業</p>
                <p className="text-[10px] text-[#8C8476] mt-0.5">
                  適合行業職能定位與職場開運策略
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-bold text-[#B0A898] shrink-0 w-4 text-left">
                六
              </span>
              <div>
                <p className="font-bold text-[#4A4A4A]">感情桃花</p>
                <p className="text-[10px] text-[#8C8476] mt-0.5">
                  姻緣時機、桃花強弱與感情相處建議
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-bold text-[#B0A898] shrink-0 w-4 text-left">
                七
              </span>
              <div>
                <p className="font-bold text-[#4A4A4A]">健康狀況</p>
                <p className="text-[10px] text-[#8C8476] mt-0.5">
                  經絡臟腑五行對應與日常養生保養
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-bold text-[#B0A898] shrink-0 w-4 text-left">
                八
              </span>
              <div>
                <p className="font-bold text-[#4A4A4A]">補運建議</p>
                <p className="text-[10px] text-[#8C8476] mt-0.5">
                  喜用神開運方位、幸運顏色與生肖速查
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-bold text-[#B0A898] shrink-0 w-4 text-left">
                九
              </span>
              <div>
                <p className="font-bold text-[#4A4A4A]">重點行動建議</p>
                <p className="text-[10px] text-[#8C8476] mt-0.5">
                  二○二六流年特別提示與具體行事準則
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderBaziTableSlide = () => {
    const dayStem = reading.pillars.day?.stem ?? '';
    const activePillars = PILLAR_ORDER.filter(
      ({ type }) => !!reading.pillars[type],
    );
    const yearStemIdx = STEMS.indexOf(reading.pillars.year?.stem ?? '');
    const monthStemIdx = STEMS.indexOf(reading.pillars.month?.stem ?? '');
    const monthBranchIdx = BRANCHES.indexOf(
      reading.pillars.month?.branch ?? '',
    );
    const fortune: MajorFortune | null =
      yearStemIdx >= 0 &&
      monthStemIdx >= 0 &&
      monthBranchIdx >= 0 &&
      !!reading.gender
        ? calculateMajorFortune(
            reading.birthYear,
            reading.birthMonth,
            reading.birthDay,
            reading.gender,
            yearStemIdx,
            monthStemIdx,
            monthBranchIdx,
          )
        : null;
    const currentVirtualAge = new Date().getFullYear() - reading.birthYear + 1;
    const currentCycleIdx = fortune
      ? fortune.cycles.findLastIndex((c) => c.startAge <= currentVirtualAge)
      : -1;
    const displayYears = fortune ? Math.floor(fortune.startDays / 3) : 0;
    const displayMonths = fortune ? (fortune.startDays % 3) * 4 : 0;

    const HL = { backgroundColor: theme.accent + '20' };

    return (
      <div className="w-full h-full flex flex-col gap-3 text-left overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-[#EAE5DF] shrink-0">
          <div>
            <h3 className="font-bold text-sm text-[#4A4A4A]">基本排盤</h3>
            <p className="text-[10px] text-[#B0A898] font-mono tracking-widest mt-0.5">
              {elementEn}
            </p>
          </div>
          <div className="text-right text-[10px]">
            <p className="font-bold text-[#4A4A4A]">
              {reading.birthYear}.{String(reading.birthMonth).padStart(2, '0')}.
              {String(reading.birthDay).padStart(2, '0')}
              {reading.pillars.hour && ` · ${reading.pillars.hour.branch}時`}
            </p>
            {reading.gender && (
              <span
                className="text-[9px] px-1.5 py-0.5 rounded-full font-medium"
                style={{
                  backgroundColor: theme.accent + '20',
                  color: theme.text,
                }}
              >
                {reading.gender === 'male' ? '男' : '女'}
              </span>
            )}
          </div>
        </div>

        {/* Bazi Table */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-center">
            <tbody>
              {/* 主星 */}
              <tr className="border-b border-[#EAE5DF]">
                {activePillars.map(({ type }) => {
                  const pillar = reading.pillars[type]!;
                  const tg =
                    type === 'day' ? '日主' : getTenGod(dayStem, pillar.stem);
                  return (
                    <td key={type} className="py-2 px-2">
                      <span
                        className="text-xs font-bold"
                        style={{
                          color: type === 'day' ? theme.accent : '#B0A898',
                        }}
                      >
                        {tg}
                      </span>
                    </td>
                  );
                })}
                <td className="text-[9px] text-[#B0A898] pl-2 text-left whitespace-nowrap">
                  主星
                </td>
              </tr>
              {/* 四柱 */}
              <tr className="border-b border-[#EAE5DF]">
                {activePillars.map(({ type }) => {
                  const pillar = reading.pillars[type]!;
                  const stemEl = STEM_ELEMENT[pillar.stem] ?? '';
                  const branchEl = pillar.element.split('/')[1] ?? '';
                  const isDay = type === 'day';
                  return (
                    <td key={type} className="py-3 px-1">
                      <div className="flex flex-col items-center gap-2">
                        <div className="flex items-start gap-0.5">
                          <span
                            className="text-2xl font-black leading-none"
                            style={{ color: isDay ? theme.accent : '#4A4A4A' }}
                          >
                            {pillar.stem}
                          </span>
                          <span className="text-[8px] text-[#B0A898] mt-0.5">
                            {stemEl}
                          </span>
                        </div>
                        <div className="flex items-start gap-0.5">
                          <span className="text-2xl font-black leading-none text-[#4A4A4A]">
                            {pillar.branch}
                          </span>
                          <span className="text-[8px] text-[#B0A898] mt-0.5">
                            {branchEl}
                          </span>
                        </div>
                      </div>
                    </td>
                  );
                })}
                <td className="text-[9px] text-[#B0A898] pl-2 text-left whitespace-nowrap">
                  四柱
                </td>
              </tr>
              {/* 藏干 */}
              <tr className="border-b border-dashed border-[#EAE5DF]">
                {activePillars.map(({ type }) => {
                  const pillar = reading.pillars[type]!;
                  const hidden = getBranchHiddenStems(pillar.branch, dayStem);
                  return (
                    <td key={type} className="py-2 px-1 align-top">
                      <div className="flex flex-col items-center gap-0.5">
                        {hidden.map((h) => (
                          <span
                            key={h.stem}
                            className="text-sm font-bold text-[#6B5D57]"
                          >
                            {h.stem}
                          </span>
                        ))}
                      </div>
                    </td>
                  );
                })}
                <td className="text-[9px] text-[#B0A898] pl-2 text-left align-top pt-2 whitespace-nowrap">
                  藏干
                </td>
              </tr>
              {/* 副星 */}
              <tr className="border-b border-[#EAE5DF]">
                {activePillars.map(({ type }) => {
                  const pillar = reading.pillars[type]!;
                  const hidden = getBranchHiddenStems(pillar.branch, dayStem);
                  return (
                    <td key={type} className="py-2 px-1 align-top">
                      <div className="flex flex-col items-center gap-0.5">
                        {hidden.map((h) => (
                          <span
                            key={h.stem}
                            className="text-[9px] text-[#9E9E9E]"
                          >
                            {h.tenGod}
                          </span>
                        ))}
                      </div>
                    </td>
                  );
                })}
                <td className="text-[9px] text-[#B0A898] pl-2 text-left align-top pt-2 whitespace-nowrap">
                  副星
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* 大運 mini bar */}
        {fortune && (
          <div className="space-y-1.5 pt-1 shrink-0">
            <div className="overflow-x-auto">
              <table className="w-full text-center border-collapse">
                <tbody>
                  <tr>
                    <td className="text-[9px] text-[#B0A898] pr-2 text-right whitespace-nowrap w-10">
                      歲
                    </td>
                    {fortune.cycles.map((c, i) => (
                      <td
                        key={i}
                        className="px-0.5 py-1"
                        style={i === currentCycleIdx ? HL : {}}
                      >
                        <span
                          className={`font-mono text-[10px] ${i === currentCycleIdx ? 'font-bold text-[#4A4A4A]' : 'text-[#C0B8B0]'}`}
                        >
                          {c.startAge}
                        </span>
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="text-[9px] text-[#B0A898] pr-2 text-right w-10">
                      大運
                    </td>
                    {fortune.cycles.map((c, i) => (
                      <td
                        key={i}
                        className="px-0.5 py-1"
                        style={i === currentCycleIdx ? HL : {}}
                      >
                        <div className="flex flex-col items-center leading-none">
                          <span
                            className={`text-xs font-black ${i === currentCycleIdx ? 'text-[#4A4A4A]' : 'text-[#C0B8B0]'}`}
                          >
                            {c.stem}
                          </span>
                          <span
                            className={`text-xs font-black ${i === currentCycleIdx ? 'text-[#4A4A4A]' : 'text-[#C0B8B0]'}`}
                          >
                            {c.branch}
                          </span>
                        </div>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-center text-[10px] text-[#B0A898]">
              出生後 {displayYears} 年
              {displayMonths > 0 ? ` ${displayMonths} 個月` : ''}上大運
            </p>
          </div>
        )}
      </div>
    );
  };

  const renderMajorFortuneSlide = () => {
    const yearStemIdx = STEMS.indexOf(reading.pillars.year?.stem ?? '');
    const monthStemIdx = STEMS.indexOf(reading.pillars.month?.stem ?? '');
    const monthBranchIdx = BRANCHES.indexOf(
      reading.pillars.month?.branch ?? '',
    );
    if (
      yearStemIdx < 0 ||
      monthStemIdx < 0 ||
      monthBranchIdx < 0 ||
      !reading.gender
    ) {
      return (
        <div className="flex flex-col items-center justify-center w-full h-full py-12 text-[#9E9E9E]">
          <span className="text-4xl mb-3">📅</span>
          <p className="text-sm">需要性別資料才能計算大運</p>
        </div>
      );
    }

    const fortune = calculateMajorFortune(
      reading.birthYear,
      reading.birthMonth,
      reading.birthDay,
      reading.gender,
      yearStemIdx,
      monthStemIdx,
      monthBranchIdx,
    );
    const currentYear = new Date().getFullYear();
    const currentVirtualAge = currentYear - reading.birthYear + 1;
    const currentCycleIdx = fortune.cycles.findLastIndex(
      (c) => c.startAge <= currentVirtualAge,
    );
    const displayYears = Math.floor(fortune.startDays / 3);
    const displayMonths = (fortune.startDays % 3) * 4;
    const annualLuck = Array.from({ length: 10 }, (_, i) => {
      const y = currentYear - 4 + i;
      return { year: y, age: y - reading.birthYear + 1, ...getAnnualPillar(y) };
    });
    const HL = { backgroundColor: theme.accent + '20' };

    const FortuneTable = ({
      rows,
    }: {
      rows: { label: string; cells: React.ReactNode[] }[];
    }) => (
      <div className="overflow-x-auto">
        <table className="w-full text-center border-collapse">
          <tbody>
            {rows.map(({ label, cells }) => (
              <tr
                key={label}
                className="border-b border-[#EAE5DF] last:border-0"
              >
                <td className="text-[9px] text-[#B0A898] pr-2 text-right whitespace-nowrap py-1.5 w-10">
                  {label}
                </td>
                {cells}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );

    return (
      <div className="w-full h-full flex flex-col gap-5 text-left overflow-y-auto">
        {/* 大運 */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <h3 className="font-bold text-sm text-[#4A4A4A]">大運</h3>
            <span className="text-[10px] text-[#B0A898]">
              出生後 {displayYears} 年
              {displayMonths > 0 ? ` ${displayMonths} 個月` : ''}上大運
            </span>
          </div>
          <FortuneTable
            rows={[
              {
                label: '歲',
                cells: fortune.cycles.map((c, i) => (
                  <td
                    key={i}
                    className="px-0.5 py-1.5"
                    style={i === currentCycleIdx ? HL : {}}
                  >
                    <span
                      className={`font-mono text-[10px] ${i === currentCycleIdx ? 'font-bold text-[#4A4A4A]' : 'text-[#9E9E9E]'}`}
                    >
                      {c.startAge}
                    </span>
                  </td>
                )),
              },
              {
                label: '年',
                cells: fortune.cycles.map((c, i) => (
                  <td
                    key={i}
                    className="px-0.5 py-1"
                    style={i === currentCycleIdx ? HL : {}}
                  >
                    <span
                      className={`text-[9px] font-mono ${i === currentCycleIdx ? 'font-bold text-[#4A4A4A]' : 'text-[#C0B8B0]'}`}
                    >
                      {c.startYear}
                    </span>
                  </td>
                )),
              },
              {
                label: '大運',
                cells: fortune.cycles.map((c, i) => (
                  <td
                    key={i}
                    className="px-0.5 py-2"
                    style={i === currentCycleIdx ? HL : {}}
                  >
                    <div className="flex flex-col items-center leading-none gap-0.5">
                      <span
                        className={`text-sm font-black ${i === currentCycleIdx ? 'text-[#4A4A4A]' : 'text-[#C0B8B0]'}`}
                      >
                        {c.stem}
                      </span>
                      <span
                        className={`text-sm font-black ${i === currentCycleIdx ? 'text-[#4A4A4A]' : 'text-[#C0B8B0]'}`}
                      >
                        {c.branch}
                      </span>
                    </div>
                  </td>
                )),
              },
            ]}
          />
        </div>

        {/* 流年 */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <h3 className="font-bold text-sm text-[#4A4A4A]">流年</h3>
            <span className="text-[10px] text-[#B0A898]">近十年</span>
          </div>
          <FortuneTable
            rows={[
              {
                label: '歲',
                cells: annualLuck.map(({ year, age }) => (
                  <td
                    key={year}
                    className="px-0.5 py-1.5"
                    style={year === currentYear ? HL : {}}
                  >
                    <span
                      className={`font-mono text-[10px] ${year === currentYear ? 'font-bold text-[#4A4A4A]' : 'text-[#9E9E9E]'}`}
                    >
                      {age}
                    </span>
                  </td>
                )),
              },
              {
                label: '年',
                cells: annualLuck.map(({ year }) => (
                  <td
                    key={year}
                    className="px-0.5 py-1"
                    style={year === currentYear ? HL : {}}
                  >
                    <span
                      className={`text-[9px] font-mono ${year === currentYear ? 'font-bold text-[#4A4A4A]' : 'text-[#C0B8B0]'}`}
                    >
                      {year}
                    </span>
                  </td>
                )),
              },
              {
                label: '流年',
                cells: annualLuck.map(({ year, stem, branch }) => (
                  <td
                    key={year}
                    className="px-0.5 py-2"
                    style={year === currentYear ? HL : {}}
                  >
                    <div className="flex flex-col items-center leading-none gap-0.5">
                      <span
                        className={`text-sm font-black ${year === currentYear ? 'text-[#4A4A4A]' : 'text-[#C0B8B0]'}`}
                      >
                        {stem}
                      </span>
                      <span
                        className={`text-sm font-black ${year === currentYear ? 'text-[#4A4A4A]' : 'text-[#C0B8B0]'}`}
                      >
                        {branch}
                      </span>
                    </div>
                  </td>
                )),
              },
            ]}
          />
        </div>
      </div>
    );
  };

  const renderStandardSlide = (
    title: string,
    emoji: string,
    content?: string,
    color?: string,
  ) => {
    if (!content) {
      return (
        <div className="flex flex-col items-center justify-center w-full h-full py-12 text-[#9E9E9E]">
          <span className="text-4xl mb-3">🔍</span>
          <p className="text-sm">
            尚未有此項解析資料，可使用下方 Admin 重新排盤
          </p>
        </div>
      );
    }

    const points = splitIntoPoints(content);

    return (
      <div className="flex flex-col md:flex-row gap-8 items-center md:items-stretch justify-between w-full h-full text-left">
        {/* Left Content */}
        <div className="flex-1 space-y-5 w-full">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{emoji}</span>
            <h2 className="text-xl font-black tracking-widest text-[#4A4A4A]">
              {title}
            </h2>
            <div
              className="h-px flex-1"
              style={{ backgroundColor: (color || theme.accent) + '60' }}
            />
          </div>

          <div className="space-y-4 max-h-[340px] overflow-y-auto pr-2">
            {points.map((point, idx) => (
              <p
                key={idx}
                className="text-sm leading-relaxed text-[#6B5D57] font-medium pl-3 border-l-2"
                style={{ borderColor: color || theme.accent }}
              >
                {point}
              </p>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderActionSlide = () => {
    const actionsText = reading.fortune.actions;
    if (!actionsText) {
      return (
        <div className="flex flex-col items-center justify-center w-full h-full py-12 text-[#9E9E9E]">
          <span className="text-4xl mb-3">🎯</span>
          <p className="text-sm">
            尚未有行動建議資料，可使用下方 Admin 重新排盤
          </p>
        </div>
      );
    }

    const actions = splitIntoActions(actionsText);

    return (
      <div className="space-y-6 w-full h-full flex flex-col justify-start text-left">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🎯</span>
          <h2 className="text-xl font-black tracking-widest text-[#4A4A4A]">
            年度重點行動建議
          </h2>
          <div className="h-px flex-1 bg-[#EAE5DF]" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[340px] overflow-y-auto pr-2">
          {actions.map((action, i) => (
            <div
              key={i}
              className="bg-[#FAF7F4] border border-[#EAE5DF] rounded-2xl p-5 flex items-start gap-4 hover:shadow-sm transition-all"
            >
              <span
                className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold mt-0.5"
                style={{ backgroundColor: theme.accent }}
              >
                {i + 1}
              </span>
              <p className="text-sm leading-relaxed text-[#6B5D57] font-semibold pt-0.5">
                {action}
              </p>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Slider Math
  const cardWidth = containerWidth ? Math.min(containerWidth * 0.85, 760) : 320;
  const gap = 24;
  const offset = containerWidth
    ? (containerWidth - cardWidth) / 2 - trackIndex * (cardWidth + gap)
    : 0;

  // Map trackIndex back to slideIndex
  const getSlideIndex = (index: number) => {
    if (index === 0) return 11;
    if (index === 13) return 0;
    return index - 1;
  };
  const slideIndex = getSlideIndex(trackIndex);

  return (
    <motion.div
      className="w-full space-y-10 text-[#4A4A4A]"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      {/* Slider Viewport Container */}
      <div ref={containerRef} className="relative w-full overflow-hidden py-4">
        <motion.div
          drag="x"
          dragConstraints={{ left: offset, right: offset }}
          dragElastic={0.4}
          onDragStart={() => {
            setTransitionConfig({
              type: 'spring',
              stiffness: 260,
              damping: 26,
            });
          }}
          onDragEnd={(event, info) => {
            const swipeThreshold = 70;
            const { offset: dragOffset } = info;
            setTransitionConfig({
              type: 'spring',
              stiffness: 260,
              damping: 26,
            });
            if (dragOffset.x < -swipeThreshold) {
              setTrackIndex((prev) => prev + 1);
            } else if (dragOffset.x > swipeThreshold) {
              setTrackIndex((prev) => prev - 1);
            }
          }}
          animate={{ x: offset }}
          transition={transitionConfig}
          onAnimationComplete={handleAnimationComplete}
          className="flex items-stretch cursor-grab active:cursor-grabbing"
        >
          {TRACK_ITEMS.map((contentIdx, trackIdx) => {
            const isActive = trackIdx === trackIndex;

            return (
              <div
                key={trackIdx}
                style={{ width: cardWidth }}
                className={`mx-3 shrink-0 transition-all duration-300 ${
                  isActive
                    ? 'opacity-100 scale-100'
                    : 'opacity-40 scale-95 pointer-events-none'
                } origin-center flex items-stretch`}
              >
                <div className="w-full bg-white border border-[#EAE5DF] rounded-3xl shadow-md p-6 md:p-8 flex flex-col justify-between min-h-[580px]">
                  <div className="flex-1 flex items-stretch w-full">
                    {contentIdx === 0 &&
                      renderCardSlide(cardWidth, trackIdx === 1)}
                    {contentIdx === 1 && renderBaziTableSlide()}
                    {contentIdx === 2 && renderMajorFortuneSlide()}
                    {contentIdx === 3 &&
                      renderStandardSlide(
                        '命盤總覽',
                        '📋',
                        reading.fortune.overview,
                        theme.accent,
                      )}
                    {contentIdx === 4 &&
                      renderStandardSlide(
                        '性格特質',
                        '🔮',
                        reading.fortune.personality,
                      )}
                    {contentIdx === 5 &&
                      renderStandardSlide(
                        '整體運勢',
                        '🌟',
                        reading.fortune.fortune,
                        '#FCD060',
                      )}
                    {contentIdx === 6 &&
                      renderStandardSlide(
                        '財運狀況',
                        '💰',
                        reading.fortune.wealth,
                        '#D4A017',
                      )}
                    {contentIdx === 7 &&
                      renderStandardSlide(
                        '工作事業',
                        '💼',
                        reading.fortune.career,
                        '#60A8D0',
                      )}
                    {contentIdx === 8 &&
                      renderStandardSlide(
                        '感情桃花',
                        '🌸',
                        reading.fortune.romance,
                        '#E87878',
                      )}
                    {contentIdx === 9 &&
                      renderStandardSlide(
                        '健康狀況',
                        '🌿',
                        reading.fortune.health,
                        '#7AC97A',
                      )}
                    {contentIdx === 10 &&
                      renderStandardSlide(
                        '補運建議',
                        '✨',
                        reading.fortune.remedy,
                        theme.accent,
                      )}
                    {contentIdx === 11 && renderActionSlide()}
                  </div>
                </div>
              </div>
            );
          })}
        </motion.div>
      </div>

      {/* Slider Controls */}
      <div className="flex items-center justify-between max-w-4xl mx-auto px-4">
        <button
          onClick={prevSlide}
          className="w-10 h-10 rounded-full border border-[#EAE5DF] bg-white flex items-center justify-center text-[#4A4A4A] hover:bg-[#FAF7F4] active:scale-95 transition-all shadow-sm"
          aria-label="Previous slide"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>

        <div className="flex flex-col items-center gap-1.5 flex-1 mx-4">
          <span className="text-xs font-bold tracking-widest text-[#9E9E9E] uppercase">
            {SLIDE_TITLES[slideIndex]}
          </span>
          <div className="flex items-center gap-3 w-full max-w-[240px]">
            <span className="text-[10px] font-mono text-[#B0A898] tracking-widest shrink-0">
              {slideIndex + 1} / 12
            </span>
            <div className="h-1 flex-1 bg-black/5 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#4A4A4A] transition-all duration-300 ease-out"
                style={{ width: `${((slideIndex + 1) / 12) * 100}%` }}
              />
            </div>
          </div>
        </div>

        <button
          onClick={nextSlide}
          className="w-10 h-10 rounded-full border border-[#EAE5DF] bg-white flex items-center justify-center text-[#4A4A4A] hover:bg-[#FAF7F4] active:scale-95 transition-all shadow-sm"
          aria-label="Next slide"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      </div>

      {/* Admin recalculate */}
      {isAdmin && (
        <div className="flex justify-center -mt-4">
          <motion.button
            onClick={handleRecalculate}
            disabled={recalculating}
            className="text-xs text-[#B0A898] border border-[#EAE5DF] bg-white px-5 py-2 rounded-full hover:border-[#E87878] hover:text-[#E87878] transition-all disabled:opacity-40 shadow-sm"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {recalculating ? '重新計算中…' : '↺ 重新排盤（Admin）'}
          </motion.button>
        </div>
      )}

      {/* Q&A Section */}
      <div className="w-full max-w-2xl mx-auto rounded-2xl border border-[#EAE5DF] overflow-hidden bg-white shadow-sm">
        {/* Q&A Header */}
        <div
          className="flex items-center gap-3 px-6 py-4 border-b border-[#EAE5DF]"
          style={{ backgroundColor: theme.bg }}
        >
          <div className="relative w-8 h-8 shrink-0">
            <Image src={theme.catSrc} alt="" fill className="object-contain" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-[#4A4A4A]">命盤 AI 追問</h3>
            <p className="text-[10px] text-[#B0A898]">針對命盤進行追加提問</p>
          </div>
        </div>

        {/* Q&A Content */}
        {reading.questions.length > 0 && (
          <div className="px-6 py-5 space-y-4 border-b border-[#EAE5DF]">
            {reading.questions.map((qa, idx) => (
              <motion.div
                key={idx}
                className="space-y-2"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.08 }}
              >
                <div className="flex justify-end">
                  <div className="bg-[#4A4A4A] text-white rounded-2xl rounded-tr-sm px-4 py-2.5 text-sm max-w-[80%] leading-relaxed">
                    {qa.question}
                  </div>
                </div>
                <div className="flex justify-start gap-2">
                  <div className="relative w-7 h-7 shrink-0 mt-1">
                    <Image
                      src={theme.catSrc}
                      alt=""
                      fill
                      className="object-contain"
                    />
                  </div>
                  <div
                    className="border rounded-2xl rounded-tl-sm px-4 py-2.5 text-sm max-w-[80%] text-[#6B5D57] leading-relaxed"
                    style={{
                      backgroundColor: theme.bg,
                      borderColor: '#EAE5DF',
                    }}
                  >
                    {qa.answer}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Ask Form */}
        <div className="px-6 py-5 bg-[#FAF7F4]">
          <div className="flex items-center justify-between mb-3">
            <p className="font-bold text-sm text-[#4A4A4A]">還有其他問題？</p>
            {user && (
              <span
                className={`text-xs ${limitReached ? 'text-red-500' : 'text-[#B0A898]'}`}
              >
                今日剩餘 {remaining}/3 題
              </span>
            )}
          </div>

          {!user ? (
            <div className="text-center py-2 space-y-3">
              <p className="text-[#B0A898] text-sm">登入後才能追加提問</p>
              <button
                onClick={login}
                className="bg-[#4A4A4A] text-white text-sm px-6 py-2 rounded-full hover:bg-black transition-all"
              >
                Google 登入
              </button>
            </div>
          ) : limitReached ? (
            <p className="text-[#B0A898] text-sm text-center py-2">
              今日提問已達上限，明天再來吧
            </p>
          ) : (
            <form onSubmit={handleAskQuestion} className="flex gap-2">
              <input
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="例：我今年適合換工作嗎？"
                disabled={asking}
                className="flex-1 bg-white border border-[#EAE5DF] rounded-xl px-4 py-3 text-[#4A4A4A] placeholder:text-[#C0B8B0] focus:outline-none focus:border-[#FCD060] transition-colors text-sm disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={asking || !question.trim()}
                className="bg-[#4A4A4A] text-white px-5 py-3 rounded-xl text-sm hover:bg-black transition-all disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
              >
                {asking ? '…' : '詢問'}
              </button>
            </form>
          )}
          {askError && <p className="text-red-500 text-sm mt-2">{askError}</p>}
        </div>
      </div>
    </motion.div>
  );
}
