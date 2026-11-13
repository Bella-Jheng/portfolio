import { describe, expect, it } from 'vitest';
import { isValidListing } from './validate';
import { emptyListing } from '../store';

describe('isValidListing', () => {
  it('前端建立的物件是合法的', () => {
    expect(isValidListing(emptyListing({ title: '測試', rent: 9000 }))).toBe(true);
  });

  it('擋下不合法的狀態、來源、欄位型別', () => {
    expect(isValidListing({ ...emptyListing(), status: 'favorite' })).toBe(false);
    expect(isValidListing({ ...emptyListing(), source: 'twitter' })).toBe(false);
    expect(isValidListing({ ...emptyListing(), phones: 'not-an-array' })).toBe(false);
    expect(isValidListing({ ...emptyListing(), rent: 9.5 })).toBe(false);
    expect(isValidListing({ ...emptyListing(), notes: [{ id: 'n', text: 'no date' }] })).toBe(false);
    expect(isValidListing(null)).toBe(false);
  });
});
