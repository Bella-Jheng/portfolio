import { NextRequest, NextResponse } from 'next/server';
import { getAdminAuth } from '../../../lib/firebase';
import { knowledgeRepository } from '../../../lib/repositories/knowledge-repository';

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

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await verifyAdmin(request))) {
    return NextResponse.json({ error: '權限不足' }, { status: 403 });
  }

  try {
    const { id } = await params;
    await knowledgeRepository.delete(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete knowledge error:', error);
    return NextResponse.json({ error: '刪除失敗' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await verifyAdmin(request))) {
    return NextResponse.json({ error: '權限不足' }, { status: 403 });
  }

  try {
    const { id } = await params;
    const body = await request.json();
    const { title, content, category } = body as {
      title?: string;
      content?: string;
      category?: string;
    };

    await knowledgeRepository.update(id, {
      ...(title && { title: title.trim() }),
      ...(content && { content: content.trim() }),
      ...(category && { category }),
      updatedAt: new Date().toISOString(),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Update knowledge error:', error);
    return NextResponse.json({ error: '更新失敗' }, { status: 500 });
  }
}
