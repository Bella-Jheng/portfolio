import type { Reading } from '../../../types/bazi';
import type { MagazineTheme } from './theme';
import { ELEMENT_ENGLISH, STEM_ELEMENT } from './theme';
import {
  STEMS,
  BRANCHES,
  getTenGod,
  getBranchHiddenStems,
  calculateMajorFortune,
} from '../../../lib/bazi-calculator';

const FIVE_ELEMENTS = new Set(['木', '火', '土', '金', '水']);

const ELEMENT_BADGE: Record<string, { pill: string; dot: string }> = {
  木: { pill: 'bg-bz-element-wood-bg text-bz-element-wood-text', dot: 'bg-bz-element-wood-accent' },
  火: { pill: 'bg-bz-element-fire-bg text-bz-element-fire-text', dot: 'bg-bz-element-fire-accent' },
  土: { pill: 'bg-bz-element-earth-bg text-bz-element-earth-text', dot: 'bg-bz-element-earth-accent' },
  金: { pill: 'bg-bz-element-metal-bg text-bz-element-metal-text', dot: 'bg-bz-element-metal-accent' },
  水: { pill: 'bg-bz-element-water-bg text-bz-element-water-text', dot: 'bg-bz-element-water-accent' },
};

function extractElements(text: string): string[] {
  const seen = new Set<string>();
  return text.split('').filter((char) => {
    if (FIVE_ELEMENTS.has(char) && !seen.has(char)) { seen.add(char); return true; }
    return false;
  });
}

function parseTenGodSummary(text?: string | null) {
  if (!text) return {};
  const line = text.split('\n')[0];
  const patternMatch = line.match(/【格局】([^｜\n]+)/);
  const strengthMatch = line.match(/(身強|身弱)/);
  const helpfulMatch = line.match(/用神[：:]\s*([^｜\n]+)/);
  const harmfulMatch = line.match(/忌神[：:]\s*([^｜\n]+)/);
  return {
    pattern: patternMatch?.[1]?.trim(),
    strength: strengthMatch?.[1],
    helpful: helpfulMatch ? extractElements(helpfulMatch[1]) : [],
    harmful: harmfulMatch ? extractElements(harmfulMatch[1]) : [],
  };
}

const PILLAR_ORDER = [
  { type: 'hour' as const, label: '時' },
  { type: 'day' as const, label: '日' },
  { type: 'month' as const, label: '月' },
  { type: 'year' as const, label: '年' },
];

interface BaziTableSlideProps {
  reading: Reading;
  theme: MagazineTheme;
  mobile?: boolean;
}

export function BaziTableSlide({ reading, theme, mobile }: BaziTableSlideProps) {
  const dayStem = reading.pillars.day?.stem ?? '';
  const dayElement = STEM_ELEMENT[dayStem] ?? '';
  const elementEn = ELEMENT_ENGLISH[dayElement] ?? 'BAZI READING';
  const hourPillar = reading.pillars.hour;
  const hasHour = !!hourPillar;
  const activePillars = PILLAR_ORDER.filter(({ type }) => !!reading.pillars[type]);

  const yearStemIdx = STEMS.indexOf(reading.pillars.year?.stem ?? '');
  const monthStemIdx = STEMS.indexOf(reading.pillars.month?.stem ?? '');
  const monthBranchIdx = BRANCHES.indexOf(reading.pillars.month?.branch ?? '');

  const fortune =
    yearStemIdx >= 0 && monthStemIdx >= 0 && monthBranchIdx >= 0 && !!reading.gender
      ? calculateMajorFortune(
          reading.birthYear, reading.birthMonth, reading.birthDay,
          reading.gender, yearStemIdx, monthStemIdx, monthBranchIdx,
        )
      : null;

  const currentVirtualAge = new Date().getFullYear() - reading.birthYear + 1;
  const currentCycleIdx = fortune
    ? fortune.cycles.findLastIndex((cycle) => cycle.startAge <= currentVirtualAge)
    : -1;
  const HL = theme.accent + '20';
  const tgs = parseTenGodSummary(reading.fortune.tenGodAnalysis);

  return (
    <div className={`w-full h-full flex flex-col gap-4 text-left ${mobile ? '' : 'overflow-y-auto'}`}>
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#EAE5DF] shrink-0">
        <div>
          <h4 className="font-black text-sm text-[#4A4A4A] tracking-wider">基本排盤</h4>
          <p className="text-[10px] text-[#6B6159] font-mono tracking-widest mt-0.5">{elementEn}</p>
        </div>
        <div className="text-right text-[10px]">
          <p className="font-bold text-[#4A4A4A]">
            {reading.birthYear}.{String(reading.birthMonth).padStart(2, '0')}.{String(reading.birthDay).padStart(2, '0')}
            {reading.pillars.hour && ` · ${reading.pillars.hour.branch}時`}
          </p>
          {reading.gender && (
            <span
              className="inline-block text-[9px] px-2 py-0.5 rounded-full font-bold mt-1"
              style={{ backgroundColor: HL, color: theme.text }}
            >
              {reading.gender === 'male' ? '男命' : '女命'}
            </span>
          )}
        </div>
      </div>

      {/* Summary badges */}
      {(tgs.pattern || tgs.strength || (tgs.helpful && tgs.helpful.length > 0)) && (
        <div className="flex flex-col gap-3 shrink-0">
          {/* Row 1: 日主、身強弱、格局 */}
          <div className="flex flex-wrap gap-2 items-center">
            {dayStem && (
              <span className="px-4 py-1.5 rounded-full border border-[#D5CEC7] text-sm font-bold text-[#4A4A4A] bg-white whitespace-nowrap">
                日主 {dayStem}（{dayElement}）
              </span>
            )}
            {tgs.strength && (
              <span className="px-4 py-1.5 rounded-full text-sm font-bold whitespace-nowrap" style={{ backgroundColor: '#FFF8E0', color: '#8B6914' }}>
                {tgs.strength}
              </span>
            )}
            {tgs.pattern && (
              <span className="px-4 py-1.5 rounded-full text-sm font-bold text-white whitespace-nowrap" style={{ backgroundColor: theme.accent }}>
                {tgs.pattern}
              </span>
            )}
          </div>

          {/* Row 2: 用神 / 忌神 element badges */}
          {((tgs.helpful && tgs.helpful.length > 0) || (tgs.harmful && tgs.harmful.length > 0)) && (
            <div className="flex flex-wrap gap-x-5 gap-y-2 items-center">
              {tgs.helpful && tgs.helpful.length > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[#6B6159] whitespace-nowrap">用神・喜</span>
                  <div className="flex gap-1.5">
                    {tgs.helpful.map((el) => {
                      const badge = ELEMENT_BADGE[el];
                      return badge ? (
                        <span key={el} className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap ${badge.pill}`}>
                          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${badge.dot}`} />
                          {el}
                        </span>
                      ) : null;
                    })}
                  </div>
                </div>
              )}
              {tgs.harmful && tgs.harmful.length > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[#6B6159] whitespace-nowrap">忌神・避</span>
                  <div className="flex gap-1.5">
                    {tgs.harmful.map((el) => {
                      const badge = ELEMENT_BADGE[el];
                      return badge ? (
                        <span key={el} className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap ${badge.pill}`}>
                          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${badge.dot}`} />
                          {el}
                        </span>
                      ) : null;
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Structured Grid Layout for Bazi Chart */}
      <div className="grid grid-cols-5 gap-y-3 gap-x-1 items-center text-center bg-[#FAF8F5] border border-[#EAE5DF]/60 p-4 rounded-2xl shrink-0">
        {/* Row 1: 柱別 */}
        <div className="text-left text-xs font-bold text-[#6E665D]">柱別</div>
        {/* Hour — always shown */}
        <div className={`text-xs font-black tracking-widest ${hasHour ? 'text-[#5C5449]' : 'text-[#B0A898]'}`}>時柱</div>
        {/* Day, Month, Year */}
        {activePillars.filter(({ type }) => type !== 'hour').map(({ type, label }) => (
          <div key={type} className="text-xs font-black tracking-widest text-[#5C5449]" style={type === 'day' ? { color: theme.accent } : {}}>
            {label}柱
          </div>
        ))}

        {/* Row 2: 主星 */}
        <div className="text-left text-xs font-bold text-[#6E665D]">主星</div>
        <div className={`text-xs font-bold ${hasHour ? 'text-[#5C544C]' : 'text-[#C8BFB6]'}`}>
          {hasHour ? getTenGod(dayStem, hourPillar?.stem ?? '') : '未填寫時柱'}
        </div>
        {activePillars.filter(({ type }) => type !== 'hour').map(({ type }) => {
          const pillar = reading.pillars[type];
          if (!pillar) return null;
          const tg = type === 'day' ? '日主' : getTenGod(dayStem, pillar.stem);
          return (
            <div key={type} className="text-xs font-bold text-[#5C544C]" style={type === 'day' ? { color: theme.accent } : {}}>
              {tg}
            </div>
          );
        })}

        {/* Row 3: 天干 */}
        <div className="text-left text-xs font-bold text-[#6E665D] self-center">天干</div>
        <div className="flex justify-center w-full">
          {hasHour ? (
            <div className="flex flex-col items-center justify-center bg-white border py-2.5 rounded-xl shadow-sm w-full max-w-[50px]" style={{ borderColor: 'rgba(234,229,223,0.8)' }}>
              <span className="text-2xl font-black leading-none text-[#3A3A3A]">{hourPillar?.stem}</span>
              <span className="text-[10px] text-[#A09587] font-bold mt-1">{STEM_ELEMENT[hourPillar?.stem ?? ''] ?? ''}</span>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center border border-dashed border-[#D5CEC7] py-2.5 rounded-xl w-full max-w-[50px]">
              <span className="text-[9px] text-[#B0A898] font-bold leading-tight text-center">未知</span>
            </div>
          )}
        </div>
        {activePillars.filter(({ type }) => type !== 'hour').map(({ type }) => {
          const pillar = reading.pillars[type];
          if (!pillar) return null;
          const stemEl = STEM_ELEMENT[pillar.stem] ?? '';
          const isDay = type === 'day';
          return (
            <div key={type} className="flex justify-center w-full">
              <div
                className="flex flex-col items-center justify-center bg-white border py-2.5 rounded-xl shadow-sm w-full max-w-[50px]"
                style={isDay ? { borderColor: theme.accent } : { borderColor: 'rgba(234,229,223,0.8)' }}
              >
                <span className="text-2xl font-black leading-none text-[#3A3A3A]" style={isDay ? { color: theme.accent } : {}}>
                  {pillar.stem}
                </span>
                <span className="text-[10px] text-[#A09587] font-bold mt-1">{stemEl}</span>
              </div>
            </div>
          );
        })}

        {/* Row 4: 地支 */}
        <div className="text-left text-xs font-bold text-[#6E665D] self-center">地支</div>
        <div className="flex justify-center w-full">
          {hasHour ? (
            <div className="flex flex-col items-center justify-center bg-white border py-2.5 rounded-xl shadow-sm w-full max-w-[50px]" style={{ borderColor: 'rgba(234,229,223,0.8)' }}>
              <span className="text-2xl font-black leading-none text-[#3A3A3A]">{hourPillar?.branch}</span>
              <span className="text-[10px] text-[#A09587] font-bold mt-1">{hourPillar?.element.split('/')[1] ?? ''}</span>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center border border-dashed border-[#D5CEC7] py-2.5 rounded-xl w-full max-w-[50px]">
              <span className="text-[9px] text-[#B0A898] font-bold leading-tight text-center">未知</span>
            </div>
          )}
        </div>
        {activePillars.filter(({ type }) => type !== 'hour').map(({ type }) => {
          const pillar = reading.pillars[type];
          if (!pillar) return null;
          const branchEl = pillar.element.split('/')[1] ?? '';
          const isDay = type === 'day';
          return (
            <div key={type} className="flex justify-center w-full">
              <div
                className="flex flex-col items-center justify-center bg-white border py-2.5 rounded-xl shadow-sm w-full max-w-[50px]"
                style={isDay ? { borderColor: theme.accent } : { borderColor: 'rgba(234,229,223,0.8)' }}
              >
                <span className="text-2xl font-black leading-none text-[#3A3A3A]" style={isDay ? { color: theme.accent } : {}}>
                  {pillar.branch}
                </span>
                <span className="text-[10px] text-[#A09587] font-bold mt-1">{branchEl}</span>
              </div>
            </div>
          );
        })}

        {/* Row 5: 藏干 */}
        <div className="text-left text-xs font-bold text-[#6E665D]">藏干</div>
        <div className="flex gap-1 justify-center flex-wrap min-h-[22px] items-center">
          {hasHour && getBranchHiddenStems(hourPillar?.branch ?? '', dayStem).map((h) => (
            <span key={h.stem} className="text-[11px] font-bold text-[#6B5D57] bg-white border border-[#EAE5DF]/60 px-1 py-0.5 rounded shadow-sm">
              {h.stem}
            </span>
          ))}
        </div>
        {activePillars.filter(({ type }) => type !== 'hour').map(({ type }) => {
          const pillar = reading.pillars[type];
          if (!pillar) return null;
          const hidden = getBranchHiddenStems(pillar.branch, dayStem);
          return (
            <div key={type} className="flex gap-1 justify-center flex-wrap min-h-[22px] items-center">
              {hidden.map((h) => (
                <span key={h.stem} className="text-[11px] font-bold text-[#6B5D57] bg-white border border-[#EAE5DF]/60 px-1 py-0.5 rounded shadow-sm">
                  {h.stem}
                </span>
              ))}
            </div>
          );
        })}

        {/* Row 6: 副星 */}
        <div className="text-left text-xs font-bold text-[#6E665D]">副星</div>
        <div className="flex flex-col items-center justify-center min-h-[28px]">
          {hasHour && getBranchHiddenStems(hourPillar?.branch ?? '', dayStem).map((h) => (
            <span key={h.stem} className="text-[10px] text-[#5C5449] font-medium leading-tight">{h.tenGod}</span>
          ))}
        </div>
        {activePillars.filter(({ type }) => type !== 'hour').map(({ type }) => {
          const pillar = reading.pillars[type];
          if (!pillar) return null;
          const hidden = getBranchHiddenStems(pillar.branch, dayStem);
          return (
            <div key={type} className="flex flex-col items-center justify-center min-h-[28px]">
              {hidden.map((h) => (
                <span key={h.stem} className="text-[10px] text-[#5C5449] font-medium leading-tight">{h.tenGod}</span>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}

