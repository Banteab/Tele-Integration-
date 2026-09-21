export const BRAND = {
  name: 'Menahariya',
  nameAm: 'መናህሪያ',
  tagline: 'powered by telebirr',
  phone: '8000',
};

/** Sampled from Liyu Bus App.html design tokens */
export const THEME = {
  brand: '#189ad8',
  brandDeep: '#0c6ca6',
  brandLight: '#38a8e2',
  primary: '#f2a81c',
  primaryHover: '#d68f0c',
  primarySoft: '#fef6e7',
  accent: '#1379bd',
  surface: '#f3f4f6',
  card: '#ffffff',
  shadowPrimary: '0 6px 16px rgba(242, 168, 28, 0.30)',
  shadowMd: '0 4px 12px rgba(16, 39, 71, 0.10), 0 2px 4px rgba(16, 39, 71, 0.06)',
};

/**
 * Shared status palette for booking/payment/ticket states so every screen
 * (search, payment, ticket history) renders the same visual language.
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
