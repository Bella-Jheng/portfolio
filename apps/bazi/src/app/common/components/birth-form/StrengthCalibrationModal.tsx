'use client';

import { useState } from 'react';
import type { StrongElementYear, StrengthCalibrationAnswer, YearFeeling } from '../../../types/bazi';

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-5 py-8">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div className="relative bg-white border border-bz-border rounded-2xl p-7 max-w-md w-full space-y-5 shadow-xl max-h-[85vh] overflow-y-auto">
        <div className="space-y-2">
          <h3 className="text-bz-brown font-serif text-lg tracking-wide">校正命盤：這幾年過得好嗎？</h3>
          <p className="text-bz-mid text-sm leading-relaxed">
            你的日主五行偏向 <span className="font-bold" style={{ color: accent }}>「{element}」</span>，
            以下是命盤中{element}氣特別重的年份。回想一下這些年過得順不順，能幫助我們更準確判斷你的命盤格局（身強、身弱）。
          </p>
        </div>

        <div className="space-y-3">
          {years.map((yearInfo) => (
            <div
              key={yearInfo.year}
              className="flex items-center justify-between gap-3 border border-bz-border/60 rounded-xl px-4 py-3"
            >
              <div>
                <p className="text-bz-brown text-sm font-medium">{yearInfo.year} 年</p>
                <p className="text-bz-muted text-xs">
                  {yearInfo.stem}{yearInfo.branch}年{yearInfo.isDoubleMatch ? '・氣最重' : ''}
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
                  過得好
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
                  不太好
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
            略過此步驟
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="flex-1 bg-bz-terra text-white py-2.5 rounded-xl text-sm hover:bg-bz-terra-dark transition-all"
          >
            完成，開始排盤
          </button>
        </div>
      </div>
    </div>
  );
}
