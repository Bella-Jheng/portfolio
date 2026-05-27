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

export default function DashboardPage() {
  const { user, loading, isAdmin, login, getToken } = useAuth();
  const [readings, setReadings] = useState<Reading[]>([]);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<ElementFilter>('全部');
  const [selected, setSelected] = useState<Reading | null>(null);

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
            return (
              <button
                key={r.id}
                onClick={() => setSelected(r)}
                className="w-full flex items-center justify-between border border-bz-gold/20 rounded-xl px-6 py-4 hover:border-bz-gold/40 hover:bg-white/[0.02] transition-all group text-left"
              >
                <div className="flex items-start gap-3">
                  {/* Element dot */}
                  <div className="flex flex-col items-center gap-0.5 pt-0.5 shrink-0">
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: elStyle?.dot ?? 'transparent' }}
                    />
                    {el && (
                      <span
                        className="text-[9px] font-bold leading-none"
                        style={{ color: elStyle?.dot }}
                      >
                        {el}
                      </span>
                    )}
                  </div>
                  <div className="space-y-1">
                    <p className="text-bz-parchment text-sm font-serif group-hover:text-bz-gold transition-colors">
                      {r.name || '（未提供姓名）'}
                    </p>
                    <p className="text-bz-muted text-xs">
                      {r.birthYear}年{r.birthMonth}月{r.birthDay}日
                      {r.birthHour !== undefined && r.birthHour !== null
                        ? ` ${r.birthHour}時`
                        : ''}
                      {r.gender === 'male'
                        ? ' · 男'
                        : r.gender === 'female'
                          ? ' · 女'
                          : ''}
                    </p>
                  </div>
                </div>
                <div className="text-right space-y-1 shrink-0">
                  <p className="text-bz-muted/60 text-xs">
                    {new Date(r.createdAt).toLocaleDateString('zh-TW')}
                  </p>
                  {r.correctionRequested && (
                    <p className="text-[#E87878] text-[10px] font-bold tracking-wide">
                      ✏️ 申請更改日期
                    </p>
                  )}
                  {r.questions.length > 0 && (
                    <p className="text-bz-gold/50 text-xs">
                      {r.questions.length} 題追問
                    </p>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
