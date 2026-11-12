import { getApps, initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, type Auth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
};

// 沒設定 Firebase 時不要初始化（getAuth 會直接丟錯讓整個網站壞掉），只是不能登入、不能用 AI 解析
export const isFirebaseConfigured = !!firebaseConfig.apiKey && !!firebaseConfig.projectId;

export const auth: Auth | null = isFirebaseConfigured
  ? getAuth(getApps()[0] ?? initializeApp(firebaseConfig))
  : null;

export const googleProvider = new GoogleAuthProvider();
