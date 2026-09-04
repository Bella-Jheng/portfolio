export type OrderStatus = 'pending' | 'paid' | 'cancelled';

export type OrderSource = 'web' | 'app' | 'pos';

export interface OrderItem {
  name: string;
  qty: number;
  price: number;
}

export interface Order {
  id: string;
  customerName: string;
  source: OrderSource;
  status: OrderStatus;
  amount: number;
  createdAt: string;
  items: OrderItem[];
}

export const ORDER_STATUSES: OrderStatus[] = ['pending', 'paid', 'cancelled'];

export const ORDER_SOURCES: OrderSource[] = ['web', 'app', 'pos'];
