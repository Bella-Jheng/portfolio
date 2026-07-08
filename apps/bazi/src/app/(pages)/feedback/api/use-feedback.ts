import { useQuery } from '@tanstack/react-query';
import { useFetcher } from '../../../lib/use-fetcher';

export interface FeedbackEntry {
  id: string;
  message: string;
  uid: string;
  userName: string | null;
  userEmail: string | null;
  createdAt: string;
}

export function useFeedback(enabled: boolean) {
  const apiFetch = useFetcher();
  return useQuery({
    queryKey: ['feedback'],
    queryFn: () => apiFetch<FeedbackEntry[]>('/api/feedback'),
    enabled,
  });
}
