'use client';

import { useEffect, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '../../../lib/auth-context';
import { isLineBrowser, openInExternalBrowser } from '../../../lib/detect-browser';
import { registerServiceWorker } from '../../../lib/push-client';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () => new QueryClient({ defaultOptions: { queries: { staleTime: 60_000, retry: 1 } } }),
  );

  useEffect(() => {
    if (isLineBrowser()) openInExternalBrowser();
  }, []);

  // 推播通知需要 service worker；一打開網站就先註冊好
  useEffect(registerServiceWorker, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>{children}</AuthProvider>
    </QueryClientProvider>
  );
}
