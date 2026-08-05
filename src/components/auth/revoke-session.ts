/**
 * Best-effort POST to revoke a user's backend SSO session: deletes their Redis
 * session_token keys + DB sessions and clears the cookie. Callers still proceed
 * with local logout/redirect regardless of outcome (a stolen refresh token is
 * invalidated server-side, but the local UX never blocks on this call). Never throws.
 */
export async function revokeServerSession(ssoBaseUrl: string, accessToken?: string | null): Promise<void> {
  try {
    await fetch(new URL('/api/v1/auth/logout', ssoBaseUrl).toString(), {
      method: 'POST',
      headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
      credentials: 'include',
      keepalive: true,
    });
  } catch {
    /* best-effort: still clear local state + redirect */
  }
}
