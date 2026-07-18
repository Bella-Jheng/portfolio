import { v4 as uuidv4 } from 'uuid';
import { readingsRepository, type ReadingDoc } from '../repositories/readings-repository';
import { knowledgeRepository } from '../repositories/knowledge-repository';
import { generateBaziReading, generateDetailedAnalysis, answerCustomQuestion, type DetailSection } from '../anthropic';
import {
  calculateBaziPillars,
  getDominantElements,
  calculateMajorFortune,
  getAnnualPillar,
  getMonthPillar,
  calculateDayMasterStrength,
  STEMS,
  BRANCHES,
} from '../bazi-calculator';
import { resolveResubmitAction, type ExistingReadingInput, type IncomingReadingInput } from '../reading-resubmit';
import type { BaziPillars, FortuneReading, Gender, QuestionAnswer } from '../../types/bazi';

// 業務邏輯層拋出的預期錯誤（找不到資料、權限不足、超過額度等），route.ts 統一 catch 後轉成對應的 HTTP status
export class ServiceError extends Error {
  status: number;
  payload?: Record<string, unknown>;

  constructor(status: number, message: string, payload?: Record<string, unknown>) {
    super(message);
    this.status = status;
    this.payload = payload;
  }
}

export interface MajorFortuneInfo {
  currentCycle: string;
  currentAnnual: string;
  currentMonth: string;
}

export interface ReadingGenerationContext {
  knowledge: string;
  currentYear: number;
  majorFortuneInfo?: MajorFortuneInfo;
  strength: string;
}

function sanitizeQuestions(questions: QuestionAnswer[] | undefined): Omit<QuestionAnswer, 'userId'>[] {
  return (questions ?? []).map(({ userId: _uid, ...q }) => q);
}

class ReadingService {
  // 查 knowledge collection + 算大運/日主強弱，供生成/重算命盤時共用
  async buildGenerationContext(
    pillars: BaziPillars,
    birthYear: number,
    birthMonth: number,
    birthDay: number,
    gender?: Gender,
  ): Promise<ReadingGenerationContext> {
    const dominantElements = getDominantElements(pillars);
    const queryTags = [...dominantElements, '桃花', '財運', '健康', '事業', '運勢', '通用'];

    const knowledgeDocs = await knowledgeRepository.queryByTags(queryTags);
    const knowledge = knowledgeDocs
      .map((doc) => `【${doc['title']}】\n${doc['content']}`)
      .join('\n\n');

    const currentYear = new Date().getFullYear();
    const yearStemIdx = STEMS.indexOf(pillars.year.stem);
    const monthStemIdx = STEMS.indexOf(pillars.month.stem);
    const monthBranchIdx = BRANCHES.indexOf(pillars.month.branch);
    let majorFortuneInfo: MajorFortuneInfo | undefined;
    if (gender && yearStemIdx >= 0 && monthStemIdx >= 0 && monthBranchIdx >= 0) {
      const mf = calculateMajorFortune(birthYear, birthMonth, birthDay, gender, yearStemIdx, monthStemIdx, monthBranchIdx);
      const virtualAge = currentYear - birthYear + 1;
      const cycleIdx = mf.cycles.findLastIndex((cycle) => cycle.startAge <= virtualAge);
      const cycle = cycleIdx >= 0 ? mf.cycles[cycleIdx] : null;
      const annual = getAnnualPillar(currentYear);
      const today = new Date();
      const currentMonthNum = today.getMonth() + 1;
      const monthly = getMonthPillar(currentYear, currentMonthNum, today.getDate());
      majorFortuneInfo = {
        currentCycle: cycle
          ? `${cycle.stem}${cycle.branch}（起運歲 ${cycle.startAge}，${cycle.startYear} 年起）`
          : '尚未入大運',
        currentAnnual: `${annual.stem}${annual.branch}（${currentYear} 年）`,
        currentMonth: `${monthly.stem}${monthly.branch}（${currentYear} 年 ${currentMonthNum} 月）`,
      };
    }

    const strength = calculateDayMasterStrength(pillars);

    return { knowledge, currentYear, majorFortuneInfo, strength };
  }

  // 首頁送出生日：admin 永遠新建；一般使用者一人一次，依 resolveResubmitAction 決定沿用既有命盤或覆蓋重算
  async createOrReuse(params: {
    createdBy: string | null;
    isAdmin: boolean;
    input: IncomingReadingInput;
    hasBeenViewed: (existingReadingId: string) => boolean;
  }): Promise<{ id: string; reused: boolean }> {
    const { createdBy, isAdmin, input, hasBeenViewed } = params;

    let overwriteId: string | null = null;
    if (createdBy && !isAdmin) {
      const existing = await readingsRepository.findLatestByUser(createdBy);
      if (existing) {
        const action = resolveResubmitAction(existing as unknown as ExistingReadingInput, input, hasBeenViewed(existing.id));
        if (action === 'reuse') {
          return { id: existing.id, reused: true };
        }
        overwriteId = existing.id;
      }
    }

    const pillars = calculateBaziPillars(input.birthYear, input.birthMonth, input.birthDay, input.birthHour);
    const context = await this.buildGenerationContext(pillars, input.birthYear, input.birthMonth, input.birthDay, input.gender as Gender);
    const fortune = await generateBaziReading({ ...input, gender: input.gender as Gender, pillars, ...context });
    const now = new Date().toISOString();

    if (overwriteId) {
      await readingsRepository.update(overwriteId, {
        name: input.name ?? null,
        gender: input.gender ?? null,
        birthYear: input.birthYear,
        birthMonth: input.birthMonth,
        birthDay: input.birthDay,
        birthHour: input.birthHour ?? null,
        pillars,
        fortune,
        updatedAt: now,
      });
      return { id: overwriteId, reused: false };
    }

    const id = uuidv4();
    await readingsRepository.create(id, {
      name: input.name ?? null,
      gender: input.gender ?? null,
      birthYear: input.birthYear,
      birthMonth: input.birthMonth,
      birthDay: input.birthDay,
      birthHour: input.birthHour ?? null,
      pillars,
      fortune,
      questions: [],
      createdBy: isAdmin ? null : (createdBy ?? null),
      createdAt: now,
      updatedAt: now,
    });
    return { id, reused: false };
  }

  // 重算 pillars → 建 context → 呼叫 AI 重新生成 fortune → 存回去
  // recalculate / approve-correction / dashboard 編輯 三處共用；extraFields 帶入各自要多寫的欄位
  async regenerateFortune(params: {
    existing: ReadingDoc;
    birthYear: number;
    birthMonth: number;
    birthDay: number;
    birthHour?: number | null;
    name?: string;
    extraFields?: Record<string, unknown>;
  }): Promise<{ pillars: BaziPillars; fortune: FortuneReading; updatedAt: string }> {
    const { existing, birthYear, birthMonth, birthDay, birthHour, name, extraFields } = params;
    const gender = existing.gender as Gender | undefined;

    const pillars = calculateBaziPillars(birthYear, birthMonth, birthDay, birthHour ?? undefined);
    const context = await this.buildGenerationContext(pillars, birthYear, birthMonth, birthDay, gender);

    const fortune = await generateBaziReading({
      name: name ?? (existing.name as string | undefined),
      gender,
      birthYear,
      birthMonth,
      birthDay,
      birthHour: birthHour ?? undefined,
      pillars,
      ...context,
    });

    const now = new Date().toISOString();
    await readingsRepository.update(existing.id, {
      ...(name !== undefined && { name: name ?? null }),
      birthYear,
      birthMonth,
      birthDay,
      birthHour: birthHour ?? null,
      pillars,
      fortune,
      updatedAt: now,
      ...extraFields,
    });

    return { pillars, fortune, updatedAt: now };
  }

  async askQuestion(params: {
    id: string;
    question: string;
    userId: string;
    isAdmin: boolean;
    adminQuestion?: boolean;
    tz: string;
  }): Promise<{
    answer: string;
    questions?: Omit<QuestionAnswer, 'userId'>[];
    adminQuestions?: Omit<QuestionAnswer, 'userId'>[];
    remainingToday?: number | null;
  }> {
    const { id, question, userId, isAdmin, adminQuestion, tz } = params;

    const data = await readingsRepository.getById(id);
    if (!data) throw new ServiceError(404, '找不到此命盤');

    if (adminQuestion && !isAdmin) throw new ServiceError(403, '無權限');

    if (!adminQuestion) {
      const todayCount = await readingsRepository.countTodayQuestionsForUser(userId, tz);
      if (!isAdmin && todayCount >= 3) {
        throw new ServiceError(429, '今日提問已達上限（3 題），明天再來吧！', { todayCount });
      }
    }

    const pillars = data.pillars as BaziPillars;
    const fortune = data.fortune as FortuneReading;
    const context = await this.buildGenerationContext(
      pillars,
      data.birthYear as number,
      data.birthMonth as number,
      data.birthDay as number,
      data.gender as Gender | undefined,
    );

    const answer = await answerCustomQuestion({
      question,
      pillars,
      fortune,
      knowledge: context.knowledge,
      name: data.name as string | undefined,
      gender: data.gender as Gender | undefined,
      majorFortuneInfo: context.majorFortuneInfo,
    });

    const newQA: QuestionAnswer = { question, answer, createdAt: new Date().toISOString(), userId };

    if (adminQuestion) {
      const updatedAdminQs = [...((data.adminQuestions ?? []) as QuestionAnswer[]), newQA];
      await readingsRepository.update(id, { adminQuestions: updatedAdminQs, updatedAt: new Date().toISOString() });
      return { answer, adminQuestions: sanitizeQuestions(updatedAdminQs) };
    }

    const updatedQuestions = [...((data.questions ?? []) as QuestionAnswer[]), newQA];
    await readingsRepository.update(id, { questions: updatedQuestions, updatedAt: new Date().toISOString() });

    const today = new Date().toLocaleDateString('sv-SE', { timeZone: tz });
    const todayCount = updatedQuestions.filter(
      (qa) => qa.userId === userId && new Date(qa.createdAt).toLocaleDateString('sv-SE', { timeZone: tz }) === today,
    ).length;
    const remaining = isAdmin ? null : Math.max(0, 3 - todayCount);
    return { answer, questions: sanitizeQuestions(updatedQuestions), remainingToday: remaining };
  }

  async generateDetail(params: { id: string; section: DetailSection }): Promise<{ fortune: FortuneReading }> {
    const { id, section } = params;
    const data = await readingsRepository.getById(id);
    if (!data) throw new ServiceError(404, '找不到此命盤');

    const { birthYear, birthMonth, birthDay, birthHour, name, gender, pillars, fortune } = data as unknown as {
      birthYear: number; birthMonth: number; birthDay: number; birthHour?: number;
      name?: string; gender?: Gender; pillars: BaziPillars; fortune: FortuneReading;
    };

    const context = await this.buildGenerationContext(pillars, birthYear, birthMonth, birthDay, gender);
    const detail = await generateDetailedAnalysis({
      name,
      gender,
      birthYear,
      birthMonth,
      birthDay,
      birthHour,
      pillars,
      sections: [section],
      existingSummary: fortune,
      ...context,
    });

    const updatedFortune = { ...fortune, ...detail };
    await readingsRepository.update(id, { fortune: updatedFortune, updatedAt: new Date().toISOString() });
    return { fortune: updatedFortune };
  }

  async requestCorrection(params: {
    id: string;
    uid: string;
    year: number;
    month: number;
    day: number;
    hour: number | null;
  }): Promise<void> {
    const { id, uid, year, month, day, hour } = params;
    const data = await readingsRepository.getById(id);
    if (!data) throw new ServiceError(404, '找不到此命盤');
    if (data.correctionUsed) throw new ServiceError(400, '已使用過更改日期功能，每筆命盤僅限一次');

    await readingsRepository.update(id, {
      correctionRequested: true,
      correctionRequestedAt: new Date().toISOString(),
      correctionRequestedBy: uid,
      correctionUsed: true,
      correctionRequestedDate: { year, month, day, hour: hour ?? null },
    });
  }
}

export const readingService = new ReadingService();
