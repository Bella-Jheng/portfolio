import { NextRequest, NextResponse } from 'next/server';
import { getAdminAuth } from '../../lib/firebase';
import { feedbackRepository, type FeedbackDoc } from '../../lib/repositories/feedback-repository';
import { maskName } from '../../lib/mask-name';

import { v4 as uuidv4 } from 'uuid';

const ADMIN_UID = process.env.ADMIN_UID ?? '';
const VALID_STATUSES = ['unprocessed', 'in_progress', 'resolved'];

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

function toPublicEntry(entry: FeedbackDoc) {
  const rawName = (entry.userName as string) || (entry.userEmail ? String(entry.userEmail).split('@')[0] : '') || '匿名';
  return {
    id: entry.id,
    message: entry.message,
    displayName: maskName(rawName),
    createdAt: entry.createdAt,
    status: (entry.status as string) ?? 'unprocessed',
    comments: (entry.comments as unknown[]) ?? [],
  };
}

export async function GET() {
  try {
    const entries = await feedbackRepository.listAll();
    return NextResponse.json(entries.map(toPublicEntry));
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
      status: 'unprocessed',
      comments: [],
      createdAt: now,
    });

    return NextResponse.json({ id, message: message.trim(), createdAt: now }, { status: 201 });
  } catch (error) {
    console.error('Create feedback error:', error);
    return NextResponse.json({ error: '送出回饋失敗' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  if (!(await verifyAdmin(request))) {
    return NextResponse.json({ error: '權限不足' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { id, status, comment, commentId, deleteComment } = body as {
      id: string;
      status?: string;
      comment?: string;
      commentId?: string;
      deleteComment?: boolean;
    };

    if (!id) {
      return NextResponse.json({ error: '缺少回饋 ID' }, { status: 400 });
    }

    if (status && !VALID_STATUSES.includes(status)) {
      return NextResponse.json({ error: '無效的狀態' }, { status: 400 });
    }

    if (!status && !comment?.trim() && !(deleteComment && commentId)) {
      return NextResponse.json({ error: '請提供要更新的狀態或留言' }, { status: 400 });
    }

    if (status) {
      await feedbackRepository.updateStatus(id, status);
    }

    if (deleteComment && commentId) {
      await feedbackRepository.deleteComment(id, commentId);
    } else if (commentId && comment?.trim()) {
      await feedbackRepository.editComment(id, commentId, comment.trim());
    } else if (comment?.trim()) {
      await feedbackRepository.addComment(id, {
        id: uuidv4(),
        message: comment.trim(),
        createdAt: new Date().toISOString(),
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Update feedback error:', error);
    return NextResponse.json({ error: '更新回饋失敗' }, { status: 500 });
  }
}
