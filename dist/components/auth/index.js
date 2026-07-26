import * as React from 'react';
import { useState, useRef, useMemo, useCallback, useEffect } from 'react';
import { jsxs, jsx, Fragment } from 'react/jsx-runtime';
import { AlertTriangle, RefreshCcw, Building2, ArrowRight, MailWarning, X, Mail, Loader2, CheckCircle2 } from 'lucide-react';

// src/components/auth/sso-login-modal.tsx
function SSOLoginModal({
  open,
  onOpenChange,
  tenantSlug,
  authUiUrl = "https://accounts.codevertexafrica.com",
  onLoginSuccess,
  onLoginFailed,
  title = "Sign In"
}) {
  const [loginState, setLoginState] = useState("loading");
  const [errorMessage, setErrorMessage] = useState("");
  const iframeRef = useRef(null);
  const iframeSrc = useMemo(() => {
    const params = new URLSearchParams({
      tenant: tenantSlug,
      embed: "true",
      redirect_uri: "postmessage"
    });
    return `${authUiUrl}/login?${params.toString()}`;
  }, [tenantSlug, authUiUrl]);
  const handleMessage = useCallback((event) => {
    if (!authUiUrl || !event.origin.includes(new URL(authUiUrl).hostname)) return;
    const data = event.data;
    if (!data || typeof data.type !== "string") return;
    switch (data.type) {
      case "auth:login_success": {
        const result = {
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
          user: data.user
        };
        setLoginState("success");
        onLoginSuccess?.(result);
        setTimeout(() => onOpenChange(false), 300);
        break;
      }
      case "auth:login_failed":
        setErrorMessage(data.error || "Login failed");
        setLoginState("failed");
        onLoginFailed?.(data.error || "Login failed");
        break;
      case "auth:resize":
        if (iframeRef.current && data.height) {
          iframeRef.current.style.height = `${data.height}px`;
        }
        break;
    }
  }, [authUiUrl, onLoginSuccess, onLoginFailed, onOpenChange]);
  useEffect(() => {
    if (open) {
      window.addEventListener("message", handleMessage);
      setLoginState("loading");
      setErrorMessage("");
    }
    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, [open, handleMessage]);
  const handleIframeLoad = useCallback(() => {
    if (loginState === "loading") {
      setLoginState("ready");
    }
  }, [loginState]);
  if (!open) return null;
  return /* @__PURE__ */ jsxs("div", { className: "fixed inset-0 z-50 flex items-center justify-center", children: [
    /* @__PURE__ */ jsx(
      "div",
      {
        className: "absolute inset-0 bg-black/50",
        onClick: () => onOpenChange(false)
      }
    ),
    /* @__PURE__ */ jsxs("div", { className: "relative w-full max-w-md mx-4 bg-white rounded-2xl shadow-xl overflow-hidden max-h-[90vh] flex flex-col", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between px-6 py-4 border-b", children: [
        /* @__PURE__ */ jsx("h2", { className: "text-lg font-semibold", children: title }),
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => onOpenChange(false),
            className: "p-2 rounded-full hover:bg-gray-100 transition-colors",
            "aria-label": "Close",
            children: /* @__PURE__ */ jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", width: "20", height: "20", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: [
              /* @__PURE__ */ jsx("path", { d: "M18 6 6 18" }),
              /* @__PURE__ */ jsx("path", { d: "m6 6 12 12" })
            ] })
          }
        )
      ] }),
      /* @__PURE__ */ jsx("div", { className: "flex-1 min-h-0 relative", children: loginState === "failed" ? /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center justify-center py-12 px-6 text-center", children: [
        /* @__PURE__ */ jsx("div", { className: "w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-4", children: /* @__PURE__ */ jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", width: "32", height: "32", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", className: "text-red-600", children: [
          /* @__PURE__ */ jsx("circle", { cx: "12", cy: "12", r: "10" }),
          /* @__PURE__ */ jsx("path", { d: "m15 9-6 6" }),
          /* @__PURE__ */ jsx("path", { d: "m9 9 6 6" })
        ] }) }),
        /* @__PURE__ */ jsx("h3", { className: "text-lg font-semibold mb-2", children: "Login Failed" }),
        /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-600", children: errorMessage }),
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => {
              setLoginState("loading");
              setErrorMessage("");
            },
            className: "mt-6 px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors",
            children: "Try Again"
          }
        )
      ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
        loginState === "loading" && /* @__PURE__ */ jsx("div", { className: "absolute inset-0 flex items-center justify-center bg-white z-10", children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center gap-3", children: [
          /* @__PURE__ */ jsx("div", { className: "w-8 h-8 border-2 border-gray-300 border-t-black rounded-full animate-spin" }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-500", children: "Loading login..." })
        ] }) }),
        /* @__PURE__ */ jsx(
          "iframe",
          {
            ref: iframeRef,
            src: iframeSrc,
            className: "w-full border-0",
            style: { height: "450px" },
            title: "Login",
            onLoad: handleIframeLoad
          }
        )
      ] }) })
    ] })
  ] });
}
function cleanDescription(desc) {
  if (!desc) return "";
  let out = desc;
  try {
    out = decodeURIComponent(out);
  } catch {
  }
  return out.replace(/\+/g, " ").trim();
}
function SSOCallbackError({
  error,
  errorDescription,
  orgSlug,
  lastKnownTenant,
  onRetry,
  onSwitchTenant
}) {
  const description = cleanDescription(errorDescription);
  const isWrongOrg = error === "access_denied" && /member|tenant|organisation|organization/i.test(description);
  const title = isWrongOrg ? "Wrong organisation" : "Sign-in failed";
  const message = isWrongOrg ? `Your account does not belong to${orgSlug ? ` \u201C${orgSlug}\u201D` : " this organisation"}. Sign in again and pick one of your organisations when prompted \u2014 you won't need to retype your credentials if you're already signed in.` : description || (error === "access_denied" ? "Access was denied while signing you in." : "Something went wrong while completing your sign-in.");
  const showRescue = !!onSwitchTenant && !!lastKnownTenant && !!orgSlug && lastKnownTenant !== orgSlug;
  return /* @__PURE__ */ jsxs("div", { className: "sce-wrap", children: [
    /* @__PURE__ */ jsx("style", { children: `
        .sce-wrap{min-height:100vh;display:flex;align-items:center;justify-content:center;padding:16px;background:transparent;font-family:inherit}
        .sce-card{max-width:420px;width:100%;border:1px solid rgba(220,90,60,.25);background:rgba(220,90,60,.05);border-radius:16px;padding:32px 28px;text-align:center}
        .sce-icon{width:44px;height:44px;border-radius:12px;background:rgba(245,158,11,.15);display:flex;align-items:center;justify-content:center;margin:0 auto 14px}
        .sce-title{font-size:19px;font-weight:700;color:#b91c1c;margin:0 0 8px}
        .sce-msg{font-size:14px;line-height:1.55;color:#6b7280;margin:0 0 6px}
        .sce-code{font-size:11px;color:#9ca3af;margin:0 0 18px;word-break:break-all}
        .sce-actions{display:flex;flex-direction:column;gap:10px}
        .sce-btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;height:42px;padding:0 18px;border-radius:10px;font-size:14px;font-weight:600;cursor:pointer;border:1px solid transparent;transition:opacity .15s}
        .sce-btn:hover{opacity:.9}
        .sce-btn-primary{background:#111827;color:#ffffff}
        .sce-btn-secondary{background:transparent;color:#111827;border-color:#d1d5db}
        @media (prefers-color-scheme: dark){
          .sce-title{color:#f87171}
          .sce-msg{color:#9ca3af}
          .sce-btn-primary{background:#f9fafb;color:#111827}
          .sce-btn-secondary{color:#f9fafb;border-color:#4b5563}
        }
      ` }),
    /* @__PURE__ */ jsxs("div", { className: "sce-card", role: "alert", children: [
      /* @__PURE__ */ jsx("div", { className: "sce-icon", children: /* @__PURE__ */ jsx(AlertTriangle, { size: 22, color: "#d97706" }) }),
      /* @__PURE__ */ jsx("h1", { className: "sce-title", children: title }),
      /* @__PURE__ */ jsx("p", { className: "sce-msg", children: message }),
      error && /* @__PURE__ */ jsxs("p", { className: "sce-code", children: [
        "(",
        error,
        ")"
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "sce-actions", children: [
        /* @__PURE__ */ jsxs("button", { type: "button", className: "sce-btn sce-btn-primary", onClick: onRetry, children: [
          /* @__PURE__ */ jsx(RefreshCcw, { size: 15 }),
          "Sign in again"
        ] }),
        showRescue && /* @__PURE__ */ jsxs(
          "button",
          {
            type: "button",
            className: "sce-btn sce-btn-secondary",
            onClick: () => onSwitchTenant(lastKnownTenant),
            children: [
              /* @__PURE__ */ jsx(Building2, { size: 15 }),
              "Continue to ",
              lastKnownTenant,
              /* @__PURE__ */ jsx(ArrowRight, { size: 15 })
            ]
          }
        )
      ] })
    ] })
  ] });
}
var BANNER_STYLES = {
  notice: "border-amber-200 bg-amber-50 dark:border-amber-900/50 dark:bg-amber-950/40",
  final_warning: "border-red-200 bg-red-50 dark:border-red-900/50 dark:bg-red-950/40",
  enforced: "border-red-300 bg-red-100 dark:border-red-800 dark:bg-red-950/60"
};
var TEXT_STYLES = {
  notice: "text-amber-800 dark:text-amber-200",
  final_warning: "text-red-800 dark:text-red-200",
  enforced: "text-red-900 dark:text-red-100"
};
var ACTION_COLORS = {
  notice: { bg: "#d97706", fg: "#ffffff" },
  final_warning: { bg: "#dc2626", fg: "#ffffff" },
  enforced: { bg: "#b91c1c", fg: "#ffffff" }
};
function bannerMessage(state) {
  const stage = state.stage ?? "notice";
  const days = state.days_until_disable ?? 0;
  if (stage === "notice") {
    return state.is_placeholder ? "Your account has no real email address. Add and verify one to secure your account and receive important notifications." : "Please verify your email address to secure your account and keep receiving important notifications.";
  }
  if (stage === "final_warning") {
    return `Your email is still unverified. This account will be disabled in ${days} day${days === 1 ? "" : "s"} unless you verify it.`;
  }
  return "Your email is unverified and the grace period has passed. Verify now to restore full access.";
}
function VerifyEmailBanner({ state, verifyUrl, onSendCode, onVerifyCode, onVerified }) {
  const [open, setOpen] = React.useState(false);
  const [dismissed, setDismissed] = React.useState(false);
  const stage = state?.stage ?? "notice";
  const mustAct = stage === "enforced";
  const canEmbed = !!onSendCode && !!onVerifyCode;
  const linkMode = !canEmbed && !!verifyUrl;
  React.useEffect(() => {
    if (state && !state.verified && mustAct && canEmbed) setOpen(true);
  }, [state, mustAct, canEmbed]);
  if (!state || state.verified) return null;
  if (dismissed && stage === "notice") return null;
  const actionLabel = state.is_placeholder ? "Add email" : "Verify email";
  const colors = ACTION_COLORS[stage];
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx("div", { className: `border-b ${BANNER_STYLES[stage]}`, role: "alert", children: /* @__PURE__ */ jsxs("div", { className: `mx-auto flex max-w-6xl items-center gap-3 px-4 py-2.5 ${TEXT_STYLES[stage]}`, children: [
      /* @__PURE__ */ jsx("span", { className: "shrink-0", children: stage === "notice" ? /* @__PURE__ */ jsx(MailWarning, { className: "size-4" }) : /* @__PURE__ */ jsx(AlertTriangle, { className: "size-4" }) }),
      /* @__PURE__ */ jsx("p", { className: "flex-1 text-sm", children: bannerMessage(state) }),
      linkMode ? /* @__PURE__ */ jsxs(
        "a",
        {
          href: verifyUrl,
          target: "_blank",
          rel: "noopener noreferrer",
          className: "inline-flex shrink-0 items-center gap-1 rounded-md px-3 py-1 text-xs font-medium transition-opacity hover:opacity-90",
          style: { backgroundColor: colors.bg, color: colors.fg },
          children: [
            actionLabel,
            /* @__PURE__ */ jsx(ArrowRight, { className: "size-3" })
          ]
        }
      ) : /* @__PURE__ */ jsxs(
        "button",
        {
          onClick: () => setOpen(true),
          className: "inline-flex shrink-0 items-center gap-1 rounded-md px-3 py-1 text-xs font-medium transition-opacity hover:opacity-90",
          style: { backgroundColor: colors.bg, color: colors.fg },
          children: [
            actionLabel,
            /* @__PURE__ */ jsx(ArrowRight, { className: "size-3" })
          ]
        }
      ),
      stage === "notice" && /* @__PURE__ */ jsx(
        "button",
        {
          onClick: () => setDismissed(true),
          className: "shrink-0 rounded p-1 opacity-60 transition hover:opacity-100",
          "aria-label": "Dismiss",
          children: /* @__PURE__ */ jsx(X, { className: "size-3.5" })
        }
      )
    ] }) }),
    open && onSendCode && onVerifyCode && /* @__PURE__ */ jsx(
      VerifyEmailDialog,
      {
        state,
        onSendCode,
        onVerifyCode,
        onVerified: () => {
          setOpen(false);
          onVerified?.();
        },
        onClose: () => setOpen(false)
      }
    )
  ] });
}
var DIALOG_CSS = `
.veb-overlay{position:fixed;inset:0;z-index:1000;display:flex;align-items:center;justify-content:center;padding:16px;background:rgba(15,23,42,.55);backdrop-filter:blur(2px);}
.veb-card{width:100%;max-width:440px;border-radius:18px;background:#ffffff;color:#0f172a;box-shadow:0 20px 60px -12px rgba(15,23,42,.35);padding:28px 26px;box-sizing:border-box;font-family:inherit;}
.veb-card *{box-sizing:border-box;}
.veb-icon{width:52px;height:52px;margin:0 auto 12px;border-radius:16px;display:flex;align-items:center;justify-content:center;background:rgba(147,51,234,.12);color:#9333ea;}
.veb-title{margin:0;text-align:center;font-size:19px;font-weight:700;line-height:1.25;color:#0f172a;}
.veb-sub{margin:6px auto 0;text-align:center;font-size:13.5px;line-height:1.5;color:#64748b;max-width:340px;}
.veb-sub b{color:#334155;font-weight:600;}
.veb-alert{margin:16px 0 4px;border-radius:12px;padding:11px 13px;font-size:13px;line-height:1.45;border:1px solid;}
.veb-alert-warn{background:#fef2f2;border-color:#fecaca;color:#b91c1c;}
.veb-label{display:block;margin:18px 0 7px;font-size:12px;font-weight:600;color:#475569;}
.veb-input{width:100%;height:46px;border-radius:12px;border:1px solid #e2e8f0;background:#fff;color:#0f172a;padding:0 14px;font-size:15px;outline:none;transition:border-color .15s,box-shadow .15s;}
.veb-input:focus{border-color:#9333ea;box-shadow:0 0 0 3px rgba(147,51,234,.18);}
.veb-input:disabled{background:#f8fafc;color:#94a3b8;cursor:not-allowed;}
.veb-otp{display:flex;justify-content:center;gap:9px;margin-top:6px;}
.veb-otp-box{width:46px;height:56px;text-align:center;font-size:22px;font-weight:700;color:#0f172a;border-radius:13px;border:1.5px solid #e2e8f0;background:#fff;outline:none;transition:border-color .15s,box-shadow .15s;}
.veb-otp-box:focus{border-color:#9333ea;box-shadow:0 0 0 3px rgba(147,51,234,.18);}
.veb-otp-box:disabled{opacity:.6;}
.veb-err{display:flex;align-items:flex-start;gap:8px;margin-top:14px;padding:10px 12px;font-size:13px;line-height:1.4;border-radius:11px;background:#fef2f2;border:1px solid #fecaca;color:#dc2626;}
.veb-ok{margin-top:12px;text-align:center;font-size:12.5px;color:#059669;}
.veb-btn{width:100%;height:48px;margin-top:20px;border:none;border-radius:13px;font-size:15px;font-weight:700;color:#fff;background:#9333ea;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px;box-shadow:0 10px 24px -8px rgba(147,51,234,.6);transition:background .15s,opacity .15s;}
.veb-btn:hover:not(:disabled){background:#7e22ce;}
.veb-btn:disabled{opacity:.55;cursor:not-allowed;box-shadow:none;}
.veb-foot{margin-top:16px;text-align:center;font-size:13px;color:#64748b;}
.veb-link{background:none;border:none;padding:0;font-size:13px;font-weight:700;color:#9333ea;cursor:pointer;text-decoration:none;}
.veb-link:hover:not(:disabled){text-decoration:underline;}
.veb-link:disabled{opacity:.5;cursor:not-allowed;}
.veb-later{background:none;border:none;font-size:13px;color:#94a3b8;cursor:pointer;padding:6px;margin-top:10px;width:100%;}
.veb-later:hover{color:#64748b;}
.veb-wait{margin-top:14px;text-align:center;font-size:12.5px;color:#94a3b8;}
.veb-spin{animation:veb-spin 1s linear infinite;}
@keyframes veb-spin{to{transform:rotate(360deg);}}
@media (prefers-color-scheme: dark){
  .veb-card{background:#0f172a;color:#e2e8f0;box-shadow:0 20px 60px -12px rgba(0,0,0,.6);}
  .veb-title{color:#f1f5f9;}
  .veb-sub{color:#94a3b8;}
  .veb-sub b{color:#cbd5e1;}
  .veb-label{color:#94a3b8;}
  .veb-input{background:#1e293b;border-color:#334155;color:#f1f5f9;}
  .veb-input:disabled{background:#1e293b;color:#64748b;}
  .veb-otp-box{background:#1e293b;border-color:#334155;color:#f1f5f9;}
  .veb-alert-warn{background:rgba(127,29,29,.35);border-color:rgba(153,27,27,.6);color:#fca5a5;}
  .veb-err{background:rgba(127,29,29,.3);border-color:rgba(153,27,27,.5);color:#fca5a5;}
  .veb-foot{color:#94a3b8;}
}
`;
var cssInjected = false;
function useDialogCss() {
  React.useEffect(() => {
    if (cssInjected || typeof document === "undefined") return;
    const el = document.createElement("style");
    el.setAttribute("data-veb", "");
    el.textContent = DIALOG_CSS;
    document.head.appendChild(el);
    cssInjected = true;
  }, []);
}
function OtpInput({
  value,
  onChange,
  onComplete,
  disabled
}) {
  const refs = React.useRef([]);
  const digits = React.useMemo(() => {
    const arr = value.split("");
    return Array.from({ length: 6 }, (_, i) => arr[i] ?? "");
  }, [value]);
  React.useEffect(() => {
    refs.current[0]?.focus();
  }, []);
  const setDigit = (i, raw) => {
    const clean = raw.replace(/\D/g, "");
    if (clean.length > 1) {
      const next = clean.slice(0, 6);
      onChange(next);
      if (next.length === 6) onComplete(next);
      else refs.current[Math.min(next.length, 5)]?.focus();
      return;
    }
    const copy = [...digits];
    copy[i] = clean;
    const joined = copy.join("");
    onChange(joined);
    if (clean && i < 5) refs.current[i + 1]?.focus();
    if (joined.length === 6 && !copy.includes("")) onComplete(joined);
  };
  const onKeyDown = (i, e) => {
    if (e.key === "Backspace" && !digits[i] && i > 0) refs.current[i - 1]?.focus();
  };
  return /* @__PURE__ */ jsx("div", { className: "veb-otp", children: digits.map((d, i) => /* @__PURE__ */ jsx(
    "input",
    {
      ref: (el) => {
        refs.current[i] = el;
      },
      className: "veb-otp-box",
      type: "text",
      inputMode: "numeric",
      autoComplete: i === 0 ? "one-time-code" : "off",
      maxLength: 6,
      value: d,
      disabled,
      onChange: (e) => setDigit(i, e.target.value),
      onKeyDown: (e) => onKeyDown(i, e)
    },
    i
  )) });
}
function VerifyEmailDialog({ state, onSendCode, onVerifyCode, onVerified, onClose, embedded }) {
  useDialogCss();
  const s = state;
  const stage = s.stage ?? "notice";
  const [email, setEmail] = React.useState(s.is_placeholder ? "" : s.email);
  const [code, setCode] = React.useState("");
  const [sent, setSent] = React.useState(false);
  const [sending, setSending] = React.useState(false);
  const [verifying, setVerifying] = React.useState(false);
  const [error, setError] = React.useState(null);
  const [resent, setResent] = React.useState(false);
  const [cooldown, setCooldown] = React.useState(0);
  React.useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1e3);
    return () => clearTimeout(t);
  }, [cooldown]);
  const [wait, setWait] = React.useState(stage === "enforced" ? s.wait_seconds ?? 60 : 0);
  React.useEffect(() => {
    if (wait <= 0) return;
    const t = setTimeout(() => setWait((w) => w - 1), 1e3);
    return () => clearTimeout(t);
  }, [wait]);
  const canClose = !embedded && (stage !== "enforced" || wait <= 0);
  const doSend = React.useCallback(async (isResend) => {
    setError(null);
    if (!email.includes("@") || !email.includes(".")) {
      setError("Enter a valid email address.");
      return;
    }
    setSending(true);
    try {
      await onSendCode(email);
      setSent(true);
      if (isResend) {
        setResent(true);
        setCooldown(45);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not send the code. Please try again.");
    } finally {
      setSending(false);
    }
  }, [email, onSendCode]);
  const doVerify = React.useCallback(async (full) => {
    setError(null);
    setResent(false);
    if (full.length !== 6) {
      setError("Enter the 6-digit code we emailed you.");
      return;
    }
    setVerifying(true);
    try {
      await onVerifyCode(email, full);
      onVerified();
    } catch (e) {
      setError(e instanceof Error ? e.message : "That code is incorrect or has expired.");
      setCode("");
    } finally {
      setVerifying(false);
    }
  }, [email, onVerifyCode, onVerified]);
  const changeEmail = () => {
    setSent(false);
    setCode("");
    setError(null);
    setResent(false);
    setCooldown(0);
  };
  const busy = sending || verifying;
  const card = /* @__PURE__ */ jsxs("div", { className: "veb-card", role: "dialog", "aria-modal": "true", "aria-label": "Verify your email", children: [
    /* @__PURE__ */ jsx("div", { className: "veb-icon", children: /* @__PURE__ */ jsx(Mail, { className: "size-6" }) }),
    /* @__PURE__ */ jsx("h2", { className: "veb-title", children: s.is_placeholder ? "Add a real email address" : "Verify your email" }),
    /* @__PURE__ */ jsx("p", { className: "veb-sub", children: !sent ? s.is_placeholder ? "Your account was set up without a reachable email. Add yours below \u2014 we\u2019ll send a 6-digit code, and it will replace the placeholder on your account." : "Confirm this address is yours so we can send receipts, alerts and password resets, and so you can recover your account." : /* @__PURE__ */ jsxs(Fragment, { children: [
      "We sent a 6-digit code to ",
      /* @__PURE__ */ jsx("b", { children: email }),
      "."
    ] }) }),
    stage === "final_warning" && /* @__PURE__ */ jsxs("div", { className: "veb-alert veb-alert-warn", children: [
      /* @__PURE__ */ jsxs("strong", { children: [
        "Your account will be disabled in ",
        s.days_until_disable ?? 0,
        " day",
        (s.days_until_disable ?? 0) === 1 ? "" : "s",
        "."
      ] }),
      " ",
      "Verify your email to keep access."
    ] }),
    stage === "enforced" && /* @__PURE__ */ jsxs("div", { className: "veb-alert veb-alert-warn", children: [
      /* @__PURE__ */ jsx("strong", { children: "The grace period has passed." }),
      " Verify your email to remove this interruption \u2014 the wait grows each day until you do."
    ] }),
    !sent ? /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsx("label", { className: "veb-label", htmlFor: "veb-email", children: "Email address" }),
      /* @__PURE__ */ jsx(
        "input",
        {
          id: "veb-email",
          className: "veb-input",
          type: "email",
          value: email,
          disabled: sending,
          autoComplete: "email",
          onChange: (e) => setEmail(e.target.value),
          onKeyDown: (e) => {
            if (e.key === "Enter") doSend(false);
          },
          placeholder: "name@example.com"
        }
      ),
      error && /* @__PURE__ */ jsxs("div", { className: "veb-err", children: [
        /* @__PURE__ */ jsx(AlertTriangle, { className: "size-4", style: { flexShrink: 0, marginTop: 1 } }),
        /* @__PURE__ */ jsx("span", { children: error })
      ] }),
      /* @__PURE__ */ jsx("button", { className: "veb-btn", onClick: () => doSend(false), disabled: busy, children: sending ? /* @__PURE__ */ jsx(Loader2, { className: "size-5 veb-spin" }) : /* @__PURE__ */ jsxs(Fragment, { children: [
        "Send code ",
        /* @__PURE__ */ jsx(ArrowRight, { className: "size-4" })
      ] }) })
    ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsx("label", { className: "veb-label", style: { textAlign: "center" }, children: "Enter the code" }),
      /* @__PURE__ */ jsx(OtpInput, { value: code, onChange: setCode, onComplete: doVerify, disabled: verifying }),
      error && /* @__PURE__ */ jsxs("div", { className: "veb-err", children: [
        /* @__PURE__ */ jsx(AlertTriangle, { className: "size-4", style: { flexShrink: 0, marginTop: 1 } }),
        /* @__PURE__ */ jsx("span", { children: error })
      ] }),
      resent && !error && /* @__PURE__ */ jsx("p", { className: "veb-ok", children: "A new code has been sent." }),
      /* @__PURE__ */ jsx("button", { className: "veb-btn", onClick: () => doVerify(code), disabled: busy || code.length !== 6, children: verifying ? /* @__PURE__ */ jsx(Loader2, { className: "size-5 veb-spin" }) : /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsx(CheckCircle2, { className: "size-4" }),
        " Verify & Continue"
      ] }) }),
      /* @__PURE__ */ jsxs("div", { className: "veb-foot", children: [
        "Didn't get it?",
        " ",
        /* @__PURE__ */ jsx("button", { className: "veb-link", onClick: () => doSend(true), disabled: sending || cooldown > 0, children: cooldown > 0 ? `Resend in ${cooldown}s` : sending ? "Sending\u2026" : "Resend code" }),
        " \xB7 ",
        /* @__PURE__ */ jsx("button", { className: "veb-link", onClick: changeEmail, disabled: busy, children: "Change email" })
      ] })
    ] }),
    canClose && /* @__PURE__ */ jsx("button", { className: "veb-later", onClick: onClose, children: "Later" }),
    !embedded && !canClose && stage === "enforced" && /* @__PURE__ */ jsxs("div", { className: "veb-wait", children: [
      "You can continue in ",
      wait,
      "s"
    ] })
  ] });
  if (embedded) return card;
  return /* @__PURE__ */ jsx("div", { className: "veb-overlay", children: card });
}

export { SSOCallbackError, SSOLoginModal, VerifyEmailBanner, VerifyEmailDialog };
//# sourceMappingURL=index.js.map
//# sourceMappingURL=index.js.map