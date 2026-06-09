import { useMutation, useQueryClient, type UseMutationResult } from '@tanstack/react-query';
import { useFetcher } from '../../../lib/use-fetcher';
import { patchReadings } from '../../../common/api/readings-cache';

export function useDeleteReading(): UseMutationResult<void, Error, string> {
  const apiFetch = useFetcher();
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: (id: string): Promise<void> =>
      apiFetch(`/api/dashboard/readings/${id}`, { method: 'DELETE' }),
    onSuccess: (_: void, id: string) =>
      patchReadings(queryClient, (prev) => prev.filter((reading) => reading.id !== id)),
  });
}
