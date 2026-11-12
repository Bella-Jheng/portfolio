import { cert, getApps, initializeApp, type App } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

/**
 * 驗證前端帶來的 Google 登入憑證（Firebase ID token），並到 Firestore 的允許名單確認這個帳號能用 AI。
 *
 * 允許名單：Firestore 集合 `rentalAllowedUsers`，文件 ID 是小寫 email（例如 you@gmail.com）。
 * 在 Firebase Console 新增／刪除文件就能控管誰可以用，不需要重新部署。
 * 集合名稱加上 rental 前綴，避免跟共用同一個 Firebase 專案的 apps/bazi 混在一起。
 */
export const ALLOWED_USERS_COLLECTION = 'rentalAllowedUsers';

export type VerifyResult =
  | { ok: true; email: string }
  | { ok: false; status: 401 | 403 | 500; error: string };

const NOT_CONFIGURED: VerifyResult = {
  ok: false,
  status: 500,
  error: '伺服器還沒設定 Firebase 服務帳號（FIREBASE_PROJECT_ID、FIREBASE_CLIENT_EMAIL、FIREBASE_PRIVATE_KEY）',
};

// 讀 Firestore 需要服務帳號；環境變數名稱跟 apps/bazi 相同，可以直接沿用同一組
function getAdminApp(): App | null {
  const existing = getApps()[0];
  if (existing) return existing;
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');
  if (!projectId || !clientEmail || !privateKey) return null;
  return initializeApp({ credential: cert({ projectId, clientEmail, privateKey }) });
}

export async function verifyUser(authorization: string | null): Promise<VerifyResult> {
  let app: App | null;
  try {
    app = getAdminApp();
  } catch (error) {
    // 金鑰格式錯誤（例如換行沒處理好）會在這裡失敗
    console.error('Firebase admin init failed:', error);
    return NOT_CONFIGURED;
  }
  if (!app) return NOT_CONFIGURED;

  const token = authorization?.replace(/^Bearer /, '');
  if (!token) return { ok: false, status: 401, error: '請先用 Google 登入' };

  let email: string | undefined;
  try {
    const decoded = await getAuth(app).verifyIdToken(token);
    email = decoded.email_verified ? decoded.email?.toLowerCase() : undefined;
  } catch {
    return { ok: false, status: 401, error: '登入已失效，請重新登入' };
  }
  if (!email) return { ok: false, status: 403, error: '這個 Google 帳號沒有使用權限' };

  try {
    const doc = await getFirestore(app).collection(ALLOWED_USERS_COLLECTION).doc(email).get();
    if (!doc.exists) return { ok: false, status: 403, error: '這個 Google 帳號沒有使用權限' };
  } catch (error) {
    console.error('Allowed users lookup failed:', error);
    return { ok: false, status: 500, error: '暫時無法確認使用權限，請稍後再試' };
  }
  return { ok: true, email };
}
