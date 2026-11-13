import type { Listing, Note, ParsedField, Source, Status } from '../types';
import { ForbiddenError, type Repositories } from './types';
import { SCHEMA_SQL } from './schema';

/**
 * 只依賴最基本的 query／transaction，正式環境接 pg 的 Pool（index.ts），
 * 測試接 PGlite（記憶體裡的 PostgreSQL），兩邊跑同一份 SQL。
 */
export interface SqlExecutor {
  query<T = Record<string, unknown>>(text: string, params?: unknown[]): Promise<{ rows: T[] }>;
}

export interface SqlClient extends SqlExecutor {
  /** 在同一個交易裡執行，fn 丟錯就整個 ROLLBACK */
  transaction<R>(fn: (tx: SqlExecutor) => Promise<R>): Promise<R>;
  /** 建立資料表（多個 SQL 指令一起執行） */
  exec(sql: string): Promise<void>;
}

type ListingRow = {
  id: string;
  created_at: Date | string;
  updated_at: Date | string;
  status: Status;
  favorite: boolean;
  source: Source;
  source_url: string;
  title: string;
  address: string;
  lat: number | null;
  lng: number | null;
  rent: number | null;
  layout: string;
  size: string;
  floor: string;
  fees: string;
  pets: string;
  listing_no: string;
  contact_name: string;
  contact_role: string;
  thumbnail: string | null;
  cover_image: string | null;
  viewing_at: Date | string | null;
  uncertain: string[];
};

type ContactKind = 'phone' | 'line' | 'ig';
type ContactRow = { listing_id: string; kind: ContactKind; value: string };
type NoteRow = { id: string; listing_id: string; at: Date | string; text: string };

const CONTACT_FIELDS: Record<ContactKind, 'phones' | 'lineIds' | 'igIds'> = {
  phone: 'phones',
  line: 'lineIds',
  ig: 'igIds',
};

const iso = (value: Date | string) => new Date(value).toISOString();

function rowToListing(row: ListingRow, contacts: ContactRow[], notes: NoteRow[]): Listing {
  const listing: Listing = {
    id: row.id,
    createdAt: iso(row.created_at),
    updatedAt: iso(row.updated_at),
    status: row.status,
    favorite: row.favorite,
    source: row.source,
    sourceUrl: row.source_url,
    title: row.title,
    address: row.address,
    layout: row.layout,
    size: row.size,
    floor: row.floor,
    fees: row.fees,
    pets: row.pets,
    listingNo: row.listing_no,
    contactName: row.contact_name,
    contactRole: row.contact_role,
    phones: [],
    lineIds: [],
    igIds: [],
    // 查詢時已依時間新到舊排序
    notes: notes.map((n): Note => ({ id: n.id, at: iso(n.at), text: n.text })),
    uncertain: row.uncertain as ParsedField[],
  };
  // 選填欄位沒有值時不放 key，跟前端建立的物件長得一樣
  if (row.lat != null) listing.lat = row.lat;
  if (row.lng != null) listing.lng = row.lng;
  if (row.rent != null) listing.rent = row.rent;
  if (row.thumbnail != null) listing.thumbnail = row.thumbnail;
  if (row.cover_image != null) listing.coverImage = row.cover_image;
  if (row.viewing_at != null) listing.viewingAt = iso(row.viewing_at);
  // 查詢時已依 position 排序
  for (const c of contacts) listing[CONTACT_FIELDS[c.kind]].push(c.value);
  return listing;
}

export function createPostgresRepositories(sql: SqlClient): Repositories {
  // 每個執行環境只建立一次資料表；失敗的話下次呼叫再試
  let schemaReady: Promise<void> | null = null;
  const ready = () => {
    schemaReady ??= sql.exec(SCHEMA_SQL).catch((error) => {
      schemaReady = null;
      throw error;
    });
    return schemaReady;
  };

  // 讀物件：先查主表，再一次查回這些物件的聯絡方式和備註，在程式裡組回去
  async function loadListings(where: string, params: unknown[]): Promise<Listing[]> {
    await ready();
    const { rows } = await sql.query<ListingRow>(
      `SELECT * FROM rental_listings WHERE ${where} ORDER BY created_at DESC`,
      params,
    );
    if (rows.length === 0) return [];
    const ids = rows.map((r) => r.id);
    const [contacts, notes] = await Promise.all([
      sql.query<ContactRow>(
        'SELECT listing_id, kind, value FROM rental_listing_contacts WHERE listing_id = ANY($1) ORDER BY position',
        [ids],
      ),
      sql.query<NoteRow>(
        'SELECT id, listing_id, at, text FROM rental_listing_notes WHERE listing_id = ANY($1) ORDER BY at DESC',
        [ids],
      ),
    ]);
    return rows.map((row) =>
      rowToListing(
        row,
        contacts.rows.filter((c) => c.listing_id === row.id),
        notes.rows.filter((n) => n.listing_id === row.id),
      ),
    );
  }

  const repos: Repositories = {
    listings: {
      list: (ownerUid) => loadListings('owner_uid = $1', [ownerUid]),

      async get(ownerUid, id) {
        const [listing] = await loadListings('owner_uid = $1 AND id = $2', [ownerUid, id]);
        return listing ?? null;
      },

      async upsert(ownerUid, l) {
        await ready();
        await sql.transaction(async (tx) => {
          // 同一個 id 已經屬於別的帳號時不覆蓋（WHERE 擋下來就不會回傳任何列）
          const { rows } = await tx.query<{ id: string }>(
            `INSERT INTO rental_listings (
               id, owner_uid, created_at, updated_at, status, favorite, source, source_url, title, address,
               lat, lng, rent, layout, size, floor, fees, pets, listing_no, contact_name, contact_role,
               thumbnail, cover_image, uncertain, viewing_at
             ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25)
             ON CONFLICT (id) DO UPDATE SET
               updated_at = EXCLUDED.updated_at, status = EXCLUDED.status, favorite = EXCLUDED.favorite,
               source = EXCLUDED.source, source_url = EXCLUDED.source_url, title = EXCLUDED.title,
               address = EXCLUDED.address, lat = EXCLUDED.lat, lng = EXCLUDED.lng, rent = EXCLUDED.rent,
               layout = EXCLUDED.layout, size = EXCLUDED.size, floor = EXCLUDED.floor, fees = EXCLUDED.fees,
               pets = EXCLUDED.pets, listing_no = EXCLUDED.listing_no, contact_name = EXCLUDED.contact_name,
               contact_role = EXCLUDED.contact_role, thumbnail = EXCLUDED.thumbnail,
               cover_image = EXCLUDED.cover_image, uncertain = EXCLUDED.uncertain, viewing_at = EXCLUDED.viewing_at
             WHERE rental_listings.owner_uid = EXCLUDED.owner_uid
             RETURNING id`,
            [
              l.id, ownerUid, l.createdAt, l.updatedAt, l.status, !!l.favorite, l.source, l.sourceUrl ?? '',
              l.title, l.address, l.lat ?? null, l.lng ?? null, l.rent ?? null, l.layout, l.size, l.floor,
              l.fees, l.pets, l.listingNo, l.contactName, l.contactRole, l.thumbnail ?? null,
              l.coverImage ?? null, l.uncertain, l.viewingAt ?? null,
            ],
          );
          if (rows.length === 0) throw new ForbiddenError('這間物件屬於其他帳號');

          // 聯絡方式和備註整批換掉，跟前端「整筆覆蓋」的語意一致
          await tx.query('DELETE FROM rental_listing_contacts WHERE listing_id = $1', [l.id]);
          await tx.query('DELETE FROM rental_listing_notes WHERE listing_id = $1', [l.id]);
          for (const kind of Object.keys(CONTACT_FIELDS) as ContactKind[]) {
            const values = l[CONTACT_FIELDS[kind]];
            for (let position = 0; position < values.length; position++) {
              await tx.query(
                'INSERT INTO rental_listing_contacts (listing_id, kind, position, value) VALUES ($1, $2, $3, $4)',
                [l.id, kind, position, values[position]],
              );
            }
          }
          for (const note of l.notes) {
            await tx.query('INSERT INTO rental_listing_notes (id, listing_id, at, text) VALUES ($1, $2, $3, $4)', [
              note.id, l.id, note.at, note.text,
            ]);
          }
        });
      },

      async remove(ownerUid, id) {
        await ready();
        // 聯絡方式、備註會跟著 CASCADE 刪掉；不是自己的物件就什麼都不會刪
        await sql.query('DELETE FROM rental_listings WHERE id = $1 AND owner_uid = $2', [id, ownerUid]);
      },
    },

    preferences: {
      async getTemplates(uid) {
        await ready();
        const { rows } = await sql.query<{ templates: Record<string, string> | null }>(
          'SELECT templates FROM rental_users WHERE uid = $1',
          [uid],
        );
        return rows[0]?.templates ?? null;
      },
      async saveTemplates(uid, templates) {
        await ready();
        await sql.query(
          `INSERT INTO rental_users (uid, templates, updated_at) VALUES ($1, $2, now())
           ON CONFLICT (uid) DO UPDATE SET templates = EXCLUDED.templates, updated_at = now()`,
          [uid, JSON.stringify(templates)],
        );
      },
    },

    allowlist: {
      async isAllowed(email) {
        await ready();
        const { rows } = await sql.query('SELECT 1 FROM rental_allowed_users WHERE email = $1', [email.toLowerCase()]);
        return rows.length > 0;
      },
    },

    members: {
      async listMembers(ownerUid) {
        await ready();
        const { rows } = await sql.query<{ member_email: string }>(
          'SELECT member_email FROM rental_list_members WHERE owner_uid = $1 ORDER BY member_email',
          [ownerUid],
        );
        return rows.map((r) => r.member_email);
      },
      async listOwners(memberEmail) {
        await ready();
        const { rows } = await sql.query<{ owner_uid: string; owner_email: string }>(
          'SELECT owner_uid, owner_email FROM rental_list_members WHERE member_email = $1 ORDER BY owner_email',
          [memberEmail.toLowerCase()],
        );
        return rows.map((r) => ({ uid: r.owner_uid, email: r.owner_email }));
      },
      async isMember(ownerUid, memberEmail) {
        await ready();
        const { rows } = await sql.query('SELECT 1 FROM rental_list_members WHERE owner_uid = $1 AND member_email = $2', [
          ownerUid,
          memberEmail.toLowerCase(),
        ]);
        return rows.length > 0;
      },
      async add(ownerUid, ownerEmail, memberEmail) {
        await ready();
        await sql.query(
          `INSERT INTO rental_list_members (owner_uid, owner_email, member_email) VALUES ($1, $2, $3)
           ON CONFLICT (owner_uid, member_email) DO NOTHING`,
          [ownerUid, ownerEmail.toLowerCase(), memberEmail.toLowerCase()],
        );
      },
      async remove(ownerUid, memberEmail) {
        await ready();
        await sql.query('DELETE FROM rental_list_members WHERE owner_uid = $1 AND member_email = $2', [
          ownerUid,
          memberEmail.toLowerCase(),
        ]);
      },
    },

    shareLinks: {
      async getToken(ownerUid, listingId) {
        await ready();
        const { rows } = await sql.query<{ token: string }>(
          'SELECT token FROM rental_share_links WHERE owner_uid = $1 AND listing_id = $2',
          [ownerUid, listingId],
        );
        return rows[0]?.token ?? null;
      },
      async create(ownerUid, listingId, token) {
        await ready();
        await sql.query('INSERT INTO rental_share_links (token, owner_uid, listing_id) VALUES ($1, $2, $3)', [
          token,
          ownerUid,
          listingId,
        ]);
      },
      async revoke(ownerUid, listingId) {
        await ready();
        await sql.query('DELETE FROM rental_share_links WHERE owner_uid = $1 AND listing_id = $2', [ownerUid, listingId]);
      },
      async resolve(token) {
        await ready();
        const { rows } = await sql.query<{ owner_uid: string; listing_id: string }>(
          'SELECT owner_uid, listing_id FROM rental_share_links WHERE token = $1',
          [token],
        );
        return rows[0] ? { ownerUid: rows[0].owner_uid, listingId: rows[0].listing_id } : null;
      },
    },
  };
  return repos;
}
