/**
 * 專案與履歷資料只會隨著重新部署改變，所以讓 Vercel CDN 快取 API 回應：
 * - s-maxage：CDN 一直用快取，不用每次都喚醒 serverless function（避免冷啟動等待）；重新部署時 Vercel 會自動清掉
 * - max-age=300：瀏覽器自己也快取 5 分鐘
 */
export const CACHE_HEADERS = {
  'Cache-Control': 'public, max-age=300, s-maxage=31536000, stale-while-revalidate=86400',
};
