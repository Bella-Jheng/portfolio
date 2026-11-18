import type { Reading } from '../../../types/bazi';
import type { MagazineTheme } from './theme';
import { ELEMENT_ENGLISH, STEM_ELEMENT } from './theme';
import {
  getTenGod,
  getBranchHiddenStems,
} from '../../../lib/bazi-calculator';
import { useLocale } from '../../../lib/i18n/locale-context';
import { elementLabel, patternLabel, strengthLabel, tenGodLabel } from '../../../lib/i18n/glossary';
import type { MessageKey } from '../../../lib/i18n/messages';

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

const PILLAR_ORDER: { type: 'hour' | 'day' | 'month' | 'year'; label: MessageKey }[] = [
  { type: 'hour', label: 'table.hour' },
  { type: 'day', label: 'table.day' },
  { type: 'month', label: 'table.month' },
  { type: 'year', label: 'table.year' },
];

interface BaziTableSlideProps {
  reading: Reading;
  theme: MagazineTheme;
  mobile?: boolean;
}

export function BaziTableSlide({ reading, theme, mobile }: BaziTableSlideProps) {
  const { locale, t } = useLocale();
  const el = (element: string) => elementLabel(element, locale);
  const tg = (tenGod: string) => tenGodLabel(tenGod, locale, true);
  const dayStem = reading.pillars.day?.stem ?? '';
  const dayElement = STEM_ELEMENT[dayStem] ?? '';
  const elementEn = ELEMENT_ENGLISH[dayElement] ?? 'BAZI READING';
  const hourPillar = reading.pillars.hour;
  const hasHour = !!hourPillar;
  const activePillars = PILLAR_ORDER.filter(({ type }) => !!reading.pillars[type]);

  const HL = theme.accent + '20';
  // 格局、用神忌神從中文主版本解析（英文翻譯的格式對不上）
  const tgs = parseTenGodSummary((reading.fortuneZh ?? reading.fortune).tenGodAnalysis);

  return (
    <div className={`w-full h-full flex flex-col gap-4 text-left ${mobile ? '' : 'overflow-y-auto'}`}>
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#EAE5DF] shrink-0">
        <div>
          <h4 className="font-black text-sm text-[#4A4A4A] tracking-wider">{t('table.title')}</h4>
          <p className="text-[10px] text-[#6B6159] font-mono tracking-widest mt-0.5">{elementEn}</p>
        </div>
        <div className="text-right text-[10px]">
          <p className="font-bold text-[#4A4A4A]">
            {locale === 'en'
              ? new Date(reading.birthYear, reading.birthMonth - 1, reading.birthDay).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
              : `${reading.birthYear}.${String(reading.birthMonth).padStart(2, '0')}.${String(reading.birthDay).padStart(2, '0')}`}
            {reading.pillars.hour && t('table.hourBranch', { branch: reading.pillars.hour.branch })}
          </p>
          {reading.gender && (
            <span
              className="inline-block text-[9px] px-2 py-0.5 rounded-full font-bold mt-1"
              style={{ backgroundColor: HL, color: theme.text }}
            >
              {reading.gender === 'male' ? t('table.male') : t('table.female')}
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
                {t('table.dayMaster', { stem: dayStem, element: el(dayElement) })}
              </span>
            )}
            {tgs.strength && (
              <span className="px-4 py-1.5 rounded-full text-sm font-bold whitespace-nowrap" style={{ backgroundColor: '#FFF8E0', color: '#8B6914' }}>
                {strengthLabel(tgs.strength, locale)}
              </span>
            )}
            {tgs.pattern && (
              <span className="px-4 py-1.5 rounded-full text-sm font-bold text-white whitespace-nowrap" style={{ backgroundColor: theme.accent }}>
                {patternLabel(tgs.pattern, locale)}
              </span>
            )}
          </div>

          {/* Row 2: 用神 / 忌神 element badges */}
          {((tgs.helpful && tgs.helpful.length > 0) || (tgs.harmful && tgs.harmful.length > 0)) && (
            <div className="flex flex-wrap gap-x-5 gap-y-2 items-center">
              {tgs.helpful && tgs.helpful.length > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[#6B6159] whitespace-nowrap">{t('table.helpful')}</span>
                  <div className="flex gap-1.5">
                    {tgs.helpful.map((element) => {
                      const badge = ELEMENT_BADGE[element];
                      return badge ? (
                        <span key={element} className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap ${badge.pill}`}>
                          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${badge.dot}`} />
                          {elementLabel(element, locale)}
                        </span>
                      ) : null;
                    })}
                  </div>
                </div>
              )}
              {tgs.harmful && tgs.harmful.length > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[#6B6159] whitespace-nowrap">{t('table.harmful')}</span>
                  <div className="flex gap-1.5">
                    {tgs.harmful.map((element) => {
                      const badge = ELEMENT_BADGE[element];
                      return badge ? (
                        <span key={element} className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap ${badge.pill}`}>
                          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${badge.dot}`} />
                          {elementLabel(element, locale)}
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
        <div className="text-left text-xs font-bold text-[#6E665D]">{t('table.rowPillar')}</div>
        {/* Hour — always shown */}
        <div className={`text-xs font-black tracking-widest ${hasHour ? 'text-[#5C5449]' : 'text-[#B0A898]'}`}>{t('table.hour')}</div>
        {/* Day, Month, Year */}
        {activePillars.filter(({ type }) => type !== 'hour').map(({ type, label }) => (
          <div key={type} className="text-xs font-black tracking-widest text-[#5C5449]" style={type === 'day' ? { color: theme.accent } : {}}>
            {t(label)}
          </div>
        ))}

        {/* Row 2: 主星 */}
        <div className="text-left text-xs font-bold text-[#6E665D]">{t('table.rowMain')}</div>
        <div className={`text-xs font-bold ${hasHour ? 'text-[#5C544C]' : 'text-[#C8BFB6]'}`}>
          {hasHour ? tg(getTenGod(dayStem, hourPillar?.stem ?? '')) : t('table.noHour')}
        </div>
        {activePillars.filter(({ type }) => type !== 'hour').map(({ type }) => {
          const pillar = reading.pillars[type];
          if (!pillar) return null;
          const tenGod = type === 'day' ? '日主' : getTenGod(dayStem, pillar.stem);
          return (
            <div key={type} className="text-xs font-bold text-[#5C544C]" style={type === 'day' ? { color: theme.accent } : {}}>
              {tg(tenGod)}
            </div>
          );
        })}

        {/* Row 3: 天干 */}
        <div className="text-left text-xs font-bold text-[#6E665D] self-center">{t('table.rowStem')}</div>
        <div className="flex justify-center w-full">
          {hasHour ? (
            <div className="flex flex-col items-center justify-center bg-white border py-2.5 rounded-xl shadow-sm w-full max-w-[50px]" style={{ borderColor: 'rgba(234,229,223,0.8)' }}>
              <span className="text-2xl font-black leading-none text-[#3A3A3A]">{hourPillar?.stem}</span>
              <span className="text-[10px] text-[#A09587] font-bold mt-1">{el(STEM_ELEMENT[hourPillar?.stem ?? ''] ?? '')}</span>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center border border-dashed border-[#D5CEC7] py-2.5 rounded-xl w-full max-w-[50px]">
              <span className="text-[9px] text-[#B0A898] font-bold leading-tight text-center">{t('table.unknown')}</span>
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
                <span className="text-[10px] text-[#A09587] font-bold mt-1">{el(stemEl)}</span>
              </div>
            </div>
          );
        })}

        {/* Row 4: 地支 */}
        <div className="text-left text-xs font-bold text-[#6E665D] self-center">{t('table.rowBranch')}</div>
        <div className="flex justify-center w-full">
          {hasHour ? (
            <div className="flex flex-col items-center justify-center bg-white border py-2.5 rounded-xl shadow-sm w-full max-w-[50px]" style={{ borderColor: 'rgba(234,229,223,0.8)' }}>
              <span className="text-2xl font-black leading-none text-[#3A3A3A]">{hourPillar?.branch}</span>
              <span className="text-[10px] text-[#A09587] font-bold mt-1">{el(hourPillar?.element.split('/')[1] ?? '')}</span>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center border border-dashed border-[#D5CEC7] py-2.5 rounded-xl w-full max-w-[50px]">
              <span className="text-[9px] text-[#B0A898] font-bold leading-tight text-center">{t('table.unknown')}</span>
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
                <span className="text-[10px] text-[#A09587] font-bold mt-1">{el(branchEl)}</span>
              </div>
            </div>
          );
        })}

        {/* Row 5: 藏干 */}
        <div className="text-left text-xs font-bold text-[#6E665D]">{t('table.rowHidden')}</div>
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
        <div className="text-left text-xs font-bold text-[#6E665D]">{t('table.rowSub')}</div>
        <div className="flex flex-col items-center justify-center min-h-[28px]">
          {hasHour && getBranchHiddenStems(hourPillar?.branch ?? '', dayStem).map((h) => (
            <span key={h.stem} className="text-[10px] text-[#5C5449] font-medium leading-tight text-center">{tg(h.tenGod)}</span>
          ))}
        </div>
        {activePillars.filter(({ type }) => type !== 'hour').map(({ type }) => {
          const pillar = reading.pillars[type];
          if (!pillar) return null;
          const hidden = getBranchHiddenStems(pillar.branch, dayStem);
          return (
            <div key={type} className="flex flex-col items-center justify-center min-h-[28px]">
              {hidden.map((h) => (
                <span key={h.stem} className="text-[10px] text-[#5C5449] font-medium leading-tight text-center">{tg(h.tenGod)}</span>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}

