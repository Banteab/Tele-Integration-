import { ReactNode } from 'react';
import { THEME } from '../../config/theme';

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
}

export function PrimaryButton({
  children,
  onClick,
  type = 'button',
  disabled,
  fullWidth = true,
  className = '',
}: PrimaryButtonProps) {
  return (
    <button
      type={type}
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

export function StickyFooter({ children }: StickyFooterProps) {
  return (
    <div
      className="app-fixed-shell bottom-0 z-40 app-gutter-x py-3 pb-safe border-t border-gray-100"
      style={{ backgroundColor: 'var(--surface-card)', boxShadow: '0 -4px 16px rgba(16,39,71,0.08)' }}
    >
      {children}
    </div>
  );
}

export const fieldClass =
  'w-full rounded-xl border border-gray-200 bg-white py-3.5 px-4 text-[15px] text-gray-900 outline-none focus:border-[var(--blue-500)] focus:ring-2 focus:ring-[rgba(24,154,216,0.2)]';

export const labelClass = 'block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5';
