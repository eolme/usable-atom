/* eslint-disable @typescript-eslint/no-duplicate-imports */

import type { Atom } from '../atom.js';

import { useSyncExternalStore } from './use-sync-external-store.js';
import { use } from './use.js';

import { awaitable } from '../index.js';

export {
  atom,
  awaitable,
  dynamicAtom
} from '../index.js';

export type {
  Atom,
  Usable,
  UsableLike,
  UsableSource
} from '../index.js';

export const useAtomUsable = <T>(atom: Atom<T>) => {
  return useSyncExternalStore(
    atom.l,
    atom.v,
    atom.v
  );
};

export const useAtomUsableLazy = <T>(atom: Atom<T>) => {
  return useSyncExternalStore(
    atom.ll,
    atom.v,
    atom.v
  );
};

export const useServerAtomValue = <T>(atom: Atom<T>) => {
  const usable = useAtomUsable(atom);

  return awaitable(usable);
};

export const useAtomValue = <T>(atom: Atom<T>) => {
  const usable = useAtomUsable(atom);

  return use(usable);
};

export const useAtomValueLazy = <T>(atom: Atom<T>) => {
  const usable = useAtomUsableLazy(atom);

  return use(usable);
};

export const useAtomUpdate = <T>(atom: Atom<T>) => {
  return atom.u;
};

export const useAtom = <T>(atom: Atom<T>) => {
  return [
    useAtomValue(atom),
    useAtomUpdate(atom)
  ] as const;
};

export const useAtomLazy = <T>(atom: Atom<T>) => {
  return [
    useAtomValueLazy(atom),
    useAtomUpdate(atom)
  ] as const;
};
