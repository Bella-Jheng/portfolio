'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../../lib/auth-context';
import type { Reading } from '../../types/bazi';

export default function DashboardPage() {
  const { user, loading, isAdmin, login, getToken } = useAuth();
  const [readings, setReadings] = useState<Reading[]>([]);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState('');

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

  return (
    <div className="max-w-3xl mx-auto px-5 py-12">
      <div className="space-y-2 mb-10">
        <h1 className="text-bz-parchment font-serif text-3xl tracking-wider">命盤列表</h1>
        <p className="text-bz-muted text-sm">所有已排命盤</p>
      </div>

      {error && <p className="text-bz-red text-sm mb-6">{error}</p>}

      {fetching ? (
        <p className="text-bz-muted text-sm">載入命盤中…</p>
      ) : readings.length === 0 ? (
        <p className="text-bz-muted/60 text-sm text-center py-16">尚無命盤紀錄</p>
      ) : (
        <div className="space-y-3">
          {readings.map((r) => (
            <Link
              key={r.id}
              href={`/result/${r.id}`}
              className="flex items-center justify-between border border-bz-gold/20 rounded-xl px-6 py-4 hover:border-bz-gold/40 hover:bg-white/[0.02] transition-all group"
            >
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
              <div className="text-right space-y-1">
                <p className="text-bz-muted/60 text-xs">
                  {new Date(r.createdAt).toLocaleDateString('zh-TW')}
                </p>
                {r.questions.length > 0 && (
                  <p className="text-bz-gold/50 text-xs">{r.questions.length} 題追問</p>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
