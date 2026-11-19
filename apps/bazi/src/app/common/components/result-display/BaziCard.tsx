'use client';

import { forwardRef } from 'react';
import Image from 'next/image';
import type { Reading } from '../../../types/bazi';
import type { MagazineTheme } from './theme';
import { ELEMENT_ENGLISH, STEM_ELEMENT } from './theme';
import { useLocale } from '../../../lib/i18n/locale-context';
import { patternLabel, stemEn, strengthLabel } from '../../../lib/i18n/glossary';

const ELEMENT_DEFAULT_TRAITS: Record<string, string> = {
  木: '創意・成長・仁慈',
  火: '熱情・直覺・表現力',
  土: '穩重・踏實・包容',
  金: '精緻・原則・執行力',
  水: '智慧・靈活・深思',
};

const ELEMENT_DEFAULT_TRAITS_EN: Record<string, string> = {
  木: 'Creative · Growing · Kind',
  火: 'Warm · Intuitive · Expressive',
  土: 'Steady · Grounded · Accepting',
  金: 'Refined · Principled · Decisive',
  水: 'Wise · Flexible · Thoughtful',
};

function parseSummary(text?: string | null) {
  if (!text) return {};
  const line = text.split('\n')[0];
  return {
    pattern: line.match(/【格局】([^｜\n]+)/)?.[1]?.trim(),
    strength: line.match(/(身強|身弱)/)?.[1],
  };
}

interface BaziCardProps {
  reading: Reading;
  theme: MagazineTheme;
}

export const BaziCard = forwardRef<HTMLDivElement, BaziCardProps>(
  function BaziCard({ reading, theme }, ref) {
    const { locale, t } = useLocale();
    const dayStem = reading.pillars?.day?.stem ?? '';
    const dayElement = STEM_ELEMENT[dayStem] ?? '';
    const elementEn = ELEMENT_ENGLISH[dayElement] ?? 'BAZI READING';
    const defaultTraits = locale === 'en' ? ELEMENT_DEFAULT_TRAITS_EN : ELEMENT_DEFAULT_TRAITS;
    const traits = reading.fortune.traits || defaultTraits[dayElement] || '';
    // 格局、身強弱要從中文主版本解析（英文版的格式對不上）
    const { pattern, strength } = parseSummary((reading.fortuneZh ?? reading.fortune).tenGodAnalysis);

    const dotGridStyle = {
      backgroundImage: `radial-gradient(${theme.accent}40 2px, transparent 2px)`,
      backgroundSize: '12px 12px',
    };

    return (
      <div
        ref={ref}
        className="relative w-full flex-1 rounded-2xl border border-black/10 overflow-hidden bg-[#FFFDF5] shadow-md flex flex-col"
      >
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={dotGridStyle} />

        {/* Header */}
        <div className="h-10 bg-white/70 border-b border-black/5 px-4 flex items-center justify-between text-[10px] font-mono tracking-widest text-black/40 z-10 shrink-0">
          <span>The</span>
          <span>— • ——— • —</span>
          <span>{reading.birthYear % 10} ♦ {reading.birthMonth % 10}</span>
        </div>

        {/* Body */}
        <div className="flex-1 relative p-5 flex flex-col">
          <div className="space-y-0.5 relative z-10">
            <h3 className="text-base font-bold tracking-widest text-black/80">
              {t('card.hi')}{reading.name ? `, ${reading.name}` : ''}
            </h3>
            <h2 className="text-lg font-black tracking-[0.3em] text-black/80">{t('card.title')}</h2>
            <p className="font-serif italic text-[10px] tracking-widest text-black/60">{t('card.subtitle')}</p>
          </div>

          <div className="mt-auto flex items-end gap-2.5 z-10 relative">
            <div className="flex flex-col items-center mb-1 opacity-50">
              {elementEn.split('').map((char, i) => (
                <span key={i} className="text-[9px] font-mono leading-tight tracking-widest">{char}</span>
              ))}
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
            <Image src={theme.catSrc} alt={t('card.catAlt')} width={155} height={195} priority unoptimized crossOrigin='anonymous' className="relative z-10 drop-shadow-lg -rotate-6" />
          </div>
        </div>

        {/* Footer */}
        <div className="bg-white/70 relative flex flex-col items-center justify-center border-t border-black/5 shrink-0 px-4 py-3 gap-2">
          <div className="absolute left-0 top-0 bottom-0 w-12" style={dotGridStyle} />
          <div className="absolute right-0 top-0 bottom-0 w-12" style={dotGridStyle} />
          {/* B：命盤摘要 */}
          {(dayStem || strength || pattern) && (
            <p className="relative z-10 text-[10px] font-mono tracking-widest text-black/40">
              {[
                dayStem && t('card.summaryDay', { stem: dayStem, element: dayElement, stemEn: stemEn(dayStem) }),
                strength && strengthLabel(strength, locale),
                pattern && patternLabel(pattern, locale),
              ].filter(Boolean).join(' · ')}
            </p>
          )}
          {/* A：命格關鍵詞 */}
          {traits && (
            <p className="relative z-10 text-[11px] font-bold tracking-wider" style={{ color: theme.accent }}>
              {traits}
            </p>
          )}
        </div>
      </div>
    );
  }
);
