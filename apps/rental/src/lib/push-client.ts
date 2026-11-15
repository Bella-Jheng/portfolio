'use client';

import { cloudApi } from './cloud-sync';

/** 前端的推播設定：註冊 Service Worker、跟瀏覽器要通知權限、把訂閱交給伺服器 */
const PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? '';

export type PushSupport = 'supported' | 'needs-home-screen' | 'unsupported' | 'not-configured';

/** iPhone／iPad 要先「加入主畫面」，從主畫面打開才能收推播 */
export function getPushSupport(): PushSupport {
  if (typeof window === 'undefined') return 'unsupported';
  if (!PUBLIC_KEY) return 'not-configured';
  const ios = /iPhone|iPad|iPod/.test(navigator.userAgent);
  const standalone =
    window.matchMedia('(display-mode: standalone)').matches || (navigator as { standalone?: boolean }).standalone === true;
  if (ios && !standalone) return 'needs-home-screen';
  if (!('serviceWorker' in navigator) || !('PushManager' in window) || !('Notification' in window)) return 'unsupported';
  return 'supported';
}

function urlBase64ToUint8Array(base64: string): Uint8Array {
  const padded = (base64 + '='.repeat((4 - (base64.length % 4)) % 4)).replace(/-/g, '+').replace(/_/g, '/');
  const raw = atob(padded);
  return Uint8Array.from(raw, (c) => c.charCodeAt(0));
}

async function registration() {
  return navigator.serviceWorker.register('/sw.js');
}

/** 這台裝置目前有沒有開啟推播 */
export async function getCurrentSubscription(): Promise<PushSubscription | null> {
  if (getPushSupport() !== 'supported') return null;
  const reg = await navigator.serviceWorker.getRegistration('/sw.js');
  return reg ? reg.pushManager.getSubscription() : null;
}

/** 開啟：一定要在使用者點按鈕時呼叫（瀏覽器規定要使用者操作才能要權限） */
export async function enablePush(): Promise<void> {
  const permission = await Notification.requestPermission();
  if (permission !== 'granted') throw new Error('沒有取得通知權限，請到手機或瀏覽器的設定允許這個網站的通知');
  const reg = await registration();
  await navigator.serviceWorker.ready;
  const subscription =
    (await reg.pushManager.getSubscription()) ??
    (await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(PUBLIC_KEY) as BufferSource,
    }));
  await cloudApi('/api/push/subscribe', { method: 'POST', body: JSON.stringify(subscription.toJSON()) });
}

export async function disablePush(): Promise<void> {
  const subscription = await getCurrentSubscription();
  if (!subscription) return;
  await cloudApi('/api/push/subscribe', { method: 'DELETE', body: JSON.stringify({ endpoint: subscription.endpoint }) });
  await subscription.unsubscribe();
}
