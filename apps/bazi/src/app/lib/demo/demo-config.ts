/**
 * 訪客 Demo 模式（作品集展示用），前後端共用的設定。
 *
 * - 只有網址帶 ?demo=1 時首頁才出現「訪客體驗」按鈕；按下去用 Firebase 匿名登入
 * - 每個訪客有一份範例命盤，id 是 demo-<uid>，存在 Firestore 的 baziDemoReadings，跟正式的 readings 完全分開
 * - 每天（台灣時間）第一次進來換回新的範例命盤；另有每天的排程（/api/cron/demo-reset）整批清空
 * - 呼叫 AI 的功能（追問、生成完整分析、翻譯）每個訪客每天有次數上限，所有訪客加起來也有每日總上限
 * - 體驗模式不能排新的命盤、不能申請更改日期
 */

export const DEMO_READING_PREFIX = 'demo-';
export const DEMO_READINGS_COLLECTION = 'baziDemoReadings';
export const DEMO_META_COLLECTION = 'baziDemoMeta';

export const DEMO_LIMITS = {
  /** 每個訪客每天可以追問幾題 */
  questions: 2,
  /** 每個訪客每天可以生成幾次完整分析 */
  details: 2,
} as const;

/** 所有訪客加起來每天最多幾次 AI 呼叫（可用環境變數 DEMO_GLOBAL_DAILY_AI 調整） */
export function demoGlobalDailyAi(): number {
  const n = Number(process.env.DEMO_GLOBAL_DAILY_AI);
  return Number.isFinite(n) && n >= 0 ? Math.floor(n) : 100;
}

export function isDemoReadingId(id: string): boolean {
  return id.startsWith(DEMO_READING_PREFIX);
}

/** 每天可以問幾題：一般 3 題，訪客 Demo 比較少（前後端共用，畫面上的「剩幾題」照這裡顯示） */
export function dailyQuestionLimit(id: string): number {
  return isDemoReadingId(id) ? DEMO_LIMITS.questions : 3;
}

export function demoReadingId(uid: string): string {
  return `${DEMO_READING_PREFIX}${uid}`;
}

/** 台灣時間的日期 YYYY-MM-DD */
export function demoDay(now = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Taipei', year: 'numeric', month: '2-digit', day: '2-digit' }).format(now);
}

const DEMO_FLAG_KEY = 'bazi:demo';

/** 這次打開是不是從 Demo 網址進來（?demo=1）；記在 sessionStorage，換頁後同一個分頁還看得到按鈕 */
export function isDemoEntry(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const param = new URLSearchParams(window.location.search).get('demo');
    if (param === '1') sessionStorage.setItem(DEMO_FLAG_KEY, '1');
    if (param === '0') sessionStorage.removeItem(DEMO_FLAG_KEY);
    return sessionStorage.getItem(DEMO_FLAG_KEY) === '1';
  } catch {
    return new URLSearchParams(window.location.search).get('demo') === '1';
  }
}
