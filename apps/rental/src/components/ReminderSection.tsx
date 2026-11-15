'use client';

import { useCallback, useEffect, useState } from 'react';
import clsx from 'clsx';
import { useAuth } from '../lib/auth';
import { cloudApi, useSyncStatus } from '../lib/cloud-sync';
import { disablePush, enablePush, getCurrentSubscription, getPushSupport, type PushSupport } from '../lib/push-client';
import { MAX_OFFSETS, MAX_OFFSET_MINUTES, formatOffset } from '../lib/reminders';
import { CloseIcon } from './icons';

const PRESETS = [1440, 180, 120, 60, 30, 15];

/** 設定頁的「看房提醒」：這台裝置要不要收推播、要提前多久提醒 */
export function ReminderSection() {
  const { user } = useAuth();
  const sync = useSyncStatus();
  const ready = !!user && sync.status === 'synced';
  const [support, setSupport] = useState<PushSupport>('unsupported');
  const [enabled, setEnabled] = useState(false);
  const [offsets, setOffsets] = useState<number[] | null>(null);
  const [custom, setCustom] = useState({ value: '', unit: 'minute' as 'minute' | 'hour' });
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    setSupport(getPushSupport());
    getCurrentSubscription().then((s) => setEnabled(!!s));
  }, []);

  useEffect(() => {
    if (!ready) return;
    cloudApi<{ offsets: number[] }>('/api/reminders/settings')
      .then((r) => setOffsets(r.offsets))
      .catch(() => setOffsets(null));
  }, [ready]);

  const run = useCallback(async (task: () => Promise<void>, done?: string) => {
    setBusy(true);
    setMessage(null);
    try {
      await task();
      if (done) setMessage(done);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : '操作失敗，請稍後再試');
    } finally {
      setBusy(false);
    }
  }, []);

  const saveOffsets = (next: number[]) =>
    run(async () => {
      const r = await cloudApi<{ offsets: number[] }>('/api/reminders/settings', {
        method: 'PUT',
        body: JSON.stringify({ offsets: next }),
      });
      setOffsets(r.offsets);
    });

  const toggleOffset = (minutes: number) => {
    if (!offsets) return;
    if (offsets.includes(minutes)) saveOffsets(offsets.filter((o) => o !== minutes));
    else if (offsets.length >= MAX_OFFSETS) setMessage(`最多設定 ${MAX_OFFSETS} 個提醒`);
    else saveOffsets([...offsets, minutes]);
  };

  const addCustom = () => {
    const n = Number(custom.value);
    const minutes = custom.unit === 'hour' ? Math.round(n * 60) : Math.round(n);
    if (!Number.isFinite(minutes) || minutes < 1 || minutes > MAX_OFFSET_MINUTES) {
      setMessage('請輸入 1 分鐘到 7 天之間的時間');
      return;
    }
    if (offsets?.includes(minutes)) return;
    toggleOffset(minutes);
    setCustom({ ...custom, value: '' });
  };

  return (
    <section className="card flex flex-col gap-3 p-4">
      <div>
        <h2 className="text-[15px] font-bold">看房提醒</h2>
        <p className="text-[13px] leading-relaxed text-sub">預約看房前，用推播通知提醒你出門。</p>
      </div>

      {!ready ? (
        <p className="text-sm text-sub">登入並同步到雲端後才能設定提醒。</p>
      ) : (
        <>
          {/* 這台裝置的推播 */}
          {support === 'needs-home-screen' && (
            <p className="rounded-xl border border-line p-3 text-[13px] leading-relaxed text-sub">
              iPhone 要先把網站<b className="text-ink">加入主畫面</b>才能收通知：Safari 下方的「分享」→「加入主畫面」，
              再從主畫面的圖示打開，回到這裡開啟。
            </p>
          )}
          {support === 'unsupported' && <p className="text-sm text-sub">這個瀏覽器不支援推播通知。</p>}
          {support === 'not-configured' && <p className="text-sm text-sub">網站還沒設定推播金鑰，暫時不能開啟。</p>}
          {support === 'supported' && (
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[15px] font-medium">這台裝置接收通知</p>
                <p className="text-[13px] text-sub">{enabled ? '已開啟' : '還沒開啟'}</p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={enabled}
                aria-label="這台裝置接收通知"
                disabled={busy}
                onClick={() =>
                  run(async () => {
                    if (enabled) await disablePush();
                    else await enablePush();
                    setEnabled(!enabled);
                  }, enabled ? '已關閉這台裝置的通知' : '已開啟通知')
                }
                className={clsx('relative h-8 w-[52px] shrink-0 rounded-full transition-colors', enabled ? 'bg-brand' : 'bg-[#CFCFCF]')}
              >
                <span className={clsx('absolute top-1 h-6 w-6 rounded-full bg-white transition-all', enabled ? 'right-1' : 'left-1')} />
              </button>
            </div>
          )}

          {/* 提前多久提醒（所有裝置共用） */}
          {offsets && (
            <div className="flex flex-col gap-2">
              <p className="text-[15px] font-medium">提前多久提醒</p>
              <div className="flex flex-wrap gap-2">
                {[...new Set([...PRESETS, ...offsets])]
                  .sort((a, b) => b - a)
                  .map((minutes) => {
                    const on = offsets.includes(minutes);
                    return (
                      <button
                        key={minutes}
                        type="button"
                        aria-pressed={on}
                        disabled={busy}
                        onClick={() => toggleOffset(minutes)}
                        className={clsx(
                          'flex h-9 items-center gap-1 rounded-full px-3.5 text-sm transition active:scale-95',
                          on ? 'bg-ink text-white' : 'border border-line bg-white',
                        )}
                      >
                        前 {formatOffset(minutes)}
                        {on && !PRESETS.includes(minutes) && <CloseIcon size={14} />}
                      </button>
                    );
                  })}
              </div>
              <form
                className="flex items-center gap-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  addCustom();
                }}
              >
                <span className="shrink-0 text-sm text-sub">自訂：前</span>
                <input
                  type="number"
                  inputMode="decimal"
                  min={1}
                  value={custom.value}
                  onChange={(e) => setCustom({ ...custom, value: e.target.value })}
                  aria-label="自訂提前時間"
                  className="field-input w-20 bg-cream"
                />
                <select
                  value={custom.unit}
                  onChange={(e) => setCustom({ ...custom, unit: e.target.value as 'minute' | 'hour' })}
                  aria-label="時間單位"
                  className="field-input w-24 bg-cream"
                >
                  <option value="minute">分鐘</option>
                  <option value="hour">小時</option>
                </select>
                <button type="submit" disabled={busy || !custom.value} className="btn-outline h-11 shrink-0">
                  加入
                </button>
              </form>
              <p className="text-xs text-sub">
                {offsets.length === 0 ? '目前不會提醒。' : `會在看房前 ${offsets.map(formatOffset).join('、')} 各提醒一次。`}
                提醒會送到所有開啟通知的裝置。
              </p>
            </div>
          )}

          {support === 'supported' && enabled && (
            <button
              type="button"
              disabled={busy}
              onClick={() => run(() => cloudApi('/api/push/test', { method: 'POST' }).then(() => undefined), '已送出測試通知')}
              className="btn-outline self-start"
            >
              送一則測試通知
            </button>
          )}
        </>
      )}

      {message && (
        <p role="status" className="animate-fade-in text-[13px] text-brand">
          {message}
        </p>
      )}
    </section>
  );
}
