import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useFetcher } from '../../../lib/use-fetcher';

export type FeedbackStatus = 'unprocessed' | 'in_progress' | 'resolved';

export interface FeedbackComment {
  id: string;
  message: string;
  createdAt: string;
  editedAt?: string;
}

export interface FeedbackEntry {
  id: string;
  message: string;
  displayName: string;
  createdAt: string;
  status: FeedbackStatus;
  comments: FeedbackComment[];
}

export function useFeedback() {
  const apiFetch = useFetcher();
  return useQuery({
    queryKey: ['feedback'],
    queryFn: () => apiFetch<FeedbackEntry[]>('/api/feedback'),
  });
}

export function useUpdateFeedbackStatus() {
  const apiFetch = useFetcher();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: FeedbackStatus }) =>
      apiFetch('/api/feedback', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['feedback'] }),
  });
}

export function useAddFeedbackComment() {
  const apiFetch = useFetcher();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, message }: { id: string; message: string }) =>
      apiFetch('/api/feedback', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, comment: message }),
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['feedback'] }),
  });
}

export function useEditFeedbackComment() {
  const apiFetch = useFetcher();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, commentId, message }: { id: string; commentId: string; message: string }) =>
      apiFetch('/api/feedback', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, commentId, comment: message }),
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['feedback'] }),
  });
}

export function useDeleteFeedbackComment() {
  const apiFetch = useFetcher();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, commentId }: { id: string; commentId: string }) =>
      apiFetch('/api/feedback', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, commentId, deleteComment: true }),
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['feedback'] }),
  });
}
