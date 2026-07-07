'use client';

import { useRef } from 'react';
import type { Reading } from '../../../types/bazi';
import type { MagazineTheme } from './theme';
import { BaziCard } from './BaziCard';
import { DownloadCardButton } from './DownloadCardButton';
import { PersonalitySummaryCard } from './PersonalitySummaryCard';

interface CardSlideProps {
  reading: Reading;
  theme: MagazineTheme;
  mobile?: boolean;
}

export function CardSlide({ reading, theme, mobile }: CardSlideProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  return (
    <div className="flex flex-col lg:flex-row gap-6 items-stretch w-full h-full text-left">
      <div className="w-full lg:w-1/2 flex flex-col items-center gap-4 h-full">
        <BaziCard ref={cardRef} reading={reading} theme={theme} />
        <DownloadCardButton cardRef={cardRef} name={reading.name} />
      </div>
      {/* 手機版把命主特質速覽抽出去放在 swiper 下方（見 MobileCardCarousel），這裡只給桌機版顯示 */}
      {!mobile && <PersonalitySummaryCard reading={reading} theme={theme} />}
    </div>
  );
}
