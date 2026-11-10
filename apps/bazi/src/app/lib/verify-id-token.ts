import type { DecodedIdToken } from 'firebase-admin/auth';
import { getAdminAuth } from './firebase';
import { getSessionRemainingMs } from './session';

// 取代直接呼叫 getAdminAuth().verifyIdToken：除了驗證 token，也檢查距離最後一次登入是否超過 48 小時。
// Firebase 的 ID token 會自動續期，光靠前端登出擋不住被複製走的 refresh token，所以後端也要擋。
export async function verifyIdToken(token: string): Promise<DecodedIdToken> {
  const decoded = await getAdminAuth().verifyIdToken(token);
  if (getSessionRemainingMs(decoded.auth_time * 1000) <= 0) {
    throw new Error('Session expired: signed in more than 48 hours ago');
  }
  return decoded;
}
