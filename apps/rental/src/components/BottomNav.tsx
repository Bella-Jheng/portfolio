'use client';

import { Suspense, type ReactNode } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import clsx from 'clsx';
import { HeartOutlineIcon, ListIcon, PinIcon, PlusIcon, SettingsIcon } from './icons';
import { useHideOnScrollDown } from '../lib/use-scroll-direction';

// 新增頁與私訊頁底部有自己的操作按鈕，不顯示導覽列
function hiddenOn(pathname: string): boolean {
  return pathname === '/add' || /^\/listing\/[^/]+\/message$/.test(pathname);
}

export function BottomNav() {
  // useSearchParams 需要包在 Suspense 裡
  return (
    <Suspense>
      <Nav />
    </Suspense>
  );
}

function Nav() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  // 往下捲動時收起來讓出畫面，往上捲動時再出現；換頁時重新顯示
  const scrolledAway = useHideOnScrollDown(`${pathname}?${searchParams.toString()}`);
  if (hiddenOn(pathname)) return null;

  const onHome = pathname === '/';
  const viewParam = onHome ? searchParams.get('view') : null;
  const onList = viewParam === 'list';
  const onFavorites = viewParam === 'favorites';

  return (
    <nav
      aria-label="主要導覽"
      // 參考 LINE：懸浮在畫面上的圓角膠囊，目前所在的項目用淡色圓角底標示
      className={clsx(
        'fixed inset-x-0 bottom-[var(--nav-gap)] z-20 mx-auto grid h-16 w-[calc(100%-24px)] max-w-[456px] grid-cols-5 gap-1 rounded-[32px] bg-white/90 p-1.5 shadow-[0_6px_24px_rgba(58,42,32,.18)] backdrop-blur-md transition-transform duration-300',
        scrolledAway && 'translate-y-[calc(100%+var(--nav-gap)+16px)]',
      )}
    >
      <NavItem href="/" active={onHome && !viewParam} icon={<PinIcon size={22} />} label="地圖" />
      <NavItem href="/?view=list" active={onList} icon={<ListIcon size={22} />} label="清單" />
      <Link
        href="/add"
        className="flex flex-col items-center justify-center gap-0.5 rounded-[26px] text-[11px] font-medium text-ink"
      >
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand text-white">
          <PlusIcon size={18} strokeWidth={2.6} />
        </span>
        新增
      </Link>
      <NavItem href="/?view=favorites" active={onFavorites} icon={<HeartOutlineIcon size={22} />} label="最想要" />
      <NavItem href="/settings" active={pathname === '/settings'} icon={<SettingsIcon size={22} />} label="設定" />
    </nav>
  );
}

function NavItem({ href, active, icon, label }: { href: string; active: boolean; icon: ReactNode; label: string }) {
  return (
    <Link
      href={href}
      aria-current={active ? 'page' : undefined}
      className={clsx(
        'flex flex-col items-center justify-center gap-0.5 rounded-[26px] text-[11px] transition-colors',
        active ? 'bg-brand-soft font-medium text-brand' : 'text-sub',
      )}
    >
      {icon}
      {label}
    </Link>
  );
}
