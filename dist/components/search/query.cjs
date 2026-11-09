'use strict';

var reactQuery = require('@tanstack/react-query');

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
  return reactQuery.useQuery({
    ...rest,
    queryKey: [...queryKey, term],
    queryFn: ({ signal }) => fetcher(term, signal),
    placeholderData: keepPrevious ? reactQuery.keepPreviousData : void 0,
    staleTime,
    enabled: Boolean(enabled) && (allowEmpty || term !== "")
  });
}

exports.useSearchQuery = useSearchQuery;
//# sourceMappingURL=query.cjs.map
//# sourceMappingURL=query.cjs.map