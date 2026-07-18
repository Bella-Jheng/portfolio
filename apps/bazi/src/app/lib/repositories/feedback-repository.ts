import { FieldValue } from 'firebase-admin/firestore';
import { db } from '../firebase';

export type FeedbackDoc = { id: string } & Record<string, unknown>;
export type FeedbackComment = { id: string; message: string; createdAt: string; editedAt?: string };

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

  async updateStatus(id: string, status: string): Promise<void> {
    await this.collection().doc(id).update({ status });
  }

  async addComment(id: string, comment: FeedbackComment): Promise<void> {
    await this.collection().doc(id).update({
      comments: FieldValue.arrayUnion(comment),
    });
  }

  async editComment(id: string, commentId: string, message: string): Promise<void> {
    const doc = await this.collection().doc(id).get();
    const comments = (doc.data()?.comments as FeedbackComment[]) ?? [];
    const updated = comments.map((c) =>
      c.id === commentId ? { ...c, message, editedAt: new Date().toISOString() } : c,
    );
    await this.collection().doc(id).update({ comments: updated });
  }

  async deleteComment(id: string, commentId: string): Promise<void> {
    const doc = await this.collection().doc(id).get();
    const comments = (doc.data()?.comments as FeedbackComment[]) ?? [];
    const updated = comments.filter((c) => c.id !== commentId);
    await this.collection().doc(id).update({ comments: updated });
  }
}

export const feedbackRepository = new FeedbackRepository();
