import type { ParseResult } from './types';

/**
 * 呼叫 /api/parse。iOS Safari 在連線中斷時只會丟出「Load failed」（Chrome 是「Failed to fetch」），
 * 使用者看不懂，所以這裡：
 * - 連線層級的失敗自動重試一次（解析本身沒有副作用，重送是安全的）
 * - 伺服器回的不是 JSON（Vercel 的 413、504 是純文字／HTML）時，依狀態碼換成看得懂的訊息
 * - 解析途中如果 App 被切到背景，提醒使用者停在畫面上再試
 */

const RETRY_DELAY_MS = 1500;

type FetchLike = (input: string, init: RequestInit) => Promise<Response>;

export class ParseRequestError extends Error {}

/** fetch 在連線層級失敗時丟的是 TypeError（Load failed／Failed to fetch／NetworkError…） */
function isNetworkError(error: unknown): boolean {
  return error instanceof TypeError;
}

function messageForStatus(status: number): string {
  if (status === 413) return '截圖太大，請少選幾張再試一次';
  if (status === 504 || status === 524) return 'AI 解析太久逾時了，請再試一次（截圖少一點會比較快）';
  if (status === 401 || status === 403) return '登入已過期，請重新登入後再試';
  if (status === 429) return '解析次數太多，請稍等一下再試';
  return `解析失敗（錯誤碼 ${status}），請再試一次`;
}

export async function postParse(
  body: string,
  token: string,
  {
    fetchImpl = (input, init) => fetch(input, init),
    wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms)),
    wasHidden = () => false,
  }: { fetchImpl?: FetchLike; wait?: (ms: number) => Promise<void>; wasHidden?: () => boolean } = {},
): Promise<ParseResult> {
  const send = () =>
    fetchImpl('/api/parse', {
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
          ? '解析時離開了這個畫面，連線被手機中斷了。請停在這個畫面，再按一次「開始解析」'
          : '網路連線中斷，請確認網路後再按一次「開始解析」',
      );
    }
  }

  const text = await res.text();
  let data: (ParseResult & { error?: string }) | null = null;
  try {
    data = JSON.parse(text);
  } catch {
    data = null;
  }
  if (!res.ok) throw new ParseRequestError(data?.error ?? messageForStatus(res.status));
  if (!data) throw new ParseRequestError('解析結果讀不出來，請再試一次');
  return data;
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
