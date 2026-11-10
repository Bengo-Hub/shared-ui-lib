/**
 * One access-token refresh for every Codevertex web app.
 *
 * auth-api rotates the refresh token on every refresh, and every app keeps its session in a
 * per-tab store persisted to localStorage. With two tabs open, the tab that refreshes first
 * rotates the token the other tab still holds in memory, so that tab's refresh is refused and the
 * person is stuck on a page where every save fails with a 401. This helper closes that gap:
 *
 * 1. Before spending a refresh token it reloads the persisted session. If another tab already
 *    holds a newer, unexpired access token, that token is adopted and no refresh is sent.
 * 2. Tabs take turns through the Web Locks API, so only one tab refreshes at a time and the
 *    next one finds the fresh session waiting for it.
 * 3. A refused refresh is checked against storage once more before it counts as a sign-out.
 * 4. An enrolment-only answer (mfa_enrollment_required) is treated as a sign-out: its token
 *    opens the authenticator setup only, so the app must send the person to sign in.
 * 5. Network and server errors come back as `transient`, so a weak connection never signs
 *    anyone out.
 *
 * The helper knows nothing about the app's store: the app passes how to read, reload and save
 * its session. Pure TypeScript, safe to import on the server (it only touches `navigator` and
 * `window` when called).
 */

export interface RefreshableSession {
  accessToken: string;
  refreshToken: string;
  /** ISO string or epoch milliseconds, whichever the app stores; the saved value keeps that type. */
  expiresAt: string | number;
}

/** The fields of auth-api's POST /api/v1/auth/refresh answer this helper reads. */
export interface RefreshTokenPayload {
  access_token: string;
  refresh_token?: string;
  expires_in?: number;
  mfa_enrollment_required?: boolean;
}

export type RefreshOutcome =
  | { token: string }
  /** auth-api refused the session (expired, ended, rotated away, or enrolment only): sign out. */
  | { rejected: true }
  /** auth-api could not be reached or failed: keep the session and let the request fail softly. */
  | { transient: true };

export interface SessionRefresherOptions<S extends RefreshableSession> {
  /** Names the cross-tab lock; use the app's persisted store key, e.g. 'treasury-auth-storage'. */
  lockName: string;
  getSession: () => S | null;
  /** Re-reads the session another tab may have written (zustand: `useAuthStore.persist.rehydrate`). */
  reloadSession?: () => unknown | Promise<unknown>;
  saveSession: (next: S) => void;
  /** Calls auth-api's refresh endpoint; throw an error carrying `status` on a non-2xx answer. */
  refresh: (refreshToken: string) => Promise<RefreshTokenPayload>;
  /** A token closer than this to expiry is not adopted from another tab. Default 30 seconds. */
  minRemainingMs?: number;
  now?: () => number;
}

/** Epoch milliseconds of an ISO or epoch expiry; 0 when it cannot be read. */
export function expiryMs(expiresAt: string | number | null | undefined): number {
  if (typeof expiresAt === 'number') return Number.isFinite(expiresAt) ? expiresAt : 0;
  if (!expiresAt) return 0;
  const t = new Date(expiresAt).getTime();
  return Number.isFinite(t) ? t : 0;
}

/** The HTTP status on a fetch-style (`status`) or axios-style (`response.status`) error. */
export function errorStatus(err: unknown): number | undefined {
  const e = err as { status?: unknown; response?: { status?: unknown } } | null;
  const s = typeof e?.status === 'number' ? e.status : e?.response?.status;
  return typeof s === 'number' ? s : undefined;
}

/** 400, 401 and 403 mean auth-api refused the refresh token; anything else is transient. */
export function isRefusal(status: number | undefined): boolean {
  return status === 400 || status === 401 || status === 403;
}

type LockManager = { request: <T>(name: string, cb: () => Promise<T>) => Promise<T> };

function withCrossTabLock<T>(name: string, work: () => Promise<T>): Promise<T> {
  const locks = (typeof navigator !== 'undefined'
    ? (navigator as unknown as { locks?: LockManager }).locks
    : undefined);
  if (!locks?.request) return work();
  return locks.request(`codevertex-session-refresh:${name}`, work);
}

/**
 * Builds the app's refresh function. Concurrent calls in one tab share one attempt.
 *
 * Pass the access token the server just rejected as `failedToken` when it is known (the 401
 * handler has it); otherwise the token held in memory at call time is used.
 */
export function createSessionRefresher<S extends RefreshableSession>(
  opts: SessionRefresherOptions<S>,
): (failedToken?: string | null) => Promise<RefreshOutcome> {
  const now = opts.now ?? (() => Date.now());
  const minRemaining = opts.minRemainingMs ?? 30_000;
  let inFlight: Promise<RefreshOutcome> | null = null;

  const reload = async () => {
    try {
      await opts.reloadSession?.();
    } catch {
      /* storage unavailable: carry on with what is in memory */
    }
  };

  /** A session another tab saved that is newer than the token that failed and still usable. */
  const adoptable = (failed: string | null | undefined): S | null => {
    const s = opts.getSession();
    if (!s?.accessToken || s.accessToken === failed) return null;
    return expiryMs(s.expiresAt) > now() + minRemaining ? s : null;
  };

  const attempt = async (failed: string | null | undefined): Promise<RefreshOutcome> => {
    await reload();
    const adopted = adoptable(failed);
    if (adopted) return { token: adopted.accessToken };

    const session = opts.getSession();
    if (!session?.refreshToken) return { rejected: true };
    const spent = session.refreshToken;

    let data: RefreshTokenPayload;
    try {
      data = await opts.refresh(spent);
    } catch (err) {
      // Another tab may have rotated the token between our read and auth-api's answer.
      await reload();
      const late = adoptable(failed);
      if (late) return { token: late.accessToken };
      return isRefusal(errorStatus(err)) ? { rejected: true } : { transient: true };
    }

    if (!data?.access_token || data.mfa_enrollment_required) return { rejected: true };

    const expiresInMs = (data.expires_in && data.expires_in > 0 ? data.expires_in : 3600) * 1000;
    const until = now() + expiresInMs;
    const latest = opts.getSession() ?? session;
    opts.saveSession({
      ...latest,
      accessToken: data.access_token,
      refreshToken: data.refresh_token || spent,
      expiresAt: typeof session.expiresAt === 'number' ? until : new Date(until).toISOString(),
    });
    return { token: data.access_token };
  };

  return (failedToken?: string | null) => {
    if (inFlight) return inFlight;
    const failed = failedToken ?? opts.getSession()?.accessToken ?? null;
    inFlight = withCrossTabLock(opts.lockName, () => attempt(failed)).finally(() => {
      inFlight = null;
    });
    return inFlight;
  };
}

/**
 * Calls `onChange` when another tab writes the persisted session, so this tab picks up the new
 * tokens instead of writing its stale copy back over them. Returns the unsubscribe function.
 * zustand apps pass `() => useAuthStore.persist.rehydrate()` and then re-point their API client.
 */
export function watchSessionAcrossTabs(storageKey: string, onChange: () => void): () => void {
  if (typeof window === 'undefined') return () => {};
  const handler = (e: StorageEvent) => {
    if (e.key === storageKey) onChange();
  };
  window.addEventListener('storage', handler);
  return () => window.removeEventListener('storage', handler);
}
