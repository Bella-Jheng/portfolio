'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import html2canvas from 'html2canvas';
import type { Reading } from '../../../types/bazi';
import type { MagazineTheme } from './theme';
import { ELEMENT_ENGLISH, STEM_ELEMENT } from './theme';

const TOC_ITEMS = [
  { num: '一', title: '命盤總覽', desc: '日主特質判定與四柱格局起伏大方向' },
  { num: '二', title: '性格特質', desc: '內在性格、外在表現與潛在心理盲點' },
  { num: '三', title: '整體運勢', desc: '一生大運階段起伏與流年總體能量解析' },
  { num: '四', title: '財運狀況', desc: '天生財庫、求財機遇與守財防漏財指南' },
  { num: '五', title: '工作事業', desc: '適合行業職能定位與職場開運策略' },
  { num: '六', title: '感情桃花', desc: '姻緣時機、桃花強弱與感情相處建議' },
  { num: '七', title: '健康狀況', desc: '經絡臟腑五行對應與日常養生保養' },
  { num: '八', title: '補運建議', desc: '喜用神開運方位、幸運顏色與生肖速查' },
  { num: '九', title: '重點行動建議', desc: `${new Date().getFullYear()} 流年特別提示與具體行事準則` },
];

interface CardSlideProps {
  reading: Reading;
  theme: MagazineTheme;
  mobile?: boolean;
}

export function CardSlide({ reading, theme, mobile }: CardSlideProps) {
  const [downloading, setDownloading] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  const dayElement = STEM_ELEMENT[reading.pillars?.day?.stem ?? ''] ?? '';
  const elementEn = ELEMENT_ENGLISH[dayElement] ?? 'BAZI READING';

  const dotGridStyle = {
    backgroundImage: `radial-gradient(${theme.accent}40 2px, transparent 2px)`,
    backgroundSize: '12px 12px',
  };

  const handleDownload = async () => {
    if (!printRef.current) return;
    setDownloading(true);
    try {
      const canvas = await html2canvas(printRef.current, {
        scale: 2, useCORS: true, backgroundColor: theme.bg,
      });
      const link = document.createElement('a');
      link.href = canvas.toDataURL('image/png');
      link.download = `bazi_${reading.name || 'card'}.png`;
      link.click();
    } catch {
      alert('生成圖卡失敗，請稍後再試');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 items-stretch w-full h-full text-left">
      {/* Card + Download */}
      <div className="w-full lg:w-1/2 flex flex-col items-center gap-4 h-full">
        <div
          ref={printRef}
          className="relative w-full flex-1 rounded-2xl border border-black/10 overflow-hidden bg-[#FFFDF5] shadow-md flex flex-col"
        >
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={dotGridStyle} />

          <div className="h-10 bg-white/70 border-b border-black/5 px-4 flex items-center justify-between text-[10px] font-mono tracking-widest text-black/40 z-10 shrink-0">
            <span>The</span>
            <span>— • ——— • —</span>
            <span>{reading.birthYear % 10} ♦ {reading.birthMonth % 10}</span>
          </div>

          <div className="flex-1 relative p-5 flex flex-col">
            <div className="space-y-0.5 relative z-10">
              <h3 className="text-base font-bold tracking-widest text-black/80">
                Hi{reading.name ? `, ${reading.name}` : ''}
              </h3>
              <h2 className="text-lg font-black tracking-[0.3em] text-black/80">天生就屬</h2>
              <p className="font-serif italic text-[10px] tracking-widest text-black/60">Your bazi element</p>
            </div>

            <div className="mt-auto flex items-end gap-2.5 z-10 relative">
              <div
                className="text-[9px] tracking-[0.4em] font-mono whitespace-nowrap mb-1 opacity-50"
                style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
              >
                {elementEn}
              </div>
              <div className="flex flex-col gap-0.5">
                {['天', '命', '人'].map((char, i) => (
                  <span key={i} className="text-3xl font-black leading-none text-black/80">
                    {i === 0 ? (dayElement || '命') : char}
                  </span>
                ))}
              </div>
            </div>

            <div className="absolute right-[-12px] top-1/2 -translate-y-1/2 w-44 h-44 z-0 flex items-center justify-center">
              <div
                className="absolute inset-0 opacity-80 mix-blend-multiply"
                style={{ backgroundColor: theme.accent, borderRadius: '40% 60% 70% 30% / 40% 50% 60% 50%', transform: 'scale(1.2)' }}
              />
              <Image src={theme.catSrc} alt="Result Cat" width={155} height={195} priority className="relative z-10 drop-shadow-lg -rotate-6" />
            </div>
          </div>

          <div className="bg-white/70 relative flex items-start justify-center border-t border-black/5 shrink-0 p-4">
            <div className="absolute left-0 top-0 bottom-0 w-12" style={dotGridStyle} />
            <div className="absolute right-0 top-0 bottom-0 w-12" style={dotGridStyle} />
            <div className="relative z-10 max-w-[220px] text-center space-y-1.5 bg-white/50 px-3 py-2 backdrop-blur-sm rounded-lg">
              <h4 className="font-bold tracking-widest text-[11px]" style={{ color: theme.accent }}>分析指南</h4>
              <p className="text-[10px] leading-relaxed text-black/70 font-medium line-clamp-3">
                {reading.fortune.personality || '適度的挑戰讓人感到充實，內斂而有深度。'}
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={handleDownload}
          disabled={downloading}
          className="flex items-center justify-center gap-2 bg-[#4A4A4A] text-white px-7 py-2.5 rounded-full text-xs font-semibold tracking-wider hover:bg-black shadow-sm w-full transition-all shrink-0"
        >
          {downloading ? '生成中...' : '下載天生卡'}
        </button>
      </div>

      {/* Table of Contents */}
      <div className="w-full lg:w-1/2 flex flex-col bg-[#FAF7F4] border border-[#EAE5DF] rounded-2xl p-5 h-full">
        <div className="flex items-center gap-2 mb-3 border-b border-[#EAE5DF]/60 pb-2">
          <span className="text-base">📖</span>
          <h3 className="font-black text-sm tracking-wider text-[#4A4A4A]">章節內容</h3>
        </div>
        <div className="space-y-2 text-xs overflow-y-auto pr-1 flex-1">
          {TOC_ITEMS.map(({ num, title, desc }) => (
            <div key={num} className="flex items-start gap-2">
              <span className="font-bold text-[#6B6159] shrink-0 w-4">{num}</span>
              <div>
                <p className="font-bold text-[#4A4A4A]">{title}</p>
                <p className="text-[10px] text-[#5C5449] mt-0.5">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
