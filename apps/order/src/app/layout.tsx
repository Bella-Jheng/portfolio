import './global.css';
import { QueryProvider } from './providers/query-provider';

export const metadata = {
  title: 'Order Management',
  description: 'Order management dashboard',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-Hant">
      <body className="bg-gray-50 text-gray-900">
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
