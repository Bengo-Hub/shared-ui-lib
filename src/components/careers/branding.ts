// Tenant-branding helpers for the PUBLIC careers portal. These components are standalone —
// they do NOT depend on any host app's ThemeProvider. Branding is applied via inline CSS
// variables on a wrapper element so buttons/accents pick up the tenant's primary color.
// NEVER hardcode a specific tenant's colors — fall back to a neutral, professional default.

import { useEffect, useState } from 'react';
import { createCareersApi, type PublicBranding } from './api';

// Neutral, professional default (slate/indigo) used when branding is unavailable.
const DEFAULT_PRIMARY = '#4f46e5'; // indigo-600
const DEFAULT_SECONDARY = '#0f172a'; // slate-900

const HEX = /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

function safeColor(value: string | undefined, fallback: string): string {
  return value && HEX.test(value.trim()) ? value.trim() : fallback;
}

// Expand #abc -> #aabbcc so we can compute channels uniformly.
function normalizeHex(hex: string): string {
  if (hex.length === 4) {
    return `#${hex[1]}${hex[1]}${hex[2]}${hex[2]}${hex[3]}${hex[3]}`;
  }
  return hex;
}

function channels(hex: string): [number, number, number] {
  const h = normalizeHex(hex);
  return [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
}

// Relative luminance per WCAG — used to pick a readable on-primary text color.
function luminance(hex: string): number {
  const [r, g, b] = channels(hex).map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function readableOn(hex: string): string {
  return luminance(hex) > 0.6 ? '#0f172a' : '#ffffff';
}

function rgba(hex: string, alpha: number): string {
  const [r, g, b] = channels(hex);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export interface BrandTheme {
  primary: string;
  secondary: string;
  onPrimary: string;
  /** Inline CSS variables to spread onto a wrapper element. */
  vars: React.CSSProperties;
}

export function buildTheme(branding: PublicBranding | null): BrandTheme {
  const primary = safeColor(branding?.primary_color, DEFAULT_PRIMARY);
  const secondary = safeColor(branding?.secondary_color, DEFAULT_SECONDARY);
  const onPrimary = readableOn(primary);
  return {
    primary,
    secondary,
    onPrimary,
    vars: {
      ['--brand-primary' as string]: primary,
      ['--brand-secondary' as string]: secondary,
      ['--brand-on-primary' as string]: onPrimary,
      ['--brand-primary-soft' as string]: rgba(primary, 0.1),
      ['--brand-primary-ring' as string]: rgba(primary, 0.35),
    },
  };
}

export interface BrandingState {
  branding: PublicBranding | null;
  theme: BrandTheme;
  loading: boolean;
}

// Fetches tenant branding once per (apiBaseUrl, slug) pair. Never throws — falls back to
// neutral defaults.
export function useBranding(apiBaseUrl: string, orgSlug: string): BrandingState {
  const [branding, setBranding] = useState<PublicBranding | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orgSlug || !apiBaseUrl) return;
    let active = true;
    setLoading(true);
    createCareersApi(apiBaseUrl)
      .getBranding(orgSlug)
      .then((b) => active && setBranding(b))
      .catch(() => active && setBranding(null))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [apiBaseUrl, orgSlug]);

  return { branding, theme: buildTheme(branding), loading };
}

// A presentable company name even before/without branding: turns "spot-connect-wifi" into
// "Spot Connect Wifi".
export function displayCompanyName(branding: PublicBranding | null, orgSlug: string): string {
  if (branding?.name?.trim()) return branding.name.trim();
  return orgSlug
    .split(/[-_]/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}
