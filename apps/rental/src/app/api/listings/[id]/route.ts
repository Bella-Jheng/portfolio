import { NextRequest, NextResponse } from 'next/server';
import { verifyUser } from '../../../../lib/verify-user';
import { ForbiddenError } from '../../../../lib/data';
import { isValidListing } from '../../../../lib/data/validate';

// 物件含首圖（約 100–200KB）與截圖縮圖；Firestore 單一文件上限 1MB，留一點緩衝
const MAX_LISTING_BYTES = 900_000;

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

  let listing: unknown;
  try {
    listing = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: '資料格式錯誤' }, { status: 400 });
  }
  if (!isValidListing(listing) || listing.id !== id) {
    return NextResponse.json({ error: '資料格式錯誤' }, { status: 400 });
  }

  try {
    await user.repos.listings.upsert(user.uid, listing);
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof ForbiddenError) return NextResponse.json({ error: error.message }, { status: 403 });
    console.error('Save listing failed:', error);
    return NextResponse.json({ error: '儲存到雲端失敗，請稍後再試' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: Params) {
  const user = await verifyUser(request.headers.get('authorization'));
  if (!user.ok) return NextResponse.json({ error: user.error }, { status: user.status });

  const { id } = await params;
  try {
    await user.repos.listings.remove(user.uid, id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Delete listing failed:', error);
    return NextResponse.json({ error: '從雲端刪除失敗，請稍後再試' }, { status: 500 });
  }
}
