import type { StrengthCalibrationAnswer } from '../types/bazi';

export interface ExistingReadingInput {
  name?: string | null;
  gender?: string | null;
  birthYear: number;
  birthMonth: number;
  birthDay: number;
  birthHour?: number | null;
}

export interface IncomingReadingInput {
  name: string;
  gender: string;
  birthYear: number;
  birthMonth: number;
  birthDay: number;
  birthHour?: number;
  strengthCalibration?: StrengthCalibrationAnswer[];
}

export type ResubmitAction = 'reuse' | 'overwrite';

export function resolveResubmitAction(
  existing: ExistingReadingInput,
  incoming: IncomingReadingInput,
  hasBeenViewed: boolean,
): ResubmitAction {
  const isSameInput =
    existing.name === incoming.name &&
    existing.gender === incoming.gender &&
    existing.birthYear === incoming.birthYear &&
    existing.birthMonth === incoming.birthMonth &&
    existing.birthDay === incoming.birthDay &&
    (existing.birthHour ?? null) === (incoming.birthHour ?? null) &&
    // 既有命盤沒有留存校正答案，無法比對是否相同；只要這次帶了校正答案就不能視為「同一份輸入」，避免新答案被沿用的舊命盤蓋掉
    !incoming.strengthCalibration?.length;

  return hasBeenViewed || isSameInput ? 'reuse' : 'overwrite';
}
