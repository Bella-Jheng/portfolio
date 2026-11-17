import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { getSharedListing, shareDescription } from '../../../lib/share';
import { SharedListingView } from './SharedListingView';

type Props = { params: Promise<{ token: string }> };

/**
 * LINE、FB、Messenger 貼連結時會讀這頁的 Open Graph，顯示標題、說明和縮圖。
 * 爬蟲不會執行 JavaScript，所以這些 meta 一定要在伺服器端產生（畫面本身仍由 SharedListingView 在前端載入）。
 * 縮圖網址指向同一資料夾的 og 路由：有首圖用首圖，沒有就用截圖縮圖，再沒有就用預設圖。
 */
/** 縮圖網址要是完整網址；用這次請求的網域，正式站、Preview、自訂網域都對得上 */
async function requestOrigin(): Promise<URL | undefined> {
  const h = await headers();
  const host = h.get('x-forwarded-host') ?? h.get('host');
  if (!host) return undefined;
  const proto = h.get('x-forwarded-proto')?.split(',')[0] ?? (host.startsWith('localhost') ? 'http' : 'https');
  try {
    return new URL(`${proto}://${host}`);
  } catch {
    return undefined;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { token } = await params;
  const metadataBase = await requestOrigin();
  const listing = await getSharedListing(token).catch(() => null);
  const image = `/share/${encodeURIComponent(token)}/og`;

  if (!listing) {
    return {
      metadataBase,
      title: '租屋小幫手',
      description: '這個分享連結已失效',
      openGraph: { title: '租屋小幫手', description: '這個分享連結已失效', images: ['/og-share.png'] },
    };
  }

  const title = listing.title || '租屋物件';
  const description = shareDescription(listing);
  return {
    metadataBase,
    title: `${title}｜租屋小幫手`,
    description,
    openGraph: {
      type: 'website',
      siteName: '租屋小幫手',
      locale: 'zh_TW',
      title,
      description,
      images: [{ url: image, alt: title }],
    },
    twitter: { card: 'summary_large_image', title, description, images: [image] },
  };
}

export default function SharedListingPage() {
  return <SharedListingView />;
}
