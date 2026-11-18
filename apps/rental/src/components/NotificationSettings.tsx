'use client';

import { useAuth } from '../lib/auth';
import { usePush } from '../lib/push-client';

/** 設定頁的「通知」區塊；compact 版放在新增頁，解析時順手開啟 */
export function NotificationSettings({ compact = false }: { compact?: boolean }) {
  const { user, getToken } = useAuth();
  const { state, busy, error, enable, disable } = usePush(getToken);

  if (!user || state === null || state === 'unconfigured') return null;
  // 新增頁只在「還沒開、可以開」時提醒，其他情況不打擾
  if (compact && state !== 'off' && state !== 'needs-install') return null;

  const hint =
    state === 'needs-install'
      ? 'iPhone 要先把這個網站「加入主畫面」，再從主畫面的圖示打開，才能開啟通知（iOS 16.4 以上）。做法：Safari 下方的分享按鈕 →「加入主畫面」。'
      : state === 'denied'
        ? '你之前拒絕了通知。要開啟的話，請到手機的「設定 → 通知」找到租屋小幫手打開。'
        : state === 'unsupported'
          ? '這個瀏覽器不支援推播通知。'
          : state === 'on'
            ? '截圖解析完成時，這台裝置會收到通知。'
            : '截圖解析完成時通知你，可以放心切到其他 App。';

  const body = (
    <>
      <p className="text-[13px] leading-relaxed text-sub">{hint}</p>
      {state === 'off' && (
        <button type="button" onClick={enable} disabled={busy} className="btn-dark h-11">
          {busy ? '開啟中…' : '開啟通知'}
        </button>
      )}
      {state === 'on' && !compact && (
        <button type="button" onClick={disable} disabled={busy} className="btn-outline h-10 self-start">
          {busy ? '關閉中…' : '關閉這台裝置的通知'}
        </button>
      )}
      {error && (
        <p role="alert" className="text-[13px] text-warn-text">
          {error}
        </p>
      )}
    </>
  );

  if (compact) return <div className="flex flex-col gap-2 rounded-2xl border border-line p-3.5">{body}</div>;
  return (
    <section className="card flex flex-col gap-2.5 p-4">
      <h2 className="text-[15px] font-bold">通知</h2>
      {body}
    </section>
  );
}
