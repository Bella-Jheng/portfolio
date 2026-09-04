import { describe, expect, it } from 'vitest';
import { Order } from '../../types/order';
import { computeOrderStats, filterAndSortOrders } from './orders-repository';

const sampleOrders: Order[] = [
  {
    id: 'A20260625001',
    customerName: '王小明',
    source: 'web',
    status: 'pending',
    amount: 1280,
    createdAt: '2026-06-25T09:15:00+08:00',
    items: [],
  },
  {
    id: 'A20260625002',
    customerName: '李雅婷',
    source: 'app',
    status: 'paid',
    amount: 760,
    createdAt: '2026-06-25T10:20:00+08:00',
    items: [],
  },
  {
    id: 'A20260625003',
    customerName: '陳柏翰',
    source: 'pos',
    status: 'cancelled',
    amount: 450,
    createdAt: '2026-06-25T11:05:00+08:00',
    items: [],
  },
  {
    id: 'A20260625004',
    customerName: '林佳蓉',
    source: 'web',
    status: 'paid',
    amount: 1580,
    createdAt: '2026-06-25T12:30:00+08:00',
    items: [],
  },
];

describe('filterAndSortOrders', () => {
  it('filters by keyword across order id and customer name', () => {
    const result = filterAndSortOrders(sampleOrders, { search: '雅婷' });
    expect(result.map((o) => o.id)).toEqual(['A20260625002']);
  });

  it('filters by keyword case-insensitively on order id', () => {
    const result = filterAndSortOrders(sampleOrders, { search: 'a20260625003' });
    expect(result.map((o) => o.id)).toEqual(['A20260625003']);
  });

  it('filters by status (default sort: createdAt desc)', () => {
    const result = filterAndSortOrders(sampleOrders, { status: 'paid' });
    expect(result.map((o) => o.id)).toEqual(['A20260625004', 'A20260625002']);
  });

  it('filters by source (default sort: createdAt desc)', () => {
    const result = filterAndSortOrders(sampleOrders, { source: 'web' });
    expect(result.map((o) => o.id)).toEqual(['A20260625004', 'A20260625001']);
  });

  it('combines search, status, and source filters', () => {
    const result = filterAndSortOrders(sampleOrders, {
      search: '林',
      status: 'paid',
      source: 'web',
    });
    expect(result.map((o) => o.id)).toEqual(['A20260625004']);
  });

  it('sorts by amount ascending', () => {
    const result = filterAndSortOrders(sampleOrders, { sortBy: 'amount', sortDir: 'asc' });
    expect(result.map((o) => o.amount)).toEqual([450, 760, 1280, 1580]);
  });

  it('sorts by createdAt descending by default', () => {
    const result = filterAndSortOrders(sampleOrders, {});
    expect(result.map((o) => o.id)).toEqual([
      'A20260625004',
      'A20260625003',
      'A20260625002',
      'A20260625001',
    ]);
  });

  it('returns an empty array when nothing matches', () => {
    const result = filterAndSortOrders(sampleOrders, { search: '不存在的客戶' });
    expect(result).toEqual([]);
  });
});

describe('computeOrderStats', () => {
  it('summarizes total count, paid amount, pending count, and cancelled count', () => {
    const stats = computeOrderStats(sampleOrders);
    expect(stats).toEqual({
      totalCount: 4,
      paidAmountSum: 2340,
      pendingCount: 1,
      cancelledCount: 1,
    });
  });

  it('returns zeroed stats for an empty order list', () => {
    expect(computeOrderStats([])).toEqual({
      totalCount: 0,
      paidAmountSum: 0,
      pendingCount: 0,
      cancelledCount: 0,
    });
  });
});
