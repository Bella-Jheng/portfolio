import { NextRequest, NextResponse } from 'next/server';
import { db, getAdminAuth } from '../../lib/firebase';

import { v4 as uuidv4 } from 'uuid';

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
    const snap = await db.collection('knowledge').orderBy('createdAt', 'desc').get();
    const entries = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    return NextResponse.json(entries);
  } catch (error) {
    console.error('Get knowledge error:', error);
    return NextResponse.json({ error: '讀取知識庫失敗' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  if (!(await verifyAdmin(request))) {
    return NextResponse.json({ error: '權限不足' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { title, content, category = 'general', tags = [] } = body as {
      title: string;
      content: string;
      category?: string;
      tags?: string[];
    };

    if (!title?.trim() || !content?.trim()) {
      return NextResponse.json({ error: '請提供標題和內容' }, { status: 400 });
    }

    const id = uuidv4();
    const now = new Date().toISOString();

    await db.collection('knowledge').doc(id).set({
      title: title.trim(),
      content: content.trim(),
      category,
      tags,
      createdAt: now,
      updatedAt: now,
    });

    return NextResponse.json({ id, title, content, category, tags, createdAt: now }, { status: 201 });
  } catch (error) {
    console.error('Create knowledge error:', error);
    return NextResponse.json({ error: '新增知識失敗' }, { status: 500 });
  }
}
