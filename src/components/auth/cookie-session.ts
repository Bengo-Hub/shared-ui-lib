/**
 * Cookie session for Codevertex browser apps on `*.codevertexafrica.com` (fleet plan G11).
 *
 * The refresh token lives in auth-api's HttpOnly `__Host-cv_refresh` cookie on the sso host, so no
 * page script can read it. The access token and its expiry live in this module's memory only:
 * never in localStorage, sessionStorage or document.cookie. A full reload therefore starts with no
 * token, and the first `getAccessToken()` spends one refresh to get a new one.
 *
 * Tabs cooperate in two ways:
 * 1. Refreshes take turns through the same Web Locks helper `createSessionRefresher` uses, so one
 *    tab refreshes at a time.
 * 2. A tab that gets a new token posts it on a BroadcastChannel. Other tabs adopt it without
 *    calling auth-api, and a tab that was waiting for the lock finds the token already there.
 *
 * Opt-in only. Apps that do not call `createCookieSession` keep their stored-token flow unchanged.
 * Apps on other registrable domains (tenant custom domains, erp.masterspace.co.ke, kura.go.ke,
 * theurbanloftcafe.com, hadiafrica.com) must not use it: browsers drop the sso cookie there.
 *
 * Safe to import on the server: `BroadcastChannel`, `navigator` and `fetch` are only touched when
 * a session is created or called, and each one is optional.
 */
import { withCrossTabLock, type RefreshOutcome } from './session-refresh';

/** The body of POST /api/v1/session/start and /session/refresh. It never carries a refresh token. */
export interface CookieSessionPayload {
  access_token: string;
  token_type?: string;
  expires_in?: number;
  refresh_expires_in?: number;
  user?: unknown;
  tenant?: unknown;
  roles?: string[];
  permissions?: string[];
  amr?: string[];
  mfa_enrollment_required?: boolean;
}

export interface CookieSessionState {
  accessToken: string;
  /** Epoch milliseconds. */
  expiresAt: number;
  /** The full reply the token came with (user, tenant, roles, permissions, amr). */
  payload: CookieSessionPayload;
}

export interface CookieSessionOptions {
  /** The auth-api origin, e.g. https://sso.codevertexafrica.com. */
  authBaseUrl: string;
  /** The app's OAuth client id, sent with /session/start. */
  clientId: string;
  /** Called with the new state whenever the token changes, and with null on sign-out. */
  onChange?: (state: CookieSessionState | null) => void;
  /** BroadcastChannel and lock name. Default `codevertex-cookie-session:<clientId>`. */
  channelName?: string;
  /** `getAccessToken` refreshes when the token is closer than this to expiry. Default 60 seconds. */
  refreshSkewMs?: number;
  /**
   * Wait before the one retry after a 401 from /session/refresh. Every app shares the one sso
   * cookie, and Web Locks do not reach across origins, so another app may have rotated the cookie
   * while this call was in flight. The retry sends the rotated value. Default 300 ms.
   */
  retryDelayMs?: number;
  fetch?: typeof fetch;
  now?: () => number;
}

export interface CookieSession {
  /** Moves a session onto the cookie with the refresh token from the code exchange. */
  start(refreshToken: string): Promise<RefreshOutcome>;
  /** The current access token, refreshed first when missing or within the skew of expiry. */
  getAccessToken(): Promise<string | null>;
  /**
   * Trades the cookie for a new access token. Concurrent calls in one tab share one attempt.
   * Pass the token the server just rejected when it is known, so a newer token another tab
   * shared is adopted instead of spending another refresh.
   */
  refresh(failedToken?: string | null): Promise<RefreshOutcome>;
  /** Revokes the session on auth-api, clears the cookie and signs every tab out. Never throws. */
  end(): Promise<void>;
  /** The in-memory state, without any network call. */
  getState(): CookieSessionState | null;
  /** Stops listening to other tabs. */
  dispose(): void;
}

/** Messages on the BroadcastChannel. Same origin only, never persisted. */
type CookieSessionMessage =
  | { type: 'token'; state: CookieSessionState }
  /** `token` is the access token that was refused; tabs holding a different token keep theirs. */
  | { type: 'signed-out'; reason: 'rejected'; token: string | null }
  | { type: 'signed-out'; reason: 'ended' };

const CSRF_HEADER = 'X-Requested-With';
const CSRF_VALUE = 'codevertex';

class SessionHttpError extends Error {
  status: number;
  constructor(status: number) {
    super(`auth-api session call failed with HTTP ${status}`);
    this.status = status;
  }
}

/** 400, 401 and 403 mean auth-api refused the session, the same rule as `isRefusal`. */
function refused(status: number): boolean {
  return status === 400 || status === 401 || status === 403;
}

function openChannel(name: string): BroadcastChannel | null {
  try {
    if (typeof BroadcastChannel === 'undefined') return null;
    return new BroadcastChannel(name);
  } catch {
    return null;
  }
}

export function createCookieSession(opts: CookieSessionOptions): CookieSession {
  const now = opts.now ?? (() => Date.now());
  const skew = opts.refreshSkewMs ?? 60_000;
  const retryDelay = opts.retryDelayMs ?? 300;
  const name = opts.channelName ?? `codevertex-cookie-session:${opts.clientId}`;
  const base = opts.authBaseUrl.replace(/\/+$/, '');

  let state: CookieSessionState | null = null;
  let inFlight: Promise<RefreshOutcome> | null = null;
  /** Bumped by `end()`, so a refresh still in flight cannot sign the person back in. */
  let epoch = 0;
  const channel = openChannel(name);

  const setState = (next: CookieSessionState | null) => {
    state = next;
    opts.onChange?.(next);
  };

  const post = (msg: CookieSessionMessage) => {
    try {
      channel?.postMessage(msg);
    } catch {
      /* channel closed: the other tabs catch up on their next refresh */
    }
  };

  /** The in-memory token when it is not the failed one and not within the skew of expiry. */
  const freshToken = (failed?: string | null): string | null =>
    state?.accessToken && state.accessToken !== failed && state.expiresAt - now() > skew
      ? state.accessToken
      : null;

  if (channel) {
    channel.onmessage = (ev: MessageEvent) => {
      const msg = ev.data as CookieSessionMessage | null;
      if (!msg || typeof msg !== 'object') return;
      if (msg.type === 'token') {
        const s = msg.state;
        if (!s?.accessToken || typeof s.expiresAt !== 'number') return;
        if (state && state.expiresAt >= s.expiresAt) return;
        setState(s);
      } else if (msg.type === 'signed-out') {
        if (!state) return;
        if (msg.reason === 'ended' || state.accessToken === msg.token) setState(null);
      }
    };
  }

  const call = async (path: string, init: { body?: unknown; bearer?: string | null }) => {
    const doFetch = opts.fetch ?? fetch;
    const headers: Record<string, string> = { [CSRF_HEADER]: CSRF_VALUE };
    if (init.body !== undefined) headers['Content-Type'] = 'application/json';
    if (init.bearer) headers.Authorization = `Bearer ${init.bearer}`;
    const res = await doFetch(`${base}${path}`, {
      method: 'POST',
      credentials: 'include',
      headers,
      body: init.body === undefined ? undefined : JSON.stringify(init.body),
    });
    if (!res.ok) throw new SessionHttpError(res.status);
    return res;
  };

  /** Turns an auth-api reply into the in-memory state, or null for an enrolment-only answer. */
  const toState = (data: CookieSessionPayload | null): CookieSessionState | null => {
    if (!data?.access_token || data.mfa_enrollment_required) return null;
    const ttl = data.expires_in && data.expires_in > 0 ? data.expires_in : 3600;
    return { accessToken: data.access_token, expiresAt: now() + ttl * 1000, payload: data };
  };

  /** The answer for a call overtaken by end() or a newer start(): whatever this tab holds now. */
  const overtaken = (): RefreshOutcome => {
    const token = freshToken();
    return token ? { token } : { rejected: true };
  };

  const accept = (next: CookieSessionState, startedAt: number): RefreshOutcome => {
    if (startedAt !== epoch) return overtaken();
    setState(next);
    post({ type: 'token', state: next });
    return { token: next.accessToken };
  };

  const signOutRejected = (failed: string | null, startedAt: number): RefreshOutcome => {
    if (startedAt !== epoch) return overtaken();
    if (state) setState(null);
    else opts.onChange?.(null);
    post({ type: 'signed-out', reason: 'rejected', token: failed });
    return { rejected: true };
  };

  const sessionCall = async (
    path: string,
    body: unknown,
    failed: string | null,
    startedAt: number,
  ): Promise<RefreshOutcome> => {
    let data: CookieSessionPayload;
    try {
      const res = await call(path, { body });
      data = (await res.json()) as CookieSessionPayload;
    } catch (err) {
      const status = err instanceof SessionHttpError ? err.status : undefined;
      return status !== undefined && refused(status) ? signOutRejected(failed, startedAt) : { transient: true };
    }
    const next = toState(data);
    return next ? accept(next, startedAt) : signOutRejected(failed, startedAt);
  };

  const attemptRefresh = async (failed: string | null, startedAt: number): Promise<RefreshOutcome> => {
    if (startedAt !== epoch) return overtaken();
    // Another tab may have shared a token while this one waited for the lock.
    const shared = freshToken(failed);
    if (shared) return { token: shared };

    let status: number | undefined;
    for (let tries = 0; tries < 2; tries++) {
      if (tries > 0) {
        await new Promise((r) => setTimeout(r, retryDelay));
        const late = freshToken(failed);
        if (late) return { token: late };
      }
      try {
        const res = await call('/api/v1/session/refresh', {});
        const next = toState((await res.json()) as CookieSessionPayload);
        return next ? accept(next, startedAt) : signOutRejected(failed, startedAt);
      } catch (err) {
        if (!(err instanceof SessionHttpError)) return { transient: true };
        status = err.status;
        if (status !== 401) break;
      }
    }
    return status !== undefined && refused(status) ? signOutRejected(failed, startedAt) : { transient: true };
  };

  const refresh = (failedToken?: string | null): Promise<RefreshOutcome> => {
    if (inFlight) return inFlight;
    const failed = failedToken ?? state?.accessToken ?? null;
    const startedAt = epoch;
    inFlight = withCrossTabLock(name, () => attemptRefresh(failed, startedAt)).finally(() => {
      inFlight = null;
    });
    return inFlight;
  };

  return {
    start(refreshToken: string) {
      // A sign-in after an earlier end() starts a new epoch, so it is not mistaken for a stale call.
      const startedAt = ++epoch;
      return withCrossTabLock(name, () =>
        sessionCall(
          '/api/v1/session/start',
          { refresh_token: refreshToken, client_id: opts.clientId },
          state?.accessToken ?? null,
          startedAt,
        ),
      );
    },

    async getAccessToken() {
      const current = freshToken();
      if (current) return current;
      const outcome = await refresh();
      if ('token' in outcome) return outcome.token;
      // A transient failure keeps a token that has not run out yet.
      const held: CookieSessionState | null = state;
      return held && held.expiresAt > now() ? held.accessToken : null;
    },

    refresh,

    async end() {
      const bearer = state?.accessToken ?? null;
      epoch++;
      try {
        await call('/api/v1/session/end', { bearer });
      } catch {
        /* best effort: this tab and the others still sign out */
      }
      if (state) setState(null);
      else opts.onChange?.(null);
      post({ type: 'signed-out', reason: 'ended' });
    },

    getState: () => state,

    dispose() {
      if (!channel) return;
      channel.onmessage = null;
      try {
        channel.close();
      } catch {
        /* already closed */
      }
    },
  };
}
