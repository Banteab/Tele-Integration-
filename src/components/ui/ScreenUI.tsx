import { ReactNode } from 'react';
import { THEME, STATUS, type StatusKind } from '../../config/theme';

interface Props {
  children: ReactNode;
  className?: string;
}

/** Clean white surface with a hairline border and a soft (not heavy) shadow. */
export function ScreenCard({ children, className = '' }: Props) {
  return (
    <div
      className={`rounded-2xl bg-white border border-[var(--border)] p-4 ${className}`}
      style={{ boxShadow: 'var(--shadow-sm)' }}
    >
      {children}
    </div>
  );
}

interface TripBannerProps {
  from: string;
  to: string;
  meta?: string;
}

/** Light-blue "you're booking this trip" context banner — supporting color, not a CTA. */
export function TripBanner({ from, to, meta }: TripBannerProps) {
  return (
    <div
      className="rounded-xl px-4 py-3 mb-4 flex items-center justify-between gap-3 border border-[var(--color-brand-border)]"
      style={{ backgroundColor: THEME.brandSoft }}
    >
      <div className="min-w-0">
        <p className="text-sm font-bold text-[var(--text-primary)] truncate">
          {from} → {to}
        </p>
        {meta && <p className="text-xs text-[var(--text-muted)] mt-0.5">{meta}</p>}
      </div>
      <span
        className="shrink-0 text-eyebrow px-2 py-1 rounded-full bg-white"
        style={{ color: THEME.brandDeep }}
      >
        Trip
      </span>
    </div>
  );
}

interface PrimaryButtonProps {
  children: ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit';
  disabled?: boolean;
  fullWidth?: boolean;
  className?: string;
  /** Native `form` attribute — submits a <form> this button sits outside of. */
  form?: string;
}

/** The single highest-emphasis action on a screen — yellow, used deliberately. */
export function PrimaryButton({
  children,
  onClick,
  type = 'button',
  disabled,
  fullWidth = true,
  className = '',
  form,
}: PrimaryButtonProps) {
  return (
    <button
      type={type}
      form={form}
      onClick={onClick}
      disabled={disabled}
      className={`${fullWidth ? 'w-full' : ''} flex items-center justify-center gap-2 rounded-xl py-3.5 text-[15px] font-bold text-[var(--text-primary)] transition-all duration-150 hover:brightness-[1.03] active:scale-[0.98] active:brightness-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 ${className}`}
      style={{
        backgroundColor: THEME.primary,
        boxShadow: THEME.shadowPrimary,
      }}
    >
      {children}
    </button>
  );
}

interface StickyFooterProps {
  children: ReactNode;
}

/**
 * Fixed bottom action bar for mobile/tablet. On desktop the same content
 * belongs in an inline sidebar instead (see two-column booking screens),
 * so this is hidden at the lg breakpoint rather than reused as-is.
 */
export function StickyFooter({ children }: StickyFooterProps) {
  return (
    <div
      className="app-fixed-shell bottom-0 z-40 app-gutter-x py-3 pb-safe border-t border-[var(--border)] lg:hidden"
      style={{ backgroundColor: 'var(--surface-card)', boxShadow: '0 -4px 16px rgba(16,39,71,0.08)' }}
    >
      {children}
    </div>
  );
}

export const fieldClass =
  'w-full rounded-xl border border-[var(--border-strong)] bg-white py-3.5 px-4 text-[15px] text-[var(--text-primary)] outline-none transition-colors placeholder:text-[var(--text-muted)] focus:border-[var(--color-brand)] focus:ring-2 focus:ring-[var(--blue-100)]';

export const labelClass = 'block text-[13px] font-semibold text-[var(--text-secondary)] mb-1.5';

/** Page-width container for the desktop/web experience (mobile ignores it). */
export function PageContainer({ children, className = '', narrow = false }: Props & { narrow?: boolean }) {
  return (
    <div className={`${narrow ? 'page-container-narrow' : 'page-container'} ${className}`}>
      {children}
    </div>
  );
}

interface SecondaryButtonProps {
  children: ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit';
  disabled?: boolean;
  fullWidth?: boolean;
  className?: string;
}

/** Second-priority action — white surface, light-blue border/text, clearly subordinate to yellow. */
export function SecondaryButton({
  children,
  onClick,
  type = 'button',
  disabled,
  fullWidth = true,
  className = '',
}: SecondaryButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${fullWidth ? 'w-full' : ''} flex items-center justify-center gap-2 rounded-xl py-3.5 text-[15px] font-bold bg-white transition-all duration-150 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      style={{ border: `1.5px solid ${THEME.brandBorder}`, color: THEME.brandDeep }}
    >
      {children}
    </button>
  );
}

/** Minimal-weight action — text only, for the least important choice on a screen. */
export function TertiaryButton({
  children,
  onClick,
  type = 'button',
  disabled,
  className = '',
}: Omit<SecondaryButtonProps, 'fullWidth'>) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center justify-center gap-1.5 text-[14px] font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-80 ${className}`}
      style={{ color: THEME.brandDeep }}
    >
      {children}
    </button>
  );
}

const STATUS_LABEL_FALLBACK: Record<StatusKind, string> = {
  pending: 'Pending',
  processing: 'Processing',
  success: 'Successful',
  failed: 'Failed',
  cancelled: 'Cancelled',
  expired: 'Expired',
};

interface StatusBadgeProps {
  status: StatusKind;
  label?: string;
  className?: string;
}

/** Consistent pill used for payment/ticket/booking status everywhere. */
export function StatusBadge({ status, label, className = '' }: StatusBadgeProps) {
  const tone = STATUS[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${className}`}
      style={{ backgroundColor: tone.bg, color: tone.fg }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: tone.fg }} />
      {label ?? STATUS_LABEL_FALLBACK[status]}
    </span>
  );
}

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

/** Shared empty/error placeholder so no screen ever shows a blank void. */
export function EmptyState({ icon, title, description, action, className = '' }: EmptyStateProps) {
  return (
    <div className={`text-center py-10 px-4 ${className}`}>
      {icon && (
        <div
          className="w-14 h-14 rounded-full mx-auto mb-4 flex items-center justify-center"
          style={{ backgroundColor: THEME.brandSoft }}
        >
          {icon}
        </div>
      )}
      <p className="font-semibold text-[var(--text-primary)]">{title}</p>
      {description && <p className="text-sm text-[var(--text-muted)] mt-1">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

/** Skeleton block for loading states — pairs with ScreenCard. */
export function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-[var(--surface-muted)] ${className}`} />;
}
