// node --test src/components/auth/cookie-session.test.ts
// Every token string below is a fake fixture value. secret-scan:allow
import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { registerHooks } from 'node:module';

// cookie-session.ts imports './session-refresh' without an extension, as the bundler expects.
// Node's type stripping needs the extension, so add it for relative imports under src.
registerHooks({
  resolve(specifier, context, next) {
    if (specifier.startsWith('./') && !/\.[cm]?[jt]sx?$/.test(specifier) && context.parentURL?.includes('/src/')) {
      return next(`${specifier}.ts`, context);
    }
    return next(specifier, context);
  },
});

const { createCookieSession } = await import('./cookie-session.ts');

const NOW = 1_800_000_000_000;
const BASE = 'https://sso.example.test';

// ---- Fakes: BroadcastChannel, navigator.locks, fetch and the browser storages ----

type Listener = ((ev: { data: unknown }) => void) | null;

class FakeChannel {
  static byName = new Map<string, Set<FakeChannel>>();
  name: string;
  onmessage: Listener = null;
  closed = false;
  constructor(name: string) {
    this.name = name;
    const set = FakeChannel.byName.get(name) ?? new Set<FakeChannel>();
    set.add(this);
    FakeChannel.byName.set(name, set);
  }
  postMessage(data: unknown) {
    const copy = structuredClone(data);
    for (const other of FakeChannel.byName.get(this.name) ?? []) {
      if (other !== this && !other.closed) queueMicrotask(() => other.onmessage?.({ data: copy }));
    }
  }
  close() {
    this.closed = true;
    FakeChannel.byName.get(this.name)?.delete(this);
  }
}

let lockRequests: string[] = [];
const lockChains = new Map<string, Promise<unknown>>();
const fakeLocks = {
  request<T>(name: string, cb: () => Promise<T>): Promise<T> {
    lockRequests.push(name);
    const run = (lockChains.get(name) ?? Promise.resolve()).then(() => cb());
    lockChains.set(name, run.catch(() => undefined));
    return run;
  },
};

class FakeStorage {
  map = new Map<string, string>();
  get length() { return this.map.size; }
  getItem(k: string) { return this.map.get(k) ?? null; }
  setItem(k: string, v: string) { this.map.set(k, String(v)); }
  removeItem(k: string) { this.map.delete(k); }
  clear() { this.map.clear(); }
  key(i: number) { return [...this.map.keys()][i] ?? null; }
}

const cookieWrites: string[] = [];
const fakeLocal = new FakeStorage();
const fakeSession = new FakeStorage();

function setGlobal(name: string, value: unknown) {
  Object.defineProperty(globalThis, name, { value, configurable: true, writable: true });
}

function installBrowser() {
  setGlobal('BroadcastChannel', FakeChannel);
  setGlobal('navigator', { locks: fakeLocks });
  setGlobal('localStorage', fakeLocal);
  setGlobal('sessionStorage', fakeSession);
  setGlobal('document', {
    get cookie() { return cookieWrites.join('; '); },
    set cookie(v: string) { cookieWrites.push(v); },
  });
}

beforeEach(() => {
  installBrowser();
  FakeChannel.byName.clear();
  lockChains.clear();
  lockRequests = [];
});

interface Call { url: string; init: RequestInit }
type Reply = number | { status: number; body?: unknown };

/** A fetch that answers from a script; 200 answers carry a fresh fake access token. */
function scriptedFetch(replies: Reply[]) {
  const calls: Call[] = [];
  let issued = 0;
  const fn = async (url: string | URL | Request, init?: RequestInit) => {
    calls.push({ url: String(url), init: init ?? {} });
    await new Promise((r) => setTimeout(r, 1));
    const next = replies.shift() ?? 200;
    const reply = typeof next === 'number' ? { status: next } : next;
    if (reply.status === 0) throw new TypeError('network down');
    const body = reply.body ?? (reply.status === 200
      ? { access_token: `at-${++issued}`, token_type: 'Bearer', expires_in: 900, user: { id: 'u1' } } // secret-scan:allow
      : { error: 'invalid_session' });
    return new Response(JSON.stringify(body), { status: reply.status, headers: { 'Content-Type': 'application/json' } });
  };
  return { fn: fn as unknown as typeof fetch, calls };
}

function tab(f: { fn: typeof fetch }, clock: { t: number } = { t: NOW }, onChange?: (s: unknown) => void) {
  const changes: unknown[] = [];
  const session = createCookieSession({
    authBaseUrl: `${BASE}/`,
    clientId: 'marketflow-ui',
    fetch: f.fn,
    now: () => clock.t,
    retryDelayMs: 0,
    onChange: (s) => { changes.push(s); onChange?.(s); },
  });
  return { session, changes };
}

const flush = () => new Promise((r) => setTimeout(r, 5));

function assertNothingStored() {
  assert.equal(fakeLocal.length, 0, 'localStorage must stay empty');
  assert.equal(fakeSession.length, 0, 'sessionStorage must stay empty');
  assert.deepEqual(cookieWrites, [], 'document.cookie must never be written');
}

// ---- Tests ----

test('start posts the code-exchange refresh token, then getAccessToken serves it from memory', async () => {
  const f = scriptedFetch([200]);
  const { session, changes } = tab(f);
  assert.deepEqual(await session.start('rt-from-code-exchange'), { token: 'at-1' }); // secret-scan:allow
  assert.equal(await session.getAccessToken(), 'at-1');
  assert.equal(f.calls.length, 1);

  const [call] = f.calls;
  assert.equal(call.url, `${BASE}/api/v1/session/start`);
  assert.equal(call.init.method, 'POST');
  assert.equal(call.init.credentials, 'include');
  const headers = call.init.headers as Record<string, string>;
  assert.equal(headers['X-Requested-With'], 'codevertex');
  assert.deepEqual(JSON.parse(String(call.init.body)), { refresh_token: 'rt-from-code-exchange', client_id: 'marketflow-ui' }); // secret-scan:allow
  assert.equal(changes.length, 1);
  assert.equal((changes[0] as { accessToken: string }).accessToken, 'at-1');
  assertNothingStored();
});

test('after a reload the first getAccessToken refreshes through the cookie', async () => {
  const f = scriptedFetch([200]);
  const { session, changes } = tab(f);
  assert.equal(session.getState(), null);
  assert.equal(await session.getAccessToken(), 'at-1');
  assert.equal(f.calls.length, 1);
  assert.equal(f.calls[0].url, `${BASE}/api/v1/session/refresh`);
  assert.equal(f.calls[0].init.body, undefined);
  assert.equal(f.calls[0].init.credentials, 'include');
  assert.equal((f.calls[0].init.headers as Record<string, string>)['X-Requested-With'], 'codevertex');
  assert.deepEqual(lockRequests, ['codevertex-session-refresh:codevertex-cookie-session:marketflow-ui']);
  assert.equal(changes.length, 1);
  assertNothingStored();
});

test('refreshes again once the token is within 60 seconds of expiry', async () => {
  const f = scriptedFetch([200, 200]);
  const clock = { t: NOW };
  const { session } = tab(f, clock);
  assert.equal(await session.getAccessToken(), 'at-1');
  clock.t = NOW + 900_000 - 59_000;
  assert.equal(await session.getAccessToken(), 'at-2');
  assert.equal(f.calls.length, 2);
});

test('two concurrent refreshes in one tab make one network call', async () => {
  const f = scriptedFetch([200]);
  const { session } = tab(f);
  const [a, b, c] = await Promise.all([session.refresh(), session.refresh(), session.getAccessToken()]);
  assert.deepEqual(a, { token: 'at-1' });
  assert.deepEqual(b, { token: 'at-1' });
  assert.equal(c, 'at-1');
  assert.equal(f.calls.length, 1);
});

test('two tabs refreshing at once spend one refresh; the second adopts the shared token', async () => {
  const f = scriptedFetch([200, 200]);
  const one = tab(f);
  const two = tab(f);
  const [a, b] = await Promise.all([one.session.getAccessToken(), two.session.getAccessToken()]);
  assert.equal(a, 'at-1');
  assert.equal(b, 'at-1');
  assert.equal(f.calls.length, 1);
  assertNothingStored();
});

test('a token shared on the BroadcastChannel is adopted without a network call', async () => {
  const fa = scriptedFetch([200]);
  const fb = scriptedFetch([]);
  const a = tab(fa);
  const b = tab(fb);
  await a.session.start('rt-1'); // secret-scan:allow
  await flush();
  assert.equal(b.session.getState()?.accessToken, 'at-1');
  assert.equal(await b.session.getAccessToken(), 'at-1');
  assert.equal(fb.calls.length, 0);
  assert.equal((b.changes[0] as { payload: { user: { id: string } } }).payload.user.id, 'u1');
});

test('an older shared token never replaces a newer one', async () => {
  const f = scriptedFetch([]);
  const b = tab(f);
  const sender = new FakeChannel('codevertex-cookie-session:marketflow-ui');
  sender.postMessage({ type: 'token', state: { accessToken: 'new', expiresAt: NOW + 900_000, payload: { access_token: 'new' } } }); // secret-scan:allow
  await flush();
  sender.postMessage({ type: 'token', state: { accessToken: 'old', expiresAt: NOW + 100_000, payload: { access_token: 'old' } } }); // secret-scan:allow
  await flush();
  assert.equal(b.session.getState()?.accessToken, 'new');
});

test('a 401 from refresh signs out here and in the other tabs', async () => {
  const f = scriptedFetch([200, 401, 401]);
  const a = tab(f);
  const b = tab(scriptedFetch([]));
  await a.session.start('rt-1'); // secret-scan:allow
  await flush();
  assert.equal(b.session.getState()?.accessToken, 'at-1');

  assert.deepEqual(await a.session.refresh(), { rejected: true });
  await flush();
  assert.equal(a.session.getState(), null);
  assert.equal(a.changes.at(-1), null);
  assert.equal(b.session.getState(), null);
  assert.equal(b.changes.at(-1), null);
  // The 401 is retried once in case another app rotated the shared cookie mid-flight.
  assert.equal(f.calls.length, 3);
});

test('a 401 followed by a good retry keeps the session', async () => {
  const f = scriptedFetch([401, 200]);
  const { session, changes } = tab(f);
  assert.deepEqual(await session.refresh(), { token: 'at-1' });
  assert.equal(f.calls.length, 2);
  assert.ok(!changes.includes(null));
});

test('a refused refresh in a tab without a token does not sign out a tab that has one', async () => {
  const a = tab(scriptedFetch([200]));
  await a.session.start('rt-1'); // secret-scan:allow
  const b = tab(scriptedFetch([401, 401]));
  assert.deepEqual(await b.session.refresh(), { rejected: true });
  await flush();
  assert.equal(a.session.getState()?.accessToken, 'at-1');
  assert.deepEqual(b.changes, [null]);
});

test('a 503 or a network error is transient and keeps the session', async () => {
  const f = scriptedFetch([200, 503, 0, 503]);
  const clock = { t: NOW };
  const { session, changes } = tab(f, clock);
  await session.start('rt-1'); // secret-scan:allow
  assert.deepEqual(await session.refresh(), { transient: true });
  assert.deepEqual(await session.refresh(), { transient: true });
  assert.equal(session.getState()?.accessToken, 'at-1');
  // Near expiry with auth-api down, the token that has not run out yet is still served.
  clock.t = NOW + 900_000 - 30_000;
  assert.equal(await session.getAccessToken(), 'at-1');
  assert.equal(f.calls.length, 4);
  assert.ok(!changes.includes(null));
  // With no token at all, a transient failure gives no token and no sign-out.
  const cold = tab(scriptedFetch([503]), clock);
  assert.equal(await cold.session.getAccessToken(), null);
  assert.deepEqual(cold.changes, []);
});

test('end revokes on auth-api, clears the token and signs the other tabs out', async () => {
  const f = scriptedFetch([200, 200]);
  const a = tab(f);
  const b = tab(scriptedFetch([]));
  await a.session.start('rt-1'); // secret-scan:allow
  await flush();
  await a.session.end();
  await flush();
  assert.equal(a.session.getState(), null);
  assert.equal(b.session.getState(), null);
  assert.equal(a.changes.at(-1), null);
  assert.equal(b.changes.at(-1), null);

  const endCall = f.calls[1];
  assert.equal(endCall.url, `${BASE}/api/v1/session/end`);
  assert.equal(endCall.init.credentials, 'include');
  const headers = endCall.init.headers as Record<string, string>;
  assert.equal(headers.Authorization, 'Bearer at-1');
  assert.equal(headers['X-Requested-With'], 'codevertex');
  assertNothingStored();
});

test('end still signs out when auth-api cannot be reached', async () => {
  const f = scriptedFetch([200, 0]);
  const { session } = tab(f);
  await session.start('rt-1'); // secret-scan:allow
  await session.end();
  assert.equal(session.getState(), null);
});

test('a refresh still in flight when end runs does not sign the person back in', async () => {
  const f = scriptedFetch([200]);
  const { session } = tab(f);
  const pending = session.refresh();
  await session.end();
  assert.deepEqual(await pending, { rejected: true });
  assert.equal(session.getState(), null);
});

test('an enrolment-only answer is a sign-out', async () => {
  const f = scriptedFetch([{ status: 200, body: { access_token: 'enrol', mfa_enrollment_required: true } }]); // secret-scan:allow
  const { session, changes } = tab(f);
  assert.deepEqual(await session.start('rt-1'), { rejected: true }); // secret-scan:allow
  assert.equal(session.getState(), null);
  assert.deepEqual(changes, [null]);
});

test('works without BroadcastChannel or navigator.locks', async () => {
  setGlobal('BroadcastChannel', undefined);
  setGlobal('navigator', undefined);
  const f = scriptedFetch([200]);
  const { session } = tab(f);
  const [a, b] = await Promise.all([session.getAccessToken(), session.getAccessToken()]);
  assert.equal(a, 'at-1');
  assert.equal(b, 'at-1');
  assert.equal(f.calls.length, 1);
  await session.end();
  session.dispose();
});

test('the access token is never written to any browser storage', async () => {
  const f = scriptedFetch([200, 200, 401, 401]);
  const { session } = tab(f);
  await session.start('rt-1'); // secret-scan:allow
  await session.refresh('at-1');
  await session.refresh();
  await session.end();
  assertNothingStored();
});
