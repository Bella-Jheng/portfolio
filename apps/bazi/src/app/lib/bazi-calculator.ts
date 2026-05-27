import type { BaziPillars, Pillar } from '../types/bazi';

export const STEMS   = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
export const BRANCHES = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

const STEM_ELEMENTS: Record<string, string> = {
  甲: '木', 乙: '木', 丙: '火', 丁: '火', 戊: '土',
  己: '土', 庚: '金', 辛: '金', 壬: '水', 癸: '水',
};

const BRANCH_ELEMENTS: Record<string, string> = {
  子: '水', 丑: '土', 寅: '木', 卯: '木', 辰: '土',
  巳: '火', 午: '火', 未: '土', 申: '金', 酉: '金',
  戌: '土', 亥: '水',
};

function getPillarElement(stem: string, branch: string): string {
  return `${STEM_ELEMENTS[stem]}/${BRANCH_ELEMENTS[branch]}`;
}

function mod(n: number, m: number): number {
  return ((n % m) + m) % m;
}

function getJulianDayNumber(year: number, month: number, day: number): number {
  let y = year;
  let m = month;
  if (m <= 2) { y -= 1; m += 12; }
  const A = Math.floor(y / 100);
  const B = 2 - A + Math.floor(A / 4);
  return Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + day + B - 1524;
}

// ─── Reference: 1900/01/01 = 甲戌日 ─────────────────────────────────────────
// stem index 0 = 甲, branch index 10 = 戌
const JDN_BASE = 2415021;

// ─── Approximate major solar term (節) day per calendar month ────────────────
// Formula: floor(Y * 0.2422 + C) - floor((Y-1) / 4)
// where Y = year % 100 (use 100 for multiples of 100)
// Accurate to ±1 day for 1900-2100
const JIEQI_COEFF: Record<number, number> = {
  1:  5.4055,  // 小寒 → 丑月 start
  2:  4.8073,  // 立春 → 寅月 start (also year boundary)
  3:  6.3900,  // 驚蟄 → 卯月 start
  4:  5.1525,  // 清明 → 辰月 start
  5:  5.9480,  // 立夏 → 巳月 start
  6:  6.3780,  // 芒種 → 午月 start
  7:  7.1902,  // 小暑 → 未月 start
  8:  7.3708,  // 立秋 → 申月 start
  9:  7.5844,  // 白露 → 酉月 start
  10: 8.1087,  // 寒露 → 戌月 start
  11: 7.4089,  // 立冬 → 亥月 start
  12: 7.1921,  // 大雪 → 子月 start
};

// 中氣 (mid-month solar terms) coefficients — used for 逆排 起運 calculation
const ZHONGQI_COEFF: Record<number, number> = {
  1:  20.3872, // 大寒
  2:  19.1568, // 雨水
  3:  20.8420, // 春分
  4:  20.5922, // 穀雨
  5:  21.1966, // 小滿
  6:  21.9300, // 夏至
  7:  23.1300, // 大暑
  8:  23.2820, // 處暑
  9:  23.0420, // 秋分
  10: 23.4979, // 霜降
  11: 22.9300, // 小雪
  12: 22.3300, // 冬至
};

function getSolarTermDay(year: number, calendarMonth: number): number {
  const C = JIEQI_COEFF[calendarMonth];
  const Y = year % 100 === 0 ? 100 : year % 100;
  return Math.floor(Y * 0.2422 + C) - Math.floor((Y - 1) / 4);
}

function getZhongqiDay(year: number, calendarMonth: number): number {
  const C = ZHONGQI_COEFF[calendarMonth];
  const Y = year % 100 === 0 ? 100 : year % 100;
  return Math.floor(Y * 0.2422 + C) - Math.floor((Y - 1) / 4);
}

// ─── Month branch + adjusted year (for month stem) ──────────────────────────
// Returns which 月支 the date falls in, and which year's stem to use
function getMonthBranchAndYear(
  year: number,
  month: number,
  day: number,
): { branchIndex: number; stemYear: number } {
  const termDay = getSolarTermDay(year, month);
  const afterTerm = day >= termDay;

  if (month === 1) {
    // Before 小寒 → still 子月 of previous year
    return afterTerm
      ? { branchIndex: 1, stemYear: year }      // 丑月
      : { branchIndex: 0, stemYear: year - 1 }; // 子月 (prev year)
  }

  if (month === 2) {
    // 立春 = year AND month boundary
    return afterTerm
      ? { branchIndex: 2, stemYear: year }      // 寅月 (new year)
      : { branchIndex: 1, stemYear: year - 1 }; // 丑月 (old year)
  }

  // March–December: solar term starts current Chinese month
  const BRANCH_MAP: Record<number, number> = {
    3: 3, 4: 4, 5: 5, 6: 6,
    7: 7, 8: 8, 9: 9, 10: 10,
    11: 11, 12: 0,
  };
  const currentBranch = BRANCH_MAP[month];
  const branchIndex = afterTerm ? currentBranch : mod(currentBranch - 1, 12);
  return { branchIndex, stemYear: year };
}

// ─── Year pillar ─────────────────────────────────────────────────────────────
// 1984 = 甲子年 reference; 立春 is the year boundary
function getYearPillar(bornYear: number): Pillar {
  const stemIndex  = mod(bornYear - 1984, 10);
  const branchIndex = mod(bornYear - 1984, 12);
  const stem   = STEMS[stemIndex];
  const branch = BRANCHES[branchIndex];
  return { stem, branch, element: getPillarElement(stem, branch) };
}

// ─── Month pillar ────────────────────────────────────────────────────────────
// 五虎遁年起月法: 寅月(index 2) stem = yearStem%5*2 + 2
// general: monthStem = (yearStem%5*2 + monthBranch) % 10
function getMonthPillar(year: number, month: number, day: number): Pillar {
  const { branchIndex, stemYear } = getMonthBranchAndYear(year, month, day);
  const yearStemIndex = mod(stemYear - 1984, 10);
  const stemIndex = mod(yearStemIndex % 5 * 2 + branchIndex, 10);
  const stem   = STEMS[stemIndex];
  const branch = BRANCHES[branchIndex];
  return { stem, branch, element: getPillarElement(stem, branch) };
}

// ─── Day pillar ──────────────────────────────────────────────────────────────
// Reference: 1900/01/01 = 甲戌 (stem 0, branch 10)
// 晚子時(23:00–24:00) 和 早子時(00:00–01:00) 均屬隔天日柱
function getDayPillar(year: number, month: number, day: number, hour?: number): Pillar {
  let jdn = getJulianDayNumber(year, month, day);
  // 子時 (23:00–01:00) belongs to the next day's pillar
  if (hour === 23 || hour === 0) jdn += 1;

  const d = jdn - JDN_BASE;
  const stemIndex   = mod(d, 10);
  const branchIndex = mod(d + 10, 12);
  const stem   = STEMS[stemIndex];
  const branch = BRANCHES[branchIndex];
  return { stem, branch, element: getPillarElement(stem, branch) };
}

// ─── Hour pillar ─────────────────────────────────────────────────────────────
// 五鼠遁日起時法: day stem → 子時 start stem
// 甲己→甲, 乙庚→丙, 丙辛→戊, 丁壬→庚, 戊癸→壬
function getHourPillar(hour: number, dayStemIndex: number): Pillar {
  // Map clock hour → 時支 branch index
  let branchIndex: number;
  if (hour === 23) {
    branchIndex = 0; // 晚子時
  } else {
    branchIndex = Math.floor((hour + 1) / 2) % 12;
  }

  const ziStemIndex = (dayStemIndex % 5) * 2; // 子時起始天干
  const stemIndex = mod(ziStemIndex + branchIndex, 10);
  const stem   = STEMS[stemIndex];
  const branch = BRANCHES[branchIndex];
  return { stem, branch, element: getPillarElement(stem, branch) };
}

// ─── Public API ──────────────────────────────────────────────────────────────
export function calculateBaziPillars(
  year: number,
  month: number,
  day: number,
  hour?: number,
): BaziPillars {
  // Year pillar: adjust for 立春 boundary
  const liChunDay = getSolarTermDay(year, 2);
  const yearForPillar = (month < 2 || (month === 2 && day < liChunDay))
    ? year - 1
    : year;

  const yearPillar  = getYearPillar(yearForPillar);
  const monthPillar = getMonthPillar(year, month, day);
  const dayPillar   = getDayPillar(year, month, day, hour);

  const jdn = getJulianDayNumber(year, month, day);
  const d   = jdn - JDN_BASE + (hour === 23 || hour === 0 ? 1 : 0);
  const dayStemIndex = mod(d, 10);

  const hourPillar = hour !== undefined
    ? getHourPillar(hour, dayStemIndex)
    : undefined;

  return {
    year:  yearPillar,
    month: monthPillar,
    day:   dayPillar,
    hour:  hourPillar,
  };
}

export function getDominantElements(pillars: BaziPillars): string[] {
  const count: Record<string, number> = {};
  const allPillars = [pillars.year, pillars.month, pillars.day, pillars.hour].filter(Boolean) as Pillar[];
  for (const p of allPillars) {
    const s = STEM_ELEMENTS[p.stem];
    const b = BRANCH_ELEMENTS[p.branch];
    count[s] = (count[s] ?? 0) + 1;
    count[b] = (count[b] ?? 0) + 1;
  }
  const dayMaster = STEM_ELEMENTS[pillars.day.stem];
  const sorted = Object.entries(count).sort((a, b) => b[1] - a[1]).map(([el]) => el);
  const result = [dayMaster];
  for (const el of sorted) {
    if (!result.includes(el) && result.length < 2) result.push(el);
  }
  return result;
}

export function formatPillarsForPrompt(pillars: BaziPillars): string {
  const lines = [
    `年柱：${pillars.year.stem}${pillars.year.branch}（五行：${pillars.year.element}）`,
    `月柱：${pillars.month.stem}${pillars.month.branch}（五行：${pillars.month.element}）`,
    `日柱：${pillars.day.stem}${pillars.day.branch}（五行：${pillars.day.element}）`,
  ];
  if (pillars.hour) {
    lines.push(`時柱：${pillars.hour.stem}${pillars.hour.branch}（五行：${pillars.hour.element}）`);
  }
  return lines.join('\n');
}

// ─── Ten Gods (十神) ──────────────────────────────────────────────────────────
const STEM_YIN: Record<string, boolean> = {
  甲: false, 乙: true, 丙: false, 丁: true, 戊: false,
  己: true,  庚: false, 辛: true, 壬: false, 癸: true,
};

const GENERATES: Record<string, string> = { 木: '火', 火: '土', 土: '金', 金: '水', 水: '木' };
const CONTROLS:  Record<string, string> = { 木: '土', 火: '金', 土: '水', 金: '木', 水: '火' };

export type TenGod =
  '比肩' | '劫財' | '食神' | '傷官' |
  '偏財' | '正財' | '七殺' | '正官' |
  '偏印' | '正印';

export function getTenGod(dayStem: string, targetStem: string): TenGod {
  const dayEl    = STEM_ELEMENTS[dayStem];
  const targetEl = STEM_ELEMENTS[targetStem];
  const sameYin  = STEM_YIN[dayStem] === STEM_YIN[targetStem];
  if (dayEl === targetEl)              return sameYin ? '比肩' : '劫財';
  if (GENERATES[dayEl] === targetEl)   return sameYin ? '食神' : '傷官';
  if (CONTROLS[dayEl]  === targetEl)   return sameYin ? '偏財' : '正財';
  if (CONTROLS[targetEl]  === dayEl)   return sameYin ? '七殺' : '正官';
  if (GENERATES[targetEl] === dayEl)   return sameYin ? '偏印' : '正印';
  return '比肩';
}

// ─── Hidden stems per branch (藏干) ──────────────────────────────────────────
const BRANCH_HIDDEN_STEMS: Record<string, string[]> = {
  子: ['壬'],         丑: ['己', '癸', '辛'],
  寅: ['甲', '丙', '戊'], 卯: ['乙'],
  辰: ['戊', '乙', '癸'], 巳: ['丙', '庚', '戊'],
  午: ['丁', '己'],   未: ['己', '丁', '乙'],
  申: ['庚', '壬', '戊'], 酉: ['辛'],
  戌: ['戊', '辛', '丁'], 亥: ['壬', '甲'],
};

export interface HiddenStem { stem: string; tenGod: TenGod; }

export function getBranchHiddenStems(branch: string, dayStem: string): HiddenStem[] {
  return (BRANCH_HIDDEN_STEMS[branch] ?? []).map(stem => ({
    stem,
    tenGod: getTenGod(dayStem, stem),
  }));
}

// ─── Major fortune cycles (大運) ──────────────────────────────────────────────
export interface MajorFortuneCycle {
  stem: string; branch: string; startAge: number; startYear: number;
}

export interface MajorFortune {
  startDays: number; startAge: number; startMonths: number;
  cycles: MajorFortuneCycle[];
}

function daysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

// 順排：count forward to next 節 (Chinese month start term)
function daysToNextJie(year: number, month: number, day: number): number {
  const termDay = getSolarTermDay(year, month);
  if (day < termDay) return termDay - day;
  const nm = month === 12 ? 1 : month + 1;
  const ny = month === 12 ? year + 1 : year;
  return daysInMonth(year, month) - day + getSolarTermDay(ny, nm);
}

// 逆排：count backward to previous 中氣 (mid-month term of preceding month)
// Traditional rule: for 逆排, distance = days back to the previous 中氣
function daysToPrevZhongqi(year: number, month: number, day: number): number {
  const zhongqiDay = getZhongqiDay(year, month);
  if (day > zhongqiDay) return day - zhongqiDay;
  const pm = month === 1 ? 12 : month - 1;
  const py = month === 1 ? year - 1 : year;
  return daysInMonth(py, pm) - getZhongqiDay(py, pm) + day;
}

export function calculateMajorFortune(
  year: number, month: number, day: number,
  gender: 'male' | 'female' | undefined,
  yearStemIndex: number, monthStemIndex: number, monthBranchIndex: number,
): MajorFortune {
  const yearIsYang = yearStemIndex % 2 === 0;
  const isMale = gender === 'male';
  const isForward = (isMale && yearIsYang) || (!isMale && !yearIsYang);

  const days = isForward
    ? daysToNextJie(year, month, day)
    : daysToPrevZhongqi(year, month, day);

  // D ÷ 3 整數部分 = 起運年數；餘數 × 4 = 起運月數
  const startAge    = Math.floor(days / 3);
  const startMonths = (days % 3) * 4;

  const cycles: MajorFortuneCycle[] = Array.from({ length: 9 }, (_, i) => {
    const offset = isForward ? i + 1 : -(i + 1);
    return {
      stem:      STEMS[mod(monthStemIndex + offset, 10)],
      branch:    BRANCHES[mod(monthBranchIndex + offset, 12)],
      startAge:  startAge + i * 10,
      startYear: year + startAge + i * 10,
    };
  });

  return { startDays: days, startAge, startMonths, cycles };
}

// ─── Fortune pattern (命格) ───────────────────────────────────────────────────
// Rule: month stem (月干透出) takes priority; fall back to month branch main hidden stem
const PATTERN_NAMES: Record<TenGod, string> = {
  食神: '食神格', 傷官: '傷官格',
  偏財: '偏財格', 正財: '正財格',
  七殺: '七殺格', 正官: '正官格',
  偏印: '偏印格', 正印: '正印格',
  比肩: '建祿格', 劫財: '月劫格',
};

export function getFortunePattern(monthBranch: string, monthStem: string, dayStem: string): string {
  // Priority 1: month stem transparent ten god (not 比肩/劫財)
  const stemGod = getTenGod(dayStem, monthStem);
  if (stemGod !== '比肩' && stemGod !== '劫財') {
    return PATTERN_NAMES[stemGod] ?? '特殊格局';
  }
  // Priority 2: month branch main hidden stem
  const mainBranchStem = BRANCH_HIDDEN_STEMS[monthBranch]?.[0];
  if (!mainBranchStem) return '特殊格局';
  return PATTERN_NAMES[getTenGod(dayStem, mainBranchStem)] ?? '特殊格局';
}

// ─── Annual luck pillar (流年) ────────────────────────────────────────────────
export function getAnnualPillar(year: number): { stem: string; branch: string } {
  return {
    stem:   STEMS[mod(year - 1984, 10)],
    branch: BRANCHES[mod(year - 1984, 12)],
  };
}
