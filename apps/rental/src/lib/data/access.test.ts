import { beforeEach, describe, expect, it } from 'vitest';
import { PGlite } from '@electric-sql/pglite';
import { createPostgresRepositories, type SqlClient } from './postgres';
import { ForbiddenError, type Repositories } from './types';
import { listForUser, saveListing, toPublicListing } from './access';
import { emptyListing } from '../store';

function pgliteClient(db: PGlite): SqlClient {
  return {
    query: (text, params) => db.query(text, params) as never,
    exec: async (sql) => {
      await db.exec(sql);
    },
    transaction: (fn) => db.transaction((tx) => fn({ query: (text, params) => tx.query(text, params) as never })),
  };
}

describe('共用與分享的權限', () => {
  let repos: Repositories;
  const alice = { uid: 'alice-uid', email: 'alice@gmail.com' };
  const sharedA1 = async () => {
    const found = (await listForUser(repos, bob.uid, bob.email)).find((l) => l.id === 'a1');
    if (!found) throw new Error('Bob 看不到 a1');
    return found;
  };
  const bob = { uid: 'bob-uid', email: 'bob@gmail.com' };

  beforeEach(async () => {
    repos = createPostgresRepositories(pgliteClient(new PGlite()));
    await repos.listings.upsert(alice.uid, emptyListing({ id: 'a1', title: 'Alice 的套房', createdAt: '2026-11-01T00:00:00.000Z' }));
    await repos.listings.upsert(bob.uid, emptyListing({ id: 'b1', title: 'Bob 的兩房', createdAt: '2026-11-02T00:00:00.000Z' }));
  });

  it('沒有共用時，只看得到自己的物件', async () => {
    expect((await listForUser(repos, bob.uid, bob.email)).map((l) => l.id)).toEqual(['b1']);
  });

  it('Alice 邀請 Bob 後，Bob 看得到 Alice 的物件，並標示是誰共用的', async () => {
    await repos.members.add(alice.uid, alice.email, 'BOB@gmail.com');
    const list = await listForUser(repos, bob.uid, bob.email);
    expect(list.map((l) => [l.id, l.sharedBy?.email ?? null])).toEqual([
      ['b1', null],
      ['a1', 'alice@gmail.com'],
    ]);
    expect(await repos.members.listMembers(alice.uid)).toEqual(['bob@gmail.com']);
  });

  it('Bob 改 Alice 共用的物件，會寫回 Alice 那邊', async () => {
    await repos.members.add(alice.uid, alice.email, bob.email);
    const shared = await sharedA1();
    await saveListing(repos, bob.uid, bob.email, { ...shared, title: 'Bob 幫忙改的' });
    expect((await repos.listings.get(alice.uid, 'a1'))?.title).toBe('Bob 幫忙改的');
    // 不會在 Bob 那邊多出一份
    expect(await repos.listings.get(bob.uid, 'a1')).toBeNull();
  });

  it('取消共用後，Bob 看不到也改不了', async () => {
    await repos.members.add(alice.uid, alice.email, bob.email);
    const shared = await sharedA1();
    await repos.members.remove(alice.uid, bob.email);
    expect((await listForUser(repos, bob.uid, bob.email)).map((l) => l.id)).toEqual(['b1']);
    await expect(saveListing(repos, bob.uid, bob.email, { ...shared, title: '偷改' })).rejects.toBeInstanceOf(ForbiddenError);
    expect((await repos.listings.get(alice.uid, 'a1'))?.title).toBe('Alice 的套房');
  });

  it('假冒 sharedBy 也改不了沒有共用給自己的物件', async () => {
    const forged = { ...emptyListing({ id: 'a1', title: '偷改' }), sharedBy: { uid: alice.uid, email: alice.email } };
    await expect(saveListing(repos, bob.uid, bob.email, forged)).rejects.toBeInstanceOf(ForbiddenError);
  });

  it('分享連結：解析出擁有者和物件；物件刪掉後連結失效', async () => {
    await repos.shareLinks.create(alice.uid, 'a1', 'token-123');
    expect(await repos.shareLinks.getToken(alice.uid, 'a1')).toBe('token-123');
    expect(await repos.shareLinks.resolve('token-123')).toEqual({ ownerUid: alice.uid, listingId: 'a1' });
    await repos.listings.remove(alice.uid, 'a1');
    expect(await repos.shareLinks.resolve('token-123')).toBeNull();
  });

  it('停止分享後，連結失效', async () => {
    await repos.shareLinks.create(alice.uid, 'a1', 'token-123');
    await repos.shareLinks.revoke(alice.uid, 'a1');
    expect(await repos.shareLinks.resolve('token-123')).toBeNull();
  });

  it('分享頁不會露出備註、AI 標記、愛心', () => {
    const listing = emptyListing({
      title: '公開',
      favorite: true,
      notes: [{ id: 'n', at: '2026-11-01T00:00:00.000Z', text: '私人備註' }],
      uncertain: ['rent'],
    });
    const pub = toPublicListing(listing);
    expect(pub).not.toHaveProperty('notes');
    expect(pub).not.toHaveProperty('uncertain');
    expect(pub).not.toHaveProperty('favorite');
    expect(pub.title).toBe('公開');
  });
});
