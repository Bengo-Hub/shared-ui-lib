'use strict';

var React = require('react');
var jsxRuntime = require('react/jsx-runtime');
var lucideReact = require('lucide-react');

function _interopNamespace(e) {
  if (e && e.__esModule) return e;
  var n = Object.create(null);
  if (e) {
    Object.keys(e).forEach(function (k) {
      if (k !== 'default') {
        var d = Object.getOwnPropertyDescriptor(e, k);
        Object.defineProperty(n, k, d.get ? d : {
          enumerable: true,
          get: function () { return e[k]; }
        });
      }
    });
  }
  n.default = e;
  return Object.freeze(n);
}

var React__namespace = /*#__PURE__*/_interopNamespace(React);

// src/components/auth/sso-login-modal.tsx
function SSOLoginModal({
  open,
  onOpenChange,
  tenantSlug,
  authUiUrl = "https://accounts.codevertexitsolutions.com",
  onLoginSuccess,
  onLoginFailed,
  title = "Sign In"
}) {
  const [loginState, setLoginState] = React.useState("loading");
  const [errorMessage, setErrorMessage] = React.useState("");
  const iframeRef = React.useRef(null);
  const iframeSrc = React.useMemo(() => {
    const params = new URLSearchParams({
      tenant: tenantSlug,
      embed: "true",
      redirect_uri: "postmessage"
    });
    return `${authUiUrl}/login?${params.toString()}`;
  }, [tenantSlug, authUiUrl]);
  const handleMessage = React.useCallback((event) => {
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
  React.useEffect(() => {
    if (open) {
      window.addEventListener("message", handleMessage);
      setLoginState("loading");
      setErrorMessage("");
    }
    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, [open, handleMessage]);
  const handleIframeLoad = React.useCallback(() => {
    if (loginState === "loading") {
      setLoginState("ready");
    }
  }, [loginState]);
  if (!open) return null;
  return /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "fixed inset-0 z-50 flex items-center justify-center", children: [
    /* @__PURE__ */ jsxRuntime.jsx(
      "div",
      {
        className: "absolute inset-0 bg-black/50",
        onClick: () => onOpenChange(false)
      }
    ),
    /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "relative w-full max-w-md mx-4 bg-white rounded-2xl shadow-xl overflow-hidden max-h-[90vh] flex flex-col", children: [
      /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex items-center justify-between px-6 py-4 border-b", children: [
        /* @__PURE__ */ jsxRuntime.jsx("h2", { className: "text-lg font-semibold", children: title }),
        /* @__PURE__ */ jsxRuntime.jsx(
          "button",
          {
            onClick: () => onOpenChange(false),
            className: "p-2 rounded-full hover:bg-gray-100 transition-colors",
            "aria-label": "Close",
            children: /* @__PURE__ */ jsxRuntime.jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", width: "20", height: "20", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: [
              /* @__PURE__ */ jsxRuntime.jsx("path", { d: "M18 6 6 18" }),
              /* @__PURE__ */ jsxRuntime.jsx("path", { d: "m6 6 12 12" })
            ] })
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntime.jsx("div", { className: "flex-1 min-h-0 relative", children: loginState === "failed" ? /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex flex-col items-center justify-center py-12 px-6 text-center", children: [
        /* @__PURE__ */ jsxRuntime.jsx("div", { className: "w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-4", children: /* @__PURE__ */ jsxRuntime.jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", width: "32", height: "32", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", className: "text-red-600", children: [
          /* @__PURE__ */ jsxRuntime.jsx("circle", { cx: "12", cy: "12", r: "10" }),
          /* @__PURE__ */ jsxRuntime.jsx("path", { d: "m15 9-6 6" }),
          /* @__PURE__ */ jsxRuntime.jsx("path", { d: "m9 9 6 6" })
        ] }) }),
        /* @__PURE__ */ jsxRuntime.jsx("h3", { className: "text-lg font-semibold mb-2", children: "Login Failed" }),
        /* @__PURE__ */ jsxRuntime.jsx("p", { className: "text-sm text-gray-600", children: errorMessage }),
        /* @__PURE__ */ jsxRuntime.jsx(
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
      ] }) : /* @__PURE__ */ jsxRuntime.jsxs(jsxRuntime.Fragment, { children: [
        loginState === "loading" && /* @__PURE__ */ jsxRuntime.jsx("div", { className: "absolute inset-0 flex items-center justify-center bg-white z-10", children: /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex flex-col items-center gap-3", children: [
          /* @__PURE__ */ jsxRuntime.jsx("div", { className: "w-8 h-8 border-2 border-gray-300 border-t-black rounded-full animate-spin" }),
          /* @__PURE__ */ jsxRuntime.jsx("p", { className: "text-sm text-gray-500", children: "Loading login..." })
        ] }) }),
        /* @__PURE__ */ jsxRuntime.jsx(
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
var ACTION_STYLES = {
  notice: "bg-amber-600 text-white hover:bg-amber-700",
  final_warning: "bg-red-600 text-white hover:bg-red-700",
  enforced: "bg-red-700 text-white hover:bg-red-800"
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
function VerifyEmailBanner({ state, onSendCode, onVerifyCode, onVerified }) {
  const [open, setOpen] = React__namespace.useState(false);
  const [dismissed, setDismissed] = React__namespace.useState(false);
  const stage = state?.stage ?? "notice";
  const mustAct = stage === "enforced";
  React__namespace.useEffect(() => {
    if (state && !state.verified && mustAct) setOpen(true);
  }, [state, mustAct]);
  if (!state || state.verified) return null;
  if (dismissed && stage === "notice") return null;
  return /* @__PURE__ */ jsxRuntime.jsxs(jsxRuntime.Fragment, { children: [
    /* @__PURE__ */ jsxRuntime.jsx("div", { className: `border-b ${BANNER_STYLES[stage]}`, role: "alert", children: /* @__PURE__ */ jsxRuntime.jsxs("div", { className: `mx-auto flex max-w-6xl items-center gap-3 px-4 py-2.5 ${TEXT_STYLES[stage]}`, children: [
      /* @__PURE__ */ jsxRuntime.jsx("span", { className: "shrink-0", children: stage === "notice" ? /* @__PURE__ */ jsxRuntime.jsx(lucideReact.MailWarning, { className: "size-4" }) : /* @__PURE__ */ jsxRuntime.jsx(lucideReact.AlertTriangle, { className: "size-4" }) }),
      /* @__PURE__ */ jsxRuntime.jsx("p", { className: "flex-1 text-sm", children: bannerMessage(state) }),
      /* @__PURE__ */ jsxRuntime.jsxs(
        "button",
        {
          onClick: () => setOpen(true),
          className: `inline-flex shrink-0 items-center gap-1 rounded-md px-3 py-1 text-xs font-medium transition-colors ${ACTION_STYLES[stage]}`,
          children: [
            state.is_placeholder ? "Add email" : "Verify email",
            /* @__PURE__ */ jsxRuntime.jsx(lucideReact.ArrowRight, { className: "size-3" })
          ]
        }
      ),
      stage === "notice" && /* @__PURE__ */ jsxRuntime.jsx(
        "button",
        {
          onClick: () => setDismissed(true),
          className: "shrink-0 rounded p-1 opacity-60 transition hover:opacity-100",
          "aria-label": "Dismiss",
          children: /* @__PURE__ */ jsxRuntime.jsx(lucideReact.X, { className: "size-3.5" })
        }
      )
    ] }) }),
    open && /* @__PURE__ */ jsxRuntime.jsx(
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
function VerifyEmailDialog({ state, onSendCode, onVerifyCode, onVerified, onClose }) {
  const s = state;
  const stage = s.stage ?? "notice";
  const [email, setEmail] = React__namespace.useState(s.is_placeholder ? "" : s.email);
  const [code, setCode] = React__namespace.useState("");
  const [sent, setSent] = React__namespace.useState(false);
  const [busy, setBusy] = React__namespace.useState(false);
  const [error, setError] = React__namespace.useState(null);
  const [wait, setWait] = React__namespace.useState(stage === "enforced" ? s.wait_seconds ?? 60 : 0);
  React__namespace.useEffect(() => {
    if (wait <= 0) return;
    const t = setTimeout(() => setWait((w) => w - 1), 1e3);
    return () => clearTimeout(t);
  }, [wait]);
  const canClose = stage !== "enforced" || wait <= 0;
  async function handleSend() {
    setError(null);
    if (!email.includes("@")) {
      setError("Enter a valid email address.");
      return;
    }
    setBusy(true);
    try {
      await onSendCode(email);
      setSent(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not send the code. Try again.");
    } finally {
      setBusy(false);
    }
  }
  async function handleVerify() {
    setError(null);
    if (!code.trim()) {
      setError("Enter the 6-digit code we emailed you.");
      return;
    }
    setBusy(true);
    try {
      await onVerifyCode(email, code.trim());
      onVerified();
    } catch (e) {
      setError(e instanceof Error ? e.message : "That code is not valid.");
    } finally {
      setBusy(false);
    }
  }
  return /* @__PURE__ */ jsxRuntime.jsx("div", { className: "fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4", children: /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "w-full max-w-md rounded-lg bg-white p-6 shadow-xl dark:bg-neutral-900", children: [
    /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "mb-3 flex items-start gap-3", children: [
      /* @__PURE__ */ jsxRuntime.jsx("span", { className: stage === "notice" ? "text-amber-600" : "text-red-600", children: stage === "notice" ? /* @__PURE__ */ jsxRuntime.jsx(lucideReact.MailWarning, { className: "size-5" }) : /* @__PURE__ */ jsxRuntime.jsx(lucideReact.AlertTriangle, { className: "size-5" }) }),
      /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex-1", children: [
        /* @__PURE__ */ jsxRuntime.jsx("h2", { className: "text-base font-semibold text-neutral-900 dark:text-neutral-100", children: s.is_placeholder ? "Add a real email address" : "Verify your email address" }),
        /* @__PURE__ */ jsxRuntime.jsx("p", { className: "mt-1 text-sm text-neutral-600 dark:text-neutral-400", children: s.is_placeholder ? "Your account was set up without a real email, so we cannot reach you. Add your email below \u2014 we will send a 6-digit code to confirm it, and it will replace the placeholder on your account." : "We need to confirm this address is yours so we can send receipts, alerts and password resets, and so you can recover your account." })
      ] })
    ] }),
    stage === "final_warning" && /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "mb-3 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200", children: [
      /* @__PURE__ */ jsxRuntime.jsxs("strong", { children: [
        "Your account will be disabled in ",
        s.days_until_disable ?? 0,
        " day",
        (s.days_until_disable ?? 0) === 1 ? "" : "s",
        "."
      ] }),
      " Verify your email to keep access."
    ] }),
    stage === "enforced" && /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "mb-3 rounded-md border border-red-300 bg-red-100 p-3 text-sm text-red-900 dark:border-red-800 dark:bg-red-950/60 dark:text-red-100", children: [
      /* @__PURE__ */ jsxRuntime.jsx("strong", { children: "The grace period has passed." }),
      " Verify your email to remove this interruption \u2014 it gets longer each day until you do."
    ] }),
    /* @__PURE__ */ jsxRuntime.jsx("label", { className: "mb-1 block text-xs font-medium text-neutral-600 dark:text-neutral-400", children: "Email address" }),
    /* @__PURE__ */ jsxRuntime.jsx(
      "input",
      {
        type: "email",
        value: email,
        disabled: sent,
        onChange: (e) => setEmail(e.target.value),
        placeholder: "name@example.com",
        className: "mb-3 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm disabled:bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100 dark:disabled:bg-neutral-800/60"
      }
    ),
    sent && /* @__PURE__ */ jsxRuntime.jsxs(jsxRuntime.Fragment, { children: [
      /* @__PURE__ */ jsxRuntime.jsxs("label", { className: "mb-1 block text-xs font-medium text-neutral-600 dark:text-neutral-400", children: [
        "6-digit code sent to ",
        email
      ] }),
      /* @__PURE__ */ jsxRuntime.jsx(
        "input",
        {
          inputMode: "numeric",
          value: code,
          onChange: (e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6)),
          placeholder: "123456",
          className: "mb-3 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm tracking-widest dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
        }
      )
    ] }),
    error && /* @__PURE__ */ jsxRuntime.jsx("p", { className: "mb-3 text-sm text-red-600 dark:text-red-400", children: error }),
    /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex items-center justify-end gap-2", children: [
      canClose ? /* @__PURE__ */ jsxRuntime.jsx(
        "button",
        {
          onClick: onClose,
          className: "rounded-md px-3 py-1.5 text-sm text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800",
          children: "Later"
        }
      ) : /* @__PURE__ */ jsxRuntime.jsxs("span", { className: "mr-auto text-xs text-neutral-500 dark:text-neutral-400", children: [
        "You can continue in ",
        wait,
        "s"
      ] }),
      !sent ? /* @__PURE__ */ jsxRuntime.jsx(
        "button",
        {
          onClick: handleSend,
          disabled: busy,
          className: "rounded-md bg-neutral-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-neutral-800 disabled:opacity-50 dark:bg-white dark:text-neutral-900",
          children: busy ? "Sending\u2026" : "Send code"
        }
      ) : /* @__PURE__ */ jsxRuntime.jsxs(jsxRuntime.Fragment, { children: [
        /* @__PURE__ */ jsxRuntime.jsx(
          "button",
          {
            onClick: handleSend,
            disabled: busy,
            className: "rounded-md px-3 py-1.5 text-sm text-neutral-600 hover:bg-neutral-100 disabled:opacity-50 dark:text-neutral-400 dark:hover:bg-neutral-800",
            children: "Resend"
          }
        ),
        /* @__PURE__ */ jsxRuntime.jsx(
          "button",
          {
            onClick: handleVerify,
            disabled: busy,
            className: "rounded-md bg-neutral-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-neutral-800 disabled:opacity-50 dark:bg-white dark:text-neutral-900",
            children: busy ? "Verifying\u2026" : "Verify"
          }
        )
      ] })
    ] })
  ] }) });
}

exports.SSOLoginModal = SSOLoginModal;
exports.VerifyEmailBanner = VerifyEmailBanner;
exports.VerifyEmailDialog = VerifyEmailDialog;
//# sourceMappingURL=index.cjs.map
//# sourceMappingURL=index.cjs.map