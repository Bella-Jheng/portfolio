import { useMutation } from '@tanstack/react-query';
import { useFetcher } from '../../../../lib/use-fetcher';

export function useRequestCorrection(readingId: string) {
  const apiFetch = useFetcher();
  return useMutation({
    mutationFn: (form: { year: number; month: number; day: number; hour: number | null }) =>
      apiFetch(`/api/result/${readingId}/request-correction`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      }),
  });
}
