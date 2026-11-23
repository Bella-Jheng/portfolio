'use client';

import Link from 'next/link';
import Image from 'next/image';
import { LanguageToggle } from '../language-toggle/LanguageToggle';
import { useLocale } from '../../../lib/i18n/locale-context';
import { useDemoUrl, withDemo } from '../../../lib/demo/demo-url';

/**
 * 頂部只留 Logo 和中英切換；原本漢堡選單裡的項目都搬到底部懸浮導覽（BottomNav）和「我的」頁
 */
export function Header() {
  const { locale, t } = useLocale();
  // 訪客 Demo：站內連結都要帶著 ?demo=1，拿掉就會回到正式模式
  const demo = useDemoUrl();

  return (
    <header className="top-0 left-0 right-0 z-50">
      <div className="flex items-center justify-between h-16 pl-8 pr-4 md:px-8">
        {/* Logo — px-8 aligns with homepage top-left text */}
        <Link href={withDemo('/', demo)} className="flex items-center gap-3 group">
          <Image
            src="/cats/bazi-cat-default.webp"
            alt={t('header.logoAlt')}
            width={30}
            height={30}
            className="transition-transform group-hover:scale-105"
          />
          <span className={`text-bz-brown font-black text-xl whitespace-nowrap ${locale === 'zh' ? 'tracking-[0.15em]' : 'tracking-wide'}`}>
            {t('header.title')}
          </span>
        </Link>
        {/* 中 / EN 切換 */}
        <LanguageToggle />
      </div>
    </header>
  );
}
