import { v4 as uuidv4 } from 'uuid';
import { readingsRepository, type ReadingDoc } from '../repositories/readings-repository';
import { knowledgeRepository } from '../repositories/knowledge-repository';
import {
  generateBaziReading,
  generateDetailedAnalysis,
  answerCustomQuestion,
  translateFortuneToEnglish,
  translateQuestionAnswer,
  type DetailSection,
} from '../anthropic';
import {
  calculateBaziPillars,
  getDominantElements,
  calculateMajorFortune,
  getAnnualPillar,
  getMonthPillar,
  calculateDayMasterStrength,
  recalibrateDayMasterStrength,
  defaultDayMasterStrength,
  STEMS,
  BRANCHES,
} from '../bazi-calculator';
import { resolveResubmitAction, type ExistingReadingInput, type IncomingReadingInput } from '../reading-resubmit';
import {
  SUMMARY_FORTUNE_KEYS,
  TRANSLATABLE_FORTUNE_KEYS,
  type BaziPillars,
  type FortuneReading,
  type Gender,
  type QuestionAnswer,
  type StrengthCalibrationAnswer,
  type TranslatableFortuneKey,
} from '../../types/bazi';
import type { Locale } from '../i18n/locale';
import { DEMO_LIMITS, dailyQuestionLimit, isDemoReadingId } from '../demo/demo-config';
import { chargeDemoAi, DemoLimitError } from '../demo/demo-service';

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

// 命盤只能由建立者本人或管理員操作；管理員建立的命盤 createdBy 為 null，因此只有管理員能操作
function assertCanAccessReading(data: ReadingDoc, userId: string, isAdmin: boolean) {
  if (!isAdmin && data.createdBy !== userId) {
    throw new ServiceError(403, '只有本人或管理員能操作此命盤');
  }
}

/** 訪客 Demo 的範例命盤：每次呼叫 AI 前先扣體驗次數，用完丟 429 */
async function chargeDemo(id: string, uid: string, kind: 'question' | 'detail' | 'translate', perUserLimit?: number) {
  if (!isDemoReadingId(id)) return;
  try {
    await chargeDemoAi(uid, kind, perUserLimit);
  } catch (error) {
    if (error instanceof DemoLimitError) throw new ServiceError(429, error.message, { demo: true });
    throw error;
  }
}

/** 這份命盤裡，這個人今天（tz）問了幾題 */
function countTodayInReading(questions: QuestionAnswer[], userId: string, tz: string): number {
  const today = new Date().toLocaleDateString('sv-SE', { timeZone: tz });
  return questions.filter(
    (qa) => qa.userId === userId && new Date(qa.createdAt).toLocaleDateString('sv-SE', { timeZone: tz }) === today,
  ).length;
}

/** 結果頁顯示的「今天還能問幾題」；訪客 Demo 只算範例命盤裡的提問 */
export async function remainingQuestionsToday(data: ReadingDoc, userId: string, tz: string): Promise<number> {
  const limit = dailyQuestionLimit(data.id);
  const used = isDemoReadingId(data.id)
    ? countTodayInReading((data.questions ?? []) as QuestionAnswer[], userId, tz)
    : await readingsRepository.countTodayQuestionsForUser(userId, tz);
  return Math.max(0, limit - used);
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

// 挑出中文有內容、但英文還沒翻的欄位
function pickUntranslated(
  fortune: FortuneReading,
  fortuneEn: Partial<FortuneReading> | undefined,
  keys: readonly TranslatableFortuneKey[],
): Partial<Record<TranslatableFortuneKey, string>> {
  const fields: Partial<Record<TranslatableFortuneKey, string>> = {};
  for (const key of keys) {
    const zh = fortune[key];
    if (typeof zh === 'string' && zh.trim() && !fortuneEn?.[key]) fields[key] = zh;
  }
  return fields;
}

class ReadingService {
  // 查 knowledge collection + 算大運/日主強弱，供生成/重算命盤時共用
  async buildGenerationContext(
    pillars: BaziPillars,
    birthYear: number,
    birthMonth: number,
    birthDay: number,
    gender?: Gender,
    strengthCalibration?: StrengthCalibrationAnswer[],
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

    const baseStrength = calculateDayMasterStrength(pillars);
    const strength = strengthCalibration?.length
      ? recalibrateDayMasterStrength(baseStrength, strengthCalibration)
      : defaultDayMasterStrength(baseStrength);

    return { knowledge, currentYear, majorFortuneInfo, strength };
  }

  // 首頁送出生日：admin 永遠新建；一般使用者一人一次，依 resolveResubmitAction 決定沿用既有命盤或覆蓋重算
  async createOrReuse(params: {
    createdBy: string | null;
    isAdmin: boolean;
    input: IncomingReadingInput;
    hasBeenViewed: (existingReadingId: string) => boolean;
    locale?: Locale;
  }): Promise<{ id: string; reused: boolean }> {
    const plan = await this.planCreate(params);
    if (plan.reuseId) return { id: plan.reuseId, reused: true };
    const id = await this.generateAndSave({ ...params, overwriteId: plan.overwriteId });
    return { id, reused: false };
  }

  // 第一步（很快，不呼叫 AI）：決定要沿用既有命盤、覆蓋重算，還是新建
  // 背景排盤時先跑這一步：沿用的話直接回傳，不用排背景工作
  async planCreate(params: {
    createdBy: string | null;
    isAdmin: boolean;
    input: IncomingReadingInput;
    hasBeenViewed: (existingReadingId: string) => boolean;
  }): Promise<{ reuseId: string | null; overwriteId: string | null }> {
    const { createdBy, isAdmin, input, hasBeenViewed } = params;
    if (createdBy && !isAdmin) {
      const existing = await readingsRepository.findLatestByUser(createdBy);
      if (existing) {
        const action = resolveResubmitAction(existing as unknown as ExistingReadingInput, input, hasBeenViewed(existing.id));
        if (action === 'reuse') return { reuseId: existing.id, overwriteId: null };
        return { reuseId: null, overwriteId: existing.id };
      }
    }
    return { reuseId: null, overwriteId: null };
  }

  // 第二步（很久，呼叫 AI）：排盤、產生命盤內容並存檔，回傳命盤 id
  async generateAndSave(params: {
    createdBy: string | null;
    isAdmin: boolean;
    input: IncomingReadingInput;
    overwriteId: string | null;
    locale?: Locale;
  }): Promise<string> {
    const { createdBy, isAdmin, input, overwriteId, locale } = params;
    const pillars = calculateBaziPillars(input.birthYear, input.birthMonth, input.birthDay, input.birthHour);
    const context = await this.buildGenerationContext(
      pillars,
      input.birthYear,
      input.birthMonth,
      input.birthDay,
      input.gender as Gender,
      input.strengthCalibration,
    );
    const fortune = await generateBaziReading({ ...input, gender: input.gender as Gender, pillars, ...context });
    // 英文介面排盤：中文主版本產生完，接著把結果頁一打開就看得到的部分翻成英文。
    // 翻譯失敗不影響排盤，結果頁切到英文時會再補翻
    let fortuneEn: Partial<FortuneReading> = {};
    if (locale === 'en') {
      try {
        fortuneEn = await translateFortuneToEnglish(pickUntranslated(fortune, undefined, SUMMARY_FORTUNE_KEYS));
      } catch (error) {
        console.error('Translate fortune after calculate failed:', error);
      }
    }
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
        // 覆蓋重算時，舊的英文翻譯對不上新內容，一律換成這次的（中文介面就是清空）
        fortuneEn,
        updatedAt: now,
      });
      return overwriteId;
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
      fortuneEn,
      questions: [],
      createdBy: isAdmin ? null : (createdBy ?? null),
      createdAt: now,
      updatedAt: now,
    });
    return id;
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
      // 中文內容重算了，舊的英文翻譯作廢，切到英文時再重翻
      fortuneEn: {},
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
    locale?: Locale;
  }): Promise<{
    answer: string;
    questions?: Omit<QuestionAnswer, 'userId'>[];
    adminQuestions?: Omit<QuestionAnswer, 'userId'>[];
    remainingToday?: number | null;
  }> {
    const { id, question, userId, isAdmin, adminQuestion, tz, locale = 'zh' } = params;

    const data = await readingsRepository.getById(id);
    if (!data) throw new ServiceError(404, '找不到此命盤');
    assertCanAccessReading(data, userId, isAdmin);

    if (adminQuestion && !isAdmin) throw new ServiceError(403, '無權限');

    const limit = dailyQuestionLimit(id);
    if (!adminQuestion) {
      // 訪客 Demo 只算範例命盤裡的提問（正式的 readings 裡不會有匿名帳號的提問）
      const todayCount = isDemoReadingId(id)
        ? countTodayInReading((data.questions ?? []) as QuestionAnswer[], userId, tz)
        : await readingsRepository.countTodayQuestionsForUser(userId, tz);
      if (!isAdmin && todayCount >= limit) {
        throw new ServiceError(429, `今日提問已達上限（${limit} 題），明天再來吧！`, { todayCount });
      }
      await chargeDemo(id, userId, 'question');
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
      locale,
    });

    const newQA: QuestionAnswer = { question, answer, createdAt: new Date().toISOString(), userId, lang: locale };

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
    const remaining = isAdmin ? null : Math.max(0, limit - todayCount);
    return { answer, questions: sanitizeQuestions(updatedQuestions), remainingToday: remaining };
  }

  async generateDetail(params: {
    id: string;
    section: DetailSection;
    userId: string;
    isAdmin: boolean;
  }): Promise<{ fortune: FortuneReading; fortuneEn: Partial<FortuneReading> }> {
    const { id, section, userId, isAdmin } = params;
    const data = await readingsRepository.getById(id);
    if (!data) throw new ServiceError(404, '找不到此命盤');
    assertCanAccessReading(data, userId, isAdmin);

    const { birthYear, birthMonth, birthDay, birthHour, name, gender, pillars, fortune } = data as unknown as {
      birthYear: number; birthMonth: number; birthDay: number; birthHour?: number;
      name?: string; gender?: Gender; pillars: BaziPillars; fortune: FortuneReading;
    };

    await chargeDemo(id, userId, 'detail', DEMO_LIMITS.details);
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
    // 這幾個欄位的中文換新了，對應的英文翻譯作廢，前端切到英文時會再補翻
    const fortuneEn = { ...((data.fortuneEn ?? {}) as Partial<FortuneReading>) };
    for (const key of Object.keys(detail) as (keyof FortuneReading)[]) delete fortuneEn[key];
    await readingsRepository.update(id, { fortune: updatedFortune, fortuneEn, updatedAt: new Date().toISOString() });
    return { fortune: updatedFortune, fortuneEn };
  }

  // 把指定欄位翻成英文並存起來；已經翻過的不會再翻，所以重複呼叫不會重複花錢
  async translateFortune(params: {
    id: string;
    keys: string[];
    userId: string;
    isAdmin: boolean;
  }): Promise<{ fortuneEn: Partial<FortuneReading> }> {
    const { id, keys, userId, isAdmin } = params;
    const data = await readingsRepository.getById(id);
    if (!data) throw new ServiceError(404, '找不到此命盤');
    assertCanAccessReading(data, userId, isAdmin);
    const fortune = data.fortune as FortuneReading;
    const existing = (data.fortuneEn ?? {}) as Partial<FortuneReading>;
    const validKeys = keys.filter((key): key is TranslatableFortuneKey =>
      (TRANSLATABLE_FORTUNE_KEYS as readonly string[]).includes(key),
    );
    const fields = pickUntranslated(fortune, existing, validKeys);
    if (Object.keys(fields).length === 0) return { fortuneEn: existing };
    await chargeDemo(id, userId, 'translate');
    const translated = await translateFortuneToEnglish(fields);
    const fortuneEn = { ...existing, ...translated };
    await readingsRepository.update(id, { fortuneEn });
    return { fortuneEn };
  }

  // 翻譯一則 AI 追問；不扣每日提問額度，翻過就存起來
  async translateQuestion(params: {
    id: string;
    index: number;
    target: Locale;
    userId: string;
    isAdmin: boolean;
  }): Promise<{ questions: Omit<QuestionAnswer, 'userId'>[] }> {
    const { id, index, target, userId, isAdmin } = params;
    const data = await readingsRepository.getById(id);
    if (!data) throw new ServiceError(404, '找不到此命盤');
    assertCanAccessReading(data, userId, isAdmin);
    const questions = [...((data.questions ?? []) as QuestionAnswer[])];
    const qa = questions[index];
    if (!qa) throw new ServiceError(404, '找不到這則提問');
    if (qa.translations?.[target]) return { questions: sanitizeQuestions(questions) };
    await chargeDemo(id, userId, 'translate');
    const translated = await translateQuestionAnswer({ question: qa.question, answer: qa.answer, target });
    questions[index] = { ...qa, translations: { ...qa.translations, [target]: translated } };
    await readingsRepository.update(id, { questions });
    return { questions: sanitizeQuestions(questions) };
  }

  async requestCorrection(params: {
    id: string;
    uid: string;
    isAdmin: boolean;
    year: number;
    month: number;
    day: number;
    hour: number | null;
  }): Promise<void> {
    const { id, uid, isAdmin, year, month, day, hour } = params;
    const data = await readingsRepository.getById(id);
    if (!data) throw new ServiceError(404, '找不到此命盤');
    assertCanAccessReading(data, uid, isAdmin);
    if (isDemoReadingId(id)) throw new ServiceError(403, '體驗模式的範例命盤不能更改日期');
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
