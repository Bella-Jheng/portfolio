import { db } from '../firebase';

/**
 * 背景排盤工作（baziCalcJobs/{jobId}）：送出生日後先回 jobId，AI 在背景產生命盤，
 * 使用者切到別的 App 再回來，用 jobId 查結果（readingId）。一天前的舊工作在建立新工作時清掉。
 */
export type CalcJobStatus = 'pending' | 'done' | 'error';

export interface CalcJob {
  id: string;
  createdBy: string;
  status: CalcJobStatus;
  readingId?: string;
  error?: string;
  createdAt: string;
}

const DAY_MS = 24 * 60 * 60 * 1000;

class CalcJobsRepository {
  private collection() {
    return db.collection('baziCalcJobs');
  }

  async create(id: string, createdBy: string): Promise<void> {
    // 只用 createdBy 一個條件查（兩個欄位一起篩選要另建複合索引），舊的在這裡挑出來刪
    const cutoff = new Date(Date.now() - DAY_MS).toISOString();
    const mine = await this.collection().where('createdBy', '==', createdBy).get();
    await Promise.all(
      mine.docs.filter((d) => String(d.data().createdAt ?? '') < cutoff).map((d) => d.ref.delete()),
    );
    await this.collection().doc(id).set({ createdBy, status: 'pending', createdAt: new Date().toISOString() });
  }

  /** 只讀得到自己的工作 */
  async get(id: string, createdBy: string): Promise<CalcJob | null> {
    const doc = await this.collection().doc(id).get();
    const data = doc.data();
    if (!doc.exists || !data || data.createdBy !== createdBy) return null;
    return { id, ...data } as CalcJob;
  }

  async complete(id: string, readingId: string): Promise<void> {
    await this.collection().doc(id).update({ status: 'done', readingId, updatedAt: new Date().toISOString() });
  }

  async fail(id: string, error: string): Promise<void> {
    await this.collection().doc(id).update({ status: 'error', error, updatedAt: new Date().toISOString() });
  }
}

export const calcJobsRepository = new CalcJobsRepository();
