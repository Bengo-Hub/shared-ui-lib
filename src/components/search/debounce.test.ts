// node --test src/components/search/debounce.test.ts
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createDebouncer, createSearchRunner, isAbortError, normalizeSearchTerm } from './debounce.ts';

test('five quick keystrokes make one call with the last value', (t) => {
  t.mock.timers.enable({ apis: ['setTimeout'] });
  const calls: string[] = [];
  const d = createDebouncer((q: string) => calls.push(q), 300);
  for (const q of ['p', 'pi', 'piz', 'pizz', 'pizza']) {
    d(q);
    t.mock.timers.tick(100);
  }
  assert.deepEqual(calls, []);
  t.mock.timers.tick(300);
  assert.deepEqual(calls, ['pizza']);
});

test('each keystroke restarts the wait', (t) => {
  t.mock.timers.enable({ apis: ['setTimeout'] });
  const calls: string[] = [];
  const d = createDebouncer((q: string) => calls.push(q), 300);
  d('a');
  t.mock.timers.tick(299);
  d('ab');
  t.mock.timers.tick(299);
  assert.deepEqual(calls, []);
  t.mock.timers.tick(1);
  assert.deepEqual(calls, ['ab']);
});

test('flush runs the pending call at once, cancel drops it', (t) => {
  t.mock.timers.enable({ apis: ['setTimeout'] });
  const calls: string[] = [];
  const d = createDebouncer((q: string) => calls.push(q), 300);
  d('scan-123');
  assert.equal(d.pending(), true);
  d.flush();
  assert.deepEqual(calls, ['scan-123']);
  assert.equal(d.pending(), false);
  t.mock.timers.tick(1000);
  assert.deepEqual(calls, ['scan-123']);

  d('typed');
  d.cancel();
  t.mock.timers.tick(1000);
  assert.deepEqual(calls, ['scan-123']);
  d.flush();
  assert.deepEqual(calls, ['scan-123']);
});

test('maxWait fires during a long burst', (t) => {
  t.mock.timers.enable({ apis: ['setTimeout'] });
  const calls: number[] = [];
  const d = createDebouncer((n: number) => calls.push(n), 300, { maxWait: 1000 });
  for (let i = 1; i <= 12; i += 1) {
    d(i);
    t.mock.timers.tick(100);
  }
  assert.deepEqual(calls, [10]);
  t.mock.timers.tick(300);
  assert.deepEqual(calls, [10, 12]);
});

test('normalizeSearchTerm trims, collapses, caps and applies minChars', () => {
  assert.equal(normalizeSearchTerm('  pizza   margherita '), 'pizza margherita');
  assert.equal(normalizeSearchTerm('a', { minChars: 2 }), '');
  assert.equal(normalizeSearchTerm('ab', { minChars: 2 }), 'ab');
  assert.equal(normalizeSearchTerm('   '), '');
  assert.equal(normalizeSearchTerm('x'.repeat(150)).length, 100);
  assert.equal(normalizeSearchTerm('abcdef', { maxLength: 3 }), 'abc');
});

test('isAbortError recognises fetch and axios cancellations', () => {
  assert.equal(isAbortError(new DOMException('aborted', 'AbortError')), true);
  assert.equal(isAbortError({ name: 'CanceledError' }), true);
  assert.equal(isAbortError({ code: 'ERR_CANCELED' }), true);
  assert.equal(isAbortError(new Error('500')), false);
  assert.equal(isAbortError(null), false);
});

function deferred<T>() {
  let resolve!: (v: T) => void;
  let reject!: (e: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

test('only the newest search wins and older requests are aborted', async () => {
  const pending = new Map<string, { d: ReturnType<typeof deferred<string>>; signal: AbortSignal }>();
  const runner = createSearchRunner<string>(() => (term, { signal }) => {
    const d = deferred<string>();
    pending.set(term, { d, signal });
    return d.promise;
  });

  const first = runner.run('piz');
  const second = runner.run('pizza');
  assert.equal(pending.get('piz')!.signal.aborted, true);
  assert.equal(pending.get('pizza')!.signal.aborted, false);

  pending.get('pizza')!.d.resolve('new');
  pending.get('piz')!.d.resolve('old');
  assert.deepEqual(await second, { status: 'ok', value: 'new' });
  assert.deepEqual(await first, { status: 'stale' });
});

test('an error on the newest search is reported, an abort is not', async () => {
  const runner = createSearchRunner<string>(() => async (term, { signal }) => {
    if (term === 'boom') throw new Error('server down');
    return new Promise<string>((_, reject) => {
      signal.addEventListener('abort', () => reject(new DOMException('aborted', 'AbortError')));
    });
  });

  const hanging = runner.run('slow');
  runner.cancel();
  assert.deepEqual(await hanging, { status: 'stale' });

  const failed = await runner.run('boom');
  assert.equal(failed.status, 'error');
});

test('the runner reads the latest search callback on every run', async () => {
  let version = 'v1';
  const runner = createSearchRunner<string>(() => {
    const v = version;
    return async (term) => `${v}:${term}`;
  });
  assert.deepEqual(await runner.run('a'), { status: 'ok', value: 'v1:a' });
  version = 'v2';
  assert.deepEqual(await runner.run('a'), { status: 'ok', value: 'v2:a' });
});
