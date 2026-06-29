import { useAuth } from './auth-context';

export function useFetcher() {
  const { getToken } = useAuth();
  return async function apiFetch<T>(url: string, init: RequestInit = {}): Promise<T> {
    const token = await getToken();
    const res = await fetch(url, {
      ...init,
      headers: {
        ...init.headers,
        'X-Timezone': Intl.DateTimeFormat().resolvedOptions().timeZone,
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      if (body.aiStatusText) console.error('後端api失敗訊息', body.aiStatusText);
      const err = new Error(body.error ?? '請求失敗') as Error & { status: number };
      err.status = res.status;
      throw err;
    }
    return (await res.json()) as T;
  };
}
