import { ShieldCheck, Loader2, Smartphone, AlertTriangle, RefreshCw, ArrowLeft } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { createPaymentOrder, getTicketStatus, sanitizePaymentTitle } from '../../services/api';
import { isTelebirrH5Host, startTelebirrPay } from '../../services/telebirrPay';
import { isInsufficientBalanceError } from '../../utils/paymentErrors';
import { ScreenCard, PrimaryButton, StickyFooter, StatusBadge } from '../ui/ScreenUI';
import { THEME, type StatusKind } from '../../config/theme';
import type { Ticket } from '../../types';

interface Props {
  ticket: Ticket;
  onPaid: (reference: string) => void;
  onBack: () => void;
}

/**
 * Completes payment for a ticket that was already created in an earlier
 * session and is still sitting in 'pending' status, instead of creating a
 * new ticket. The backend rejects a new ticket for the same rider while one
 * is already pending ("Too many pending reservations") — going straight to
 * the existing reference here sidesteps that rejection entirely, since no
 * new ticket is created.
 */
export default function ResumePayment({ ticket, onPaid, onBack }: Props) {
  const { t } = useTranslation();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isWaitingForPayment, setIsWaitingForPayment] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const pollCleanup = useRef<(() => void) | null>(null);
  const inH5Host = isTelebirrH5Host();

  useEffect(() => () => pollCleanup.current?.(), []);

  const paymentStatus: StatusKind = paymentError
    ? 'failed'
    : isWaitingForPayment || isProcessing
      ? 'processing'
      : 'pending';
  const paymentStatusLabel = t(`payment.statusLabel.${paymentStatus}`);

  const startConfirmationPoll = (reference: string) => {
    pollCleanup.current?.();

    const pollInterval = setInterval(async () => {
      try {
        const ticketStatus = await getTicketStatus(reference);
        if (ticketStatus.status === 'issued') {
          clearInterval(pollInterval);
          clearTimeout(timeoutTimer);
          setIsWaitingForPayment(false);
          toast.success(t('payment.paymentSuccessful') || 'Payment successful!');
          onPaid(reference);
          return;
        }
        if (ticketStatus.status === 'cancelled') {
          clearInterval(pollInterval);
          clearTimeout(timeoutTimer);
          setIsWaitingForPayment(false);
          setPaymentError(t('payment.paymentFailed') || 'Payment cancelled or failed');
          return;
        }
      } catch (pollError) {
        console.error('Poll error', pollError);
      }
    }, 5000);

    const timeoutTimer = setTimeout(() => {
      clearInterval(pollInterval);
      setIsWaitingForPayment(false);
      setPaymentError(t('payment.paymentTimeout') || 'Payment confirmation timed out');
    }, 45 * 60 * 1000);

    pollCleanup.current = () => {
      clearInterval(pollInterval);
      clearTimeout(timeoutTimer);
    };
  };

  const handlePayment = async () => {
    if (!inH5Host) {
      toast.error(t('payment.h5Required'));
      return;
    }

    setPaymentError(null);

    try {
      setIsProcessing(true);
      setStatusMessage(t('payment.status.requestingPreorder'));

      const preorderData = await createPaymentOrder({
        amount: String(ticket.totalAmount),
        title: sanitizePaymentTitle(`Ticket Booking ${ticket.refNumber}`),
        merch_order_id: ticket.refNumber,
      });

      const rawRequest = preorderData.rawRequest || preorderData.data?.rawRequest || '';
      if (!rawRequest) {
        throw new Error('No payment rawRequest received from server');
      }
      if (!rawRequest.includes('prepay_id=')) {
        throw new Error('Invalid rawRequest: missing prepay_id (InApp H5)');
      }

      setStatusMessage(t('payment.status.openingPayment'));
      await startTelebirrPay(rawRequest);

      setStatusMessage(t('payment.status.waitingConfirmation'));
      setIsWaitingForPayment(true);
      startConfirmationPoll(ticket.refNumber);
    } catch (error) {
      console.error('Resume payment failed:', error);
      const rawMessage =
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        (error as Error)?.message ||
        '';
      const message = isInsufficientBalanceError(rawMessage) ? t('payment.insufficientBalance') : rawMessage || t('payment.failed');
      setPaymentError(message);
      setIsWaitingForPayment(false);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      {isWaitingForPayment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <ScreenCard className="max-w-sm w-full text-center space-y-4">
            <Loader2 className="w-10 h-10 animate-spin mx-auto" style={{ color: THEME.brand }} />
            <h3 className="font-display font-bold text-[var(--text-primary)]">
              {t('payment.waitingForPayment') || 'Processing payment...'}
            </h3>
            <p className="text-sm text-[var(--text-muted)]">{statusMessage}</p>
          </ScreenCard>
        </div>
      )}

      <div className="pb-28 lg:pb-10">
        <ScreenCard className="space-y-4 lg:p-8">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-1.5 text-xs font-semibold text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            {t('desktopNav.back')}
          </button>

          <StatusBadge status={paymentStatus} label={paymentStatusLabel} />

          <div className="space-y-1">
            <h3 className="font-display font-bold text-[var(--text-primary)]">{ticket.operator}</h3>
            <p className="text-sm text-[var(--text-secondary)]">{ticket.route}</p>
          </div>

          {paymentError && (
            <div
              className="p-3 rounded-xl border text-sm space-y-3"
              style={{ backgroundColor: 'var(--status-failed-bg)', borderColor: 'var(--status-failed-fg)', color: 'var(--status-failed-fg)' }}
            >
              <div className="flex items-start gap-2.5">
                <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
                <p>{paymentError}</p>
              </div>
              <PrimaryButton fullWidth={false} className="!py-2.5" onClick={handlePayment} disabled={isProcessing}>
                <RefreshCw className="w-4 h-4" />
                {t('payment.tryAgain')}
              </PrimaryButton>
            </div>
          )}

          <div
            className="flex items-start gap-3 p-3 rounded-xl text-sm border"
            style={
              inH5Host
                ? { backgroundColor: 'var(--success-bg)', borderColor: 'var(--success-border)', color: 'var(--success-fg)' }
                : { backgroundColor: 'var(--warning-bg)', borderColor: 'var(--warning-border)', color: 'var(--warning-fg)' }
            }
          >
            <Smartphone className="w-5 h-5 shrink-0" />
            <p>{inH5Host ? t('payment.telebirrReady') : t('payment.openTelebirr')}</p>
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-[var(--text-muted)]">{t('common.ref')}</span>
              <span className="font-medium tnum">{ticket.refNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--text-muted)]">{t('payment.seatsLabel')}</span>
              <span className="font-medium">{ticket.seats.join(', ')}</span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-[var(--border)]">
              <span className="font-bold">{t('common.total')}</span>
              <span className="font-display text-xl font-bold tnum" style={{ color: THEME.brand }}>
                ETB {ticket.totalAmount}
              </span>
            </div>
          </div>

          <div className="flex items-center text-xs text-[var(--text-muted)] pt-1">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              {t('payment.securePayment')}
            </span>
          </div>
        </ScreenCard>
      </div>

      <StickyFooter>
        <PrimaryButton onClick={handlePayment} disabled={isProcessing || isWaitingForPayment || !inH5Host}>
          {isProcessing ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              {statusMessage || t('payment.processing')}
            </>
          ) : (
            `${t('payment.pay')} ETB ${ticket.totalAmount}`
          )}
        </PrimaryButton>
      </StickyFooter>
    </>
  );
}
