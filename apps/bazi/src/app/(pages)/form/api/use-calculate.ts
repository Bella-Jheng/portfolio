import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { type CalculateRequest } from '../../../types/bazi';
import { useFetcher } from '../../../lib/use-fetcher';

export function useCalculate() {
  const router = useRouter();
  const apiFetch = useFetcher();
  return useMutation({
    mutationFn: (data: CalculateRequest) =>
      apiFetch<{ id: string }>('/api/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    onSuccess: (data) => router.push(`/result/${data.id}`),
  });
}
