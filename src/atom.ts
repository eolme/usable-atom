import type { Usable, UsableLike, UsableSource } from './usable.js';

import {
  STATUS_FULFILLED,
  STATUS_PENDING,
  STATUS_REJECTED,

  UNSET,

  isUsable,
  toUsableReason,
  toUsableValue
} from './usable.js';

type Listener<T> = (usable: T) => void;
type Listen<T> = (listener: Listener<T>) => () => void;

const createEmit = <T>(listeners: Set<Listener<T>>): Listener<T> => (usable) => {
  listeners.forEach((listener) => {
    listener(usable);
  });
};

const createListen = <T>(listeners: Set<Listener<T>>): Listen<T> => (listener) => {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
};

export type Atom<T> = {
  /**
   * Value
   *
   * @internal
   * @readonly
   **/
  readonly v: () => Usable<T>;

  /**
   * Update
   *
   * @internal
   * @readonly
   **/
  readonly u: (update: UsableSource<T>) => Usable<T>;

  /**
   * Listen
   *
   * @internal
   * @readonly
   **/
  readonly l: Listen<Usable<T>>;

  /**
   * Lazy listen
   *
   * @internal
   * @readonly
   **/
  readonly ll: Listen<Usable<T>>;
};

const atom = <T>(initialValue: UsableSource<T>): Atom<T> => {
  type AtomUsable = Usable<T>;
  type AtomUsableLike = UsableLike<T>;

  const listeners = new Set<Listener<AtomUsable>>();
  const lazyListeners = new Set<Listener<AtomUsable>>();

  const emit = createEmit(listeners);
  const listen = createListen(listeners);

  const emitLazy = createEmit(lazyListeners);
  const listenLazy = createListen(lazyListeners);

  let usable = toUsableValue(initialValue) as AtomUsableLike;

  const getter = () => usable as AtomUsable;

  const setter = (update: UsableSource<T>): AtomUsable => {
    if (update === usable) {
      return usable as AtomUsable;
    }

    const nextUsable = toUsableValue(update) as AtomUsable;
    const next = nextUsable as AtomUsableLike;

    const usableValue = usable.value;
    const usableReason = usable.reason;

    const shouldUpdate =
      next.status === STATUS_PENDING ||
      next.status !== usable.status ||
      next.value !== usableValue ||
      next.reason !== usableReason;

    if (shouldUpdate) {
      usable = next;

      const updated = () => {
        if (
          usable === next && (
            (usable.status === STATUS_FULFILLED && usable.value !== usableValue) ||
            (usable.status === STATUS_REJECTED && usable.reason !== usableReason)
          )
        ) {
          emitLazy(nextUsable);
        }

        return nextUsable;
      };

      emit(nextUsable);

      return (
        nextUsable.status === STATUS_PENDING ?
          nextUsable.then<AtomUsable, AtomUsable>(updated, updated) :
          updated()
      );
    }

    return usable as AtomUsable;
  };

  return {
    v: getter,
    u: setter,
    l: listen,
    ll: listenLazy
  };
};

const reader = <T>(source: Atom<T>) => {
  /* eslint-disable @typescript-eslint/no-throw-literal */

  const usable = source.v();

  if (usable.status === STATUS_FULFILLED) {
    return usable.value;
  }

  if (usable.status === STATUS_REJECTED) {
    throw usable.reason;
  }

  throw usable;
};

const writer = <T>(source: Atom<T>, update: UsableSource<T>) => {
  source.u(update);
};

const dynamicAtom = <T>(
  read: (
    get: <S>(source: Atom<S>) => Awaited<S>
  ) => UsableSource<T>,
  write?: (
    get: <S>(source: Atom<S>) => Awaited<S>,
    set: <S>(source: Atom<S>, update: UsableSource<S>) => void,
    update: Awaited<T>
  ) => UsableSource<T>
): Atom<T> => {
  type AtomUsable = Usable<T>;

  const internal = atom<T>(UNSET as T);

  let track: () => AtomUsable;

  const reread = (): AtomUsable => {
    try {
      const next = read((source) => {
        source.l(track);

        return reader(source);
      });

      return toUsableValue(next);
    } catch (ex: unknown) {
      if (isUsable(ex)) {
        return toUsableValue(ex).then<AtomUsable, AtomUsable>(
          reread,
          (ex_) => toUsableReason(ex_)
        );
      }

      return toUsableReason(ex);
    }
  };

  let tracked = false;

  track = () => internal.u(reread());

  const getter = () => {
    if (tracked) {
      return internal.v();
    }

    tracked = true;

    return track();
  };

  const writeable = typeof write === 'function';

  const rewrite = writeable ?
    (update: Awaited<T>): AtomUsable => {
      try {
        const next = write(
          reader,
          writer,
          update
        );

        return toUsableValue(next);
      } catch (ex: unknown) {
        if (isUsable(ex)) {
          return toUsableValue(ex).then<AtomUsable, AtomUsable>(
            () => rewrite(update),
            (_ex) => toUsableReason(_ex)
          );
        }

        return toUsableReason(ex);
      }
    } :
    (update: Awaited<T>) => toUsableValue(update);

  const setter = writeable ?
    (update: UsableSource<T>): AtomUsable => {
      return internal.u(
        isUsable(update) ?
          update.then<AtomUsable, AtomUsable>(
            rewrite,
            (ex) => toUsableReason(ex)
          ) as AtomUsable :
          rewrite(update as Awaited<T>)
      );
    } :
    internal.u;

  return {
    v: getter,
    u: setter,
    l: internal.l,
    ll: internal.ll
  };
};

export {
  atom,
  dynamicAtom
};
