import { CheckCircle, Home } from 'lucide-react';
import { Bus, PassengerInfo } from '../../types';
import { useTranslation } from 'react-i18next';
import { ScreenCard, PrimaryButton } from '../ui/ScreenUI';
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

  return (
    <div className="pb-6 text-center">
      <div
        className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
        style={{ backgroundColor: THEME.primarySoft }}
      >
        <CheckCircle className="w-9 h-9" style={{ color: THEME.primary }} />
      </div>

      <h2 className="text-lg font-bold text-gray-900 mb-1">{t('ticketSuccess.title')}</h2>
      <p className="text-sm text-gray-500 mb-6">{t('ticketSuccess.thankYou')}</p>

      <p className="text-4xl font-extrabold tnum mb-1" style={{ color: THEME.brand }}>
        ETB {total}
      </p>
      <p className="text-xs text-gray-400 uppercase tracking-wide mb-6">
        {t('ticketSuccess.amountPaid')}
      </p>

      <ScreenCard className="text-left space-y-3 mb-6">
        <Row label={t('ticketSuccess.reference')} value={reference} mono />
        <Row label={t('ticketSuccess.details.operator')} value={bus.operator} />
        <Row label={t('ticketSuccess.details.contact')} value={passengerInfo.fullName} />
        <Row label={t('ticketSuccess.details.seats')} value={selectedSeats.join(', ')} />
      </ScreenCard>

      <PrimaryButton onClick={onHome}>
        <Home className="w-5 h-5" />
        {t('ticketSuccess.backHome')}
      </PrimaryButton>
    </div>
  );
}

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex justify-between gap-3 text-sm">
      <span className="text-gray-500 shrink-0">{label}</span>
      <span className={`font-semibold text-gray-900 text-right ${mono ? 'tnum text-xs' : ''}`}>
        {value}
      </span>
    </div>
  );
}
