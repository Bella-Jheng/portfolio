import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

// 用一般函式代替 vi.fn：vi.fn 的回傳值是被拒絕的 promise 時，vitest 會把它算成測試錯誤
type Lookup = (token: string) => Promise<unknown>;
const holder: { impl: Lookup } = { impl: async () => null };
const getSharedListing = {
  mockReset: () => (holder.impl = async () => null),
  mockResolvedValue: (v: unknown) => (holder.impl = async () => v),
  mockRejectedValue: (e: Error) => (holder.impl = async () => Promise.reject(e)),
};
vi.mock('../../../../lib/share', () => ({ getSharedListing: (t: string) => holder.impl(t) }));

const { GET } = await import('./route');

const TOKEN = 'abcdefghijklmnop1234';
const call = () =>
  GET(new NextRequest(`https://rent.example.com/share/${TOKEN}/og`), { params: Promise.resolve({ token: TOKEN }) });

describe('分享預覽縮圖 /share/[token]/og', () => {
  beforeEach(() => getSharedListing.mockReset());

  it('首圖是 data URL：直接回傳圖片', async () => {
    const bytes = Buffer.from('jpeg-bytes');
    getSharedListing.mockResolvedValue({ coverImage: `data:image/jpeg;base64,${bytes.toString('base64')}` });
    const res = await call();
    expect(res.status).toBe(200);
    expect(res.headers.get('content-type')).toBe('image/jpeg');
    expect(Buffer.from(await res.arrayBuffer()).toString()).toBe('jpeg-bytes');
  });

  it('沒有首圖時用截圖縮圖', async () => {
    getSharedListing.mockResolvedValue({ thumbnail: `data:image/png;base64,${Buffer.from('png').toString('base64')}` });
    const res = await call();
    expect(res.headers.get('content-type')).toBe('image/png');
  });

  it('照片在 Firebase Storage：轉址過去', async () => {
    const url = 'https://firebasestorage.googleapis.com/v0/b/demo.firebasestorage.app/o/rental%2Fa.jpg?alt=media&token=t';
    getSharedListing.mockResolvedValue({ coverImage: url });
    const res = await call();
    expect(res.status).toBe(302);
    expect(res.headers.get('location')).toBe(url);
  });

  it('其他網站的網址不轉址，改用預設圖', async () => {
    getSharedListing.mockResolvedValue({ coverImage: 'https://evil.example.com/x.jpg' });
    const res = await call();
    expect(res.headers.get('location')).toBe('https://rent.example.com/og-share.png');
  });

  it('沒有照片或連結失效：預設圖', async () => {
    getSharedListing.mockResolvedValue({});
    expect((await call()).headers.get('location')).toBe('https://rent.example.com/og-share.png');
    getSharedListing.mockResolvedValue(null);
    expect((await call()).headers.get('location')).toBe('https://rent.example.com/og-share.png');
  });

  it('讀取失敗也回預設圖，不要讓預覽壞掉', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    getSharedListing.mockRejectedValue(new Error('db down'));
    expect((await call()).headers.get('location')).toBe('https://rent.example.com/og-share.png');
  });
});
