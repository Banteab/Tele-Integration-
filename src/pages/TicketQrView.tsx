import { CheckCircle, Home } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import AppShell from '../components/AppShell';
import { PageContainer, ScreenCard, PrimaryButton } from '../components/ui/ScreenUI';
import { BRAND, THEME } from '../config/theme';
import type { ScannedTicket } from '../utils/ticketQrLink';

/** Standalone, read-only page a ticket's QR code opens straight to — scanning
 *  it with a camera should land on a real page in the browser, not just show
 *  plain text. Rendered from the QR's own URL params, so it works with no
 *  backend lookup and no sign-in. */
export default function TicketQrView({ ticket }: { ticket: ScannedTicket }) {
  const { t } = useTranslation();

  const goToApp = () => {
    window.location.href = window.location.pathname;
  };

  return (
    <AppShell>
      <PageContainer narrow className="pb-6 pt-10 text-center">
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
          style={{ backgroundImage: `linear-gradient(145deg, ${THEME.primarySoft}, #fdecc8)`, boxShadow: '0 10px 24px -10px rgba(242,168,28,0.5)' }}
        >
          <CheckCircle className="w-9 h-9" style={{ color: THEME.primaryPressed }} />
        </div>

        <h2 className="font-display text-lg font-bold text-[var(--text-primary)] mb-1">
          {t('ticketQrView.title')}
        </h2>
        <p className="text-sm text-[var(--text-muted)] mb-6">{BRAND.name}</p>

        <ScreenCard className="text-left space-y-3 mb-6">
          <Row label={t('ticketSuccess.reference')} value={ticket.ref} mono />
          {ticket.operator && <Row label={t('ticketSuccess.details.operator')} value={ticket.operator} />}
          {ticket.route && <Row label={t('common.route')} value={ticket.route} />}
          {ticket.seats && <Row label={t('ticketSuccess.details.seats')} value={ticket.seats} />}
        </ScreenCard>

        <p className="text-xs text-[var(--text-muted)] mb-6">{t('ticketQrView.hint')}</p>

        <div className="lg:max-w-xs lg:mx-auto">
          <PrimaryButton onClick={goToApp}>
            <Home className="w-5 h-5" />
            {t('ticketQrView.openApp')}
          </PrimaryButton>
        </div>
      </PageContainer>
    </AppShell>
  );
}

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex justify-between items-center gap-3 text-sm">
      <span className="text-[var(--text-muted)] shrink-0">{label}</span>
      <span className={`font-semibold text-[var(--text-primary)] text-right truncate ${mono ? 'tnum text-xs' : ''}`}>
        {value}
      </span>
    </div>
  );
}
