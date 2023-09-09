type UsableStatus = 'pending' | 'fulfilled' | 'rejected';

type UsableLike<T> = {
  status?: UsableStatus | undefined;
  value?: Awaited<T> | undefined;
  reason?: any;

  then: <TF = Awaited<T>, TR = never>(
    onfulfilled?: ((value: Awaited<T>) => TF | Awaited<TF> | UsableLike<TF>) | undefined | null,
    onrejected?: ((reason: any) => TR | Awaited<TR> | UsableLike<TR>) | undefined | null
  ) => UsableLike<TF | TR>;
};

type UsableStatePending = {
  status: 'pending';
};

type UsableStateFulfilled<T> = {
  status: 'fulfilled';
  value: Awaited<T>;
};

type UsableStateRejected = {
  status: 'rejected';
  reason: any;
};

type Usable<T> = (
  UsableStatePending |
  UsableStateFulfilled<T> |
  UsableStateRejected
) & {
  then: <TF = Awaited<T>, TR = never>(
    onfulfilled?: ((value: Awaited<T>) => TF | Awaited<TF> | Usable<TF> | UsableLike<TF>) | undefined | null,
    onrejected?: ((reason: any) => TR | Awaited<TR> | Usable<TR> | UsableLike<TR>) | undefined | null
  ) => Usable<TF | TR>;
};

type UsableFulfilled<T> = Exclude<Usable<T>, UsableStatePending | UsableStateRejected>;
type UsableRejected<T> = Exclude<Usable<T>, UsableStateFulfilled<T> | UsableStatePending>;

type UsableSource<T> = T | Awaited<T> | Usable<T> | UsableLike<T>;

type AnyFunction = (...args: any[]) => any;

const noop: AnyFunction = () => { /* Noop */ };

// eslint-disable-next-line no-undefined
const UNSET = undefined;

const STATUS_PENDING = 'pending';
const STATUS_FULFILLED = 'fulfilled';
const STATUS_REJECTED = 'rejected';

const isUsable = <T>(value: unknown): value is Usable<T> | UsableLike<T> =>
  typeof value === 'object' && value !== null && 'then' in value && typeof value.then === 'function';

let createFromValue: <T>(value: T) => Usable<T>;
let createFromReason: <T>(reason: any) => Usable<T>;
let createFromUsable: <T>(usable: UsableLike<T>) => Usable<T>;

const toUsableValue = <T>(value: T): Usable<T> =>
  (
    isUsable(value) ?
      createFromUsable(value) :
      createFromValue(value)
  ) as any;

const toUsableReason = <T>(reason: any): Usable<T> =>
  (
    isUsable(reason) ?
      createFromUsable(reason) :
      createFromReason(reason)
  ) as any;

const createFulfilled = (
  useable: UsableFulfilled<any>,
  onfulfilled: unknown
): Usable<any> => {
  try {
    const piped = typeof onfulfilled === 'function' ?
      onfulfilled(useable.value) :
      useable;

    return toUsableValue(piped);
  } catch (ex: unknown) {
    return toUsableReason(ex);
  }
};

const createRejected = (
  useable: UsableRejected<any>,
  onrejected: unknown
): Usable<any> => {
  try {
    const piped = typeof onrejected === 'function' ?
      onrejected(useable.reason) :
      useable;

    return toUsableValue(piped);
  } catch (ex: unknown) {
    return toUsableReason(ex);
  }
};

createFromValue = <T>(value: T) => {
  const reusable: UsableLike<T> = {
    status: STATUS_FULFILLED,
    value: value as Awaited<T>,
    reason: UNSET,
    then: (onfulfilled) => createFulfilled(reusable as UsableFulfilled<T>, onfulfilled)
  };

  return reusable as UsableFulfilled<T>;
};

createFromReason = <T>(reason: any) => {
  const reusable: UsableLike<T> = {
    status: STATUS_REJECTED,
    value: UNSET,
    reason,
    then: (_, onrejected) => createRejected(reusable as UsableRejected<T>, onrejected)
  };

  return reusable as UsableRejected<T>;
};

createFromUsable = <T>(usable: UsableLike<T>) => {
  const reusable: UsableLike<T> = {
    status: usable.status || STATUS_PENDING,
    value: usable.value,
    reason: usable.reason,
    then: noop
  };

  const reusableFulfilled: AnyFunction = (onfulfilled) =>
    createFulfilled(reusable as UsableFulfilled<T>, onfulfilled);

  const reusableRejected: AnyFunction = (_, onrejected) =>
    createRejected(reusable as UsableRejected<T>, onrejected);

  if (reusable.status === STATUS_FULFILLED) {
    reusable.then = reusableFulfilled;

    return reusable as Usable<T>;
  }

  if (reusable.status === STATUS_REJECTED) {
    reusable.then = reusableRejected;

    return reusable as Usable<T>;
  }

  reusable.then = (onfulfilled, onrejected) => {
    const piped = usable.then(
      () => reusableFulfilled(onfulfilled),
      () => reusableRejected(onfulfilled, onrejected)
    );

    return toUsableValue(piped);
  };

  usable.then((value) => {
    reusable.status = STATUS_FULFILLED;
    reusable.value = value;
    reusable.then = reusableFulfilled;
  }, (ex: unknown) => {
    reusable.status = STATUS_REJECTED;
    reusable.reason = ex;
    reusable.then = reusableRejected;
  });

  return reusable as Usable<T>;
};

const awaitable = <T>(useable: UsableLike<T>) => new Promise<T>((resolve, reject) => {
  useable.then(resolve, reject);
});

export {
  STATUS_FULFILLED,
  STATUS_PENDING,
  STATUS_REJECTED,

  UNSET,

  isUsable,
  toUsableReason,
  toUsableValue,

  awaitable
};

export type {
  Usable,
  UsableLike,
  UsableSource
};
