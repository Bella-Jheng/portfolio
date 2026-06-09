import { useMutation, useQueryClient, type UseMutationResult } from '@tanstack/react-query';
import type { Reading } from '../../../types/bazi';
import { useFetcher } from '../../../lib/use-fetcher';
import { patchReadings } from '../../../common/api/readings-cache';

export function useApproveCorrection(): UseMutationResult<Partial<Reading>, Error, string> {
  const apiFetch = useFetcher();
  const queryClient = useQueryClient();
  return useMutation<Partial<Reading>, Error, string>({
    mutationFn: (id: string): Promise<Partial<Reading>> =>
      apiFetch<Partial<Reading>>(`/api/result/${id}/approve-correction`, { method: 'POST' }),
    onSuccess: (updated: Partial<Reading>, id: string) =>
      patchReadings(queryClient, (prev) =>
        prev.map((reading) => (reading.id === id ? { ...reading, ...updated, correctionRequested: false } : reading)),
      ),
  });
}
