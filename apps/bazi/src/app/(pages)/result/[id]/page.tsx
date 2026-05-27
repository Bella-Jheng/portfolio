'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import type { Reading } from '../../../types/bazi';
import { ResultDisplay } from '../../../components/Common/result-display/ResultDisplay';
import { Loading } from '../../../components/Common/loading/Loading';
import { useAuth } from '../../../lib/auth-context';
import Link from 'next/link';

function CorrectionButton({ readingId }: { readingId: string }) {
  const { user, getToken } = useAuth();
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);

  if (!user) return null;

  const handleRequest = async () => {
    setSending(true);
    try {
      const token = await getToken();
      await fetch(`/api/result/${readingId}/request-correction`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      setSent(true);
    } catch {
      // silent fail — user can retry
    } finally {
      setSending(false);
    }
  };

  if (sent) {
    return (
      <p className="text-[11px] text-[#7AC97A] tracking-wider text-center">
        ✓ 已通知管理員，我們會盡快協助更正
      </p>
    );
  }

  return (
    <button
      onClick={handleRequest}
      disabled={sending}
      className="text-xs text-bz-muted border border-bz-gold/20 px-5 py-2 rounded-full hover:border-bz-gold/50 hover:text-[#4A4A4A] transition-all disabled:opacity-40"
    >
      {sending ? '送出中…' : '✏️ 通知管理員更改日期'}
    </button>
  );
}

export default function ResultPage() {
  const params = useParams();
  const id = params.id as string;
  const { getToken } = useAuth();

  const [reading, setReading] = useState<Reading | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchReading = async () => {
      try {
        const token = await getToken();
        const res = await fetch(`/api/result/${id}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (!res.ok) {
          setError('找不到此命盤，可能已過期或連結有誤');
          return;
        }
        const data = await res.json();
        setReading(data);
      } catch {
        setError('無法載入命盤，請稍後再試');
      } finally {
        setLoading(false);
      }
    };

    fetchReading();
  }, [id, getToken]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <Loading message="載入命盤中…" />
      </div>
    );
  }

  if (error || !reading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] gap-6 px-5 bg-gradient-to-b from-[#F7E5BD] via-[#FFFDF6] to-white">
        <p className="text-bz-muted text-center font-medium">{error || '命盤不存在'}</p>
        <Link
          href="/"
          className="bg-bz-terra text-white px-6 py-3 rounded-full text-sm tracking-wider hover:bg-bz-terra-dark transition-all"
        >
          返回首頁
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full min-h-[calc(100vh-4rem)] bg-gradient-to-b from-[#F7E5BD] via-[#FFFDF6] to-white py-12">
      <div className="max-w-5xl mx-auto px-2 md:px-6">
        <ResultDisplay reading={reading} onUpdate={setReading} />

        <div className="mt-10 flex flex-col items-center gap-3">
          <CorrectionButton readingId={id} />
        </div>
      </div>
    </div>
  );
}
