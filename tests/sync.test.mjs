import { mock, test } from 'node:test';
import * as assert from 'node:assert';

import {
  thenableReason,
  thenableValue
} from './utils.mjs';

import { atom } from '../lib/index.mjs';

test('sync', async (t) => {
  await t.test('should sync store value', () => {
    const v1 = {};
    const a1 = atom(v1);

    const sub = mock.fn();
    const done = a1.l(sub);

    const subLazy = mock.fn();
    const doneLazy = a1.ll(subLazy);

    assert.strictEqual(a1.v().value, v1);
    assert.strictEqual(sub.mock.callCount(), 0);
    assert.strictEqual(subLazy.mock.callCount(), 0);

    done();
    doneLazy();

    assert.strictEqual(a1.v().value, v1);
    assert.strictEqual(sub.mock.callCount(), 0);
    assert.strictEqual(subLazy.mock.callCount(), 0);
  });

  await t.test('should sync update value', () => {
    const v1 = {};
    const a1 = atom(v1);

    const sub = mock.fn();
    const done = a1.l(sub);

    const subLazy = mock.fn();
    const doneLazy = a1.ll(subLazy);

    assert.strictEqual(a1.v().value, v1);
    assert.strictEqual(sub.mock.callCount(), 0);
    assert.strictEqual(subLazy.mock.callCount(), 0);

    const v2 = {};

    a1.u(v2);

    assert.strictEqual(a1.v().value, v2);
    assert.strictEqual(sub.mock.callCount(), 1);
    assert.strictEqual(subLazy.mock.callCount(), 1);

    done();
    doneLazy();
  });

  await t.test('should sync store thenable value', () => {
    const v1 = {};
    const a1 = atom(thenableValue(v1));

    const sub = mock.fn();
    const done = a1.l(sub);

    const subLazy = mock.fn();
    const doneLazy = a1.ll(subLazy);

    assert.strictEqual(a1.v().value, v1);
    assert.strictEqual(sub.mock.callCount(), 0);
    assert.strictEqual(subLazy.mock.callCount(), 0);

    done();
    doneLazy();

    assert.strictEqual(a1.v().value, v1);
    assert.strictEqual(sub.mock.callCount(), 0);
    assert.strictEqual(subLazy.mock.callCount(), 0);
  });

  await t.test('should sync update thenable value', () => {
    const v1 = {};
    const a1 = atom(v1);

    const sub = mock.fn();
    const done = a1.l(sub);

    const subLazy = mock.fn();
    const doneLazy = a1.ll(subLazy);

    assert.strictEqual(a1.v().value, v1);
    assert.strictEqual(sub.mock.callCount(), 0);
    assert.strictEqual(subLazy.mock.callCount(), 0);

    const v2 = {};

    a1.u(thenableValue(v2));

    assert.strictEqual(a1.v().value, v2);
    assert.strictEqual(sub.mock.callCount(), 1);
    assert.strictEqual(subLazy.mock.callCount(), 1);

    done();
    doneLazy();
  });

  await t.test('should sync store thenable reason', () => {
    const r1 = new Error('r1');
    const a1 = atom(thenableReason(r1));

    const sub = mock.fn();
    const done = a1.l(sub);

    const subLazy = mock.fn();
    const doneLazy = a1.ll(subLazy);

    assert.strictEqual(a1.v().reason, r1);
    assert.strictEqual(sub.mock.callCount(), 0);
    assert.strictEqual(subLazy.mock.callCount(), 0);

    done();
    doneLazy();

    assert.strictEqual(a1.v().reason, r1);
    assert.strictEqual(sub.mock.callCount(), 0);
    assert.strictEqual(subLazy.mock.callCount(), 0);
  });

  await t.test('should sync update thenable reason', () => {
    const r1 = new Error('r1');
    const a1 = atom(thenableReason(r1));

    const sub = mock.fn();
    const done = a1.l(sub);

    const subLazy = mock.fn();
    const doneLazy = a1.ll(subLazy);

    assert.strictEqual(a1.v().reason, r1);
    assert.strictEqual(sub.mock.callCount(), 0);
    assert.strictEqual(subLazy.mock.callCount(), 0);

    const r2 = new Error('r2');

    a1.u(thenableReason(r2));

    assert.strictEqual(a1.v().reason, r2);
    assert.strictEqual(sub.mock.callCount(), 1);
    assert.strictEqual(subLazy.mock.callCount(), 1);

    done();
    doneLazy();
  });

  await t.test('should sync update thenable value and reason', () => {
    const v1 = {};
    const a1 = atom(v1);

    const sub = mock.fn();
    const done = a1.l(sub);

    const subLazy = mock.fn();
    const doneLazy = a1.ll(subLazy);

    assert.strictEqual(a1.v().value, v1);
    assert.strictEqual(sub.mock.callCount(), 0);
    assert.strictEqual(subLazy.mock.callCount(), 0);

    const r1 = new Error('r1');

    a1.u(thenableReason(r1));

    assert.strictEqual(a1.v().reason, r1);
    assert.strictEqual(sub.mock.callCount(), 1);
    assert.strictEqual(subLazy.mock.callCount(), 1);

    const v2 = {};

    a1.u(v2);

    assert.strictEqual(a1.v().value, v2);
    assert.strictEqual(sub.mock.callCount(), 2);
    assert.strictEqual(subLazy.mock.callCount(), 2);

    a1.u(thenableValue(v2));

    assert.strictEqual(a1.v().value, v2);
    assert.strictEqual(sub.mock.callCount(), 2);
    assert.strictEqual(subLazy.mock.callCount(), 2);

    a1.u(v1);

    assert.strictEqual(a1.v().value, v1);
    assert.strictEqual(sub.mock.callCount(), 3);
    assert.strictEqual(subLazy.mock.callCount(), 3);

    done();
    doneLazy();
  });
});
