import {
  STATUS_FULFILLED,
  STATUS_PENDING,
  STATUS_REJECTED
} from '../usable.js';

type UseablePromise<T> = PromiseLike<T> & {
  status?: 'pending' | 'fulfilled' | 'rejected';
  value?: T;
  reason?: unknown;
};

export const use = <T>(promise: UseablePromise<T>) => {
  /* eslint-disable @typescript-eslint/no-throw-literal */

  if (promise.status === STATUS_FULFILLED) {
    return promise.value as T;
  }

  if (promise.status === STATUS_REJECTED) {
    throw promise.reason;
  }

  if (promise.status === STATUS_PENDING) {
    throw promise;
  }

  promise.status = STATUS_PENDING;
  promise.then(
    (value) => {
      promise.status = STATUS_FULFILLED;
      promise.value = value;
    },
    (ex) => {
      promise.status = STATUS_REJECTED;
      promise.reason = ex;
    }
  );

  throw promise;
};
