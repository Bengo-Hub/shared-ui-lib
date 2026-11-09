import { useQuery, keepPreviousData } from '@tanstack/react-query';

function useSearchQuery({
  queryKey,
  term,
  fetcher,
  allowEmpty = true,
  keepPrevious = true,
  enabled = true,
  staleTime = 3e4,
  ...rest
}) {
  return useQuery({
    ...rest,
    queryKey: [...queryKey, term],
    queryFn: ({ signal }) => fetcher(term, signal),
    placeholderData: keepPrevious ? keepPreviousData : void 0,
    staleTime,
    enabled: Boolean(enabled) && (allowEmpty || term !== "")
  });
}

export { useSearchQuery };
//# sourceMappingURL=query.js.map
//# sourceMappingURL=query.js.map