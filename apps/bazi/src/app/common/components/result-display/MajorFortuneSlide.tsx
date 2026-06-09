import type { Reading } from '../../../types/bazi';
import type { MagazineTheme } from './theme';
import {
  STEMS,
  BRANCHES,
  calculateMajorFortune,
  getAnnualPillar,
} from '../../../lib/bazi-calculator';

interface MajorFortuneSlideProps {
  reading: Reading;
  theme: MagazineTheme;
  mobile?: boolean;
}

function CycleCol({
  age,
  year,
  stem,
  branch,
  isActive,
  accent,
  showYear,
}: {
  age: number;
  year: number;
  stem: string;
  branch: string;
  isActive: boolean;
  accent: string;
  showYear?: boolean;
}) {
  return (
    <div
      className="flex flex-col items-center gap-1.5 px-2 py-2 rounded-xl min-w-[42px] transition-all shrink-0"
      style={isActive ? { backgroundColor: accent } : {}}
    >
      <span className={`font-mono text-[10px] leading-none ${isActive ? 'font-black text-white' : 'text-[#6E665D]'}`}>
        {age}歲
      </span>
      {showYear && (
        <span className={`font-mono text-[9px] leading-none ${isActive ? 'text-white/80' : 'text-[#9E9E9E]'}`}>
          {year}
        </span>
      )}
      <div className="flex flex-col items-center leading-none font-black gap-0.5">
        <span className={`text-base ${isActive ? 'text-white' : 'text-[#3A3A3A]'}`}>{stem}</span>
        <span className={`text-base ${isActive ? 'text-white' : 'text-[#3A3A3A]'}`}>{branch}</span>
      </div>
    </div>
  );
}

export function MajorFortuneSlide({ reading, theme, mobile }: MajorFortuneSlideProps) {
  const yearStemIdx = STEMS.indexOf(reading.pillars.year?.stem ?? '');
  const monthStemIdx = STEMS.indexOf(reading.pillars.month?.stem ?? '');
  const monthBranchIdx = BRANCHES.indexOf(reading.pillars.month?.branch ?? '');

  if (yearStemIdx < 0 || monthStemIdx < 0 || monthBranchIdx < 0 || !reading.gender) {
    return (
      <div className="flex flex-col items-center justify-center w-full h-full py-12 text-[#636363]">
        <span className="text-4xl mb-3">📅</span>
        <p className="text-sm">需要性別資料才能計算大運</p>
      </div>
    );
  }

  const fortune = calculateMajorFortune(
    reading.birthYear, reading.birthMonth, reading.birthDay,
    reading.gender, yearStemIdx, monthStemIdx, monthBranchIdx,
  );

  const currentYear = new Date().getFullYear();
  const currentVirtualAge = currentYear - reading.birthYear + 1;
  const currentCycleIdx = fortune.cycles.findLastIndex((cycle) => cycle.startAge <= currentVirtualAge);
  const displayYears = Math.floor(fortune.startDays / 3);
  const displayMonths = (fortune.startDays % 3) * 4;

  const annualLuck = Array.from({ length: 10 }, (_, index) => {
    const y = currentYear - 4 + index;
    return { year: y, age: y - reading.birthYear + 1, ...getAnnualPillar(y) };
  });

  return (
    <div className={`w-full h-full flex flex-col gap-4 text-left ${mobile ? '' : 'overflow-y-auto'}`}>
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#EAE5DF] shrink-0">
        <h4 className="font-black text-sm text-[#4A4A4A] tracking-wider">大運 / 流年</h4>
        <span className="text-[10px] text-[#6B6159] font-mono">
          出生後 {displayYears} 年{displayMonths > 0 ? ` ${displayMonths} 個月` : ''}起運
        </span>
      </div>

      {/* 大運 */}
      <div className="space-y-2 shrink-0">
        <div>
          <p className="text-xs font-bold text-[#4A4A4A] tracking-wider">大運</p>
          <p className="text-[10px] text-[#6B6159] mt-0.5 leading-relaxed">每十年一個周期，決定人生各階段的整體背景氣場與大環境趨勢。好的大運如順風，逆的大運需更努力才能維持現狀。</p>
        </div>
        <div className="overflow-x-auto bg-[#FAF8F5] border border-[#EAE5DF]/60 p-3 rounded-2xl">
          <div className="flex gap-1.5 min-w-max">
            {fortune.cycles.map((cycle, index) => (
              <CycleCol
                key={index}
                age={cycle.startAge}
                year={cycle.startYear}
                stem={cycle.stem}
                branch={cycle.branch}
                isActive={index === currentCycleIdx}
                accent={theme.accent}
                showYear
              />
            ))}
          </div>
        </div>
      </div>

      {/* 流年 */}
      <div className="space-y-2 shrink-0">
        <div>
          <p className="text-xs font-bold text-[#4A4A4A] tracking-wider">流年 · 近十年</p>
          <p className="text-[10px] text-[#6B6159] mt-0.5 leading-relaxed">每一年的當年運勢，受該年天干地支影響。在好大運中遇順流年如虎添翼，逆大運中的好流年則能短暫解厄。</p>
        </div>
        <div className="overflow-x-auto bg-[#FAF8F5] border border-[#EAE5DF]/60 p-3 rounded-2xl">
          <div className="flex gap-1.5 min-w-max">
            {annualLuck.map(({ year, age, stem, branch }) => (
              <CycleCol
                key={year}
                age={age}
                year={year}
                stem={stem}
                branch={branch}
                isActive={year === currentYear}
                accent={theme.accent}
                showYear
              />
            ))}
          </div>
        </div>
      </div>

    </div>
  );
}
