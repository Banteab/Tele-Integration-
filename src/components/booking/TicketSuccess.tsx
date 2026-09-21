import { CheckCircle, Home, Copy, Check } from 'lucide-react';
import { useState, type ReactNode } from 'react';
import { Bus, PassengerInfo } from '../../types';
import { useTranslation } from 'react-i18next';
import { PageContainer, ScreenCard, PrimaryButton, StatusBadge } from '../ui/ScreenUI';
import { THEME } from '../../config/theme';

interface Props {
  bus: Bus;
  selectedSeats: string[];
  passengerInfo: PassengerInfo;
  reference: string;
  onHome: () => void;
}

export default function TicketSuccess({
  bus,
  selectedSeats,
  passengerInfo,
  reference,
  onHome,
}: Props) {
  const { t } = useTranslation();
  const total = bus.price * selectedSeats.length;
  const [copied, setCopied] = useState(false);

  const copyReference = async () => {
    try {
      await navigator.clipboard.writeText(reference);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API unavailable — silently ignore, reference is still visible on screen.
    }
  };

  return (
    <PageContainer narrow className="pb-6 lg:pt-10 text-center">
      <div
        className="w-16 h-16 lg:w-20 lg:h-20 rounded-full flex items-center justify-center mx-auto mb-4"
        style={{ backgroundColor: THEME.primarySoft }}
      >
        <CheckCircle className="w-9 h-9 lg:w-11 lg:h-11" style={{ color: THEME.primaryPressed }} />
      </div>

      <h2 className="text-lg lg:text-2xl font-bold text-[var(--text-primary)] mb-1">{t('ticketSuccess.title')}</h2>
      <p className="text-sm lg:text-base text-[var(--text-muted)] mb-6">{t('ticketSuccess.thankYou')}</p>

      <p className="text-4xl lg:text-5xl font-extrabold tnum mb-1" style={{ color: THEME.brand }}>
        ETB {total}
      </p>
      <p className="text-xs text-[var(--text-muted)] uppercase tracking-wide mb-6">
        {t('ticketSuccess.amountPaid')}
      </p>

      <ScreenCard className="text-left space-y-3 mb-6 lg:p-8">
        <div className="flex items-center justify-between">
          <StatusBadge status="success" />
        </div>
        <Row
          label={t('ticketSuccess.reference')}
          value={reference}
          mono
          action={
            <button
              type="button"
              onClick={copyReference}
              className="shrink-0 p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:bg-[var(--surface-muted)] transition-colors"
              aria-label={t('ticketSuccess.copyReference')}
            >
              {copied ? (
                <Check className="w-3.5 h-3.5" style={{ color: THEME.brand }} />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
            </button>
          }
        />
        <Row label={t('ticketSuccess.details.operator')} value={bus.operator} />
        <Row label={t('ticketSuccess.details.contact')} value={passengerInfo.fullName} />
        <Row label={t('ticketSuccess.details.seats')} value={selectedSeats.join(', ')} />
      </ScreenCard>

      <div className="lg:max-w-xs lg:mx-auto">
        <PrimaryButton onClick={onHome}>
          <Home className="w-5 h-5" />
          {t('ticketSuccess.backHome')}
        </PrimaryButton>
      </div>
    </PageContainer>
  );
}

function Row({
  label,
  value,
  mono,
  action,
}: {
  label: string;
  value: string;
  mono?: boolean;
  action?: ReactNode;
}) {
  return (
    <div className="flex justify-between items-center gap-3 text-sm">
      <span className="text-[var(--text-muted)] shrink-0">{label}</span>
      <div className="flex items-center gap-1 min-w-0">
        <span className={`font-semibold text-[var(--text-primary)] text-right truncate ${mono ? 'tnum text-xs' : ''}`}>
          {value}
        </span>
        {action}
      </div>
    </div>
  );
}
