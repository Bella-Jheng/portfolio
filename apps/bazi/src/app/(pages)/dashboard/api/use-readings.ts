import { useQuery } from '@tanstack/react-query';
import type { Reading } from '../../../types/bazi';
import { useFetcher } from '../../../lib/use-fetcher';
import { READINGS_KEY } from '../../../common/api/readings-cache';

export function useReadings(enabled: boolean) {
  const apiFetch = useFetcher();
  return useQuery({
    queryKey: READINGS_KEY,
    queryFn: () => apiFetch<{ readings: Reading[] }>('/api/dashboard/readings'),
    enabled,
  });
}
