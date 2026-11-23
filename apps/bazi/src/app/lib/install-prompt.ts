'use client';

import { useEffect, useState } from 'react';

/** Android Chrome 會在可以安裝時發 beforeinstallprompt；先攔下來，等使用者按「加到主畫面」再跳出 */
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

let deferred: BeforeInstallPromptEvent | null = null;
const listeners = new Set<() => void>();

export function listenForInstallPrompt() {
  if (typeof window === 'undefined') return;
  window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault();
    deferred = event as BeforeInstallPromptEvent;
    listeners.forEach((fn) => fn());
  });
  window.addEventListener('appinstalled', () => {
    deferred = null;
    listeners.forEach((fn) => fn());
  });
}

export type InstallPlatform = 'installed' | 'ios' | 'android-prompt' | 'other';

function detectPlatform(): InstallPlatform {
  const standalone =
    window.matchMedia?.('(display-mode: standalone)').matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true;
  if (standalone) return 'installed';
  const ios = /iP(hone|ad|od)/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  if (ios) return 'ios';
  return deferred ? 'android-prompt' : 'other';
}

/** 目前裝置該怎麼加到主畫面：已安裝、iPhone 教學、Android 一鍵安裝，或其他瀏覽器的一般說明 */
export function useInstallPrompt() {
  const [platform, setPlatform] = useState<InstallPlatform | null>(null);

  useEffect(() => {
    const update = () => setPlatform(detectPlatform());
    update();
    listeners.add(update);
    return () => {
      listeners.delete(update);
    };
  }, []);

  const install = async () => {
    if (!deferred) return false;
    await deferred.prompt();
    const { outcome } = await deferred.userChoice;
    deferred = null;
    setPlatform(detectPlatform());
    return outcome === 'accepted';
  };

  return { platform, install };
}
