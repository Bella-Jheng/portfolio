import { beforeEach, describe, expect, it, vi } from 'vitest';

const save = vi.fn().mockResolvedValue(undefined);
const deleteFiles = vi.fn().mockResolvedValue(undefined);
const file = vi.fn(() => ({ save }));
const bucket = vi.fn(() => ({ file, deleteFiles }));

vi.mock('firebase-admin/storage', () => ({ getStorage: () => ({ bucket }) }));
vi.mock('./firebase-admin', () => ({ getAdminApp: () => ({}) }));

const { uploadPhoto, deleteListingPhotos, PhotoError } = await import('./photo-storage');

const JPEG = `data:image/jpeg;base64,${Buffer.from('fake-jpeg-bytes').toString('base64')}`;

describe('uploadPhoto', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.FIREBASE_PROJECT_ID = 'demo-project';
    delete process.env.FIREBASE_STORAGE_BUCKET;
  });

  it('存到 rental/{uid}/{listingId}/ 並回傳帶 token 的下載網址', async () => {
    const url = await uploadPhoto('user-1', 'listing-1', JPEG);

    expect(bucket).toHaveBeenCalledWith('demo-project.firebasestorage.app');
    const path = (file.mock.calls[0] as unknown as [string])[0];
    expect(path).toMatch(/^rental\/user-1\/listing-1\/[0-9a-f-]+\.jpg$/);

    const [bytes, options] = save.mock.calls[0];
    expect(Buffer.from(bytes).toString()).toBe('fake-jpeg-bytes');
    expect(options.contentType).toBe('image/jpeg');
    const token = options.metadata.metadata.firebaseStorageDownloadTokens;
    expect(url).toBe(
      `https://firebasestorage.googleapis.com/v0/b/demo-project.firebasestorage.app/o/${encodeURIComponent(path)}?alt=media&token=${token}`,
    );
  });

  it('有設定 FIREBASE_STORAGE_BUCKET 時用指定的 bucket', async () => {
    process.env.FIREBASE_STORAGE_BUCKET = 'demo-project.appspot.com';
    await uploadPhoto('u', 'l', JPEG);
    expect(bucket).toHaveBeenCalledWith('demo-project.appspot.com');
  });

  it('路徑裡的 uid、物件 id 只留安全字元，不能跳到別的資料夾', async () => {
    await uploadPhoto('../other', 'a/../b', JPEG);
    const path = (file.mock.calls[0] as unknown as [string])[0];
    expect(path).toMatch(/^rental\/other\/ab\/[0-9a-f-]+\.jpg$/);
  });

  it('拒絕不是圖片的 data URL', async () => {
    await expect(uploadPhoto('u', 'l', 'data:text/html;base64,PGgxPg==')).rejects.toBeInstanceOf(PhotoError);
    await expect(uploadPhoto('u', 'l', 'https://example.com/a.jpg')).rejects.toMatchObject({ status: 400 });
    expect(save).not.toHaveBeenCalled();
  });

  it('拒絕太大的照片', async () => {
    const big = `data:image/jpeg;base64,${Buffer.alloc(2_100_000).toString('base64')}`;
    await expect(uploadPhoto('u', 'l', big)).rejects.toMatchObject({ status: 413 });
  });
});

describe('deleteListingPhotos', () => {
  it('只刪這個帳號、這間物件的資料夾', async () => {
    process.env.FIREBASE_PROJECT_ID = 'demo-project';
    await deleteListingPhotos('user-1', 'listing-1');
    expect(deleteFiles).toHaveBeenCalledWith({ prefix: 'rental/user-1/listing-1/' });
  });
});
