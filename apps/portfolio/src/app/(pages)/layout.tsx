import './global.css';
import { Header } from '../components/Layout/Header';
import { Footer } from '../components/Layout/Footer';

export const metadata = {
  title: "I'm Yiting - Portfolio",
  description: 'Front-End Software Engineer Portfolio',
  icons: {
    icon: '/img/red-flower.png',
  },
};

import { MSWProvider } from '../MSWProvider';
import ReactQueryProvider from '../ReactQueryProvider';
import { GlobalLoading } from '../components/Common/GlobalLoading';

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
            <GlobalLoading />
            <Header />
            <main className="">{children}</main>
            <Footer />
          </ReactQueryProvider>
        </MSWProvider>
      </body>
    </html>
  );
}
