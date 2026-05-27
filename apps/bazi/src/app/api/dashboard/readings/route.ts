import { NextRequest, NextResponse } from 'next/server';
import { db, getAdminAuth } from '../../../lib/firebase';

const ADMIN_UID = process.env.ADMIN_UID ?? '';

async function verifyAdmin(request: NextRequest): Promise<boolean> {
  const token = request.headers.get('Authorization')?.replace('Bearer ', '');
  if (!token || !ADMIN_UID) return false;
  try {
    const decoded = await getAdminAuth().verifyIdToken(token);
    return decoded.uid === ADMIN_UID;
  } catch {
    return false;
  }
}

export async function GET(request: NextRequest) {
  if (!(await verifyAdmin(request))) {
    return NextResponse.json({ error: '權限不足' }, { status: 403 });
  }

  try {
    const snapshot = await db
      .collection('readings')
      .orderBy('createdAt', 'desc')
      .limit(100)
      .get();

    const readings = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    return NextResponse.json({ readings });
  } catch (error) {
    console.error('Dashboard readings error:', error);
    return NextResponse.json({ error: '讀取失敗' }, { status: 500 });
  }
}
