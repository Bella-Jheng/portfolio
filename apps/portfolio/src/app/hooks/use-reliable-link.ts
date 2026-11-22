'use client';

import { useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useLoadingStore } from '../store/loading.store';

const TAP_MAX_MOVE_PX = 10; // 手指移動超過這個距離就當成滑動，不換頁
const TAP_MAX_MS = 700;
const HARD_NAV_FALLBACK_MS = 2500; // 這段時間內還沒換頁，就改用瀏覽器整頁跳轉

/**
 * 讓卡片連結在 iPhone 上一定點得進去，而且點下去馬上有回應：
 * 1. 手指放開（pointerup）就換頁：iOS Safari 有時會把 click 吞掉，pointerup 不會
 * 2. 點下去立刻進入「換頁中」，超過 0.2 秒還沒換好就顯示三朵花 loading，
 *    而且一直顯示到真的進到詳細頁才關掉
 * 3. 2.5 秒內還沒換頁（例如前端路由卡住），改用整頁跳轉
 * 桌機滑鼠點擊、Cmd/Ctrl 點開新分頁照舊。
 */
export function useReliableLink(href: string) {
  const router = useRouter();
  const startNavigation = useLoadingStore.use.startNavigation();
  const down = useRef<{ x: number; y: number; t: number } | null>(null);
  const navigatedAt = useRef(0);

  const navigate = useCallback(() => {
    // 同一次點擊（pointerup 之後瀏覽器可能又送 click）只換一次頁
    if (Date.now() - navigatedAt.current < 1000) return;
    navigatedAt.current = Date.now();

    const target = new URL(href, window.location.href).pathname;
    if (window.location.pathname === target) return;

    startNavigation(target);
    router.push(href);
    window.setTimeout(() => {
      // 只有「還在等這一次換頁」才整頁跳轉：已經到過目標頁、或使用者已經按返回／
      // 去了別頁（換頁狀態被 GlobalLoading 結束）時就不要再跳，否則會把人拉回詳細頁
      const stillWaiting = useLoadingStore.getState().navigatingTo === target;
      if (stillWaiting && window.location.pathname !== target) {
        window.location.assign(href);
      }
    }, HARD_NAV_FALLBACK_MS);
  }, [href, router, startNavigation]);

  const onPointerDown = (e: React.PointerEvent) => {
    // 滑鼠交給一般的 click 處理
    down.current =
      e.pointerType === 'mouse' ? null : { x: e.clientX, y: e.clientY, t: Date.now() };
  };

  const onPointerUp = (e: React.PointerEvent) => {
    const start = down.current;
    down.current = null;
    if (!start) return;
    const moved = Math.hypot(e.clientX - start.x, e.clientY - start.y);
    if (moved <= TAP_MAX_MOVE_PX && Date.now() - start.t <= TAP_MAX_MS) navigate();
  };

  // 瀏覽器接手捲動（左右滑卡片、上下捲頁面）時會送 pointercancel，這次就不換頁
  const onPointerCancel = () => {
    down.current = null;
  };

  const onClick = (e: React.MouseEvent) => {
    // Cmd/Ctrl/Shift 點擊、中鍵：照瀏覽器預設（開新分頁等）
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    // 自己處理換頁；Next.js Link 看到 defaultPrevented 就不會再換一次
    e.preventDefault();
    navigate();
  };

  return { onPointerDown, onPointerUp, onPointerCancel, onClick };
}
