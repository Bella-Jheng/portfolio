import styles from '../../styles/bazi-content.module.css';
import type { Reading } from '../../../types/bazi';
import type { MagazineTheme } from './theme';
import { getMonthPillar } from '../../../lib/bazi-calculator';

interface MonthlyFortuneSlideProps {
  reading: Reading;
  theme: MagazineTheme;
  mobile?: boolean;
}

export function MonthlyFortuneSlide({ reading, theme, mobile }: MonthlyFortuneSlideProps) {
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth() + 1;
  const monthly = getMonthPillar(currentYear, currentMonth, today.getDate());

  if (!reading.fortune.monthlyFortune && !reading.fortune.monthlyFortuneDetail) {
    return (
      <div className="flex flex-col items-center justify-center w-full h-full py-12 text-[#636363]">
        <span className="text-4xl mb-3">🌙</span>
        <p className="text-sm">尚未有當月運勢解析，請點選下方按鈕生成</p>
      </div>
    );
  }

  return (
    <div className={`w-full h-full flex flex-col gap-4 text-left ${mobile ? '' : 'overflow-y-auto'}`}>
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#EAE5DF] shrink-0">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🌙</span>
          <h4 className="font-black text-sm text-[#4A4A4A] tracking-wider">{currentMonth}月運勢</h4>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-mono text-[#6B6159]">流月 {monthly.stem}{monthly.branch} · {currentYear}年{currentMonth}月</p>
        </div>
      </div>

      {/* Content */}
      {reading.fortune.monthlyFortuneDetail ? (
        <div
          className={`${styles.htmlContent} ${mobile ? '' : 'overflow-y-auto'}`}
          dangerouslySetInnerHTML={{ __html: reading.fortune.monthlyFortuneDetail }}
        />
      ) : (
        <div
          className={`${styles.htmlContent} ${mobile ? '' : 'overflow-y-auto'}`}
          dangerouslySetInnerHTML={{ __html: reading.fortune.monthlyFortune ?? '' }}
        />
      )}
    </div>
  );
}
