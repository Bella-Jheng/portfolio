'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { SHICHEN, type Gender, type CalculateRequest } from '../../../types/bazi';
import { Loading } from '../loading/Loading';
import { useAuth } from '../../../lib/auth-context';

const currentYear = new Date().getFullYear();
const years = Array.from({ length: 100 }, (_, i) => currentYear - i);
const months = Array.from({ length: 12 }, (_, i) => i + 1);
const days = Array.from({ length: 31 }, (_, i) => i + 1);

const inputClass =
  'w-full bg-[#FAF7F4] border border-[#EAE5DF] rounded-xl px-4 py-3 text-[#4A4A4A] placeholder:text-[#636363] focus:outline-none focus:border-[#FCD060] transition-colors text-sm';

const selectClass =
  'bg-[#FAF7F4] border border-[#EAE5DF] rounded-xl px-3 py-3 text-[#4A4A4A] focus:outline-none focus:border-[#FCD060] transition-colors text-sm w-full';

export function BirthForm() {
  const router = useRouter();
  const { getToken } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState<CalculateRequest>({
    name: '',
    gender: undefined,
    birthYear: currentYear - 30,
    birthMonth: 1,
    birthDay: 1,
    birthHour: undefined,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name?.trim()) { setError('請填寫姓名'); return; }
    if (!form.gender) { setError('請選擇性別'); return; }
    setError('');
    setLoading(true);

    try {
      const token = await getToken();
      const res = await fetch('/api/calculate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || '計算失敗，請稍後再試');
        return;
      }

      router.push(`/result/${data.id}`);
    } catch {
      setError('網路錯誤，請確認連線後再試');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading />;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Name & Gender */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="space-y-2">
          <label className="text-[#4A4A4A] text-xs font-bold tracking-widest">
            姓名 <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="例：王小明"
            className={inputClass}
          />
        </div>

        <div className="space-y-2">
          <label className="text-[#4A4A4A] text-xs font-bold tracking-widest">
            性別 <span className="text-red-400">*</span>
          </label>
          <div className="flex gap-3">
            {(['male', 'female'] as Gender[]).map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => setForm({ ...form, gender: g })}
                className={`flex-1 py-3 rounded-xl border text-sm font-medium transition-all ${
                  form.gender === g
                    ? 'bg-[#4A4A4A] text-white border-[#4A4A4A] shadow-md'
                    : 'border-[#EAE5DF] text-[#636363] hover:border-[#4A4A4A] hover:text-[#4A4A4A] bg-[#FAF7F4]'
                }`}
              >
                {g === 'male' ? '男 ♂' : '女 ♀'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Birth Date */}
      <div className="space-y-2">
        <label className="text-[#4A4A4A] text-xs font-bold tracking-widest">
          出生年月日 <span className="text-red-400">*</span>
        </label>
        <div className="grid grid-cols-3 gap-3">
          <select
            value={form.birthYear}
            onChange={(e) => setForm({ ...form, birthYear: Number(e.target.value) })}
            className={selectClass}
          >
            {years.map((y) => (
              <option key={y} value={y}>{y} 年</option>
            ))}
          </select>

          <select
            value={form.birthMonth}
            onChange={(e) => setForm({ ...form, birthMonth: Number(e.target.value) })}
            className={selectClass}
          >
            {months.map((m) => (
              <option key={m} value={m}>{m} 月</option>
            ))}
          </select>

          <select
            value={form.birthDay}
            onChange={(e) => setForm({ ...form, birthDay: Number(e.target.value) })}
            className={selectClass}
          >
            {days.map((d) => (
              <option key={d} value={d}>{d} 日</option>
            ))}
          </select>
        </div>
      </div>

      {/* Birth Hour */}
      <div className="space-y-2">
        <label className="text-[#4A4A4A] text-xs font-bold tracking-widest">
          出生時辰（選填）
        </label>
        <select
          value={form.birthHour ?? ''}
          onChange={(e) =>
            setForm({
              ...form,
              birthHour: e.target.value === '' ? undefined : Number(e.target.value),
            })
          }
          className={selectClass}
        >
          <option value="">不知道時辰</option>
          {SHICHEN.map((s) => (
            <option key={s.branch} value={s.hours[0]}>
              {s.label}
            </option>
          ))}
        </select>
      </div>

      {error && (
        <p className="text-red-500 text-sm bg-red-50 border border-red-100 rounded-xl px-4 py-3">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-[#FCD060] text-[#4A4A4A] font-bold py-4 rounded-xl tracking-widest hover:bg-[#FDE49B] shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 active:shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
      >
        開始排盤 ✦
      </button>
    </form>
  );
}
