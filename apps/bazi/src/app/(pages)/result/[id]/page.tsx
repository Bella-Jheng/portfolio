'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import type { Reading } from '../../../types/bazi';
import { ResultDisplay } from '../../../components/Common/result-display/ResultDisplay';
import { Loading } from '../../../components/Common/loading/Loading';
import { useAuth } from '../../../lib/auth-context';
import Link from 'next/link';

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
          重新排盤
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full min-h-[calc(100vh-4rem)] bg-gradient-to-b from-[#F7E5BD] via-[#FFFDF6] to-white py-12">
      <div className="max-w-5xl mx-auto px-2 md:px-6">
        <ResultDisplay reading={reading} onUpdate={setReading} />

        <div className="mt-12 text-center">
          <Link
            href="/"
            className="text-bz-muted text-sm hover:text-bz-brown transition-colors tracking-wider font-semibold"
          >
            ← 重新排盤
          </Link>
        </div>
      </div>
    </div>
  );
}
