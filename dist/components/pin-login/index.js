import { Truck, Warehouse, BedDouble, Wine, Coffee, Scissors, Pill, ShoppingBag, Zap, UtensilsCrossed, Delete, CornerDownLeft, ArrowBigUp, Building2, ChevronRight, ArrowRight, WifiOff, Lock, ExternalLink } from 'lucide-react';
import { jsxs, jsx, Fragment } from 'react/jsx-runtime';
import React, { useRef } from 'react';

// src/components/pin-login/keyboards.tsx

// src/components/data-table/types.ts
function cx(...classes) {
  return classes.filter(Boolean).join(" ");
}
var NUMBER_ROWS = [
  ["7", "8", "9"],
  ["4", "5", "6"],
  ["1", "2", "3"]
];
var KEY_BASE = "h-12 sm:h-16 min-h-11 rounded-2xl flex items-center justify-center transition-all duration-100 touch-manipulation active:scale-95 shadow-sm disabled:opacity-40 disabled:cursor-not-allowed";
function PinKeypad({
  onDigit,
  onBackspace,
  onClear,
  onToggleQwerty,
  disabled,
  isSubmitting,
  digitsLength,
  pinLength,
  showToggle = true
}) {
  const NumberKey = (key) => /* @__PURE__ */ jsx(
    "button",
    {
      "data-testid": `pin-key-${key}`,
      type: "button",
      onClick: () => onDigit(key),
      disabled: disabled || digitsLength >= pinLength,
      className: cx(
        KEY_BASE,
        "text-primary-foreground text-2xl sm:text-3xl font-black",
        "shadow-[inset_0_1px_0_rgba(255,255,255,0.25),0_4px_14px_hsl(var(--primary)/0.35)]"
      ),
      style: { background: "linear-gradient(160deg, hsl(var(--primary)) 0%, hsl(var(--primary-dark, var(--primary))) 100%)" },
      children: isSubmitting && digitsLength === pinLength ? /* @__PURE__ */ jsx("span", { className: "h-2.5 w-2.5 rounded-full bg-white/80 animate-pulse" }) : key
    },
    key
  );
  const ClearKey = (full) => /* @__PURE__ */ jsx(
    "button",
    {
      type: "button",
      onClick: onClear,
      disabled: disabled || digitsLength === 0,
      "aria-label": "Clear",
      "data-testid": "pin-key-clear",
      className: cx(
        KEY_BASE,
        full && "w-full h-11 sm:h-12",
        "bg-destructive border border-destructive text-white text-sm font-black uppercase tracking-wider shadow-sm",
        "hover:brightness-110"
      ),
      children: "Clear"
    }
  );
  return /* @__PURE__ */ jsxs("div", { className: "flex w-full flex-col gap-2.5 sm:gap-3", children: [
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-3 gap-2.5 sm:gap-3", children: [
      NUMBER_ROWS.flat().map(NumberKey),
      showToggle ? /* @__PURE__ */ jsx(
        "button",
        {
          type: "button",
          onClick: onToggleQwerty,
          disabled,
          "aria-label": "Switch to letters keyboard",
          "data-testid": "kbd-toggle-qwerty",
          className: cx(
            KEY_BASE,
            "bg-muted border border-border text-muted-foreground text-sm font-black uppercase tracking-wider",
            "hover:bg-accent hover:text-foreground"
          ),
          children: "ABC"
        }
      ) : (
        // Large-screen 3-zone layout: Clear takes the toggle's slot (last row, same row as the
        // QWERTY keyboard's Space bar) instead of an extra full-width row below — otherwise the
        // numeric column runs one row taller than the QWERTY column and Clear ends up lower/cut
        // off relative to Space.
        ClearKey()
      ),
      NumberKey("0"),
      /* @__PURE__ */ jsx(
        "button",
        {
          type: "button",
          onClick: onBackspace,
          disabled: disabled || digitsLength === 0,
          "aria-label": "Delete",
          className: cx(
            KEY_BASE,
            "bg-muted border border-border text-muted-foreground",
            "hover:bg-accent hover:text-foreground"
          ),
          children: /* @__PURE__ */ jsx(Delete, { className: "h-6 w-6" })
        }
      )
    ] }),
    showToggle && ClearKey(true)
  ] });
}
var QWERTY_ROWS = [
  ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"],
  ["a", "s", "d", "f", "g", "h", "j", "k", "l"],
  ["z", "x", "c", "v", "b", "n", "m"]
];
function KbdKey({
  label,
  char,
  onPress,
  disabled,
  className,
  testChar,
  style
}) {
  return /* @__PURE__ */ jsx(
    "button",
    {
      type: "button",
      onClick: onPress,
      disabled,
      style,
      "data-testid": `kbd-key-${testChar ?? char}`,
      className: cx(
        "flex h-11 min-h-11 min-w-0 flex-1 items-center justify-center rounded-xl",
        "bg-card text-foreground text-sm font-semibold",
        "border border-border shadow-sm",
        "hover:bg-accent active:scale-95",
        "transition-all duration-100 touch-manipulation select-none",
        "disabled:opacity-40 disabled:cursor-not-allowed",
        className
      ),
      children: label
    }
  );
}
function QwertyKeyboard({
  onKey,
  onBackspace,
  onEnter,
  shift,
  onToggleShift,
  onToggleNumeric,
  disabled,
  showToggle = true
}) {
  const cased = (c) => shift ? c.toUpperCase() : c;
  return /* @__PURE__ */ jsxs("div", { className: "flex w-full flex-col gap-1.5 sm:gap-2", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex gap-1 sm:gap-2", children: [
      QWERTY_ROWS[0].map((c) => /* @__PURE__ */ jsx(KbdKey, { char: c, label: cased(c), disabled, onPress: () => onKey(cased(c)) }, c)),
      /* @__PURE__ */ jsx(
        KbdKey,
        {
          char: "backspace",
          label: /* @__PURE__ */ jsx(Delete, { className: "h-4 w-4" }),
          disabled,
          onPress: onBackspace,
          className: "flex-[1.4] bg-muted text-muted-foreground"
        }
      )
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "flex gap-1 sm:gap-2 px-1 sm:px-3", children: [
      QWERTY_ROWS[1].map((c) => /* @__PURE__ */ jsx(KbdKey, { char: c, label: cased(c), disabled, onPress: () => onKey(cased(c)) }, c)),
      /* @__PURE__ */ jsx(
        KbdKey,
        {
          char: "enter",
          label: /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1 text-xs font-bold", children: [
            /* @__PURE__ */ jsx(CornerDownLeft, { className: "h-3.5 w-3.5" }),
            "Enter"
          ] }),
          disabled,
          onPress: onEnter,
          className: "flex-[2] text-primary-foreground border-transparent shadow-sm hover:opacity-90",
          style: { background: "linear-gradient(160deg, hsl(var(--primary)) 0%, hsl(var(--primary-dark, var(--primary))) 100%)" }
        }
      )
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "flex gap-1 sm:gap-2", children: [
      /* @__PURE__ */ jsx(
        KbdKey,
        {
          char: "shift-l",
          label: /* @__PURE__ */ jsx(ArrowBigUp, { className: "h-4 w-4" }),
          disabled,
          onPress: onToggleShift,
          className: cx("flex-[1.6]", shift ? "bg-primary/15 text-primary border-primary/40" : "bg-muted text-muted-foreground")
        }
      ),
      QWERTY_ROWS[2].map((c) => /* @__PURE__ */ jsx(KbdKey, { char: c, label: cased(c), disabled, onPress: () => onKey(cased(c)) }, c)),
      /* @__PURE__ */ jsx(KbdKey, { char: "comma", label: ",", disabled, onPress: () => onKey(","), className: "bg-muted/60" }),
      /* @__PURE__ */ jsx(KbdKey, { char: "period", label: ".", disabled, onPress: () => onKey("."), className: "bg-muted/60" }),
      /* @__PURE__ */ jsx(
        KbdKey,
        {
          char: "shift-r",
          label: /* @__PURE__ */ jsx(ArrowBigUp, { className: "h-4 w-4" }),
          disabled,
          onPress: onToggleShift,
          className: cx("flex-[1.6]", shift ? "bg-primary/15 text-primary border-primary/40" : "bg-muted text-muted-foreground")
        }
      )
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "flex gap-1 sm:gap-2", children: [
      showToggle && /* @__PURE__ */ jsx(
        "button",
        {
          type: "button",
          onClick: onToggleNumeric,
          disabled,
          "aria-label": "Switch to numbers keyboard",
          "data-testid": "kbd-toggle-numeric",
          className: cx(
            "flex h-11 min-h-11 flex-[1.6] items-center justify-center rounded-xl",
            "bg-muted text-muted-foreground text-sm font-bold",
            "border border-border shadow-sm",
            "hover:bg-accent hover:text-foreground active:scale-95",
            "transition-all duration-100 touch-manipulation select-none",
            "disabled:opacity-40 disabled:cursor-not-allowed"
          ),
          children: "?123"
        }
      ),
      /* @__PURE__ */ jsx(
        KbdKey,
        {
          char: "space",
          label: /* @__PURE__ */ jsx("span", { className: "text-[11px] font-semibold uppercase tracking-[0.3em] text-muted-foreground", children: "Space" }),
          disabled,
          onPress: () => onKey(" "),
          className: "flex-1"
        }
      )
    ] })
  ] });
}
var USE_CASE_LABELS = {
  hospitality: "Hospitality",
  quick_service: "Quick Service",
  retail: "Retail",
  pharmacy: "Pharmacy",
  services: "Services",
  cafe: "Caf\xE9",
  bar: "Bar",
  hotel: "Hotel",
  warehouse: "Warehouse"
};
var USE_CASE_COLORS = {
  hospitality: { bg: "bg-amber-500/20", text: "text-amber-300", accent: "#f59e0b", glow: "hover:shadow-amber-500/15" },
  quick_service: { bg: "bg-blue-500/20", text: "text-blue-300", accent: "#3b82f6", glow: "hover:shadow-blue-500/15" },
  retail: { bg: "bg-violet-500/20", text: "text-violet-300", accent: "#8b5cf6", glow: "hover:shadow-violet-500/15" },
  pharmacy: { bg: "bg-emerald-500/20", text: "text-emerald-300", accent: "#10b981", glow: "hover:shadow-emerald-500/15" },
  services: { bg: "bg-teal-500/20", text: "text-teal-300", accent: "#14b8a6", glow: "hover:shadow-teal-500/15" },
  cafe: { bg: "bg-orange-500/20", text: "text-orange-300", accent: "#f97316", glow: "hover:shadow-orange-500/15" },
  bar: { bg: "bg-purple-500/20", text: "text-purple-300", accent: "#a855f7", glow: "hover:shadow-purple-500/15" },
  hotel: { bg: "bg-sky-500/20", text: "text-sky-300", accent: "#0ea5e9", glow: "hover:shadow-sky-500/15" },
  warehouse: { bg: "bg-slate-500/20", text: "text-slate-300", accent: "#94a3b8", glow: "hover:shadow-slate-500/15" },
  logistics: { bg: "bg-cyan-500/20", text: "text-cyan-300", accent: "#06b6d4", glow: "hover:shadow-cyan-500/15" }
};
var USE_CASE_ICONS = {
  hospitality: UtensilsCrossed,
  quick_service: Zap,
  retail: ShoppingBag,
  pharmacy: Pill,
  services: Scissors,
  cafe: Coffee,
  bar: Wine,
  hotel: BedDouble,
  warehouse: Warehouse,
  logistics: Truck
};
function OutletCard({
  outlet,
  index,
  onSelect
}) {
  const color = (outlet.use_case ? USE_CASE_COLORS[outlet.use_case] : null) ?? {
    text: "text-slate-300",
    accent: "#94a3b8"};
  const label = outlet.use_case ? USE_CASE_LABELS[outlet.use_case] ?? outlet.use_case : null;
  const OutletIcon = (outlet.use_case ? USE_CASE_ICONS[outlet.use_case] : void 0) ?? Building2;
  return /* @__PURE__ */ jsxs(
    "button",
    {
      type: "button",
      onClick: onSelect,
      className: cx(
        "group relative flex flex-col text-left rounded-2xl border overflow-hidden",
        "bg-card border-border",
        "hover:border-primary/40",
        "shadow-sm hover:shadow-lg",
        "active:scale-[0.97] transition-all duration-200",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
      ),
      style: { animationDelay: `${index * 55}ms` },
      children: [
        /* @__PURE__ */ jsx(
          "div",
          {
            className: "absolute top-0 inset-x-0 h-0.5 opacity-70 group-hover:opacity-100 transition-opacity",
            style: { background: `linear-gradient(90deg, transparent, ${color.accent}, transparent)` }
          }
        ),
        /* @__PURE__ */ jsxs("div", { className: "p-5 flex flex-col gap-4", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between", children: [
            /* @__PURE__ */ jsx(
              "div",
              {
                className: "h-12 w-12 rounded-xl flex items-center justify-center border transition-colors duration-200",
                style: { background: `${color.accent}14`, borderColor: `${color.accent}33` },
                children: /* @__PURE__ */ jsx(OutletIcon, { className: cx("h-5 w-5 transition-transform duration-200 group-hover:scale-110", color.text) })
              }
            ),
            /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-end gap-1.5", children: [
              outlet.is_hq && /* @__PURE__ */ jsx("span", { className: "px-2 py-0.5 rounded-full text-[9px] font-black bg-muted text-muted-foreground uppercase tracking-widest", children: "HQ" }),
              label && /* @__PURE__ */ jsx(
                "span",
                {
                  className: "px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide",
                  style: { background: `${color.accent}1a`, color: color.accent },
                  children: label
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-end justify-between gap-2", children: [
            /* @__PURE__ */ jsx("p", { className: "font-bold text-foreground text-sm sm:text-base leading-snug transition-colors", children: outlet.name }),
            /* @__PURE__ */ jsx(ChevronRight, { className: "h-4 w-4 text-muted-foreground/50 group-hover:text-muted-foreground group-hover:translate-x-0.5 transition-all shrink-0 mb-0.5" })
          ] })
        ] })
      ]
    }
  );
}
function CodevertexMark({ className }) {
  return /* @__PURE__ */ jsxs("div", { className: `flex items-center gap-2 ${className ?? ""}`, children: [
    /* @__PURE__ */ jsxs("svg", { viewBox: "0 0 32 32", className: "h-5 w-5 shrink-0", "aria-hidden": true, children: [
      /* @__PURE__ */ jsx("rect", { x: "1", y: "1", width: "30", height: "30", rx: "9", fill: "currentColor", opacity: "0.14" }),
      /* @__PURE__ */ jsx(
        "path",
        {
          d: "M22 11.5a7 7 0 1 0 0 9",
          fill: "none",
          stroke: "currentColor",
          strokeWidth: "3",
          strokeLinecap: "round"
        }
      ),
      /* @__PURE__ */ jsx("circle", { cx: "23", cy: "16", r: "1.8", fill: "currentColor" })
    ] }),
    /* @__PURE__ */ jsx("span", { className: "text-[11px] font-black uppercase tracking-[0.2em]", children: "Codevertex" })
  ] });
}
function WorkflowIllustration({ steps }) {
  return /* @__PURE__ */ jsx("div", { className: "flex items-start justify-center gap-1 sm:gap-2", children: steps.map((step, i) => {
    const Icon = step.icon;
    return /* @__PURE__ */ jsxs(React.Fragment, { children: [
      /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center gap-1.5 w-16 sm:w-20", children: [
        /* @__PURE__ */ jsx("div", { className: "h-9 w-9 sm:h-10 sm:w-10 rounded-xl bg-white/10 ring-1 ring-inset ring-white/15 flex items-center justify-center shrink-0", children: /* @__PURE__ */ jsx(Icon, { className: "h-4 w-4 sm:h-4.5 sm:w-4.5 text-white/85" }) }),
        /* @__PURE__ */ jsx("span", { className: "text-[9px] font-semibold uppercase tracking-wide text-white/55 text-center leading-tight", children: step.label })
      ] }),
      i < steps.length - 1 && /* @__PURE__ */ jsx(ArrowRight, { className: "h-3.5 w-3.5 text-white/25 shrink-0 mt-2.5" })
    ] }, i);
  }) });
}
function PinLoginHeader({
  serviceName,
  tenantName,
  outletName,
  isHQ,
  showSwitchOutlet,
  onSwitchOutlet,
  isOnline = true,
  rightSlot,
  className
}) {
  return /* @__PURE__ */ jsx("div", { className: cx("relative z-10 px-4 sm:px-8 pt-4 sm:pt-8 pb-3.5 sm:pb-5 shrink-0", className), children: /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between gap-3", children: [
    /* @__PURE__ */ jsxs("div", { className: "min-w-0", children: [
      /* @__PURE__ */ jsx("p", { className: "text-[10px] sm:text-sm font-black uppercase tracking-[0.2em] sm:tracking-[0.3em] text-white/75 truncate", children: serviceName }),
      /* @__PURE__ */ jsx("h1", { className: "mt-0.5 sm:mt-1 text-xl sm:text-3xl md:text-4xl font-black text-white uppercase tracking-tight leading-tight truncate", children: tenantName }),
      (outletName || showSwitchOutlet) && /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 flex-wrap mt-1 sm:mt-2", children: [
        outletName && /* @__PURE__ */ jsx("span", { className: "text-sm sm:text-lg font-bold text-white/90 truncate max-w-[10rem] sm:max-w-[16rem]", children: outletName }),
        isHQ && /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center gap-1 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-bold bg-white/15 text-white ring-1 ring-inset ring-white/20", children: [
          /* @__PURE__ */ jsx(Building2, { className: "h-2.5 w-2.5 sm:h-3 sm:w-3" }),
          "HQ"
        ] }),
        showSwitchOutlet && onSwitchOutlet && /* @__PURE__ */ jsxs(
          "button",
          {
            type: "button",
            onClick: onSwitchOutlet,
            className: "inline-flex items-center gap-1 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full bg-white/15 hover:bg-white/25 ring-1 ring-inset ring-white/30 text-[10px] sm:text-xs font-bold text-white transition-colors",
            children: [
              "Switch",
              /* @__PURE__ */ jsx(ChevronRight, { className: "h-3 w-3 sm:h-3.5 sm:w-3.5" })
            ]
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5 sm:gap-2 shrink-0", children: [
      !isOnline && /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-amber-400/20 ring-1 ring-inset ring-amber-200/40 text-amber-100 text-[11px] font-semibold", children: [
        /* @__PURE__ */ jsx(WifiOff, { className: "h-3 w-3" }),
        /* @__PURE__ */ jsx("span", { className: "hidden sm:inline", children: "Offline" })
      ] }),
      rightSlot
    ] })
  ] }) });
}

// src/components/branding/codevertex-icon.ts
var CODEVERTEX_ICON_DATA_URI = "data:image/png;base64,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";
var CODEVERTEX_ICON_URL = CODEVERTEX_ICON_DATA_URI;
var BRAND_ORANGE = "#E8631E";
function PoweredByBadge({
  iconUrl = CODEVERTEX_ICON_URL,
  variant = "card",
  layout = "row",
  iconClassName,
  href = "https://codevertexafrica.com",
  className,
  partner
}) {
  const stacked = layout === "stacked";
  const iconSize = iconClassName ?? (stacked ? "h-10 w-10" : "h-7 w-7");
  return /* @__PURE__ */ jsxs(
    "a",
    {
      href,
      target: "_blank",
      rel: "noopener noreferrer",
      className: cx(
        "inline-flex items-center gap-2.5 transition-shadow",
        variant === "card" && (stacked ? "rounded-3xl bg-card pl-2 pr-5 py-2 shadow-md ring-1 ring-black/5 hover:shadow-lg" : "rounded-full bg-card pl-1.5 pr-4 py-1.5 shadow-md ring-1 ring-black/5 hover:shadow-lg"),
        className
      ),
      children: [
        /* @__PURE__ */ jsx("span", { className: "shrink-0 flex items-center justify-center rounded-2xl bg-white ring-1 ring-black/5 shadow-sm p-1", children: /* @__PURE__ */ jsx("img", { src: iconUrl, alt: "Codevertex", className: cx(iconSize, "object-contain") }) }),
        stacked ? /* @__PURE__ */ jsxs("span", { className: "flex flex-col items-start leading-tight text-left uppercase", children: [
          /* @__PURE__ */ jsx("span", { className: "text-[10px] font-bold tracking-wider text-foreground", children: "Powered by" }),
          /* @__PURE__ */ jsx("span", { className: "text-sm font-extrabold tracking-wide whitespace-nowrap", style: { color: BRAND_ORANGE }, children: "Codevertex Africa Limited" }),
          partner && /* @__PURE__ */ jsxs("span", { className: "text-[9px] font-semibold tracking-wide text-muted-foreground whitespace-nowrap", children: [
            "Sold & supported by ",
            partner.name
          ] })
        ] }) : /* @__PURE__ */ jsxs("span", { className: "text-xs font-extrabold uppercase tracking-wide whitespace-nowrap", children: [
          /* @__PURE__ */ jsx("span", { className: "text-foreground", children: "Powered by" }),
          " ",
          /* @__PURE__ */ jsx("span", { style: { color: BRAND_ORANGE }, children: "Codevertex Africa Limited" }),
          partner && /* @__PURE__ */ jsxs(Fragment, { children: [
            /* @__PURE__ */ jsx("span", { className: "text-foreground/40 mx-1.5", children: "|" }),
            partner.logoUrl && /* @__PURE__ */ jsx(
              "img",
              {
                src: partner.logoUrl,
                alt: partner.name,
                className: "inline-block h-4 w-4 rounded-sm object-contain align-middle mr-1"
              }
            ),
            /* @__PURE__ */ jsxs("span", { className: "text-foreground/70 normal-case font-semibold", children: [
              "Sold & supported by ",
              partner.name
            ] })
          ] })
        ] })
      ]
    }
  );
}
function PinLoginBrandPanel({
  tenantName,
  tenantLogoUrl,
  workflowSteps,
  poweredByLogoUrl,
  className
}) {
  return /* @__PURE__ */ jsxs("div", { className: `h-full flex flex-col items-center justify-center gap-7 px-6 py-8 text-center ${className ?? ""}`, children: [
    tenantLogoUrl ? /* @__PURE__ */ jsx(
      "img",
      {
        src: tenantLogoUrl,
        alt: tenantName,
        className: "max-h-28 sm:max-h-36 max-w-[85%] object-contain rounded-2xl drop-shadow-[0_4px_24px_rgba(0,0,0,0.25)]"
      }
    ) : /* @__PURE__ */ jsx("p", { className: "text-3xl sm:text-4xl font-black text-white tracking-tight max-w-[85%]", children: tenantName }),
    /* @__PURE__ */ jsx(WorkflowIllustration, { steps: workflowSteps }),
    /* @__PURE__ */ jsx(PoweredByBadge, { iconUrl: poweredByLogoUrl, layout: "stacked", iconClassName: "h-12 w-12" })
  ] });
}
function PasscodeField({
  value,
  error,
  shake,
  onSubmit,
  isSubmitting,
  placeholder = "Enter PIN or passcode",
  submitLabel = "Login",
  submittingLabel = "Signing in\u2026",
  className,
  onChange,
  inputMode = "text",
  maxLength,
  autoFocus = true
}) {
  const inputRef = useRef(null);
  return /* @__PURE__ */ jsxs("div", { className: cx("flex items-center justify-center gap-2.5 sm:gap-3", className), children: [
    /* @__PURE__ */ jsxs(
      "div",
      {
        className: cx(
          "relative flex h-12 min-w-48 sm:min-w-64 items-center gap-3 rounded-full bg-card px-5 shadow-lg ring-1 ring-black/5 transition-all",
          error && "ring-2 ring-destructive",
          shake && "animate-shake"
        ),
        onClick: () => inputRef.current?.focus(),
        children: [
          /* @__PURE__ */ jsx(Lock, { className: cx("h-4 w-4 shrink-0", error ? "text-destructive" : "text-muted-foreground") }),
          value.length === 0 ? /* @__PURE__ */ jsx("span", { className: "text-sm font-medium text-muted-foreground", children: placeholder }) : /* @__PURE__ */ jsx("div", { className: "flex items-center gap-1.5", children: Array.from({ length: value.length }).map((_, i) => /* @__PURE__ */ jsx(
            "span",
            {
              className: cx("h-2.5 w-2.5 rounded-full", error ? "bg-destructive" : "bg-foreground")
            },
            i
          )) }),
          onChange && /* @__PURE__ */ jsx(
            "input",
            {
              ref: inputRef,
              type: inputMode === "numeric" ? "tel" : "text",
              inputMode,
              autoFocus,
              value,
              maxLength,
              disabled: isSubmitting,
              onChange: (e) => onChange(e.target.value),
              onKeyDown: (e) => {
                if (e.key === "Enter") onSubmit();
              },
              "aria-label": placeholder,
              className: "absolute inset-0 h-full w-full cursor-text rounded-full opacity-0"
            }
          )
        ]
      }
    ),
    /* @__PURE__ */ jsx(
      "button",
      {
        type: "button",
        "data-testid": "pin-login-submit",
        onClick: onSubmit,
        disabled: isSubmitting || value.length === 0,
        className: cx(
          "h-12 rounded-full px-7 text-sm font-bold text-primary-foreground shadow-lg",
          "ring-1 ring-inset ring-white/20 active:scale-95 transition-all",
          "disabled:opacity-50 disabled:cursor-not-allowed"
        ),
        style: { background: "linear-gradient(160deg, hsl(var(--primary)) 0%, hsl(var(--primary-dark, var(--primary))) 100%)" },
        children: isSubmitting ? submittingLabel : submitLabel
      }
    )
  ] });
}
function PinLoginSSOButton({ onClick, tall, label = "SSO Login", className }) {
  return /* @__PURE__ */ jsxs(
    "button",
    {
      type: "button",
      onClick,
      className: cx(
        "flex items-center justify-center rounded-2xl",
        "text-primary-foreground font-bold shadow-md ring-1 ring-inset ring-white/15",
        "active:scale-[0.98] transition-all duration-150 hover:brightness-105",
        tall ? "flex-1 flex-col gap-2 py-6" : "w-full gap-2.5 py-2.5",
        className
      ),
      style: { background: "linear-gradient(160deg, hsl(var(--primary)) 0%, hsl(var(--primary-dark, var(--primary))) 100%)" },
      children: [
        /* @__PURE__ */ jsx(
          "span",
          {
            className: cx(
              "rounded-xl bg-white/20 ring-1 ring-inset ring-white/25 flex items-center justify-center shrink-0",
              tall ? "h-10 w-10 sm:h-12 sm:w-12 rounded-2xl" : "h-7 w-7"
            ),
            children: /* @__PURE__ */ jsx(ExternalLink, { className: tall ? "h-5 w-5 sm:h-6 sm:w-6" : "h-3.5 w-3.5" })
          }
        ),
        /* @__PURE__ */ jsx("span", { className: "text-sm", children: label })
      ]
    }
  );
}
function DemoHints({ title = "Demo PINs", subtitle, hints }) {
  if (hints.length === 0) return null;
  return /* @__PURE__ */ jsx("div", { className: "absolute bottom-4 right-4 z-30 hidden sm:block", children: /* @__PURE__ */ jsxs("div", { className: "rounded-2xl border border-border bg-card/90 backdrop-blur-xl shadow-lg p-3 max-w-[220px]", children: [
    /* @__PURE__ */ jsx("p", { className: "text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-1", children: title }),
    subtitle && /* @__PURE__ */ jsx("p", { className: "text-[8px] text-muted-foreground/70 uppercase tracking-wider mb-2", children: subtitle }),
    /* @__PURE__ */ jsx("div", { className: "grid grid-cols-2 gap-1", children: hints.map(({ pin, role, accent }) => /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5 px-2 py-1 rounded-lg", style: { background: `${accent}14` }, children: [
      /* @__PURE__ */ jsx("span", { className: "font-mono text-[11px] font-black", style: { color: accent }, children: pin }),
      /* @__PURE__ */ jsx("span", { className: "text-[10px] text-muted-foreground truncate", children: role })
    ] }, pin)) })
  ] }) });
}
function PinLoginLayout({ header, brandPanel, card, footer, backdropUrl, className }) {
  return /* @__PURE__ */ jsxs(
    "div",
    {
      className: cx("relative h-dvh w-full overflow-hidden flex flex-col", className),
      style: { background: "linear-gradient(135deg, rgb(var(--brand-dark)) 0%, hsl(var(--primary)) 130%)" },
      children: [
        backdropUrl && /* @__PURE__ */ jsx("img", { src: backdropUrl, alt: "", "aria-hidden": true, className: "absolute inset-0 h-full w-full object-cover opacity-20" }),
        /* @__PURE__ */ jsx(
          "div",
          {
            className: "absolute inset-0",
            style: { background: "linear-gradient(135deg, rgb(var(--brand-dark) / 0.85) 0%, hsl(var(--primary) / 0.65) 100%)" }
          }
        ),
        /* @__PURE__ */ jsx(
          "div",
          {
            className: "pointer-events-none absolute -top-24 -right-16 h-72 w-72 rounded-full blur-3xl",
            style: { background: "hsl(var(--primary) / 0.35)" }
          }
        ),
        /* @__PURE__ */ jsx(
          "div",
          {
            className: "pointer-events-none absolute -left-20 top-1/3 h-40 w-40 rounded-full ring-1 ring-inset ring-white/10",
            style: { background: "hsl(var(--primary) / 0.12)" }
          }
        ),
        /* @__PURE__ */ jsxs("div", { className: "relative z-10 flex flex-col h-full min-h-0", children: [
          header,
          /* @__PURE__ */ jsxs("div", { className: "flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-[minmax(260px,340px)_1fr]", children: [
            brandPanel && /* @__PURE__ */ jsx("div", { className: "hidden lg:flex min-h-0 h-full", children: brandPanel }),
            /* @__PURE__ */ jsx("div", { className: "min-h-0 flex items-stretch justify-center p-2 sm:p-4 lg:p-5", children: /* @__PURE__ */ jsx("div", { className: "w-full max-w-6xl bg-card rounded-2xl sm:rounded-3xl shadow-2xl ring-1 ring-black/5 flex flex-col min-h-0 overflow-hidden", children: card }) })
          ] })
        ] }),
        footer
      ]
    }
  );
}

export { CodevertexMark, DemoHints, OutletCard, PasscodeField, PinKeypad, PinLoginBrandPanel, PinLoginHeader, PinLoginLayout, PinLoginSSOButton, QwertyKeyboard, USE_CASE_COLORS, USE_CASE_ICONS, USE_CASE_LABELS, WorkflowIllustration };
//# sourceMappingURL=index.js.map
//# sourceMappingURL=index.js.map