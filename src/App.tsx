/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback, lazy, Suspense } from 'react';
import { Toaster, toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import AppShell from './components/AppShell';
import Hero from './components/Hero';
import MobileHeader from './components/MobileHeader';
import DesktopNav from './components/DesktopNav';
import { SearchParams, Bus, PassengerInfo, User } from './types';
import BookingSteps from './components/booking/BookingSteps';
import SearchResults from './components/booking/SearchResults';
import SeatSelection3D from './components/booking/SeatSelection3D';
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
import { useSceneQuality } from './hooks/useSceneQuality';
import { useSeatLayout, isSelectableSeat, type SeatLayout } from './hooks/useSeatLayout';
import type { CameraScene } from './three/Experience3D';

// Three.js + fiber/drei are a large, optional dependency — load them only
// once we know the device can actually render 3D, so the homepage's logo,
// headline and search form are interactive long before this arrives.
const Experience3D = lazy(() => import('./three/Experience3D'));

const STEP_TITLE_KEYS: Record<string, string> = {
  search: 'steps.search',
  seats: 'steps.seats',
  passenger: 'steps.passenger',
  payment: 'steps.payment',
  success: 'steps.success',
};

/** Fetches the real seat layout for the 3D background scene — mounted only
 *  while a bus is selected and 3D is active, so it never double-fetches
 *  when the 2D fallback (which fetches on its own) is in use. */
function SeatDataBridge({
  bus,
  onData,
}: {
  bus: Bus;
  onData: (data: { seatLayout: SeatLayout | null; loading: boolean; error: string | null }) => void;
}) {
  const data = useSeatLayout(bus);
  useEffect(() => {
    onData(data);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.seatLayout, data.loading, data.error]);
  return null;
}

export default function App() {
  const { t } = useTranslation();
  const quality = useSceneQuality();
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

  // --- 3D cinematic state --------------------------------------------------
  const [cameraScene, setCameraScene] = useState<CameraScene>('hero');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [bridgeSeatData, setBridgeSeatData] = useState<{ seatLayout: SeatLayout | null; loading: boolean; error: string | null }>({
    seatLayout: null,
    loading: true,
    error: null,
  });

  const show3DSeats = quality !== 'off' && (step === 'seats' || isTransitioning) && Boolean(selectedBus);
  const showScene = quality !== 'off' && (step === 'home' || step === 'search' || step === 'seats' || isTransitioning);

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
    setCameraScene('hero');
    setIsTransitioning(false);
    setSearchParams(null);
    setSelectedBus(null);
    setSelectedSeats([]);
    setPassengerInfo(null);
    setTicketReference('');
    setIsSearching(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  /** Ticket-success "Back home": the bus drives away before the journey resets, when 3D is on. */
  const finishJourney = () => {
    if (quality === 'off') {
      resetBooking();
      return;
    }
    setCameraScene('driveaway');
    window.setTimeout(() => {
      resetBooking();
    }, 900);
  };

  const goBack = () => {
    const flow: Record<string, () => void> = {
      search: resetBooking,
      seats: () => {
        setCameraScene('hero');
        setStep('search');
      },
      passenger: () => setStep('seats'),
      payment: () => setStep('passenger'),
      success: resetBooking,
    };
    flow[step]?.();
  };

  /** The signature moment: picking a bus animates the camera toward it and
   *  through the windshield before the seat screen ever appears. On a
   *  device without 3D this collapses to an instant step change. */
  const handleSelectBus = useCallback(
    (bus: Bus) => {
      setSelectedBus(bus);
      setSelectedSeats([]);

      if (quality === 'off') {
        setStep('seats');
        return;
      }

      setIsTransitioning(true);
      setCameraScene('approach');
      window.setTimeout(() => {
        setCameraScene('entering');
        window.setTimeout(() => {
          setStep('seats');
          setIsTransitioning(false);
        }, 650);
      }, 450);
    },
    [quality],
  );

  const toggleSeatFrom3D = useCallback(
    (seatName: string) => {
      const seat = bridgeSeatData.seatLayout?.seats.find((s) => s.name === seatName);
      if (!seat || !isSelectableSeat(seat.type)) return;
      setSelectedSeats((prev) => {
        if (prev.includes(seatName)) return prev.filter((s) => s !== seatName);
        if (prev.length >= 4) {
          toast.warning(t('booking.seatLimitMessage'));
          return prev;
        }
        return [...prev, seatName];
      });
    },
    [bridgeSeatData.seatLayout, t],
  );

  const renderBookingContent = () => {
    switch (step) {
      case 'search':
        return (
          <>
            <BookingSteps currentStep={1} />
            <SearchResults
              searchParams={searchParams!}
              onSelectBus={handleSelectBus}
              onBack={resetBooking}
              isLoading={isSearching}
            />
          </>
        );
      case 'seats':
        return (
          <>
            <BookingSteps currentStep={2} />
            <SeatSelection3D
              bus={selectedBus!}
              quality={quality}
              seatLayout={bridgeSeatData.seatLayout}
              loading={bridgeSeatData.loading}
              error={bridgeSeatData.error}
              selectedSeats={selectedSeats}
              onSeatSelect={setSelectedSeats}
              onContinue={() => setStep('passenger')}
              onBack={() => {
                setCameraScene('hero');
                setStep('search');
              }}
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
              onHome={finishJourney}
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

      {quality !== 'off' && (
        <div
          className="fixed inset-x-0 top-0 transition-[height,opacity] duration-500 ease-out"
          style={{
            zIndex: 0,
            height: step === 'home' ? '70vh' : '100vh',
            opacity: showScene ? 1 : 0,
            pointerEvents: 'none',
          }}
          aria-hidden="true"
        >
          {selectedBus && (step === 'seats' || isTransitioning) && (
            <SeatDataBridge bus={selectedBus} onData={setBridgeSeatData} />
          )}
          <Suspense fallback={null}>
            <Experience3D
              scene={cameraScene}
              quality={quality}
              seatLayout={show3DSeats ? bridgeSeatData.seatLayout : null}
              selectedSeats={selectedSeats}
              onSeatSelect={toggleSeatFrom3D}
            />
          </Suspense>
        </div>
      )}

      {isTransitioning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
          <div className="clean-surface rounded-full px-6 py-3 shadow-md">
            <p className="font-display font-bold text-[var(--text-primary)]">
              {t('booking.enteringBus', { defaultValue: 'Entering bus…' })}
            </p>
          </div>
        </div>
      )}

      <div className="relative" style={{ zIndex: 1 }}>
        {step === 'home' ? (
          <Hero
            userName={displayName}
            userPhone={displayPhone}
            onSearch={handleSearch}
            has3DBackground={quality !== 'off'}
          />
        ) : (
          <div
            className="min-h-screen lg:min-h-0 flex flex-col pb-6"
            style={{ background: quality !== 'off' && showScene ? 'transparent' : 'var(--surface-app)' }}
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
              {renderBookingContent()}
            </main>
          </div>
        )}
      </div>
    </AppShell>
  );
}
