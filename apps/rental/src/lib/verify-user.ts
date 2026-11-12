import { getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

/**
 * 驗證前端帶來的 Google 登入憑證（Firebase ID token），並確認 email 在允許名單（ALLOWED_EMAILS）裡。
 * 只驗證 token 不需要 service account：firebase-admin 用專案 ID 和 Google 公開金鑰就能驗簽章。
 */
export type VerifyResult =
  | { ok: true; email: string }
  | { ok: false; status: 401 | 403 | 500; error: string };

function allowedEmails(): string[] {
  return (process.env.ALLOWED_EMAILS ?? '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

export async function verifyUser(authorization: string | null): Promise<VerifyResult> {
  const projectId = process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const allowed = allowedEmails();
  if (!projectId || allowed.length === 0) {
    return { ok: false, status: 500, error: '伺服器還沒設定 Firebase 專案或 ALLOWED_EMAILS' };
  }

  const token = authorization?.replace(/^Bearer /, '');
  if (!token) return { ok: false, status: 401, error: '請先用 Google 登入' };

  try {
    const app = getApps()[0] ?? initializeApp({ projectId });
    const decoded = await getAuth(app).verifyIdToken(token);
    const email = decoded.email?.toLowerCase();
    if (!email || !decoded.email_verified || !allowed.includes(email)) {
      return { ok: false, status: 403, error: '這個 Google 帳號沒有使用權限' };
    }
    return { ok: true, email };
  } catch {
    return { ok: false, status: 401, error: '登入已失效，請重新登入' };
  }
}
