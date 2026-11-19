'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { BirthForm } from '../../common/components/birth-form/BirthForm';
import { useCalculate, useResumeCalculation } from './api/use-calculate';
import { CalcJobAbortedError } from '../../lib/calc-job-client';
import { useLocale } from '../../lib/i18n/locale-context';
import { localizeError, type MessageKey } from '../../lib/i18n/messages';

const STEPS: MessageKey[] = ['form.stepLearn', 'form.stepFill', 'form.stepResult'];

export default function FormPage() {
  const router = useRouter();
  const mutation = useCalculate();
  // 排盤途中切走或頁面被重新載入，回來時接著等結果
  const resume = useResumeCalculation();
  const { locale, t } = useLocale();
  const rawError =
    mutation.error instanceof Error && !(mutation.error instanceof CalcJobAbortedError)
      ? mutation.error.message
      : (resume.error ?? undefined);

  return (
    <div className="min-h-[calc(100vh-3.5rem)] flex flex-col items-center justify-start px-5 pt-10 pb-16 relative overflow-hidden bg-[#FFFDF5]">
      {/* Background blobs */}
      <div className="absolute top-10 right-[-10%] w-96 h-96 bg-[#FDE49B] opacity-30 mix-blend-multiply rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-20 left-[-10%] w-72 h-72 bg-[#FDE49B] opacity-20 mix-blend-multiply rounded-full blur-2xl pointer-events-none" />

      <div className="w-full max-w-lg space-y-8 relative z-10">
        {/* Step Indicator */}
        <motion.div
          className="flex items-center justify-center gap-0"
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {STEPS.map((label, index) => {
            const stepNum = index + 1;
            const isActive = stepNum === 2;
            const isDone = stepNum < 2;
            return (
              <div key={label} className="flex items-center">
                <div className="flex flex-col items-center gap-1">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                      isActive
                        ? 'bg-[#FCD060] text-[#4A4A4A] shadow-sm'
                        : isDone
                          ? 'bg-[#4A4A4A] text-white'
                          : 'bg-[#EAE5DF] text-[#6B6159]'
                    }`}
                  >
                    {isDone ? '✓' : stepNum}
                  </div>
                  <span
                    className={`text-[10px] font-medium tracking-wide whitespace-nowrap ${
                      isActive ? 'text-[#4A4A4A]' : 'text-[#6B6159]'
                    }`}
                  >
                    {t(label)}
                  </span>
                </div>
                {index < STEPS.length - 1 && (
                  <div
                    className={`w-16 h-px mb-5 mx-1 ${isDone ? 'bg-[#4A4A4A]' : 'bg-[#EAE5DF]'}`}
                  />
                )}
              </div>
            );
          })}
        </motion.div>

        {/* Header */}
        <motion.div
          className="space-y-1"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
        >
          <button
            onClick={() => router.back()}
            className="flex items-center gap-1.5 text-[#6B6159] text-xs hover:text-[#4A4A4A] transition-colors mb-4"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            {t('common.back')}
          </button>
          <h2 className={`text-[#4A4A4A] font-black text-2xl ${locale === 'zh' ? 'tracking-widest' : 'tracking-normal'}`}>{t('form.title')}</h2>
          <p className="text-[#6B6159] text-xs tracking-wide">{t('form.subtitle')}</p>
        </motion.div>

        {/* Form Card */}
        <motion.div
          className="bg-white/80 backdrop-blur-md rounded-2xl shadow-sm border border-black/5 p-6 md:p-8"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6, ease: [0.23, 1, 0.32, 1] as [number, number, number, number] }}
        >
          <BirthForm
            onSubmit={(form) => mutation.mutate(form)}
            isPending={mutation.isPending || resume.resuming}
            apiError={rawError ? localizeError(rawError, locale) : undefined}
          />
        </motion.div>
      </div>
    </div>
  );
}
