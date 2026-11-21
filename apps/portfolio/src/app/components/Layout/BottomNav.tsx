'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLanguage } from '../../hooks/use-language';
import { useHideOnScrollDown } from '../../hooks/use-hide-on-scroll';

const EMAIL = 'bz850308@gmail.com';

type IconProps = { className?: string; filled?: boolean };

const HomeIcon = ({ className, filled }: IconProps) => (
  <svg viewBox="0 0 24 24" className={className} fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" />
  </svg>
);

const ResumeIcon = ({ className, filled }: IconProps) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M6 3h8l5 5v12a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z" fill={filled ? 'currentColor' : 'none'} />
    <path d="M14 3v5h5" />
    <path d="M9 13h6M9 17h4" stroke={filled ? '#FBFAF1' : 'currentColor'} />
  </svg>
);

const ProjectsIcon = ({ className, filled }: IconProps) => (
  <svg viewBox="0 0 24 24" className={className} fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={2} strokeLinejoin="round" aria-hidden>
    <rect x="3.5" y="3.5" width="7" height="7" rx="1.5" />
    <rect x="13.5" y="3.5" width="7" height="7" rx="1.5" />
    <rect x="3.5" y="13.5" width="7" height="7" rx="1.5" />
    <rect x="13.5" y="13.5" width="7" height="7" rx="1.5" />
  </svg>
);

const MailIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="m3.5 6.5 8.5 6.5 8.5-6.5" />
  </svg>
);

/**
 * 手機版底部懸浮導覽列（參考租屋小幫手）：圓角膠囊浮在畫面上，
 * 往下捲動時收起，往上捲動時出現；點目前所在的分頁會捲回頂端。
 */
export const BottomNav: React.FC = () => {
  const pathname = usePathname();
  const { isEn } = useLanguage();
  const scrolledAway = useHideOnScrollDown(pathname);

  const items = [
    { href: '/', label: isEn ? 'Home' : '首頁', Icon: HomeIcon, active: pathname === '/' },
    { href: '/resume', label: isEn ? 'Resume' : '履歷', Icon: ResumeIcon, active: pathname === '/resume' },
    { href: '/projects', label: isEn ? 'Projects' : '作品', Icon: ProjectsIcon, active: pathname.startsWith('/projects') },
  ];

  const scrollTopIfActive = (active: boolean, exact: boolean) => (e: React.MouseEvent) => {
    if (active && exact) {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const itemClass = (active: boolean) =>
    `flex flex-col items-center justify-center gap-0.5 rounded-[26px] text-[11px] select-none transition active:scale-90 ${
      active ? 'font-bold text-txt-red' : 'text-txt-darkBrown/60'
    }`;

  return (
    <nav
      aria-label={isEn ? 'Main navigation' : '主要導覽'}
      className={`md:hidden fixed inset-x-0 bottom-[var(--nav-gap)] z-[55] mx-auto grid h-16 w-[calc(100%-24px)] max-w-[456px] grid-cols-4 gap-1 rounded-[32px] border border-[#DEDDB8] bg-[#FBFAF1]/95 p-1.5 shadow-[0_6px_24px_rgba(45,27,27,0.18)] backdrop-blur-md transition-transform duration-300 ${
        scrolledAway ? 'translate-y-[calc(100%+var(--nav-gap)+16px)]' : ''
      }`}
    >
      {items.map(({ href, label, Icon, active }) => (
        <Link
          key={href}
          href={href}
          aria-current={active ? 'page' : undefined}
          onClick={scrollTopIfActive(active, pathname === href)}
          className={`${itemClass(active)} ${active ? 'bg-[#F1F2CA]' : ''}`}
        >
          <Icon className={`w-[22px] h-[22px] transition-transform ${active ? 'scale-110' : ''}`} filled={active} />
          {label}
        </Link>
      ))}
      <a href={`mailto:${EMAIL}`} className={itemClass(false)}>
        <MailIcon className="w-[22px] h-[22px]" />
        {isEn ? 'Contact' : '聯絡'}
      </a>
    </nav>
  );
};
