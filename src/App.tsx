/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, lazy, Suspense } from 'react';
import { Toaster } from 'sonner';
import { useTranslation } from 'react-i18next';
import AppShell from './components/AppShell';
import Hero from './components/Hero';
import MobileHeader from './components/MobileHeader';
import DesktopNav from './components/DesktopNav';
import { SearchParams, Bus, PassengerInfo, User, Ticket } from './types';
import BookingSteps from './components/booking/BookingSteps';
import { LoadingScreen } from './components/ui/ScreenUI';
import {
  buildPassengerPrefill,
  getDisplayName,
  getDisplayPhone,
  initializeAuth,
  type TelebirrProfile,
} from './services/telebirrAuth';
import { API_CONFIG } from './config/api';

// Lazy-loaded: none of these are needed for the initial Home-screen paint —
// only once a search actually moves the rider past it — so keeping them out
// of the main bundle shrinks what the Home screen has to download and parse
// before it's interactive.
const SearchResults = lazy(() => import('./components/booking/SearchResults'));
const SeatSelection = lazy(() => import('./components/booking/SeatSelection'));
const PassengerDetails = lazy(() => import('./components/booking/PassengerDetails'));
const Payment = lazy(() => import('./components/booking/Payment'));
const ResumePayment = lazy(() => import('./components/booking/ResumePayment'));
const TicketSuccess = lazy(() => import('./components/booking/TicketSuccess'));

const STEP_TITLE_KEYS: Record<string, string> = {
  search: 'steps.search',
  seats: 'steps.seats',
  passenger: 'steps.passenger',
  payment: 'steps.payment',
  resumePayment: 'steps.payment',
  success: 'steps.success',
};

export default function App() {
  const { t } = useTranslation();
  const [step, setStep] = useState<
    'home' | 'search' | 'seats' | 'passenger' | 'payment' | 'resumePayment' | 'success'
  >('home');
  const [searchParams, setSearchParams] = useState<SearchParams | null>(null);
  const [selectedBus, setSelectedBus] = useState<Bus | null>(null);
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [passengerInfo, setPassengerInfo] = useState<PassengerInfo | null>(null);
  const [ticketReference, setTicketReference] = useState('');
  const [resumeTicket, setResumeTicket] = useState<Ticket | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [telebirrProfile, setTelebirrProfile] = useState<TelebirrProfile | undefined>();

  const displayName = getDisplayName(user, telebirrProfile);
  const displayPhone = getDisplayPhone(user, telebirrProfile);

  const applyAuth = (authUser: User, profile?: TelebirrProfile) => {
    setUser(authUser);
    if (profile) setTelebirrProfile(profile);
    const prefill = buildPassengerPrefill(authUser, profile);
    if (prefill) {
      setPassengerInfo((prev) => prev ?? prefill);
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      try {
        const { user: authUser, telebirrProfile: profile } =
          await initializeAuth();
        if (authUser) {
          applyAuth(authUser, profile);
        }
      } catch (error) {
        console.error('Auth initialization failed:', error);
        localStorage.removeItem(API_CONFIG.authTokenKey);
      }
    };
    initAuth();
  }, []);

  const handleSearch = (params: SearchParams) => {
    setSearchParams(params);
    setStep('search');
    setIsSearching(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(() => setIsSearching(false), 1500);
  };

  const resetBooking = () => {
    setStep('home');
    setSearchParams(null);
    setSelectedBus(null);
    setSelectedSeats([]);
    setPassengerInfo(null);
    setTicketReference('');
    setResumeTicket(null);
    setIsSearching(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  /** Returning from the results list to Home keeps the searched from/to/date
   *  intact (Hero prefills from it) instead of wiping the search entirely. */
  const backToHome = () => {
    setStep('home');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const goBack = () => {
    const flow: Record<string, () => void> = {
      search: backToHome,
      seats: () => setStep('search'),
      passenger: () => setStep('seats'),
      payment: () => setStep('passenger'),
      resumePayment: () => {
        setResumeTicket(null);
        backToHome();
      },
      success: resetBooking,
    };
    flow[step]?.();
  };

  /** "Pay now" on a pending ticket from the Tickets tab — resume payment for
   *  that existing ticket instead of starting a brand-new booking, since the
   *  backend rejects a new ticket while one is already pending. */
  const handleResumePayment = (ticket: Ticket) => {
    setResumeTicket(ticket);
    setStep('resumePayment');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  /** A seat the rider picked was taken by someone else before checkout completed —
   *  send them back to pick a different one instead of leaving them stuck on a dead payment. */
  const handleSeatConflict = () => {
    setSelectedSeats([]);
    setStep('seats');
  };

  const handleSelectBus = (bus: Bus) => {
    setSelectedBus(bus);
    setSelectedSeats([]);
    setStep('seats');
  };

  const renderBookingContent = () => {
    switch (step) {
      case 'search':
        return (
          <>
            <BookingSteps currentStep={1} />
            <SearchResults
              searchParams={searchParams!}
              onSelectBus={handleSelectBus}
              onBack={backToHome}
              isLoading={isSearching}
            />
          </>
        );
      case 'seats':
        return (
          <>
            <BookingSteps currentStep={2} />
            <SeatSelection
              bus={selectedBus!}
              selectedSeats={selectedSeats}
              onSeatSelect={setSelectedSeats}
              onContinue={() => setStep('passenger')}
              onBack={() => setStep('search')}
              onSeatLayoutLoaded={(seatLayout) => {
                setSelectedBus((prev) => (prev ? { ...prev, seatLayout } : null));
              }}
            />
          </>
        );
      case 'passenger':
        return (
          <>
            <BookingSteps currentStep={3} />
            <PassengerDetails
              bus={selectedBus!}
              selectedSeats={selectedSeats}
              onSubmit={(info) => {
                setPassengerInfo(info);
                setStep('payment');
              }}
              onBack={() => setStep('seats')}
              initialData={
                passengerInfo || buildPassengerPrefill(user, telebirrProfile)
              }
              telebirrVerified={Boolean(telebirrProfile)}
            />
          </>
        );
      case 'payment':
        return (
          <>
            <BookingSteps currentStep={4} />
            <Payment
              bus={selectedBus!}
              searchParams={searchParams!}
              selectedSeats={selectedSeats}
              passengerInfo={passengerInfo!}
              onPaid={(reference) => {
                setTicketReference(reference);
                setStep('success');
              }}
              onBack={() => setStep('passenger')}
              onAuthSuccess={applyAuth}
              onSeatConflict={handleSeatConflict}
            />
          </>
        );
      case 'resumePayment':
        return (
          <ResumePayment
            ticket={resumeTicket!}
            onPaid={() => {
              setResumeTicket(null);
              setStep('home');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onBack={() => {
              setResumeTicket(null);
              backToHome();
            }}
          />
        );
      case 'success':
        return (
          <>
            <BookingSteps currentStep={5} />
            <TicketSuccess
              bus={selectedBus!}
              selectedSeats={selectedSeats}
              passengerInfo={passengerInfo!}
              reference={ticketReference}
              onHome={resetBooking}
            />
          </>
        );
      default:
        return null;
    }
  };

  return (
    <AppShell>
      <Toaster position="top-center" richColors />

      <div className="relative" style={{ zIndex: 1 }}>
        {step === 'home' ? (
          <Hero
            userName={displayName}
            userPhone={displayPhone}
            onSearch={handleSearch}
            has3DBackground={false}
            initialSearch={searchParams ?? undefined}
            onResumePayment={handleResumePayment}
          />
        ) : (
          <div
            className="min-h-screen lg:min-h-0 flex flex-col pb-6"
            style={{ background: 'var(--surface-app)' }}
          >
            <DesktopNav
              userName={displayName}
              userPhone={displayPhone}
              flowTitle={t(STEP_TITLE_KEYS[step])}
              onBack={goBack}
              onBrandClick={resetBooking}
            />
            <MobileHeader
              showBack
              onBack={goBack}
              title={t(STEP_TITLE_KEYS[step])}
              userName={displayName}
              userPhone={displayPhone}
            />
            <main className="relative z-10 -mt-4 lg:mt-0 app-gutter-x lg:px-6 flex-1 page-container lg:pt-8 w-full">
              <Suspense fallback={<LoadingScreen />}>{renderBookingContent()}</Suspense>
            </main>
          </div>
        )}
      </div>
    </AppShell>
  );
}
