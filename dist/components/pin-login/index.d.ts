import React__default, { ReactNode } from 'react';
import * as react_jsx_runtime from 'react/jsx-runtime';

/**
 * Shared types for the platform PIN-login shell (@bengo-hub/shared-ui-lib/pin-login).
 *
 * This package centralizes the DESIGN/LAYOUT of the staff PIN/passcode/SSO login screen used
 * before entering a tenant app (POS, Library, Inventory, ...). Each consuming app keeps its OWN
 * auth logic (API calls, session hydration, offline fallback, biometrics, etc.) — this package
 * only owns the visual shell: header, brand panel, passcode/keypad UI and layout, so every
 * service gets the same look-and-feel and every fix/polish lands once.
 */
interface PinLoginOutlet {
    id: string;
    name: string;
    /** Optional use-case tag (e.g. "retail", "pharmacy", "hospitality") — drives OutletCard theming. */
    use_case?: string | null;
    is_hq?: boolean;
}
interface DemoHint {
    pin: string;
    role: string;
    accent: string;
}
interface PinLoginBrandColor {
    bg: string;
    text: string;
    accent: string;
}
/** Icon slot used by the workflow illustration — pass a lucide-react icon component. */
type BrandIcon = React.ComponentType<{
    className?: string;
}>;
interface WorkflowStep {
    icon: BrandIcon;
    label: string;
}
interface PinLoginFooterSlotProps {
    children?: ReactNode;
}

interface PinKeypadProps {
    onDigit: (digit: string) => void;
    onBackspace: () => void;
    onClear: () => void;
    /** Switch the active on-screen keyboard to the QWERTY layout ("ABC" key). */
    onToggleQwerty?: () => void;
    disabled: boolean;
    /** True while the last digit is submitting — render a pulse on number keys. */
    isSubmitting: boolean;
    digitsLength: number;
    pinLength: number;
    /** Render the "ABC" layout-switch key. Defaults to true; pass false when both keyboards render
     *  side-by-side (large screens) so no toggle key is needed. */
    showToggle?: boolean;
}
declare function PinKeypad({ onDigit, onBackspace, onClear, onToggleQwerty, disabled, isSubmitting, digitsLength, pinLength, showToggle, }: PinKeypadProps): react_jsx_runtime.JSX.Element;
interface QwertyKeyboardProps {
    /** Append a single character (already shift-cased by the caller). */
    onKey: (char: string) => void;
    onBackspace: () => void;
    /** ENTER submits the current passcode. */
    onEnter: () => void;
    shift: boolean;
    onToggleShift: () => void;
    /** Switch the active on-screen keyboard back to the numeric PIN keypad ("?123" key). */
    onToggleNumeric?: () => void;
    disabled: boolean;
    /** Render the "?123" layout-switch key. Defaults to true; pass false when both keyboards
     *  render side-by-side (large screens). */
    showToggle?: boolean;
}
declare function QwertyKeyboard({ onKey, onBackspace, onEnter, shift, onToggleShift, onToggleNumeric, disabled, showToggle, }: QwertyKeyboardProps): react_jsx_runtime.JSX.Element;

declare const USE_CASE_LABELS: Record<string, string>;
declare const USE_CASE_COLORS: Record<string, {
    bg: string;
    text: string;
    accent: string;
    glow: string;
}>;
declare const USE_CASE_ICONS: Record<string, BrandIcon>;
declare function OutletCard({ outlet, index, onSelect, }: {
    outlet: PinLoginOutlet;
    index: number;
    onSelect: () => void;
}): react_jsx_runtime.JSX.Element;

/** Abstract "C" monogram + wordmark — theme-aware (currentColor), sized for a quiet footer lockup. */
declare function CodevertexMark({ className }: {
    className?: string;
}): react_jsx_runtime.JSX.Element;
/**
 * A row of icon "nodes" connected by arrows — a high-level, use-case-agnostic overview of the
 * common flow (e.g. Select Outlet → Enter PIN → Start Work). Each consuming app supplies its own
 * icons/labels via `steps` so the illustration reads correctly for POS/Library/Inventory/etc.
 */
declare function WorkflowIllustration({ steps }: {
    steps: WorkflowStep[];
}): react_jsx_runtime.JSX.Element;

interface PinLoginHeaderProps {
    /** "Codevertex POS" / "Codevertex Library" / "Codevertex Inventory" / etc. */
    serviceName: string;
    tenantName: string;
    outletName?: string;
    isHQ?: boolean;
    showSwitchOutlet?: boolean;
    onSwitchOutlet?: () => void;
    isOnline?: boolean;
    /** Clock / settings-gear / other app-owned controls, right-aligned. */
    rightSlot?: React__default.ReactNode;
    className?: string;
}
declare function PinLoginHeader({ serviceName, tenantName, outletName, isHQ, showSwitchOutlet, onSwitchOutlet, isOnline, rightSlot, className, }: PinLoginHeaderProps): react_jsx_runtime.JSX.Element;

interface PinLoginBrandPanelProps {
    tenantName: string;
    tenantLogoUrl?: string | null;
    workflowSteps: WorkflowStep[];
    /** Override the platform "Powered by" icon (defaults to the Codevertex icon). */
    poweredByLogoUrl?: string;
    className?: string;
}
declare function PinLoginBrandPanel({ tenantName, tenantLogoUrl, workflowSteps, poweredByLogoUrl, className, }: PinLoginBrandPanelProps): react_jsx_runtime.JSX.Element;

interface PasscodeFieldProps {
    /** Current entered value (digits and/or letters) — only its length is rendered (masked dots). */
    value: string;
    error?: boolean;
    /** One-shot shake animation on a failed attempt. */
    shake?: boolean;
    onSubmit: () => void;
    isSubmitting?: boolean;
    placeholder?: string;
    submitLabel?: string;
    submittingLabel?: string;
    className?: string;
    /**
     * Called with the field's full new value on every keystroke (physical keyboard, mobile
     * virtual keyboard, paste). Passing this renders a real `<input>` so the field actually
     * accepts keyboard input, not just on-screen keypad clicks.
     */
    onChange?: (value: string) => void;
    /** Virtual-keyboard hint for mobile: 'numeric' for a PIN, 'text' for an alphanumeric passcode. */
    inputMode?: 'numeric' | 'text';
    maxLength?: number;
    autoFocus?: boolean;
}
declare function PasscodeField({ value, error, shake, onSubmit, isSubmitting, placeholder, submitLabel, submittingLabel, className, onChange, inputMode, maxLength, autoFocus, }: PasscodeFieldProps): react_jsx_runtime.JSX.Element;

interface PinLoginSSOButtonProps {
    onClick: () => void;
    tall?: boolean;
    label?: string;
    className?: string;
}
declare function PinLoginSSOButton({ onClick, tall, label, className }: PinLoginSSOButtonProps): react_jsx_runtime.JSX.Element;

declare function DemoHints({ title, subtitle, hints }: {
    title?: string;
    subtitle?: string | null;
    hints: DemoHint[];
}): react_jsx_runtime.JSX.Element | null;

interface PinLoginLayoutProps {
    header: React__default.ReactNode;
    /** Left brand column — hidden below the `lg` breakpoint. Omit entirely for a header-only look. */
    brandPanel?: React__default.ReactNode;
    /** The actual login card content (SSO button / passcode field / keypad / scan-card slot / ...). */
    card: React__default.ReactNode;
    /** Absolutely-positioned extras that shouldn't affect flow (e.g. DemoHints). */
    footer?: React__default.ReactNode;
    /** Tenant screensaver/brand image shown heavily tinted behind the brand-dark gradient. */
    backdropUrl?: string | null;
    className?: string;
}
declare function PinLoginLayout({ header, brandPanel, card, footer, backdropUrl, className }: PinLoginLayoutProps): react_jsx_runtime.JSX.Element;

export { type BrandIcon, CodevertexMark, type DemoHint, DemoHints, OutletCard, PasscodeField, type PasscodeFieldProps, PinKeypad, type PinKeypadProps, type PinLoginBrandColor, PinLoginBrandPanel, type PinLoginBrandPanelProps, type PinLoginFooterSlotProps, PinLoginHeader, type PinLoginHeaderProps, PinLoginLayout, type PinLoginLayoutProps, type PinLoginOutlet, PinLoginSSOButton, type PinLoginSSOButtonProps, QwertyKeyboard, type QwertyKeyboardProps, USE_CASE_COLORS, USE_CASE_ICONS, USE_CASE_LABELS, WorkflowIllustration, type WorkflowStep };
