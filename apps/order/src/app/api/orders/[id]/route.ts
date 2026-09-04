import { NextRequest, NextResponse } from 'next/server';
import { getOrderById, updateOrderStatus } from '../../repository/orders-repository';
import { simulateNetworkDelay } from '../../repository/simulate-delay';
import { UpdateOrderStatusPayload } from '../../orders-api.type';
import { ORDER_STATUSES } from '../../../types/order';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  await simulateNetworkDelay();

  const { id } = await params;
  const order = getOrderById(id);

  if (!order) {
    return NextResponse.json({ message: 'Order not found' }, { status: 404 });
  }

  return NextResponse.json(order);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  await simulateNetworkDelay();

  const { id } = await params;
  const payload = (await request.json()) as UpdateOrderStatusPayload;

  if (!ORDER_STATUSES.includes(payload.status)) {
    return NextResponse.json({ message: 'Invalid status' }, { status: 400 });
  }

  const updated = updateOrderStatus(id, payload.status);

  if (!updated) {
    return NextResponse.json({ message: 'Order not found' }, { status: 404 });
  }

  return NextResponse.json(updated);
}
