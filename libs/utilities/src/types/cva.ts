import type { ClassValue } from 'clsx';
import type { SafeAny } from './any';

export type GenerateCvaType<
  T extends Record<string, SafeAny>,
  K extends keyof T
> = {
  [P in K]-?: Record<
    NonNullable<T[P]> extends boolean ? 'true' | 'false' : Required<T>[P],
    ClassValue
  >;
};
