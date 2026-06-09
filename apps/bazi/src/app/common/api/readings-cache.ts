import { useQueryClient } from '@tanstack/react-query';
import type { Reading } from '../../types/bazi';

export const READINGS_KEY = ['readings'] as const;

export function patchReadings(
  queryClient: ReturnType<typeof useQueryClient>,
  updater: (prev: Reading[]) => Reading[],
) {
  queryClient.setQueryData(
    READINGS_KEY,
    (prev: { readings: Reading[] } | undefined) => ({ readings: updater(prev?.readings ?? []) }),
  );
}
