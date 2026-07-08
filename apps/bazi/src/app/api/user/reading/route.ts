import { NextRequest, NextResponse } from 'next/server';
import { getAdminAuth } from '../../../lib/firebase';
import { readingsRepository } from '../../../lib/repositories/readings-repository';

async function extractUid(request: NextRequest): Promise<string | null> {
  const token = request.headers.get('Authorization')?.replace('Bearer ', '');
  if (!token) return null;
  try {
    const decoded = await getAdminAuth().verifyIdToken(token);
    return decoded.uid;
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    const uid = await extractUid(request);
    if (!uid) {
      return NextResponse.json({ readingId: null });
    }

    const reading = await readingsRepository.findLatestByUser(uid);
    return NextResponse.json({ readingId: reading?.id ?? null });
  } catch (error) {
    console.error('Get user reading error:', error);
    return NextResponse.json({ readingId: null });
  }
}
