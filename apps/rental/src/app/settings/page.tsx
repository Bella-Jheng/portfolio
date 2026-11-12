'use client';

import { useState } from 'react';
import { useHydrated, useListings } from '../../lib/store';
import { useAuth } from '../../lib/auth';

export default function SettingsPage() {
  const hydrated = useHydrated();
  const count = useListings((s) => s.listings.length);
  const { user, loading, configured, login, logout } = useAuth();
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="px-5 pb-2 pt-[max(20px,env(safe-area-inset-top))]">
        <h1 className="text-xl font-bold">個人設定</h1>
      </header>

      <main className="flex flex-1 flex-col gap-4 px-4 pb-[calc(var(--nav-h)+24px)] pt-2">
        <section className="card flex flex-col gap-2.5 p-4">
          <h2 className="text-[15px] font-bold">帳號</h2>
          {!configured ? (
            <p className="text-sm text-sub">這個網站還沒設定 Google 登入。</p>
          ) : loading ? null : user ? (
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-[15px] font-medium">{user.displayName ?? 'Google 帳號'}</p>
                <p className="truncate text-[13px] text-sub">{user.email}</p>
              </div>
              <button type="button" onClick={logout} className="btn-outline h-10 shrink-0">
                登出
              </button>
            </div>
          ) : (
            <>
              <p className="text-sm text-sub">登入 Google 帳號後才能使用 AI 解析截圖。</p>
              <button
                type="button"
                // 直接在點擊裡呼叫登入，iOS Safari 才不會擋下 Google 登入視窗
                onClick={async () => setError(await login())}
                className="btn-dark h-11"
              >
                Google 登入
              </button>
            </>
          )}
          {error && <p role="alert" className="text-[13px] text-warn-text">{error}</p>}
        </section>

        <section className="card flex flex-col gap-1 p-4">
          <h2 className="text-[15px] font-bold">偏好設定</h2>
          {/* 之後的個人偏好（例如預設來源、預設私訊範本、地圖預設位置）都放在這一區 */}
          <p className="text-sm text-sub">之後的個人偏好設定會放在這裡。</p>
        </section>

        <section className="card flex flex-col gap-1 p-4">
          <h2 className="text-[15px] font-bold">資料</h2>
          <p className="text-sm text-sub">
            {hydrated ? `這台裝置上有 ${count} 間物件。` : ''}資料只存在這台裝置的瀏覽器，換手機或清除瀏覽器資料就會不見。
          </p>
        </section>
      </main>
    </div>
  );
}
