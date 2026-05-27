'use client';

import type { Reading } from '../../../types/bazi';
import type { MagazineTheme } from './theme';
import { STEM_ELEMENT } from './theme';
import {
  getTenGod,
  getBranchHiddenStems,
  getFortunePattern,
  type TenGod,
} from '../../../lib/bazi-calculator';

interface TenGodsSlideProps {
  reading: Reading;
  theme: MagazineTheme;
  mobile?: boolean;
}

const TEN_GOD_INFO: Record<TenGod, { emoji: string; short: string }> = {
  比肩: { emoji: '🤝', short: '獨立自主' },
  劫財: { emoji: '💫', short: '豪爽義氣' },
  食神: { emoji: '🍀', short: '才藝福氣' },
  傷官: { emoji: '🎨', short: '才氣橫溢' },
  偏財: { emoji: '💸', short: '人際廣財' },
  正財: { emoji: '💰', short: '穩健收入' },
  七殺: { emoji: '⚡', short: '雄心壓力' },
  正官: { emoji: '🏛️', short: '名譽規範' },
  偏印: { emoji: '🔮', short: '直覺偏才' },
  正印: { emoji: '📚', short: '學識貴人' },
};

// Parse 【Label】content format from AI output
function parseAnalysisSections(text: string): { label: string; content: string }[] {
  const regex = /【([^】]+)】([^【]*)/g;
  const sections: { label: string; content: string }[] = [];
  let match;
  while ((match = regex.exec(text)) !== null) {
    const content = match[2].trim();
    if (content) sections.push({ label: match[1].trim(), content });
  }
  return sections;
}

function collectTenGods(reading: Reading): TenGod[] {
  const dayStem = reading.pillars.day?.stem ?? '';
  const seen = new Set<TenGod>();
  const pillars = [reading.pillars.year, reading.pillars.month, reading.pillars.day, reading.pillars.hour].filter(Boolean);
  for (const p of pillars) {
    if (!p) continue;
    if (p.stem !== dayStem) seen.add(getTenGod(dayStem, p.stem));
    for (const h of getBranchHiddenStems(p.branch, dayStem)) seen.add(h.tenGod);
  }
  return Array.from(seen);
}

export function TenGodsSlide({ reading, theme, mobile }: TenGodsSlideProps) {
  const dayStem = reading.pillars.day?.stem ?? '';
  const dayElement = STEM_ELEMENT[dayStem] ?? '';
  const monthStem = reading.pillars.month?.stem ?? '';
  const monthBranch = reading.pillars.month?.branch ?? '';
  const pattern = monthBranch && monthStem && dayStem ? getFortunePattern(monthBranch, monthStem, dayStem) : '';
  const tenGods = collectTenGods(reading);
  const analysis = reading.fortune.tenGodAnalysis;
  const sections = analysis ? parseAnalysisSections(analysis) : [];

  // Extract header section (格局 line) from sections
  const headerSection = sections.find(s => s.label === '格局');
  const bodySections = sections.filter(s => s.label !== '格局');

  return (
    <div className={`w-full h-full flex flex-col gap-4 text-left ${mobile ? '' : 'overflow-y-auto'}`}>
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#EAE5DF] shrink-0">
        <h4 className="font-black text-sm text-[#4A4A4A] tracking-wider">十神 · 命格</h4>
        <p className="text-[10px] font-mono text-[#6B6159]">日主 {dayStem}（{dayElement}）</p>
      </div>

      {/* 命格 badge row */}
      <div className="flex flex-wrap items-center gap-2 shrink-0">
        <div
          className="px-3 py-1.5 rounded-xl text-white font-black text-xs tracking-widest"
          style={{ backgroundColor: theme.accent }}
        >
          {pattern}
        </div>
        {headerSection && (
          <p className="text-[10px] text-[#6B6159] leading-relaxed flex-1">{headerSection.content}</p>
        )}
      </div>

      {/* AI analysis sections */}
      {bodySections.length > 0 ? (
        <div className="space-y-3 flex-1">
          {bodySections.map(({ label, content }) => (
            <div key={label} className="bg-[#FAF8F5] border border-[#EAE5DF]/60 rounded-xl px-3 py-2.5">
              <p
                className="text-[10px] font-black tracking-wider mb-1"
                style={{ color: theme.accent }}
              >
                {label}
              </p>
              <p className="text-xs text-[#4A4A4A] leading-relaxed">{content}</p>
            </div>
          ))}
        </div>
      ) : (
        /* Fallback: static ten gods grid when no AI analysis yet */
        <div className="grid grid-cols-2 gap-1.5 flex-1">
          {tenGods.map((tg) => {
            const info = TEN_GOD_INFO[tg];
            if (!info) return null;
            return (
              <div key={tg} className="flex items-center gap-2 bg-[#FAF8F5] border border-[#EAE5DF]/60 rounded-xl px-3 py-2">
                <span className="text-base shrink-0">{info.emoji}</span>
                <div>
                  <span className="text-xs font-black text-[#4A4A4A]">{tg}</span>
                  <p className="text-[10px]" style={{ color: theme.accent }}>{info.short}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Ten gods quick reference chips (when AI analysis is showing) */}
      {bodySections.length > 0 && (
        <div className="flex flex-wrap gap-1.5 shrink-0 pt-1 border-t border-[#EAE5DF]/60">
          {tenGods.map((tg) => {
            const info = TEN_GOD_INFO[tg];
            return info ? (
              <span
                key={tg}
                className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FAF8F5] border border-[#EAE5DF]/60 text-[#4A4A4A]"
              >
                {info.emoji} {tg}
              </span>
            ) : null;
          })}
        </div>
      )}
    </div>
  );
}
