'use client';

import { useOrderStats } from '../../api/orders-api';
import { formatCurrency } from '../../lib/format';
import { LoadingSkeleton } from '../loading-skeleton/loading-skeleton';

export function OrderStatsCards() {
  const { data: stats, isLoading, isError } = useOrderStats();

  if (isLoading) {
    return <LoadingSkeleton rows={1} />;
  }

  if (isError || !stats) {
    return <p className="text-sm text-status-cancelled">統計資料載入失敗</p>;
  }

  const cards = [
    { label: '總訂單數', value: stats.totalCount },
    { label: '已付款金額', value: formatCurrency(stats.paidAmountSum) },
    { label: '待處理訂單', value: stats.pendingCount },
    { label: '已取消訂單', value: stats.cancelledCount },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {cards.map((card) => (
        <div key={card.label} className="rounded-xl border border-gray-200 bg-white p-4">
          <p className="text-xs text-gray-500">{card.label}</p>
          <p className="mt-1 text-xl font-semibold text-gray-900">{card.value}</p>
        </div>
      ))}
    </div>
  );
}
