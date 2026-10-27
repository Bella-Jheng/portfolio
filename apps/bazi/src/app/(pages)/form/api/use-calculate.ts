import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { type CalculateRequest, type Reading } from '../../../types/bazi';
import { useFetcher } from '../../../lib/use-fetcher';

export function useCalculate() {
  const router = useRouter();
  const apiFetch = useFetcher();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CalculateRequest) =>
      apiFetch<{ id: string }>('/api/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    // 命盤算完先把結果預抓進 react-query 快取，導頁到 /result/[id] 時資料已經在了，
    // 不會再出現第二個從零重置的 Loading 畫面（跟表單頁那個 Loading 銜接不起來、會閃一下）
    onSuccess: async (data) => {
      await queryClient.prefetchQuery({
        queryKey: ['reading', data.id],
        queryFn: () => apiFetch<Reading>(`/api/result/${data.id}`),
      });
      router.push(`/result/${data.id}`);
    },
  });
}
