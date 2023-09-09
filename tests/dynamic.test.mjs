import { mock, test } from 'node:test';
import * as assert from 'node:assert';

import {
  THENABLE_PENDING,
  promiseDelegate
} from './utils.mjs';

import { atom, awaitable, dynamicAtom } from '../lib/index.mjs';

test('dynamic', async (t) => {
  await t.test('should promise store value', async () => {
    const v1 = {};
    const d1 = promiseDelegate();
    const a1 = atom(d1.promise);
    const a2 = dynamicAtom((get) => get(a1));

    const sub = mock.fn();
    const done = a2.l(sub);

    const subLazy = mock.fn();
    const doneLazy = a2.ll(subLazy);

    assert.strictEqual(a2.v().status, THENABLE_PENDING);
    assert.strictEqual(sub.mock.callCount(), 1);
    assert.strictEqual(subLazy.mock.callCount(), 0);

    d1.resolve(v1);

    assert.strictEqual(a2.v().status, THENABLE_PENDING);
    assert.strictEqual(sub.mock.callCount(), 1);
    assert.strictEqual(subLazy.mock.callCount(), 0);

    await d1.promise;

    assert.strictEqual(a2.v().status, THENABLE_PENDING);
    assert.strictEqual(sub.mock.callCount(), 1);
    assert.strictEqual(subLazy.mock.callCount(), 0);

    const v1a2 = await awaitable(a2.v());

    assert.strictEqual(v1a2, v1);
    assert.strictEqual(a2.v().value, v1);
    assert.strictEqual(sub.mock.callCount(), 1);
    assert.strictEqual(subLazy.mock.callCount(), 1);

    done();
    doneLazy();
  });
});
