import { useCallback, useEffect, useRef, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { type CalculateRequest, type Reading } from '../../../types/bazi';
import { useFetcher } from '../../../lib/use-fetcher';
import { useAuth } from '../../../lib/auth-context';
import { getClientLocale } from '../../../lib/i18n/client-locale';
import {
  CalcJobAbortedError,
  clearPendingCalc,
  loadPendingCalc,
  savePendingCalc,
  waitForCalcJob,
} from '../../../lib/calc-job-client';

/**
 * 排盤：送出後伺服器在背景算（可以切到別的 App，算好會推播通知）。
 * - 沿用既有命盤時伺服器直接回 { id }
 * - 要重算時回 { jobId }，記在這台裝置，等算好拿到命盤 id
 * 命盤算完先把結果預抓進 react-query 快取，導頁到 /result/[id] 時資料已經在了，
 * 不會再出現第二個從零重置的 Loading 畫面（跟表單頁那個 Loading 銜接不起來、會閃一下）
 */
function useOpenReading() {
  const router = useRouter();
  const apiFetch = useFetcher();
  const queryClient = useQueryClient();
  return useCallback(
    async (id: string) => {
      await queryClient.prefetchQuery({
        queryKey: ['reading', id],
        queryFn: () => apiFetch<Reading>(`/api/result/${id}`),
      });
      router.push(`/result/${id}`);
    },
    [apiFetch, queryClient, router],
  );
}

/** 離開表單頁時停止等待（伺服器照樣會算完，回來或點通知都拿得到） */
function useWaitAbort() {
  const ref = useRef<AbortController | null>(null);
  useEffect(() => () => ref.current?.abort(), []);
  return () => {
    ref.current?.abort();
    ref.current = new AbortController();
    return ref.current.signal;
  };
}

export function useCalculate() {
  const apiFetch = useFetcher();
  const { getToken } = useAuth();
  const openReading = useOpenReading();
  const nextSignal = useWaitAbort();

  return useMutation({
    mutationFn: async (data: CalculateRequest) => {
      const res = await apiFetch<{ id?: string; jobId?: string }>('/api/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // 帶上介面語言：英文介面排盤時，伺服器產生中文主版本後會接著翻成英文
        body: JSON.stringify({ ...data, locale: getClientLocale(), background: true }),
      });
      if (res.id) return { id: res.id };
      if (!res.jobId) throw new Error('命盤計算失敗，請稍後再試');
      savePendingCalc({ jobId: res.jobId, startedAt: Date.now() });
      const id = await waitForCalcJob(res.jobId, getToken, { signal: nextSignal() });
      return { id };
    },
    onSuccess: async (data) => {
      clearPendingCalc();
      await openReading(data.id);
    },
    onError: (error) => {
      if (!(error instanceof CalcJobAbortedError)) clearPendingCalc();
    },
  });
}

/** 排盤途中切走、或 iOS 把頁面重新載入後回到表單頁：接著等上次的結果 */
export function useResumeCalculation() {
  const { user, loading, getToken } = useAuth();
  const openReading = useOpenReading();
  const nextSignal = useWaitAbort();
  const started = useRef(false);
  const [resuming, setResuming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (started.current || loading || !user) return;
    const pending = loadPendingCalc();
    if (!pending) return;
    started.current = true;
    setResuming(true);
    waitForCalcJob(pending.jobId, getToken, { signal: nextSignal() })
      .then(async (id) => {
        clearPendingCalc();
        await openReading(id);
      })
      .catch((e) => {
        if (e instanceof CalcJobAbortedError) return;
        clearPendingCalc();
        setError(e instanceof Error ? e.message : '命盤計算失敗，請稍後再試');
        setResuming(false);
      });
    // 只在登入狀態確定後跑一次
  }, [loading, user, getToken, openReading, nextSignal]);

  return { resuming, error };
}
