import './global.css';
import type { Metadata, Viewport } from 'next';
import { Providers } from '../components/Providers';
import { BottomNav } from '../components/BottomNav';
import { SplashScreen } from '../components/SplashScreen';
import { SPLASH_SEEN_KEY } from '../lib/splash';

export const metadata: Metadata = {
  title: '租屋小幫手',
  description: '上傳租屋截圖，自動整理地址、租金和聯絡方式，標在地圖上',
  manifest: '/manifest.webmanifest',
  icons: { icon: '/icon.svg', apple: '/icon.svg' },
  appleWebApp: { capable: true, title: '租屋小幫手', statusBarStyle: 'default' },
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#FFFFFF',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-Hant" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Sans+TC:wght@400;500;700&display=swap"
          rel="stylesheet"
        />
        {/* 同一個分頁已經看過開場畫面：在畫面畫出來前就標記，CSS 直接藏起來，避免閃一下 */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try{if(sessionStorage.getItem('${SPLASH_SEEN_KEY}'))document.documentElement.dataset.splash='seen'}catch(e){}`,
          }}
        />
      </head>
      <body className="bg-ground text-ink antialiased">
        <Providers>
          <div className="mx-auto min-h-dvh max-w-[480px] overflow-x-clip bg-ground">{children}</div>
          <BottomNav />
        </Providers>
        <SplashScreen />
      </body>
    </html>
  );
}
