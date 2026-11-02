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
}));

import { readingService, ServiceError } from './reading-service';
import { readingsRepository } from '../repositories/readings-repository';
import { generateDetailedAnalysis, answerCustomQuestion } from '../anthropic';

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
