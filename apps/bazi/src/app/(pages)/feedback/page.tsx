'use client';

import { useState } from 'react';
import { useAuth } from '../../lib/auth-context';
import {
  useAddFeedbackComment,
  useDeleteFeedbackComment,
  useEditFeedbackComment,
  useFeedback,
  useUpdateFeedbackStatus,
  type FeedbackComment,
  type FeedbackStatus,
} from './api/use-feedback';

const STATUS_META: Record<FeedbackStatus, { label: string; dot: string }> = {
  unprocessed: { label: '未處理', dot: 'bg-red-500' },
  in_progress: { label: '處理中', dot: 'bg-yellow-500' },
  resolved: { label: '已處理', dot: 'bg-green-500' },
};

// 近期更新：依類型分組，新的更新加在各組最前面
const UPDATE_GROUPS = [
  {
    emoji: '✨',
    title: '新功能',
    items: [
      { date: '10/30', text: '首頁新增「作者的話」，分享命格貓誕生的初衷' },
      { date: '10/28', text: '意見回饋升級成「許願池」，想要什麼功能都歡迎來許願' },
      { date: '09/09', text: '新增命盤強弱校準問卷：回答幾個過去年份的感受，讓命盤判斷更貼近你本人' },
    ],
  },
  {
    emoji: '🎨',
    title: '體驗優化',
    items: [
      { date: '10/28', text: '填寫生日時加上「請填寫國曆生日」提示，避免誤填農曆' },
      { date: '10/28', text: '校準問卷只在命盤特別強或特別弱時才出現，跳過也會用中和的判斷，不影響結果' },
      { date: '10/28', text: '送出後直接進入結果頁，不再閃一下載入畫面' },
      { date: '10/28', text: '修正校準問卷視窗在部分裝置上排版跑掉的問題' },
    ],
  },
  {
    emoji: '🔒',
    title: '安全與隱私',
    items: [
      { date: '11/02', text: '排盤、提問與完整分析都需要登入，且只有命盤本人能操作' },
      { date: '11/02', text: '每日提問次數統一以台灣時間計算' },
      { date: '10/28', text: '加強網站安全防護，命盤結果頁不會被搜尋引擎收錄' },
      { date: '10/28', text: 'AI 產生的內容會先經過安全過濾才顯示' },
    ],
  },
];

function RecentUpdates() {
  return (
    <details open className="group border border-bz-gold/20 rounded-xl px-6 py-4 mb-8">
      <summary className="flex items-center justify-between cursor-pointer list-none">
        <span className="text-bz-parchment text-sm font-medium tracking-wide">🌟 近期更新：你的願望，我們正在實現</span>
        <span className="text-bz-muted text-xs transition-transform group-open:rotate-180">▼</span>
      </summary>
      <div className="mt-4 space-y-5">
        {UPDATE_GROUPS.map((group) => (
          <div key={group.title} className="space-y-2">
            <p className="text-bz-parchment text-sm font-medium">
              {group.emoji} {group.title}
            </p>
            <ul className="space-y-1.5">
              {group.items.map((item) => (
                <li key={item.text} className="flex gap-3 text-sm text-bz-muted">
                  <span className="shrink-0 text-xs text-bz-muted/60 pt-0.5 tabular-nums">{item.date}</span>
                  <span>{item.text}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </details>
  );
}

function FeedbackStatusBadge({ status }: { status: FeedbackStatus }) {
  const meta = STATUS_META[status] ?? STATUS_META.unprocessed;
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-bz-mid">
      <span className={`w-2 h-2 rounded-full ${meta.dot}`} />
      {meta.label}
    </span>
  );
}

function CommentItem({ feedbackId, comment }: { feedbackId: string; comment: FeedbackComment }) {
  const { isAdmin } = useAuth();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(comment.message);
  const editMutation = useEditFeedbackComment();
  const deleteMutation = useDeleteFeedbackComment();

  const handleSave = () => {
    if (!draft.trim()) return;
    editMutation.mutate(
      { id: feedbackId, commentId: comment.id, message: draft.trim() },
      { onSuccess: () => setEditing(false) },
    );
  };

  const handleDelete = () => {
    if (!window.confirm('確定要刪除這則回覆嗎？')) return;
    deleteMutation.mutate({ id: feedbackId, commentId: comment.id });
  };

  return (
    <div className="bg-bz-gold-light/40 rounded-lg px-3 py-2">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <p className="text-xs text-bz-terra font-bold">管理員回覆</p>
          <span className="text-xs text-bz-muted/60">
            {new Date(comment.editedAt ?? comment.createdAt).toLocaleDateString('zh-TW')}
            {comment.editedAt && '（已編輯）'}
          </span>
        </div>
        {isAdmin && !editing && (
          <div className="flex gap-2 text-xs text-bz-muted">
            <button
              onClick={() => {
                setDraft(comment.message);
                setEditing(true);
              }}
              className="hover:text-bz-brown"
            >
              編輯
            </button>
            <button onClick={handleDelete} disabled={deleteMutation.isPending} className="hover:text-bz-terra">
              刪除
            </button>
          </div>
        )}
      </div>

      {editing ? (
        <div className="space-y-2">
          <textarea
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            rows={2}
            className="w-full bg-bz-paper border border-bz-border rounded-lg px-3 py-2 text-sm text-bz-brown focus:outline-none focus:border-bz-terra/50 resize-none"
          />
          <div className="flex gap-2 justify-end">
            <button onClick={() => setEditing(false)} className="text-xs text-bz-muted px-3 py-1">
              取消
            </button>
            <button
              onClick={handleSave}
              disabled={editMutation.isPending || !draft.trim()}
              className="text-xs bg-bz-terra text-white px-3 py-1 rounded-md disabled:opacity-40"
            >
              儲存
            </button>
          </div>
        </div>
      ) : (
        <p className="text-sm text-bz-brown whitespace-pre-wrap">{comment.message}</p>
      )}
    </div>
  );
}

function AdminReplyForm({ feedbackId }: { feedbackId: string }) {
  const [message, setMessage] = useState('');
  const { mutate, isPending } = useAddFeedbackComment();

  const handleSubmit = () => {
    if (!message.trim()) return;
    mutate({ id: feedbackId, message: message.trim() }, { onSuccess: () => setMessage('') });
  };

  return (
    <div className="flex gap-2 pt-1">
      <input
        value={message}
        onChange={(event) => setMessage(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === 'Enter') handleSubmit();
        }}
        placeholder="回覆這個願望…"
        className="flex-1 bg-bz-paper border border-bz-border rounded-lg px-3 py-2 text-sm text-bz-brown placeholder:text-bz-muted focus:outline-none focus:border-bz-terra/50"
      />
      <button
        onClick={handleSubmit}
        disabled={isPending || !message.trim()}
        className="px-4 py-2 rounded-lg bg-bz-terra text-white text-sm font-bold disabled:opacity-40"
      >
        送出
      </button>
    </div>
  );
}

export default function FeedbackPage() {
  const { isAdmin } = useAuth();
  const { data, isLoading } = useFeedback();
  const { mutate: updateStatus } = useUpdateFeedbackStatus();

  const entries = data ?? [];

  return (
    <div className="max-w-3xl mx-auto px-5 py-12">
      <div className="space-y-2 mb-8">
        <h1 className="text-bz-parchment font-serif text-3xl tracking-wider">許願池</h1>
        <p className="text-bz-muted text-sm">大家投進許願池的願望與建議</p>
      </div>

      <RecentUpdates />

      {isLoading ? (
        <p className="text-bz-muted text-sm">載入願望中…</p>
      ) : entries.length === 0 ? (
        <p className="text-bz-muted/60 text-sm text-center py-16">許願池還空空的，來許第一個願吧！</p>
      ) : (
        <div className="space-y-3">
          {entries.map((entry) => (
            <div key={entry.id} className="border border-bz-gold/20 rounded-xl px-6 py-4 space-y-3">
              <div className="flex items-center justify-between">
                <FeedbackStatusBadge status={entry.status} />
                {isAdmin && (
                  <select
                    value={entry.status}
                    onChange={(event) =>
                      updateStatus({ id: entry.id, status: event.target.value as FeedbackStatus })
                    }
                    className="text-xs bg-transparent border border-bz-border rounded-md px-2 py-1 text-bz-mid"
                  >
                    <option value="unprocessed">未處理</option>
                    <option value="in_progress">處理中</option>
                    <option value="resolved">已處理</option>
                  </select>
                )}
              </div>

              <p className="text-bz-parchment text-sm whitespace-pre-wrap">{entry.message}</p>

              <div className="flex items-center justify-between text-xs text-bz-muted/60">
                <span>{entry.displayName}</span>
                <span>{new Date(entry.createdAt).toLocaleString('zh-TW')}</span>
              </div>

              {entry.comments.length > 0 && (
                <div className="space-y-2 border-t border-bz-gold/10 pt-3">
                  {entry.comments.map((comment) => (
                    <CommentItem key={comment.id} feedbackId={entry.id} comment={comment} />
                  ))}
                </div>
              )}

              {isAdmin && <AdminReplyForm feedbackId={entry.id} />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
