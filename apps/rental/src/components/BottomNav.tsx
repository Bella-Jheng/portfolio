'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';
import { MapIcon, PlusIcon, SettingsIcon } from './icons';

// 新增頁與私訊頁底部有自己的操作按鈕，不顯示導覽列
function hiddenOn(pathname: string): boolean {
  return pathname === '/add' || /^\/listing\/[^/]+\/message$/.test(pathname);
}

export function BottomNav() {
  const pathname = usePathname();
  if (hiddenOn(pathname)) return null;

  const onMap = pathname === '/';
  const onSettings = pathname === '/settings';

  return (
    <nav
      aria-label="主要導覽"
      className="fixed inset-x-0 bottom-0 z-20 mx-auto grid h-[var(--nav-h)] max-w-[480px] grid-cols-3 border-t border-[#E3E8EE] bg-white pb-[env(safe-area-inset-bottom)]"
    >
      <Link
        href="/?view=map"
        aria-current={onMap ? 'page' : undefined}
        className={clsx('flex flex-col items-center justify-center gap-0.5 text-[11px]', onMap ? 'text-brand' : 'text-sub')}
      >
        <MapIcon size={22} />
        回到地圖
      </Link>
      <Link href="/add" className="flex flex-col items-center justify-center gap-0.5 text-[11px] text-ink">
        <span className="-mt-5 flex h-12 w-12 items-center justify-center rounded-full bg-ink text-white shadow-[0_4px_12px_rgba(23,32,43,.3)]">
          <PlusIcon size={24} strokeWidth={2.4} />
        </span>
        新增
      </Link>
      <Link
        href="/settings"
        aria-current={onSettings ? 'page' : undefined}
        className={clsx(
          'flex flex-col items-center justify-center gap-0.5 text-[11px]',
          onSettings ? 'text-brand' : 'text-sub',
        )}
      >
        <SettingsIcon size={22} />
        個人設定
      </Link>
    </nav>
  );
}
