import { NextRequest, NextResponse } from 'next/server';
import { verifyIdToken } from '../../../lib/verify-id-token';
import { readingsRepository } from '../../../lib/repositories/readings-repository';
import { ensureDemoReading, isAnonymousToken } from '../../../lib/demo/demo-service';

async function extractUser(request: NextRequest): Promise<{ uid: string; anonymous: boolean } | null> {
  const token = request.headers.get('Authorization')?.replace('Bearer ', '');
  if (!token) return null;
  try {
    const decoded = await verifyIdToken(token);
    return { uid: decoded.uid, anonymous: isAnonymousToken(decoded) };
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await extractUser(request);
    if (!user) {
      return NextResponse.json({ readingId: null });
    }
    // 訪客 Demo：給（每天換新的）範例命盤，不查正式的 readings
    if (user.anonymous) {
      return NextResponse.json({ readingId: await ensureDemoReading(user.uid), demo: true });
    }

    const reading = await readingsRepository.findLatestByUser(user.uid);
    return NextResponse.json({ readingId: reading?.id ?? null });
  } catch (error) {
    console.error('Get user reading error:', error);
    return NextResponse.json({ readingId: null });
  }
}
