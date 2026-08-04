import { jsx, jsxs } from 'react/jsx-runtime';

// src/components/navigation/mobile-bottom-nav.tsx
var DefaultLink = ({ href, className, children, ...rest }) => /* @__PURE__ */ jsx("a", { href, className, ...rest, children });
function MobileBottomNav({
  tabs,
  centerAction,
  onOpenMore,
  moreLabel = "More",
  LinkComponent = DefaultLink,
  className = ""
}) {
  const Link = LinkComponent;
  const hasCenter = !!centerAction;
  const colCount = tabs.length + (hasCenter ? 1 : 0) + (onOpenMore ? 1 : 0);
  return /* @__PURE__ */ jsx(
    "nav",
    {
      className: `lg:hidden fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 backdrop-blur-md pb-[env(safe-area-inset-bottom)] ${className}`,
      children: /* @__PURE__ */ jsxs("div", { className: "grid items-end h-16", style: { gridTemplateColumns: `repeat(${Math.max(colCount, 1)}, minmax(0, 1fr))` }, children: [
        tabs.slice(0, Math.ceil(tabs.length / 2)).map((tab) => /* @__PURE__ */ jsx(NavTab, { tab, Link }, tab.key)),
        hasCenter && centerAction && /* @__PURE__ */ jsx("div", { className: "flex items-end justify-center", children: centerAction.href ? /* @__PURE__ */ jsx(
          Link,
          {
            href: centerAction.href,
            "aria-label": centerAction.label,
            className: "mb-2 flex h-14 w-14 -translate-y-3 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/30 active:scale-95 transition-transform",
            children: /* @__PURE__ */ jsx(centerAction.icon, { className: "h-7 w-7" })
          }
        ) : /* @__PURE__ */ jsx(
          "button",
          {
            type: "button",
            onClick: centerAction.onClick,
            "aria-label": centerAction.label,
            className: "mb-2 flex h-14 w-14 -translate-y-3 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/30 active:scale-95 transition-transform",
            children: /* @__PURE__ */ jsx(centerAction.icon, { className: "h-7 w-7" })
          }
        ) }),
        tabs.slice(Math.ceil(tabs.length / 2)).map((tab) => /* @__PURE__ */ jsx(NavTab, { tab, Link }, tab.key)),
        onOpenMore && /* @__PURE__ */ jsxs(
          "button",
          {
            type: "button",
            onClick: onOpenMore,
            className: "flex h-full flex-col items-center justify-center gap-1 text-muted-foreground active:text-foreground",
            children: [
              /* @__PURE__ */ jsx(MoreDotsIcon, { className: "h-5 w-5" }),
              /* @__PURE__ */ jsx("span", { className: "text-[10px] font-semibold leading-none", children: moreLabel })
            ]
          }
        )
      ] })
    }
  );
}
function NavTab({ tab, Link }) {
  const Icon = tab.icon;
  return /* @__PURE__ */ jsxs(
    Link,
    {
      href: tab.href,
      className: `flex h-full flex-col items-center justify-center gap-1 transition-colors ${tab.active ? "text-primary" : "text-muted-foreground active:text-foreground"}`,
      children: [
        /* @__PURE__ */ jsx(Icon, { className: "h-5 w-5" }),
        /* @__PURE__ */ jsx("span", { className: "max-w-full truncate text-[10px] font-semibold leading-none", children: tab.label })
      ]
    }
  );
}
function MoreDotsIcon({ className }) {
  return /* @__PURE__ */ jsxs("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round", className, children: [
    /* @__PURE__ */ jsx("line", { x1: "4", y1: "12", x2: "20", y2: "12" }),
    /* @__PURE__ */ jsx("line", { x1: "4", y1: "6", x2: "20", y2: "6" }),
    /* @__PURE__ */ jsx("line", { x1: "4", y1: "18", x2: "20", y2: "18" })
  ] });
}

export { MobileBottomNav };
//# sourceMappingURL=index.js.map
//# sourceMappingURL=index.js.map