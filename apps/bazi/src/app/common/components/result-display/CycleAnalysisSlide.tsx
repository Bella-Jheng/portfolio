import styles from '../../styles/bazi-content.module.css';
import type { Reading } from '../../../types/bazi';
import type { MagazineTheme } from './theme';
import {
  STEMS,
  BRANCHES,
  calculateMajorFortune,
  getAnnualPillar,
} from '../../../lib/bazi-calculator';

interface CycleAnalysisSlideProps {
  reading: Reading;
  theme: MagazineTheme;
  mobile?: boolean;
}


export function CycleAnalysisSlide({ reading, theme, mobile }: CycleAnalysisSlideProps) {
  const yearStemIdx = STEMS.indexOf(reading.pillars.year?.stem ?? '');
  const monthStemIdx = STEMS.indexOf(reading.pillars.month?.stem ?? '');
  const monthBranchIdx = BRANCHES.indexOf(reading.pillars.month?.branch ?? '');

  const currentYear = new Date().getFullYear();
  const annual = getAnnualPillar(currentYear);

  const fortune =
    yearStemIdx >= 0 && monthStemIdx >= 0 && monthBranchIdx >= 0 && !!reading.gender
      ? calculateMajorFortune(
          reading.birthYear, reading.birthMonth, reading.birthDay,
          reading.gender, yearStemIdx, monthStemIdx, monthBranchIdx,
        )
      : null;

  const virtualAge = currentYear - reading.birthYear + 1;
  const cycleIdx = fortune
    ? fortune.cycles.findLastIndex((cycle) => cycle.startAge <= virtualAge)
    : -1;
  const currentCycle = fortune && cycleIdx >= 0 ? fortune.cycles[cycleIdx] : null;

  if (!reading.fortune.cycleAnalysis && !reading.fortune.cycleAnalysisDetail) {
    return (
      <div className="flex flex-col items-center justify-center w-full h-full py-12 text-[#636363]">
        <span className="text-4xl mb-3">🔄</span>
        <p className="text-sm">尚未有大運 × 流年解析，請點選下方按鈕生成</p>
      </div>
    );
  }

  return (
    <div className={`w-full h-full flex flex-col gap-4 text-left ${mobile ? '' : 'overflow-y-auto'}`}>
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#EAE5DF] shrink-0">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🌊</span>
          <h4 className="font-black text-sm text-[#4A4A4A] tracking-wider">{currentYear}年運勢</h4>
        </div>
        <div className="text-right">
          {currentCycle && (
            <p className="text-[10px] font-mono text-[#6B6159]">大運 {currentCycle.stem}{currentCycle.branch}</p>
          )}
          <p className="text-[10px] font-mono text-[#6B6159]">流年 {annual.stem}{annual.branch} · {currentYear}</p>
        </div>
      </div>
      
      {/* Content */}
      {reading.fortune.cycleAnalysisDetail ? (
        <div
          className={`${styles.htmlContent} ${mobile ? '' : 'overflow-y-auto'}`}
          dangerouslySetInnerHTML={{ __html: reading.fortune.cycleAnalysisDetail }}
        />
      ) : (
        <div
          className={`${styles.htmlContent} ${mobile ? '' : 'overflow-y-auto'}`}
          dangerouslySetInnerHTML={{ __html: reading.fortune.cycleAnalysis ?? '' }}
        />
      )}
    </div>
  );
}
