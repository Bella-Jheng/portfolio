import { NextRequest, NextResponse } from 'next/server';
import { verifyUser } from '../../../../lib/verify-user';
import { MAX_LISTING_BYTES, listingsCollection } from '../../../../lib/user-data';

type Params = { params: Promise<{ id: string }> };

/** 新增或整筆覆蓋一間物件（前端每次修改後送整筆，最後一次寫入為準） */
export async function PUT(request: NextRequest, { params }: Params) {
  const user = await verifyUser(request.headers.get('authorization'));
  if (!user.ok) return NextResponse.json({ error: user.error }, { status: user.status });

  const { id } = await params;
  const raw = await request.text();
  if (raw.length > MAX_LISTING_BYTES) {
    return NextResponse.json({ error: '這間物件的資料太大（多半是首圖），請換一張比較小的照片' }, { status: 413 });
  }

  let listing: Record<string, unknown>;
  try {
    listing = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: '資料格式錯誤' }, { status: 400 });
  }
  if (!listing || typeof listing !== 'object' || Array.isArray(listing) || listing.id !== id) {
    return NextResponse.json({ error: '資料格式錯誤' }, { status: 400 });
  }

  try {
    await listingsCollection(user.db, user.uid).doc(id).set(listing);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Save listing failed:', error);
    return NextResponse.json({ error: '儲存到雲端失敗，請稍後再試' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: Params) {
  const user = await verifyUser(request.headers.get('authorization'));
  if (!user.ok) return NextResponse.json({ error: user.error }, { status: user.status });

  const { id } = await params;
  try {
    await listingsCollection(user.db, user.uid).doc(id).delete();
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Delete listing failed:', error);
    return NextResponse.json({ error: '從雲端刪除失敗，請稍後再試' }, { status: 500 });
  }
}
