'use client';

import { useEffect, useState } from 'react';

const THRESHOLD = 8; // 滑動超過這個距離才切換，避免手指輕微晃動就閃爍
const TOP_ZONE = 24; // 回到最上面附近一律顯示

/**
 * 往下捲動時回傳 true（該收起來），往上捲動或回到頂端時回傳 false。
 * resetKey 改變時（例如換頁）重新顯示。
 */
export function useHideOnScrollDown(resetKey?: string): boolean {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    setHidden(false);
    let last = window.scrollY;

    const onScroll = () => {
      // iOS 回彈時 scrollY 會超出範圍，夾在合法範圍內再比較
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const top = Math.min(Math.max(window.scrollY, 0), Math.max(max, 0));

      if (top <= TOP_ZONE) {
        setHidden(false);
        last = top;
        return;
      }
      if (Math.abs(top - last) < THRESHOLD) return;
      setHidden(top > last);
      last = top;
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [resetKey]);

  return hidden;
}
