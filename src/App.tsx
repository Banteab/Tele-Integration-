/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { Toaster } from 'sonner';
import { useTranslation } from 'react-i18next';
import AppShell from './components/AppShell';
import Hero from './components/Hero';
import MobileHeader from './components/MobileHeader';
import DesktopNav from './components/DesktopNav';
import { SearchParams, Bus, PassengerInfo, User } from './types';
import BookingSteps from './components/booking/BookingSteps';
import SearchResults from './components/booking/SearchResults';
import SeatSelection from './components/booking/SeatSelection';
import PassengerDetails from './components/booking/PassengerDetails';
import Payment from './components/booking/Payment';
import TicketSuccess from './components/booking/TicketSuccess';
import {
  buildPassengerPrefill,
  getDisplayName,
  getDisplayPhone,
  initializeAuth,
  type TelebirrProfile,
} from './services/telebirrAuth';
import { API_CONFIG } from './config/api';

const STEP_TITLE_KEYS: Record<string, string> = {
  search: 'steps.search',
  seats: 'steps.seats',
  passenger: 'steps.passenger',
  payment: 'steps.payment',
  success: 'steps.success',
};

export default function App() {
  const { t } = useTranslation();
  const [step, setStep] = useState<
    'home' | 'search' | 'seats' | 'passenger' | 'payment' | 'success'
  >('home');
  const [searchParams, setSearchParams] = useState<SearchParams | null>(null);
  const [selectedBus, setSelectedBus] = useState<Bus | null>(null);
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [passengerInfo, setPassengerInfo] = useState<PassengerInfo | null>(null);
  const [ticketReference, setTicketReference] = useState('');
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
    setIsSearching(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const goBack = () => {
    const flow: Record<string, () => void> = {
      search: resetBooking,
      seats: () => setStep('search'),
      passenger: () => setStep('seats'),
      payment: () => setStep('passenger'),
      success: resetBooking,
    };
    flow[step]?.();
  };

  const renderBookingContent = () => {
    switch (step) {
      case 'search':
        return (
          <>
            <BookingSteps currentStep={1} />
            <SearchResults
              searchParams={searchParams!}
              onSelectBus={(bus) => {
                setSelectedBus(bus);
                setStep('seats');
              }}
              onBack={resetBooking}
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
              selectedSeats={selectedSeats}
              onSubmit={(info) => {
                setPassengerInfo(info);
                setStep('payment');
              }}
              onBack={() => setStep('seats')}
              initialData={
                passengerInfo || buildPassengerPrefill(user, telebirrProfile)
              }
              routeLabel={
                searchParams
                  ? `${searchParams.from} → ${searchParams.to}`
                  : undefined
              }
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
            />
          </>
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
      {step === 'home' ? (
        <Hero
          userName={displayName}
          userPhone={displayPhone}
          onSearch={handleSearch}
        />
      ) : (
        <div className="min-h-screen lg:min-h-0 flex flex-col pb-6" style={{ background: 'var(--surface-app)' }}>
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
            {renderBookingContent()}
          </main>
        </div>
      )}
    </AppShell>
  );
}
