'use client';

import { useState } from 'react';
import clsx from 'clsx';
import { useAuth } from '../../lib/auth-context';
import { GoogleLoginButton } from '../../common/components/google-login-button/GoogleLoginButton';
import type { Reading } from '../../types/bazi';
import { STEM_ELEMENT } from '../../common/components/result-display/theme';
import { ResultDisplay } from '../../common/components/result-display/ResultDisplay';
import { useReadings } from './api/use-readings';
import { type EditForm, useSaveReading } from './api/use-save-reading';
import { useDeleteReading } from './api/use-delete-reading';
import { useApproveCorrection } from './api/use-approve-correction';

const ELEMENTS = ['全部', '木', '火', '土', '金', '水'] as const;
type ElementFilter = (typeof ELEMENTS)[number];

const ELEMENT_STYLE: Record<
  string,
  { dot: string; dotText: string; activeBg: string; activeBorder: string; activeText: string }
> = {
  木: {
    dot:          'bg-bz-element-wood-accent',
    dotText:      'text-bz-element-wood-accent',
    activeBg:     'bg-bz-element-wood-accent/10',
    activeBorder: 'border-bz-element-wood-accent/40',
    activeText:   'text-bz-element-wood-text',
  },
  火: {
    dot:          'bg-bz-element-fire-accent',
    dotText:      'text-bz-element-fire-accent',
    activeBg:     'bg-bz-element-fire-accent/10',
    activeBorder: 'border-bz-element-fire-accent/40',
    activeText:   'text-bz-element-fire-text',
  },
  土: {
    dot:          'bg-bz-element-earth-accent',
    dotText:      'text-bz-element-earth-accent',
    activeBg:     'bg-bz-element-earth-accent/10',
    activeBorder: 'border-bz-element-earth-accent/40',
    activeText:   'text-bz-element-earth-text',
  },
  金: {
    dot:          'bg-bz-element-metal-accent',
    dotText:      'text-bz-element-metal-accent',
    activeBg:     'bg-bz-element-metal-accent/10',
    activeBorder: 'border-bz-element-metal-accent/40',
    activeText:   'text-bz-element-metal-text',
  },
  水: {
    dot:          'bg-bz-element-water-accent',
    dotText:      'text-bz-element-water-accent',
    activeBg:     'bg-bz-element-water-accent/10',
    activeBorder: 'border-bz-element-water-accent/40',
    activeText:   'text-bz-element-water-text',
  },
};

function getDayElement(reading: Reading): string {
  return STEM_ELEMENT[reading.pillars?.day?.stem ?? ''] ?? '';
}

function matchesSearch(reading: Reading, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  const { birthYear: y, birthMonth: m, birthDay: d } = reading;
  const haystack = [
    reading.name ?? '',
    `${y}年${m}月${d}日`,
    `${y}-${m}-${d}`,
    `${y}/${m}/${d}`,
    `${m}/${d}`,
    `${m}月${d}日`,
  ].join(' ').toLowerCase();
  return haystack.includes(q);
}

export default function DashboardPage() {
  const { user, loading, isAdmin } = useAuth();

  const [error, setError] = useState('');
  const [filter, setFilter] = useState<ElementFilter>('全部');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Reading | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<EditForm | null>(null);
  const [copiedUid, setCopiedUid] = useState<string | null>(null);

  // ── API hooks ─────────────────────────────────────────────────────────────
  const { data, isLoading: fetching } = useReadings(isAdmin);
  const saveMutation = useSaveReading();
  const deleteMutation = useDeleteReading();
  const approveMutation = useApproveCorrection();

  const readings = data?.readings ?? [];

  // ── Helpers ───────────────────────────────────────────────────────────────
  const filteredReadings = readings
    .filter((reading) => filter === '全部' || getDayElement(reading) === filter)
    .filter((reading) => matchesSearch(reading, search));

  const handleUpdate = (updated: Reading) => {
    // saveMutation's onSuccess already patches the cache; update the detail view too
    setSelected(updated);
  };

  const startEdit = (reading: Reading, event: React.MouseEvent) => {
    event.stopPropagation();
    setEditingId(reading.id);
    setEditForm({ name: reading.name ?? '', birthYear: reading.birthYear, birthMonth: reading.birthMonth, birthDay: reading.birthDay, birthHour: reading.birthHour ?? null });
  };

  const copyUid = (uid: string, readingId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    navigator.clipboard.writeText(uid).then(() => {
      setCopiedUid(readingId);
      setTimeout(() => setCopiedUid(null), 2000);
    });
  };

  const cancelEdit = () => { setEditingId(null); setEditForm(null); };

  const handleDelete = (id: string, event: React.MouseEvent) => {
    event.stopPropagation();
    if (!confirm('確定要刪除這筆命盤？')) return;
    deleteMutation.mutate(id, {
      onError: (err) => setError(err instanceof Error ? err.message : '刪除失敗'),
    });
  };

  const handleApprove = (id: string, event: React.MouseEvent) => {
    event.stopPropagation();
    if (!confirm('同意更改並重新排盤？這將使用用戶申請的日期重新計算，無法還原。')) return;
    approveMutation.mutate(id, {
      onError: (err) => setError(err instanceof Error ? err.message : '同意更改失敗'),
    });
  };

  // ── Guards ────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <p className="text-bz-muted text-sm">載入中…</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] gap-6 px-5">
        <p className="text-bz-muted text-center">請先登入</p>
        <GoogleLoginButton variant="outline" className="px-6 py-3" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] px-5">
        <p className="text-bz-muted text-center">此頁面僅限管理員使用</p>
      </div>
    );
  }

  if (selected) {
    return (
      <div className="py-10 px-8">
        <button
          onClick={() => setSelected(null)}
          className="flex items-center gap-1.5 text-bz-muted text-sm mb-8 hover:text-bz-parchment transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          返回列表
        </button>
        <div className="space-y-1 mb-8">
          <div className="flex items-center gap-2">
            {getDayElement(selected) && (
              <span
                className={clsx(
                  'inline-block w-2.5 h-2.5 rounded-full',
                  ELEMENT_STYLE[getDayElement(selected)]?.dot ?? 'bg-transparent',
                )}
              />
            )}
            <h2 className="text-bz-parchment font-serif text-2xl tracking-wider">
              {selected.name || '（未提供姓名）'}
            </h2>
          </div>
          <p className="text-bz-muted text-sm pl-4">
            {selected.birthYear}年{selected.birthMonth}月{selected.birthDay}日
            {selected.birthHour !== undefined && selected.birthHour !== null ? ` ${selected.birthHour}時` : ''}
            {selected.gender === 'male' ? ' · 男' : selected.gender === 'female' ? ' · 女' : ''}
          </p>
        </div>
        <ResultDisplay reading={selected} onUpdate={handleUpdate} />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-5 py-12">
      <div className="space-y-2 mb-8">
        <h1 className="text-bz-parchment font-serif text-3xl tracking-wider">命盤列表</h1>
        <p className="text-bz-muted text-sm">所有已排命盤</p>
      </div>

      {/* Search box */}
      <div className="relative mb-4">
        <svg
          className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-bz-muted/50"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 10a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="搜尋姓名或生日（例如：小明、1990、3月15日）"
          className="w-full bg-transparent border border-bz-gold/20 rounded-full pl-10 pr-4 py-2.5 text-bz-parchment text-sm placeholder:text-bz-muted/40 focus:outline-none focus:border-bz-gold/50 transition-all"
        />
      </div>

      {/* Element filter */}
      <div className="flex flex-wrap gap-2 mb-6">
        {ELEMENTS.map((el) => {
          const s = el !== '全部' ? ELEMENT_STYLE[el] : null;
          const isActive = filter === el;
          const count =
            el === '全部'
              ? readings.length
              : readings.filter((reading) => getDayElement(reading) === el).length;

          return (
            <button
              key={el}
              onClick={() => setFilter(el)}
              className={clsx(
                'flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold border transition-all',
                isActive && s
                  ? [s.activeBg, s.activeBorder, s.activeText]
                  : isActive
                    ? 'bg-bz-gold/[0.12] border-bz-gold/50 text-bz-mid'
                    : 'border-bz-gold/20 text-bz-mid',
              )}
            >
              {s && <span className={clsx('w-2 h-2 rounded-full shrink-0', s.dot)} />}
              {el}
              <span className="opacity-60 font-mono">{count}</span>
            </button>
          );
        })}
      </div>

      {error && <p className="text-bz-red text-sm mb-6">{error}</p>}

      {fetching ? (
        <p className="text-bz-muted text-sm">載入命盤中…</p>
      ) : filteredReadings.length === 0 ? (
        <p className="text-bz-muted/60 text-sm text-center py-16">尚無命盤紀錄</p>
      ) : (
        <div className="space-y-3">
          {filteredReadings.map((reading) => {
            const el = getDayElement(reading);
            const elStyle = ELEMENT_STYLE[el];
            const isEditing = editingId === reading.id;
            const isDeleting = deleteMutation.isPending && deleteMutation.variables === reading.id;
            const isApproving = approveMutation.isPending && approveMutation.variables === reading.id;
            return (
              <div key={reading.id} className="border border-bz-gold/20 rounded-xl overflow-hidden">
                {/* Main row */}
                <div
                  className="flex items-center justify-between px-6 py-4 hover:bg-white/[0.02] transition-all group cursor-pointer"
                  onClick={() => !isEditing && setSelected(reading)}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex flex-col items-center gap-0.5 pt-0.5 shrink-0">
                      <span className={clsx('w-2 h-2 rounded-full', elStyle?.dot ?? 'bg-transparent')} />
                      {el && <span className={clsx('text-[9px] font-bold leading-none', elStyle?.dotText)}>{el}</span>}
                    </div>
                    <div className="space-y-1">
                      <p className="text-bz-parchment text-sm font-serif group-hover:text-bz-gold transition-colors">
                        {reading.name || '（未提供姓名）'}
                      </p>
                      <p className="text-bz-muted text-xs">
                        {reading.birthYear}年{reading.birthMonth}月{reading.birthDay}日
                        {reading.birthHour !== undefined && reading.birthHour !== null ? ` ${reading.birthHour}時` : ''}
                        {reading.gender === 'male' ? ' · 男' : reading.gender === 'female' ? ' · 女' : ''}
                      </p>
                      {reading.createdBy && (
                        <div className="flex items-center gap-1" onClick={(event) => event.stopPropagation()}>
                          <span className="font-mono text-[10px] text-bz-muted/50 tracking-tight">
                            {reading.createdBy.slice(0, 12)}…
                          </span>
                          <button
                            onClick={(event) => copyUid(reading.createdBy ?? '', reading.id, event)}
                            className="p-0.5 rounded text-bz-muted/40 hover:text-bz-gold transition-colors"
                            title={reading.createdBy}
                          >
                            {copiedUid === reading.id ? (
                              <svg className="w-3 h-3 text-green-500" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                              </svg>
                            ) : (
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                              </svg>
                            )}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right space-y-1">
                      <p className="text-bz-muted/60 text-xs">{new Date(reading.createdAt).toLocaleDateString('zh-TW')}</p>
                      {reading.correctionRequested && (
                        <div className="text-right">
                          <p className="text-[#E87878] text-[10px] font-bold tracking-wide">✏️ 申請更改日期</p>
                          {reading.correctionRequestedDate && (
                            <p className="text-[#E87878]/70 text-[10px]">
                              → {reading.correctionRequestedDate.year}/{reading.correctionRequestedDate.month}/{reading.correctionRequestedDate.day}
                              {reading.correctionRequestedDate.hour != null ? ` ${reading.correctionRequestedDate.hour}時` : ''}
                            </p>
                          )}
                        </div>
                      )}
                      {reading.questions.length > 0 && <p className="text-bz-gold/50 text-xs">{reading.questions.length} 題追問</p>}
                    </div>
                    {/* Action buttons */}
                    <div className="flex items-center gap-1 ml-2" onClick={(event) => event.stopPropagation()}>
                      {reading.correctionRequested && (
                        <button
                          onClick={(event) => handleApprove(reading.id, event)}
                          disabled={isApproving}
                          className="px-2 py-1 rounded-lg text-[10px] font-bold text-[#E87878] border border-[#E87878]/30 hover:bg-[#E87878]/10 transition-all disabled:opacity-40 whitespace-nowrap"
                          title="同意更改日期並重新排盤"
                        >
                          {isApproving ? '排盤中…' : '同意更改'}
                        </button>
                      )}
                      <button
                        onClick={(event) => startEdit(reading, event)}
                        className="p-1.5 rounded-lg text-bz-muted hover:text-bz-gold hover:bg-bz-gold/10 transition-all"
                        title="編輯日期"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 012.828 2.828L11.828 15.828a2 2 0 01-1.414.586H7v-3a2 2 0 01.586-1.414z" />
                        </svg>
                      </button>
                      <button
                        onClick={(event) => handleDelete(reading.id, event)}
                        disabled={isDeleting}
                        className="p-1.5 rounded-lg text-bz-muted hover:text-[#E87878] hover:bg-[#E87878]/10 transition-all disabled:opacity-40"
                        title="刪除"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7h6m-7 0a1 1 0 01-1-1V5a1 1 0 011-1h6a1 1 0 011 1v1a1 1 0 01-1 1H9z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Inline edit form */}
                {isEditing && editForm && (
                  <div className="border-t border-bz-gold/20 px-6 py-4 bg-white/[0.01] flex flex-wrap items-end gap-3">
                    <label className="flex flex-col gap-1">
                      <span className="text-bz-muted text-[10px]">姓名</span>
                      <input
                        type="text"
                        value={editForm.name ?? ''}
                        onChange={(event) =>
                          setEditForm((prevForm) => prevForm && ({ ...prevForm, name: event.target.value }))
                        }
                        placeholder="（未提供）"
                        className="w-28 bg-transparent border border-bz-gold/30 rounded-lg px-2 py-1.5 text-bz-parchment text-xs focus:outline-none focus:border-bz-gold/60 placeholder:text-bz-muted/40"
                      />
                    </label>
                    {(
                      [
                        { label: '年', field: 'birthYear', min: 1900, max: 2100 },
                        { label: '月', field: 'birthMonth', min: 1, max: 12 },
                        { label: '日', field: 'birthDay', min: 1, max: 31 },
                        { label: '時（可空）', field: 'birthHour', min: 0, max: 23 },
                      ] as const
                    ).map(({ label, field, min, max }) => (
                      <label key={field} className="flex flex-col gap-1">
                        <span className="text-bz-muted text-[10px]">{label}</span>
                        <input
                          type="number"
                          min={min}
                          max={max}
                          value={editForm[field] ?? ''}
                          onChange={(event) =>
                            setEditForm((prevForm) => prevForm && ({ ...prevForm, [field]: event.target.value === '' ? null : Number(event.target.value) }))
                          }
                          className="w-16 bg-transparent border border-bz-gold/30 rounded-lg px-2 py-1.5 text-bz-parchment text-xs text-center focus:outline-none focus:border-bz-gold/60"
                        />
                      </label>
                    ))}
                    <div className="flex gap-2 pb-0.5">
                      <button
                        onClick={() => {
                          if (!editForm) return;
                          saveMutation.mutate({ id: reading.id, form: editForm }, {
                            onSuccess: () => cancelEdit(),
                            onError: (err) => setError(err instanceof Error ? err.message : '更新失敗'),
                          });
                        }}
                        disabled={saveMutation.isPending}
                        className="px-4 py-1.5 rounded-full border border-bz-gold/40 text-bz-gold text-xs hover:bg-bz-gold/10 transition-all disabled:opacity-40"
                      >
                        {saveMutation.isPending ? '重新排盤中…' : '儲存並重排'}
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="px-4 py-1.5 rounded-full border border-bz-gold/20 text-bz-muted text-xs hover:border-bz-gold/40 transition-all"
                      >
                        取消
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
