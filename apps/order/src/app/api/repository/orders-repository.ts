import { Order, OrderStatus } from '../../types/order';
import { OrderListParams, OrderStats } from '../orders-api.type';
import ordersSeed from '../data/orders.json';

// In-memory copy so status updates don't mutate the imported JSON module,
// and persist for the lifetime of the server process (this is a mock backend,
// not a real database).
const orders: Order[] = JSON.parse(JSON.stringify(ordersSeed));

export function getAllOrders(): Order[] {
  return orders;
}

export function getOrderById(id: string): Order | undefined {
  return orders.find((order) => order.id === id);
}

export function updateOrderStatus(id: string, status: OrderStatus): Order | undefined {
  const order = getOrderById(id);
  if (!order) return undefined;
  order.status = status;
  return order;
}

export function filterAndSortOrders(source: Order[], params: OrderListParams): Order[] {
  const { search, status = 'all', source: sourceFilter = 'all', sortBy = 'createdAt', sortDir = 'desc' } = params;

  let result = source;

  const keyword = search?.trim().toLowerCase();
  if (keyword) {
    result = result.filter(
      (order) =>
        order.id.toLowerCase().includes(keyword) ||
        order.customerName.toLowerCase().includes(keyword),
    );
  }

  if (status !== 'all') {
    result = result.filter((order) => order.status === status);
  }

  if (sourceFilter !== 'all') {
    result = result.filter((order) => order.source === sourceFilter);
  }

  const dir = sortDir === 'asc' ? 1 : -1;
  result = [...result].sort((a, b) => {
    if (sortBy === 'amount') return (a.amount - b.amount) * dir;
    return (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()) * dir;
  });

  return result;
}

// Stats always summarize the full order book, not the currently filtered view,
// so the numbers stay stable while someone is searching/filtering the list.
export function computeOrderStats(source: Order[]): OrderStats {
  return source.reduce<OrderStats>(
    (stats, order) => {
      stats.totalCount += 1;
      if (order.status === 'paid') stats.paidAmountSum += order.amount;
      if (order.status === 'pending') stats.pendingCount += 1;
      if (order.status === 'cancelled') stats.cancelledCount += 1;
      return stats;
    },
    { totalCount: 0, paidAmountSum: 0, pendingCount: 0, cancelledCount: 0 },
  );
}
