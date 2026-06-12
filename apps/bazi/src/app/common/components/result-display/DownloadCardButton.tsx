'use client';

import { useState } from 'react';
import { toPng } from 'html-to-image';
import { jsPDF } from 'jspdf';

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

      const pdf = new jsPDF({ orientation: 'portrait', unit: 'px', format: [cardWidth, cardHeight] });
      pdf.addImage(dataUrl, 'PNG', 0, 0, cardWidth, cardHeight);

      const today = new Date();
      const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
      pdf.save(`bazi-card-${name || 'card'}-${dateStr}.pdf`);
    } catch {
      alert('生成圖卡失敗，請稍後再試');
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
