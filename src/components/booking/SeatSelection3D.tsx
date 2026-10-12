import { useTranslation } from 'react-i18next';
import { Bus } from '../../types';
import { isSelectableSeat, isUnavailableSeat, type SeatData, type SeatLayout } from '../../hooks/useSeatLayout';
import { PrimaryButton } from '../ui/ScreenUI';
import { THEME } from '../../config/theme';
import SeatSelection from './SeatSelection';
import type { SceneQuality } from '../../hooks/useSceneQuality';

interface Props {
  bus: Bus;
  quality: SceneQuality;
  seatLayout: SeatLayout | null;
  loading: boolean;
  error: string | null;
  selectedSeats: string[];
  onSeatSelect: (seats: string[]) => void;
  onContinue: () => void;
  onBack: () => void;
  onSeatLayoutLoaded?: (seatLayout: Array<{ id: number; name: string; type: string; x: number; y: number }>) => void;
}

/**
 * The signature 3D cabin — chrome only. The actual seat meshes live inside
 * the persistent <Experience3D> canvas mounted by App.tsx (so the camera
 * can fly in from the hero scene without remounting the bus); this
 * component is the 2D overlay on top of it: the trip strip, the tapped-seat
 * panel, and the Continue action. When 3D is unavailable it renders nothing
 * of its own and defers entirely to the existing 2D grid <SeatSelection>.
 */
export default function SeatSelection3D({
  bus,
  quality,
  seatLayout,
  loading,
  error,
  selectedSeats,
  onSeatSelect,
  onContinue,
  onBack,
  onSeatLayoutLoaded,
}: Props) {
  const { t } = useTranslation();

  if (quality === 'off') {
    return (
      <SeatSelection
        bus={bus}
        selectedSeats={selectedSeats}
        onSeatSelect={onSeatSelect}
        onContinue={onContinue}
        onBack={onBack}
        onSeatLayoutLoaded={onSeatLayoutLoaded}
      />
    );
  }

  const total = bus.price * selectedSeats.length;
  const lastTapped = selectedSeats[selectedSeats.length - 1];
  const lastSeat: SeatData | undefined = seatLayout?.seats.find((s) => s.name === lastTapped);
  const availableCount = seatLayout?.seats.filter((s) => isSelectableSeat(s.type) && !isUnavailableSeat(s.type)).length ?? 0;

  return (
    <div className="relative" style={{ height: 'min(72vh, 620px)' }}>
      {/* The 3D cabin renders behind this overlay (Experience3D, mounted by App). */}
      <div className="pointer-events-none absolute inset-x-0 top-0 flex justify-center pt-3 px-4">
        <div className="clean-surface rounded-full px-4 py-2 shadow-sm flex items-center gap-2 text-xs font-semibold text-[var(--text-primary)]">
          <span>{bus.from} → {bus.to}</span>
          <span className="text-[var(--text-muted)] font-normal">· {bus.operator} {bus.sideNumber ? `${bus.sideNumber}` : ''}</span>
        </div>
      </div>

      {loading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="clean-surface rounded-2xl px-5 py-3 shadow-sm text-sm font-semibold text-[var(--text-muted)]">
            {t('booking.loadingSeats')}
          </div>
        </div>
      )}

      {!loading && error && (
        <div className="absolute inset-0 flex items-center justify-center px-6">
          <div className="clean-surface rounded-2xl px-5 py-4 shadow-sm text-sm text-center space-y-3 max-w-xs">
            <p className="text-red-700">{error}</p>
            <PrimaryButton onClick={onBack}>{t('seats.backToBuses')}</PrimaryButton>
          </div>
        </div>
      )}

      {!loading && !error && (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 px-4 pb-4">
          <div className="clean-surface rounded-3xl p-4 shadow-md pointer-events-auto max-w-sm mx-auto">
            {lastSeat && isSelectableSeat(lastSeat.type) ? (
              <div className="flex items-center justify-between gap-3 mb-3">
                <div>
                  <p className="font-display font-bold text-lg text-[var(--text-primary)]">
                    {t('seats.seatLabel', { defaultValue: 'Seat {{name}}', name: lastSeat.name })}
                  </p>
                  <p className="text-xs font-semibold" style={{ color: THEME.brand }}>
                    {t('booking.legend.available')}
                  </p>
                </div>
                <span className="font-display font-bold tnum" style={{ color: THEME.brand }}>
                  ETB {total}
                </span>
              </div>
            ) : (
              <p className="text-sm text-[var(--text-muted)] mb-3">
                {t('seats.tapToSelect', { defaultValue: `Tap any of the {{count}} available seats`, count: availableCount })}
              </p>
            )}
            <PrimaryButton onClick={onContinue} disabled={selectedSeats.length === 0}>
              {selectedSeats.length > 0
                ? `${t('booking.continueToDetails')} · ${selectedSeats.join(', ')}`
                : t('booking.continueToDetails')}
            </PrimaryButton>
          </div>
        </div>
      )}
    </div>
  );
}
