//@ts-check

const { composePlugins, withNx } = require('@nx/next');

/**
 * @type {import('@nx/next/plugins/with-nx').WithNxOptions}
 **/
const nextConfig = {
  nx: {},
  // 之前這兩個是 true：正式站會把完整、未壓縮的原始碼(含中文註解)透過 source map 送給任何打開 devtools 的訪客
  productionBrowserSourceMaps: false,
  experimental: {
    serverSourceMaps: false,
  },
  outputFileTracingRoot: require('path').join(__dirname, '../../'),
  serverExternalPackages: ['firebase-admin'],
  images: {
    remotePatterns: [{ protocol: 'https', hostname: 'lh3.googleusercontent.com' }],
  },
  async headers() {
    return [
      {
        source: '/cats/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      {
        // 命盤結果頁現在要登入本人/admin 才能看，但還是加上 noindex 保險，避免被搜尋引擎收錄到快取片段
        source: '/result/:path*',
        headers: [
          { key: 'X-Robots-Tag', value: 'noindex, nofollow' },
        ],
      },
      {
        // 全站安全標頭。CSP 已放行 Google 登入(accounts.google.com)、Firebase(*.googleapis.com、*.firebaseapp.com)
        // 需要的網域，但部署前務必實際測一次登入，如果登入壞掉，八成是漏放了某個 Google/Firebase 網域。
        //
        // script-src 的 'unsafe-inline' 是必要的：Next.js App Router 本身會在頁面裡注入 inline <script>
        // 做 hydration/RSC streaming，嚴格的 nonce-based CSP 雖然能擋掉 inline script，但官方文件明講這需要把
        // 全站改成動態渲染（不能用 static generation、不能被 CDN 快取），代價太大。這裡唯一真正的 XSS 風險點
        // （AI 生成內容用 dangerouslySetInnerHTML 渲染）已經用 isomorphic-dompurify 在內容層清洗過，
        // CSP 這裡只是第二層保險，不靠它單獨擋 script。
        source: '/:path*',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline'",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: https://lh3.googleusercontent.com",
              "font-src 'self' data:",
              "connect-src 'self' https://*.googleapis.com https://*.google.com",
              "frame-src https://accounts.google.com https://*.firebaseapp.com",
              "frame-ancestors 'none'",
              "object-src 'none'",
              "base-uri 'self'",
            ].join('; '),
          },
        ],
      },
    ];
  },
  turbopack: {
    rules: {
      '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js',
      },
    },
  },
};

const plugins = [withNx];

module.exports = composePlugins(...plugins)(nextConfig);
