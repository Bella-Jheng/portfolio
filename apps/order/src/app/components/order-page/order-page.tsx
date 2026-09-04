'use client';

import { useMemo } from 'react';
import { useOrderQueryParams } from '../../hooks/use-order-query-params';
import { useOrderDetail, useOrders, useUpdateOrderStatus } from '../../api/orders-api';
import { OrderListParams } from '../../api/orders-api.type';
import { OrderStatsCards } from '../order-stats-cards/order-stats-cards';
import { OrderFilterBar } from '../order-filter-bar/order-filter-bar';
import { OrderList } from '../order-list/order-list';
import { OrderDetailPanel } from '../order-detail-panel/order-detail-panel';

export function OrderPage() {
  const queryParams = useOrderQueryParams();
  const { search, status, source, sortBy, sortDir, selectedId, setSearch, setStatus, setSource, setSort, setSelectedId } =
    queryParams;

  const listParams: OrderListParams = useMemo(
    () => ({ search, status, source, sortBy, sortDir }),
    [search, status, source, sortBy, sortDir],
  );

  const ordersQuery = useOrders(listParams);
  const detailQuery = useOrderDetail(selectedId);
  const updateStatusMutation = useUpdateOrderStatus();

  return (
    <div className="container space-y-6 py-6">
      <h1 className="text-2xl font-semibold text-gray-900">訂單管理</h1>

      <OrderStatsCards />

      <OrderFilterBar
        search={search}
        status={status}
        source={source}
        sortBy={sortBy}
        sortDir={sortDir}
        onSearchChange={setSearch}
        onStatusChange={setStatus}
        onSourceChange={setSource}
        onSortChange={setSort}
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <OrderList
          orders={ordersQuery.data?.data ?? []}
          isLoading={ordersQuery.isLoading}
          isError={ordersQuery.isError}
          selectedId={selectedId}
          onSelect={setSelectedId}
        />

        <OrderDetailPanel
          order={detailQuery.data ?? null}
          isLoading={!!selectedId && detailQuery.isLoading}
          isMutating={updateStatusMutation.isPending}
          onChangeStatus={(nextStatus) => {
            if (!selectedId) return;
            updateStatusMutation.mutate({ id: selectedId, status: nextStatus });
          }}
        />
      </div>
    </div>
  );
}
