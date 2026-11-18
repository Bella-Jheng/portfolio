/**
 * 背景排盤（前端）：送出後拿到 jobId 就記在這台裝置，每隔幾秒問一次結果；
 * 頁面在背景時不問（iOS 會中斷連線），回到畫面再繼續。iOS 把頁面重新載入也能從記錄接回來。
 */

type FetchLike = (input: string, init: RequestInit) => Promise<Response>;
type Wait = (ms: number) => Promise<void>;

export class CalcJobError extends Error {}
/** 離開表單頁時停止等待（不是失敗，伺服器照樣會算完，回來再接） */
export class CalcJobAbortedError extends Error {}

const POLL_MS = 2500;
const GIVE_UP_MS = 10 * 60 * 1000;
const PENDING_KEY = 'bazi:pending-calc';
const PENDING_MAX_AGE_MS = 24 * 60 * 60 * 1000;

export interface PendingCalc {
  jobId: string;
  startedAt: number;
}

export function savePendingCalc(pending: PendingCalc) {
  try {
    localStorage.setItem(PENDING_KEY, JSON.stringify(pending));
  } catch {
    /* 存不了只是回來時接不上，不影響這次 */
  }
}

export function loadPendingCalc(now = Date.now()): PendingCalc | null {
  try {
    const raw = localStorage.getItem(PENDING_KEY);
    if (!raw) return null;
    const pending = JSON.parse(raw) as PendingCalc;
    if (!pending?.jobId || now - pending.startedAt > PENDING_MAX_AGE_MS) {
      clearPendingCalc();
      return null;
    }
    return pending;
  } catch {
    return null;
  }
}

export function clearPendingCalc() {
  try {
    localStorage.removeItem(PENDING_KEY);
  } catch {
    /* ignore */
  }
}

/** 等背景排盤完成，回傳命盤 id。查詢時斷線或伺服器暫時出錯只是下一輪再問 */
export async function waitForCalcJob(
  jobId: string,
  getToken: () => Promise<string | null>,
  {
    fetchImpl = (input, init) => fetch(input, init),
    wait = (ms) => new Promise((r) => setTimeout(r, ms)),
    isVisible = () => typeof document === 'undefined' || document.visibilityState === 'visible',
    now = () => Date.now(),
    signal,
  }: { fetchImpl?: FetchLike; wait?: Wait; isVisible?: () => boolean; now?: () => number; signal?: AbortSignal } = {},
): Promise<string> {
  const startedAt = now();
  for (;;) {
    if (signal?.aborted) throw new CalcJobAbortedError('已停止等待');
    if (isVisible()) {
      const token = await getToken();
      if (!token) throw new CalcJobError('請先登入');
      try {
        const res = await fetchImpl(`/api/calculate/jobs/${encodeURIComponent(jobId)}`, {
          headers: { Authorization: `Bearer ${token}` },
          cache: 'no-store',
          signal,
        });
        const data = (await res.json().catch(() => null)) as {
          status?: string;
          readingId?: string;
          error?: string;
        } | null;
        if (res.status === 401 || res.status === 404) throw new CalcJobError(data?.error ?? '找不到這次排盤，請重新送出');
        if (res.ok && data?.status === 'done' && data.readingId) return data.readingId;
        if (res.ok && data?.status === 'error') throw new CalcJobError(data.error ?? '命盤計算失敗，請稍後再試');
      } catch (error) {
        if (signal?.aborted) throw new CalcJobAbortedError('已停止等待');
        if (!(error instanceof TypeError)) throw error; // 斷線（Load failed）下一輪再問
      }
    }
    if (now() - startedAt > GIVE_UP_MS) throw new CalcJobError('命盤計算太久沒有完成，請再試一次');
    await wait(POLL_MS);
  }
}
