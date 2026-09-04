import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Order, OrderStatus } from '../types/order';
import {
  OrderListApiResponse,
  OrderListParams,
  OrderStats,
  UpdateOrderStatusPayload,
} from './orders-api.type';

const ORDERS_API_PATH = '/api/orders';

function buildListQueryString(params: OrderListParams): string {
  const searchParams = new URLSearchParams();
  if (params.search) searchParams.set('search', params.search);
  if (params.status && params.status !== 'all') searchParams.set('status', params.status);
  if (params.source && params.source !== 'all') searchParams.set('source', params.source);
  if (params.sortBy) searchParams.set('sortBy', params.sortBy);
  if (params.sortDir) searchParams.set('sortDir', params.sortDir);
  return searchParams.toString();
}

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, init);
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.message ?? `Request failed with status ${response.status}`);
  }
  return response.json() as Promise<T>;
}

export function useOrders(params: OrderListParams) {
  const queryString = buildListQueryString(params);
  return useQuery({
    queryKey: ['orders', params],
    queryFn: () => fetchJson<OrderListApiResponse>(`${ORDERS_API_PATH}?${queryString}`),
    placeholderData: (previousData) => previousData,
  });
}

export function useOrderStats() {
  return useQuery({
    queryKey: ['orders', 'stats'],
    queryFn: () => fetchJson<OrderStats>(`${ORDERS_API_PATH}/stats`),
  });
}

export function useOrderDetail(id: string | null) {
  return useQuery({
    queryKey: ['orders', 'detail', id],
    queryFn: () => fetchJson<Order>(`${ORDERS_API_PATH}/${id}`),
    enabled: !!id,
  });
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: OrderStatus }) =>
      fetchJson<Order>(`${ORDERS_API_PATH}/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status } satisfies UpdateOrderStatusPayload),
      }),
    onSuccess: (updatedOrder) => {
      queryClient.setQueryData(['orders', 'detail', updatedOrder.id], updatedOrder);

      queryClient.setQueriesData<OrderListApiResponse>({ queryKey: ['orders'], exact: false }, (cached) => {
        if (!cached || !('data' in cached)) return cached;
        return {
          ...cached,
          data: cached.data.map((order) =>
            order.id === updatedOrder.id ? updatedOrder : order,
          ),
        };
      });

      queryClient.invalidateQueries({ queryKey: ['orders', 'stats'] });
    },
  });
}
