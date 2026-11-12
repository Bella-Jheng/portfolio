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

/** 首圖（房子照片）：縮到最長邊 1024、品質 0.78，控制在約 100–200KB，避免塞爆 localStorage */
export async function resizeCoverImage(file: Blob): Promise<string> {
  const { dataUrl } = await resizeImage(file, 1024, 0.78);
  return dataUrl;
}
