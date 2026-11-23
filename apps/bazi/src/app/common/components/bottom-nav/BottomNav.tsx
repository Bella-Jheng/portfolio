'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../../../lib/auth-context';
import { useLocale } from '../../../lib/i18n/locale-context';
import { useDemoUrl, withDemo } from '../../../lib/demo/demo-url';

/**
 * 底部懸浮導覽（取代原本的漢堡選單），樣式參考租屋小幫手：懸浮在畫面上的圓角膠囊，
 * 目前所在的項目加粗、下面一條小底線。訪客 Demo 時連結都帶著 ?demo=1。
 */
export function BottomNav() {
  const pathname = usePathname();
  const { user, isAdmin, readingId } = useAuth();
  const { t } = useLocale();
  const demo = useDemoUrl();
  const href = (path: string) => withDemo(path, demo);

  // 「我的命盤」：有命盤就直接到結果頁，還沒有就回首頁開始測算（管理員一律回首頁）
  const chartHref = href(user && readingId && !isAdmin ? `/result/${readingId}` : '/');
  const onChart = pathname === '/' || pathname === '/form' || pathname.startsWith('/result/');

  return (
    <nav
      aria-label={t('nav.aria')}
      className="fixed inset-x-0 bottom-[max(env(safe-area-inset-bottom),12px)] z-40 mx-auto grid h-16 w-[calc(100%-24px)] max-w-[420px] grid-cols-3 gap-1 rounded-[32px] border border-[#EAE5DF] bg-white/95 p-1.5 shadow-[0_6px_24px_rgba(45,36,32,.16)] backdrop-blur-md"
    >
      <NavItem href={chartHref} active={onChart} label={t('nav.chart')} icon={<ChartIcon />} />
      <NavItem href={href('/feedback')} active={pathname === '/feedback'} label={t('nav.feedback')} icon={<WishIcon />} />
      <NavItem href={href('/me')} active={pathname === '/me'} label={t('nav.me')} icon={<MeIcon />} />
    </nav>
  );
}

function NavItem({ href, active, label, icon }: { href: string; active: boolean; label: string; icon: ReactNode }) {
  return (
    <Link
      href={href}
      aria-current={active ? 'page' : undefined}
      className={`flex flex-col items-center justify-center gap-0.5 rounded-[26px] text-[11px] transition active:scale-90 ${
        active
          ? 'font-bold text-[#2D2420] after:mt-0.5 after:h-0.5 after:w-4 after:rounded-full after:bg-[#E9B93A] [&>svg]:scale-110'
          : 'text-[#7A7068]'
      }`}
    >
      {icon}
      {label}
    </Link>
  );
}

const iconProps = {
  width: 22,
  height: 22,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
  className: 'transition-transform',
};

// 命盤：貓臉輪廓
function ChartIcon() {
  return (
    <svg {...iconProps}>
      <path d="M5 10.5 6 4l4.5 3.2a8 8 0 0 1 3 0L18 4l1 6.5c.7 1.2 1 2.4 1 3.5 0 3.9-3.6 6-8 6s-8-2.1-8-6c0-1.1.3-2.3 1-3.5Z" />
      <path d="M9.5 13h.01M14.5 13h.01" strokeWidth={2.6} />
    </svg>
  );
}

// 許願池：星星
function WishIcon() {
  return (
    <svg {...iconProps}>
      <path d="m12 3 2.5 5.6 6 .6-4.5 4 1.3 6-5.3-3.1-5.3 3.1 1.3-6-4.5-4 6-.6Z" />
    </svg>
  );
}

function MeIcon() {
  return (
    <svg {...iconProps}>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c1.5-3.5 4.5-5 8-5s6.5 1.5 8 5" />
    </svg>
  );
}
