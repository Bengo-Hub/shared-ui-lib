'use client';

import { useEffect, useMemo, useState } from 'react';
import { ApiError, createCareersApi, type ApplyPayload, type PublicPosting } from './api';
import { displayCompanyName, useBranding } from './branding';
import {
  BrandButton,
  Chip,
  CompanyHeader,
  IconArrowLeft,
  IconBriefcase,
  IconCheck,
  IconClock,
  IconLayers,
  IconPin,
  IconUsers,
  PortalFooter,
  formatDate,
  humanize,
} from './ui';

export interface CareersPostingDetailProps {
  orgSlug: string;
  postingSlug: string;
  apiBaseUrl: string;
  /** Href back to the postings list for this org. */
  backHref: string;
  poweredByHref?: string;
}

type FieldErrors = Partial<Record<keyof ApplyPayload, string>>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function CareersPostingDetail({ orgSlug, postingSlug, apiBaseUrl, backHref, poweredByHref }: CareersPostingDetailProps) {
  const { branding, theme } = useBranding(apiBaseUrl, orgSlug);
  const api = useMemo(() => createCareersApi(apiBaseUrl), [apiBaseUrl]);

  const [posting, setPosting] = useState<PublicPosting | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState<ApplyPayload>({ full_name: '', email: '', phone: '', cover_letter: '' });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (!orgSlug || !postingSlug) return;
    setLoading(true);
    api
      .getPosting(orgSlug, postingSlug)
      .then(setPosting)
      .catch((e) => {
        if (e instanceof ApiError && e.status === 404) setNotFound(true);
        else setError(e instanceof Error ? e.message : 'Something went wrong.');
      })
      .finally(() => setLoading(false));
  }, [api, orgSlug, postingSlug]);

  const companyName = displayCompanyName(branding, orgSlug);

  const validate = (f: ApplyPayload): FieldErrors => {
    const e: FieldErrors = {};
    if (!f.full_name.trim()) e.full_name = 'Please enter your full name.';
    if (!f.email.trim()) e.email = 'Please enter your email.';
    else if (!EMAIL_RE.test(f.email.trim())) e.email = 'Please enter a valid email address.';
    return e;
  };

  const update = (key: keyof ApplyPayload, value: string) => {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((prev) => (prev[key] ? { ...prev, [key]: undefined } : prev));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const v = validate(form);
    setErrors(v);
    if (Object.keys(v).length > 0) return;

    setSubmitting(true);
    setSubmitError(null);
    try {
      await api.apply(orgSlug, postingSlug, {
        ...form,
        phone: form.phone?.trim() || undefined,
        cover_letter: form.cover_letter?.trim() || undefined,
      });
      setSubmitted(true);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Submission failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const meta = useMemo(() => {
    if (!posting) return [];
    const items: { icon: React.ReactNode; label: string }[] = [];
    if (posting.employment_type) items.push({ icon: <IconBriefcase />, label: humanize(posting.employment_type) });
    if (posting.location) items.push({ icon: <IconPin />, label: posting.location });
    if (posting.department) items.push({ icon: <IconLayers />, label: posting.department });
    if (typeof posting.num_positions === 'number' && posting.num_positions > 0)
      items.push({ icon: <IconUsers />, label: `${posting.num_positions} ${posting.num_positions === 1 ? 'opening' : 'openings'}` });
    const deadline = formatDate(posting.application_deadline);
    if (deadline) items.push({ icon: <IconClock />, label: `Apply by ${deadline}` });
    return items;
  }, [posting]);

  if (loading) {
    return (
      <div className="min-h-dvh bg-slate-50" style={theme.vars}>
        <CompanyHeader branding={branding} orgSlug={orgSlug} />
        <main className="mx-auto max-w-5xl animate-pulse px-4 py-10">
          <div className="h-4 w-32 rounded bg-slate-200" />
          <div className="mt-6 h-8 w-2/3 rounded bg-slate-200" />
          <div className="mt-4 flex gap-2">
            <div className="h-7 w-24 rounded-full bg-slate-100" />
            <div className="h-7 w-24 rounded-full bg-slate-100" />
          </div>
          <div className="mt-8 space-y-3">
            <div className="h-4 w-full rounded bg-slate-100" />
            <div className="h-4 w-5/6 rounded bg-slate-100" />
            <div className="h-4 w-4/6 rounded bg-slate-100" />
          </div>
        </main>
      </div>
    );
  }

  if (notFound || error || !posting) {
    return (
      <div className="flex min-h-dvh flex-col bg-slate-50" style={theme.vars}>
        <CompanyHeader branding={branding} orgSlug={orgSlug} />
        <main className="mx-auto w-full max-w-md flex-1 px-4 py-16 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full" style={{ background: 'var(--brand-primary-soft)', color: 'var(--brand-primary)' }}>
            <IconBriefcase />
          </div>
          <h1 className="text-lg font-semibold text-slate-900">{notFound ? "This position isn't available" : 'Something went wrong'}</h1>
          <p className="mt-2 text-sm text-slate-500">{notFound ? 'The role may have been filled or the link is no longer valid.' : error}</p>
          <a href={backHref} className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold" style={{ color: 'var(--brand-primary)' }}>
            <IconArrowLeft />
            Back to all openings
          </a>
        </main>
        <PortalFooter name={companyName} poweredByHref={poweredByHref} />
      </div>
    );
  }

  return (
    <div className="flex min-h-dvh flex-col bg-slate-50" style={theme.vars}>
      <CompanyHeader branding={branding} orgSlug={orgSlug} subtitle={companyName} />

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">
        <a href={backHref} className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition hover:text-slate-900">
          <IconArrowLeft />
          All openings
        </a>

        <div className="mt-4 grid gap-8 lg:grid-cols-[1fr_360px]">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">{posting.title}</h1>

            {meta.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {meta.map((m, i) => (
                  <Chip key={i} tone={i === 0 ? 'brand' : 'neutral'}>
                    {m.icon}
                    {m.label}
                  </Chip>
                ))}
              </div>
            )}

            {posting.description ? (
              <section className="mt-8">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">About this role</h2>
                <div className="mt-3 whitespace-pre-wrap text-[15px] leading-relaxed text-slate-700">{posting.description}</div>
              </section>
            ) : (
              <p className="mt-8 text-sm text-slate-500">No additional description was provided for this role.</p>
            )}

            <div className="mt-8 lg:hidden">
              <a href="#apply">
                <BrandButton className="w-full" type="button">
                  Apply for this role
                </BrandButton>
              </a>
            </div>
          </div>

          <div id="apply" className="lg:sticky lg:top-6 lg:self-start">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              {submitted ? (
                <div className="py-4 text-center">
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                    <IconCheck />
                  </div>
                  <h2 className="text-base font-semibold text-slate-900">Application received</h2>
                  <p className="mt-2 text-sm text-slate-500">
                    Thanks for applying to <span className="font-medium">{posting.title}</span>. The {companyName} team will be in touch if there&apos;s a match.
                  </p>
                  <a href={backHref} className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold" style={{ color: 'var(--brand-primary)' }}>
                    <IconArrowLeft />
                    Browse more roles
                  </a>
                </div>
              ) : (
                <>
                  <h2 className="text-base font-semibold text-slate-900">Apply for this role</h2>
                  <p className="mt-1 text-sm text-slate-500">Tell us a little about yourself.</p>
                  <form onSubmit={submit} noValidate className="mt-5 space-y-4">
                    <Field label="Full name" required error={errors.full_name} htmlFor="full_name">
                      <input
                        id="full_name"
                        name="name"
                        autoComplete="name"
                        value={form.full_name}
                        onChange={(e) => update('full_name', e.target.value)}
                        className={inputCls(!!errors.full_name)}
                      />
                    </Field>

                    <Field label="Email" required error={errors.email} htmlFor="email">
                      <input
                        id="email"
                        name="email"
                        type="email"
                        inputMode="email"
                        autoComplete="email"
                        value={form.email}
                        onChange={(e) => update('email', e.target.value)}
                        className={inputCls(!!errors.email)}
                      />
                    </Field>

                    <Field label="Phone" htmlFor="phone">
                      <input
                        id="phone"
                        name="tel"
                        type="tel"
                        inputMode="tel"
                        autoComplete="tel"
                        value={form.phone}
                        onChange={(e) => update('phone', e.target.value)}
                        className={inputCls(false)}
                      />
                    </Field>

                    <Field label="Cover letter" htmlFor="cover_letter">
                      <textarea
                        id="cover_letter"
                        rows={5}
                        value={form.cover_letter}
                        onChange={(e) => update('cover_letter', e.target.value)}
                        placeholder="Why are you a great fit for this role?"
                        className={`${inputCls(false)} resize-y`}
                      />
                    </Field>

                    {submitError && (
                      <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
                        {submitError}
                      </p>
                    )}

                    <BrandButton type="submit" className="w-full" disabled={submitting}>
                      {submitting ? 'Submitting…' : 'Submit application'}
                    </BrandButton>
                    <p className="text-center text-xs text-slate-400">By applying you agree to be contacted about this role.</p>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      </main>

      <PortalFooter name={companyName} poweredByHref={poweredByHref} />
    </div>
  );
}

function inputCls(hasError: boolean): string {
  return [
    'mt-1.5 w-full rounded-lg border bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm transition',
    'placeholder:text-slate-400 focus:outline-none focus:ring-2',
    hasError ? 'border-red-400 focus:ring-red-200' : 'border-slate-300 focus:border-transparent',
  ].join(' ');
}

function Field({
  label,
  htmlFor,
  required,
  error,
  children,
}: {
  label: string;
  htmlFor: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div style={{ ['--tw-ring-color' as string]: error ? undefined : 'var(--brand-primary-ring)' }}>
      <label htmlFor={htmlFor} className="block text-sm font-medium text-slate-700">
        {label}
        {required && <span className="ml-0.5 text-red-500">*</span>}
      </label>
      {children}
      {error && (
        <p role="alert" className="mt-1 text-xs text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
