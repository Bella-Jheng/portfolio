import { db } from '../firebase';
import type { QuestionAnswer } from '../../types/bazi';

export type ReadingDoc = { id: string } & Record<string, unknown>;

class ReadingsRepository {
  private collection() {
    return db.collection('readings');
  }

  async getById(id: string): Promise<ReadingDoc | null> {
    const doc = await this.collection().doc(id).get();
    if (!doc.exists) return null;
    const data = doc.data();
    if (!data) return null;
    return { id: doc.id, ...data };
  }

  async create(id: string, data: Record<string, unknown>): Promise<void> {
    await this.collection().doc(id).set(data);
  }

  async update(id: string, patch: Record<string, unknown>): Promise<void> {
    await this.collection().doc(id).update(patch);
  }

  async delete(id: string): Promise<void> {
    await this.collection().doc(id).delete();
  }

  async findLatestByUser(uid: string): Promise<ReadingDoc | null> {
    const snapshot = await this.collection()
      .where('createdBy', '==', uid)
      .orderBy('createdAt', 'desc')
      .limit(1)
      .get();
    if (snapshot.empty) return null;
    const doc = snapshot.docs[0];
    return { id: doc.id, ...doc.data() };
  }

  async listForDashboard(limit = 100): Promise<ReadingDoc[]> {
    const snapshot = await this.collection().orderBy('createdAt', 'desc').limit(limit).get();
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  }

  // 沒有針對 userId 做 Firestore 過濾，維持原本全表掃描行為
  async countTodayQuestionsForUser(userId: string, tz: string): Promise<number> {
    const toLocalDateStr = (isoStr: string) => new Date(isoStr).toLocaleDateString('sv-SE', { timeZone: tz });
    const today = new Date().toLocaleDateString('sv-SE', { timeZone: tz });

    const snapshot = await this.collection().get();
    let count = 0;
    for (const doc of snapshot.docs) {
      const qs = (doc.data().questions ?? []) as QuestionAnswer[];
      count += qs.filter((qa) => qa.userId === userId && toLocalDateStr(qa.createdAt) === today).length;
    }
    return count;
  }
}

export const readingsRepository = new ReadingsRepository();
