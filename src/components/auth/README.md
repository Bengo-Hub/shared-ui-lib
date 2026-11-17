# Auth (`@bengo-hub/shared-ui-lib/auth`)

## Cookie session (opt-in)

`createCookieSession` keeps the refresh token in auth-api's HttpOnly `__Host-cv_refresh` cookie and the access token in memory only. No token is written to localStorage, sessionStorage or `document.cookie`, so a script injected into the page cannot lift a long-lived session from storage. Nothing changes for an app until it calls `createCookieSession`; `createSessionRefresher`, `watchSessionAcrossTabs` and `revokeServerSession` stay as they are.

### Who may use it

Only apps served from a `*.codevertexafrica.com` host whose origin is on auth-api's CORS list. Apps on any other registrable domain must not use it and keep their stored tokens (owner decision, 2026-11-17). That covers erp.masterspace.co.ke, tenant custom domains, kura.go.ke, theurbanloftcafe.com and hadiafrica.com: the sso cookie is a third-party cookie there, and Safari and Chrome drop it. The mobile apps and the offline POS PWA also keep their stored tokens.

### Moving an app over

1. Create one session for the app, at module level:

   ```ts
   import { createCookieSession } from '@bengo-hub/shared-ui-lib/auth';

   export const session = createCookieSession({
     authBaseUrl: 'https://sso.codevertexafrica.com',
     clientId: 'marketflow-ui',
     onChange: (state) => {
       // state is null on sign-out; otherwise state.payload carries user, tenant, roles, permissions
       useAuthStore.getState().setProfile(state ? state.payload.user : null);
     },
   });
   ```

2. In the SSO callback, exchange the code as today, then hand the refresh token to the session and drop it:

   ```ts
   const tokens = await exchangeCode(code, verifier);
   const outcome = await session.start(tokens.refresh_token);
   if (!('token' in outcome)) return redirectToLogin();
   ```

   `/session/start` rotates that refresh token at once, so the copy the page saw stops working.

3. Read the access token through the session on every API call. After a full reload the first call spends one refresh through the cookie; later calls are served from memory until the token is within 60 seconds of expiry.

   ```ts
   const token = await session.getAccessToken();
   if (token) headers.Authorization = `Bearer ${token}`;
   ```

4. On a 401 from a service, call `session.refresh(failedToken)` and retry once. The outcome has the same shape as `createSessionRefresher`: `{ token }`, `{ rejected: true }` (signed out, send the person to sign in) or `{ transient: true }` (auth-api unreachable or 5xx, keep the session and let the request fail softly).

5. Sign out with `await session.end()`. It revokes the session on auth-api, clears the cookie and signs out the other tabs.

6. Remove the access and refresh tokens from the app's persisted store (zustand `partialize`). Keep only the non-secret profile there, if anything. Remove `watchSessionAcrossTabs` for the token key: the session shares tokens across tabs itself.

7. SSE and streamed `fetch` calls must await `session.getAccessToken()` before they open, since a fresh page starts without a token.

### How tabs cooperate

- A refresh holds the same Web Lock helper as `createSessionRefresher`, so one tab refreshes at a time.
- A tab with a new token posts it on a BroadcastChannel. The other tabs adopt it without calling auth-api, and a tab that waited for the lock finds it already there.
- A refusal signs out only the tabs still holding the refused token. `end()` signs out every tab.
- Without BroadcastChannel or Web Locks (SSR, older browsers) the session still works, one tab at a time.

### Things to know

- auth-api needs `X-Requested-With: codevertex` and an allowed Origin on every `/session/*` call; the helper sends the header and `credentials: 'include'`. A 403 from these routes usually means the app's origin is missing from auth-api's CORS list.
- All apps share the one sso cookie, and Web Locks do not reach across origins, so another app can rotate the cookie while this one's refresh is in flight. A 401 from `/session/refresh` is therefore retried once, after `retryDelayMs` (300 ms by default), before it counts as a sign-out.
- Every full reload costs one refresh, and the refresh routes share auth-api's refresh rate limit.
