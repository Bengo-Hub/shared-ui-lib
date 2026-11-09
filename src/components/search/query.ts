'use client';

import { keepPreviousData, useQuery, type QueryKey, type UseQueryOptions } from '@tanstack/react-query';

/**
 * `@bengo-hub/shared-ui-lib/search/query`: a server search driven by a debounced term.
 *
 * - The term is part of the query key, so each distinct term is fetched once and cached.
 * - The fetcher receives react-query's AbortSignal. When the term changes, the old request
 *   is aborted instead of finishing in the background.
 * - The previous results stay on screen while the next ones load (no flicker to empty).
 *
 * Kept on its own subpath because react-query is an optional peer of this library.
 */
export interface UseSearchQueryOptions<T>
  extends Omit<UseQueryOptions<T, Error, T, QueryKey>, 'queryKey' | 'queryFn' | 'placeholderData'> {
  /** Base key, e.g. ['inventory', 'items', tenantId, filters]. The term is appended. */
  queryKey: QueryKey;
  /** The debounced term from `useDebouncedSearch().term`. */
  term: string;
  /** Pass `signal` to fetch or axios so superseded requests are cancelled. */
  fetcher: (term: string, signal: AbortSignal) => Promise<T>;
  /** Run the query when the term is empty (the unfiltered first page). Default true. */
  allowEmpty?: boolean;
  /** Keep showing the previous results while a new term loads. Default true. */
  keepPrevious?: boolean;
}

export function useSearchQuery<T>({
  queryKey,
  term,
  fetcher,
  allowEmpty = true,
  keepPrevious = true,
  enabled = true,
  staleTime = 30_000,
  ...rest
}: UseSearchQueryOptions<T>) {
  return useQuery<T, Error, T, QueryKey>({
    ...rest,
    queryKey: [...queryKey, term],
    queryFn: ({ signal }) => fetcher(term, signal),
    placeholderData: keepPrevious ? keepPreviousData : undefined,
    staleTime,
    enabled: Boolean(enabled) && (allowEmpty || term !== ''),
  });
}
