import { mock, test } from 'node:test';
import * as assert from 'node:assert';

import {
  THENABLE_PENDING
} from './utils.mjs';

import { atom } from '../lib/index.mjs';

test('async', async (t) => {
  await t.test('should promise store value', async () => {
    const v1 = {};
    const p1 = Promise.resolve(v1);
    const a1 = atom(p1);

    const sub = mock.fn();
    const done = a1.l(sub);

    const subLazy = mock.fn();
    const doneLazy = a1.ll(subLazy);

    assert.strictEqual(a1.v().status, THENABLE_PENDING);
    assert.strictEqual(sub.mock.callCount(), 0);
    assert.strictEqual(subLazy.mock.callCount(), 0);

    await p1;

    assert.strictEqual(a1.v().value, v1);
    assert.strictEqual(sub.mock.callCount(), 0);
    assert.strictEqual(subLazy.mock.callCount(), 0);

    done();
    doneLazy();

    assert.strictEqual(a1.v().value, v1);
    assert.strictEqual(sub.mock.callCount(), 0);
    assert.strictEqual(subLazy.mock.callCount(), 0);
  });

  await t.test('should promise update value', async () => {
    const v1 = {};
    const a1 = atom(v1);

    const sub = mock.fn();
    const done = a1.l(sub);

    const subLazy = mock.fn();
    const doneLazy = a1.ll(subLazy);

    assert.strictEqual(a1.v().value, v1);
    assert.strictEqual(sub.mock.callCount(), 0);

    const v2 = {};
    const p2 = Promise.resolve(v2);

    a1.u(p2);

    assert.strictEqual(a1.v().status, THENABLE_PENDING);
    assert.strictEqual(sub.mock.callCount(), 1);
    assert.strictEqual(subLazy.mock.callCount(), 0);

    await p2;

    assert.strictEqual(a1.v().value, v2);
    assert.strictEqual(sub.mock.callCount(), 1);
    assert.strictEqual(subLazy.mock.callCount(), 1);

    done();
    doneLazy();
  });

  await t.test('should promise restore value', async () => {
    const v1 = {};
    const p1 = Promise.resolve(v1);
    const a1 = atom(p1);

    const sub = mock.fn();
    const done = a1.l(sub);

    const subLazy = mock.fn();
    const doneLazy = a1.ll(subLazy);

    assert.strictEqual(a1.v().status, THENABLE_PENDING);
    assert.strictEqual(sub.mock.callCount(), 0);
    assert.strictEqual(subLazy.mock.callCount(), 0);

    await p1;

    assert.strictEqual(a1.v().value, v1);
    assert.strictEqual(sub.mock.callCount(), 0);
    assert.strictEqual(subLazy.mock.callCount(), 0);

    a1.u(p1);

    assert.strictEqual(a1.v().status, THENABLE_PENDING);
    assert.strictEqual(sub.mock.callCount(), 1);
    assert.strictEqual(subLazy.mock.callCount(), 0);

    await p1;

    assert.strictEqual(a1.v().value, v1);
    assert.strictEqual(sub.mock.callCount(), 1);
    assert.strictEqual(subLazy.mock.callCount(), 0);

    done();
    doneLazy();
  });

  await t.test('should promise restore reason', async () => {
    const r1 = new Error('r1');
    const p1 = Promise.reject(r1);
    const a1 = atom(p1);

    const sub = mock.fn();
    const done = a1.l(sub);

    const subLazy = mock.fn();
    const doneLazy = a1.ll(subLazy);

    assert.strictEqual(a1.v().status, THENABLE_PENDING);
    assert.strictEqual(sub.mock.callCount(), 0);
    assert.strictEqual(subLazy.mock.callCount(), 0);

    try {
      await p1;
    } catch {
      // Just await
    }

    assert.strictEqual(a1.v().reason, r1);
    assert.strictEqual(sub.mock.callCount(), 0);
    assert.strictEqual(subLazy.mock.callCount(), 0);

    a1.u(p1);

    assert.strictEqual(a1.v().status, THENABLE_PENDING);
    assert.strictEqual(sub.mock.callCount(), 1);
    assert.strictEqual(subLazy.mock.callCount(), 0);

    try {
      await p1;
    } catch {
      // Just await
    }

    assert.strictEqual(a1.v().reason, r1);
    assert.strictEqual(sub.mock.callCount(), 1);
    assert.strictEqual(subLazy.mock.callCount(), 0);

    done();
    doneLazy();
  });
});
