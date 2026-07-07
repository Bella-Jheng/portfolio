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
    (existing.birthHour ?? null) === (incoming.birthHour ?? null);

  return hasBeenViewed || isSameInput ? 'reuse' : 'overwrite';
}
