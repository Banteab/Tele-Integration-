import { ShieldCheck, Loader2, Clock, Smartphone, LogIn, UserPlus } from 'lucide-react';
import { Bus, PassengerInfo, SearchParams } from '../../types';
import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import {
  telebirrCreateTicket,
  createPaymentOrder,
  getTicketStatus,
  sanitizePaymentTitle,
} from '../../services/api';
import { buildTicketPayload } from '../../services/ticketPayload';
import { isTelebirrH5Host, startTelebirrPay } from '../../services/telebirrPay';
import { tryTelebirrAutoLogin, type TelebirrProfile } from '../../services/telebirrAuth';
import { API_CONFIG } from '../../config/api';
import type { User } from '../../types';
import {
  ScreenCard,
  TripBanner,
  PrimaryButton,
  SecondaryButton,
  StickyFooter,
  StatusBadge,
} from '../ui/ScreenUI';
import { THEME, type StatusKind } from '../../config/theme';
import AuthModal from './AuthModal';

interface Props {
  bus: Bus;
  searchParams: SearchParams;
  selectedSeats: string[];
  passengerInfo: PassengerInfo;
  onPaid: (reference: string) => void;
  onBack: () => void;
  onAuthSuccess?: (user: User, telebirrProfile?: TelebirrProfile) => void;
}

/**
 * H5 payment flow per payment_flow.txt:
 * 1. Create bus ticket (merchant backend)
 * 2. POST /payment/preorder → rawRequest (backend: fabric token + preOrder + sign)
 * 3. js_fun_start_pay via consumerapp.evaluate (user PIN in Super App)
 * 4. Poll GET /tickets/status/:reference until issued or cancelled
 * 5. Telebirr notify → backend confirms ticket (notify-only; query-order fallback disabled)
 */
export default function Payment({
  bus,
  searchParams,
  selectedSeats,
  passengerInfo,
  onPaid,
  onBack,
  onAuthSuccess,
}: Props) {
  const { t } = useTranslation();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isWaitingForPayment, setIsWaitingForPayment] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [timeRemaining, setTimeRemaining] = useState(45 * 60);
  const [isAuthenticated, setIsAuthenticated] = useState(() =>
    Boolean(localStorage.getItem(API_CONFIG.authTokenKey)),
  );
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register' | null>(
    null,
  );
  const [autoLoginChecked, setAutoLoginChecked] = useState(false);
  const pollCleanup = useRef<(() => void) | null>(null);
  const totalAmount = bus.price * selectedSeats.length;
  const inH5Host = isTelebirrH5Host();

  const paymentStatus: StatusKind =
    timeRemaining <= 0
      ? 'expired'
      : isWaitingForPayment || isProcessing
        ? 'processing'
        : 'pending';
  const paymentStatusLabel = t(`payment.statusLabel.${paymentStatus}`);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeRemaining((prev) => (prev <= 0 ? 0 : prev - 1));
    }, 1000);
    return () => {
      clearInterval(interval);
      pollCleanup.current?.();
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    const attemptAutoLogin = async () => {
      if (localStorage.getItem(API_CONFIG.authTokenKey)) {
        setIsAuthenticated(true);
        setAutoLoginChecked(true);
        return;
      }

      const authResult = await tryTelebirrAutoLogin({ forceToken: true });
      if (cancelled) return;

      if (authResult.user) {
        onAuthSuccess?.(authResult.user, authResult.telebirrProfile);
        setIsAuthenticated(true);
      }
      setAutoLoginChecked(true);
    };

    attemptAutoLogin();
    return () => {
      cancelled = true;
    };
  }, [onAuthSuccess]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const startConfirmationPoll = (reference: string) => {
    pollCleanup.current?.();

    const pollInterval = setInterval(async () => {
      try {
        const ticketStatus = await getTicketStatus(reference);
        if (ticketStatus.status === 'issued') {
          clearInterval(pollInterval);
          clearTimeout(timeoutTimer);
          setIsWaitingForPayment(false);
          toast.success(
            t('payment.paymentSuccessful') || 'Payment successful!',
          );
          onPaid(reference);
          return;
        }
        if (ticketStatus.status === 'cancelled') {
          clearInterval(pollInterval);
          clearTimeout(timeoutTimer);
          setIsWaitingForPayment(false);
          toast.error(t('payment.paymentFailed') || 'Payment cancelled or failed');
          return;
        }

        // Query-order fallback disabled — wait for Telebirr POST /payment/notify only.
        // queryAttempts += 1;
        // if (queryAttempts % 3 === 0) {
        //   const queried = await queryPaymentOrder(reference);
        //   if (queried?.status === 'issued') { ... }
        // }
      } catch (pollError) {
        console.error('Poll error', pollError);
      }
    }, 5000);

    const timeoutTimer = setTimeout(() => {
      clearInterval(pollInterval);
      setIsWaitingForPayment(false);
      toast.error(t('payment.paymentTimeout') || 'Payment confirmation timed out');
    }, 45 * 60 * 1000);

    pollCleanup.current = () => {
      clearInterval(pollInterval);
      clearTimeout(timeoutTimer);
    };
  };

  const handleManualAuthSuccess = (user: User) => {
    setIsAuthenticated(true);
    onAuthSuccess?.(user);
    setAuthModalMode(null);
    toast.success(t('payment.signedIn'));
  };

  const ensureAuthenticated = async (): Promise<boolean> => {
    if (localStorage.getItem(API_CONFIG.authTokenKey)) {
      setIsAuthenticated(true);
      return true;
    }

    const authResult = await tryTelebirrAutoLogin({ forceToken: true });
    if (authResult.user) {
      onAuthSuccess?.(authResult.user, authResult.telebirrProfile);
      setIsAuthenticated(true);
      return true;
    }

    setAuthModalMode('login');
    toast.info(t('payment.autoSignInFailed'));
    return false;
  };

  const handlePayment = async () => {
    if (timeRemaining <= 0) {
      toast.error(t('payment.sessionExpired') || 'Payment session expired');
      return;
    }

    if (!inH5Host) {
      toast.error(t('payment.h5Required'));
      return;
    }

    try {
      setIsProcessing(true);
      setStatusMessage(t('payment.status.checkingSignIn'));

      const authed = await ensureAuthenticated();
      if (!authed) {
        return;
      }

      setStatusMessage(t('payment.status.creatingTicket'));

      const paymentRefNumber = Math.random()
        .toString(36)
        .substring(2, 12)
        .toUpperCase();

      const ticketPayload = buildTicketPayload(
        bus,
        searchParams,
        passengerInfo,
        selectedSeats,
        paymentRefNumber,
      );

      const ticketResponse = await telebirrCreateTicket(ticketPayload);
      const reference = ticketResponse?.reference?.[0]?.reference;

      if (!reference) {
        throw new Error('No ticket reference from server');
      }

      setStatusMessage(t('payment.status.requestingPreorder'));
      const preorderData = await createPaymentOrder({
        amount: String(totalAmount),
        title: sanitizePaymentTitle(`Ticket Booking ${reference}`),
        merch_order_id: reference,
      });

      const rawRequest =
        preorderData.rawRequest || preorderData.data?.rawRequest || '';

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
      startConfirmationPoll(reference);
    } catch (error) {
      console.error('Payment failed:', error);
      const message =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message ||
        (error as Error)?.message ||
        t('payment.failed');
      toast.error(message);
      setIsWaitingForPayment(false);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      {authModalMode && (
        <AuthModal
          mode={authModalMode}
          initialPhone={passengerInfo.phone}
          onClose={() => setAuthModalMode(null)}
          onSuccess={handleManualAuthSuccess}
          onSwitchMode={setAuthModalMode}
        />
      )}

      {isWaitingForPayment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <ScreenCard className="max-w-sm w-full text-center space-y-4">
            <Loader2 className="w-10 h-10 animate-spin mx-auto" style={{ color: THEME.brand }} />
            <h3 className="font-bold text-[var(--text-primary)]">
              {t('payment.waitingForPayment') || 'Processing payment...'}
            </h3>
            <p className="text-sm text-[var(--text-muted)]">{statusMessage}</p>
          </ScreenCard>
        </div>
      )}

      <div className="pb-28 lg:pb-10">
        <TripBanner
          from={searchParams.from}
          to={searchParams.to}
          meta={`${bus.operator} · ${selectedSeats.join(', ')}`}
        />

        <div className="lg:grid lg:grid-cols-[1fr_320px] lg:gap-6 lg:items-start">
        <ScreenCard className="space-y-4 mb-3 lg:mb-0 lg:p-8">
          <StatusBadge status={paymentStatus} label={paymentStatusLabel} />

          {autoLoginChecked && !isAuthenticated && (
            <div
              className="p-3 rounded-xl border text-sm space-y-3"
              style={{ backgroundColor: 'var(--warning-bg)', borderColor: 'var(--warning-border)', color: 'var(--warning-fg)' }}
            >
              <p>{t('payment.authPrompt')}</p>
              <div className="flex gap-2">
                <PrimaryButton fullWidth={false} className="flex-1 !py-2.5" onClick={() => setAuthModalMode('login')}>
                  <LogIn className="w-4 h-4" />
                  {t('auth.login')}
                </PrimaryButton>
                <SecondaryButton fullWidth={false} className="flex-1 !py-2.5" onClick={() => setAuthModalMode('register')}>
                  <UserPlus className="w-4 h-4" />
                  {t('auth.register')}
                </SecondaryButton>
              </div>
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
            <p>
              {inH5Host ? t('payment.telebirrReady') : t('payment.openTelebirr')}
            </p>
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-[var(--text-muted)]">{t('payment.passengerLabel')}</span>
              <span className="font-medium">{passengerInfo.fullName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--text-muted)]">{t('payment.seatsLabel')}</span>
              <span className="font-medium">{selectedSeats.join(', ')}</span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-[var(--border)]">
              <span className="font-bold">{t('common.total')}</span>
              <span className="text-xl font-extrabold tnum" style={{ color: THEME.brand }}>
                ETB {totalAmount}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-[var(--text-muted)] pt-1">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              {t('payment.securePayment')}
            </span>
            <span className="flex items-center gap-1 font-semibold tnum">
              <Clock className="w-3.5 h-3.5" />
              {formatTime(timeRemaining)}
            </span>
          </div>
        </ScreenCard>

        {/* Desktop: sticky pay sidebar instead of a bottom bar */}
        <div className="hidden lg:block lg:sticky lg:top-24">
          <ScreenCard className="space-y-4">
            <div>
              <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide mb-1">{t('common.total')}</p>
              <p className="text-2xl font-extrabold tnum text-[var(--text-primary)]">ETB {totalAmount}</p>
            </div>
            <PrimaryButton
              onClick={handlePayment}
              disabled={isProcessing || isWaitingForPayment || timeRemaining <= 0 || !inH5Host}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  {statusMessage || t('payment.processing')}
                </>
              ) : (
                `${t('payment.pay')} ETB ${totalAmount}`
              )}
            </PrimaryButton>
          </ScreenCard>
        </div>
        </div>
      </div>

      <StickyFooter>
        <PrimaryButton
          onClick={handlePayment}
          disabled={isProcessing || isWaitingForPayment || timeRemaining <= 0 || !inH5Host}
        >
          {isProcessing ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              {statusMessage || t('payment.processing')}
            </>
          ) : (
            `${t('payment.pay')} ETB ${totalAmount}`
          )}
        </PrimaryButton>
      </StickyFooter>
    </>
  );
}
