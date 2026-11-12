'use client';

import { Suspense, type ReactNode } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import clsx from 'clsx';
import { ListIcon, PinIcon, PlusIcon, SettingsIcon } from './icons';

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
  if (hiddenOn(pathname)) return null;

  const onHome = pathname === '/';
  const onList = onHome && searchParams.get('view') === 'list';

  return (
    <nav
      aria-label="主要導覽"
      className="fixed inset-x-0 bottom-0 z-20 mx-auto grid h-[var(--nav-h)] max-w-[480px] grid-cols-4 border-t border-[#EFE4D6] bg-white pb-[env(safe-area-inset-bottom)]"
    >
      <NavItem href="/" active={onHome && !onList} icon={<PinIcon size={22} />} label="地圖" />
      <NavItem href="/?view=list" active={onList} icon={<ListIcon size={22} />} label="清單" />
      <Link href="/add" className="flex flex-col items-center justify-center gap-0.5 text-[11px] text-ink">
        <span className="-mt-5 flex h-12 w-12 items-center justify-center rounded-full bg-brand text-white shadow-[0_4px_12px_rgba(58,42,32,.3)]">
          <PlusIcon size={24} strokeWidth={2.4} />
        </span>
        新增
      </Link>
      <NavItem href="/settings" active={pathname === '/settings'} icon={<SettingsIcon size={22} />} label="個人設定" />
    </nav>
  );
}

function NavItem({ href, active, icon, label }: { href: string; active: boolean; icon: ReactNode; label: string }) {
  return (
    <Link
      href={href}
      aria-current={active ? 'page' : undefined}
      className={clsx('flex flex-col items-center justify-center gap-0.5 text-[11px]', active ? 'text-brand' : 'text-sub')}
    >
      {icon}
      {label}
    </Link>
  );
}
