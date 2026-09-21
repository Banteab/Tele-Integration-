export const BRAND = {
  name: 'Menahariya',
  nameAm: 'መናህሪያ',
  tagline: 'powered by telebirr',
  phone: '8000',
};

/**
 * Central color/design-token system. Mirrors the CSS custom properties in
 * index.css so inline styles (icon colors, dynamic backgrounds) stay in
 * sync with the same source of truth components use via Tailwind classes.
 *
 * Hierarchy: white/neutral surfaces dominate, light blue is the supporting
 * brand family (trust, navigation, information), yellow is reserved for
 * primary actions and key emphasis. Components should read from THEME
 * rather than hardcoding hex values.
 */
export const THEME = {
  // Yellow — primary action / energy (use sparingly)
  primary: '#f2a81c',
  primaryHover: '#d9900f',
  primaryPressed: '#b3730a',
  primarySoft: '#fef6e7',
  primaryBorder: '#fbe0a6',

  // Light blue — trust / information / navigation (supporting family)
  brand: '#189ad8',
  brandHover: '#1379bd',
  brandDeep: '#0c6ca6',
  brandLight: '#4fb2e0',
  brandSoft: '#ecf7fd',
  brandSurface: '#cbe9f7',
  brandBorder: '#cbe9f7',

  // Neutrals — white is the dominant surface
  white: '#ffffff',
  offWhite: '#f7f9fb',
  surfaceMuted: '#eef1f5',
  border: '#e5e9ef',
  borderStrong: '#d7dde5',
  surface: '#f7f9fb',
  card: '#ffffff',

  // Text
  textPrimary: '#111827',
  textSecondary: '#4b5566',
  textMuted: '#8992a3',

  shadowPrimary: '0 6px 16px rgba(242, 168, 28, 0.28)',
  shadowMd: '0 4px 12px rgba(16, 39, 71, 0.08), 0 2px 4px rgba(16, 39, 71, 0.05)',
  shadowSm: '0 1px 2px rgba(16, 39, 71, 0.06)',
};

/**
 * Shared status palette for booking/payment/ticket states so every screen
 * (search, payment, ticket history) renders the same visual language.
 * Deliberately distinct from the brand yellow so a status pill is never
 * mistaken for a call-to-action.
 */
export type StatusKind =
  | 'pending'
  | 'processing'
  | 'success'
  | 'failed'
  | 'cancelled'
  | 'expired';

export const STATUS: Record<StatusKind, { bg: string; fg: string }> = {
  pending: { bg: 'var(--status-pending-bg)', fg: 'var(--status-pending-fg)' },
  processing: { bg: 'var(--status-processing-bg)', fg: 'var(--status-processing-fg)' },
  success: { bg: 'var(--status-success-bg)', fg: 'var(--status-success-fg)' },
  failed: { bg: 'var(--status-failed-bg)', fg: 'var(--status-failed-fg)' },
  cancelled: { bg: 'var(--status-cancelled-bg)', fg: 'var(--status-cancelled-fg)' },
  expired: { bg: 'var(--status-expired-bg)', fg: 'var(--status-expired-fg)' },
};
