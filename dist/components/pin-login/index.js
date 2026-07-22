import { Truck, Warehouse, BedDouble, Wine, Coffee, Scissors, Pill, ShoppingBag, Zap, UtensilsCrossed, Delete, CornerDownLeft, ArrowBigUp, Building2, ChevronRight, ArrowRight, WifiOff, Lock, ExternalLink } from 'lucide-react';
import { jsxs, jsx } from 'react/jsx-runtime';
import React from 'react';

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
var CODEVERTEX_LOGO_URL = "https://accounts.codevertexitsolutions.com/images/logo/codevertex.png";
function PinLoginBrandPanel({
  tenantName,
  tenantLogoUrl,
  workflowSteps,
  poweredByLogoUrl = CODEVERTEX_LOGO_URL,
  className
}) {
  return /* @__PURE__ */ jsxs("div", { className: `h-full flex flex-col items-center justify-center gap-7 px-6 py-8 text-center ${className ?? ""}`, children: [
    tenantLogoUrl ? /* @__PURE__ */ jsx(
      "img",
      {
        src: tenantLogoUrl,
        alt: tenantName,
        className: "max-h-28 sm:max-h-36 max-w-[85%] object-contain drop-shadow-[0_4px_24px_rgba(0,0,0,0.25)]"
      }
    ) : /* @__PURE__ */ jsx("p", { className: "text-3xl sm:text-4xl font-black text-white tracking-tight max-w-[85%]", children: tenantName }),
    /* @__PURE__ */ jsx(WorkflowIllustration, { steps: workflowSteps }),
    /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 rounded-2xl bg-card px-4 py-3.5 shadow-lg ring-1 ring-black/5", children: [
      /* @__PURE__ */ jsx(
        "img",
        {
          src: poweredByLogoUrl,
          alt: "Codevertex Africa Limited",
          className: "h-12 w-12 rounded-lg object-contain shrink-0"
        }
      ),
      /* @__PURE__ */ jsxs("div", { className: "text-left leading-tight", children: [
        /* @__PURE__ */ jsx("p", { className: "text-[9px] font-bold uppercase tracking-widest text-muted-foreground", children: "Powered by" }),
        /* @__PURE__ */ jsx("p", { className: "text-sm font-black text-foreground whitespace-nowrap", children: "Codevertex Africa Limited" })
      ] })
    ] })
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
  className
}) {
  return /* @__PURE__ */ jsxs("div", { className: cx("flex items-center justify-center gap-2.5 sm:gap-3", className), children: [
    /* @__PURE__ */ jsxs(
      "div",
      {
        className: cx(
          "flex h-12 min-w-48 sm:min-w-64 items-center gap-3 rounded-full bg-card px-5 shadow-lg ring-1 ring-black/5 transition-all",
          error && "ring-2 ring-destructive",
          shake && "animate-shake"
        ),
        children: [
          /* @__PURE__ */ jsx(Lock, { className: cx("h-4 w-4 shrink-0", error ? "text-destructive" : "text-muted-foreground") }),
          value.length === 0 ? /* @__PURE__ */ jsx("span", { className: "text-sm font-medium text-muted-foreground", children: placeholder }) : /* @__PURE__ */ jsx("div", { className: "flex items-center gap-1.5", children: Array.from({ length: value.length }).map((_, i) => /* @__PURE__ */ jsx(
            "span",
            {
              className: cx("h-2.5 w-2.5 rounded-full", error ? "bg-destructive" : "bg-foreground")
            },
            i
          )) })
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