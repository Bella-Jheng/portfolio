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
        placeholder="回覆這則回饋…"
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
        <h1 className="text-bz-parchment font-serif text-3xl tracking-wider">意見回饋</h1>
        <p className="text-bz-muted text-sm">大家透過回饋按鈕送出的訊息</p>
      </div>

      {isLoading ? (
        <p className="text-bz-muted text-sm">載入回饋中…</p>
      ) : entries.length === 0 ? (
        <p className="text-bz-muted/60 text-sm text-center py-16">尚無回饋紀錄</p>
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
