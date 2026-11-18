import type { MetadataRoute } from 'next';

// 加入主畫面用：iPhone 要先加入主畫面、從主畫面打開，才能開啟推播通知（iOS 16.4 以上）
export default function manifest(): MetadataRoute.Manifest {
  return {
    id: '/',
    name: '命格貓 · 八字算命',
    short_name: '命格貓',
    start_url: '/',
    display: 'standalone',
    background_color: '#FFFDF5',
    theme_color: '#FFFDF5',
    icons: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
    ],
  };
}
