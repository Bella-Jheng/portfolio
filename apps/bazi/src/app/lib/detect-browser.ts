// Layer 1: Known in-app browser UA tokens.
// These apps inject their identifier into the UA string.
const IN_APP_TOKEN_RE =
  /Line\/|FBAN|FBAV|Instagram|MicroMessenger|Twitter\/|TikTok|Snapchat|Discord\/|Slack\/|WhatsApp|Telegram\/|Pinterest\/|Reddit\/|LinkedInApp|Threads\/|YahooMobile|Naver\/|Kakaotalk/i;

// Layer 2: Clean standard mobile browser signatures.
// Standard browsers end their UA at a predictable token; in-app browsers append extra identifiers.
// Matches: Chrome/Android, Chrome/iOS (CriOS), Safari/iOS, Firefox/Android, Samsung Internet, Edge/Android.
const CLEAN_MOBILE_BROWSER_RE =
  /(?:Chrome|CriOS)\/[\d.]+ (?:Mobile )?Safari\/[\d.]+$|Version\/[\d.]+ Mobile(?:\/\w+)? Safari\/[\d.]+$|Firefox\/[\d.]+$|SamsungBrowser\/[\d.]+|EdgA\/[\d.]+/;

const MOBILE_RE = /Android|iPhone|iPad|iPod/i;

export function isInAppBrowser(): boolean {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent;

  // Fast path: known app token present
  if (IN_APP_TOKEN_RE.test(ua)) return true;

  // Fallback: mobile UA that doesn't end like a clean standard browser
  return MOBILE_RE.test(ua) && !CLEAN_MOBILE_BROWSER_RE.test(ua);
}

export function isLineBrowser(): boolean {
  if (typeof navigator === 'undefined') return false;
  return /Line\//i.test(navigator.userAgent);
}

export function openInExternalBrowser(): void {
  const url = window.location.href;
  const ua = navigator.userAgent;

  if (/Line\//i.test(ua)) {
    const sep = url.includes('?') ? '&' : '?';
    window.location.href = `${url}${sep}openExternalBrowser=1`;
    return;
  }

}
