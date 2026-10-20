/**
 * The service tags a tenant's plan covers, read from the `active_service_tags` claim of the access
 * token the app already holds. Display only (it decides which switcher tiles read "Not in your
 * plan"); the services themselves enforce the plan on every request.
 *
 * Returns undefined, which makes the switcher show every service, when:
 * - there is no token, it cannot be parsed, or it carries no tag claim (older tokens, PIN terminal
 *   sessions, or a plan with no tagged features), and
 * - the token is exempt from subscription gating (platform owner, demo, service-charge, exempt
 *   tenant), because those cover every service.
 */
export function serviceTagsFromAccessToken(token?: string | null): string[] | undefined {
  if (!token) return undefined;
  const part = token.split('.')[1];
  if (!part) return undefined;
  try {
    const b64 = part.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(part.length / 4) * 4, '=');
    const json =
      typeof atob === 'function'
        ? decodeURIComponent(
            Array.from(atob(b64), (c) => '%' + c.charCodeAt(0).toString(16).padStart(2, '0')).join(''),
          )
        : Buffer.from(b64, 'base64').toString('utf8');
    const claims = JSON.parse(json) as {
      active_service_tags?: unknown;
      is_platform_owner?: boolean;
      is_demo?: boolean;
      billing_mode?: string;
      sub_exempt?: boolean;
    };
    if (claims.is_platform_owner || claims.is_demo || claims.sub_exempt || claims.billing_mode === 'service_charge') {
      return undefined;
    }
    const tags = claims.active_service_tags;
    return Array.isArray(tags) ? tags.filter((t): t is string => typeof t === 'string') : undefined;
  } catch {
    return undefined;
  }
}
