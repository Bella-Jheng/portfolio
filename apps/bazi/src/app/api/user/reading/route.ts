import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../../lib/firebase';
import { getAuth } from 'firebase-admin/auth';

async function extractUid(request: NextRequest): Promise<string | null> {
  const token = request.headers.get('Authorization')?.replace('Bearer ', '');
  if (!token) return null;
  try {
    const decoded = await getAuth().verifyIdToken(token);
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

    const snapshot = await db
      .collection('readings')
      .where('createdBy', '==', uid)
      .orderBy('createdAt', 'desc')
      .limit(1)
      .get();

    if (snapshot.empty) {
      return NextResponse.json({ readingId: null });
    }

    const doc = snapshot.docs[0];
    return NextResponse.json({ readingId: doc.id });
  } catch (error) {
    console.error('Get user reading error:', error);
    return NextResponse.json({ readingId: null });
  }
}
