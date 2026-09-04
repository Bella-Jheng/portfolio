import { Order, OrderSource, OrderStatus } from '../types/order';

export type OrderStatusFilter = OrderStatus | 'all';
export type OrderSourceFilter = OrderSource | 'all';
export type OrderSortBy = 'createdAt' | 'amount';
export type OrderSortDir = 'asc' | 'desc';

export interface OrderListParams {
  search?: string;
  status?: OrderStatusFilter;
  source?: OrderSourceFilter;
  sortBy?: OrderSortBy;
  sortDir?: OrderSortDir;
}

export interface OrderListApiResponse {
  data: Order[];
  total: number;
}

export interface OrderStats {
  totalCount: number;
  paidAmountSum: number;
  pendingCount: number;
  cancelledCount: number;
}

export interface UpdateOrderStatusPayload {
  status: OrderStatus;
}
