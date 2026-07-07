'use client';

import { useState } from 'react';
import { type Gender, type CalculateRequest } from '../../../types/bazi';
import { BirthDateInput } from '../birth-date-input/BirthDateInput';
import { Loading } from '../loading/Loading';

const inputClass =
  'w-full bg-[#FAF7F4] border border-[#EAE5DF] rounded-xl px-4 py-3 text-[#4A4A4A] placeholder:text-[#636363] focus:outline-none focus:border-[#FCD060] transition-colors text-sm';

interface BirthFormProps {
  onSubmit: (form: CalculateRequest) => void;
  isPending?: boolean;
  apiError?: string;
}

export function BirthForm({ onSubmit, isPending = false, apiError }: BirthFormProps) {
  const [error, setError] = useState('');

  const [form, setForm] = useState<CalculateRequest>({
    name: '',
    gender: undefined,
    birthYear: 0,
    birthMonth: 0,
    birthDay: 0,
    birthHour: undefined,
  });

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!form.name?.trim()) { setError('請填寫姓名'); return; }
    if (!form.gender) { setError('請選擇性別'); return; }
    if (!form.birthYear || !form.birthMonth || !form.birthDay) { setError('請填寫正確的出生年月日'); return; }
    setError('');
    onSubmit(form);
  };

  if (isPending) return <Loading />;

  const displayError = error || apiError;

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
            onChange={(event) => setForm({ ...form, name: event.target.value })}
            placeholder="例：王小明"
            className={inputClass}
          />
        </div>

        <div className="space-y-2">
          <label className="text-[#4A4A4A] text-xs font-bold tracking-widest">
            性別 <span className="text-red-400">*</span>
          </label>
          <div className="flex gap-3">
            {(['male', 'female'] as Gender[]).map((gender) => (
              <button
                key={gender}
                type="button"
                onClick={() => setForm({ ...form, gender: gender })}
                className={`flex-1 py-3 rounded-xl border text-sm font-medium transition-all ${
                  form.gender === gender
                    ? 'bg-[#4A4A4A] text-white border-[#4A4A4A] shadow-md'
                    : 'border-[#EAE5DF] text-[#636363] hover:border-[#4A4A4A] hover:text-[#4A4A4A] bg-[#FAF7F4]'
                }`}
              >
                {gender === 'male' ? '男 ♂' : '女 ♀'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Birth Date & Hour */}
      <BirthDateInput
        value={{ year: form.birthYear, month: form.birthMonth, day: form.birthDay, hour: form.birthHour ?? null }}
        onChange={(dateValue) =>
          setForm((prevForm) => ({ ...prevForm, birthYear: dateValue.year, birthMonth: dateValue.month, birthDay: dateValue.day, birthHour: dateValue.hour ?? undefined }))
        }
      />

      {displayError && (
        <p className="text-red-500 text-sm bg-red-50 border border-red-100 rounded-xl px-4 py-3">
          {displayError}
        </p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="w-full bg-[#FCD060] text-[#4A4A4A] font-bold py-4 rounded-xl tracking-widest hover:bg-[#FDE49B] shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 active:shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
      >
        開始排盤 ✦
      </button>
    </form>
  );
}
