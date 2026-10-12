import { ReactNode, CSSProperties } from 'react';
import { THEME, STATUS, type StatusKind } from '../../config/theme';

interface Props {
  children: ReactNode;
  className?: string;
}

/** Glass surface — frosted translucent panel with soft layered depth. */
export function ScreenCard({ children, className = '' }: Props) {
  return (
    <div
      className={`glass-surface rounded-3xl p-4 ${className}`}
      style={{ boxShadow: 'var(--shadow-depth-sm)' }}
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
      className="rounded-2xl px-4 py-3 mb-4 flex items-center justify-between gap-3"
      style={{ background: `linear-gradient(135deg, ${THEME.brandSoft}, rgba(236,247,253,0.6))`, border: '1px solid rgba(24,154,216,0.18)', boxShadow: 'var(--shadow-depth-sm)' }}
    >
      <div className="min-w-0">
        <p className="text-sm font-display font-bold text-[var(--text-primary)] truncate">
          {from} → {to}
        </p>
        {meta && <p className="text-xs text-[var(--text-muted)] mt-0.5">{meta}</p>}
      </div>
      <span
        className="shrink-0 text-eyebrow px-2.5 py-1 rounded-full bg-white/80"
        style={{ color: THEME.brandDeep, boxShadow: '0 2px 6px rgba(16,39,71,0.08)' }}
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

/** The single highest-emphasis action on a screen — gradient yellow fill with
 *  a soft glow and a shimmer sweep, lifting gently on hover. */
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
      className={`shine ${fullWidth ? 'w-full' : ''} flex items-center justify-center gap-2 rounded-2xl py-3.5 font-display text-base font-bold tracking-tight text-[#241100] transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 ${className}`}
      style={{
        backgroundImage: `linear-gradient(135deg, #f9bb3f, ${THEME.primary} 55%, ${THEME.primaryHover})`,
        boxShadow: 'var(--shadow-glow-primary)',
      }}
      onMouseEnter={(e) => { e.currentTarget.style.boxShadow = 'var(--shadow-glow-primary-hover)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.boxShadow = 'var(--shadow-glow-primary)'; }}
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
      className="app-fixed-shell bottom-0 z-40 app-gutter-x py-3 pb-safe lg:hidden"
      style={{ background: 'rgba(255,255,255,0.78)', backdropFilter: 'blur(var(--glass-blur))', WebkitBackdropFilter: 'blur(var(--glass-blur))', borderTop: '1px solid rgba(255,255,255,0.7)', boxShadow: '0 -8px 24px rgba(16,39,71,0.1)' }}
    >
      {children}
    </div>
  );
}

export const fieldClass =
  'w-full rounded-2xl border border-[var(--border-strong)] bg-white/80 py-3.5 px-4 text-[15px] text-[var(--text-primary)] outline-none transition-all placeholder:text-[var(--text-muted)] focus:border-[var(--color-brand)] focus:ring-4 focus:ring-[var(--color-brand)]/10';

export const labelClass = 'block text-[13px] font-bold text-[var(--text-secondary)] mb-1.5';

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

/** Second-priority action — glass surface, blue text, soft depth shadow,
 *  clearly subordinate to the gradient-yellow PrimaryButton. */
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
      className={`glass-surface ${fullWidth ? 'w-full' : ''} flex items-center justify-center gap-2 rounded-2xl py-3.5 font-display text-base font-bold tracking-tight transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 ${className}`}
      style={{ color: THEME.brandDeep, boxShadow: 'var(--shadow-depth-sm)' }}
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
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold ${className}`}
      style={{ backgroundColor: tone.bg, color: tone.fg, boxShadow: `0 2px 8px -2px ${tone.fg}33` }}
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
  style?: CSSProperties;
}

/** Shared empty/error placeholder so no screen ever shows a blank void. */
export function EmptyState({ icon, title, description, action, className = '', style }: EmptyStateProps) {
  return (
    <div className={`text-center py-10 px-4 ${className}`} style={style}>
      {icon && (
        <div
          className="w-14 h-14 rounded-full mx-auto mb-4 flex items-center justify-center"
          style={{ background: `linear-gradient(145deg, ${THEME.brandSoft}, #dceefb)`, boxShadow: 'var(--shadow-depth-sm)' }}
        >
          {icon}
        </div>
      )}
      <p className="font-display font-bold text-[var(--text-primary)]">{title}</p>
      {description && <p className="text-sm text-[var(--text-muted)] mt-1">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

/** Skeleton block for loading states — pairs with ScreenCard. */
export function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-[var(--surface-muted)] ${className}`} />;
}
