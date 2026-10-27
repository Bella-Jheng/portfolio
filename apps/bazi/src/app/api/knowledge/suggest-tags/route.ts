import { NextRequest, NextResponse } from 'next/server';
import { getAdminAuth } from '../../../lib/firebase';
import { suggestKnowledgeTags } from '../../../lib/anthropic';

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

// 這支只有 /knowledge 管理頁(admin 專用)在用，之前沒驗證身份，任何人不登入都能觸發付費的 AI 呼叫
export async function POST(request: NextRequest) {
  if (!(await verifyAdmin(request))) {
    return NextResponse.json({ error: '權限不足' }, { status: 403 });
  }

  try {
    const { title, content } = await request.json() as { title: string; content: string };
    if (!content?.trim()) return NextResponse.json({ tags: [] });

    const tags = await suggestKnowledgeTags(title ?? '', content);
    return NextResponse.json({ tags });
  } catch (error) {
    console.error('Suggest tags error:', error);
    return NextResponse.json({ tags: [] });
  }
}
