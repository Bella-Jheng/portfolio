'use client';

import { useEffect, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '../../../lib/auth-context';
import { isLineBrowser, openInExternalBrowser } from '../../../lib/detect-browser';
import { registerServiceWorker } from '../../../lib/push-client';
import { listenForInstallPrompt } from '../../../lib/install-prompt';
import { LocaleProvider } from '../../../lib/i18n/locale-context';
import type { Locale } from '../../../lib/i18n/locale';

export function Providers({ children, initialLocale }: { children: React.ReactNode; initialLocale: Locale }) {
  const [queryClient] = useState(
    () => new QueryClient({ defaultOptions: { queries: { staleTime: 60_000, retry: 1 } } }),
  );

  useEffect(() => {
    if (isLineBrowser()) openInExternalBrowser();
  }, []);

  // 推播通知需要 service worker；一打開網站就先註冊好
  useEffect(() => {
    registerServiceWorker();
    // Android 可以安裝時先把事件攔下來，等介紹或「我的」頁按「加到主畫面」再跳出
    listenForInstallPrompt();
  }, []);

  return (
    <LocaleProvider initialLocale={initialLocale}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>{children}</AuthProvider>
      </QueryClientProvider>
    </LocaleProvider>
  );
}
