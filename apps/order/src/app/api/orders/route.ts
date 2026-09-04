import { NextRequest, NextResponse } from 'next/server';
import { filterAndSortOrders, getAllOrders } from '../repository/orders-repository';
import { simulateNetworkDelay } from '../repository/simulate-delay';
import {
  OrderListApiResponse,
  OrderListParams,
  OrderSortBy,
  OrderSortDir,
  OrderSourceFilter,
  OrderStatusFilter,
} from '../orders-api.type';

export async function GET(request: NextRequest) {
  await simulateNetworkDelay();

  const searchParams = request.nextUrl.searchParams;
  const params: OrderListParams = {
    search: searchParams.get('search') ?? undefined,
    status: (searchParams.get('status') as OrderStatusFilter) ?? 'all',
    source: (searchParams.get('source') as OrderSourceFilter) ?? 'all',
    sortBy: (searchParams.get('sortBy') as OrderSortBy) ?? 'createdAt',
    sortDir: (searchParams.get('sortDir') as OrderSortDir) ?? 'desc',
  };

  const filtered = filterAndSortOrders(getAllOrders(), params);
  const response: OrderListApiResponse = { data: filtered, total: filtered.length };

  return NextResponse.json(response);
}
