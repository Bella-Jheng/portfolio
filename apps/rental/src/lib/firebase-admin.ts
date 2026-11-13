import { cert, getApps, initializeApp, type App } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

/**
 * Firebase 服務帳號：用來驗證 Google 登入憑證，資料放 Firestore 時也用它讀寫。
 * 環境變數名稱跟 apps/bazi 相同，可以直接沿用同一組。沒設定時回傳 null。
 */
export function getAdminApp(): App | null {
  const existing = getApps()[0];
  if (existing) return existing;
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');
  if (!projectId || !clientEmail || !privateKey) return null;
  const app = initializeApp({ credential: cert({ projectId, clientEmail, privateKey }) });
  // 物件資料裡有選填欄位（例如沒填租金），寫入時略過 undefined，不要整筆失敗
  getFirestore(app).settings({ ignoreUndefinedProperties: true });
  return app;
}
