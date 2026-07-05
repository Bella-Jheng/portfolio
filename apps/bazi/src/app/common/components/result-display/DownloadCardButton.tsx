'use client';

import { useState } from 'react';
import { toPng } from 'html-to-image';
import { isMobileDevice } from '../../../lib/detect-browser';

interface DownloadCardButtonProps {
  cardRef: React.RefObject<HTMLDivElement | null>;
  name?: string;
}

export function DownloadCardButton({ cardRef, name }: DownloadCardButtonProps) {
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    if (!cardRef.current) return;
    setDownloading(true);
    await new Promise((resolve) => setTimeout(resolve, 300));
    try {
      const el = cardRef.current;
      const { width, height } = el.getBoundingClientRect();
      const cardWidth = Math.round(width);
      const cardHeight = Math.round(height);

      const dataUrl = await toPng(el, {
        cacheBust: true,
        pixelRatio: 3,
        backgroundColor: '#fffdf5',
        width: cardWidth,
        height: cardHeight,
        style: { margin: '0', transform: 'scale(1)', boxShadow: 'none' },
      });

      const today = new Date();
      const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
      const fileName = `bazi-card-${name || 'card'}-${dateStr}.png`;

      const blob = await (await fetch(dataUrl)).blob();
      const file = new File([blob], fileName, { type: 'image/png' });

      if (isMobileDevice() && navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: '我的天生卡', text: '快來看看我的八字天生卡！' });
      } else {
        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = fileName;
        link.click();
      }
    } catch (err) {
      if ((err as Error)?.name !== 'AbortError') {
        alert('生成圖卡失敗，請稍後再試');
      }
    } finally {
      setDownloading(false);
    }
  };

  return (
    <button
      onClick={handleDownload}
      disabled={downloading}
      className="flex items-center justify-center gap-2 bg-[#4A4A4A] text-white px-7 py-2.5 rounded-full text-xs font-semibold tracking-wider hover:bg-black shadow-sm w-full transition-all shrink-0 disabled:opacity-70 disabled:cursor-not-allowed"
    >
      {downloading ? (
        <>
          生成中
          <span className="flex items-center h-4">
            <span className="animate-dot1 inline-block">.</span>
            <span className="animate-dot2 inline-block">.</span>
            <span className="animate-dot3 inline-block">.</span>
          </span>
        </>
      ) : (
        <>
          下載天生卡
          <span className="text-base leading-none">→</span>
        </>
      )}
    </button>
  );
}
