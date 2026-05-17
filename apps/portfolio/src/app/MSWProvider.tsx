'use client';

import { useEffect, useRef, useState } from 'react';

export const MSWProvider = ({ children }: { children: React.ReactNode }) => {
  const [mswReady, setMswReady] = useState(false);
  const startedRef = useRef(false);

  useEffect(() => {
    if (startedRef.current) return;
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
