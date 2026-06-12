import './global.css';
import { Header } from '../common/components/layout/Header';
import { Footer } from '../common/components/layout/Footer';
import { Providers } from '../common/components/layout/Providers';
import { Modal } from '../common/components/modal/Modal';
import { WaterRipple } from '../common/components/water-ripple/WaterRipple';

export const metadata = {
  title: '八字命理',
  description: '輸入出生年月日，透過 AI 解析您的八字命盤',
  icons: {
    icon: '/favicon.png',
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
          <WaterRipple />
        </Providers>
      </body>
    </html>
  );
}
