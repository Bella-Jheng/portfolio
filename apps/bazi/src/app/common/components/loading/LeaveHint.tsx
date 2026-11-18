'use client';

import { useAuth } from '../../../lib/auth-context';
import { usePush } from '../../../lib/push-client';

/** 排盤 Loading 畫面下方：告訴使用者可以先切走，並提供開啟「算好時通知我」 */
export function LeaveHint() {
  const { getToken } = useAuth();
  const { state, busy, error, enable } = usePush(getToken);

  const canNotify = state === 'on';
  return (
    <div className="mx-6 mt-6 rounded-2xl border border-[#EAE5DF] bg-white/70 p-4 text-sm leading-relaxed text-[#6B6159]">
      <p>
        命盤在雲端計算，<b className="text-[#4A4A4A]">可以先切到其他 App</b>
        {canNotify ? '，算好會推播通知你。' : '，回到這裡就會看到結果。'}
      </p>
      {state === 'off' && (
        <button
          type="button"
          onClick={enable}
          disabled={busy}
          className="mt-3 w-full rounded-xl bg-[#4A4A4A] py-2.5 text-sm font-bold text-white disabled:opacity-60"
        >
          {busy ? '開啟中…' : '算好時通知我'}
        </button>
      )}
      {state === 'needs-install' && (
        <p className="mt-2 text-xs">
          想收到通知的話：iPhone 要先用 Safari 的分享按鈕「加入主畫面」，從主畫面打開命格貓再開啟通知（iOS 16.4 以上）。
        </p>
      )}
      {state === 'denied' && <p className="mt-2 text-xs">通知被關閉了，可以到手機的「設定 → 通知」打開。</p>}
      {error && <p className="mt-2 text-xs text-[#B42318]">{error}</p>}
    </div>
  );
}
