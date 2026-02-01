import './global.css';
import { Header } from '../components/Layout/Header';
import { Footer } from '../components/Layout/Footer';

export const metadata = {
  title: "I'm Yiting - Portfolio",
  description: 'Front-End Software Engineer Portfolio',
};

import { MSWProvider } from '../MSWProvider';
import ReactQueryProvider from '../ReactQueryProvider';

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
            <Header />
            <main className="">{children}</main>
            <Footer />
          </ReactQueryProvider>
        </MSWProvider>
      </body>
    </html>
  );
}
