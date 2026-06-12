'use client';

import { useRef } from 'react';
import type { Reading } from '../../../types/bazi';
import type { MagazineTheme } from './theme';
import { BaziCard } from './BaziCard';
import { DownloadCardButton } from './DownloadCardButton';
import { TocList } from './TocList';

interface CardSlideProps {
  reading: Reading;1;
  theme: MagazineTheme;
  mobile?: boolean;
  onTabSelect?: (tabIdx: number) => void;
}

export function CardSlide({ reading, theme, onTabSelect }: CardSlideProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  return (
    <div className="flex flex-col lg:flex-row gap-6 items-stretch w-full h-full text-left">
      <div className="w-full lg:w-1/2 flex flex-col items-center gap-4 h-full">
        <BaziCard ref={cardRef} reading={reading} theme={theme} />
        <DownloadCardButton cardRef={cardRef} name={reading.name} />
      </div>
      <TocList onTabSelect={onTabSelect} />
    </div>
  );
}
