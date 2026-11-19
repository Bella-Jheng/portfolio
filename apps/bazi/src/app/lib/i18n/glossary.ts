import type { Locale } from './locale';

// 命理術語中英對照：命盤顯示與 AI 翻譯 prompt 共用同一份，確保畫面和解讀用字一致

export const ELEMENT_EN: Record<string, string> = {
  木: 'Wood', 火: 'Fire', 土: 'Earth', 金: 'Metal', 水: 'Water',
};

const STEM_POLARITY: Record<string, 'Yang' | 'Yin'> = {
  甲: 'Yang', 乙: 'Yin', 丙: 'Yang', 丁: 'Yin', 戊: 'Yang',
  己: 'Yin', 庚: 'Yang', 辛: 'Yin', 壬: 'Yang', 癸: 'Yin',
};
const STEM_ELEMENT: Record<string, string> = {
  甲: '木', 乙: '木', 丙: '火', 丁: '火', 戊: '土',
  己: '土', 庚: '金', 辛: '金', 壬: '水', 癸: '水',
};

export const BRANCH_ANIMAL_EN: Record<string, string> = {
  子: 'Rat', 丑: 'Ox', 寅: 'Tiger', 卯: 'Rabbit', 辰: 'Dragon', 巳: 'Snake',
  午: 'Horse', 未: 'Goat', 申: 'Monkey', 酉: 'Rooster', 戌: 'Dog', 亥: 'Pig',
};

export const TEN_GOD_EN: Record<string, string> = {
  比肩: 'Friend', 劫財: 'Rob Wealth',
  食神: 'Eating God', 傷官: 'Hurting Officer',
  偏財: 'Indirect Wealth', 正財: 'Direct Wealth',
  七殺: 'Seven Killings', 正官: 'Direct Officer',
  偏印: 'Indirect Resource', 正印: 'Direct Resource',
  日主: 'Day Master',
};

// 表格欄位窄，副星用短一點的寫法
export const TEN_GOD_SHORT_EN: Record<string, string> = {
  比肩: 'Friend', 劫財: 'Rob W.',
  食神: 'Eating God', 傷官: 'Hurting O.',
  偏財: 'Ind. Wealth', 正財: 'Dir. Wealth',
  七殺: '7 Killings', 正官: 'Dir. Officer',
  偏印: 'Ind. Resource', 正印: 'Dir. Resource',
  日主: 'Self',
};

export const STRENGTH_EN: Record<string, string> = {
  身強: 'Strong', 身弱: 'Weak', 從強: 'Follow Strong', 從弱: 'Follow Weak',
};

const PATTERN_EN: Record<string, string> = {
  食神格: 'Eating God', 傷官格: 'Hurting Officer',
  偏財格: 'Indirect Wealth', 正財格: 'Direct Wealth',
  七殺格: 'Seven Killings', 正官格: 'Direct Officer',
  偏印格: 'Indirect Resource', 正印格: 'Direct Resource',
  建祿格: 'Prosperous Self', 月劫格: 'Month Rob Wealth',
  特殊格局: 'Special Structure',
};

/** 天干：丁 → Yin Fire */
export function stemEn(stem: string): string {
  const element = STEM_ELEMENT[stem];
  if (!element) return stem;
  return `${STEM_POLARITY[stem]} ${ELEMENT_EN[element]}`;
}

export function elementLabel(element: string, locale: Locale): string {
  return locale === 'en' ? (ELEMENT_EN[element] ?? element) : element;
}

export function tenGodLabel(tenGod: string, locale: Locale, short = false): string {
  if (locale === 'zh') return tenGod;
  return (short ? TEN_GOD_SHORT_EN : TEN_GOD_EN)[tenGod] ?? tenGod;
}

export function strengthLabel(strength: string, locale: Locale): string {
  return locale === 'en' ? (STRENGTH_EN[strength] ?? strength) : strength;
}

/**
 * 格局：AI 可能寫「正財格」「正財格（身強）」或「食神生財格」這種複合格局。
 * 先找完整對照，再找包含的格局名，最後用字串裡最先出現的十神當格局名
 */
export function patternLabel(pattern: string, locale: Locale): string {
  if (locale === 'zh') return pattern;
  if (PATTERN_EN[pattern]) return PATTERN_EN[pattern];
  const hit = Object.keys(PATTERN_EN).find((zh) => pattern.includes(zh));
  if (hit) return PATTERN_EN[hit];
  const firstTenGod = Object.keys(TEN_GOD_EN)
    .map((zh) => ({ zh, index: pattern.indexOf(zh) }))
    .filter(({ index }) => index >= 0)
    .sort((a, b) => a.index - b.index)[0];
  return firstTenGod ? TEN_GOD_EN[firstTenGod.zh] : pattern;
}

/** 給 AI 翻譯用的術語表，避免同一個詞每次翻得不一樣 */
export function glossaryForPrompt(): string {
  const tenGods = Object.entries(TEN_GOD_EN).map(([zh, en]) => `${zh}=${en}`).join(', ');
  const elements = Object.entries(ELEMENT_EN).map(([zh, en]) => `${zh}=${en}`).join(', ');
  const strength = Object.entries(STRENGTH_EN).map(([zh, en]) => `${zh}=${en}`).join(', ');
  const patterns = Object.entries(PATTERN_EN).map(([zh, en]) => `${zh}=${en} structure`).join(', ');
  return [
    `Five Elements: ${elements}`,
    `Ten Gods: ${tenGods}`,
    `Day Master strength: ${strength}`,
    `Chart structures: ${patterns}`,
    '大運=Luck Cycle, 流年=Annual Luck, 流月=Monthly Luck, 用神=Favorable Element, 忌神=Unfavorable Element, 天干=Heavenly Stem, 地支=Earthly Branch, 藏干=Hidden Stem, 八字=Bazi, 命盤=chart',
  ].join('\n');
}
