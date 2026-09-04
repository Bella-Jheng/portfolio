import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { Order } from '../types/order';
import { OrderStats } from '../api/orders-api.type';

interface OrderState {
  orders: Order[];
  selectedOrder: Order | null;
  stats: OrderStats | null;
}

interface OrderActions {
  setOrders: (orders: Order[]) => void;
  setSelectedOrder: (order: Order | null) => void;
  setStats: (stats: OrderStats | null) => void;
  // Generic single-order patch so both the current status-change flow and
  // future field-level edits can share one write path into the store.
  updateOrder: (order: Order) => void;
}

export const useOrderStore = create<OrderState & OrderActions>()(
  devtools(
    (set) => ({
      orders: [],
      selectedOrder: null,
      stats: null,
      setOrders: (orders) => set({ orders }, false, 'order/setOrders'),
      setSelectedOrder: (order) => set({ selectedOrder: order }, false, 'order/setSelectedOrder'),
      setStats: (stats) => set({ stats }, false, 'order/setStats'),
      updateOrder: (order) =>
        set(
          (state) => ({
            orders: state.orders.map((item) => (item.id === order.id ? order : item)),
            selectedOrder: state.selectedOrder?.id === order.id ? order : state.selectedOrder,
          }),
          false,
          'order/updateOrder',
        ),
    }),
    { name: 'order', enabled: process.env.NODE_ENV === 'development' },
  ),
);
