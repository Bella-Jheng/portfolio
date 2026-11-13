import { NextRequest, NextResponse } from 'next/server';
import { verifyUser } from '../../../lib/verify-user';
import { userDoc } from '../../../lib/user-data';

const MAX_TEMPLATE_CHARS = 5_000;

/** 取得這個帳號的私訊範本；還沒存過時 templates 為 null */
export async function GET(request: NextRequest) {
  const user = await verifyUser(request.headers.get('authorization'));
  if (!user.ok) return NextResponse.json({ error: user.error }, { status: user.status });

  try {
    const doc = await userDoc(user.db, user.uid).get();
    return NextResponse.json(
      { templates: (doc.data()?.templates as Record<string, string> | undefined) ?? null },
      { headers: { 'Cache-Control': 'no-store, private' } },
    );
  } catch (error) {
    console.error('Get preferences failed:', error);
    return NextResponse.json({ error: '讀取雲端設定失敗，請稍後再試' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const user = await verifyUser(request.headers.get('authorization'));
  if (!user.ok) return NextResponse.json({ error: user.error }, { status: user.status });

  const body = (await request.json().catch(() => null)) as { templates?: unknown } | null;
  const templates = body?.templates;
  const valid =
    !!templates &&
    typeof templates === 'object' &&
    !Array.isArray(templates) &&
    Object.values(templates).every((v) => typeof v === 'string' && v.length <= MAX_TEMPLATE_CHARS);
  if (!valid) return NextResponse.json({ error: '資料格式錯誤' }, { status: 400 });

  try {
    await userDoc(user.db, user.uid).set({ templates, updatedAt: new Date().toISOString() }, { merge: true });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Save preferences failed:', error);
    return NextResponse.json({ error: '儲存雲端設定失敗，請稍後再試' }, { status: 500 });
  }
}
