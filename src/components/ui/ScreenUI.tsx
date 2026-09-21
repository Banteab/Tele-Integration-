import { ReactNode } from 'react';
import { THEME, STATUS, type StatusKind } from '../../config/theme';

interface Props {
  children: ReactNode;
  className?: string;
}

export function ScreenCard({ children, className = '' }: Props) {
  return (
    <div
      className={`rounded-2xl bg-white p-4 ${className}`}
      style={{ boxShadow: 'var(--shadow-md)' }}
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

export function TripBanner({ from, to, meta }: TripBannerProps) {
  return (
    <div
      className="rounded-xl px-4 py-3 mb-4 flex items-center justify-between gap-3"
      style={{ backgroundColor: THEME.primarySoft }}
    >
      <div className="min-w-0">
        <p className="text-sm font-bold text-gray-900 truncate">
          {from} → {to}
        </p>
        {meta && <p className="text-xs text-gray-500 mt-0.5">{meta}</p>}
      </div>
      <span
        className="shrink-0 text-[10px] font-semibold uppercase tracking-wide px-2 py-1 rounded-full"
        style={{ backgroundColor: `${THEME.brand}18`, color: THEME.brand }}
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
      className={`${fullWidth ? 'w-full' : ''} flex items-center justify-center gap-2 rounded-xl py-3.5 text-[16px] font-bold text-white transition-transform active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed ${className}`}
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
      className="app-fixed-shell bottom-0 z-40 app-gutter-x py-3 pb-safe border-t border-gray-100 lg:hidden"
      style={{ backgroundColor: 'var(--surface-card)', boxShadow: '0 -4px 16px rgba(16,39,71,0.08)' }}
    >
      {children}
    </div>
  );
}

export const fieldClass =
  'w-full rounded-xl border border-gray-200 bg-white py-3.5 px-4 text-[15px] text-gray-900 outline-none transition-colors focus:border-[var(--blue-500)] focus:ring-2 focus:ring-[rgba(24,154,216,0.2)]';

export const labelClass = 'block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5';

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
      className={`${fullWidth ? 'w-full' : ''} flex items-center justify-center gap-2 rounded-xl py-3.5 text-[16px] font-bold border-2 border-gray-200 bg-white text-gray-800 transition-colors active:scale-[0.98] hover:border-gray-300 disabled:opacity-60 disabled:cursor-not-allowed ${className}`}
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
          style={{ backgroundColor: THEME.primarySoft }}
        >
          {icon}
        </div>
      )}
      <p className="font-semibold text-gray-900">{title}</p>
      {description && <p className="text-sm text-gray-500 mt-1">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

/** Skeleton block for loading states — pairs with ScreenCard. */
export function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-gray-100 ${className}`} />;
}
