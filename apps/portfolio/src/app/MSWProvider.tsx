'use client';

import { useEffect, useRef, useState } from 'react';

const isDev = process.env.NODE_ENV === 'development';

export const MSWProvider = ({ children }: { children: React.ReactNode }) => {
  // Production reads from real route handlers under app/api/**, so there's
  // nothing to mock and no service worker to wait for. MSW is dev-only —
  // it used to also gate production, but the SW can fail to register
  // (blocked by browser privacy settings, first-load race, etc.), which
  // made real requests bypass straight to network and 404.
  const [mswReady, setMswReady] = useState(!isDev);
  const startedRef = useRef(false);

  useEffect(() => {
    if (!isDev || startedRef.current) return;
    startedRef.current = true;

    import('./api/mocks/browser')
      .then(({ worker }) =>
        worker.start({
          serviceWorker: { url: '/mockServiceWorker.js' },
          onUnhandledRequest: 'bypass',
        }),
      )
      .then(() => setMswReady(true))
      .catch(() => setMswReady(true));
  }, []);

  if (!mswReady) {
    return null;
  }

  return <>{children}</>;
};
