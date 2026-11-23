import './global.css';
import { Header } from '../common/components/layout/Header';
import { Footer } from '../common/components/layout/Footer';
import { Providers } from '../common/components/layout/Providers';
import { Modal } from '../common/components/modal/Modal';
import { DemoBadge } from '../common/components/demo/Demo';
import { DemoModeSync } from '../common/components/demo/DemoModeSync';
import { cookies, headers } from 'next/headers';
import { HTML_LANG, isLocale, localeFromAcceptLanguage, LOCALE_COOKIE } from '../lib/i18n/locale';
import { SplashScreen } from '../common/components/splash/SplashScreen';
import { Onboarding } from '../common/components/onboarding/Onboarding';
import { BottomNav } from '../common/components/bottom-nav/BottomNav';
import { SPLASH_INLINE_SCRIPT } from '../lib/splash';

export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'),
  title: ' 八字算命 | 命格貓',
  description: '輸入出生年月日，透過 AI 解析你的八字命盤，了解天生個性與命格。',
  icons: {
    icon: '/favicon.png',
    apple: '/apple-touch-icon.png',
  },
  // 加入主畫面後以 App 形式打開（iPhone 要這樣才能開推播通知）
  appleWebApp: { capable: true, title: '命格貓', statusBarStyle: 'default' as const },
  openGraph: {
    title: ' 八字算命 | 命格貓',
    description: '輸入出生年月日，透過 AI 解析你的八字命盤，了解天生個性與命格。',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
    locale: 'zh_TW',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: ' 八字算命 | 命格貓',
    description: '輸入出生年月日，透過 AI 解析你的八字命盤，了解天生個性與命格。',
    images: ['/og-image.png'],
  },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // 語言：先看 cookie（使用者切換過），沒有就看瀏覽器語言；伺服器第一次渲染就用對的語言
  const cookieLocale = (await cookies()).get(LOCALE_COOKIE)?.value;
  const locale = isLocale(cookieLocale)
    ? cookieLocale
    : localeFromAcceptLanguage((await headers()).get('accept-language'));

  return (
    // data-scroll-behavior：換頁時 Next 會暫時關掉 smooth 捲動，新頁面直接出現在最上面，不會看到往上捲的動畫
    <html lang={HTML_LANG[locale]} data-scroll-behavior="smooth">
      <head>
        {/* 看過開場動畫的分頁，在畫面出現前就藏起來，換頁不會再播 */}
        <script dangerouslySetInnerHTML={{ __html: SPLASH_INLINE_SCRIPT }} />
      </head>
      <body>
        <Providers initialLocale={locale}>
          <Header />
          <main>{children}</main>
          <Footer />
          {/* 底部懸浮導覽的高度，避免蓋住頁尾 */}
          <div aria-hidden className="h-24" />
          <BottomNav />
          <Modal />
          <DemoBadge />
          <DemoModeSync />
          <Onboarding />
          <SplashScreen />
        </Providers>
      </body>
    </html>
  );
}
