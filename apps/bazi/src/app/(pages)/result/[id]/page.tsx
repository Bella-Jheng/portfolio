'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import type { Reading } from '../../../types/bazi';
import { BirthDateInput } from '../../../common/components/birth-date-input/BirthDateInput';
import { ResultDisplay } from '../../../common/components/result-display/ResultDisplay';
import { Loading } from '../../../common/components/loading/Loading';
import { useAuth } from '../../../lib/auth-context';
import { useReading } from './api/use-reading';
import { useRequestCorrection } from './api/use-request-correction';
import Link from 'next/link';
import { useLocale } from '../../../lib/i18n/locale-context';
import { localizeError } from '../../../lib/i18n/messages';

type ModalStep = 'confirm' | 'form';

function CorrectionButton({ reading }: { reading: Reading }) {
  const { user } = useAuth();
  const { t } = useLocale();
  const [modalStep, setModalStep] = useState<ModalStep | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState<{ year: number; month: number; day: number; hour: number | null }>({
    year: reading.birthYear,
    month: reading.birthMonth,
    day: reading.birthDay,
    hour: reading.birthHour ?? null,
  });

  const mutation = useRequestCorrection(reading.id);

  if (!user) return null;
  if (reading.correctionUsed || submitted) {
    return (
      <p className="text-xs text-bz-muted tracking-wider text-center">
        {t('result.correctionPending')}
      </p>
    );
  }

  return (
    <>
      <button
        onClick={() => setModalStep('confirm')}
        className="text-xs text-bz-muted border border-bz-gold/20 px-5 py-2 rounded-full hover:border-bz-gold/50 hover:text-[#4A4A4A] transition-all"
      >
        {t('result.correctionButton')}
      </button>

      {modalStep && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-bz-paper rounded-2xl w-full max-w-sm p-6 shadow-xl space-y-5">
            {modalStep === 'confirm' ? (
              <>
                <h3 className="text-bz-brown font-serif text-base text-center">{t('result.correctionConfirmTitle')}</h3>
                <p className="text-bz-muted text-sm text-center leading-relaxed">
                  {t('result.correctionOnce1')}<span className="text-bz-terra font-bold">{t('result.correctionOnce2')}</span>{t('result.correctionOnce3')}
                </p>
                <div className="flex gap-3 pt-1">
                  <button
                    onClick={() => setModalStep(null)}
                    className="flex-1 py-2 rounded-full border border-bz-border text-bz-muted text-sm hover:border-bz-mid transition-all"
                  >
                    {t('common.cancel')}
                  </button>
                  <button
                    onClick={() => setModalStep('form')}
                    className="flex-1 py-2 rounded-full bg-bz-terra text-white text-sm hover:bg-bz-terra-dark transition-all"
                  >
                    {t('common.confirm')}
                  </button>
                </div>
              </>
            ) : (
              <>
                <h3 className="text-bz-brown font-serif text-base text-center">{t('result.correctionInputTitle')}</h3>
                <BirthDateInput value={form} onChange={(dateValue) => setForm(dateValue)} />
                <p className="text-bz-muted text-xs text-center leading-relaxed">
                  {t('result.correctionNote')}
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setModalStep('confirm')}
                    className="flex-1 py-2 rounded-full border border-bz-border text-bz-muted text-sm hover:border-bz-mid transition-all"
                  >
                    {t('common.back')}
                  </button>
                  <button
                    onClick={() => mutation.mutate(form, { onSuccess: () => { setSubmitted(true); setModalStep(null); } })}
                    disabled={mutation.isPending}
                    className="flex-1 py-2 rounded-full bg-bz-terra text-white text-sm hover:bg-bz-terra-dark transition-all disabled:opacity-40"
                  >
                    {mutation.isPending ? t('result.correctionSending') : t('result.correctionSubmit')}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}

export default function ResultPage() {
  const params = useParams();
  const id = params.id as string;
  const queryClient = useQueryClient();

  const { data: reading, isLoading, error } = useReading(id);
  const { locale, t } = useLocale();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] bg-gradient-to-b from-[#F7E5BD] via-[#FFFDF6] to-white">
        <Loading message={t('loading.reading')} />
      </div>
    );
  }

  if (error || !reading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] gap-6 px-5 bg-gradient-to-b from-[#F7E5BD] via-[#FFFDF6] to-white">
        <p className="text-bz-muted text-center font-medium">
          {error instanceof Error ? localizeError(error.message, locale) : t('result.notFound')}
        </p>
        <Link
          href="/"
          className="bg-bz-terra text-white px-6 py-3 rounded-full text-sm tracking-wider hover:bg-bz-terra-dark transition-all"
        >
          {t('result.backHome')}
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full min-h-[calc(100vh-4rem)] bg-gradient-to-b from-[#F7E5BD] via-[#FFFDF6] to-white py-12">
      <div className="px-2 md:px-6">
        <ResultDisplay
          reading={reading}
          onUpdate={(updated) => queryClient.setQueryData(['reading', id], updated)}
        />

        <div className="mt-10 flex flex-col items-center gap-3">
          <CorrectionButton reading={reading} />
        </div>
      </div>
    </div>
  );
}
