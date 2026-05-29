'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '../../lib/auth-context';
import type { Reading } from '../../types/bazi';
import { STEM_ELEMENT } from '../../components/Common/result-display/theme';
import { ResultDisplay } from '../../components/Common/result-display/ResultDisplay';

const ELEMENTS = ['全部', '木', '火', '土', '金', '水'] as const;
type ElementFilter = (typeof ELEMENTS)[number];

const ELEMENT_STYLE: Record<
  string,
  { dot: string; activeBg: string; activeBorder: string; activeText: string }
> = {
  木: {
    dot: '#7AC97A',
    activeBg: '#7AC97A18',
    activeBorder: '#7AC97A60',
    activeText: '#2E4C2E',
  },
  火: {
    dot: '#E87878',
    activeBg: '#E8787818',
    activeBorder: '#E8787860',
    activeText: '#5C2D2D',
  },
  土: {
    dot: '#FCD060',
    activeBg: '#FCD06018',
    activeBorder: '#FCD06060',
    activeText: '#4A3200',
  },
  金: {
    dot: '#C8900A',
    activeBg: '#C8900A18',
    activeBorder: '#C8900A60',
    activeText: '#4A3200',
  },
  水: {
    dot: '#9070C0',
    activeBg: '#9070C018',
    activeBorder: '#9070C060',
    activeText: '#36274D',
  },
};

function getDayElement(reading: Reading): string {
  return STEM_ELEMENT[reading.pillars?.day?.stem ?? ''] ?? '';
}

type EditForm = { birthYear: number; birthMonth: number; birthDay: number; birthHour: number | null };

export default function DashboardPage() {
  const { user, loading, isAdmin, login, getToken } = useAuth();
  const [readings, setReadings] = useState<Reading[]>([]);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<ElementFilter>('全部');
  const [selected, setSelected] = useState<Reading | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<EditForm | null>(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (!isAdmin) return;

    const fetchReadings = async () => {
      setFetching(true);
      try {
        const token = await getToken();
        const res = await fetch('/api/dashboard/readings', {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (!res.ok) {
          setError('讀取失敗');
          return;
        }
        const data = await res.json();
        setReadings(data.readings);
      } catch {
        setError('網路錯誤');
      } finally {
        setFetching(false);
      }
    };

    fetchReadings();
  }, [isAdmin, getToken]);

  const filteredReadings =
    filter === '全部'
      ? readings
      : readings.filter((r) => getDayElement(r) === filter);

  const handleUpdate = (updated: Reading) => {
    setReadings((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
    setSelected(updated);
  };

  const startEdit = (r: Reading, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(r.id);
    setEditForm({ birthYear: r.birthYear, birthMonth: r.birthMonth, birthDay: r.birthDay, birthHour: r.birthHour ?? null });
  };

  const cancelEdit = () => { setEditingId(null); setEditForm(null); };

  const saveEdit = async (id: string) => {
    if (!editForm) return;
    setSaving(true);
    try {
      const token = await getToken();
      const res = await fetch(`/api/dashboard/readings/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify(editForm),
      });
      if (!res.ok) { setError('更新失敗'); return; }
      const updated = await res.json();
      setReadings((prev) => prev.map((r) => (r.id === id ? updated : r)));
      cancelEdit();
    } catch {
      setError('網路錯誤');
    } finally {
      setSaving(false);
    }
  };

  const deleteReading = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('確定要刪除這筆命盤？')) return;
    setDeletingId(id);
    try {
      const token = await getToken();
      const res = await fetch(`/api/dashboard/readings/${id}`, {
        method: 'DELETE',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) { setError('刪除失敗'); return; }
      setReadings((prev) => prev.filter((r) => r.id !== id));
    } catch {
      setError('網路錯誤');
    } finally {
      setDeletingId(null);
    }
  };

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
        <button
          onClick={login}
          className="border border-bz-gold/40 text-bz-gold px-6 py-3 rounded-full text-sm tracking-wider hover:bg-bz-gold/10 transition-all"
        >
          Google 登入
        </button>
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
      <div className="max-w-4xl mx-auto px-5 py-10">
        <button
          onClick={() => setSelected(null)}
          className="flex items-center gap-1.5 text-bz-muted text-sm mb-8 hover:text-bz-parchment transition-colors"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 19l-7-7 7-7"
            />
          </svg>
          返回列表
        </button>
        <div className="space-y-1 mb-8">
          <div className="flex items-center gap-2">
            {getDayElement(selected) && (
              <span
                className="inline-block w-2.5 h-2.5 rounded-full"
                style={{
                  backgroundColor: ELEMENT_STYLE[getDayElement(selected)]?.dot,
                }}
              />
            )}
            <h2 className="text-bz-parchment font-serif text-2xl tracking-wider">
              {selected.name || '（未提供姓名）'}
            </h2>
          </div>
          <p className="text-bz-muted text-sm pl-4">
            {selected.birthYear}年{selected.birthMonth}月{selected.birthDay}日
            {selected.birthHour !== undefined && selected.birthHour !== null
              ? ` ${selected.birthHour}時`
              : ''}
            {selected.gender === 'male'
              ? ' · 男'
              : selected.gender === 'female'
                ? ' · 女'
                : ''}
          </p>
        </div>
        <ResultDisplay reading={selected} onUpdate={handleUpdate} />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-5 py-12">
      <div className="space-y-2 mb-8">
        <h1 className="text-bz-parchment font-serif text-3xl tracking-wider">
          命盤列表
        </h1>
        <p className="text-bz-muted text-sm">所有已排命盤</p>
      </div>

      {/* Element filter */}
      <div className="flex flex-wrap gap-2 mb-6">
        {ELEMENTS.map((el) => {
          const s = el !== '全部' ? ELEMENT_STYLE[el] : null;
          const isActive = filter === el;
          const count =
            el === '全部'
              ? readings.length
              : readings.filter((r) => getDayElement(r) === el).length;

          return (
            <button
              key={el}
              onClick={() => setFilter(el)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold border transition-all"
              style={
                isActive && s
                  ? {
                      backgroundColor: s.activeBg,
                      borderColor: s.activeBorder,
                      color: s.activeText,
                    }
                  : isActive
                    ? {
                        backgroundColor: 'rgba(252,208,96,0.12)',
                        borderColor: 'rgba(252,208,96,0.5)',
                        color: '#8A7A60',
                      }
                    : { borderColor: 'rgba(252,208,96,0.2)', color: '#6B6159' }
              }
            >
              {s && (
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: s.dot }}
                />
              )}
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
        <p className="text-bz-muted/60 text-sm text-center py-16">
          尚無命盤紀錄
        </p>
      ) : (
        <div className="space-y-3">
          {filteredReadings.map((r) => {
            const el = getDayElement(r);
            const elStyle = ELEMENT_STYLE[el];
            const isEditing = editingId === r.id;
            const isDeleting = deletingId === r.id;
            return (
              <div
                key={r.id}
                className="border border-bz-gold/20 rounded-xl overflow-hidden"
              >
                {/* Main row */}
                <div
                  className="flex items-center justify-between px-6 py-4 hover:bg-white/[0.02] transition-all group cursor-pointer"
                  onClick={() => !isEditing && setSelected(r)}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex flex-col items-center gap-0.5 pt-0.5 shrink-0">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: elStyle?.dot ?? 'transparent' }} />
                      {el && <span className="text-[9px] font-bold leading-none" style={{ color: elStyle?.dot }}>{el}</span>}
                    </div>
                    <div className="space-y-1">
                      <p className="text-bz-parchment text-sm font-serif group-hover:text-bz-gold transition-colors">
                        {r.name || '（未提供姓名）'}
                      </p>
                      <p className="text-bz-muted text-xs">
                        {r.birthYear}年{r.birthMonth}月{r.birthDay}日
                        {r.birthHour !== undefined && r.birthHour !== null ? ` ${r.birthHour}時` : ''}
                        {r.gender === 'male' ? ' · 男' : r.gender === 'female' ? ' · 女' : ''}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right space-y-1">
                      <p className="text-bz-muted/60 text-xs">{new Date(r.createdAt).toLocaleDateString('zh-TW')}</p>
                      {r.correctionRequested && <p className="text-[#E87878] text-[10px] font-bold tracking-wide">✏️ 申請更改日期</p>}
                      {r.questions.length > 0 && <p className="text-bz-gold/50 text-xs">{r.questions.length} 題追問</p>}
                    </div>
                    {/* Action buttons */}
                    <div className="flex items-center gap-1 ml-2" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={(e) => startEdit(r, e)}
                        className="p-1.5 rounded-lg text-bz-muted hover:text-bz-gold hover:bg-bz-gold/10 transition-all"
                        title="編輯日期"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 012.828 2.828L11.828 15.828a2 2 0 01-1.414.586H7v-3a2 2 0 01.586-1.414z" />
                        </svg>
                      </button>
                      <button
                        onClick={(e) => deleteReading(r.id, e)}
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
                          onChange={(e) =>
                            setEditForm((f) => f && ({ ...f, [field]: e.target.value === '' ? null : Number(e.target.value) }))
                          }
                          className="w-16 bg-transparent border border-bz-gold/30 rounded-lg px-2 py-1.5 text-bz-parchment text-xs text-center focus:outline-none focus:border-bz-gold/60"
                        />
                      </label>
                    ))}
                    <div className="flex gap-2 pb-0.5">
                      <button
                        onClick={() => saveEdit(r.id)}
                        disabled={saving}
                        className="px-4 py-1.5 rounded-full border border-bz-gold/40 text-bz-gold text-xs hover:bg-bz-gold/10 transition-all disabled:opacity-40"
                      >
                        {saving ? '重新排盤中…' : '儲存並重排'}
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
