'use strict';

var react = require('react');
var reactDom = require('react-dom');
var lucideReact = require('lucide-react');
var jsxRuntime = require('react/jsx-runtime');

// src/components/account-panel/account-panel.tsx
function initials(name, email) {
  const source = name.trim() || email;
  const parts = source.split(/\s+/).filter(Boolean);
  return (parts.length > 1 ? parts[0][0] + parts[1][0] : source.slice(0, 2)).toUpperCase();
}
function AccountPanel({ open, onClose, user, onSignOut, links, children }) {
  const [mounted, setMounted] = react.useState(open);
  react.useEffect(() => {
    if (open) setMounted(true);
  }, [open]);
  react.useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);
  if (!mounted || typeof document === "undefined") return null;
  return reactDom.createPortal(
    /* @__PURE__ */ jsxRuntime.jsx(
      "div",
      {
        className: `fixed inset-0 z-50 flex justify-end bg-black/30 transition-opacity duration-200 ${open ? "opacity-100" : "pointer-events-none opacity-0"}`,
        onClick: onClose,
        onTransitionEnd: (e) => {
          if (e.target === e.currentTarget && !open) setMounted(false);
        },
        children: /* @__PURE__ */ jsxRuntime.jsxs(
          "div",
          {
            className: `flex h-full w-full max-w-sm flex-col overflow-y-auto bg-card shadow-2xl transition-transform duration-300 ease-out ${open ? "translate-x-0" : "translate-x-full"}`,
            onClick: (e) => e.stopPropagation(),
            children: [
              /* @__PURE__ */ jsxRuntime.jsx("div", { className: "flex items-center justify-end p-3", children: /* @__PURE__ */ jsxRuntime.jsx(
                "button",
                {
                  onClick: onClose,
                  "aria-label": "Close",
                  className: "rounded-full p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground",
                  children: /* @__PURE__ */ jsxRuntime.jsx(lucideReact.X, { className: "h-4 w-4" })
                }
              ) }),
              /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex flex-col items-center gap-2 px-6 pb-6 text-center", children: [
                user.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element -- host-app-supplied avatar, arbitrary origin
                  /* @__PURE__ */ jsxRuntime.jsx("img", { src: user.avatarUrl, alt: user.name, className: "h-16 w-16 rounded-full object-cover" })
                ) : /* @__PURE__ */ jsxRuntime.jsx("div", { className: "flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-lg font-semibold text-primary", children: initials(user.name, user.email) }),
                /* @__PURE__ */ jsxRuntime.jsx("p", { className: "text-base font-semibold text-foreground", children: user.name }),
                /* @__PURE__ */ jsxRuntime.jsx("p", { className: "text-sm text-muted-foreground", children: user.email })
              ] }),
              children && /* @__PURE__ */ jsxRuntime.jsx("div", { className: "border-t border-border px-4 py-4", children }),
              links && links.length > 0 && /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "border-t border-border px-4 py-4", children: [
                /* @__PURE__ */ jsxRuntime.jsx("p", { className: "mb-2 px-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground", children: "Resources" }),
                /* @__PURE__ */ jsxRuntime.jsx("div", { className: "flex flex-col gap-0.5", children: links.map((link) => /* @__PURE__ */ jsxRuntime.jsx(
                  "a",
                  {
                    href: link.href,
                    target: "_blank",
                    rel: "noopener noreferrer",
                    className: "rounded-lg px-3 py-2 text-sm font-medium text-foreground hover:bg-secondary",
                    children: link.label
                  },
                  link.href
                )) })
              ] }),
              /* @__PURE__ */ jsxRuntime.jsx("div", { className: "mt-auto border-t border-border p-4", children: /* @__PURE__ */ jsxRuntime.jsxs(
                "button",
                {
                  onClick: onSignOut,
                  className: "flex w-full items-center justify-center gap-2 rounded-xl bg-secondary px-4 py-2.5 text-sm font-semibold text-foreground hover:bg-secondary/70",
                  children: [
                    /* @__PURE__ */ jsxRuntime.jsx(lucideReact.LogOut, { className: "h-4 w-4" }),
                    " Sign out"
                  ]
                }
              ) })
            ]
          }
        )
      }
    ),
    document.body
  );
}

exports.AccountPanel = AccountPanel;
//# sourceMappingURL=index.cjs.map
//# sourceMappingURL=index.cjs.map