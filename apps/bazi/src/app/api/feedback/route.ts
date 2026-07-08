import { NextRequest, NextResponse } from 'next/server';
import { getAdminAuth } from '../../lib/firebase';
import { feedbackRepository } from '../../lib/repositories/feedback-repository';

import { v4 as uuidv4 } from 'uuid';

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

async function verifyUser(request: NextRequest) {
  const token = request.headers.get('Authorization')?.replace('Bearer ', '');
  if (!token) return null;
  try {
    return await getAdminAuth().verifyIdToken(token);
  } catch (error) {
    console.error('[verifyUser] failed:', error);
    return null;
  }
}

export async function GET(request: NextRequest) {
  if (!(await verifyAdmin(request))) {
    return NextResponse.json({ error: '權限不足' }, { status: 403 });
  }

  try {
    const entries = await feedbackRepository.listAll();
    return NextResponse.json(entries);
  } catch (error) {
    console.error('Get feedback error:', error);
    return NextResponse.json({ error: '讀取回饋失敗' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const decoded = await verifyUser(request);
  if (!decoded) {
    return NextResponse.json({ error: '請先登入' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { message } = body as { message: string };

    if (!message?.trim()) {
      return NextResponse.json({ error: '請輸入回饋內容' }, { status: 400 });
    }

    const id = uuidv4();
    const now = new Date().toISOString();

    await feedbackRepository.create(id, {
      message: message.trim(),
      uid: decoded.uid,
      userName: decoded.name ?? null,
      userEmail: decoded.email ?? null,
      createdAt: now,
    });

    return NextResponse.json({ id, message: message.trim(), createdAt: now }, { status: 201 });
  } catch (error) {
    console.error('Create feedback error:', error);
    return NextResponse.json({ error: '送出回饋失敗' }, { status: 500 });
  }
}
