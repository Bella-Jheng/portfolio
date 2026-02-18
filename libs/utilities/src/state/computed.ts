/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/ban-ts-comment */
// Fork from https://github.com/chrisvander/zustand-computed/tree/main since it has peer dependency issues with React v17
import {
  Mutate,
  StateCreator,
  StoreApi,
  StoreMutatorIdentifier,
} from 'zustand';
import { shallow } from 'zustand/shallow';
import { SafeAny } from '../types';

export type ComputedStateOpts<T> = {
  keys?: (keyof T)[];
  disableProxy?: boolean;
  equalityFn?: (a: T, b: T) => boolean;
};

export type ComputedStateCreator = <
  T extends object,
  A extends object,
  Mps extends [StoreMutatorIdentifier, unknown][] = [],
  Mcs extends [StoreMutatorIdentifier, unknown][] = [],
>(
  f: StateCreator<T, [...Mps, ['@trg/zustand-computed', A]], Mcs>,
  compute: (state: T) => A,
  opts?: ComputedStateOpts<T>,
) => StateCreator<T, Mps, [['@trg/zustand-computed', A], ...Mcs], T & A>;

type Cast<T, U> = T extends U ? T : U;
type Write<T, U> = Omit<T, keyof U> & U;
type StoreCompute<S, A> = S extends {
  getState: () => infer T;
}
  ? Omit<StoreApi<T & A>, 'setState'>
  : never;
type WithCompute<S, A> = Write<S, StoreCompute<S, A>>;

declare module 'zustand/vanilla' {
  interface StoreMutators<S, A> {
    '@trg/zustand-computed': WithCompute<Cast<S, object>, A>;
  }
}

type ComputedStateImpl = <T extends object, A extends object>(
  f: StateCreator<T, [], []>,
  compute: (state: T) => A,
  opts?: ComputedStateOpts<T>,
) => StateCreator<T, [], [], T & A>;

const computedImpl: ComputedStateImpl = (f, compute, opts) => {
  // set of keys that have been accessed in any compute call
  const trackedSelectors = new Set<string | number | symbol>();
  return (set, get, api) => {
    type T = ReturnType<typeof f>;
    type A = ReturnType<typeof compute>;

    const equalityFn = opts?.equalityFn ?? shallow;

    if (opts?.keys) {
      const selectorKeys = opts.keys;
      selectorKeys.forEach((key) => trackedSelectors.add(key));
    }

    // we track which selectors are accessed
    const useSelectors = opts?.disableProxy !== true || !!opts?.keys;
    const useProxy = opts?.disableProxy !== true && !opts?.keys;
    const computeAndMerge = (state: T): T & A => {
      // create a Proxy to track which selectors are accessed
      const stateProxy = new Proxy(
        { ...state },
        {
          get: (_, prop) => {
            trackedSelectors.add(prop);
            // @ts-ignore
            return state[prop];
          },
        },
      );

      // calculate the new computed state
      const fullComputedState: A = compute(
        useProxy ? stateProxy : { ...state },
      );
      const newState = { ...state, ...fullComputedState };

      // limit the new computed state down to object refs that changed
      for (const k of Object.keys(fullComputedState))
        if (
          !equalityFn((state as SafeAny)[k], (fullComputedState as SafeAny)[k])
        ) {
          // @ts-ignore
          newState[k] = fullComputedState[k];
        }

      // return state with the changed properties of computed
      return newState;
    };

    const setWithComputed = (
      update: T | ((state: T) => T),
      replace?: boolean,
    ) => {
      const updater = (state: T): T & A => {
        const updated = typeof update === 'object' ? update : update(state);

        if (
          useSelectors &&
          trackedSelectors.size !== 0 &&
          !Object.keys(updated).some((k) => trackedSelectors.has(k))
        ) {
          // if we have a selector set, but none of the updated keys are in the selector set, then we can skip the compute
          return { ...state, ...updated } as T & A;
        }

        return computeAndMerge({ ...state, ...updated });
      };

      if (replace) {
        set(updater, true);
      } else {
        set(updater, replace);
      }
    };

    const _api = api as Mutate<StoreApi<T>, [['@trg/zustand-computed', A]]>;
    _api.setState = setWithComputed;
    const st = f(setWithComputed, get, _api) as T & A;
    return Object.assign({}, st, compute(st));
  };
};

export const computed = computedImpl as unknown as ComputedStateCreator;
export default computed;
