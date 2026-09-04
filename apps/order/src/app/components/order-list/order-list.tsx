'use client';

import { Order } from '../../types/order';
import { formatCurrency, formatDateTime } from '../../lib/format';
import { OrderStatusBadge } from '../order-status-badge/order-status-badge';
import { LoadingSkeleton } from '../loading-skeleton/loading-skeleton';
import styles from './order-list.module.css';

const SOURCE_LABEL: Record<Order['source'], string> = {
  web: 'Web',
  app: 'App',
  pos: 'POS',
};

interface OrderListProps {
  orders: Order[];
  isLoading: boolean;
  isError: boolean;
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export function OrderList({ orders, isLoading, isError, selectedId, onSelect }: OrderListProps) {
  if (isLoading) {
    return <LoadingSkeleton rows={5} />;
  }

  if (isError) {
    return <p className="text-sm text-status-cancelled">訂單列表載入失敗，請稍後再試。</p>;
  }

  if (orders.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-gray-300 py-12 text-center text-sm text-gray-500">
        找不到符合條件的訂單
      </div>
    );
  }

  return (
    <>
      {/* Table layout for md+ screens */}
      <table className="hidden w-full text-left text-sm md:table">
        <thead>
          <tr className="border-b border-gray-200 text-xs text-gray-500">
            <th className="px-4 py-2 font-medium">訂單編號</th>
            <th className="px-4 py-2 font-medium">客戶名稱</th>
            <th className="px-4 py-2 font-medium">來源</th>
            <th className="px-4 py-2 font-medium">狀態</th>
            <th className="px-4 py-2 font-medium">金額</th>
            <th className="px-4 py-2 font-medium">建立時間</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr
              key={order.id}
              onClick={() => onSelect(order.id)}
              className={`${styles.row} ${order.id === selectedId ? styles.rowSelected : ''}`}
            >
              <td className="font-medium text-gray-900">{order.id}</td>
              <td>{order.customerName}</td>
              <td>{SOURCE_LABEL[order.source]}</td>
              <td>
                <OrderStatusBadge status={order.status} />
              </td>
              <td>{formatCurrency(order.amount)}</td>
              <td className="text-gray-500">{formatDateTime(order.createdAt)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Card layout for small screens */}
      <div className="space-y-2 md:hidden">
        {orders.map((order) => (
          <div
            key={order.id}
            onClick={() => onSelect(order.id)}
            className={`${styles.card} ${order.id === selectedId ? styles.cardSelected : ''}`}
          >
            <div className="flex items-center justify-between">
              <span className="font-medium text-gray-900">{order.id}</span>
              <OrderStatusBadge status={order.status} />
            </div>
            <div className="mt-1 flex items-center justify-between text-sm text-gray-600">
              <span>{order.customerName}</span>
              <span>{formatCurrency(order.amount)}</span>
            </div>
            <div className="mt-1 flex items-center justify-between text-xs text-gray-400">
              <span>{SOURCE_LABEL[order.source]}</span>
              <span>{formatDateTime(order.createdAt)}</span>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
