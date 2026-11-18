import { randomUUID } from 'crypto';
import { after, NextRequest, NextResponse } from 'next/server';
import { parseListingImages, validateImages, type ParseImage } from '../../../lib/listing-parser';
import { verifyUser } from '../../../lib/verify-user';
import { notifyUser } from '../../../lib/push-notify';

// after() 裡的 AI 解析也算在這支 Function 的執行時間內
export const maxDuration = 60;

/**
 * 背景解析：收到截圖就先回 jobId，AI 在回應送出之後（after）才開始跑，結果存進資料庫。
 * 手機只要撐過「上傳」這幾秒；之後切到別的 App、連線被 iOS 中斷都沒關係，
 * 回來時用 GET /api/parse-jobs/[id] 拿結果。
 */
export async function POST(request: NextRequest) {
  const user = await verifyUser(request.headers.get('authorization'));
  if (!user.ok) return NextResponse.json({ error: user.error }, { status: user.status });

  const apiKey = process.env.GOOGLE_AI_API_KEY;
  if (!apiKey) return NextResponse.json({ error: '伺服器還沒設定 GOOGLE_AI_API_KEY' }, { status: 500 });

  let images: ParseImage[];
  try {
    const body = (await request.json()) as { images?: ParseImage[] };
    images = body.images ?? [];
  } catch {
    return NextResponse.json({ error: '請求格式錯誤' }, { status: 400 });
  }
  const invalid = validateImages(images);
  if (invalid) return NextResponse.json({ error: invalid }, { status: 400 });

  const jobId = randomUUID();
  try {
    await user.repos.parseJobs.create(user.uid, jobId);
  } catch (error) {
    console.error('Create parse job failed:', error);
    return NextResponse.json({ error: '暫時無法開始解析，請稍後再試' }, { status: 500 });
  }

  after(async () => {
    try {
      const result = await parseListingImages(apiKey, images);
      await user.repos.parseJobs.complete(user.uid, jobId, result);
      // 通知使用者回來確認（有開推播的裝置才會收到）；點通知打開新增頁，會自動接上這次的結果
      await notifyUser(user.repos, user.uid, {
        title: '截圖解析好了',
        body: result.title ? `「${result.title}」點開確認物件資訊` : '點開確認物件資訊',
        url: '/add',
        tag: 'rental-parse',
      });
    } catch (error) {
      console.error('Background parse failed:', error);
      await user.repos.parseJobs
        .fail(user.uid, jobId, 'AI 解析失敗，請再試一次')
        .catch((e) => console.error('Mark parse job failed:', e));
      await notifyUser(user.repos, user.uid, {
        title: '截圖解析失敗',
        body: '點開再試一次',
        url: '/add',
        tag: 'rental-parse',
      });
    }
  });

  return NextResponse.json({ jobId }, { status: 202 });
}
