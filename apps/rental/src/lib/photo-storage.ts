import { randomUUID } from 'crypto';
import { getStorage } from 'firebase-admin/storage';
import { getAdminApp } from './firebase-admin';

/**
 * 物件照片（首圖、截圖縮圖）存 Firebase Storage，資料庫和手機只存網址。
 *
 * 檔案路徑：rental/{上傳者 uid}/{物件 id}/{隨機 id}.jpg
 * 網址用 Firebase 的 download token 格式，拿到網址的人才看得到（分享連結頁也能直接顯示），
 * 所以不需要另外設定 Storage 的安全規則。
 */

const MAX_BYTES = 2_000_000; // 前端會先縮圖（首圖約 100–200KB），這裡只是防呆
const DATA_URL = /^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/=]+)$/;

export function getBucketName(): string | null {
  // 新專案預設是 <projectId>.firebasestorage.app；2024 年以前建立的專案是 <projectId>.appspot.com，要用環境變數指定
  const explicit = process.env.FIREBASE_STORAGE_BUCKET;
  if (explicit) return explicit;
  const projectId = process.env.FIREBASE_PROJECT_ID;
  return projectId ? `${projectId}.firebasestorage.app` : null;
}

export class PhotoError extends Error {
  constructor(
    message: string,
    readonly status: 400 | 413 | 500 | 501,
  ) {
    super(message);
  }
}

function safeSegment(value: string): string {
  return value.replace(/[^A-Za-z0-9_-]/g, '').slice(0, 80) || 'unknown';
}

export async function uploadPhoto(uid: string, listingId: string, dataUrl: string): Promise<string> {
  const app = getAdminApp();
  const bucketName = getBucketName();
  if (!app || !bucketName) throw new PhotoError('伺服器還沒設定照片儲存空間', 501);

  const match = DATA_URL.exec(dataUrl);
  if (!match) throw new PhotoError('照片格式不支援', 400);
  const [, contentType, base64] = match;
  const bytes = Buffer.from(base64, 'base64');
  if (bytes.length === 0) throw new PhotoError('照片是空的', 400);
  if (bytes.length > MAX_BYTES) throw new PhotoError('照片太大，請換一張', 413);

  const ext = contentType === 'image/png' ? 'png' : contentType === 'image/webp' ? 'webp' : 'jpg';
  const path = `rental/${safeSegment(uid)}/${safeSegment(listingId)}/${randomUUID()}.${ext}`;
  const token = randomUUID();

  await getStorage(app)
    .bucket(bucketName)
    .file(path)
    .save(bytes, {
      resumable: false,
      contentType,
      metadata: {
        // 每張照片的檔名都不同、內容不會變，可以讓瀏覽器長期快取
        cacheControl: 'public, max-age=31536000, immutable',
        metadata: { firebaseStorageDownloadTokens: token },
      },
    });

  return `https://firebasestorage.googleapis.com/v0/b/${bucketName}/o/${encodeURIComponent(path)}?alt=media&token=${token}`;
}

/** 刪掉這個帳號上傳給某間物件的所有照片（物件被刪除時呼叫，失敗不影響刪除本身） */
export async function deleteListingPhotos(uid: string, listingId: string): Promise<void> {
  const app = getAdminApp();
  const bucketName = getBucketName();
  if (!app || !bucketName) return;
  await getStorage(app)
    .bucket(bucketName)
    .deleteFiles({ prefix: `rental/${safeSegment(uid)}/${safeSegment(listingId)}/` });
}
