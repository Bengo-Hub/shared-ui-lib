import type { ReactNode } from 'react';

/**
 * Shared types for the platform PIN-login shell (@bengo-hub/shared-ui-lib/pin-login).
 *
 * This package centralizes the DESIGN/LAYOUT of the staff PIN/passcode/SSO login screen used
 * before entering a tenant app (POS, Library, Inventory, ...). Each consuming app keeps its OWN
 * auth logic (API calls, session hydration, offline fallback, biometrics, etc.) — this package
 * only owns the visual shell: header, brand panel, passcode/keypad UI and layout, so every
 * service gets the same look-and-feel and every fix/polish lands once.
 */

export interface PinLoginOutlet {
  id: string;
  name: string;
  /** Optional use-case tag (e.g. "retail", "pharmacy", "hospitality") — drives OutletCard theming. */
  use_case?: string | null;
  is_hq?: boolean;
}

export interface DemoHint {
  pin: string;
  role: string;
  accent: string;
}

export interface PinLoginBrandColor {
  bg: string;
  text: string;
  accent: string;
}

/** Icon slot used by the workflow illustration — pass a lucide-react icon component. */
export type BrandIcon = React.ComponentType<{ className?: string }>;

export interface WorkflowStep {
  icon: BrandIcon;
  label: string;
}

export interface PinLoginFooterSlotProps {
  children?: ReactNode;
}
