import { beforeEach, describe, expect, it } from 'vitest';
import { PGlite } from '@electric-sql/pglite';
import { createPostgresRepositories, type SqlClient } from './postgres';
import { ForbiddenError, type Repositories } from './types';
import type { Listing } from '../types';

// PGlite 是跑在記憶體裡的真正 PostgreSQL，測試用的 SQL 跟正式環境完全一樣
function pgliteClient(db: PGlite): SqlClient {
  return {
    query: (text, params) => db.query(text, params) as never,
    exec: async (sql) => {
      await db.exec(sql);
    },
    transaction: (fn) => db.transaction((tx) => fn({ query: (text, params) => tx.query(text, params) as never })),
  };
}

const listing = (overrides: Partial<Listing> = {}): Listing => ({
  id: 'listing-1',
  createdAt: '2026-11-01T08:00:00.000Z',
  updatedAt: '2026-11-02T09:30:00.000Z',
  status: 'contacted',
  favorite: true,
  source: '591',
  sourceUrl: 'https://rent.591.com.tw/home/123',
  title: '西屯區套房',
  address: '台中市西屯區福星路',
  lat: 24.18,
  lng: 120.64,
  rent: 9500,
  layout: '獨立套房',
  size: '8 坪',
  floor: '4F/7F',
  fees: '水電另計',
  pets: '可養貓',
  listingNo: 'R123',
  contactName: '王小姐',
  contactRole: '代管',
  phones: ['0912-345-678', '04-2345-6789'],
  lineIds: ['wang123'],
  igIds: ['rent.wang'],
  notes: [
    { id: 'n2', at: '2026-11-02T10:00:00.000Z', text: '採光好' },
    { id: 'n1', at: '2026-11-01T10:00:00.000Z', text: '巷口有點吵' },
  ],
  thumbnail: 'data:image/jpeg;base64,AAAA',
  coverImage: 'data:image/jpeg;base64,BBBB',
  uncertain: ['address'],
  ...overrides,
});

describe('PostgreSQL 資料存取層', () => {
  let db: PGlite;
  let repos: Repositories;

  beforeEach(async () => {
    db = new PGlite();
    repos = createPostgresRepositories(pgliteClient(db));
  });

  it('存進去再讀出來，內容一模一樣（含聯絡方式順序與備註）', async () => {
    const original = listing();
    await repos.listings.upsert('alice', original);
    expect(await repos.listings.list('alice')).toEqual([original]);
  });

  it('聯絡方式和備註拆到子表，一個值一列', async () => {
    await repos.listings.upsert('alice', listing());
    const contacts = await db.query('SELECT kind, position, value FROM rental_listing_contacts ORDER BY kind, position');
    expect(contacts.rows).toEqual([
      { kind: 'ig', position: 0, value: 'rent.wang' },
      { kind: 'line', position: 0, value: 'wang123' },
      { kind: 'phone', position: 0, value: '0912-345-678' },
      { kind: 'phone', position: 1, value: '04-2345-6789' },
    ]);
    const notes = await db.query('SELECT COUNT(*)::int AS n FROM rental_listing_notes');
    expect(notes.rows[0]).toEqual({ n: 2 });
  });

  it('選填欄位沒值時讀回來也不會多出 key', async () => {
    const minimal = listing({ id: 'min', favorite: false, notes: [], phones: [], lineIds: [], igIds: [] });
    delete minimal.lat;
    delete minimal.lng;
    delete minimal.rent;
    delete minimal.thumbnail;
    delete minimal.coverImage;
    await repos.listings.upsert('alice', minimal);
    expect(await repos.listings.list('alice')).toEqual([minimal]);
  });

  it('更新時整筆覆蓋：刪掉的電話、備註不會留下來', async () => {
    await repos.listings.upsert('alice', listing());
    const edited = listing({ phones: ['0900-000-000'], notes: [], title: '改過的標題', status: 'viewed' });
    await repos.listings.upsert('alice', edited);
    expect(await repos.listings.list('alice')).toEqual([edited]);
  });

  it('依建立時間新到舊排序', async () => {
    await repos.listings.upsert('alice', listing({ id: 'old', createdAt: '2026-10-01T00:00:00.000Z' }));
    await repos.listings.upsert('alice', listing({ id: 'new', createdAt: '2026-11-10T00:00:00.000Z' }));
    expect((await repos.listings.list('alice')).map((l) => l.id)).toEqual(['new', 'old']);
  });

  it('每個帳號只看得到、改得到、刪得到自己的物件', async () => {
    await repos.listings.upsert('alice', listing());
    expect(await repos.listings.list('bob')).toEqual([]);
    await expect(repos.listings.upsert('bob', listing({ title: '偷改' }))).rejects.toBeInstanceOf(ForbiddenError);
    await repos.listings.remove('bob', 'listing-1');
    expect((await repos.listings.list('alice'))[0].title).toBe('西屯區套房');
  });

  it('刪除物件時，聯絡方式和備註一起刪掉', async () => {
    await repos.listings.upsert('alice', listing());
    await repos.listings.remove('alice', 'listing-1');
    expect(await repos.listings.list('alice')).toEqual([]);
    const left = await db.query(
      'SELECT (SELECT COUNT(*) FROM rental_listing_contacts)::int AS c, (SELECT COUNT(*) FROM rental_listing_notes)::int AS n',
    );
    expect(left.rows[0]).toEqual({ c: 0, n: 0 });
  });

  it('寫入失敗時整筆回復，不會只寫一半', async () => {
    await repos.listings.upsert('alice', listing());
    // 狀態不合法會被資料表的 CHECK 擋下
    await expect(repos.listings.upsert('alice', listing({ status: 'oops' as never, phones: [] }))).rejects.toThrow();
    expect(await repos.listings.list('alice')).toEqual([listing()]);
  });

  it('私訊範本：沒存過是 null，存了可以讀回、可以更新', async () => {
    expect(await repos.preferences.getTemplates('alice')).toBeNull();
    await repos.preferences.saveTemplates('alice', { profile: '預算：15000' });
    await repos.preferences.saveTemplates('alice', { profile: '預算：18000', ask: '哈囉{物件}' });
    expect(await repos.preferences.getTemplates('alice')).toEqual({ profile: '預算：18000', ask: '哈囉{物件}' });
  });

  it('白名單：email 不分大小寫', async () => {
    expect(await repos.allowlist.isAllowed('me@gmail.com')).toBe(false);
    await db.query("INSERT INTO rental_allowed_users (email) VALUES ('me@gmail.com')");
    expect(await repos.allowlist.isAllowed('Me@Gmail.com')).toBe(true);
  });
});
