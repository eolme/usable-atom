// eslint-disable-next-line no-undefined
export const UNSET = undefined;

export const THENABLE_PENDING = 'pending';

export const thenableValue = (value) => ({
  then: (onfulfilled) => onfulfilled(value)
});

export const thenableReason = (reason) => ({
  then: (_, onrejected) => onrejected(reason)
});

export const promiseDelegate = () => {
  let resolve;
  let reject;

  const promise = new Promise((_resolve, _reject) => {
    resolve = _resolve;
    reject = _reject;
  });

  return {
    resolve,
    reject,
    promise
  };
};
