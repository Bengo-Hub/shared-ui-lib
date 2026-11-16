/** A person (or anything) the editor can mention with @. */
export interface MentionOption {
  /** Stored in the mention node as data-id (for people: the auth user id). */
  id: string;
  /** Shown in the list and in the text as @label (stored as data-label). */
  label: string;
  /** Second line in the list, e.g. an email or a role. Also searched. */
  description?: string;
}

/** Most options the suggestion list shows at once. */
export const MENTION_LIMIT = 8;

/**
 * Options matching what was typed after @: labels where a word starts with the query come first,
 * then labels or descriptions that contain it. Case does not matter; an empty query lists the
 * first options. At most `limit` are returned.
 */
export function filterMentions(
  options: readonly MentionOption[],
  query: string,
  limit: number = MENTION_LIMIT,
): MentionOption[] {
  const q = query.trim().toLowerCase();
  if (!q) return options.slice(0, limit);
  const starts: MentionOption[] = [];
  const contains: MentionOption[] = [];
  for (const o of options) {
    const label = o.label.toLowerCase();
    if (label.split(/\s+/).some((w) => w.startsWith(q))) {
      starts.push(o);
      if (starts.length >= limit) break;
    } else if (label.includes(q) || (o.description ?? '').toLowerCase().includes(q)) {
      contains.push(o);
    }
  }
  return [...starts, ...contains].slice(0, limit);
}
