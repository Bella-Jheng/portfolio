/** 把圖片縮到最長邊 maxSide 以內，轉成 JPEG，回傳 base64（不含 data: 前綴） */
export async function resizeImage(
  file: Blob,
  maxSide: number,
  quality = 0.82,
): Promise<{ base64: string; dataUrl: string; mimeType: 'image/jpeg' }> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('瀏覽器不支援 canvas');
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  const dataUrl = canvas.toDataURL('image/jpeg', quality);
  return { dataUrl, base64: dataUrl.split(',')[1] ?? '', mimeType: 'image/jpeg' };
}

/** 首圖（房子照片）：縮到最長邊 1024、品質 0.78，控制在約 100–200KB（存在 IndexedDB，也會同步到雲端） */
export async function resizeCoverImage(file: Blob): Promise<string> {
  const { dataUrl } = await resizeImage(file, 1024, 0.78);
  return dataUrl;
}

// Vercel 的 Serverless Function 請求上限約 4.5MB；超過時連線會直接被切斷，iOS 只會顯示「Load failed」
const MAX_UPLOAD_CHARS = 3_500_000;
const UPLOAD_STEPS: [maxSide: number, quality: number][] = [
  [1600, 0.82],
  [1280, 0.75],
  [1024, 0.7],
];

/** 把要給 AI 解析的截圖縮到合起來不超過上傳上限：先用清楚的設定，太大再逐步縮小 */
export async function resizeForUpload(files: Blob[]) {
  let images: Awaited<ReturnType<typeof resizeImage>>[] = [];
  for (const [maxSide, quality] of UPLOAD_STEPS) {
    images = await Promise.all(files.map((f) => resizeImage(f, maxSide, quality)));
    const total = images.reduce((sum, img) => sum + img.base64.length, 0);
    if (total <= MAX_UPLOAD_CHARS) return images;
  }
  return images;
}
