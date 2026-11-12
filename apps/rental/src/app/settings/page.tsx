'use client';

import { useState } from 'react';
import { useHydrated, useListings } from '../../lib/store';
import { useAuth } from '../../lib/auth';
import { usePreferences } from '../../lib/preferences';
import { PROFILE_TEMPLATE_ID, TEMPLATES, TEMPLATE_VARIABLES } from '../../lib/templates';

export default function SettingsPage() {
  const hydrated = useHydrated();
  const count = useListings((s) => s.listings.length);
  const { user, loading, configured, login, logout } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const { templates, setTemplate, resetTemplate } = usePreferences();

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="px-5 pb-2 pt-[max(20px,env(safe-area-inset-top))]">
        <h1 className="text-xl font-bold">設定</h1>
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

        <section className="card flex flex-col gap-4 p-4">
          <div className="flex flex-col gap-1">
            <h2 className="text-[15px] font-bold">偏好設定 · 私訊範本</h2>
            {/* 之後的個人偏好（例如預設來源、地圖預設位置）也都放在這一區 */}
            <p className="text-[13px] leading-relaxed text-sub">
              在物件頁的私訊選範本時會帶入這裡的內容。
              {TEMPLATE_VARIABLES.map((v) => (
                <span key={v.token} className="block">
                  <code className="rounded bg-cream px-1 text-ink">{v.token}</code> 會換成{v.description}
                </span>
              ))}
            </p>
          </div>
          {hydrated &&
            TEMPLATES.map((t) => {
              const customized = templates[t.id] != null;
              return (
                <div key={t.id} className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <label htmlFor={`template-${t.id}`} className="text-sm font-medium">
                      {t.name}
                    </label>
                    {customized && (
                      <button type="button" onClick={() => resetTemplate(t.id)} className="text-[13px] text-sub underline">
                        恢復預設
                      </button>
                    )}
                  </div>
                  {t.id === PROFILE_TEMPLATE_ID && (
                    <p className="-mt-1 text-[13px] text-sub">房仲常問的資料先填好；在物件頁改過也會記住。</p>
                  )}
                  <textarea
                    id={`template-${t.id}`}
                    value={templates[t.id] ?? t.defaultText}
                    onChange={(e) => setTemplate(t.id, e.target.value)}
                    rows={t.id === PROFILE_TEMPLATE_ID ? 16 : 5}
                    className="w-full resize-none rounded-xl bg-cream p-3 text-[15px] leading-7 outline-none focus:ring-2 focus:ring-brand"
                  />
                </div>
              );
            })}
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
