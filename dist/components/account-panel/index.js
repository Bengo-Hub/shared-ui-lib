import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, LogOut } from 'lucide-react';
import { jsx, jsxs } from 'react/jsx-runtime';

// src/components/account-panel/account-panel.tsx
function initials(name, email) {
  const source = name.trim() || email;
  const parts = source.split(/\s+/).filter(Boolean);
  return (parts.length > 1 ? parts[0][0] + parts[1][0] : source.slice(0, 2)).toUpperCase();
}
function AccountPanel({ open, onClose, user, onSignOut, links, children }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);
  if (!open || typeof document === "undefined") return null;
  return createPortal(
    /* @__PURE__ */ jsx("div", { className: "fixed inset-0 z-50 flex justify-end bg-black/30", onClick: onClose, children: /* @__PURE__ */ jsxs(
      "div",
      {
        className: "flex h-full w-full max-w-sm flex-col overflow-y-auto bg-card shadow-2xl",
        onClick: (e) => e.stopPropagation(),
        children: [
          /* @__PURE__ */ jsx("div", { className: "flex items-center justify-end p-3", children: /* @__PURE__ */ jsx(
            "button",
            {
              onClick: onClose,
              "aria-label": "Close",
              className: "rounded-full p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground",
              children: /* @__PURE__ */ jsx(X, { className: "h-4 w-4" })
            }
          ) }),
          /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center gap-2 px-6 pb-6 text-center", children: [
            user.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element -- host-app-supplied avatar, arbitrary origin
              /* @__PURE__ */ jsx("img", { src: user.avatarUrl, alt: user.name, className: "h-16 w-16 rounded-full object-cover" })
            ) : /* @__PURE__ */ jsx("div", { className: "flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-lg font-semibold text-primary", children: initials(user.name, user.email) }),
            /* @__PURE__ */ jsx("p", { className: "text-base font-semibold text-foreground", children: user.name }),
            /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: user.email })
          ] }),
          children && /* @__PURE__ */ jsx("div", { className: "border-t border-border px-4 py-4", children }),
          links && links.length > 0 && /* @__PURE__ */ jsxs("div", { className: "border-t border-border px-4 py-4", children: [
            /* @__PURE__ */ jsx("p", { className: "mb-2 px-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground", children: "Resources" }),
            /* @__PURE__ */ jsx("div", { className: "flex flex-col gap-0.5", children: links.map((link) => /* @__PURE__ */ jsx(
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
          /* @__PURE__ */ jsx("div", { className: "mt-auto border-t border-border p-4", children: /* @__PURE__ */ jsxs(
            "button",
            {
              onClick: onSignOut,
              className: "flex w-full items-center justify-center gap-2 rounded-xl bg-secondary px-4 py-2.5 text-sm font-semibold text-foreground hover:bg-secondary/70",
              children: [
                /* @__PURE__ */ jsx(LogOut, { className: "h-4 w-4" }),
                " Sign out"
              ]
            }
          ) })
        ]
      }
    ) }),
    document.body
  );
}

export { AccountPanel };
//# sourceMappingURL=index.js.map
//# sourceMappingURL=index.js.map