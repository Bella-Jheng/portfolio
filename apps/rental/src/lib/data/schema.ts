/**
 * PostgreSQL 資料表（正規化）：
 * - rental_allowed_users     白名單
 * - rental_users             使用者偏好（私訊範本存成 JSONB）
 * - rental_listings          物件主表，一列一間，用 owner_uid 區分是誰的
 * - rental_listing_contacts  電話／LINE／IG，一個聯絡方式一列（position 保留順序）
 * - rental_listing_notes     備註，一則一列
 * - rental_list_members      一起找房：擁有者邀請的成員（email）
 * - rental_share_links       單一物件的分享連結（token），物件刪掉時一起刪
 * 子表都 ON DELETE CASCADE，刪物件時一起刪掉。全部用 IF NOT EXISTS，重跑也安全。
 */
export const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS rental_allowed_users (
  email      TEXT PRIMARY KEY,
  name       TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS rental_users (
  uid        TEXT PRIMARY KEY,
  templates  JSONB,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS rental_listings (
  id           TEXT PRIMARY KEY,
  owner_uid    TEXT NOT NULL,
  created_at   TIMESTAMPTZ NOT NULL,
  updated_at   TIMESTAMPTZ NOT NULL,
  status       TEXT NOT NULL CHECK (status IN ('not_contacted', 'contacted', 'viewed', 'rented')),
  favorite     BOOLEAN NOT NULL DEFAULT false,
  source       TEXT NOT NULL CHECK (source IN ('591', 'fb', 'ig', 'other')),
  source_url   TEXT NOT NULL DEFAULT '',
  title        TEXT NOT NULL DEFAULT '',
  address      TEXT NOT NULL DEFAULT '',
  lat          DOUBLE PRECISION,
  lng          DOUBLE PRECISION,
  rent         INTEGER,
  layout       TEXT NOT NULL DEFAULT '',
  size         TEXT NOT NULL DEFAULT '',
  floor        TEXT NOT NULL DEFAULT '',
  fees         TEXT NOT NULL DEFAULT '',
  pets         TEXT NOT NULL DEFAULT '',
  listing_no   TEXT NOT NULL DEFAULT '',
  contact_name TEXT NOT NULL DEFAULT '',
  contact_role TEXT NOT NULL DEFAULT '',
  thumbnail    TEXT,
  cover_image  TEXT,
  uncertain    TEXT[] NOT NULL DEFAULT '{}'
);
CREATE INDEX IF NOT EXISTS rental_listings_owner_created_idx ON rental_listings (owner_uid, created_at DESC);
-- 後來加的欄位：已經建好的資料表用 ADD COLUMN IF NOT EXISTS 補上
ALTER TABLE rental_listings ADD COLUMN IF NOT EXISTS viewing_at TIMESTAMPTZ;

CREATE TABLE IF NOT EXISTS rental_listing_contacts (
  listing_id TEXT NOT NULL REFERENCES rental_listings (id) ON DELETE CASCADE,
  kind       TEXT NOT NULL CHECK (kind IN ('phone', 'line', 'ig')),
  position   INTEGER NOT NULL,
  value      TEXT NOT NULL,
  PRIMARY KEY (listing_id, kind, position)
);

CREATE TABLE IF NOT EXISTS rental_listing_notes (
  listing_id TEXT NOT NULL REFERENCES rental_listings (id) ON DELETE CASCADE,
  id         TEXT NOT NULL,
  at         TIMESTAMPTZ NOT NULL,
  text       TEXT NOT NULL,
  -- 備註 id 只保證在同一間物件裡不重複
  PRIMARY KEY (listing_id, id)
);
CREATE INDEX IF NOT EXISTS rental_listing_notes_listing_idx ON rental_listing_notes (listing_id, at DESC);

CREATE TABLE IF NOT EXISTS rental_list_members (
  owner_uid    TEXT NOT NULL,
  owner_email  TEXT NOT NULL,
  member_email TEXT NOT NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (owner_uid, member_email)
);
CREATE INDEX IF NOT EXISTS rental_list_members_member_idx ON rental_list_members (member_email);

CREATE TABLE IF NOT EXISTS rental_share_links (
  token      TEXT PRIMARY KEY,
  owner_uid  TEXT NOT NULL,
  listing_id TEXT NOT NULL UNIQUE REFERENCES rental_listings (id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
`;
