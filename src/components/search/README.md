# Search (`@bengo-hub/shared-ui-lib/search`)

Every search box and live filter in the platform uses this module. Typing "pizza" sends one request after the user pauses, not five. Each new request cancels the one before it, so a slow older reply can never overwrite newer results.

## Rules

- Default pause is 300 ms (`DEFAULT_SEARCH_DELAY_MS`). Every keystroke restarts it.
- The box itself updates on every key. Only the searched term waits.
- Enter searches at once. Barcode scanners end each scan with Enter, so a scan never waits.
- The term is trimmed, runs of spaces collapse, and it is capped at 100 characters. The Go side applies the same rule (`pagination.SearchTerm`).
- Pass the `signal` to fetch or axios. Without it, an outdated request is ignored but still runs to the end on the server.
- Never write a local debounce hook or a `setTimeout` in a search effect. Extend this module instead.

## Server search with react-query

```tsx
import { SearchInput, useDebouncedSearch } from '@bengo-hub/shared-ui-lib/search';
import { useSearchQuery } from '@bengo-hub/shared-ui-lib/search/query';

const search = useDebouncedSearch({ minChars: 2 });
const items = useSearchQuery({
  queryKey: ['inventory', 'items', tenantId, filters],
  term: search.term,
  fetcher: (term, signal) => api.get('/items', { params: { search: term, limit: 20 }, signal }).then((r) => r.data),
});

<SearchInput search={search} busy={items.isFetching} placeholder="Search items" />;
```

`useSearchQuery` adds the term to the key, keeps the previous results on screen while the next ones load, and caches each term for 30 s.

## Filtering a list already in memory

```tsx
const search = useDebouncedSearch();
const shown = useMemo(() => filterItems(catalogue, search.term), [catalogue, search.term]);
```

No request is sent. The pause still saves re-filtering a large list on every key.

## Other building blocks

| Export | Use it for |
| --- | --- |
| `useDebouncedValue(value, ms)` | Any value that should settle before it is used. |
| `useDebouncedCallback(fn, ms, { maxWait })` | A stable debounced function with `cancel`, `flush` and `pending`. The latest `fn` is always called. |
| `createSearchRunner(getSearch)` | Latest-wins async search outside react-query. Used by `SearchableCombobox` and `SearchAddTable`. |
| `createDebouncer`, `normalizeSearchTerm`, `isAbortError` | Framework-free helpers. |

`SearchableCombobox` (`onRemoteSearch`), `SearchAddTable` (`onSearch`) and the DataTable column filter already use these. Their search callbacks receive `{ signal }` as the second argument.
