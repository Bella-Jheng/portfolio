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
import { useLocale } from '../../../lib/i18n/locale-context';
import { elementLabel, patternLabel, tenGodLabel } from '../../../lib/i18n/glossary';

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

const TEN_GOD_SHORT_EN: Record<TenGod, string> = {
  比肩: 'Independent', 劫財: 'Generous & loyal',
  食神: 'Talent & ease', 傷官: 'Brilliant & bold',
  偏財: 'Social wealth', 正財: 'Steady income',
  七殺: 'Ambition & pressure', 正官: 'Reputation & rules',
  偏印: 'Intuition & niche skills', 正印: 'Learning & mentors',
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
  for (const pillar of pillars) {
    if (!pillar) continue;
    if (pillar.stem !== dayStem) seen.add(getTenGod(dayStem, pillar.stem));
    for (const hiddenStem of getBranchHiddenStems(pillar.branch, dayStem)) seen.add(hiddenStem.tenGod);
  }
  return Array.from(seen);
}

export function TenGodsSlide({ reading, theme, mobile }: TenGodsSlideProps) {
  const { locale, t } = useLocale();
  const dayStem = reading.pillars.day?.stem ?? '';
  const dayElement = STEM_ELEMENT[dayStem] ?? '';
  const monthStem = reading.pillars.month?.stem ?? '';
  const monthBranch = reading.pillars.month?.branch ?? '';
  const pattern = monthBranch && monthStem && dayStem ? getFortunePattern(monthBranch, monthStem, dayStem) : '';
  const tenGods = collectTenGods(reading);
  const summary = reading.fortune.tenGodAnalysis;
  const summarySections = summary ? parseAnalysisSections(summary) : [];
  const detail = reading.fortune.tenGodAnalysisDetail;
  const detailSections = detail ? parseAnalysisSections(detail) : [];

  return (
    <div className={`w-full h-full flex flex-col gap-4 text-left ${mobile ? '' : 'overflow-y-auto'}`}>
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#EAE5DF] shrink-0">
        <h4 className="font-black text-sm text-[#4A4A4A] tracking-wider">{t('slide.tengodsTitle')}</h4>
        <p className="text-[10px] font-mono text-[#6B6159]">{t('slide.dayMaster', { stem: dayStem, element: elementLabel(dayElement, locale) })}</p>
      </div>

      {/* 命格 badge row */}
      <div className="flex flex-wrap items-center gap-2 shrink-0">
        <div
          className="px-3 py-1.5 rounded-xl text-white font-black text-xs tracking-widest"
          style={{ backgroundColor: theme.accent }}
        >
          {patternLabel(pattern, locale)}
        </div>
      </div>
      
      {/* AI summary */}
      {summary ? (
        summarySections.length > 0 ? (
          <div className="space-y-3 flex-1">
            {summarySections.map(({ label, content }) => (
              <div key={label} className="bg-[#FAF8F5] border border-[#EAE5DF]/60 rounded-xl px-3 py-2.5">
                <p className="text-[10px] font-black tracking-wider mb-1" style={{ color: theme.accent }}>{label}</p>
                <p className="text-xs text-[#4A4A4A] leading-relaxed">{content}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-[#4A4A4A] leading-relaxed flex-1">{summary}</p>
        )
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
                  <span className="text-xs font-black text-[#4A4A4A]">{tenGodLabel(tg, locale)}</span>
                  <p className="text-[10px]" style={{ color: theme.accent }}>{locale === 'en' ? TEN_GOD_SHORT_EN[tg] : info.short}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Ten gods quick reference chips (when AI analysis is showing) */}
      {summary && (
        <div className="flex flex-wrap gap-1.5 shrink-0 pt-1 border-t border-[#EAE5DF]/60">
          {tenGods.map((tg) => {
            const info = TEN_GOD_INFO[tg];
            return info ? (
              <span
                key={tg}
                className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FAF8F5] border border-[#EAE5DF]/60 text-[#4A4A4A]"
              >
                {info.emoji} {tenGodLabel(tg, locale)}
              </span>
            ) : null;
          })}
        </div>
      )}

      {detailSections.length > 0 && (
        <div className="flex flex-col gap-3 pt-2">
          <div className="flex items-center gap-3">
            <div className="flex-1 border-t border-[#EAE5DF]" />
            <span className="text-[10px] font-mono tracking-widest text-[#B0A898] uppercase shrink-0">{t('slide.fullAnalysis')}</span>
            <div className="flex-1 border-t border-[#EAE5DF]" />
          </div>
          <div className="space-y-3">
            {detailSections.map(({ label, content }) => (
              <div key={label} className="bg-[#FAF8F5] border border-[#EAE5DF]/60 rounded-xl px-3 py-2.5">
                <p className="text-[10px] font-black tracking-wider mb-1" style={{ color: theme.accent }}>{label}</p>
                <p className="text-xs text-[#4A4A4A] leading-relaxed">{content}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
