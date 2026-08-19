'use strict';

var react = require('react');
var jsxRuntime = require('react/jsx-runtime');

// src/components/careers/CareersListing.tsx

// src/components/careers/api.ts
var ApiError = class extends Error {
  constructor(message, status, code) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
  }
};
async function readError(res) {
  const body = await res.json().catch(() => ({}));
  const msg = body.error || body.message || `Request failed (${res.status})`;
  return new ApiError(msg, res.status, body.code);
}
async function getJSON(url) {
  const res = await fetch(url, { headers: { Accept: "application/json" } });
  if (!res.ok) throw await readError(res);
  return res.json();
}
function createCareersApi(apiBaseUrl) {
  const BASE = `${apiBaseUrl.replace(/\/$/, "")}/api/v1`;
  return {
    listPostings: (orgSlug) => getJSON(
      `${BASE}/careers/${encodeURIComponent(orgSlug)}/postings`
    ),
    getPosting: (orgSlug, postingSlug) => getJSON(
      `${BASE}/careers/${encodeURIComponent(orgSlug)}/postings/${encodeURIComponent(postingSlug)}`
    ),
    // Branding endpoint always returns 200 (degrades to { slug }). We still guard so a network
    // failure never blocks the page — callers fall back to a neutral default.
    getBranding: async (orgSlug) => {
      try {
        return await getJSON(
          `${BASE}/business/public-branding/?slug=${encodeURIComponent(orgSlug)}`
        );
      } catch {
        return { slug: orgSlug };
      }
    },
    apply: async (orgSlug, postingSlug, payload) => {
      const res = await fetch(
        `${BASE}/careers/${encodeURIComponent(orgSlug)}/postings/${encodeURIComponent(postingSlug)}/applications`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        }
      );
      if (!res.ok) throw await readError(res);
      return res.json();
    }
  };
}
var DEFAULT_PRIMARY = "#4f46e5";
var DEFAULT_SECONDARY = "#0f172a";
var HEX = /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;
function safeColor(value, fallback) {
  return value && HEX.test(value.trim()) ? value.trim() : fallback;
}
function normalizeHex(hex) {
  if (hex.length === 4) {
    return `#${hex[1]}${hex[1]}${hex[2]}${hex[2]}${hex[3]}${hex[3]}`;
  }
  return hex;
}
function channels(hex) {
  const h = normalizeHex(hex);
  return [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
}
function luminance(hex) {
  const [r, g, b] = channels(hex).map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
function readableOn(hex) {
  return luminance(hex) > 0.6 ? "#0f172a" : "#ffffff";
}
function rgba(hex, alpha) {
  const [r, g, b] = channels(hex);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
function buildTheme(branding) {
  const primary = safeColor(branding?.primary_color, DEFAULT_PRIMARY);
  const secondary = safeColor(branding?.secondary_color, DEFAULT_SECONDARY);
  const onPrimary = readableOn(primary);
  return {
    primary,
    secondary,
    onPrimary,
    vars: {
      ["--brand-primary"]: primary,
      ["--brand-secondary"]: secondary,
      ["--brand-on-primary"]: onPrimary,
      ["--brand-primary-soft"]: rgba(primary, 0.1),
      ["--brand-primary-ring"]: rgba(primary, 0.35)
    }
  };
}
function useBranding(apiBaseUrl, orgSlug) {
  const [branding, setBranding] = react.useState(null);
  const [loading, setLoading] = react.useState(true);
  react.useEffect(() => {
    if (!orgSlug || !apiBaseUrl) return;
    let active = true;
    setLoading(true);
    createCareersApi(apiBaseUrl).getBranding(orgSlug).then((b) => active && setBranding(b)).catch(() => active && setBranding(null)).finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [apiBaseUrl, orgSlug]);
  return { branding, theme: buildTheme(branding), loading };
}
function displayCompanyName(branding, orgSlug) {
  if (branding?.name?.trim()) return branding.name.trim();
  return orgSlug.split(/[-_]/).filter(Boolean).map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
}
function formatDate(value) {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString(void 0, { year: "numeric", month: "short", day: "numeric" });
}
function humanize(value) {
  if (!value) return "";
  return value.replace(/[-_]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}
function Chip({
  children,
  tone = "neutral",
  title
}) {
  const base = "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium leading-5";
  if (tone === "brand") {
    return /* @__PURE__ */ jsxRuntime.jsx("span", { title, className: base, style: { background: "var(--brand-primary-soft)", color: "var(--brand-secondary)" }, children });
  }
  return /* @__PURE__ */ jsxRuntime.jsx("span", { title, className: `${base} bg-slate-100 text-slate-700`, children });
}
var iconProps = {
  width: 16,
  height: 16,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true
};
var IconPin = () => /* @__PURE__ */ jsxRuntime.jsxs("svg", { ...iconProps, children: [
  /* @__PURE__ */ jsxRuntime.jsx("path", { d: "M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" }),
  /* @__PURE__ */ jsxRuntime.jsx("circle", { cx: "12", cy: "10", r: "3" })
] });
var IconBriefcase = () => /* @__PURE__ */ jsxRuntime.jsxs("svg", { ...iconProps, children: [
  /* @__PURE__ */ jsxRuntime.jsx("rect", { width: "20", height: "14", x: "2", y: "7", rx: "2" }),
  /* @__PURE__ */ jsxRuntime.jsx("path", { d: "M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" })
] });
var IconClock = () => /* @__PURE__ */ jsxRuntime.jsxs("svg", { ...iconProps, children: [
  /* @__PURE__ */ jsxRuntime.jsx("circle", { cx: "12", cy: "12", r: "10" }),
  /* @__PURE__ */ jsxRuntime.jsx("path", { d: "M12 6v6l4 2" })
] });
var IconUsers = () => /* @__PURE__ */ jsxRuntime.jsxs("svg", { ...iconProps, children: [
  /* @__PURE__ */ jsxRuntime.jsx("path", { d: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" }),
  /* @__PURE__ */ jsxRuntime.jsx("circle", { cx: "9", cy: "7", r: "4" }),
  /* @__PURE__ */ jsxRuntime.jsx("path", { d: "M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" })
] });
var IconLayers = () => /* @__PURE__ */ jsxRuntime.jsxs("svg", { ...iconProps, children: [
  /* @__PURE__ */ jsxRuntime.jsx("path", { d: "m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z" }),
  /* @__PURE__ */ jsxRuntime.jsx("path", { d: "m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65M22 12.65l-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65" })
] });
var IconSearch = () => /* @__PURE__ */ jsxRuntime.jsxs("svg", { ...iconProps, children: [
  /* @__PURE__ */ jsxRuntime.jsx("circle", { cx: "11", cy: "11", r: "8" }),
  /* @__PURE__ */ jsxRuntime.jsx("path", { d: "m21 21-4.3-4.3" })
] });
var IconArrowLeft = () => /* @__PURE__ */ jsxRuntime.jsx("svg", { ...iconProps, children: /* @__PURE__ */ jsxRuntime.jsx("path", { d: "m12 19-7-7 7-7M19 12H5" }) });
var IconArrowRight = () => /* @__PURE__ */ jsxRuntime.jsx("svg", { ...iconProps, children: /* @__PURE__ */ jsxRuntime.jsx("path", { d: "M5 12h14M12 5l7 7-7 7" }) });
var IconCheck = () => /* @__PURE__ */ jsxRuntime.jsx("svg", { ...iconProps, width: 20, height: 20, children: /* @__PURE__ */ jsxRuntime.jsx("path", { d: "M20 6 9 17l-5-5" }) });
function CompanyHeader({
  branding,
  orgSlug,
  subtitle
}) {
  const name = displayCompanyName(branding, orgSlug);
  const logo = branding?.logo_url;
  const initials = name.split(" ").slice(0, 2).map((w) => w.charAt(0)).join("").toUpperCase();
  return /* @__PURE__ */ jsxRuntime.jsxs(
    "header",
    {
      className: "relative overflow-hidden",
      style: {
        background: "linear-gradient(135deg, var(--brand-secondary) 0%, color-mix(in srgb, var(--brand-secondary) 78%, var(--brand-primary)) 100%)"
      },
      children: [
        /* @__PURE__ */ jsxRuntime.jsx(
          "div",
          {
            "aria-hidden": true,
            className: "pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full opacity-30 blur-3xl",
            style: { background: "var(--brand-primary)" }
          }
        ),
        /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "relative mx-auto flex max-w-5xl flex-col items-start gap-5 px-4 py-12 sm:flex-row sm:items-center sm:py-16", children: [
          /* @__PURE__ */ jsxRuntime.jsx("div", { className: "flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-white/95 shadow-lg ring-1 ring-white/20 sm:h-20 sm:w-20", children: logo ? (
            // eslint-disable-next-line @next/next/no-img-element
            /* @__PURE__ */ jsxRuntime.jsx("img", { src: logo, alt: `${name} logo`, className: "h-full w-full object-contain p-1.5" })
          ) : /* @__PURE__ */ jsxRuntime.jsx("span", { className: "text-2xl font-bold", style: { color: "var(--brand-primary)" }, children: initials || "\u2022" }) }),
          /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "min-w-0", children: [
            /* @__PURE__ */ jsxRuntime.jsx("p", { className: "text-xs font-semibold uppercase tracking-widest text-white/60", children: "Careers" }),
            /* @__PURE__ */ jsxRuntime.jsx("h1", { className: "mt-1 truncate text-2xl font-bold tracking-tight text-white sm:text-3xl", children: name }),
            /* @__PURE__ */ jsxRuntime.jsx("p", { className: "mt-1.5 max-w-xl text-sm text-white/75 sm:text-base", children: subtitle ?? "Join our team and help build what's next." })
          ] })
        ] })
      ]
    }
  );
}
function PortalFooter({ name, poweredByHref }) {
  return /* @__PURE__ */ jsxRuntime.jsx("footer", { className: "border-t border-slate-200 bg-white", children: /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "mx-auto max-w-5xl px-4 py-8 text-center text-xs text-slate-400", children: [
    "\xA9 ",
    (/* @__PURE__ */ new Date()).getFullYear(),
    " ",
    name,
    ".",
    " ",
    poweredByHref ? /* @__PURE__ */ jsxRuntime.jsx("a", { href: poweredByHref, className: "hover:text-slate-500", target: "_blank", rel: "noopener noreferrer", children: "Powered by Codevertex" }) : "Powered by Codevertex"
  ] }) });
}
function BrandButton({ children, className = "", ...props }) {
  return /* @__PURE__ */ jsxRuntime.jsx(
    "button",
    {
      className: `inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold shadow-sm transition focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 ${className}`,
      style: {
        background: "var(--brand-primary)",
        color: "var(--brand-on-primary)",
        ["--tw-ring-color"]: "var(--brand-primary-ring)"
      },
      ...props,
      children
    }
  );
}
function CareersListing({ orgSlug, apiBaseUrl, linkToPosting, subtitle, poweredByHref }) {
  const { branding, theme, loading: brandingLoading } = useBranding(apiBaseUrl, orgSlug);
  const api = react.useMemo(() => createCareersApi(apiBaseUrl), [apiBaseUrl]);
  const [postings, setPostings] = react.useState([]);
  const [loading, setLoading] = react.useState(true);
  const [notFound, setNotFound] = react.useState(false);
  const [error, setError] = react.useState(null);
  const [query, setQuery] = react.useState("");
  react.useEffect(() => {
    if (!orgSlug) return;
    setLoading(true);
    api.listPostings(orgSlug).then((r) => setPostings(r.data ?? [])).catch((e) => {
      if (e instanceof ApiError && e.status === 404) setNotFound(true);
      else setError(e instanceof Error ? e.message : "Something went wrong.");
    }).finally(() => setLoading(false));
  }, [api, orgSlug]);
  const companyName = displayCompanyName(branding, orgSlug);
  const filtered = react.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return postings;
    return postings.filter((p) => [p.title, p.department, p.location].filter(Boolean).join(" ").toLowerCase().includes(q));
  }, [postings, query]);
  return /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex min-h-dvh flex-col bg-slate-50", style: theme.vars, children: [
    /* @__PURE__ */ jsxRuntime.jsx(CompanyHeader, { branding, orgSlug, subtitle: subtitle ?? `Explore open roles at ${companyName} and apply online.` }),
    /* @__PURE__ */ jsxRuntime.jsxs("main", { className: "mx-auto w-full max-w-5xl flex-1 px-4 py-10", children: [
      !loading && !notFound && !error && postings.length > 0 && /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "mb-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between", children: [
        /* @__PURE__ */ jsxRuntime.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntime.jsx("h2", { className: "text-xl font-bold tracking-tight text-slate-900", children: "Open positions" }),
          /* @__PURE__ */ jsxRuntime.jsxs("p", { className: "text-sm text-slate-500", children: [
            filtered.length,
            " ",
            filtered.length === 1 ? "role" : "roles",
            query ? " matching your search" : " available"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntime.jsxs("label", { className: "relative w-full sm:w-72", children: [
          /* @__PURE__ */ jsxRuntime.jsx("span", { className: "sr-only", children: "Search roles" }),
          /* @__PURE__ */ jsxRuntime.jsx("span", { className: "pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400", children: /* @__PURE__ */ jsxRuntime.jsx(IconSearch, {}) }),
          /* @__PURE__ */ jsxRuntime.jsx(
            "input",
            {
              type: "search",
              value: query,
              onChange: (e) => setQuery(e.target.value),
              placeholder: "Search title, team, location\u2026",
              className: "w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-3 text-sm text-slate-900 shadow-sm transition placeholder:text-slate-400 focus:border-transparent focus:outline-none focus:ring-2",
              style: { ["--tw-ring-color"]: "var(--brand-primary-ring)" }
            }
          )
        ] })
      ] }),
      loading && /* @__PURE__ */ jsxRuntime.jsx(ListSkeleton, {}),
      !loading && notFound && /* @__PURE__ */ jsxRuntime.jsx(
        EmptyState,
        {
          title: "We couldn't find this careers page",
          body: /* @__PURE__ */ jsxRuntime.jsxs(jsxRuntime.Fragment, { children: [
            "The organization ",
            /* @__PURE__ */ jsxRuntime.jsxs("span", { className: "font-semibold", children: [
              "\u201C",
              orgSlug,
              "\u201D"
            ] }),
            " doesn't have a public careers portal, or the link may be mistyped. Please double-check the address."
          ] })
        }
      ),
      !loading && !notFound && error && /* @__PURE__ */ jsxRuntime.jsx(
        EmptyState,
        {
          tone: "error",
          title: "Something went wrong",
          body: error,
          action: /* @__PURE__ */ jsxRuntime.jsx("button", { onClick: () => location.reload(), className: "text-sm font-semibold underline", style: { color: "var(--brand-primary)" }, children: "Try again" })
        }
      ),
      !loading && !notFound && !error && postings.length === 0 && /* @__PURE__ */ jsxRuntime.jsx(EmptyState, { title: "No open positions right now", body: `There are no open roles at ${companyName} at the moment. Check back soon \u2014 new opportunities are posted regularly.` }),
      !loading && !notFound && !error && postings.length > 0 && filtered.length === 0 && /* @__PURE__ */ jsxRuntime.jsx(
        EmptyState,
        {
          title: "No matching roles",
          body: "Try a different search term, or clear your search to see all openings.",
          action: /* @__PURE__ */ jsxRuntime.jsx("button", { onClick: () => setQuery(""), className: "text-sm font-semibold underline", style: { color: "var(--brand-primary)" }, children: "Clear search" })
        }
      ),
      !loading && filtered.length > 0 && /* @__PURE__ */ jsxRuntime.jsx("ul", { className: "grid gap-4 sm:grid-cols-2", children: filtered.map((p) => /* @__PURE__ */ jsxRuntime.jsx("li", { children: /* @__PURE__ */ jsxRuntime.jsx(JobCard, { posting: p, href: linkToPosting(p.slug) }) }, p.slug)) })
    ] }),
    !brandingLoading && /* @__PURE__ */ jsxRuntime.jsx(PortalFooter, { name: companyName, poweredByHref })
  ] });
}
function JobCard({ posting: p, href }) {
  const deadline = formatDate(p.application_deadline);
  return /* @__PURE__ */ jsxRuntime.jsxs(
    "a",
    {
      href,
      className: "group flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus-visible:ring-2",
      style: { ["--tw-ring-color"]: "var(--brand-primary-ring)" },
      children: [
        /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex items-start justify-between gap-3", children: [
          /* @__PURE__ */ jsxRuntime.jsx("h3", { className: "text-base font-semibold leading-snug text-slate-900", children: p.title }),
          /* @__PURE__ */ jsxRuntime.jsx("span", { className: "mt-0.5 shrink-0 text-slate-300 transition group-hover:translate-x-0.5", style: { color: "var(--brand-primary)" }, children: /* @__PURE__ */ jsxRuntime.jsx(IconArrowRight, {}) })
        ] }),
        /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "mt-3 flex flex-wrap gap-2", children: [
          p.employment_type && /* @__PURE__ */ jsxRuntime.jsxs(Chip, { tone: "brand", children: [
            /* @__PURE__ */ jsxRuntime.jsx(IconBriefcase, {}),
            humanize(p.employment_type)
          ] }),
          p.location && /* @__PURE__ */ jsxRuntime.jsxs(Chip, { children: [
            /* @__PURE__ */ jsxRuntime.jsx(IconPin, {}),
            p.location
          ] }),
          p.department && /* @__PURE__ */ jsxRuntime.jsxs(Chip, { children: [
            /* @__PURE__ */ jsxRuntime.jsx(IconLayers, {}),
            p.department
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-slate-100 pt-3 text-xs text-slate-500", children: [
          typeof p.num_positions === "number" && p.num_positions > 0 && /* @__PURE__ */ jsxRuntime.jsxs("span", { className: "inline-flex items-center gap-1.5", children: [
            /* @__PURE__ */ jsxRuntime.jsx(IconUsers, {}),
            p.num_positions,
            " ",
            p.num_positions === 1 ? "opening" : "openings"
          ] }),
          deadline && /* @__PURE__ */ jsxRuntime.jsxs("span", { className: "inline-flex items-center gap-1.5", children: [
            /* @__PURE__ */ jsxRuntime.jsx(IconClock, {}),
            "Apply by ",
            deadline
          ] })
        ] })
      ]
    }
  );
}
function EmptyState({
  title,
  body,
  action,
  tone = "neutral"
}) {
  return /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "mx-auto max-w-md rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center", children: [
    /* @__PURE__ */ jsxRuntime.jsx(
      "div",
      {
        className: "mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full",
        style: { background: tone === "error" ? "#fef2f2" : "var(--brand-primary-soft)", color: tone === "error" ? "#dc2626" : "var(--brand-primary)" },
        children: /* @__PURE__ */ jsxRuntime.jsx(IconBriefcase, {})
      }
    ),
    /* @__PURE__ */ jsxRuntime.jsx("h3", { className: "text-base font-semibold text-slate-900", children: title }),
    /* @__PURE__ */ jsxRuntime.jsx("p", { className: "mt-2 text-sm leading-relaxed text-slate-500", children: body }),
    action && /* @__PURE__ */ jsxRuntime.jsx("div", { className: "mt-4", children: action })
  ] });
}
function ListSkeleton() {
  return /* @__PURE__ */ jsxRuntime.jsx("ul", { className: "grid animate-pulse gap-4 sm:grid-cols-2", children: Array.from({ length: 4 }).map((_, i) => /* @__PURE__ */ jsxRuntime.jsxs("li", { className: "rounded-2xl border border-slate-200 bg-white p-5 shadow-sm", children: [
    /* @__PURE__ */ jsxRuntime.jsx("div", { className: "h-5 w-2/3 rounded bg-slate-200" }),
    /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "mt-4 flex gap-2", children: [
      /* @__PURE__ */ jsxRuntime.jsx("div", { className: "h-6 w-20 rounded-full bg-slate-100" }),
      /* @__PURE__ */ jsxRuntime.jsx("div", { className: "h-6 w-24 rounded-full bg-slate-100" })
    ] }),
    /* @__PURE__ */ jsxRuntime.jsx("div", { className: "mt-5 h-3 w-1/2 rounded bg-slate-100" })
  ] }, i)) });
}
var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
function CareersPostingDetail({ orgSlug, postingSlug, apiBaseUrl, backHref, poweredByHref }) {
  const { branding, theme } = useBranding(apiBaseUrl, orgSlug);
  const api = react.useMemo(() => createCareersApi(apiBaseUrl), [apiBaseUrl]);
  const [posting, setPosting] = react.useState(null);
  const [loading, setLoading] = react.useState(true);
  const [notFound, setNotFound] = react.useState(false);
  const [error, setError] = react.useState(null);
  const [form, setForm] = react.useState({ full_name: "", email: "", phone: "", cover_letter: "" });
  const [errors, setErrors] = react.useState({});
  const [submitting, setSubmitting] = react.useState(false);
  const [submitted, setSubmitted] = react.useState(false);
  const [submitError, setSubmitError] = react.useState(null);
  react.useEffect(() => {
    if (!orgSlug || !postingSlug) return;
    setLoading(true);
    api.getPosting(orgSlug, postingSlug).then(setPosting).catch((e) => {
      if (e instanceof ApiError && e.status === 404) setNotFound(true);
      else setError(e instanceof Error ? e.message : "Something went wrong.");
    }).finally(() => setLoading(false));
  }, [api, orgSlug, postingSlug]);
  const companyName = displayCompanyName(branding, orgSlug);
  const validate = (f) => {
    const e = {};
    if (!f.full_name.trim()) e.full_name = "Please enter your full name.";
    if (!f.email.trim()) e.email = "Please enter your email.";
    else if (!EMAIL_RE.test(f.email.trim())) e.email = "Please enter a valid email address.";
    return e;
  };
  const update = (key, value) => {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((prev) => prev[key] ? { ...prev, [key]: void 0 } : prev);
  };
  const submit = async (e) => {
    e.preventDefault();
    const v = validate(form);
    setErrors(v);
    if (Object.keys(v).length > 0) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      await api.apply(orgSlug, postingSlug, {
        ...form,
        phone: form.phone?.trim() || void 0,
        cover_letter: form.cover_letter?.trim() || void 0
      });
      setSubmitted(true);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Submission failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };
  const meta = react.useMemo(() => {
    if (!posting) return [];
    const items = [];
    if (posting.employment_type) items.push({ icon: /* @__PURE__ */ jsxRuntime.jsx(IconBriefcase, {}), label: humanize(posting.employment_type) });
    if (posting.location) items.push({ icon: /* @__PURE__ */ jsxRuntime.jsx(IconPin, {}), label: posting.location });
    if (posting.department) items.push({ icon: /* @__PURE__ */ jsxRuntime.jsx(IconLayers, {}), label: posting.department });
    if (typeof posting.num_positions === "number" && posting.num_positions > 0)
      items.push({ icon: /* @__PURE__ */ jsxRuntime.jsx(IconUsers, {}), label: `${posting.num_positions} ${posting.num_positions === 1 ? "opening" : "openings"}` });
    const deadline = formatDate(posting.application_deadline);
    if (deadline) items.push({ icon: /* @__PURE__ */ jsxRuntime.jsx(IconClock, {}), label: `Apply by ${deadline}` });
    return items;
  }, [posting]);
  if (loading) {
    return /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "min-h-dvh bg-slate-50", style: theme.vars, children: [
      /* @__PURE__ */ jsxRuntime.jsx(CompanyHeader, { branding, orgSlug }),
      /* @__PURE__ */ jsxRuntime.jsxs("main", { className: "mx-auto max-w-5xl animate-pulse px-4 py-10", children: [
        /* @__PURE__ */ jsxRuntime.jsx("div", { className: "h-4 w-32 rounded bg-slate-200" }),
        /* @__PURE__ */ jsxRuntime.jsx("div", { className: "mt-6 h-8 w-2/3 rounded bg-slate-200" }),
        /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "mt-4 flex gap-2", children: [
          /* @__PURE__ */ jsxRuntime.jsx("div", { className: "h-7 w-24 rounded-full bg-slate-100" }),
          /* @__PURE__ */ jsxRuntime.jsx("div", { className: "h-7 w-24 rounded-full bg-slate-100" })
        ] }),
        /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "mt-8 space-y-3", children: [
          /* @__PURE__ */ jsxRuntime.jsx("div", { className: "h-4 w-full rounded bg-slate-100" }),
          /* @__PURE__ */ jsxRuntime.jsx("div", { className: "h-4 w-5/6 rounded bg-slate-100" }),
          /* @__PURE__ */ jsxRuntime.jsx("div", { className: "h-4 w-4/6 rounded bg-slate-100" })
        ] })
      ] })
    ] });
  }
  if (notFound || error || !posting) {
    return /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex min-h-dvh flex-col bg-slate-50", style: theme.vars, children: [
      /* @__PURE__ */ jsxRuntime.jsx(CompanyHeader, { branding, orgSlug }),
      /* @__PURE__ */ jsxRuntime.jsxs("main", { className: "mx-auto w-full max-w-md flex-1 px-4 py-16 text-center", children: [
        /* @__PURE__ */ jsxRuntime.jsx("div", { className: "mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full", style: { background: "var(--brand-primary-soft)", color: "var(--brand-primary)" }, children: /* @__PURE__ */ jsxRuntime.jsx(IconBriefcase, {}) }),
        /* @__PURE__ */ jsxRuntime.jsx("h1", { className: "text-lg font-semibold text-slate-900", children: notFound ? "This position isn't available" : "Something went wrong" }),
        /* @__PURE__ */ jsxRuntime.jsx("p", { className: "mt-2 text-sm text-slate-500", children: notFound ? "The role may have been filled or the link is no longer valid." : error }),
        /* @__PURE__ */ jsxRuntime.jsxs("a", { href: backHref, className: "mt-6 inline-flex items-center gap-1.5 text-sm font-semibold", style: { color: "var(--brand-primary)" }, children: [
          /* @__PURE__ */ jsxRuntime.jsx(IconArrowLeft, {}),
          "Back to all openings"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntime.jsx(PortalFooter, { name: companyName, poweredByHref })
    ] });
  }
  return /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex min-h-dvh flex-col bg-slate-50", style: theme.vars, children: [
    /* @__PURE__ */ jsxRuntime.jsx(CompanyHeader, { branding, orgSlug, subtitle: companyName }),
    /* @__PURE__ */ jsxRuntime.jsxs("main", { className: "mx-auto w-full max-w-5xl flex-1 px-4 py-8", children: [
      /* @__PURE__ */ jsxRuntime.jsxs("a", { href: backHref, className: "inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition hover:text-slate-900", children: [
        /* @__PURE__ */ jsxRuntime.jsx(IconArrowLeft, {}),
        "All openings"
      ] }),
      /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "mt-4 grid gap-8 lg:grid-cols-[1fr_360px]", children: [
        /* @__PURE__ */ jsxRuntime.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntime.jsx("h1", { className: "text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl", children: posting.title }),
          meta.length > 0 && /* @__PURE__ */ jsxRuntime.jsx("div", { className: "mt-4 flex flex-wrap gap-2", children: meta.map((m, i) => /* @__PURE__ */ jsxRuntime.jsxs(Chip, { tone: i === 0 ? "brand" : "neutral", children: [
            m.icon,
            m.label
          ] }, i)) }),
          posting.description ? /* @__PURE__ */ jsxRuntime.jsxs("section", { className: "mt-8", children: [
            /* @__PURE__ */ jsxRuntime.jsx("h2", { className: "text-sm font-semibold uppercase tracking-wide text-slate-400", children: "About this role" }),
            /* @__PURE__ */ jsxRuntime.jsx("div", { className: "mt-3 whitespace-pre-wrap text-[15px] leading-relaxed text-slate-700", children: posting.description })
          ] }) : /* @__PURE__ */ jsxRuntime.jsx("p", { className: "mt-8 text-sm text-slate-500", children: "No additional description was provided for this role." }),
          /* @__PURE__ */ jsxRuntime.jsx("div", { className: "mt-8 lg:hidden", children: /* @__PURE__ */ jsxRuntime.jsx("a", { href: "#apply", children: /* @__PURE__ */ jsxRuntime.jsx(BrandButton, { className: "w-full", type: "button", children: "Apply for this role" }) }) })
        ] }),
        /* @__PURE__ */ jsxRuntime.jsx("div", { id: "apply", className: "lg:sticky lg:top-6 lg:self-start", children: /* @__PURE__ */ jsxRuntime.jsx("div", { className: "rounded-2xl border border-slate-200 bg-white p-6 shadow-sm", children: submitted ? /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "py-4 text-center", children: [
          /* @__PURE__ */ jsxRuntime.jsx("div", { className: "mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600", children: /* @__PURE__ */ jsxRuntime.jsx(IconCheck, {}) }),
          /* @__PURE__ */ jsxRuntime.jsx("h2", { className: "text-base font-semibold text-slate-900", children: "Application received" }),
          /* @__PURE__ */ jsxRuntime.jsxs("p", { className: "mt-2 text-sm text-slate-500", children: [
            "Thanks for applying to ",
            /* @__PURE__ */ jsxRuntime.jsx("span", { className: "font-medium", children: posting.title }),
            ". The ",
            companyName,
            " team will be in touch if there's a match."
          ] }),
          /* @__PURE__ */ jsxRuntime.jsxs("a", { href: backHref, className: "mt-5 inline-flex items-center gap-1.5 text-sm font-semibold", style: { color: "var(--brand-primary)" }, children: [
            /* @__PURE__ */ jsxRuntime.jsx(IconArrowLeft, {}),
            "Browse more roles"
          ] })
        ] }) : /* @__PURE__ */ jsxRuntime.jsxs(jsxRuntime.Fragment, { children: [
          /* @__PURE__ */ jsxRuntime.jsx("h2", { className: "text-base font-semibold text-slate-900", children: "Apply for this role" }),
          /* @__PURE__ */ jsxRuntime.jsx("p", { className: "mt-1 text-sm text-slate-500", children: "Tell us a little about yourself." }),
          /* @__PURE__ */ jsxRuntime.jsxs("form", { onSubmit: submit, noValidate: true, className: "mt-5 space-y-4", children: [
            /* @__PURE__ */ jsxRuntime.jsx(Field, { label: "Full name", required: true, error: errors.full_name, htmlFor: "full_name", children: /* @__PURE__ */ jsxRuntime.jsx(
              "input",
              {
                id: "full_name",
                name: "name",
                autoComplete: "name",
                value: form.full_name,
                onChange: (e) => update("full_name", e.target.value),
                className: inputCls(!!errors.full_name)
              }
            ) }),
            /* @__PURE__ */ jsxRuntime.jsx(Field, { label: "Email", required: true, error: errors.email, htmlFor: "email", children: /* @__PURE__ */ jsxRuntime.jsx(
              "input",
              {
                id: "email",
                name: "email",
                type: "email",
                inputMode: "email",
                autoComplete: "email",
                value: form.email,
                onChange: (e) => update("email", e.target.value),
                className: inputCls(!!errors.email)
              }
            ) }),
            /* @__PURE__ */ jsxRuntime.jsx(Field, { label: "Phone", htmlFor: "phone", children: /* @__PURE__ */ jsxRuntime.jsx(
              "input",
              {
                id: "phone",
                name: "tel",
                type: "tel",
                inputMode: "tel",
                autoComplete: "tel",
                value: form.phone,
                onChange: (e) => update("phone", e.target.value),
                className: inputCls(false)
              }
            ) }),
            /* @__PURE__ */ jsxRuntime.jsx(Field, { label: "Cover letter", htmlFor: "cover_letter", children: /* @__PURE__ */ jsxRuntime.jsx(
              "textarea",
              {
                id: "cover_letter",
                rows: 5,
                value: form.cover_letter,
                onChange: (e) => update("cover_letter", e.target.value),
                placeholder: "Why are you a great fit for this role?",
                className: `${inputCls(false)} resize-y`
              }
            ) }),
            submitError && /* @__PURE__ */ jsxRuntime.jsx("p", { role: "alert", className: "rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700", children: submitError }),
            /* @__PURE__ */ jsxRuntime.jsx(BrandButton, { type: "submit", className: "w-full", disabled: submitting, children: submitting ? "Submitting\u2026" : "Submit application" }),
            /* @__PURE__ */ jsxRuntime.jsx("p", { className: "text-center text-xs text-slate-400", children: "By applying you agree to be contacted about this role." })
          ] })
        ] }) }) })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntime.jsx(PortalFooter, { name: companyName, poweredByHref })
  ] });
}
function inputCls(hasError) {
  return [
    "mt-1.5 w-full rounded-lg border bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm transition",
    "placeholder:text-slate-400 focus:outline-none focus:ring-2",
    hasError ? "border-red-400 focus:ring-red-200" : "border-slate-300 focus:border-transparent"
  ].join(" ");
}
function Field({
  label,
  htmlFor,
  required,
  error,
  children
}) {
  return /* @__PURE__ */ jsxRuntime.jsxs("div", { style: { ["--tw-ring-color"]: error ? void 0 : "var(--brand-primary-ring)" }, children: [
    /* @__PURE__ */ jsxRuntime.jsxs("label", { htmlFor, className: "block text-sm font-medium text-slate-700", children: [
      label,
      required && /* @__PURE__ */ jsxRuntime.jsx("span", { className: "ml-0.5 text-red-500", children: "*" })
    ] }),
    children,
    error && /* @__PURE__ */ jsxRuntime.jsx("p", { role: "alert", className: "mt-1 text-xs text-red-600", children: error })
  ] });
}

exports.CareersApiError = ApiError;
exports.CareersListing = CareersListing;
exports.CareersPostingDetail = CareersPostingDetail;
exports.buildTheme = buildTheme;
exports.createCareersApi = createCareersApi;
exports.displayCompanyName = displayCompanyName;
exports.useBranding = useBranding;
//# sourceMappingURL=index.cjs.map
//# sourceMappingURL=index.cjs.map