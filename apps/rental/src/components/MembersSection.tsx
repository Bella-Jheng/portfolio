'use client';

import { useCallback, useEffect, useState } from 'react';
import { cloudApi, resyncCloud, useSyncStatus } from '../lib/cloud-sync';
import { useAuth } from '../lib/auth';
import { TrashIcon } from './icons';

type MembersResponse = { members: string[]; owners: { uid: string; email: string }[] };

/** 設定頁的「一起找房」：邀請別人共用我的清單、離開別人共用給我的清單 */
export function MembersSection() {
  const { user } = useAuth();
  const sync = useSyncStatus();
  const [data, setData] = useState<MembersResponse | null>(null);
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const ready = !!user && sync.status !== 'off' && sync.status !== 'error';

  const load = useCallback(async () => {
    try {
      setData(await cloudApi<MembersResponse>('/api/members'));
    } catch (error) {
      setMessage(error instanceof Error ? error.message : '讀取失敗');
    }
  }, []);

  useEffect(() => {
    if (ready) load();
  }, [ready, load]);

  const run = async (task: () => Promise<unknown>, done: string, reloadListings = false) => {
    setBusy(true);
    setMessage(null);
    try {
      await task();
      await load();
      if (reloadListings) await resyncCloud();
      setMessage(done);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : '操作失敗，請稍後再試');
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="card flex flex-col gap-3 p-4">
      <div>
        <h2 className="text-[15px] font-bold">一起找房</h2>
        <p className="text-[13px] leading-relaxed text-sub">
          邀請的人可以看到、修改你的物件（不能刪除）。對方也要在白名單裡才能登入使用。
        </p>
      </div>
      {!ready ? (
        <p className="text-sm text-sub">登入並同步到雲端後才能邀請。</p>
      ) : (
        <>
          <form
            className="flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              run(() => cloudApi('/api/members', { method: 'POST', body: JSON.stringify({ email }) }), '已邀請').then(() =>
                setEmail(''),
              );
            }}
          >
            <label htmlFor="invite-email" className="sr-only">
              對方的 Google email
            </label>
            <input
              id="invite-email"
              type="email"
              inputMode="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="對方的 Google email"
              className="field-input min-w-0 flex-1 bg-cream"
            />
            <button type="submit" disabled={busy || !email.trim()} className="btn-primary h-11 shrink-0">
              邀請
            </button>
          </form>

          {data && data.members.length > 0 && (
            <ul className="flex flex-col">
              {data.members.map((m) => (
                <li key={m} className="flex items-center justify-between border-b border-[#F2F2F2] py-1 last:border-b-0">
                  <span className="truncate text-sm">{m}</span>
                  <button
                    type="button"
                    disabled={busy}
                    aria-label={`取消共用給 ${m}`}
                    onClick={() => run(() => cloudApi(`/api/members?email=${encodeURIComponent(m)}`, { method: 'DELETE' }), '已取消共用')}
                    className="flex h-10 w-10 items-center justify-center text-sub"
                  >
                    <TrashIcon size={16} />
                  </button>
                </li>
              ))}
            </ul>
          )}

          {data && data.owners.length > 0 && (
            <div className="flex flex-col gap-1">
              <p className="text-sm font-medium">共用給我的清單</p>
              {data.owners.map((o) => (
                <div key={o.uid} className="flex items-center justify-between">
                  <span className="truncate text-sm">{o.email}</span>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() =>
                      run(() => cloudApi(`/api/members?owner=${encodeURIComponent(o.uid)}`, { method: 'DELETE' }), '已離開', true)
                    }
                    className="text-sm text-sub underline"
                  >
                    離開
                  </button>
                </div>
              ))}
            </div>
          )}
        </>
      )}
      {message && (
        <p role="status" className="text-[13px] text-brand">
          {message}
        </p>
      )}
    </section>
  );
}
