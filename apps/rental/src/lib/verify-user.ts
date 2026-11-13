import { getAuth } from 'firebase-admin/auth';
import { getAdminApp } from './firebase-admin';
import { getRepositories, type Repositories } from './data';

/**
 * 驗證前端帶來的 Google 登入憑證（Firebase ID token），並確認帳號在白名單裡。
 * 白名單放在哪由資料存取層決定（Firestore 的 rentalAllowedUsers，或 PostgreSQL 的 rental_allowed_users），
 * 通過後一併回傳 repositories，API route 直接拿來讀寫資料。
 */
export type VerifyResult =
  | { ok: true; uid: string; email: string; repos: Repositories }
  | { ok: false; status: 401 | 403 | 500; error: string };

const NOT_CONFIGURED: VerifyResult = {
  ok: false,
  status: 500,
  error: '伺服器還沒設定 Firebase 服務帳號（FIREBASE_PROJECT_ID、FIREBASE_CLIENT_EMAIL、FIREBASE_PRIVATE_KEY）',
};

export async function verifyUser(authorization: string | null): Promise<VerifyResult> {
  let app: ReturnType<typeof getAdminApp>;
  let repos: Repositories;
  try {
    app = getAdminApp();
    if (!app) return NOT_CONFIGURED;
    repos = getRepositories();
  } catch (error) {
    // 金鑰格式錯誤，或資料庫設定不完整（例如 DATA_BACKEND=postgres 卻沒有 DATABASE_URL）
    console.error('Server data setup failed:', error);
    return NOT_CONFIGURED;
  }

  const token = authorization?.replace(/^Bearer /, '');
  if (!token) return { ok: false, status: 401, error: '請先用 Google 登入' };

  let email: string | undefined;
  let uid: string;
  try {
    const decoded = await getAuth(app).verifyIdToken(token);
    uid = decoded.uid;
    email = decoded.email_verified ? decoded.email?.toLowerCase() : undefined;
  } catch {
    return { ok: false, status: 401, error: '登入已失效，請重新登入' };
  }
  if (!email) return { ok: false, status: 403, error: '這個 Google 帳號沒有使用權限' };

  try {
    if (!(await repos.allowlist.isAllowed(email))) {
      return { ok: false, status: 403, error: '這個 Google 帳號沒有使用權限' };
    }
  } catch (error) {
    console.error('Allowed users lookup failed:', error);
    return { ok: false, status: 500, error: '暫時無法確認使用權限，請稍後再試' };
  }
  return { ok: true, uid, email, repos };
}
