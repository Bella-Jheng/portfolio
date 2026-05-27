import { initializeApp, getApps, cert, type ServiceAccount } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth as _getAuth } from 'firebase-admin/auth';

function getCredential(): ServiceAccount {
  // 本地開發：直接讀 service-account.json（放在 apps/bazi/ 根目錄，已加入 .gitignore）
  if (process.env.NODE_ENV !== 'production') {
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const serviceAccount = require('../../../service-account.json');
      return serviceAccount as ServiceAccount;
    } catch {
      // 找不到 JSON 檔就改用環境變數
    }
  }

  // Vercel 部署：從環境變數讀取
  return {
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  };
}

let _db: ReturnType<typeof getFirestore> | null = null;

function getDb() {
  if (_db) return _db;
  const isNew = getApps().length === 0;
  const app = isNew ? initializeApp({ credential: cert(getCredential()) }) : getApps()[0];
  const firestore = getFirestore(app);
  if (isNew) firestore.settings({ ignoreUndefinedProperties: true });
  _db = firestore;
  return _db;
}

// Proxy：import { db } 的寫法不變，但 Firebase 實際上在第一次 request 時才初始化，不在 build 時
export const db = new Proxy({} as ReturnType<typeof getFirestore>, {
  get(_, prop) {
    return Reflect.get(getDb(), prop as string);
  },
});

// 確保 app 已初始化後再回傳 Auth，避免 getAuth() 在 app 尚未建立時拋出
export function getAdminAuth() {
  getDb(); // triggers app initialization if not yet done
  return _getAuth();
}
