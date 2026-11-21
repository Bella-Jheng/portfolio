import type { MetadataRoute } from 'next';

// 讓手機可以「加入主畫面」，以全螢幕 App 的方式開啟
export default function manifest(): MetadataRoute.Manifest {
  return {
    id: '/',
    name: "I'm Yiting - Portfolio",
    short_name: '伊婷作品集',
    description: 'Front-End Software Engineer Portfolio',
    start_url: '/',
    display: 'standalone',
    background_color: '#F1F2CA',
    theme_color: '#F1F2CA',
    icons: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  };
}
