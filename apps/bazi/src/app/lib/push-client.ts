'use client';

import { useCallback, useEffect, useState } from 'react';
import { getClientLocale } from './i18n/client-locale';

/**
 * 推播通知（前端）。
 * iPhone 的限制：iOS 16.4 以上，而且要先「加入主畫面」、從主畫面圖示打開，才能開啟通知；
 * 在 Safari 分頁裡 PushManager 根本不存在。Android 和電腦版 Chrome 直接就能用。
 */

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? '';

export type PushState =
  | 'unconfigured' // 伺服器沒設定 VAPID key
  | 'needs-install' // iPhone 但還沒從主畫面打開
  | 'unsupported' // 瀏覽器不支援
  | 'denied' // 使用者拒絕過，只能到系統設定打開
  | 'off'
  | 'on';

function isIOS(): boolean {
  return /iP(hone|ad|od)/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
}

function isStandalone(): boolean {
  return (
    window.matchMedia?.('(display-mode: standalone)').matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

function pushSupported(): boolean {
  return 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
}

/** 註冊 service worker（App 一打開就做，之後開通知才拿得到 registration） */
export function registerServiceWorker() {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;
  navigator.serviceWorker.register('/sw.js').catch((error) => console.error('Service worker 註冊失敗', error));
}

async function currentSubscription(): Promise<PushSubscription | null> {
  if (!pushSupported()) return null;
  const reg = await navigator.serviceWorker.getRegistration();
  return (await reg?.pushManager.getSubscription()) ?? null;
}

async function detectState(): Promise<PushState> {
  if (!VAPID_PUBLIC_KEY) return 'unconfigured';
  if (!pushSupported()) return isIOS() && !isStandalone() ? 'needs-install' : 'unsupported';
  if (Notification.permission === 'denied') return 'denied';
  return (await currentSubscription()) ? 'on' : 'off';
}

function urlBase64ToUint8Array(base64: string): Uint8Array {
  const padding = '='.repeat((4 - (base64.length % 4)) % 4);
  const raw = atob((base64 + padding).replace(/-/g, '+').replace(/_/g, '/'));
  const out = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
  return out;
}

/** 推播開關的狀態與操作；enable／disable 要在點擊事件裡呼叫（iOS 只允許使用者操作時跳出權限詢問） */
export function usePush(getToken: () => Promise<string | null>) {
  const [state, setState] = useState<PushState | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    detectState().then(setState, () => setState('unsupported'));
  }, []);

  const enable = useCallback(async () => {
    setError(null);
    setBusy(true);
    try {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        setState(permission === 'denied' ? 'denied' : 'off');
        return;
      }
      const reg = (await navigator.serviceWorker.getRegistration()) ?? (await navigator.serviceWorker.register('/sw.js'));
      await navigator.serviceWorker.ready;
      const sub =
        (await reg.pushManager.getSubscription()) ??
        (await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
        }));
      const token = await getToken();
      if (!token) throw new Error('請先登入');
      const res = await fetch('/api/push', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ...sub.toJSON(), locale: getClientLocale() }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(data.error ?? '開啟通知失敗');
      }
      setState('on');
    } catch (e) {
      setError(e instanceof Error ? e.message : '開啟通知失敗');
    } finally {
      setBusy(false);
    }
  }, [getToken]);

  const disable = useCallback(async () => {
    setError(null);
    setBusy(true);
    try {
      const sub = await currentSubscription();
      if (sub) {
        const token = await getToken();
        if (token) {
          await fetch('/api/push', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({ endpoint: sub.endpoint }),
          }).catch(() => undefined);
        }
        await sub.unsubscribe();
      }
      setState('off');
    } catch (e) {
      setError(e instanceof Error ? e.message : '關閉通知失敗');
    } finally {
      setBusy(false);
    }
  }, [getToken]);

  return { state, busy, error, enable, disable };
}
