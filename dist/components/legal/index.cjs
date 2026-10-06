'use strict';

var react = require('react');
var lucideReact = require('lucide-react');
var jsxRuntime = require('react/jsx-runtime');

// src/components/legal/cookie-notice.tsx

// src/components/legal/consent-store.ts
var CONSENT_COOKIE = "cv_cookie_consent";
var CONSENT_CHANGED_EVENT = "cv:cookie-consent";
var OPEN_SETTINGS_EVENT = "cv:open-cookie-settings";
var ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;
var PLATFORM_DOMAIN = "codevertexafrica.com";
var NO_OPTIONAL_CONSENT = { functional: false, analytics: false };
function parse(raw) {
  if (!raw) return null;
  if (raw === "accepted") return { functional: true, analytics: true };
  if (raw === "declined") return { ...NO_OPTIONAL_CONSENT };
  if (!raw.startsWith("v1:")) return null;
  const state = { ...NO_OPTIONAL_CONSENT };
  for (const pair of raw.slice(3).split(",")) {
    const [key, value] = pair.split("=");
    if (key === "functional" || key === "analytics") state[key] = value === "1";
  }
  return state;
}
function serialise(state) {
  return `v1:functional=${state.functional ? 1 : 0},analytics=${state.analytics ? 1 : 0}`;
}
function consentCookieDomain(hostname) {
  return hostname === PLATFORM_DOMAIN || hostname.endsWith(`.${PLATFORM_DOMAIN}`) ? `.${PLATFORM_DOMAIN}` : void 0;
}
function readCookieConsent() {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${CONSENT_COOKIE}=([^;]*)`));
  return parse(match ? decodeURIComponent(match[1]) : null);
}
function writeCookieConsent(state) {
  if (typeof document === "undefined") return;
  const domain = consentCookieDomain(window.location.hostname);
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${CONSENT_COOKIE}=${encodeURIComponent(serialise(state))}; path=/; max-age=${ONE_YEAR_SECONDS}; SameSite=Lax` + (domain ? `; domain=${domain}` : "") + secure;
  window.dispatchEvent(new CustomEvent(CONSENT_CHANGED_EVENT, { detail: state }));
}
function openCookieSettings() {
  if (typeof window !== "undefined") window.dispatchEvent(new Event(OPEN_SETTINGS_EVENT));
}

// src/components/legal/legal-urls.ts
var DEFAULT_LEGAL_BASE_URL = "https://accounts.codevertexafrica.com";
function resolveLegalBaseUrl(baseUrl) {
  const fromEnv = typeof process !== "undefined" ? process.env?.NEXT_PUBLIC_LEGAL_BASE_URL : void 0;
  return (baseUrl || fromEnv || DEFAULT_LEGAL_BASE_URL).replace(/\/+$/, "");
}
function legalUrls(baseUrl) {
  const base = resolveLegalBaseUrl(baseUrl);
  return {
    privacy: `${base}/privacy`,
    terms: `${base}/terms-of-service`,
    cookies: `${base}/cookies`,
    refunds: `${base}/refund-policy`,
    dataRequests: `${base}/data-requests`
  };
}
var PLATFORM_LEGAL_ENTITY = {
  name: "Codevertex Africa Limited",
  address: "Pioneer House, Kisumu, Kenya",
  email: "info@codevertexafrica.com"
};
var CATEGORIES = [
  {
    key: "functional",
    label: "Functional",
    description: "Chat widgets and embedded help that remember you between visits."
  },
  {
    key: "analytics",
    label: "Analytics",
    description: "Anonymous usage statistics that help us improve the product."
  }
];
function CookieNotice({ legalBaseUrl, offsetClassName = "bottom-0", className = "" }) {
  const [open, setOpen] = react.useState(false);
  const [customising, setCustomising] = react.useState(false);
  const [draft, setDraft] = react.useState(NO_OPTIONAL_CONSENT);
  const titleId = react.useId();
  const urls = legalUrls(legalBaseUrl);
  react.useEffect(() => {
    if (readCookieConsent() === null) setOpen(true);
    function reopen() {
      setDraft(readCookieConsent() ?? NO_OPTIONAL_CONSENT);
      setCustomising(true);
      setOpen(true);
    }
    window.addEventListener(OPEN_SETTINGS_EVENT, reopen);
    return () => window.removeEventListener(OPEN_SETTINGS_EVENT, reopen);
  }, []);
  if (!open) return null;
  function save(state) {
    writeCookieConsent(state);
    setOpen(false);
    setCustomising(false);
  }
  const buttonClass = "flex-1 sm:flex-none min-h-10 px-4 rounded-lg text-sm font-semibold border border-border bg-background text-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary transition-colors";
  return /* @__PURE__ */ jsxRuntime.jsx(
    "div",
    {
      role: "dialog",
      "aria-modal": "false",
      "aria-labelledby": titleId,
      className: `fixed inset-x-0 z-[60] p-3 sm:p-5 pb-[max(0.75rem,env(safe-area-inset-bottom))] ${offsetClassName} ${className}`,
      children: /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "mx-auto max-w-3xl rounded-2xl border border-border bg-card text-card-foreground shadow-2xl p-4 sm:p-5", children: [
        /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex items-start gap-3", children: [
          /* @__PURE__ */ jsxRuntime.jsx("span", { className: "hidden sm:flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary", children: /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Cookie, { className: "h-4 w-4", "aria-hidden": "true" }) }),
          /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "min-w-0 flex-1", children: [
            /* @__PURE__ */ jsxRuntime.jsx("p", { id: titleId, className: "text-sm font-semibold text-foreground", children: "Cookies on this site" }),
            /* @__PURE__ */ jsxRuntime.jsxs("p", { className: "mt-1 text-sm text-muted-foreground", children: [
              "We use strictly necessary cookies to sign you in and keep the app secure. Optional cookies are off unless you turn them on. Read the",
              " ",
              /* @__PURE__ */ jsxRuntime.jsx("a", { href: urls.cookies, className: "underline underline-offset-2 hover:text-primary", target: "_blank", rel: "noopener noreferrer", children: "Cookie Policy" }),
              " ",
              "and",
              " ",
              /* @__PURE__ */ jsxRuntime.jsx("a", { href: urls.privacy, className: "underline underline-offset-2 hover:text-primary", target: "_blank", rel: "noopener noreferrer", children: "Privacy Policy" }),
              "."
            ] })
          ] })
        ] }),
        customising && /* @__PURE__ */ jsxRuntime.jsxs("fieldset", { className: "mt-4 space-y-2", children: [
          /* @__PURE__ */ jsxRuntime.jsx("legend", { className: "sr-only", children: "Optional cookie categories" }),
          /* @__PURE__ */ jsxRuntime.jsxs("label", { className: "flex items-start gap-3 rounded-xl border border-border p-3 opacity-80", children: [
            /* @__PURE__ */ jsxRuntime.jsx("input", { type: "checkbox", checked: true, disabled: true, className: "mt-0.5 h-4 w-4 accent-primary" }),
            /* @__PURE__ */ jsxRuntime.jsxs("span", { className: "text-sm", children: [
              /* @__PURE__ */ jsxRuntime.jsx("span", { className: "font-semibold text-foreground", children: "Strictly necessary" }),
              /* @__PURE__ */ jsxRuntime.jsx("span", { className: "block text-muted-foreground", children: "Sign-in, security and your theme. Always on." })
            ] })
          ] }),
          CATEGORIES.map((c) => /* @__PURE__ */ jsxRuntime.jsxs("label", { className: "flex items-start gap-3 rounded-xl border border-border p-3 cursor-pointer hover:bg-muted/50", children: [
            /* @__PURE__ */ jsxRuntime.jsx(
              "input",
              {
                type: "checkbox",
                checked: draft[c.key],
                onChange: (e) => setDraft((d) => ({ ...d, [c.key]: e.target.checked })),
                className: "mt-0.5 h-4 w-4 accent-primary"
              }
            ),
            /* @__PURE__ */ jsxRuntime.jsxs("span", { className: "text-sm", children: [
              /* @__PURE__ */ jsxRuntime.jsx("span", { className: "font-semibold text-foreground", children: c.label }),
              /* @__PURE__ */ jsxRuntime.jsx("span", { className: "block text-muted-foreground", children: c.description })
            ] })
          ] }, c.key))
        ] }),
        /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "mt-4 flex flex-wrap gap-2 sm:justify-end", children: [
          customising ? /* @__PURE__ */ jsxRuntime.jsx("button", { type: "button", className: buttonClass, onClick: () => save(draft), children: "Save choices" }) : /* @__PURE__ */ jsxRuntime.jsx("button", { type: "button", className: buttonClass, onClick: () => setCustomising(true), children: "Customise" }),
          /* @__PURE__ */ jsxRuntime.jsx("button", { type: "button", className: buttonClass, onClick: () => save(NO_OPTIONAL_CONSENT), children: "Reject optional" }),
          /* @__PURE__ */ jsxRuntime.jsx("button", { type: "button", className: buttonClass, onClick: () => save({ functional: true, analytics: true }), children: "Accept all" })
        ] })
      ] })
    }
  );
}
function LegalLinks({
  legalBaseUrl,
  layout = "row",
  showEntity = true,
  entity = PLATFORM_LEGAL_ENTITY,
  className = ""
}) {
  const urls = legalUrls(legalBaseUrl);
  const links = [
    { label: "Privacy", href: urls.privacy },
    { label: "Terms", href: urls.terms },
    { label: "Cookies", href: urls.cookies },
    { label: "Refunds", href: urls.refunds },
    { label: "Your data", href: urls.dataRequests }
  ];
  const linkClass = "rounded hover:text-foreground hover:underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary";
  return /* @__PURE__ */ jsxRuntime.jsxs("div", { className: `text-xs text-muted-foreground ${className}`, children: [
    /* @__PURE__ */ jsxRuntime.jsxs(
      "nav",
      {
        "aria-label": "Legal",
        className: layout === "row" ? "flex flex-wrap items-center gap-x-4 gap-y-1.5" : "flex flex-col gap-1.5",
        children: [
          links.map((l) => /* @__PURE__ */ jsxRuntime.jsx("a", { href: l.href, target: "_blank", rel: "noopener noreferrer", className: linkClass, children: l.label }, l.label)),
          /* @__PURE__ */ jsxRuntime.jsx("button", { type: "button", onClick: openCookieSettings, className: `text-left ${linkClass}`, children: "Cookie settings" })
        ]
      }
    ),
    showEntity && /* @__PURE__ */ jsxRuntime.jsxs("p", { className: "mt-2", children: [
      entity.name,
      ", ",
      entity.address,
      ".",
      entity.registration ? ` ${entity.registration}.` : "",
      " ",
      /* @__PURE__ */ jsxRuntime.jsx("a", { href: `mailto:${entity.email}`, className: linkClass, children: entity.email })
    ] })
  ] });
}
function subscribe(onChange) {
  window.addEventListener(CONSENT_CHANGED_EVENT, onChange);
  return () => window.removeEventListener(CONSENT_CHANGED_EVENT, onChange);
}
var lastRaw;
var lastState = null;
function snapshot() {
  const raw = typeof document === "undefined" ? "" : document.cookie;
  if (raw !== lastRaw) {
    lastRaw = raw;
    const next = readCookieConsent();
    const same = next !== null && lastState !== null && next.functional === lastState.functional && next.analytics === lastState.analytics;
    if (!same) lastState = next;
  }
  return lastState;
}
function useCookieConsentState() {
  return react.useSyncExternalStore(subscribe, snapshot, () => null);
}
function useCookieConsent(category) {
  const state = useCookieConsentState();
  return state?.[category] === true;
}

exports.CONSENT_CHANGED_EVENT = CONSENT_CHANGED_EVENT;
exports.CONSENT_COOKIE = CONSENT_COOKIE;
exports.CookieNotice = CookieNotice;
exports.DEFAULT_LEGAL_BASE_URL = DEFAULT_LEGAL_BASE_URL;
exports.LegalLinks = LegalLinks;
exports.NO_OPTIONAL_CONSENT = NO_OPTIONAL_CONSENT;
exports.OPEN_SETTINGS_EVENT = OPEN_SETTINGS_EVENT;
exports.PLATFORM_LEGAL_ENTITY = PLATFORM_LEGAL_ENTITY;
exports.consentCookieDomain = consentCookieDomain;
exports.legalUrls = legalUrls;
exports.openCookieSettings = openCookieSettings;
exports.readCookieConsent = readCookieConsent;
exports.resolveLegalBaseUrl = resolveLegalBaseUrl;
exports.useCookieConsent = useCookieConsent;
exports.useCookieConsentState = useCookieConsentState;
exports.writeCookieConsent = writeCookieConsent;
//# sourceMappingURL=index.cjs.map
//# sourceMappingURL=index.cjs.map