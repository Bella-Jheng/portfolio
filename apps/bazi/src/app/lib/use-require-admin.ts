'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './auth-context';

// 管理員專用頁面的權限守衛：未登入或非管理員一律導回首頁（首頁本身會再依 readingId 決定要不要進一步導到 /form 或 /result）。
// 呼叫端務必把這個 hook 放在元件最上面、所有其他 hooks 之前呼叫，並在自身的 hooks 呼叫完後才依 checking/authorized 提前 return，
// 避免 hooks 呼叫順序因為提前 return 而在不同 render 之間改變。
export function useRequireAdmin() {
  const { user, isAdmin, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user || !isAdmin) router.replace('/');
  }, [user, isAdmin, loading, router]);

  return {
    authorized: !loading && !!user && isAdmin,
    checking: loading,
  };
}
