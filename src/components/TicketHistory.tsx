import { ArrowLeft, CreditCard, Download, Eye, Printer, TicketX, X } from 'lucide-react';
import { useState, useEffect, Fragment } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { getTicketHistory } from '../services/api';
import { API_CONFIG } from '../config/api';
import { EmptyState, PageContainer, ScreenCard, Skeleton, StatusBadge } from './ui/ScreenUI';
import TicketQrCode from './ui/TicketQrCode';
import { BRAND, THEME, type StatusKind } from '../config/theme';
import { formatDisplayDateNumeric, type DisplayLanguage } from '../utils/ethiopianCalendar';
import { buildTicketQrUrl } from '../utils/ticketQrLink';
import type { Ticket } from '../types';

interface Props {
  embedded?: boolean;
  onBack?: () => void;
  /** A pending ticket's "Pay now" was tapped — resume payment for it instead of booking a new trip. */
  onPayNow?: (ticket: Ticket) => void;
}

export default function TicketHistory({ embedded = false, onBack, onPayNow }: Props) {
  const { t, i18n } = useTranslation();
  const displayLang = (i18n.language === 'am' || i18n.language === 'om' ? i18n.language : 'en') as DisplayLanguage;
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);

  useEffect(() => {
    const token = localStorage.getItem(API_CONFIG.authTokenKey);
    if (!token) {
      setLoading(false);
      setTickets([]);
      return;
    }

    const fetchTickets = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await getTicketHistory();
        setTickets(response.data || response || []);
      } catch (err: unknown) {
        console.error('Failed to fetch ticket history:', err);
        const status = (err as { response?: { status?: number } })?.response?.status;
        if (status === 401) {
          localStorage.removeItem(API_CONFIG.authTokenKey);
          setError(null);
          setTickets([]);
        } else {
          const message = t('ticketHistory.loadError');
          setError(message);
          toast.error(message);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, [t]);

  const getStatusKind = (status: string): StatusKind => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'pending':
        return 'pending';
      case 'cancelled':
        return 'cancelled';
      default:
        return 'cancelled';
    }
  };

  const handlePrint = (ticket: Ticket) => {
    window.print();
  };

  const getStatusLabel = (status: string) => {
    const key = `ticketHistory.status${status.charAt(0).toUpperCase()}${status.slice(1)}` as
      | 'ticketHistory.statusCompleted'
      | 'ticketHistory.statusPending'
      | 'ticketHistory.statusCancelled';
    return t(key, { defaultValue: status });
  };

  // The backend doesn't always include these on a history record — only
  // ever show/encode them when it actually sent a value.
  const busNumber = (ticket: Ticket) => ticket.sideNumber || ticket.vehiclePlateNumber;
  const pickupLocation = (ticket: Ticket) => ticket.pickupLocation || ticket.originTerminalName;
  const destinationLocation = (ticket: Ticket) => ticket.destinationTerminalName;

  /** Builds a plain-text ticket summary from data already on screen — no fabricated fields, no server round-trip. */
  const ticketLines = (ticket: Ticket) =>
    [
      `${BRAND.name} — ${t('ticketHistory.title')} — ${ticket.operator}`,
      `${t('common.ref')}: ${ticket.refNumber}`,
      `${t('ticketHistory.title')} ${t('common.status')}: ${getStatusLabel(ticket.status)}`,
      ticket.route,
      busNumber(ticket) ? `${t('search.sideNumber', { number: busNumber(ticket) })}` : null,
      pickupLocation(ticket) ? `${t('ticketHistory.pickup')}: ${pickupLocation(ticket)}` : null,
      destinationLocation(ticket) ? `${t('ticketHistory.destination')}: ${destinationLocation(ticket)}` : null,
      `${t('common.date')}: ${formatDisplayDateNumeric(new Date(ticket.departureDate), displayLang)}`,
      `${t('common.time')}: ${ticket.departureTime} - ${ticket.arrivalTime}`,
      `${t('payment.seatsLabel')}: ${ticket.seats.join(', ')}`,
      `${t('common.amount')}: ETB ${ticket.totalAmount}`,
    ].filter((line): line is string => Boolean(line));

  /** A real link back into this app's own standalone ticket view (see
   *  RootApp/TicketQrView) — scanning the QR opens a browser page showing
   *  the ticket, instead of a camera app just showing raw text. Carries the
   *  same short set of fields as before (reference, operator/plate, route,
   *  seats), dropping pickup/destination/date/amount — the reference alone
   *  is enough to look the ticket up, and keeping the payload short keeps
   *  the QR's module density low enough to scan reliably off a phone
   *  screen. `ticketLines` above still covers the full download, where
   *  density doesn't matter. */
  const qrUrl = (ticket: Ticket) =>
    buildTicketQrUrl({
      ref: ticket.refNumber,
      operator: `${ticket.operator}${busNumber(ticket) ? ` (${busNumber(ticket)})` : ''}`,
      route: ticket.route,
      seats: ticket.seats.join(', '),
    });

  const handleDownload = (ticket: Ticket) => {
    const lines = ticketLines(ticket);
    const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ticket-${ticket.refNumber}.txt`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    toast.success(t('ticketHistory.downloadStarted'));
  };

  return (
    <PageContainer
      className={`space-y-4 lg:space-y-6 ${embedded ? 'app-gutter-x pb-28 lg:pb-16 lg:pt-8 -mt-2 lg:mt-0' : 'space-y-6'}`}
    >
      {!embedded && onBack && (
        <div className="flex items-center gap-4 mb-2">
          <button
            type="button"
            onClick={onBack}
            className="p-2 hover:bg-[var(--surface-muted)] rounded-full transition-colors"
            aria-label={t('desktopNav.back')}
          >
            <ArrowLeft className="w-5 h-5 text-[var(--text-secondary)]" />
          </button>
          <div>
            <h2 className="font-display text-xl font-bold text-[var(--text-primary)]">
              {t('ticketHistory.title')}
            </h2>
            <p className="text-[var(--text-muted)] text-sm">
              {t('ticketHistory.subtitle')}
            </p>
          </div>
        </div>
      )}

      {/* Desktop-only heading when reached via the tab bar — mobile already gets
          this title from the shared MobileHeader, but DesktopNav's tab links
          don't carry a page heading of their own (unlike Support/About, which
          have one built in), so this screen would otherwise show no title at all. */}
      {embedded && (
        <div className="hidden lg:block mb-2">
          <h2 className="font-display text-2xl font-bold text-[var(--text-primary)]">
            {t('ticketHistory.title')}
          </h2>
          <p className="text-[var(--text-muted)] text-sm mt-1">
            {t('ticketHistory.subtitle')}
          </p>
        </div>
      )}

      {loading && (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-3 lg:gap-4">
          {[1, 2, 3].map((i) => (
            <Fragment key={i}>
              <ScreenCard className="space-y-3">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-10 w-full" />
              </ScreenCard>
            </Fragment>
          ))}
        </div>
      )}

      {!loading && error && (
        <ScreenCard>
          <p className="text-sm text-red-700">{error}</p>
        </ScreenCard>
      )}

      {!loading && tickets.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-3 lg:gap-4">
          {tickets.map((ticket) => (
            <Fragment key={ticket.id}>
            <ScreenCard className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <h3 className="font-display font-bold text-[var(--text-primary)] text-[15px]">{ticket.operator}</h3>
                <StatusBadge status={getStatusKind(ticket.status)} label={getStatusLabel(ticket.status)} />
              </div>
              <p className="text-sm text-[var(--text-secondary)]">
                {ticket.route}
                {busNumber(ticket) && <span className="text-[var(--text-muted)]"> · {t('search.sideNumber', { number: busNumber(ticket) })}</span>}
              </p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {pickupLocation(ticket) && (
                  <div className="col-span-2">
                    <p className="text-[var(--text-muted)]">{t('ticketHistory.pickup')}</p>
                    <p className="font-semibold text-[var(--text-primary)]">{pickupLocation(ticket)}</p>
                  </div>
                )}
                <div>
                  <p className="text-[var(--text-muted)]">{t('common.ref')}</p>
                  <p className="font-semibold text-[var(--text-primary)] tnum">{ticket.refNumber}</p>
                </div>
                <div>
                  <p className="text-[var(--text-muted)]">{t('common.date')}</p>
                  <p className="font-semibold text-[var(--text-primary)]">
                    {formatDisplayDateNumeric(new Date(ticket.departureDate), displayLang)}
                  </p>
                </div>
                <div>
                  <p className="text-[var(--text-muted)]">{t('payment.seatsLabel')}</p>
                  <p className="font-semibold text-[var(--text-primary)]">{ticket.seats.join(', ')}</p>
                </div>
                <div>
                  <p className="text-[var(--text-muted)]">{t('common.amount')}</p>
                  <p className="font-semibold tnum" style={{ color: THEME.brand }}>
                    ETB {ticket.totalAmount}
                  </p>
                </div>
              </div>
              {ticket.status === 'pending' && onPayNow && (
                <button
                  type="button"
                  onClick={() => onPayNow(ticket)}
                  className="w-full py-2.5 text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5"
                  style={{ backgroundColor: THEME.brand, color: '#fff' }}
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  {t('ticketHistory.payNow')}
                </button>
              )}
              <div className="flex gap-2 pt-1 border-t border-[var(--border)]">
                <button
                  type="button"
                  onClick={() => setSelectedTicket(ticket)}
                  className="flex-1 py-2 text-xs font-semibold rounded-lg transition-colors hover:opacity-80"
                  style={{ backgroundColor: `${THEME.brand}14`, color: THEME.brand }}
                >
                  <Eye className="w-3.5 h-3.5 inline mr-1" />
                  {t('common.view')}
                </button>
                <button
                  type="button"
                  onClick={() => handlePrint(ticket)}
                  className="p-2 rounded-lg text-[var(--text-muted)] hover:bg-[var(--surface-muted)] transition-colors"
                  title={t('common.print')}
                >
                  <Printer className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDownload(ticket)}
                  className="p-2 rounded-lg text-[var(--text-muted)] hover:bg-[var(--surface-muted)] transition-colors"
                  title={t('common.download')}
                >
                  <Download className="w-4 h-4" />
                </button>
              </div>
            </ScreenCard>
            </Fragment>
          ))}
        </div>
      )}

      {!loading && !error && tickets.length === 0 && (
        <ScreenCard>
          <EmptyState
            icon={<TicketX className="w-7 h-7" style={{ color: THEME.brand }} />}
            title={t('ticketHistory.noTickets')}
            description={t('ticketHistory.bookFromHome')}
          />
        </ScreenCard>
      )}

      {selectedTicket && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedTicket(null)}
        >
          <div
            className="bg-white rounded-2xl p-6 max-w-sm sm:max-w-md w-full max-h-[90vh] overflow-y-auto"
            style={{ boxShadow: 'var(--shadow-depth-lg)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-display text-lg font-bold text-[var(--text-primary)]">{selectedTicket.operator}</h3>
                <p className="text-sm text-[var(--text-muted)]">
                  {selectedTicket.route}
                  {busNumber(selectedTicket) && ` · ${t('search.sideNumber', { number: busNumber(selectedTicket) })}`}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedTicket(null)}
                className="p-1.5 -m-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:bg-[var(--surface-muted)] transition-colors"
                aria-label={t('common.close')}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-sm">
              {(pickupLocation(selectedTicket) || destinationLocation(selectedTicket)) && (
                <div className="grid grid-cols-2 gap-3">
                  {pickupLocation(selectedTicket) && (
                    <div>
                      <p className="text-[var(--text-muted)] text-xs">{t('ticketHistory.pickup')}</p>
                      <p className="font-semibold">{pickupLocation(selectedTicket)}</p>
                    </div>
                  )}
                  {destinationLocation(selectedTicket) && (
                    <div>
                      <p className="text-[var(--text-muted)] text-xs">{t('ticketHistory.destination')}</p>
                      <p className="font-semibold">{destinationLocation(selectedTicket)}</p>
                    </div>
                  )}
                </div>
              )}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-[var(--text-muted)] text-xs">{t('common.reference')}</p>
                  <p className="font-semibold tnum">{selectedTicket.refNumber}</p>
                </div>
                <div>
                  <p className="text-[var(--text-muted)] text-xs mb-1">{t('common.status')}</p>
                  <StatusBadge status={getStatusKind(selectedTicket.status)} label={getStatusLabel(selectedTicket.status)} />
                </div>
                <div>
                  <p className="text-[var(--text-muted)] text-xs">{t('common.date')}</p>
                  <p className="font-semibold">
                    {formatDisplayDateNumeric(new Date(selectedTicket.departureDate), displayLang)}
                  </p>
                </div>
                <div>
                  <p className="text-[var(--text-muted)] text-xs">{t('common.time')}</p>
                  <p className="font-semibold">{selectedTicket.departureTime}</p>
                </div>
              </div>

              <div className="border-t border-[var(--border)] pt-3 space-y-2">
                {selectedTicket.passengers.map((passenger, idx) => (
                  <div
                    key={idx}
                    className="flex justify-between items-center p-2 bg-[var(--surface-muted)] rounded-lg text-xs"
                  >
                    <span>{passenger}</span>
                    <span className="text-[var(--text-muted)]">{t('common.seatNumber', { seat: selectedTicket.seats[idx] })}</span>
                  </div>
                ))}
              </div>

              <div className="flex justify-between items-center border-t border-[var(--border)] pt-3">
                <span className="font-bold">{t('common.total')}</span>
                <span className="font-display text-xl font-bold tnum" style={{ color: THEME.brand }}>
                  ETB {selectedTicket.totalAmount}
                </span>
              </div>

              {selectedTicket.status === 'completed' && (
                <div className="border-t border-[var(--border)] pt-3">
                  <TicketQrCode text={qrUrl(selectedTicket)} size={220} />
                </div>
              )}

              {selectedTicket.status === 'pending' && onPayNow && (
                <button
                  type="button"
                  onClick={() => onPayNow(selectedTicket)}
                  className="w-full py-2.5 text-sm font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5"
                  style={{ backgroundColor: THEME.brand, color: '#fff' }}
                >
                  <CreditCard className="w-4 h-4" />
                  {t('ticketHistory.payNow')}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </PageContainer>
  );
}
