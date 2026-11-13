import { Pool } from 'pg';
import { getFirestore } from 'firebase-admin/firestore';
import { getAdminApp } from '../firebase-admin';
import { createFirestoreRepositories } from './firestore';
import { createPostgresRepositories, type SqlClient } from './postgres';
import type { Repositories } from './types';

export type { Repositories } from './types';
export { ForbiddenError } from './types';

/**
 * 依 DATA_BACKEND 選資料庫：
 * - firestore（預設）：用 Firebase 服務帳號
 * - postgres：用 DATABASE_URL 連 PostgreSQL（Neon、Supabase、Vercel Postgres 都可以）
 * 設定不完整時丟出錯誤，由 API route 轉成「伺服器還沒設定」的訊息。
 */
let cached: Repositories | null = null;

export function getRepositories(): Repositories {
  if (cached) return cached;
  const backend = process.env.DATA_BACKEND ?? 'firestore';

  if (backend === 'postgres') {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) throw new Error('DATA_BACKEND=postgres 但沒有設定 DATABASE_URL');
    // Serverless 每個執行環境只開少量連線，避免把資料庫連線數用完
    const pool = new Pool({ connectionString, max: 3 });
    const client: SqlClient = {
      query: (text, params) => pool.query(text, params) as never,
      exec: async (sql) => {
        await pool.query(sql);
      },
      async transaction(fn) {
        const conn = await pool.connect();
        try {
          await conn.query('BEGIN');
          const result = await fn({ query: (text, params) => conn.query(text, params) as never });
          await conn.query('COMMIT');
          return result;
        } catch (error) {
          await conn.query('ROLLBACK');
          throw error;
        } finally {
          conn.release();
        }
      },
    };
    cached = createPostgresRepositories(client);
    return cached;
  }

  if (backend === 'firestore') {
    const app = getAdminApp();
    if (!app) throw new Error('沒有設定 Firebase 服務帳號');
    cached = createFirestoreRepositories(getFirestore(app));
    return cached;
  }

  throw new Error(`不支援的 DATA_BACKEND：${backend}`);
}
