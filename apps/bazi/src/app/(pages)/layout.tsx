import './global.css';
import { Header } from '../common/components/layout/Header';
import { Footer } from '../common/components/layout/Footer';
import { Providers } from '../common/components/layout/Providers';
import { Modal } from '../common/components/modal/Modal';

export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'),
  title: ' 八字算命 | 命格貓',
  description: '輸入出生年月日，透過 AI 解析你的八字命盤，了解天生個性與命格。',
  icons: {
    icon: '/favicon.png',
  },
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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-TW">
      <body>
        <Providers>
          <Header />
          <main>{children}</main>
          <Footer />
          <Modal />
        </Providers>
      </body>
    </html>
  );
}
