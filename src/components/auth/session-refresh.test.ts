// node --test src/components/auth/session-refresh.test.ts
// Every token string below is a fake fixture value. secret-scan:allow
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createSessionRefresher, expiryMs, errorStatus, type RefreshableSession } from './session-refresh.ts';

const NOW = 1_800_000_000_000;

/** A fake persisted store shared by "tabs": memory is this tab's copy, disk is localStorage. */
function makeStore(initial: RefreshableSession) {
  const disk = { value: { ...initial } };
  let memory: RefreshableSession | null = { ...initial };
  return {
    disk,
    get: () => memory,
    reload: () => {
      memory = { ...disk.value };
    },
    save: (s: RefreshableSession) => {
      memory = s;
      disk.value = { ...s };
    },
  };
}

function httpError(status: number) {
  return Object.assign(new Error(`HTTP ${status}`), { status });
}

test('adopts a newer token another tab saved instead of spending a rotated refresh token', async () => {
  const store = makeStore({ accessToken: 'old', refreshToken: 'r1', expiresAt: new Date(NOW - 1000).toISOString() });
  // Another tab refreshed: disk now holds r2 and a live access token.
  store.disk.value = { accessToken: 'fresh', refreshToken: 'r2', expiresAt: new Date(NOW + 3_600_000).toISOString() };
  let calls = 0;
  const refresh = createSessionRefresher({
    lockName: 't', getSession: store.get, reloadSession: store.reload, saveSession: store.save, now: () => NOW,
    refresh: async () => { calls++; throw httpError(401); },
  });
  assert.deepEqual(await refresh('old'), { token: 'fresh' });
  assert.equal(calls, 0);
});

test('refreshes with the latest refresh token and keeps the expiry type', async () => {
  const store = makeStore({ accessToken: 'a1', refreshToken: 'r1', expiresAt: NOW - 1000 });
  const seen: string[] = [];
  const refresh = createSessionRefresher({
    lockName: 't', getSession: store.get, reloadSession: store.reload, saveSession: store.save, now: () => NOW,
    refresh: async (rt) => { seen.push(rt); return { access_token: 'a2', refresh_token: 'r2', expires_in: 60 }; },
  });
  assert.deepEqual(await refresh('a1'), { token: 'a2' });
  assert.deepEqual(seen, ['r1']);
  assert.deepEqual(store.disk.value, { accessToken: 'a2', refreshToken: 'r2', expiresAt: NOW + 60_000 });
});

test('a refused refresh still adopts a session another tab saved meanwhile', async () => {
  const store = makeStore({ accessToken: 'a1', refreshToken: 'r1', expiresAt: NOW - 1000 });
  const refresh = createSessionRefresher({
    lockName: 't', getSession: store.get, reloadSession: store.reload, saveSession: store.save, now: () => NOW,
    refresh: async () => {
      store.disk.value = { accessToken: 'tab2', refreshToken: 'r9', expiresAt: NOW + 3_600_000 };
      throw httpError(401);
    },
  });
  assert.deepEqual(await refresh('a1'), { token: 'tab2' });
});

test('a refused refresh with nothing newer is a sign-out; a server error is transient', async () => {
  const mk = (status: number) => {
    const store = makeStore({ accessToken: 'a1', refreshToken: 'r1', expiresAt: NOW - 1000 });
    return createSessionRefresher({
      lockName: 't', getSession: store.get, reloadSession: store.reload, saveSession: store.save, now: () => NOW,
      refresh: async () => { throw httpError(status); },
    });
  };
  assert.deepEqual(await mk(401)('a1'), { rejected: true });
  assert.deepEqual(await mk(400)('a1'), { rejected: true });
  assert.deepEqual(await mk(503)('a1'), { transient: true });
  assert.deepEqual(await mk(0)('a1'), { transient: true });
});

test('an enrolment-only answer is a sign-out and is never saved', async () => {
  const store = makeStore({ accessToken: 'a1', refreshToken: 'r1', expiresAt: NOW - 1000 });
  const refresh = createSessionRefresher({
    lockName: 't', getSession: store.get, reloadSession: store.reload, saveSession: store.save, now: () => NOW,
    refresh: async () => ({ access_token: 'enrol', refresh_token: 'r2', mfa_enrollment_required: true }),
  });
  assert.deepEqual(await refresh('a1'), { rejected: true });
  assert.equal(store.disk.value.accessToken, 'a1');
});

test('concurrent calls in one tab share one refresh', async () => {
  const store = makeStore({ accessToken: 'a1', refreshToken: 'r1', expiresAt: NOW - 1000 });
  let calls = 0;
  const refresh = createSessionRefresher({
    lockName: 't', getSession: store.get, reloadSession: store.reload, saveSession: store.save, now: () => NOW,
    refresh: async () => { calls++; return { access_token: 'a2', refresh_token: 'r2', expires_in: 3600 }; },
  });
  const [x, y, z] = await Promise.all([refresh('a1'), refresh('a1'), refresh('a1')]);
  assert.equal(calls, 1);
  assert.deepEqual([x, y, z], [{ token: 'a2' }, { token: 'a2' }, { token: 'a2' }]);
});

test('no session or no refresh token is a sign-out', async () => {
  const refresh = createSessionRefresher({
    lockName: 't', getSession: () => null, saveSession: () => {}, now: () => NOW,
    refresh: async () => ({ access_token: 'x' }),
  });
  assert.deepEqual(await refresh(), { rejected: true });
});

test('helpers read ISO and epoch expiries and fetch or axios statuses', () => {
  assert.equal(expiryMs(NOW), NOW);
  assert.equal(expiryMs(new Date(NOW).toISOString()), NOW);
  assert.equal(expiryMs('nonsense'), 0);
  assert.equal(errorStatus({ status: 401 }), 401);
  assert.equal(errorStatus({ response: { status: 403 } }), 403);
  assert.equal(errorStatus(new Error('x')), undefined);
});
