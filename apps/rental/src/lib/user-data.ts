import type { Firestore } from 'firebase-admin/firestore';

/**
 * 每個使用者的資料放在 rentalUsers/{uid} 底下（跟 apps/bazi 共用同一個 Firebase 專案，所以加 rental 前綴）：
 * - rentalUsers/{uid}              偏好設定（私訊範本）
 * - rentalUsers/{uid}/listings/{id} 物件
 * 只透過後端 API 用服務帳號讀寫，前端不會直接連 Firestore，所以不用改 Firestore 安全規則。
 */
export const USERS_COLLECTION = 'rentalUsers';

// Firestore 單一文件上限 1MB；物件含首圖（約 100–200KB）與截圖縮圖，留一點緩衝
export const MAX_LISTING_BYTES = 900_000;

export function userDoc(db: Firestore, uid: string) {
  return db.collection(USERS_COLLECTION).doc(uid);
}

export function listingsCollection(db: Firestore, uid: string) {
  return userDoc(db, uid).collection('listings');
}
