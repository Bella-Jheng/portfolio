import { db } from '../firebase';

export type KnowledgeDoc = { id: string } & Record<string, unknown>;

class KnowledgeRepository {
  private collection() {
    return db.collection('knowledge');
  }

  async listAll(): Promise<KnowledgeDoc[]> {
    const snapshot = await this.collection().orderBy('createdAt', 'desc').get();
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
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

  // tags 命中不足 3 筆時，補上最舊的既有資料（含尚未標籤的舊資料）
  async queryByTags(tags: string[]): Promise<KnowledgeDoc[]> {
    let docs = (await this.collection().where('tags', 'array-contains-any', tags).get()).docs;

    if (docs.length < 3) {
      const all = await this.collection().orderBy('createdAt', 'asc').limit(20).get();
      const existing = new Set(docs.map((doc) => doc.id));
      docs = [...docs, ...all.docs.filter((doc) => !existing.has(doc.id))];
    }

    return docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  }
}

export const knowledgeRepository = new KnowledgeRepository();
