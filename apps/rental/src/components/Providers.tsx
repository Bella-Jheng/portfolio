'use client';

import { APIProvider } from '@vis.gl/react-google-maps';
import { AuthProvider } from '../lib/auth';

export const MAPS_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? '';
export const MAP_ID = process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID || 'DEMO_MAP_ID';

export function Providers({ children }: { children: React.ReactNode }) {
  // 沒設定 Maps key 也要能用（清單、解析、私訊），只是沒有地圖
  if (!MAPS_KEY) return <AuthProvider>{children}</AuthProvider>;
  return (
    <AuthProvider>
      <APIProvider apiKey={MAPS_KEY} language="zh-TW" region="TW">
        {children}
      </APIProvider>
    </AuthProvider>
  );
}
