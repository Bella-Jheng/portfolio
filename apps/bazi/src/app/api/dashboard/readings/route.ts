import { NextRequest, NextResponse } from 'next/server';
import { getAdminAuth } from '../../../lib/firebase';
import { readingsRepository } from '../../../lib/repositories/readings-repository';

const ADMIN_UID = process.env.ADMIN_UID ?? '';

async function verifyAdmin(request: NextRequest): Promise<boolean> {
  const token = request.headers.get('Authorization')?.replace('Bearer ', '');
  if (!token || !ADMIN_UID) return false;
  try {
    const decoded = await getAdminAuth().verifyIdToken(token);
    return decoded.uid === ADMIN_UID;
  } catch (error) {
    console.error('[verifyAdmin] failed:', error);
    return false;
  }
}

export async function GET(request: NextRequest) {
  if (!(await verifyAdmin(request))) {
    return NextResponse.json({ error: '權限不足' }, { status: 403 });
  }

  try {
    const readings = await readingsRepository.listForDashboard(100);
    return NextResponse.json(
      { readings },
      { headers: { 'Cache-Control': 'no-store, private' } },
    );
  } catch (error) {
    console.error('Dashboard readings error:', error);
    return NextResponse.json({ error: '讀取失敗' }, { status: 500 });
  }
}
