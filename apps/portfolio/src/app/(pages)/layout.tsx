import { Suspense } from 'react';
import type { Metadata, Viewport } from 'next';
import './global.css';
import { Header } from '../components/Layout/Header';
import { Footer } from '../components/Layout/Footer';
import { LanguageUrlSync } from '../components/Common/language-url-sync';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  // 讓內容延伸到瀏海／底部橫條區域，再用 safe-area 留白
  viewportFit: 'cover',
  themeColor: '#F1F2CA',
};

export const metadata: Metadata = {
  title: "I'm Yiting - Portfolio",
  description: 'Front-End Software Engineer Portfolio',
  icons: {
    icon: '/img/red-flower.png',
    // iPhone「加入主畫面」用的圖示：iOS 不吃透明背景，所以放在米白底上
    apple: '/apple-touch-icon.png',
  },
  // 加入主畫面後以全螢幕開啟，沒有 Safari 網址列
  appleWebApp: {
    capable: true,
    title: '伊婷作品集',
    statusBarStyle: 'default',
  },
};

import { MSWProvider } from '../MSWProvider';
import ReactQueryProvider from '../ReactQueryProvider';
import { GlobalLoading, SplashScreen } from '../components/Common/loading';
import { SPLASH_SEEN_KEY } from '../components/Common/loading/splash-key';
import { ScrollToTopButton } from '../components/Common/scroll-to-top';
import { BottomNav } from '../components/Layout/BottomNav';
import { DataPrefetcher } from '../components/Common/data-prefetcher';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-Hant" suppressHydrationWarning>
      <head>
        {/* 這個分頁已經看過開場畫面：在畫面畫出來前就標記，CSS 直接藏起來，避免閃一下 */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try{if(sessionStorage.getItem('${SPLASH_SEEN_KEY}'))document.documentElement.dataset.splash='seen'}catch(e){}`,
          }}
        />
      </head>
      <body>
        <MSWProvider>
          <ReactQueryProvider>
            <Suspense fallback={null}>
              <LanguageUrlSync />
            </Suspense>
            <GlobalLoading />
            <DataPrefetcher />
            <Header />
            <main className="">{children}</main>
            <Footer />
            <ScrollToTopButton />
            <BottomNav />
          </ReactQueryProvider>
        </MSWProvider>
        <SplashScreen />
      </body>
    </html>
  );
}
