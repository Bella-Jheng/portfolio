import { Suspense } from 'react';
import './global.css';
import { Header } from '../components/Layout/Header';
import { Footer } from '../components/Layout/Footer';
import { LanguageUrlSync } from '../components/Common/language-url-sync';

export const metadata = {
  title: "I'm Yiting - Portfolio",
  description: 'Front-End Software Engineer Portfolio',
  icons: {
    icon: '/img/red-flower.png',
    // iPhone「加入主畫面」用的圖示：iOS 不吃透明背景，所以放在米白底上
    apple: '/apple-touch-icon.png',
  },
};

import { MSWProvider } from '../MSWProvider';
import ReactQueryProvider from '../ReactQueryProvider';
import { GlobalLoading } from '../components/Common/loading';
import { ScrollToTopButton } from '../components/Common/scroll-to-top';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <MSWProvider>
          <ReactQueryProvider>
            <Suspense fallback={null}>
              <LanguageUrlSync />
            </Suspense>
            <GlobalLoading />
            <Header />
            <main className="">{children}</main>
            <Footer />
            <ScrollToTopButton />
          </ReactQueryProvider>
        </MSWProvider>
      </body>
    </html>
  );
}
