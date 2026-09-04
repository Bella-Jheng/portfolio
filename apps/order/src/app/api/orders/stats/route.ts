import { NextResponse } from 'next/server';
import { computeOrderStats, getAllOrders } from '../../repository/orders-repository';
import { simulateNetworkDelay } from '../../repository/simulate-delay';

export async function GET() {
  await simulateNetworkDelay();
  return NextResponse.json(computeOrderStats(getAllOrders()));
}
