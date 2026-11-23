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
import { useLocale } from '../../lib/i18n/locale-context';
import type { MessageKey } from '../../lib/i18n/messages';

const STATUS_META: Record<FeedbackStatus, { label: MessageKey; dot: string }> = {
  unprocessed: { label: 'wish.statusUnprocessed', dot: 'bg-red-500' },
  in_progress: { label: 'wish.statusInProgress', dot: 'bg-yellow-500' },
  resolved: { label: 'wish.statusResolved', dot: 'bg-green-500' },
};

// 近期更新：依類型分組，新的更新加在各組最前面
const UPDATE_GROUPS = [
  {
    emoji: '✨',
    title: '新功能',
    items: [
      { date: '11/23', text: '把命格貓加到主畫面並開啟通知，每月 1 號會收到當月運勢，新功能上線也會提醒你' },
      { date: '11/23', text: '新增開場動畫和新手介紹，第一次來就知道命格貓能做什麼' },
      { date: '11/21', text: '新增訪客體驗：不用登入，就能先看一份範例命盤' },
      { date: '11/18', text: '推出英文版，右上角可以隨時切換中文／English' },
      { date: '11/18', text: '排盤改在雲端計算，可以先切到其他 App，算好會推播通知你' },
      { date: '10/30', text: '首頁新增「作者的話」，分享命格貓誕生的初衷' },
    ],
  },
  {
    emoji: '🎨',
    title: '體驗優化',
    items: [
      { date: '11/23', text: '選單改成底部懸浮導覽列，新增「我的」頁，帳號、語言和通知設定都在這裡' },
      { date: '11/22', text: 'App 圖示換成首頁的橘貓' },
      { date: '11/22', text: '送出生日後，結果頁直接從天生卡開始，不會停在頁面中間' },
      { date: '11/10', text: '登入一次可以維持 7 天，不用一直重新登入' },
      { date: '10/28', text: '填寫生日時加上「請填寫國曆生日」提示，避免誤填農曆' },
    ],
  },
  {
    emoji: '🔒',
    title: '安全與隱私',
    items: [
      { date: '11/10', text: '登入超過 7 天會自動登出，保護你的命盤資料' },
      { date: '11/02', text: '排盤、提問與完整分析都需要登入，且只有命盤本人能操作' },
      { date: '11/02', text: '每日提問次數統一以台灣時間計算' },
      { date: '10/28', text: 'AI 產生的內容會先經過安全過濾才顯示' },
    ],
  },
];

// 英文介面的近期更新
const UPDATE_GROUPS_EN = [
  {
    emoji: '✨',
    title: 'New features',
    items: [
      { date: '11/23', text: 'Add Bazi Cat to your home screen and turn on notifications to get your monthly outlook on the 1st, plus new-feature alerts' },
      { date: '11/23', text: 'New opening animation and a short intro for first-time visitors' },
      { date: '11/21', text: 'Guest demo: see a sample chart without signing in' },
      { date: '11/18', text: 'English version — switch between 中文 and English anytime, top right' },
      { date: '11/18', text: 'Charts are now calculated in the cloud — switch apps and get a notification when yours is ready' },
      { date: '10/30', text: 'Added an "author\'s note" on the home page about why Bazi Cat was made' },
    ],
  },
  {
    emoji: '🎨',
    title: 'Improvements',
    items: [
      { date: '11/23', text: 'The menu is now a floating bar at the bottom, with a new "Me" page for account, language and notifications' },
      { date: '11/22', text: 'The app icon is now the orange cat from the home page' },
      { date: '11/22', text: 'After submitting, the results page opens at your card instead of halfway down' },
      { date: '11/10', text: 'Stay signed in for 7 days' },
      { date: '10/28', text: 'Added a "use your solar birth date" hint to avoid entering a lunar date by mistake' },
    ],
  },
  {
    emoji: '🔒',
    title: 'Security & privacy',
    items: [
      { date: '11/10', text: 'You are signed out automatically after 7 days to protect your chart' },
      { date: '11/02', text: 'Building charts, asking questions and full analysis require sign-in, and only the owner can use them' },
      { date: '11/02', text: 'Daily question limits now reset on Taiwan time' },
      { date: '10/28', text: 'AI-generated content is filtered for safety before it is shown' },
    ],
  },
];

function RecentUpdates() {
  const { locale, t } = useLocale();
  const groups = locale === 'en' ? UPDATE_GROUPS_EN : UPDATE_GROUPS;
  return (
    <details open className="group border border-bz-gold/20 rounded-xl px-6 py-4 mb-8">
      <summary className="flex items-center justify-between cursor-pointer list-none">
        <span className="text-bz-parchment text-sm font-medium tracking-wide">{t('wish.updates')}</span>
        <span className="text-bz-muted text-xs transition-transform group-open:rotate-180">▼</span>
      </summary>
      <div className="mt-4 space-y-5">
        {groups.map((group) => (
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
  const { t } = useLocale();
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-bz-mid">
      <span className={`w-2 h-2 rounded-full ${meta.dot}`} />
      {t(meta.label)}
    </span>
  );
}

function CommentItem({ feedbackId, comment }: { feedbackId: string; comment: FeedbackComment }) {
  const { isAdmin } = useAuth();
  const { t } = useLocale();
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
          <p className="text-xs text-bz-terra font-bold">{t('wish.adminReply')}</p>
          <span className="text-xs text-bz-muted/60">
            {new Date(comment.editedAt ?? comment.createdAt).toLocaleDateString('zh-TW')}
            {comment.editedAt && t('wish.edited')}
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
  const { locale, t } = useLocale();
  const { data, isLoading } = useFeedback();
  const { mutate: updateStatus } = useUpdateFeedbackStatus();

  const entries = data ?? [];

  return (
    <div className="max-w-3xl mx-auto px-5 py-12">
      <div className="space-y-2 mb-8">
        <h1 className="text-bz-parchment font-serif text-3xl tracking-wider">{t('wish.pageTitle')}</h1>
        <p className="text-bz-muted text-sm">{t('wish.pageSubtitle')}</p>
      </div>

      <RecentUpdates />

      {isLoading ? (
        <p className="text-bz-muted text-sm">{t('wish.loading')}</p>
      ) : entries.length === 0 ? (
        <p className="text-bz-muted/60 text-sm text-center py-16">{t('wish.empty')}</p>
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
                <span>{new Date(entry.createdAt).toLocaleString(locale === 'en' ? 'en-US' : 'zh-TW')}</span>
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
