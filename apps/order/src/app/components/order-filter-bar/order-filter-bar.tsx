'use client';

import { useEffect, useState } from 'react';
import { useDebouncedValue } from '../../hooks/use-debounced-value';
import { OrderSortBy, OrderSortDir, OrderSourceFilter, OrderStatusFilter } from '../../api/orders-api.type';

const STATUS_OPTIONS: { value: OrderStatusFilter; label: string }[] = [
  { value: 'all', label: '全部' },
  { value: 'pending', label: '待處理' },
  { value: 'paid', label: '已付款' },
  { value: 'cancelled', label: '已取消' },
];

const SOURCE_OPTIONS: { value: OrderSourceFilter; label: string }[] = [
  { value: 'all', label: '全部' },
  { value: 'web', label: 'Web' },
  { value: 'app', label: 'App' },
  { value: 'pos', label: 'POS' },
];

const SORT_BY_OPTIONS: { value: OrderSortBy; label: string }[] = [
  { value: 'createdAt', label: '建立時間' },
  { value: 'amount', label: '金額' },
];

interface OrderFilterBarProps {
  search: string;
  status: OrderStatusFilter;
  source: OrderSourceFilter;
  sortBy: OrderSortBy;
  sortDir: OrderSortDir;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: OrderStatusFilter) => void;
  onSourceChange: (value: OrderSourceFilter) => void;
  onSortChange: (sortBy: OrderSortBy, sortDir: OrderSortDir) => void;
}

export function OrderFilterBar({
  search,
  status,
  source,
  sortBy,
  sortDir,
  onSearchChange,
  onStatusChange,
  onSourceChange,
  onSortChange,
}: OrderFilterBarProps) {
  const [searchInput, setSearchInput] = useState(search);
  const debouncedSearchInput = useDebouncedValue(searchInput, 400);

  // Only re-run when the debounced value itself changes; onSearchChange is
  // stable enough here that including it would just re-trigger on every parent render.
  useEffect(() => {
    onSearchChange(debouncedSearchInput);
  }, [debouncedSearchInput]);

  return (
    <div className="space-y-3 rounded-xl border border-gray-200 bg-white p-4">
      <input
        type="search"
        value={searchInput}
        onChange={(e) => setSearchInput(e.target.value)}
        placeholder="搜尋訂單編號或客戶名稱"
        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none"
      />

      <div className="flex flex-wrap items-center gap-4">
        <FilterGroup label="狀態">
          {STATUS_OPTIONS.map((option) => (
            <FilterButton
              key={option.value}
              active={status === option.value}
              onClick={() => onStatusChange(option.value)}
            >
              {option.label}
            </FilterButton>
          ))}
        </FilterGroup>

        <FilterGroup label="來源">
          {SOURCE_OPTIONS.map((option) => (
            <FilterButton
              key={option.value}
              active={source === option.value}
              onClick={() => onSourceChange(option.value)}
            >
              {option.label}
            </FilterButton>
          ))}
        </FilterGroup>

        <FilterGroup label="排序">
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value as OrderSortBy, sortDir)}
            className="rounded-lg border border-gray-300 px-2 py-1 text-sm focus:border-gray-500 focus:outline-none"
          >
            {SORT_BY_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => onSortChange(sortBy, sortDir === 'asc' ? 'desc' : 'asc')}
            className="rounded-lg border border-gray-300 px-2 py-1 text-sm hover:border-gray-400"
            aria-label={sortDir === 'asc' ? '目前為由小到大，切換為由大到小' : '目前為由大到小，切換為由小到大'}
          >
            {sortDir === 'asc' ? '↑ 由小到大' : '↓ 由大到小'}
          </button>
        </FilterGroup>
      </div>
    </div>
  );
}

function FilterGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-gray-500">{label}</span>
      <div className="flex flex-wrap gap-1.5">{children}</div>
    </div>
  );
}

function FilterButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
        active ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
      }`}
    >
      {children}
    </button>
  );
}
