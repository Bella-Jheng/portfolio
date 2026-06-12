import { useMutation, useQueryClient, type UseMutationResult } from '@tanstack/react-query';
import type { Reading } from '../../../types/bazi';
import { useFetcher } from '../../../lib/use-fetcher';
import { patchReadings } from '../../../common/api/readings-cache';

export type EditForm = {
  name?: string | null;
  birthYear: number;
  birthMonth: number;
  birthDay: number;
  birthHour: number | null;
};

type SaveVars = { id: string; form: EditForm };

export function useSaveReading(): UseMutationResult<Reading, Error, SaveVars> {
  const apiFetch = useFetcher();
  const queryClient = useQueryClient();
  return useMutation<Reading, Error, SaveVars>({
    mutationFn: ({ id, form }: SaveVars): Promise<Reading> =>
      apiFetch<Reading>(`/api/dashboard/readings/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      }),
    onSuccess: (updated: Reading) =>
      patchReadings(queryClient, (prev) => prev.map((reading) => (reading.id === updated.id ? updated : reading))),
  });
}
