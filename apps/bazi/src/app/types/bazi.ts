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
  tenGodAnalysis?: string;
  tenGodAnalysisDetail?: string;
  traits?: string;
}

export interface QuestionAnswer {
  question: string;
  answer: string;
  createdAt: string;
  userId?: string;
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

export interface CalculateRequest {
  name?: string;
  gender?: Gender;
  birthYear: number;
  birthMonth: number;
  birthDay: number;
  birthHour?: number;
}

export interface AskQuestionRequest {
  question: string;
  adminQuestion?: boolean;
}

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
