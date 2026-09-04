import { OrderStatus } from '../../types/order';

const STATUS_LABEL: Record<OrderStatus, string> = {
  pending: '待處理',
  paid: '已付款',
  cancelled: '已取消',
};

const STATUS_CLASSNAME: Record<OrderStatus, string> = {
  pending: 'bg-status-pending-bg text-status-pending',
  paid: 'bg-status-paid-bg text-status-paid',
  cancelled: 'bg-status-cancelled-bg text-status-cancelled',
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium whitespace-nowrap ${STATUS_CLASSNAME[status]}`}
    >
      {STATUS_LABEL[status]}
    </span>
  );
}
