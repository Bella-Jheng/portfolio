'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import type { StrongElementYear, StrengthCalibrationAnswer, YearFeeling } from '../../../types/bazi';
import { useLocale } from '../../../lib/i18n/locale-context';
import { elementLabel } from '../../../lib/i18n/glossary';

const ELEMENT_ACCENT: Record<string, string> = {
  木: '#7AC97A', 火: '#E87878', 土: '#C8900A', 金: '#C99A1F', 水: '#9070C0',
};

interface Props {
  element: string;
  years: StrongElementYear[];
  onComplete: (answers: StrengthCalibrationAnswer[]) => void;
  onSkip: () => void;
}

export function StrengthCalibrationModal({ element, years, onComplete, onSkip }: Props) {
  const [answers, setAnswers] = useState<Record<number, YearFeeling>>({});
  const [mounted, setMounted] = useState(false);
  const { locale, t } = useLocale();
  const elementName = elementLabel(element, locale);

  // BirthForm 被裝在 form/page.tsx 有 framer-motion transform 的祖先裡（Form Card 的 motion.div），
  // 那個 transform 會讓 fixed 元素變成相對於它定位，而不是相對於真正的視窗，導致跑版。
  // Portal 到 body 讓 fixed 定位真的以視窗為準。
  useEffect(() => setMounted(true), []);

  const setFeeling = (year: number, feeling: YearFeeling) =>
    setAnswers((prev) => ({ ...prev, [year]: feeling }));

  const handleSubmit = () => {
    const result: StrengthCalibrationAnswer[] = years
      .filter((yearInfo) => answers[yearInfo.year])
      .map((yearInfo) => ({ year: yearInfo.year, feeling: answers[yearInfo.year] }));
    if (result.length === 0) { onSkip(); return; }
    onComplete(result);
  };

  const accent = ELEMENT_ACCENT[element] ?? '#C4544A';

  if (!mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center px-5 py-8">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div className="relative bg-white border border-bz-border rounded-2xl p-7 max-w-md w-full space-y-5 shadow-xl max-h-[85vh] overflow-y-auto">
        <div className="space-y-2">
          <h3 className="text-bz-brown font-serif text-lg tracking-wide">{t('calib.title')}</h3>
          <p className="text-bz-mid text-sm leading-relaxed">
            {t('calib.intro1')} <span className="font-bold" style={{ color: accent }}>{locale === 'zh' ? `「${elementName}」` : elementName}</span>
            {locale === 'zh' ? '，' : '. '}
            {t('calib.intro2', { element: elementName })}
          </p>
        </div>

        <div className="space-y-3">
          {years.map((yearInfo) => (
            <div
              key={yearInfo.year}
              className="flex items-center justify-between gap-3 border border-bz-border/60 rounded-xl px-4 py-3"
            >
              <div>
                <p className="text-bz-brown text-sm font-medium">{t('calib.year', { year: yearInfo.year })}</p>
                <p className="text-bz-muted text-xs">
                  {t('calib.yearPillar', { pillar: `${yearInfo.stem}${yearInfo.branch}` })}{yearInfo.isDoubleMatch ? t('calib.strongest') : ''}
                </p>
              </div>
              <div className="flex gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setFeeling(yearInfo.year, 'good')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                    answers[yearInfo.year] === 'good'
                      ? 'bg-bz-terra text-white border-bz-terra'
                      : 'border-bz-border text-bz-mid hover:border-bz-terra/40'
                  }`}
                >
                  {t('calib.good')}
                </button>
                <button
                  type="button"
                  onClick={() => setFeeling(yearInfo.year, 'bad')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                    answers[yearInfo.year] === 'bad'
                      ? 'bg-bz-brown text-white border-bz-brown'
                      : 'border-bz-border text-bz-mid hover:border-bz-brown/40'
                  }`}
                >
                  {t('calib.bad')}
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-3 pt-1">
          <button
            type="button"
            onClick={onSkip}
            className="flex-1 border border-bz-border text-bz-mid py-2.5 rounded-xl text-sm hover:border-bz-brown/30 transition-all"
          >
            {t('calib.skip')}
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="flex-1 bg-bz-terra text-white py-2.5 rounded-xl text-sm hover:bg-bz-terra-dark transition-all"
          >
            {t('calib.done')}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
