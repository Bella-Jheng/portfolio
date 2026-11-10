import { describe, it, expect, vi, beforeEach } from 'vitest';

const verifyIdTokenMock = vi.fn();
vi.mock('./firebase', () => ({
  getAdminAuth: () => ({ verifyIdToken: verifyIdTokenMock }),
}));

import { verifyIdToken } from './verify-id-token';
import { SESSION_MAX_AGE_MS, getSessionRemainingMs } from './session';

const HOUR_MS = 60 * 60 * 1000;
const authTimeHoursAgo = (hours: number) => Math.floor((Date.now() - hours * HOUR_MS) / 1000);

describe('getSessionRemainingMs', () => {
  it('登入 47 小時後還有 1 小時', () => {
    const now = Date.UTC(2026, 0, 3);
    expect(getSessionRemainingMs(now - 47 * HOUR_MS, now)).toBe(HOUR_MS);
  });

  it('剛好 48 小時就到期', () => {
    const now = Date.UTC(2026, 0, 3);
    expect(getSessionRemainingMs(now - SESSION_MAX_AGE_MS, now)).toBe(0);
  });
});

describe('verifyIdToken 48 小時登入時限', () => {
  beforeEach(() => {
    verifyIdTokenMock.mockReset();
  });

  it('登入未滿 48 小時，回傳解碼後的 token', async () => {
    verifyIdTokenMock.mockResolvedValue({ uid: 'user-1', auth_time: authTimeHoursAgo(47) });
    await expect(verifyIdToken('token')).resolves.toMatchObject({ uid: 'user-1' });
  });

  it('登入超過 48 小時，即使 token 本身有效也拒絕', async () => {
    verifyIdTokenMock.mockResolvedValue({ uid: 'user-1', auth_time: authTimeHoursAgo(49) });
    await expect(verifyIdToken('token')).rejects.toThrow('Session expired');
  });

  it('token 無效時照樣拋出錯誤', async () => {
    verifyIdTokenMock.mockImplementation(async () => {
      throw new Error('invalid token');
    });
    await expect(verifyIdToken('token')).rejects.toThrow('invalid token');
  });
});
