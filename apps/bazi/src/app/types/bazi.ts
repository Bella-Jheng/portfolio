export type Gender = 'male' | 'female';

export interface Pillar {
  stem: string;
  branch: string;
  element: string;
}

export interface BaziPillars {
  year: Pillar;
  month: Pillar;
  day: Pillar;
  hour?: Pillar;
}

export interface FortuneReading {
  personality?: string;
  fortune: string;
  wealth?: string;
  wealthDetail?: string;
  career: string;
  careerDetail?: string;
  romance: string;
  romanceDetail?: string;
  health: string;
  healthDetail?: string;
  remedy?: string;
  remedyDetail?: string;
  actions?: string;
  cycleAnalysis?: string;
  cycleAnalysisDetail?: string;
  monthlyFortune?: string;
  monthlyFortuneDetail?: string;
  tenGodAnalysis?: string;
  tenGodAnalysisDetail?: string;
  traits?: string;
}

export interface QuestionAnswer {
  question: string;
  answer: string;
  createdAt: string;
  userId?: string;
  /** 提問時的介面語言；舊資料沒有這個欄位，視為中文 */
  lang?: 'zh' | 'en';
  /** 使用者按「翻譯」後存下的譯文，依目標語言分開存 */
  translations?: Partial<Record<'zh' | 'en', { question: string; answer: string }>>;
}

export interface Reading {
  id: string;
  name?: string;
  createdBy?: string | null;
  gender?: Gender;
  birthYear: number;
  birthMonth: number;
  birthDay: number;
  birthHour?: number;
  pillars: BaziPillars;
  fortune: FortuneReading;
  /** 英文翻譯版：中文 fortune 是主版本，英文用到才翻、翻完存這裡，切換語言不用再打 API */
  fortuneEn?: Partial<FortuneReading>;
  /** 前端顯示英文時，原本的中文 fortune 放這裡，給需要解析中文格式的元件用（例如格局、用神標籤） */
  fortuneZh?: FortuneReading;
  questions: QuestionAnswer[];
  adminQuestions?: QuestionAnswer[];
  createdAt: string;
  remainingToday?: number | null;
  correctionRequested?: boolean;
  correctionRequestedAt?: string;
  correctionUsed?: boolean;
  correctionRequestedDate?: { year: number; month: number; day: number; hour?: number | null };
  correctionApproved?: boolean;
}

export interface Knowledge {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  createdAt: string;
}

export const KNOWLEDGE_TAGS = {
  五行: ['金', '木', '水', '火', '土'],
  主題: ['桃花', '財運', '健康', '事業', '運勢', '婚姻', '子女', '流年'],
  其他: ['通用', '天干', '地支', '基礎'],
} as const;

export interface StrongElementYear {
  year: number;
  stem: string;
  branch: string;
  isDoubleMatch: boolean;
}

export type YearFeeling = 'good' | 'bad';

export interface StrengthCalibrationAnswer {
  year: number;
  feeling: YearFeeling;
}

export interface CalculateRequest {
  name?: string;
  gender?: Gender;
  birthYear: number;
  birthMonth: number;
  birthDay: number;
  birthHour?: number;
  strengthCalibration?: StrengthCalibrationAnswer[];
  /** 介面語言；英文時排完盤會接著把結果翻成英文 */
  locale?: 'zh' | 'en';
}

export interface AskQuestionRequest {
  question: string;
  adminQuestion?: boolean;
  locale?: 'zh' | 'en';
}

/** 可以翻譯成英文的 fortune 欄位 */
export const TRANSLATABLE_FORTUNE_KEYS = [
  'personality', 'traits', 'tenGodAnalysis', 'tenGodAnalysisDetail',
  'cycleAnalysis', 'cycleAnalysisDetail', 'monthlyFortune', 'monthlyFortuneDetail',
  'wealth', 'wealthDetail', 'career', 'careerDetail', 'romance', 'romanceDetail',
  'health', 'healthDetail', 'remedy', 'remedyDetail', 'actions',
] as const satisfies readonly (keyof FortuneReading)[];

export type TranslatableFortuneKey = (typeof TRANSLATABLE_FORTUNE_KEYS)[number];

/** 排盤當下就翻好的欄位（結果頁一打開就看得到的部分），其他詳細分析等使用者點開才翻 */
export const SUMMARY_FORTUNE_KEYS: TranslatableFortuneKey[] = [
  'personality', 'traits', 'tenGodAnalysis', 'cycleAnalysis', 'monthlyFortune',
  'wealth', 'career', 'romance', 'health', 'remedy', 'actions',
];

export const SHICHEN = [
  { branch: '子', label: '子時 (23:00–01:00)', hours: [23, 0] },
  { branch: '丑', label: '丑時 (01:00–03:00)', hours: [1, 2] },
  { branch: '寅', label: '寅時 (03:00–05:00)', hours: [3, 4] },
  { branch: '卯', label: '卯時 (05:00–07:00)', hours: [5, 6] },
  { branch: '辰', label: '辰時 (07:00–09:00)', hours: [7, 8] },
  { branch: '巳', label: '巳時 (09:00–11:00)', hours: [9, 10] },
  { branch: '午', label: '午時 (11:00–13:00)', hours: [11, 12] },
  { branch: '未', label: '未時 (13:00–15:00)', hours: [13, 14] },
  { branch: '申', label: '申時 (15:00–17:00)', hours: [15, 16] },
  { branch: '酉', label: '酉時 (17:00–19:00)', hours: [17, 18] },
  { branch: '戌', label: '戌時 (19:00–21:00)', hours: [19, 20] },
  { branch: '亥', label: '亥時 (21:00–23:00)', hours: [21, 22] },
];
