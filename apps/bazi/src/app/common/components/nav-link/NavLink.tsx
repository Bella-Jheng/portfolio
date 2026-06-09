'use client';

import Link from 'next/link';
import clsx from 'clsx';

interface NavLinkProps {
  children: React.ReactNode;
  active: boolean;
  mobile?: boolean;
  href?: string;
  onClick?: () => void;
}

const desktopClass = (active: boolean) =>
  clsx(
    'text-sm font-medium tracking-wide transition-colors',
    active ? 'text-bz-magazine-yellow' : 'text-bz-magazine-dim hover:text-bz-magazine-text',
  );

const mobileClass = (active: boolean) =>
  clsx(
    'text-base font-bold tracking-wide transition-colors py-2 border-b border-black/5 text-left',
    active ? 'text-bz-magazine-yellow' : 'text-bz-magazine-text',
  );

export function NavLink({ children, active, mobile = false, href, onClick }: NavLinkProps) {
  const className = mobile ? mobileClass(active) : desktopClass(active);

  if (href) {
    return (
      <Link href={href} className={className} onClick={onClick}>
        {children}
      </Link>
    );
  }

  return (
    <button className={className} onClick={onClick}>
      {children}
    </button>
  );
}
