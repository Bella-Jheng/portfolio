'use client';

import { useState } from 'react';
import { type Gender, type CalculateRequest, type StrongElementYear } from '../../../types/bazi';
import { BirthDateInput } from '../birth-date-input/BirthDateInput';
import { Loading } from '../loading/Loading';
import { useModalStore } from '../../../lib/modal-store';
import { calculateBaziPillars, calculateDayMasterStrength, getDayMasterElement, findStrongElementYears } from '../../../lib/bazi-calculator';
import { StrengthCalibrationModal } from './StrengthCalibrationModal';
import { useLocale } from '../../../lib/i18n/locale-context';

const inputClass =
  'w-full bg-[#FAF7F4] border border-[#EAE5DF] rounded-xl px-4 py-3 text-[#4A4A4A] placeholder:text-[#636363] focus:outline-none focus:border-[#FCD060] transition-colors text-sm';

interface BirthFormProps {
  onSubmit: (form: CalculateRequest) => void;
  isPending?: boolean;
  apiError?: string;
}

export function BirthForm({ onSubmit, isPending = false, apiError }: BirthFormProps) {
  const [error, setError] = useState('');
  const { show } = useModalStore();
  const { locale, t } = useLocale();
  const [calibration, setCalibration] = useState<{
    form: CalculateRequest;
    element: string;
    years: StrongElementYear[];
  } | null>(null);

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
    if (!form.name?.trim()) { setError(t('form.errName')); return; }
    if (!form.gender) { setError(t('form.errGender')); return; }
    if (!form.birthYear || !form.birthMonth || !form.birthDay) { setError(t('form.errDate')); return; }
    setError('');

    show({
      title: t('form.confirmTitle'),
      confirmLabel: t('form.confirmSubmit'),
      cancelLabel: t('form.confirmEdit'),
      content: (
        <div className="space-y-2 text-sm">
          <div className="flex justify-between border-b border-bz-border/60 pb-2">
            <span className="text-bz-mid">{t('form.name')}</span>
            <span className="text-bz-brown font-medium">{form.name}</span>
          </div>
          <div className="flex justify-between border-b border-bz-border/60 pb-2">
            <span className="text-bz-mid">{t('form.gender')}</span>
            <span className="text-bz-brown font-medium">{form.gender === 'male' ? t('common.male') : t('common.female')}</span>
          </div>
          <div className="flex justify-between border-b border-bz-border/60 pb-2">
            <span className="text-bz-mid">{t('form.birthDate')}</span>
            <span className="text-bz-brown font-medium">{t('form.dateValue', { year: form.birthYear, month: form.birthMonth, day: form.birthDay })}</span>
          </div>
          <div className="flex justify-between pb-1">
            <span className="text-bz-mid">{t('form.birthHour')}</span>
            <span className="text-bz-brown font-medium">{form.birthHour !== undefined ? t('form.hourValue', { hour: form.birthHour }) : t('form.notProvided')}</span>
          </div>
          <p className="text-red-500 text-xs pt-1">{t('form.cannotChange')}</p>
        </div>
      ),
      onConfirm: () => {
        const pillars = calculateBaziPillars(form.birthYear, form.birthMonth, form.birthDay, form.birthHour);
        // 只有算出從強/從弱這種較極端、影響較大的判斷時才需要問卷校正；身強/身弱不用再問
        const baseStrength = calculateDayMasterStrength(pillars);
        const isExtreme = baseStrength === '從強' || baseStrength === '從弱';
        const years = isExtreme ? findStrongElementYears(pillars, form.birthYear, new Date().getFullYear()) : [];
        if (years.length === 0) { onSubmit(form); return; }
        setCalibration({ form, element: getDayMasterElement(pillars), years });
      },
    });
  };

  if (calibration) {
    return (
      <StrengthCalibrationModal
        element={calibration.element}
        years={calibration.years}
        onComplete={(answers) => {
          const finalForm = { ...calibration.form, strengthCalibration: answers };
          setCalibration(null);
          onSubmit(finalForm);
        }}
        onSkip={() => {
          const { form: pendingForm } = calibration;
          setCalibration(null);
          onSubmit(pendingForm);
        }}
      />
    );
  }

  // 排盤在伺服器背景跑，等待時可以切到其他 App
  if (isPending) return <Loading canLeave translating={locale === 'en'} />;

  const displayError = error || apiError;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Name & Gender */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="space-y-2">
          <label className="text-[#4A4A4A] text-xs font-bold tracking-widest">
            {t('form.name')} <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={form.name}
            onChange={(event) => setForm({ ...form, name: event.target.value })}
            placeholder={t('form.namePlaceholder')}
            className={inputClass}
          />
        </div>

        <div className="space-y-2">
          <label className="text-[#4A4A4A] text-xs font-bold tracking-widest">
            {t('form.gender')} <span className="text-red-400">*</span>
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
                {gender === 'male' ? t('form.maleOption') : t('form.femaleOption')}
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
        {t('form.submit')}
      </button>
    </form>
  );
}
