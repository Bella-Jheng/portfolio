'use client';

import { useState } from 'react';
import { Order, OrderStatus, ORDER_STATUSES } from '../../types/order';
import { formatCurrency, formatDateTime } from '../../lib/format';
import { OrderStatusBadge } from '../order-status-badge/order-status-badge';
import { LoadingSkeleton } from '../loading-skeleton/loading-skeleton';
import { ConfirmDialog } from '../confirm-dialog/confirm-dialog';

const STATUS_ACTION_LABEL: Record<OrderStatus, string> = {
  pending: '標記為待處理',
  paid: '標記為已付款',
  cancelled: '取消訂單',
};

interface OrderDetailPanelProps {
  order: Order | null;
  isLoading: boolean;
  isMutating: boolean;
  onChangeStatus: (status: OrderStatus) => void;
}

export function OrderDetailPanel({ order, isLoading, isMutating, onChangeStatus }: OrderDetailPanelProps) {
  const [pendingCancel, setPendingCancel] = useState(false);

  if (isLoading) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-4">
        <LoadingSkeleton rows={4} />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex h-full min-h-[200px] items-center justify-center rounded-xl border border-dashed border-gray-300 text-sm text-gray-500">
        請選擇一筆訂單查看明細
      </div>
    );
  }

  const handleStatusClick = (status: OrderStatus) => {
    if (status === order.status || isMutating) return;
    if (status === 'cancelled') {
      setPendingCancel(true);
      return;
    }
    onChangeStatus(status);
  };

  return (
    <div className="space-y-4 rounded-xl border border-gray-200 bg-white p-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-lg font-semibold text-gray-900">{order.id}</p>
          <p className="text-sm text-gray-500">{order.customerName}</p>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>

      <dl className="grid grid-cols-2 gap-y-2 text-sm">
        <dt className="text-gray-500">來源</dt>
        <dd className="text-right text-gray-900">{order.source}</dd>
        <dt className="text-gray-500">建立時間</dt>
        <dd className="text-right text-gray-900">{formatDateTime(order.createdAt)}</dd>
        <dt className="text-gray-500">訂單金額</dt>
        <dd className="text-right font-medium text-gray-900">{formatCurrency(order.amount)}</dd>
      </dl>

      <div>
        <p className="mb-2 text-xs text-gray-500">品項明細</p>
        <ul className="divide-y divide-gray-100 text-sm">
          {order.items.map((item, index) => (
            <li key={index} className="flex items-center justify-between py-2">
              <span className="text-gray-700">
                {item.name} × {item.qty}
              </span>
              <span className="text-gray-900">{formatCurrency(item.price * item.qty)}</span>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <p className="mb-2 text-xs text-gray-500">變更狀態</p>
        <div className="flex flex-wrap gap-2">
          {ORDER_STATUSES.map((status) => (
            <button
              key={status}
              type="button"
              disabled={status === order.status || isMutating}
              onClick={() => handleStatusClick(status)}
              className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 transition-colors hover:border-gray-400 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {STATUS_ACTION_LABEL[status]}
            </button>
          ))}
        </div>
      </div>

      <ConfirmDialog
        open={pendingCancel}
        title="取消訂單"
        message={`確定要取消訂單 ${order.id} 嗎？此操作將把訂單狀態改為已取消。`}
        confirmLabel="確認取消"
        cancelLabel="返回"
        onConfirm={() => {
          setPendingCancel(false);
          onChangeStatus('cancelled');
        }}
        onCancel={() => setPendingCancel(false)}
      />
    </div>
  );
}
