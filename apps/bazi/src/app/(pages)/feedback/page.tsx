'use client';

import { useRequireAdmin } from '../../lib/use-require-admin';
import { useFeedback } from './api/use-feedback';

export default function FeedbackPage() {
  const { authorized, checking } = useRequireAdmin();
  const { data, isLoading: fetching } = useFeedback(authorized);

  const entries = data ?? [];

  if (checking || !authorized) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <p className="text-bz-muted text-sm">載入中…</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-5 py-12">
      <div className="space-y-2 mb-8">
        <h1 className="text-bz-parchment font-serif text-3xl tracking-wider">意見回饋</h1>
        <p className="text-bz-muted text-sm">使用者透過回饋按鈕送出的訊息</p>
      </div>

      {fetching ? (
        <p className="text-bz-muted text-sm">載入回饋中…</p>
      ) : entries.length === 0 ? (
        <p className="text-bz-muted/60 text-sm text-center py-16">尚無回饋紀錄</p>
      ) : (
        <div className="space-y-3">
          {entries.map((entry) => (
            <div key={entry.id} className="border border-bz-gold/20 rounded-xl px-6 py-4 space-y-2">
              <p className="text-bz-parchment text-sm whitespace-pre-wrap">{entry.message}</p>
              <div className="flex items-center justify-between text-xs text-bz-muted/60">
                <span>{entry.userName || entry.userEmail || entry.uid}</span>
                <span>{new Date(entry.createdAt).toLocaleString('zh-TW')}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
