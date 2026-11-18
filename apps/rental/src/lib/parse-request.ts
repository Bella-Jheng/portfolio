import type { ParseResult, Source } from './types';

/**
 * 截圖解析改成「背景工作」：
 * 1. startParseJob：把截圖傳上去，伺服器馬上回 jobId（只有這一步需要停在畫面上，通常幾秒）
 * 2. waitForParseJob：每隔幾秒問一次結果；頁面在背景時先不問，回到畫面再繼續
 * 3. 進行中的工作記在這台裝置（savePending），就算 iOS 把頁面重新載入，回來也能接著拿結果
 *
 * iOS Safari 連線被中斷時只會丟「Load failed」（Chrome 是「Failed to fetch」），這裡都換成看得懂的中文。
 */

type FetchLike = (input: string, init: RequestInit) => Promise<Response>;
type Wait = (ms: number) => Promise<void>;

export class ParseRequestError extends Error {}

/** 離開新增頁時停止等待（不是失敗，伺服器那邊照樣會跑完，回來再接） */
export class ParseAbortedError extends Error {}

const RETRY_DELAY_MS = 1500;
const POLL_MS = 2000;
// 從開始等算起；伺服器那邊等待超過 3 分鐘就會回報失敗，這只是保險
const GIVE_UP_MS = 5 * 60 * 1000;

const defaultFetch: FetchLike = (input, init) => fetch(input, init);
const defaultWait: Wait = (ms) => new Promise((r) => setTimeout(r, ms));

/** fetch 在連線層級失敗時丟的是 TypeError（Load failed／Failed to fetch／NetworkError…） */
function isNetworkError(error: unknown): boolean {
  return error instanceof TypeError;
}

function messageForStatus(status: number): string {
  if (status === 413) return '截圖太大，請少選幾張再試一次';
  if (status === 504 || status === 524) return '伺服器回應太久，請再試一次';
  if (status === 401 || status === 403) return '登入已過期，請重新登入後再試';
  if (status === 429) return '解析次數太多，請稍等一下再試';
  return `解析失敗（錯誤碼 ${status}），請再試一次`;
}

async function readJson<T>(res: Response): Promise<(T & { error?: string }) | null> {
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

/** 上傳截圖、開始背景解析，回傳 jobId。上傳時斷線會自動重試一次 */
export async function startParseJob(
  body: string,
  token: string,
  {
    fetchImpl = defaultFetch,
    wait = defaultWait,
    wasHidden = () => false,
  }: { fetchImpl?: FetchLike; wait?: Wait; wasHidden?: () => boolean } = {},
): Promise<string> {
  const send = () =>
    fetchImpl('/api/parse-jobs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body,
    });

  let res: Response;
  try {
    res = await send();
  } catch (error) {
    if (!isNetworkError(error)) throw error;
    await wait(RETRY_DELAY_MS);
    try {
      res = await send();
    } catch (retryError) {
      if (!isNetworkError(retryError)) throw retryError;
      throw new ParseRequestError(
        wasHidden()
          ? '截圖還沒上傳完就離開了這個畫面。請停在畫面上等「上傳中」結束，之後就可以切走了'
          : '網路連線中斷，請確認網路後再按一次「開始解析」',
      );
    }
  }

  const data = await readJson<{ jobId?: string }>(res);
  if (!res.ok) throw new ParseRequestError(data?.error ?? messageForStatus(res.status));
  if (!data?.jobId) throw new ParseRequestError('沒有拿到解析編號，請再試一次');
  return data.jobId;
}

/**
 * 等背景解析完成。頁面在背景時不發請求（iOS 會中斷），回到畫面再繼續；
 * 查詢時斷線或伺服器暫時出錯都只是下一輪再問，不算失敗。
 */
export async function waitForParseJob(
  jobId: string,
  getToken: () => Promise<string | null>,
  {
    fetchImpl = defaultFetch,
    wait = defaultWait,
    isVisible = () => typeof document === 'undefined' || document.visibilityState === 'visible',
    now = () => Date.now(),
    startedAt = now(),
    signal,
  }: {
    fetchImpl?: FetchLike;
    wait?: Wait;
    isVisible?: () => boolean;
    now?: () => number;
    startedAt?: number;
    signal?: AbortSignal;
  } = {},
): Promise<ParseResult> {
  for (;;) {
    if (signal?.aborted) throw new ParseAbortedError('已停止等待');
    if (isVisible()) {
      const token = await getToken();
      if (!token) throw new ParseRequestError('請先用 Google 登入');
      try {
        const res = await fetchImpl(`/api/parse-jobs/${encodeURIComponent(jobId)}`, {
          headers: { Authorization: `Bearer ${token}` },
          cache: 'no-store',
          signal,
        });
        const data = await readJson<{ status?: string; result?: ParseResult }>(res);
        if (res.status === 404 || res.status === 401 || res.status === 403) {
          throw new ParseRequestError(data?.error ?? messageForStatus(res.status));
        }
        if (res.ok && data?.status === 'done' && data.result) return data.result;
        if (res.ok && data?.status === 'error') throw new ParseRequestError(data.error ?? 'AI 解析失敗，請再試一次');
        // pending、5xx、讀不懂的回應：下一輪再問
      } catch (error) {
        if (signal?.aborted) throw new ParseAbortedError('已停止等待');
        if (!isNetworkError(error)) throw error;
      }
    }
    // 先問過一次才判斷逾時：隔很久才回來時，結果多半早就好了
    if (now() - startedAt > GIVE_UP_MS) throw new ParseRequestError('AI 解析太久沒有完成，請再試一次');
    await wait(POLL_MS);
  }
}

// ---------- 進行中的解析記在這台裝置 ----------

const PENDING_KEY = 'rental-helper:pending-parse';
// 跟伺服器保留解析結果的時間一樣（一天），晚點才回來也接得上
const PENDING_MAX_AGE_MS = 24 * 60 * 60 * 1000;

export interface PendingParse {
  startedAt: number;
  source: Source;
  sourceUrl: string;
  jobs: { jobId: string; thumbnail: string }[];
}

export function savePending(pending: PendingParse) {
  try {
    localStorage.setItem(PENDING_KEY, JSON.stringify(pending));
  } catch {
    /* 存不了就只是回來時沒辦法接續，不影響這次解析 */
  }
}

export function loadPending(now = Date.now()): PendingParse | null {
  try {
    const raw = localStorage.getItem(PENDING_KEY);
    if (!raw) return null;
    const pending = JSON.parse(raw) as PendingParse;
    if (!pending?.jobs?.length || now - pending.startedAt > PENDING_MAX_AGE_MS) {
      clearPending();
      return null;
    }
    return pending;
  } catch {
    return null;
  }
}

export function clearPending() {
  try {
    localStorage.removeItem(PENDING_KEY);
  } catch {
    /* ignore */
  }
}

/** 記錄這段期間頁面有沒有被切到背景（iOS 切 App 會中斷進行中的連線） */
export function trackHidden(): { wasHidden: () => boolean; stop: () => void } {
  let hidden = typeof document !== 'undefined' && document.visibilityState === 'hidden';
  const onChange = () => {
    if (document.visibilityState === 'hidden') hidden = true;
  };
  if (typeof document !== 'undefined') document.addEventListener('visibilitychange', onChange);
  return {
    wasHidden: () => hidden,
    stop: () => {
      if (typeof document !== 'undefined') document.removeEventListener('visibilitychange', onChange);
    },
  };
}
