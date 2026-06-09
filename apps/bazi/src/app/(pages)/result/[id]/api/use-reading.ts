import { useQuery } from '@tanstack/react-query';
import type { Reading } from '../../../../types/bazi';
import { useFetcher } from '../../../../lib/use-fetcher';

export function useReading(id: string) {
  const apiFetch = useFetcher();
  return useQuery({
    queryKey: ['reading', id],
    queryFn: () => apiFetch<Reading>(`/api/result/${id}`),
    enabled: !!id,
  });
}
