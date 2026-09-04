'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useMemo } from 'react';
import { OrderSortBy, OrderSortDir, OrderSourceFilter, OrderStatusFilter } from '../api/orders-api.type';

export interface OrderQueryState {
  search: string;
  status: OrderStatusFilter;
  source: OrderSourceFilter;
  sortBy: OrderSortBy;
  sortDir: OrderSortDir;
  selectedId: string | null;
}

// The URL query string is the single source of truth for filters/sort/selection.
// This keeps the view shareable/bookmarkable and avoids duplicating the same
// state in both the URL and a client store.
export function useOrderQueryParams() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const state: OrderQueryState = useMemo(
    () => ({
      search: searchParams.get('q') ?? '',
      status: (searchParams.get('status') as OrderStatusFilter) ?? 'all',
      source: (searchParams.get('source') as OrderSourceFilter) ?? 'all',
      sortBy: (searchParams.get('sortBy') as OrderSortBy) ?? 'createdAt',
      sortDir: (searchParams.get('sortDir') as OrderSortDir) ?? 'desc',
      selectedId: searchParams.get('selected'),
    }),
    [searchParams],
  );

  const patch = useCallback(
    (updates: Record<string, string | null>) => {
      const nextParams = new URLSearchParams(searchParams.toString());

      for (const [key, value] of Object.entries(updates)) {
        if (value === null || value === '') {
          nextParams.delete(key);
        } else {
          nextParams.set(key, value);
        }
      }

      const query = nextParams.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  return {
    ...state,
    setSearch: (search: string) => patch({ q: search || null }),
    setStatus: (status: OrderStatusFilter) => patch({ status: status === 'all' ? null : status }),
    setSource: (source: OrderSourceFilter) => patch({ source: source === 'all' ? null : source }),
    setSort: (sortBy: OrderSortBy, sortDir: OrderSortDir) =>
      patch({
        sortBy: sortBy === 'createdAt' ? null : sortBy,
        sortDir: sortDir === 'desc' ? null : sortDir,
      }),
    setSelectedId: (id: string | null) => patch({ selected: id }),
  };
}
