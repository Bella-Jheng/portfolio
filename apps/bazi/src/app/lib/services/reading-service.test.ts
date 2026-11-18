import { describe, it, expect, vi, beforeEach } from 'vitest';

// 權限檢查發生在呼叫 AI 與寫入資料庫之前，所以這裡只需要假的 repository，AI 被呼叫到就代表權限沒擋住
vi.mock('../repositories/readings-repository', () => ({
  readingsRepository: { getById: vi.fn(), update: vi.fn(), countTodayQuestionsForUser: vi.fn() },
}));
vi.mock('../repositories/knowledge-repository', () => ({
  knowledgeRepository: {},
}));
vi.mock('../anthropic', () => ({
  generateBaziReading: vi.fn(),
  generateDetailedAnalysis: vi.fn(),
  answerCustomQuestion: vi.fn(),
  translateFortuneToEnglish: vi.fn(),
  translateQuestionAnswer: vi.fn(),
}));

import { readingService, ServiceError } from './reading-service';
import { readingsRepository } from '../repositories/readings-repository';
import { generateDetailedAnalysis, answerCustomQuestion, translateFortuneToEnglish, translateQuestionAnswer } from '../anthropic';

const OWNER = 'owner-uid';
const STRANGER = 'stranger-uid';

const expectForbidden = async (promise: Promise<unknown>) => {
  const error = await promise.catch((err) => err);
  expect(error).toBeInstanceOf(ServiceError);
  expect((error as ServiceError).status).toBe(403);
};

describe('readingService 命盤擁有者檢查', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(readingsRepository.getById).mockResolvedValue({ id: 'reading-1', createdBy: OWNER });
  });

  it('非本人不能產生完整分析', async () => {
    await expectForbidden(
      readingService.generateDetail({ id: 'reading-1', section: 'wealth', userId: STRANGER, isAdmin: false }),
    );
    expect(generateDetailedAnalysis).not.toHaveBeenCalled();
  });

  it('非本人不能提問', async () => {
    await expectForbidden(
      readingService.askQuestion({ id: 'reading-1', question: '?', userId: STRANGER, isAdmin: false, tz: 'Asia/Taipei' }),
    );
    expect(answerCustomQuestion).not.toHaveBeenCalled();
  });

  it('非本人不能申請更改日期', async () => {
    await expectForbidden(
      readingService.requestCorrection({ id: 'reading-1', uid: STRANGER, isAdmin: false, year: 2000, month: 1, day: 1, hour: null }),
    );
    expect(readingsRepository.update).not.toHaveBeenCalled();
  });

  it('本人可以申請更改日期', async () => {
    await readingService.requestCorrection({ id: 'reading-1', uid: OWNER, isAdmin: false, year: 2000, month: 1, day: 1, hour: null });
    expect(readingsRepository.update).toHaveBeenCalledOnce();
  });

  it('管理員可以操作別人的命盤', async () => {
    await readingService.requestCorrection({ id: 'reading-1', uid: 'admin-uid', isAdmin: true, year: 2000, month: 1, day: 1, hour: null });
    expect(readingsRepository.update).toHaveBeenCalledOnce();
  });

  it('管理員建立的命盤（createdBy 為 null），一般使用者不能操作', async () => {
    vi.mocked(readingsRepository.getById).mockResolvedValue({ id: 'reading-1', createdBy: null });
    await expectForbidden(
      readingService.requestCorrection({ id: 'reading-1', uid: STRANGER, isAdmin: false, year: 2000, month: 1, day: 1, hour: null }),
    );
  });
});

describe('readingService 英文翻譯', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('只翻中文有內容、英文還沒翻過的欄位，翻完合併存回 fortuneEn', async () => {
    vi.mocked(readingsRepository.getById).mockResolvedValue({
      id: 'reading-1',
      createdBy: OWNER,
      fortune: { personality: '個性', traits: '熱情・直覺', wealth: '財運', career: '', fortune: '', romance: '', health: '' },
      fortuneEn: { personality: 'Personality' },
    });
    vi.mocked(translateFortuneToEnglish).mockResolvedValue({ traits: 'Warm · Intuitive', wealth: 'Wealth' });

    const { fortuneEn } = await readingService.translateFortune({
      id: 'reading-1',
      keys: ['personality', 'traits', 'wealth', 'career', 'notAField'],
      userId: OWNER,
      isAdmin: false,
    });

    expect(translateFortuneToEnglish).toHaveBeenCalledWith({ traits: '熱情・直覺', wealth: '財運' });
    expect(fortuneEn).toEqual({ personality: 'Personality', traits: 'Warm · Intuitive', wealth: 'Wealth' });
    expect(readingsRepository.update).toHaveBeenCalledWith('reading-1', { fortuneEn });
  });

  it('全部都翻過了就不打 AI、不寫資料庫', async () => {
    vi.mocked(readingsRepository.getById).mockResolvedValue({
      id: 'reading-1',
      createdBy: OWNER,
      fortune: { personality: '個性', fortune: '', career: '', romance: '', health: '' },
      fortuneEn: { personality: 'Personality' },
    });
    await readingService.translateFortune({ id: 'reading-1', keys: ['personality'], userId: OWNER, isAdmin: false });
    expect(translateFortuneToEnglish).not.toHaveBeenCalled();
    expect(readingsRepository.update).not.toHaveBeenCalled();
  });

  it('非本人不能翻譯命盤', async () => {
    vi.mocked(readingsRepository.getById).mockResolvedValue({ id: 'reading-1', createdBy: OWNER, fortune: {} });
    await expectForbidden(
      readingService.translateFortune({ id: 'reading-1', keys: ['personality'], userId: STRANGER, isAdmin: false }),
    );
    expect(translateFortuneToEnglish).not.toHaveBeenCalled();
  });

  it('翻譯 AI 追問會存下譯文，且不檢查每日提問額度', async () => {
    vi.mocked(readingsRepository.getById).mockResolvedValue({
      id: 'reading-1',
      createdBy: OWNER,
      questions: [{ question: '明年適合換工作嗎？', answer: '適合', createdAt: '2026-11-01T00:00:00Z', userId: OWNER }],
    });
    vi.mocked(translateQuestionAnswer).mockResolvedValue({ question: 'Should I change jobs?', answer: 'Yes' });

    const { questions } = await readingService.translateQuestion({ id: 'reading-1', index: 0, target: 'en', userId: OWNER, isAdmin: false });

    expect(readingsRepository.countTodayQuestionsForUser).not.toHaveBeenCalled();
    expect(questions[0].translations?.en).toEqual({ question: 'Should I change jobs?', answer: 'Yes' });
    expect(questions[0]).not.toHaveProperty('userId');
  });
});
