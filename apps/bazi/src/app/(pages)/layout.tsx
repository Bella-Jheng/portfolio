import './global.css';
import { Header } from '../components/Layout/Header';
import { Footer } from '../components/Layout/Footer';
import { Providers } from '../components/Layout/Providers';
import { Modal } from '../components/Common/modal/Modal';

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
          <main className="min-h-screen pt-16">{children}</main>
          <Footer />
          <Modal />
        </Providers>
      </body>
    </html>
  );
}
