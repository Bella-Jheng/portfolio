import { initializeApp, getApps, cert, type ServiceAccount } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

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

function getFirebaseApp() {
  if (getApps().length > 0) return getApps()[0];
  return initializeApp({ credential: cert(getCredential()) });
}

export const db = getFirestore(getFirebaseApp());
