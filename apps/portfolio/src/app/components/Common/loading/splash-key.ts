/** 這個分頁看過開場畫面的標記（sessionStorage）；layout 的 inline script 與 SplashScreen 共用。
 * 放在獨立檔案（不是 'use client'），伺服器端的 layout 才拿得到真正的字串 */
export const SPLASH_SEEN_KEY = 'portfolio:splash-seen';
