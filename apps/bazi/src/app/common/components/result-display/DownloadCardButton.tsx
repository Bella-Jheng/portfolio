'use client';

import { useState } from 'react';
import { toPng } from 'html-to-image';
import { isMobileDevice } from '../../../lib/detect-browser';

interface DownloadCardButtonProps {
  cardRef: React.RefObject<HTMLDivElement | null>;
  name?: string;
}

async function toDataUrl(src: string): Promise<string | null> {
  try {
    const res = await fetch(src);
    if (!res.ok) return null;
    const blob = await res.blob();
    return await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}
async function inlineImages(container: HTMLElement): Promise<() => void> {
  const images = Array.from(container.querySelectorAll('img'));
  const originalSrcs = images.map((img) => img.src);

  await Promise.all(
    images.map(async (img) => {
      if (img.src.startsWith('data:')) return;
      const dataUrl = await toDataUrl(img.src);
      if (!dataUrl) return;
      img.src = dataUrl;
      try {
        // decode() 保證圖片真正解碼完成才 resolve，onload 在 data URI 上會提早觸發，
        // 手機 Safari 上會導致擷取當下圖片其實還沒畫出來
        await img.decode();
      } catch {
        if (!img.complete) {
          await new Promise<void>((res) => { img.onload = () => res(); img.onerror = () => res(); });
        }
      }
    })
  );

  return () => {
    images.forEach((img, i) => { img.src = originalSrcs[i]; });
  };
}

async function capturePng(el: HTMLElement, width: number, height: number): Promise<string> {
  const toPngOptions = {
    // 關閉 cacheBust，避免它產生隨機參數干擾已載入的圖片
    cacheBust: false,
    pixelRatio: 3,
    backgroundColor: '#fffdf5',
    width,
    height,
    style: { margin: '0', transform: 'scale(1)', boxShadow: 'none' },
    // 額外加入 html-to-image 推薦的防白邊/防失效參數
    skipFonts: true, // 如果字體不是關鍵，開啟這個可以大幅提升圖片生成成功率與速度
  };

  const dataUrl = await toPng(el, toPngOptions);
  if (dataUrl.length === 0) {
    // 偶發擷取失敗會回傳空字串，重試一次
    return toPng(el, toPngOptions);
  }
  return dataUrl;
}

export function DownloadCardButton({ cardRef, name }: DownloadCardButtonProps) {
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    if (!cardRef.current) return;
    setDownloading(true);
    
    // 1. 給 UI 反應時間
    await new Promise((resolve) => setTimeout(resolve, 300));
    
    const el = cardRef.current;
    let restoreImages: (() => void) | null = null;

    try {
      const { width, height } = el.getBoundingClientRect();
      const cardWidth = Math.round(width);
      const cardHeight = Math.round(height);

      // 2. 先把圖片轉成 data URI，避免 html-to-image 擷取當下重新 fetch 偶發失敗
      restoreImages = await inlineImages(el);

      // 3. 呼叫 toPng
      const dataUrl = await capturePng(el, cardWidth, cardHeight);

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
        console.error(err); // 建議開發時 log 出來看看具體錯誤
        alert('生成圖卡失敗，請稍後再試');
      }
    } finally {
      restoreImages?.();
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
          分享天生卡
          <span className="text-base leading-none">→</span>
        </>
      )}
    </button>
  );
}
