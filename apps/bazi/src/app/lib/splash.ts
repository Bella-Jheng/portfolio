/** 開場動畫：同一個分頁只播一次（換頁不再播），重新打開 App 才會再播 */
export const SPLASH_SEEN_KEY = 'bazi:splash-seen';

/**
 * 放在 <head> 的 inline script：看過的分頁在畫面出現前就把開場動畫藏起來，不會閃一下。
 * 伺服器一律先畫出開場動畫，所以第一次打開時一進來就看得到。
 */
export const SPLASH_INLINE_SCRIPT = `try{if(sessionStorage.getItem('${SPLASH_SEEN_KEY}')==='1')document.documentElement.dataset.splash='seen'}catch(e){}`;
