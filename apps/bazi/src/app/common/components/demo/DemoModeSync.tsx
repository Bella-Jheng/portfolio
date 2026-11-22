'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '../../../lib/auth-context';
import { isDemoUrl } from '../../../lib/demo/demo-url';

/**
 * 每次換頁都檢查一次：還在訪客體驗（匿名帳號）但網址上已經沒有 ?demo=1，
 * 代表使用者把 demo=1 拿掉了，就結束體驗、回到正式模式的首頁。
 * 站內連結都會帶著 demo=1，所以正常瀏覽不會被誤判。
 */
export function DemoModeSync() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading, logout } = useAuth();

  useEffect(() => {
    if (loading || !user?.isAnonymous || isDemoUrl()) return;
    void logout().then(() => router.replace('/'));
  }, [pathname, user, loading, logout, router]);

  return null;
}
