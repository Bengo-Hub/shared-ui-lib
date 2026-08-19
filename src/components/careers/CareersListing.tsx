'use client';

import { useEffect, useMemo, useState } from 'react';
import { ApiError, createCareersApi, type PublicPosting } from './api';
import { displayCompanyName, useBranding } from './branding';
import {
  Chip,
  CompanyHeader,
  IconArrowRight,
  IconBriefcase,
  IconClock,
  IconLayers,
  IconPin,
  IconSearch,
  IconUsers,
  PortalFooter,
  formatDate,
  humanize,
} from './ui';

export interface CareersListingProps {
  /** Tenant/org slug on erp-api whose public postings to show. */
  orgSlug: string;
  /** Base URL of the erp-api instance to call (e.g. https://erpapi.codevertexafrica.com). */
  apiBaseUrl: string;
  /** Given a posting slug, return the href to that posting's detail page. */
  linkToPosting: (postingSlug: string) => string;
  subtitle?: string;
  poweredByHref?: string;
}

export function CareersListing({ orgSlug, apiBaseUrl, linkToPosting, subtitle, poweredByHref }: CareersListingProps) {
  const { branding, theme, loading: brandingLoading } = useBranding(apiBaseUrl, orgSlug);
  const api = useMemo(() => createCareersApi(apiBaseUrl), [apiBaseUrl]);

  const [postings, setPostings] = useState<PublicPosting[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (!orgSlug) return;
    setLoading(true);
    api
      .listPostings(orgSlug)
      .then((r) => setPostings(r.data ?? []))
      .catch((e) => {
        if (e instanceof ApiError && e.status === 404) setNotFound(true);
        else setError(e instanceof Error ? e.message : 'Something went wrong.');
      })
      .finally(() => setLoading(false));
  }, [api, orgSlug]);

  const companyName = displayCompanyName(branding, orgSlug);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return postings;
    return postings.filter((p) => [p.title, p.department, p.location].filter(Boolean).join(' ').toLowerCase().includes(q));
  }, [postings, query]);

  return (
    <div className="flex min-h-dvh flex-col bg-slate-50" style={theme.vars}>
      <CompanyHeader branding={branding} orgSlug={orgSlug} subtitle={subtitle ?? `Explore open roles at ${companyName} and apply online.`} />

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-10">
        {!loading && !notFound && !error && postings.length > 0 && (
          <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-slate-900">Open positions</h2>
              <p className="text-sm text-slate-500">
                {filtered.length} {filtered.length === 1 ? 'role' : 'roles'}
                {query ? ' matching your search' : ' available'}
              </p>
            </div>
            <label className="relative w-full sm:w-72">
              <span className="sr-only">Search roles</span>
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                <IconSearch />
              </span>
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search title, team, location…"
                className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-3 text-sm text-slate-900 shadow-sm transition placeholder:text-slate-400 focus:border-transparent focus:outline-none focus:ring-2"
                style={{ ['--tw-ring-color' as string]: 'var(--brand-primary-ring)' }}
              />
            </label>
          </div>
        )}

        {loading && <ListSkeleton />}

        {!loading && notFound && (
          <EmptyState
            title="We couldn't find this careers page"
            body={
              <>
                The organization <span className="font-semibold">“{orgSlug}”</span> doesn&apos;t have a public careers portal, or the link may be mistyped. Please double-check the address.
              </>
            }
          />
        )}

        {!loading && !notFound && error && (
          <EmptyState
            tone="error"
            title="Something went wrong"
            body={error}
            action={
              <button onClick={() => location.reload()} className="text-sm font-semibold underline" style={{ color: 'var(--brand-primary)' }}>
                Try again
              </button>
            }
          />
        )}

        {!loading && !notFound && !error && postings.length === 0 && (
          <EmptyState title="No open positions right now" body={`There are no open roles at ${companyName} at the moment. Check back soon — new opportunities are posted regularly.`} />
        )}

        {!loading && !notFound && !error && postings.length > 0 && filtered.length === 0 && (
          <EmptyState
            title="No matching roles"
            body="Try a different search term, or clear your search to see all openings."
            action={
              <button onClick={() => setQuery('')} className="text-sm font-semibold underline" style={{ color: 'var(--brand-primary)' }}>
                Clear search
              </button>
            }
          />
        )}

        {!loading && filtered.length > 0 && (
          <ul className="grid gap-4 sm:grid-cols-2">
            {filtered.map((p) => (
              <li key={p.slug}>
                <JobCard posting={p} href={linkToPosting(p.slug)} />
              </li>
            ))}
          </ul>
        )}
      </main>

      {!brandingLoading && <PortalFooter name={companyName} poweredByHref={poweredByHref} />}
    </div>
  );
}

function JobCard({ posting: p, href }: { posting: PublicPosting; href: string }) {
  const deadline = formatDate(p.application_deadline);
  return (
    <a
      href={href}
      className="group flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus-visible:ring-2"
      style={{ ['--tw-ring-color' as string]: 'var(--brand-primary-ring)' }}
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-base font-semibold leading-snug text-slate-900">{p.title}</h3>
        <span className="mt-0.5 shrink-0 text-slate-300 transition group-hover:translate-x-0.5" style={{ color: 'var(--brand-primary)' }}>
          <IconArrowRight />
        </span>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {p.employment_type && (
          <Chip tone="brand">
            <IconBriefcase />
            {humanize(p.employment_type)}
          </Chip>
        )}
        {p.location && (
          <Chip>
            <IconPin />
            {p.location}
          </Chip>
        )}
        {p.department && (
          <Chip>
            <IconLayers />
            {p.department}
          </Chip>
        )}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-slate-100 pt-3 text-xs text-slate-500">
        {typeof p.num_positions === 'number' && p.num_positions > 0 && (
          <span className="inline-flex items-center gap-1.5">
            <IconUsers />
            {p.num_positions} {p.num_positions === 1 ? 'opening' : 'openings'}
          </span>
        )}
        {deadline && (
          <span className="inline-flex items-center gap-1.5">
            <IconClock />
            Apply by {deadline}
          </span>
        )}
      </div>
    </a>
  );
}

function EmptyState({
  title,
  body,
  action,
  tone = 'neutral',
}: {
  title: string;
  body: React.ReactNode;
  action?: React.ReactNode;
  tone?: 'neutral' | 'error';
}) {
  return (
    <div className="mx-auto max-w-md rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
      <div
        className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full"
        style={{ background: tone === 'error' ? '#fef2f2' : 'var(--brand-primary-soft)', color: tone === 'error' ? '#dc2626' : 'var(--brand-primary)' }}
      >
        <IconBriefcase />
      </div>
      <h3 className="text-base font-semibold text-slate-900">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-slate-500">{body}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

function ListSkeleton() {
  return (
    <ul className="grid animate-pulse gap-4 sm:grid-cols-2">
      {Array.from({ length: 4 }).map((_, i) => (
        <li key={i} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="h-5 w-2/3 rounded bg-slate-200" />
          <div className="mt-4 flex gap-2">
            <div className="h-6 w-20 rounded-full bg-slate-100" />
            <div className="h-6 w-24 rounded-full bg-slate-100" />
          </div>
          <div className="mt-5 h-3 w-1/2 rounded bg-slate-100" />
        </li>
      ))}
    </ul>
  );
}
