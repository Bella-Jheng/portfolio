'use client';

import { useEffect, useState } from 'react';

const THRESHOLD = 8; // 滑動超過這個距離才切換，避免手指輕微晃動就閃爍
const TOP_ZONE = 24; // 回到最上面附近一律顯示

/**
 * 往下捲動時回傳 true（該隱藏），往上捲動或回到頂端時回傳 false。
 * 用 capture 監聽整個頁面的 scroll，所以視窗本身或頁面裡的捲動區塊（例如清單）都會偵測到。
 * resetKey 改變時（例如換頁）重新顯示。
 */
export function useHideOnScrollDown(resetKey?: string): boolean {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    setHidden(false);
    const lastTop = new WeakMap<EventTarget, number>();

    const onScroll = (event: Event) => {
      const el =
        event.target === document || event.target === window
          ? document.scrollingElement ?? document.documentElement
          : (event.target as Element);
      if (!(el instanceof Element)) return;

      // iOS 回彈時 scrollTop 會超出範圍，夾在合法範圍內再比較
      const max = el.scrollHeight - el.clientHeight;
      const top = Math.min(Math.max(el.scrollTop, 0), Math.max(max, 0));
      const prev = lastTop.get(el);

      if (top <= TOP_ZONE) {
        setHidden(false);
        lastTop.set(el, top);
        return;
      }
      // 第一次看到這個捲動區塊：先記下位置當比較基準
      if (prev === undefined) {
        lastTop.set(el, top);
        return;
      }
      if (Math.abs(top - prev) < THRESHOLD) return;
      setHidden(top > prev);
      lastTop.set(el, top);
    };

    window.addEventListener('scroll', onScroll, { capture: true, passive: true });
    return () => window.removeEventListener('scroll', onScroll, { capture: true });
  }, [resetKey]);

  return hidden;
}
