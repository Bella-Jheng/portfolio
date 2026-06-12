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

  if (!reading.fortune.cycleAnalysis) {
    return (
      <div className="flex flex-col items-center justify-center w-full h-full py-12 text-[#636363]">
        <span className="text-4xl mb-3">🔄</span>
        <p className="text-sm">尚未有大運 × 流年解析，請使用 Admin 重新排盤</p>
      </div>
    );
  }

  return (
    <div className={`w-full h-full flex flex-col gap-4 text-left ${mobile ? '' : 'overflow-y-auto'}`}>
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#EAE5DF] shrink-0">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🌊</span>
          <h4 className="font-black text-sm text-[#4A4A4A] tracking-wider">大運 × 流年解析</h4>
        </div>
        <div className="text-right">
          {currentCycle && (
            <p className="text-[10px] font-mono text-[#6B6159]">大運 {currentCycle.stem}{currentCycle.branch}</p>
          )}
          <p className="text-[10px] font-mono text-[#6B6159]">流年 {annual.stem}{annual.branch} · {currentYear}</p>
        </div>
      </div>

      {/* Badges */}
      {currentCycle && (
        <div className="flex gap-2 shrink-0">
          <div
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-white text-xs font-bold"
            style={{ backgroundColor: theme.accent }}
          >
            <span>大運</span>
            <span className="font-mono">{currentCycle.stem}{currentCycle.branch}</span>
            <span className="opacity-70 text-[10px]">（{currentCycle.startAge}歲起）</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-[#FAF8F5] border border-[#EAE5DF]" style={{ color: theme.accent }}>
            <span>流年</span>
            <span className="font-mono">{annual.stem}{annual.branch}</span>
            <span className="text-[#6B6159] text-[10px]">{currentYear}</span>
          </div>
        </div>
      )}

      {/* 名詞解釋 */}
      <div className="flex gap-0 shrink-0 rounded-xl overflow-hidden border border-[#EAE5DF] text-xs">
        <div className="flex-1 px-3 py-2.5 bg-[#FAF8F5]">
          <span className="font-black text-[#4A4A4A]">大運</span>
          <span className="text-[#7A6E65] ml-1">每 10 年一換的人生主題周期，決定這段時間的整體氣場走向，對應上方「大運／流年」卡片</span>
        </div>
        <div className="w-px bg-[#EAE5DF] shrink-0" />
        <div className="flex-1 px-3 py-2.5 bg-[#FAF8F5]">
          <span className="font-black text-[#4A4A4A]">流年</span>
          <span className="text-[#7A6E65] ml-1">每年天干地支的能量場，與大運交互影響當年運勢高低起伏</span>
        </div>
      </div>

      {/* Content */}
      <div
        className={`${styles.htmlContent} ${mobile ? '' : 'overflow-y-auto'}`}
        dangerouslySetInnerHTML={{ __html: reading.fortune.cycleAnalysis ?? '' }}
      />
    </div>
  );
}
