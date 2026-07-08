import { db } from '../firebase';

export type FeedbackDoc = { id: string } & Record<string, unknown>;

class FeedbackRepository {
  private collection() {
    return db.collection('feedback');
  }

  async listAll(): Promise<FeedbackDoc[]> {
    const snapshot = await this.collection().orderBy('createdAt', 'desc').get();
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  }

  async create(id: string, data: Record<string, unknown>): Promise<void> {
    await this.collection().doc(id).set(data);
  }
}

export const feedbackRepository = new FeedbackRepository();
